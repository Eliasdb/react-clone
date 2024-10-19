// src/virtual-dom/helpers.ts

import { ComponentFunction } from './vnode';

/**
 * Binds props to a component function.
 * @param component - The component function to bind props to.
 * @param props - The props to pass to the component.
 * @returns A new component function with bound props.
 */
export function withProps(
  component: ComponentFunction,
  props: any,
): ComponentFunction {
  return () => component(props);
}
