// src/virtual-dom/helpers.ts

import { ComponentFunction, VNode } from './vnode';

export function withProps(
  component: ComponentFunction,
  props: any,
): ComponentFunction {
  return () => {
    const vnode = component(props);
    if (Array.isArray(vnode)) {
      return {
        type: 'fragment',
        props: {},
        children: vnode,
      };
    }
    return vnode;
  };
}
