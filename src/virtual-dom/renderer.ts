// src/virtual-dom/renderer.ts

import { VNode, isVNode, ComponentFunction, Child } from './vnode';
import { isTextNode } from './utils';
import { resetHooks, setCurrentInstance, getCurrentInstance } from './hooks';
import { applyProps } from './applyProps';

export interface ComponentInstance {
  componentFunc: ComponentFunction;
  props: any;
  hooks: any[];
  hookIndex: number;
  dom: HTMLElement | Text | null;
  parentDom: HTMLElement;
}

const instances: ComponentInstance[] = []; // Global instances array

export function render(
  vnode: VNode | VNode[] | ComponentFunction | string | number | boolean,
  container: HTMLElement,
): void {
  if (Array.isArray(vnode)) {
    renderFragment(vnode, container);
  } else if (typeof vnode === 'function') {
    renderComponent(vnode, container);
  } else if (isVNode(vnode)) {
    if (vnode.type === 'fragment') {
      renderFragment(vnode.children, container);
    } else {
      renderVNode(vnode, container);
    }
  } else if (isTextNode(vnode)) {
    renderTextNode(vnode, container);
  }
}

export function renderComponent(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any = {},
): HTMLElement | Text {
  let instance = findOrCreateInstance(componentFunc, container, props);

  setCurrentInstanceAndResetHooks(instance);

  const vnodeRendered = componentFunc(props);
  restorePreviousInstance();

  if (instance.dom) {
    // Update the existing DOM node in place
    const newDom = renderToDom(vnodeRendered, container);
    container.replaceChild(newDom, instance.dom);
    instance.dom = newDom;
    return newDom;
  } else {
    // Initial render
    const dom = renderToDom(vnodeRendered, container);
    instance.dom = dom;
    container.appendChild(dom);
    return dom;
  }
}

function renderFragment(vnodes: Child[], container: HTMLElement): void {
  const fragment = document.createDocumentFragment();
  vnodes.forEach((child) => {
    const childDom = renderToDom(child, null);
    fragment.appendChild(childDom);
  });
  container.appendChild(fragment);
}

function findOrCreateInstance(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any,
): ComponentInstance {
  let instance = findExistingInstance(componentFunc, container);

  if (!instance) {
    instance = {
      componentFunc,
      props,
      hooks: [],
      hookIndex: 0,
      dom: null,
      parentDom: container,
    };
    instances.push(instance);
  } else {
    instance.props = props;
  }

  return instance;
}

function findExistingInstance(
  componentFunc: ComponentFunction,
  container: HTMLElement,
): ComponentInstance | null {
  return (
    instances.find(
      (instance) =>
        instance.componentFunc === componentFunc &&
        instance.parentDom === container,
    ) || null
  );
}

function setCurrentInstanceAndResetHooks(instance: ComponentInstance): void {
  const previousInstance = getCurrentInstance();
  setCurrentInstance(instance);
  resetHooks();
}

function restorePreviousInstance(): void {
  const previousInstance = getCurrentInstance();
  setCurrentInstance(previousInstance);
}

function updateElement(dom: HTMLElement | Text, newVnode: Child): void {
  if (isPrimitive(newVnode)) {
    updateTextNode(dom as Text, newVnode);
  } else if (typeof newVnode === 'function') {
    // Handle nested component functions if needed
    renderComponent(newVnode, dom.parentElement as HTMLElement);
  } else if (isVNode(newVnode)) {
    updateDomNode(dom as HTMLElement, newVnode);
  }
}

function updateTextNode(dom: Text, newVnode: string | number | boolean): void {
  const newValue = String(newVnode);
  if (dom.textContent !== newValue) {
    dom.textContent = newValue;
  }
}

function updateDomNode(dom: HTMLElement, newVnode: VNode): void {
  if (dom.nodeName.toLowerCase() !== newVnode.type) {
    replaceDomNode(dom, newVnode);
  } else {
    updatePropsAndChildren(dom, newVnode);
  }
}

function replaceDomNode(dom: HTMLElement, newVnode: VNode): void {
  const newDom = renderToDom(newVnode, dom.parentElement);
  dom.parentElement?.replaceChild(newDom, dom);
}

function updatePropsAndChildren(dom: HTMLElement, newVnode: VNode): void {
  applyProps(dom, newVnode.props);
  reconcileChildren(dom, newVnode.children);
}

function reconcileChildren(dom: HTMLElement, children: Child[]): void {
  const domChildren = dom.childNodes;

  children.forEach((childVnode, i) => {
    const childDom = domChildren[i];

    if (childDom) {
      updateElement(childDom as HTMLElement | Text, childVnode);
    } else {
      const newChildDom = renderToDom(childVnode, dom);
      dom.appendChild(newChildDom);
    }
  });

  // Remove any extra DOM children
  while (domChildren.length > children.length) {
    dom.removeChild(domChildren[children.length]);
  }
}

function isPrimitive(value: any): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export function renderToDom(
  vnode: Child,
  parentDom: HTMLElement | null = null,
): HTMLElement | Text {
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    vnode.forEach((child) => {
      const childDom = renderToDom(child, null);
      fragment.appendChild(childDom);
    });
    if (parentDom) {
      parentDom.appendChild(fragment);
    }
    return fragment as unknown as HTMLElement; // Casting to HTMLElement for compatibility
  } else if (typeof vnode === 'function') {
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
  } else if (isPrimitive(vnode)) {
    return document.createTextNode(String(vnode));
  } else if (isVNode(vnode)) {
    if (vnode.type === 'fragment') {
      const fragment = document.createDocumentFragment();
      vnode.children.forEach((child) => {
        fragment.appendChild(renderToDom(child, null));
      });
      return fragment as unknown as HTMLElement;
    }

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

function renderVNode(vnode: VNode, container: HTMLElement): void {
  const domElement = document.createElement(vnode.type);
  applyProps(domElement, vnode.props);

  vnode.children.forEach((child) => {
    const childDom = renderToDom(child, domElement);
    domElement.appendChild(childDom);
  });

  container.appendChild(domElement);
}

function renderTextNode(
  value: string | number | boolean,
  container: HTMLElement,
): void {
  container.appendChild(document.createTextNode(String(value)));
}
