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
    console.log(`Primitive diff result: ${result}`);
    return result;
  } else if (isVNode(newVNode) && isVNode(oldVNode)) {
    if (oldVNode.type !== newVNode.type) {
      console.log(
        `VNode types differ. Old: ${oldVNode.type}, New: ${newVNode.type}`,
      );
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
        console.log(
          `Prop changed: ${key} from ${oldProps[key]} to ${newProps[key]}`,
        );
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
          console.log(
            `Non-value prop changed for ${newVNode.type}: ${key} from ${oldProps[key]} to ${newProps[key]}`,
          );
          break;
        }
      }

      if (!otherPropsChanged && newProps.value !== oldProps.value) {
        console.log(
          `Only 'value' prop changed for ${newVNode.type}: from ${oldProps.value} to ${newProps.value}`,
        );
        // Instead of returning true (replace), return false to update props and children
        return false;
      }
    }

    if (propsChanged) {
      console.log(
        `Props have changed for ${newVNode.type}. Need to replace DOM node.`,
      );
      return true; // Props have changed, need to replace
    }

    // Recursively check children
    if (newVNode.children.length !== oldVNode.children.length) {
      console.log(
        `Number of children differ for ${newVNode.type}. Old: ${oldVNode.children.length}, New: ${newVNode.children.length}`,
      );
      return true; // Different number of children
    }

    for (let i = 0; i < newVNode.children.length; i++) {
      if (diff(oldVNode.children[i], newVNode.children[i])) {
        console.log(`Child at index ${i} has changed for ${newVNode.type}.`);
        return true;
      }
    }

    console.log(`No changes detected for ${newVNode.type}.`);
    return false; // No changes detected
  } else {
    console.log(
      `VNode types differ (one is VNode, other is not). Need to replace DOM node.`,
    );
    return true; // Different types, replace.
  }
}
