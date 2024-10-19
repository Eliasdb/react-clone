// src/virtual-dom/__tests__/renderer.test.ts

/**
 * @jest-environment jsdom
 */

import { VNode } from '../vnode';
import { render } from '../renderer';

describe('Renderer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  test('render should create DOM elements from VNodes', () => {
    const vnode: VNode = {
      type: 'div',
      props: { id: 'root' },
      children: [
        {
          type: 'h1',
          props: {},
          children: ['Test Heading'],
        },
        {
          type: 'p',
          props: {},
          children: ['Test paragraph.'],
        },
      ],
    };

    render(vnode, container);

    expect(container.innerHTML).toBe(
      '<div id="root"><h1>Test Heading</h1><p>Test paragraph.</p></div>',
    );
  });

  test('render should attach event listeners', () => {
    const handleClick = jest.fn();

    const vnode: VNode = {
      type: 'button',
      props: { onClick: handleClick },
      children: ['Click me'],
    };

    render(vnode, container);

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    // Simulate click event
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
