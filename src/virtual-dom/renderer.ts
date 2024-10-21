// src/virtual-dom/renderer.ts

import { VNode, isVNode, ComponentFunction, Child } from './vnode';
import { isTextNode } from './utils';
import { resetHooks, setCurrentInstance, getCurrentInstance } from './hooks';
import { applyProps } from './applyProps';
import { diff, scheduleUpdate } from './scheduler';

// src/virtual-dom/renderer.ts
let instanceCounter = 0; // Initialize a counter for unique IDs

export interface ComponentInstance {
  id: string; // Made required and of type string
  componentFunc: ComponentFunction; // Changed from Function to ComponentFunction
  props: any; // Ensure props are always present
  hooks: any[];
  hookIndex: number;
  dom: HTMLElement | Text | null;
  parentDom: HTMLElement; // Changed from HTMLElement | null to HTMLElement
  previousVNode: VNode | Child | null;
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
      const newDom = renderToDom(newVNode, container);
      if (instance.dom && instance.dom.parentNode) {
        instance.dom.parentNode.replaceChild(newDom, instance.dom);
      }
      instance.dom = newDom;
    } else {
      if (isVNode(newVNode) && instance.dom instanceof HTMLElement) {
        updatePropsAndChildren(instance.dom, newVNode);
      }
    }
  } else {
    const dom = renderToDom(newVNode, container);
    instance.dom = dom;
    container.appendChild(dom);
  }

  instance.previousVNode = newVNode; // Set previousVNode after updating

  return instance.dom!;
}

export function createComponentInstance(
  componentFunc: ComponentFunction, // Changed from Function to ComponentFunction
  parentDom: HTMLElement, // Changed from HTMLElement | null to HTMLElement
  props: any, // Added props parameter
): ComponentInstance {
  instanceCounter++;
  const newInstance: ComponentInstance = {
    id: `component-${instanceCounter}`, // Assign a unique ID
    componentFunc,
    parentDom,
    props, // Assign props here
    dom: null,
    previousVNode: null,
    hooks: [],
    hookIndex: 0,
  };
  console.log(`Created new instance: ${newInstance.id} with props:`, props); // Logging
  return newInstance;
}

function findOrCreateInstance(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any,
): ComponentInstance {
  let instance = findExistingInstance(componentFunc, container);

  if (!instance) {
    instance = createComponentInstance(componentFunc, container, props); // Pass props here
    instances.push(instance);
    console.log(`Created new instance: ${instance.id}`);
  } else {
    instance.props = props;
    console.log(`Found existing instance: ${instance.id}`);
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
  instance.previousVNode = newVNode; // Update to new VNode

  if (isVNode(newVNode) && instance.dom instanceof HTMLElement) {
    // Update props and children without replacing the entire DOM node
    updatePropsAndChildren(instance.dom, newVNode);

    // **Special Handling for 'select' Elements**
    if (newVNode.type === 'select') {
      const newValue = newVNode.props.value;

      if (newValue !== undefined) {
        (instance.dom as HTMLSelectElement).value = newValue;
        console.log(`<select> value set to '${newValue}'`);
      }
    }
  } else {
    // If newVNode is a primitive or a different type, replace the entire DOM node

    const newDom = renderToDom(newVNode, instance.parentDom);
    if (instance.dom && instance.dom.parentNode) {
      instance.dom.parentNode.replaceChild(newDom, instance.dom);
    }
    instance.dom = newDom;
  }
}

// src/virtual-dom/renderer.ts

function updateElement(dom: HTMLElement | Text, newVnode: Child): void {
  if (isPrimitive(newVnode)) {
    updateTextNode(dom as Text, newVnode);
  } else if (typeof newVnode === 'function') {
    // Handle nested component functions if needed
    renderComponent(newVnode, dom.parentElement as HTMLElement, {});
  } else if (isVNode(newVnode)) {
    if (
      dom instanceof HTMLElement &&
      dom.tagName.toLowerCase() === newVnode.type.toLowerCase()
    ) {
      updatePropsAndChildren(dom, newVnode);

      // **Special Handling for 'select' Elements**
      if (newVnode.type.toLowerCase() === 'select') {
        const newValue = newVnode.props.value;
        if (newValue !== undefined) {
          (dom as HTMLSelectElement).value = newValue;
          console.log(`Set <select> value to '${newValue}'`);
        }
      }
    } else {
      // If the types don't match, replace the DOM node
      console.log(`VNode type mismatch. Replacing DOM node.`);
      const newDom = renderToDom(newVnode, dom.parentElement);
      if (dom.parentNode) {
        dom.parentNode.replaceChild(newDom, dom);
      }
    }
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
// src/virtual-dom/renderer.ts

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
    const extraChild = domChildren[children.length];
    dom.removeChild(extraChild);
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
    const textNode = document.createTextNode(String(vnode));
    return textNode;
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
