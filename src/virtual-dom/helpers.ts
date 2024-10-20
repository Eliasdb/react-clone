// src/virtual-dom/helpers.ts

import { ComponentFunction, VNode } from './vnode';

/**
 * Binds props to a component function.
 * @param component - The component function to bind props to.
 * @param props - The props to pass to the component.
 * @returns The rendered VNode.
 */
export function withProps(component: ComponentFunction, props: any): VNode {
  // Directly return the rendered VNode from the component
  return component(props);
}
