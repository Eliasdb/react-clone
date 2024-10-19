// src/virtual-dom/template.ts

import { Child, VNode, createVNode, isVNode } from './vnode';
import { isTextNode } from './utils';

export function template(
  strings: TemplateStringsArray,
  ...values: any[]
): VNode {
  const combinedString = combineStringsAndValues(strings, values);
  const container = createContainerFromHTML(combinedString);
  const result: VNode[] = [];

  processChildNodes(container.childNodes, result, values);

  return result.length === 1 ? result[0] : createVNode('div', {}, result);
}

// Combine strings and values with placeholders
function combineStringsAndValues(
  strings: TemplateStringsArray,
  values: any[],
): string {
  return strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `__PLACEHOLDER__${i}__` : '');
  }, '');
}

// Create a temporary container from an HTML string
function createContainerFromHTML(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

// Process child nodes and populate the VNode tree
function processChildNodes(
  childNodes: NodeListOf<ChildNode>,
  children: any[],
  values: any[],
): void {
  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node as Text, children, values);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      processElementNode(node as HTMLElement, children, values);
    }
  });
}

function processTextNode(node: Text, children: Child[], values: any[]): void {
  const textContent = node.textContent || '';
  const parts = splitByPlaceholders(textContent);

  parts.forEach((part, index) => {
    if (index % 2 === 0) {
      // Regular text
      if (part !== '') {
        // Check if part is not empty
        children.push(part); // Push without trimming
      }
    } else {
      // Placeholder value
      const value = values[parseInt(part, 10)];
      if (typeof value === 'function') {
        // Treat as a separate component
        children.push(value); // Pass the component function directly
      } else if (isVNode(value)) {
        children.push(value);
      } else if (isTextNode(value)) {
        children.push(String(value));
      }
    }
  });
}

function processElementNode(
  element: HTMLElement,
  children: any[],
  values: any[],
): void {
  const vNode = createVNode(element.tagName.toLowerCase());
  addElementAttributes(element, vNode, values);

  processChildNodes(element.childNodes, vNode.children, values);
  children.push(vNode);
}

function addElementAttributes(
  element: HTMLElement,
  vNode: VNode,
  values: any[],
): void {
  Array.from(element.attributes).forEach((attr) => {
    const { name, value } = attr;
    const parts = splitByPlaceholders(value);

    let hasPlaceholder = false;
    let newValue = '';
    let eventHandler: Function | undefined;

    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        newValue += part;
      } else {
        hasPlaceholder = true;
        const placeholderValue = values[parseInt(part, 10)];

        if (typeof placeholderValue === 'function' && name.startsWith('on')) {
          eventHandler = placeholderValue;
        } else if (isTextNode(placeholderValue)) {
          newValue += String(placeholderValue);
        }
      }
    });

    if (eventHandler) {
      vNode.props[name] = eventHandler;
    } else if (hasPlaceholder) {
      vNode.props[name] = newValue;
    } else {
      vNode.props[name] = value;
    }
  });
}

// Utility function to split strings by placeholders
function splitByPlaceholders(text: string): string[] {
  const placeholderRegex = /__PLACEHOLDER__(\d+)__/g;
  return text.split(placeholderRegex);
}
