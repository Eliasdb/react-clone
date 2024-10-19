// src/virtual-dom/renderer.ts

import { VNode, isVNode } from './vnode';
import { isTextNode, isValidHtmlAttribute } from './utils';

export function render(
  vnodes: VNode | VNode[] | string | number | boolean,
  container: HTMLElement,
): void {
  if (isTextNode(vnodes)) {
    renderTextNode(vnodes, container);
  } else if (Array.isArray(vnodes)) {
    vnodes.forEach((vnode) => renderVNode(vnode, container));
  } else if (isVNode(vnodes)) {
    renderVNode(vnodes, container);
  }
}

function renderVNode(vnode: VNode, container: HTMLElement): void {
  const domElement = document.createElement(vnode.type);
  applyProps(domElement, vnode.props);

  vnode.children.forEach((child) => {
    if (isVNode(child)) {
      renderVNode(child, domElement);
    } else if (isTextNode(child)) {
      renderTextNode(child, domElement);
    }
  });

  container.appendChild(domElement);
}

function applyProps(domElement: HTMLElement, props: Record<string, any>): void {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.substring(2).toLowerCase();
      domElement.addEventListener(eventType, value);
    } else if (isValidHtmlAttribute(key)) {
      domElement.setAttribute(key, value);
    }
  });
}

function renderTextNode(
  value: string | number | boolean,
  container: HTMLElement,
): void {
  container.appendChild(document.createTextNode(String(value)));
}
