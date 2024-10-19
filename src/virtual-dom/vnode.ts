export interface VNode {
  type: string;
  props: Record<string, any>;
  children: Array<VNode | string | number | boolean>;
}

export function createVNode(type: string): VNode {
  return {
    type,
    props: {},
    children: [],
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
