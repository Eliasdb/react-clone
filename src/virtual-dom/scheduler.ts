// src/virtual-dom/scheduler.ts

import {
  ComponentInstance,
  isPrimitive,
  renderToDom,
  updateExistingDom,
} from './renderer';
import { getCurrentInstance, setCurrentInstance, resetHooks } from './hooks';
import { Child, isVNode, VNode } from './vnode';

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
  console.log(
    `Diffing VNodes. OldVNode: ${JSON.stringify(oldVNode)}, NewVNode: ${JSON.stringify(newVNode)}`,
  );

  if (oldVNode === null) {
    console.log('Old VNode is null. New VNode needs to be mounted.');
    return true;
  }

  if (isPrimitive(newVNode) && isPrimitive(oldVNode)) {
    const result = String(oldVNode) !== String(newVNode);
    return result;
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    if (oldVNode.type !== newVNode.type) {
      return true; // Different types, replace
    }

    // Compare props, excluding event handlers
    const oldProps = oldVNode.props;
    const newProps = newVNode.props;

    const allKeys = new Set([
      ...Object.keys(oldProps),
      ...Object.keys(newProps),
    ]);

    let propsChanged = false;
    for (let key of allKeys) {
      if (key.startsWith('on')) {
        // Skip event handler props
        continue;
      }
      if (newProps[key] !== oldProps[key]) {
        propsChanged = true;

        break; // No need to check further if a change is detected
      }
    }

    // **Special handling for 'input' and 'select' elements to avoid replacing DOM nodes**
    if (['input', 'select'].includes(newVNode.type)) {
      // Check if any non 'value' and non 'on*' prop has changed
      let otherPropsChanged = false;
      for (let key of allKeys) {
        if (key === 'value' || key.startsWith('on')) {
          continue;
        }
        if (newProps[key] !== oldProps[key]) {
          otherPropsChanged = true;

          break;
        }
      }

      if (!otherPropsChanged && newProps.value !== oldProps.value) {
        // Instead of returning true (replace), return false to update props and children
        return false;
      }
    }

    if (propsChanged) {
      return true; // Props have changed, need to replace
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
