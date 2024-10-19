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

/**
 * Finds an existing component instance based on the component function and parent container.
 * @param componentFunc - The component function to search for.
 * @param container - The parent DOM container.
 * @returns The matching ComponentInstance or null if not found.
 */
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

// src/virtual-dom/renderer.ts

export function renderComponent(
  componentFunc: ComponentFunction,
  container: HTMLElement,
  props: any = {},
): HTMLElement | Text {
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

  const previousInstance = getCurrentInstance();
  setCurrentInstance(instance);
  resetHooks();

  const vnodeRendered = componentFunc(props);

  setCurrentInstance(previousInstance);

  if (instance.dom) {
    // Update existing DOM node's properties
    updateElement(instance.dom, vnodeRendered);
    return instance.dom;
  } else {
    // Initial render
    const dom = renderToDom(vnodeRendered, container);
    instance.dom = dom;
    container.appendChild(dom);
    return dom;
  }
}

/**
 * Updates an existing DOM element based on the new VNode.
 * @param dom - The existing DOM element.
 * @param newVnode - The new VNode to update the DOM with.
 */
function updateElement(dom: HTMLElement | Text, newVnode: Child): void {
  if (
    typeof newVnode === 'string' ||
    typeof newVnode === 'number' ||
    typeof newVnode === 'boolean'
  ) {
    if (dom.textContent !== String(newVnode)) {
      dom.textContent = String(newVnode);
    }
  } else if (typeof newVnode === 'function') {
    // Handle component functions if needed
    // For simplicity, we're not handling nested components here
  } else if (isVNode(newVnode)) {
    if (dom.nodeName.toLowerCase() !== newVnode.type) {
      const newDom = renderToDom(newVnode, dom.parentElement);
      dom.parentElement?.replaceChild(newDom, dom);
    } else {
      // Update attributes
      applyProps(dom as HTMLElement, newVnode.props);

      // Recursively update children
      const children = newVnode.children;
      const domChildren = dom.childNodes;

      for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];
        const childDom = domChildren[i];

        if (childDom) {
          updateElement(childDom as HTMLElement | Text, childVnode);
        } else {
          const newChildDom = renderToDom(childVnode, dom as HTMLElement);
          dom.appendChild(newChildDom);
        }
      }

      // Remove any extra DOM children
      while (domChildren.length > children.length) {
        dom.removeChild(domChildren[children.length]);
      }
    }
  }
}

export function renderToDom(
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

// src/virtual-dom/renderer.ts

function renderTextNode(
  value: string | number | boolean,
  container: HTMLElement,
): void {
  container.appendChild(document.createTextNode(String(value)));
}
