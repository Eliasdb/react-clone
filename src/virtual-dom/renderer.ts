// src/virtual-dom/renderer.ts

import { VNode, isVNode, ComponentFunction, Child } from './vnode';
import { isTextNode } from './utils';
import { resetHooks } from './hooks';

export function render(
  vnode: VNode | ComponentFunction | string | number | boolean,
  container: HTMLElement,
): void {
  if (typeof vnode === 'function') {
    renderComponent(vnode, container);
  } else if (isVNode(vnode)) {
    renderVNode(vnode, container);
  } else if (isTextNode(vnode)) {
    renderTextNode(vnode, container);
  }
}

function renderComponent(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any = {},
): void {
  resetHooks();

  const vnode = componentFunc(props);

  if (container.firstChild) {
    container.innerHTML = '';
  }

  render(vnode, container);
}

function renderVNode(vnode: VNode, container: HTMLElement): void {
  const domElement = document.createElement(vnode.type);
  applyProps(domElement, vnode.props);

  vnode.children.forEach((child) => {
    if (typeof child === 'function') {
      renderComponent(child, domElement);
    } else if (isVNode(child)) {
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
    } else {
      domElement.setAttribute(key, String(value));
    }
  });
}

function renderTextNode(
  value: string | number | boolean,
  container: HTMLElement,
): void {
  container.appendChild(document.createTextNode(String(value)));
}
