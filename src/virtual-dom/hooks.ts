// src/virtual-dom/hooks.ts

import { ComponentInstance } from './renderer';
import { scheduleUpdate } from './scheduler';

type StateUpdater<S> = (newState: S | ((prevState: S) => S)) => void;

interface Hook<S> {
  state: S;
  updater: StateUpdater<S>;
}

let currentInstance: ComponentInstance | null = null;

export function setCurrentInstance(instance: ComponentInstance | null) {
  currentInstance = instance;
}

export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance;
}

export function resetHooks() {
  if (currentInstance) {
    currentInstance.hookIndex = 0;
  }
}

export function useState<S>(initialState: S): [S, StateUpdater<S>] {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useState must be called within a component');
  }

  const { hooks, hookIndex } = instance;

  // Initialize the hook if it does not exist
  if (!hooks[hookIndex]) {
    hooks[hookIndex] = createHook(initialState, instance);
  }

  // Increment hook index for the next hook call
  instance.hookIndex++;

  const hook = hooks[hookIndex] as Hook<S>;
  return [hook.state, hook.updater];
}

function createHook<S>(initialState: S, instance: ComponentInstance): Hook<S> {
  const updater: StateUpdater<S> = (newState) => {
    const hook = instance.hooks[instance.hookIndex - 1] as Hook<S>;
    const nextState =
      typeof newState === 'function'
        ? (newState as (prevState: S) => S)(hook.state)
        : newState;

    if (nextState !== hook.state) {
      hook.state = nextState;
      scheduleUpdate(instance);
    }
  };

  return { state: initialState, updater };
}
