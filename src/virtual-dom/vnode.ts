// src/virtual-dom/vnode.ts

import { RenderableVNode } from './template';

export type ComponentFunction = (props?: any) => VNode | RenderableVNode;

export type Child =
  | RenderableVNode
  | Node
  | string
  | number
  | boolean
  | ComponentFunction;

export interface VNode {
  type: string;
  props: Record<string, any>;
  children: Child[];
}

export function createVNode(
  type: string,
  props: Record<string, any> = {},
  children: Child[] = [],
): VNode {
  return {
    type,
    props,
    children,
  };
}

export function isVNode(value: any): value is VNode {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.props === 'object' &&
    value.props !== null &&
    Array.isArray(value.children)
  );
}
