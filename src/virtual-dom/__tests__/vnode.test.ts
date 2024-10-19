// src/virtual-dom/__tests__/vnode.test.ts

import { createVNode, isVNode, VNode } from '../vnode';

describe('Virtual Node', () => {
  // Ensures that createVNode returns an object with the expected structure.
  test('createVNode should create a VNode with the correct type', () => {
    const vnode = createVNode('div');
    expect(vnode).toEqual({
      type: 'div',
      props: {},
      children: [],
    });
  });

  // Confirms that isVNode accurately determines whether a value is a VNode.
  test('isVNode should correctly identify VNodes', () => {
    const vnode: VNode = {
      type: 'span',
      props: {},
      children: [],
    };
    expect(isVNode(vnode)).toBe(true);
    expect(isVNode('string')).toBe(false);
    expect(isVNode(123)).toBe(false);
    expect(isVNode({ type: 'div' })).toBe(false);
  });

  test('isVNode should return false for objects missing required properties', () => {
    expect(
      isVNode({
        type: 'div',
        props: {},
        // Missing children
      }),
    ).toBe(false);

    expect(
      isVNode({
        type: 'div',
        children: [],
        // Missing props
      }),
    ).toBe(false);

    expect(
      isVNode({
        props: {},
        children: [],
        // Missing type
      }),
    ).toBe(false);

    expect(
      isVNode({
        type: 123, // Incorrect type
        props: {},
        children: [],
      }),
    ).toBe(false);

    expect(
      isVNode({
        type: 'div',
        props: null, // props should not be null
        children: [],
      }),
    ).toBe(false);

    expect(
      isVNode({
        type: 'div',
        props: {},
        children: 'not-an-array', // children should be an array
      }),
    ).toBe(false);
  });
});
