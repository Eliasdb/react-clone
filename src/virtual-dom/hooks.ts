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

  const instanceForUpdater = instance;

  const hooks = instance.hooks;
  const hookIndex = instance.hookIndex++;

  if (!hooks[hookIndex]) {
    const updater: StateUpdater<S> = (newState) => {
      const hook = hooks[hookIndex];
      const nextState =
        typeof newState === 'function'
          ? (newState as (prevState: S) => S)(hook.state)
          : newState;

      if (nextState !== hook.state) {
        hook.state = nextState;
        // Trigger re-render of this component instance
        scheduleUpdate(instanceForUpdater);
      }
    };

    const hook: Hook<S> = {
      state: initialState,
      updater,
    };

    hooks[hookIndex] = hook;
  }

  return [hooks[hookIndex].state, hooks[hookIndex].updater];
}
