// src/virtual-dom/render.ts
import { VNode } from './index';

function isTextNode(value: any): value is string | number | boolean {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    );
}

export function render(
    vnode: VNode | string | number | boolean,
    container: HTMLElement
) {
    if (isTextNode(vnode)) {
        // Handle text nodes
        container.appendChild(document.createTextNode(String(vnode)));
        return; // Stop recursion
    }

    // Create a DOM element for the VNode
    const domElement = document.createElement(vnode.type);

    // Apply props
    if (vnode.props) {
        Object.keys(vnode.props).forEach((key) => {
            // Handle event listeners
            if (key.startsWith('on')) {
                const eventType = key.substring(2).toLowerCase();
                domElement.addEventListener(eventType, vnode.props[key]);
            } else {
                domElement.setAttribute(key, vnode.props[key]);
            }
        });
    }

    // Recursive step: render each child
    vnode.children.forEach((child) => render(child, domElement));

    // Append the constructed DOM element to the container
    container.appendChild(domElement);
}
