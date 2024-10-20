// src/virtual-dom/scheduler.ts

import {
  ComponentInstance,
  isPrimitive,
  reconcileChildren,
  renderToDom,
  updateExistingDom,
  updatePropsAndChildren,
} from './renderer';
import { getCurrentInstance, setCurrentInstance, resetHooks } from './hooks';
import { Child, isVNode, VNode } from './vnode';
import { applyProps } from './applyProps';

let isScheduled = false;
const updateQueue: Set<ComponentInstance> = new Set();

export function scheduleUpdate(instance: ComponentInstance) {
  updateQueue.add(instance);

  if (!isScheduled) {
    isScheduled = true;
    Promise.resolve().then(flushUpdates);
  }
}

function flushUpdates() {
  updateQueue.forEach((instance) => {
    const { componentFunc, parentDom, props } = instance;

    const previousInstance = getCurrentInstance();
    setCurrentInstance(instance);
    resetHooks();

    const vnode = componentFunc(props);
    setCurrentInstance(previousInstance);

    if (instance.dom) {
      // Instead of replacing the entire DOM, let's update it
      updateExistingDom(instance, vnode);
    } else {
      // Handle the initial rendering
      const newDom = renderToDom(vnode, parentDom);
      if (parentDom) {
        parentDom.appendChild(newDom);
      }
      instance.dom = newDom;
    }
  });

  updateQueue.clear();
  isScheduled = false;
}

export function diff(
  oldDom: HTMLElement | Text | null,
  newVNode: VNode | Child,
): boolean {
  if (oldDom === null) {
    return true; // If there's no old DOM, we need to create a new one.
  }

  if (isPrimitive(newVNode) && oldDom instanceof Text) {
    if (oldDom.textContent !== String(newVNode)) {
      oldDom.textContent = String(newVNode);
      return false; // No replacement, just updated content.
    }
  } else if (isVNode(newVNode) && oldDom instanceof HTMLElement) {
    if (oldDom.nodeName.toLowerCase() !== newVNode.type) {
      return true; // Replace the old node with the new one.
    } else {
      // Apply attribute updates and reconcile children.
      updatePropsAndChildren(oldDom, newVNode);
      return false; // No replacement needed, just updated attributes/children.
    }
  } else {
    // If the types do not match, mark for replacement.
    return true;
  }

  return false;
}
