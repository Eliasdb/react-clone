// src/virtual-dom/__tests__/template.test.ts

import { template } from '../template';
import { VNode } from '../vnode';

describe('Template Function', () => {
  // Static Template Test: Verifies that template correctly parses static HTML strings into a VNode tree.
  test('template should create a VNode tree from a template string', () => {
    const vnode = template`
      <div class="container">
        <h1>Hello, World!</h1>
        <p>Welcome to testing.</p>
      </div>
    ` as VNode;

    expect(vnode.type).toBe('div');
    expect(vnode.props).toEqual({ class: 'container' });
    expect(vnode.children).toHaveLength(2);

    const [h1Node, pNode] = vnode.children as VNode[];
    expect(h1Node.type).toBe('h1');
    expect(h1Node.children).toEqual(['Hello, World!']);
    expect(pNode.type).toBe('p');
    expect(pNode.children).toEqual(['Welcome to testing.']);
  });

  // Dynamic Values Test: Checks that dynamic values (variables) are correctly inserted into the VNode tree.
  test('template should handle dynamic values', () => {
    const dynamicText = 'Dynamic Content';
    const vnode = template`
      <div>
        <span>${dynamicText}</span>
      </div>
    ` as VNode;

    const spanNode = (vnode.children as VNode[])[0];
    expect(spanNode.type).toBe('span');
    expect(spanNode.children).toEqual([dynamicText]);
  });

  // Component Inclusion Test: Ensures that components (which return VNodes) can be included within templates.
  test('template should handle components as dynamic values', () => {
    const ChildComponent = () => template`<p>Child Component</p>`;
    const vnode = template`
      <div>
        ${ChildComponent()}
      </div>
    ` as VNode;

    const childVNode = (vnode.children as VNode[])[0];
    expect(childVNode.type).toBe('p');
    expect(childVNode.children).toEqual(['Child Component']);
  });
});
