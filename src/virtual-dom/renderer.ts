// src/virtual-dom/renderer.ts

import { VNode, isVNode, ComponentFunction, Child } from './vnode';
import { isTextNode } from './utils';
import { resetHooks, setCurrentInstance, getCurrentInstance } from './hooks';
import { applyProps } from './applyProps';
import { diff, scheduleUpdate } from './scheduler';

// src/virtual-dom/renderer.ts

export interface ComponentInstance {
  componentFunc: ComponentFunction;
  props: any;
  hooks: any[];
  hookIndex: number;
  dom: HTMLElement | Text | null;
  parentDom: HTMLElement;
  previousVNode: VNode | Child | null; // Added property
}

const instances: ComponentInstance[] = []; // Global instances array

export function render(
  vnode: VNode | VNode[] | ComponentFunction | string | number | boolean,
  container: HTMLElement,
): void {
  if (Array.isArray(vnode)) {
    vnode.forEach((child) => render(child, container));
  } else if (typeof vnode === 'function') {
    renderComponent(vnode, container);
  } else if (isVNode(vnode)) {
    renderVNode(vnode, container);
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

  const newVNode = componentFunc(props); // Generate new VNode
  restorePreviousInstance();

  const oldVNode = instance.previousVNode; // Get old VNode

  if (instance.dom) {
    if (diff(oldVNode, newVNode)) {
      // If diff returns true, replace the DOM node
      const newDom = renderToDom(newVNode, container);
      if (instance.dom && instance.dom.parentNode) {
        instance.dom.parentNode.replaceChild(newDom, instance.dom);
      }
      instance.dom = newDom;
    } else {
      // If diff returns false, update props and children
      if (isVNode(newVNode) && instance.dom instanceof HTMLElement) {
        updatePropsAndChildren(instance.dom, newVNode);
      }
    }
  } else {
    // Initial render
    const dom = renderToDom(newVNode, container);
    instance.dom = dom;
    container.appendChild(dom);
  }

  instance.previousVNode = newVNode; // Set previousVNode after updating

  return instance.dom!;
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
      previousVNode: null, // Initialize previousVNode
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
): ComponentInstance | undefined {
  // Changed from | null to | undefined
  return instances.find(
    (instance) =>
      instance.componentFunc === componentFunc &&
      instance.parentDom === container,
  );
}

function setCurrentInstanceAndResetHooks(instance: ComponentInstance): void {
  setCurrentInstance(instance);
  resetHooks(); // This makes sure hook indices start from 0 on every render.
}

function restorePreviousInstance(): void {
  const previousInstance = getCurrentInstance();
  setCurrentInstance(previousInstance);
}

export function updateExistingDom(
  instance: ComponentInstance,
  newVNode: VNode | Child,
): void {
  const oldVNode = instance.previousVNode;
  instance.previousVNode = newVNode; // Update to new VNode

  if (diff(oldVNode!, newVNode)) {
    const newDom = renderToDom(newVNode, instance.parentDom);
    if (instance.dom && instance.dom.parentNode) {
      instance.dom.parentNode.replaceChild(newDom, instance.dom);
    }
    instance.dom = newDom;
  } else {
    // If not replacing, ensure props and children are updated
    if (isVNode(newVNode) && instance.dom instanceof HTMLElement) {
      updatePropsAndChildren(instance.dom, newVNode);
    }
  }
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
  const newDom = renderToDom(newVnode);
  dom.parentElement?.replaceChild(newDom, dom);
}

export function updatePropsAndChildren(
  dom: HTMLElement,
  newVNode: VNode,
): void {
  // Update props
  applyProps(dom, newVNode.props);

  // Reconcile children
  reconcileChildren(dom, newVNode.children);
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

export function isPrimitive(value: any): value is string | number | boolean {
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
      const childDom = renderToDom(child, parentDom);
      fragment.appendChild(childDom);
    });
    return fragment as unknown as HTMLElement | Text;
  } else if (typeof vnode === 'function') {
    // Render component functions to DOM
    const componentInstance = renderComponent(vnode, parentDom as HTMLElement);
    return componentInstance;
  } else if (isPrimitive(vnode)) {
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
