// src/virtual-dom/scheduler.ts

import { render } from './renderer';

let isScheduled = false;
let rootVNode: any;
let rootContainer: HTMLElement;

export function scheduleUpdate() {
  if (!isScheduled) {
    isScheduled = true;
    Promise.resolve().then(() => {
      isScheduled = false;
      render(rootVNode, rootContainer);
    });
  }
}

export function setRoot(vnode: any, container: HTMLElement) {
  rootVNode = vnode;
  rootContainer = container;
}
