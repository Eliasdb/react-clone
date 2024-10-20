// src/virtual-dom/template.ts

import { Child, VNode, createVNode, isVNode } from './vnode';
import { isTextNode } from './utils';

interface FragmentVNode extends VNode {
  type: 'fragment';
  children: VNode[];
}

export type RenderableVNode = VNode | FragmentVNode;

export function template(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderableVNode {
  const combinedString = combineStringsAndValues(strings, values);
  const container = createContainerFromHTML(combinedString);
  const result: VNode[] = [];

  processChildNodes(container.childNodes, result, values);

  return result.length === 1 ? result[0] : createFragmentVNode(result);
}

function createFragmentVNode(children: VNode[]): FragmentVNode {
  return {
    type: 'fragment',
    props: {},
    children,
  };
}

// Combine strings and values with placeholders
function combineStringsAndValues(
  strings: TemplateStringsArray,
  values: any[],
): string {
  return strings.reduce(
    (acc, str, i) =>
      acc + str + (i < values.length ? `__PLACEHOLDER__${i}__` : ''),
    '',
  );
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
  children: Child[],
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
    if (index % 2 === 0 && part !== '') {
      // Add regular text directly
      children.push(part);
    } else if (index % 2 === 1) {
      const value = values[parseInt(part, 10)];
      if (typeof value === 'function') {
        children.push(value);
      } else if (isVNode(value)) {
        children.push(value);
      } else if (
        isTextNode(value) ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        children.push(String(value));
      }
    }
  });
}

function processElementNode(
  element: HTMLElement,
  children: Child[],
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

    let finalValue = '';
    let eventHandler: Function | undefined;
    let hasDynamicValue = false;

    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        finalValue += part;
      } else {
        hasDynamicValue = true;
        const placeholderValue = values[parseInt(part, 10)];

        if (typeof placeholderValue === 'function' && name.startsWith('on')) {
          eventHandler = placeholderValue;
        } else if (
          isTextNode(placeholderValue) ||
          typeof placeholderValue === 'string' ||
          typeof placeholderValue === 'number' ||
          typeof placeholderValue === 'boolean'
        ) {
          finalValue += String(placeholderValue);
        }
      }
    });

    if (eventHandler) {
      // Add event handler directly to props
      vNode.props[name] = eventHandler;
    } else if (hasDynamicValue) {
      // Only override the attribute if it contains a placeholder
      vNode.props[name] = finalValue;
    } else {
      // Otherwise, keep the static attribute value as is
      vNode.props[name] = value;
    }
  });
}

// Utility function to split strings by placeholders
function splitByPlaceholders(text: string): string[] {
  const placeholderRegex = /__PLACEHOLDER__(\d+)__/g;
  return text.split(placeholderRegex);
}
