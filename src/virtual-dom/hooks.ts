// src/virtual-dom/hooks.ts

import { scheduleUpdate } from './scheduler';

type StateUpdater<S> = (newState: S | ((prevState: S) => S)) => void;

interface Hook<S> {
  state: S;
  updater: StateUpdater<S>;
}

let hooks: Hook<any>[] = [];
let hookIndex = 0;

export function resetHooks() {
  hookIndex = 0;
}

export function useState<S>(initialState: S): [S, StateUpdater<S>] {
  const currentIndex = hookIndex++;

  if (!hooks[currentIndex]) {
    const updater: StateUpdater<S> = (newState) => {
      const hook = hooks[currentIndex];
      const nextState =
        typeof newState === 'function'
          ? (newState as (prevState: S) => S)(hook.state)
          : newState;

      if (nextState !== hook.state) {
        hook.state = nextState;
        // Trigger re-render
        scheduleUpdate();
      }
    };

    const hook: Hook<S> = {
      state: initialState,
      updater,
    };

    hooks[currentIndex] = hook;
  }

  return [hooks[currentIndex].state, hooks[currentIndex].updater];
}
