// src/virtual-dom/scheduler.ts

import { ComponentInstance, renderToDom } from './renderer';
import { getCurrentInstance, setCurrentInstance, resetHooks } from './hooks';

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

    const newDom = renderToDom(vnode, parentDom);

    setCurrentInstance(previousInstance);

    if (instance.dom && instance.dom.parentNode) {
      instance.dom.parentNode.replaceChild(newDom, instance.dom);
    }

    instance.dom = newDom;
  });
  updateQueue.clear();
  isScheduled = false;
}
