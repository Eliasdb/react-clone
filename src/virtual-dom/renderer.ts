// src/virtual-dom/renderer.ts

import { VNode, isVNode, ComponentFunction, Child } from './vnode';
import { isTextNode } from './utils';
import { resetHooks, setCurrentInstance, getCurrentInstance } from './hooks';

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

export interface ComponentInstance {
  componentFunc: ComponentFunction;
  props: any;
  hooks: any[];
  hookIndex: number;
  dom: HTMLElement | Text | null;
  parentDom: HTMLElement;
}

// src/virtual-dom/renderer.ts

export function renderComponent(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any = {},
  instance?: ComponentInstance,
): HTMLElement | Text {
  if (!instance) {
    instance = {
      componentFunc,
      props,
      hooks: [],
      hookIndex: 0,
      dom: null,
      parentDom: container,
    };
  } else {
    // Update instance's parentDom to the new container
    instance.parentDom = container;
  }

  const previousInstance = getCurrentInstance();
  setCurrentInstance(instance);
  resetHooks();

  const vnode = componentFunc(props);

  // Pass the container as parentDom
  const dom = renderToDom(vnode, container);

  setCurrentInstance(previousInstance);

  if (instance.dom && instance.dom.parentNode) {
    // Update existing DOM
    instance.dom.parentNode.replaceChild(dom, instance.dom);
    instance.dom = dom; // Update the instance's dom reference
  } else {
    // Initial render
    instance.dom = dom;
    container.appendChild(dom);
  }

  return dom;
}

function renderToDom(
  vnode: Child,
  parentDom: HTMLElement | null = null,
): HTMLElement | Text {
  if (typeof vnode === 'function') {
    // Treat as a component function
    const instance: ComponentInstance = {
      componentFunc: vnode,
      props: {},
      hooks: [],
      hookIndex: 0,
      dom: null,
      parentDom: parentDom as HTMLElement,
    };

    const previousInstance = getCurrentInstance();
    setCurrentInstance(instance);
    resetHooks();

    const childVnode = vnode(instance.props);

    const dom = renderToDom(childVnode, parentDom);

    setCurrentInstance(previousInstance);

    instance.dom = dom;

    return dom;
  } else if (
    typeof vnode === 'string' ||
    typeof vnode === 'number' ||
    typeof vnode === 'boolean'
  ) {
    return document.createTextNode(String(vnode));
  } else if (isVNode(vnode)) {
    const domElement = document.createElement(vnode.type);
    applyProps(domElement, vnode.props);

    vnode.children.forEach((child) => {
      const childDom = renderToDom(child, domElement);
      domElement.appendChild(childDom);
    });

    return domElement;
  } else {
    throw new Error('Invalid VNode');
  }
}

// src/virtual-dom/renderer.ts

function renderVNode(vnode: VNode, container: HTMLElement): void {
  const domElement = document.createElement(vnode.type);
  applyProps(domElement, vnode.props);

  vnode.children.forEach((child) => {
    const childDom = renderToDom(child, domElement);
    domElement.appendChild(childDom);
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
