// src/virtual-dom/scheduler.ts

import {
  ComponentInstance,
  isPrimitive,
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
  console.log(`Scheduled update for component: ${instance.componentFunc.name}`);

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

    const newVNode = componentFunc(props);
    setCurrentInstance(previousInstance);

    if (instance.dom) {
      updateExistingDom(instance, newVNode);
    } else {
      const newDom = renderToDom(newVNode, parentDom);
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
  oldVNode: VNode | Child | null,
  newVNode: VNode | Child,
): boolean {
  if (oldVNode === null) {
    return true;
  }

  if (isPrimitive(newVNode) && isPrimitive(oldVNode)) {
    const result = String(oldVNode) !== String(newVNode);
    return result;
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    if (oldVNode.type !== newVNode.type) {
      return true; // Different types, replace
    }

    // Compare props
    const oldProps = oldVNode.props;
    const newProps = newVNode.props;

    const allKeys = new Set([
      ...Object.keys(oldProps),
      ...Object.keys(newProps),
    ]);
    let propsChanged = false;
    for (let key of allKeys) {
      if (newProps[key] !== oldProps[key]) {
        propsChanged = true;
      }
    }

    if (propsChanged) {
      return true; // Props have changed, need to update
    }

    // Recursively check children
    if (newVNode.children.length !== oldVNode.children.length) {
      return true; // Different number of children
    }

    for (let i = 0; i < newVNode.children.length; i++) {
      if (diff(oldVNode.children[i], newVNode.children[i])) {
        return true;
      }
    }

    return false; // No changes detected
  } else {
    return true; // Different types, replace.
  }
}
