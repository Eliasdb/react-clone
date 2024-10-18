import { template } from './index';
import { render } from './render';

describe('Virtual DOM', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Set up a DOM element to render into
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
    });

    test('renders a simple text node', () => {
        const vnode = template`Hello, World!`;
        render(vnode, container);

        expect(container.textContent).toBe('Hello, World!');
    });

    test('renders a single element with children', () => {
        const vnode = template`
            <div>
                <h1>Title</h1>
                <p>Paragraph</p>
            </div>
        `;
        render(vnode, container);

        expect(container.querySelector('h1')?.textContent).toBe('Title');
        expect(container.querySelector('p')?.textContent).toBe('Paragraph');
    });

    test('renders an element with an event listener', () => {
        const handleClick = jest.fn();
        const vnode = template`
            <button onClick=${handleClick}>Click Me</button>
        `;
        render(vnode, container);

        const button = container.querySelector('button');
        button?.dispatchEvent(new Event('click'));

        expect(handleClick).toHaveBeenCalled();
    });

    test('renders multiple elements without an extra div', () => {
        const vnode = template`
            <h1>Header</h1>
            <p>Paragraph</p>
        `;
        render(vnode, container);

        expect(container.children.length).toBe(2); // Should be 2 children: h1 and p
        expect(container.querySelector('h1')?.textContent).toBe('Header');
        expect(container.querySelector('p')?.textContent).toBe('Paragraph');
    });
});
