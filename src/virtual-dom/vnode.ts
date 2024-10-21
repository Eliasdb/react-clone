// src/virtual-dom/vnode.ts

import { RenderableVNode } from './template';

export type ComponentFunction = (props?: any) => VNode | RenderableVNode;

export type Child =
  | RenderableVNode
  | Node
  | string
  | number
  | boolean
  | ComponentFunction;

export interface VNode {
  type: string;
  props: Record<string, any>;
  children: Child[];
}

export function createVNode(
  type: string,
  props: Record<string, any> = {},
  children: Child[] = [],
): VNode {
  return {
    type,
    props,
    children,
  };
}

export function isVNode(value: any): value is VNode {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.props === 'object' &&
    value.props !== null &&
    Array.isArray(value.children)
  );
}

export function vNodeToDOM(vNode: VNode): Node {
  // If the VNode is a text node, return a Text Node
  if (typeof vNode === 'string') {
    return document.createTextNode(vNode);
  }

  // Create an element based on the VNode type (e.g., 'div', 'span')
  const element = document.createElement(vNode.type);

  // Set attributes and event listeners from props
  if (vNode.props) {
    Object.entries(vNode.props).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        // Handle event listeners (e.g., onClick, onMouseOver)
        const eventType = key.slice(2).toLowerCase();
        element.addEventListener(eventType, value);
      } else if (key === 'style' && typeof value === 'object') {
        // Apply styles if props.style is an object
        Object.assign(element.style, value);
      } else {
        // Set regular attributes
        element.setAttribute(key, value);
      }
    });
  }

  // Recursively append children
  if (vNode.children) {
    vNode.children.forEach((child) => {
      element.appendChild(vNodeToDOM(child as VNode));
    });
  }

  return element;
}
