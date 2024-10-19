// src/virtual-dom/scheduler.ts

import { ComponentInstance, renderComponent } from './renderer';

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
    const { componentFunc, dom, props } = instance;
    const parentDom =
      dom && dom.parentNode
        ? (dom.parentNode as HTMLElement)
        : instance.parentDom;
    renderComponent(componentFunc, parentDom, props, instance);
  });
  updateQueue.clear();
  isScheduled = false;
}
