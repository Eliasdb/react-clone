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
    console.log(`Resetting hooks for instance: ${currentInstance.id}`);
    currentInstance.hookIndex = 0;
  }
}

export function useState<S>(initialState: S): [S, StateUpdater<S>] {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('useState must be called within a component');
  }

  const { hooks, hookIndex } = instance;

  console.log(
    `useState called in instance: ${instance.id}, hookIndex: ${hookIndex}`,
  );

  // Initialize the hook if it does not exist
  if (!hooks[hookIndex]) {
    hooks[hookIndex] = createHook(initialState, instance);
    console.log(
      `Initialized hook at index ${hookIndex} with state: ${initialState}`,
    );
  }

  const hook = hooks[hookIndex] as Hook<S>;

  // Increment hook index for the next hook call
  instance.hookIndex++;

  const stableUpdater: StateUpdater<S> = (newState) => {
    const nextState =
      typeof newState === 'function'
        ? (newState as (prevState: S) => S)(hook.state)
        : newState;

    console.log(
      `State updater called in instance: ${instance.id}, hookIndex: ${hookIndex}, newState: ${nextState}`,
    );

    if (nextState !== hook.state) {
      hook.state = nextState;
      scheduleUpdate(instance);
      console.log(
        `State updated in instance: ${instance.id}, hookIndex: ${hookIndex}, newState: ${nextState}`,
      );
    }
  };

  return [hook.state, stableUpdater];
}

function createHook<S>(initialState: S, instance: ComponentInstance): Hook<S> {
  console.log(
    `Creating new hook for instance: ${instance.id} with initial state: ${initialState}`,
  );
  return {
    state: initialState,
    updater: (newState) => {
      const hook = instance.hooks[instance.hookIndex - 1] as Hook<S>;
      const nextState =
        typeof newState === 'function'
          ? (newState as (prevState: S) => S)(hook.state)
          : newState;

      console.log(
        `Updater function called for instance: ${instance.id}, hookIndex: ${instance.hookIndex - 1}, newState: ${nextState}`,
      );

      if (nextState !== hook.state) {
        hook.state = nextState;
        scheduleUpdate(instance);
        console.log(
          `State updated via updater function for instance: ${instance.id}, hookIndex: ${instance.hookIndex - 1}, newState: ${nextState}`,
        );
      }
    },
  };
}
