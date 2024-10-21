import { RenderableVNode } from './template';
import { ComponentFunction, VNode } from './vnode';

export function isTextNode(value: any): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export function isValidHtmlAttribute(attr: string): boolean {
  // List of valid HTML attributes (extend as needed)
  const validAttributes = [
    'id',
    'class',
    'src',
    'href',
    'alt',
    'title',
    'style',
    'type',
    'name',
    'value',
    'placeholder',
    'disabled',
  ];
  return validAttributes.includes(attr) || attr.startsWith('data-');
}

// src/virtual-dom/helpers.ts

/**
 * Binds props to a component function.
 * @param component - The component function to bind props to.
 * @param props - The props to pass to the component.
 * @returns The rendered VNode.
 */
export function withProps(
  component: ComponentFunction,
  props: unknown,
): VNode | RenderableVNode {
  // Directly return the rendered VNode from the component
  return component(props);
}
