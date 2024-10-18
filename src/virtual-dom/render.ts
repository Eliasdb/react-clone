import { VNode } from './index';

// Type guard to check if a value is a text node
function isTextNode(value: any): value is string | number | boolean {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    );
}

// Render a text node
function renderTextNode(
    value: string | number | boolean,
    container: HTMLElement
) {
    container.appendChild(document.createTextNode(String(value)));
}

// Render a VNode and its children
function renderVNode(vnode: VNode, container: HTMLElement) {
    const domElement = document.createElement(vnode.type);
    applyProps(vnode.props, domElement);
    vnode.children.forEach((child) => renderChild(child, domElement));
    container.appendChild(domElement);
}

function applyProps(props: Record<string, any>, domElement: HTMLElement) {
    if (props) {
        Object.keys(props).forEach((key) => {
            // Ignore lowercase 'onclick' or any other case issues
            if (key.startsWith('on') && key !== 'onclick') {
                const eventType = key.substring(2).toLowerCase();
                const eventHandler = props[key];

                if (typeof eventHandler === 'function') {
                    domElement.addEventListener(eventType, eventHandler);
                    console.log(`Event listener for ${eventType} attached.`);
                } else {
                    console.error(
                        `Event handler for ${eventType} is not a function: `,
                        eventHandler
                    );
                }
            } else {
                domElement.setAttribute(key, props[key]);
            }
        });
    }
}

// Render a child node
function renderChild(
    child: VNode | string | number | boolean,
    container: HTMLElement
) {
    if (isTextNode(child)) {
        renderTextNode(child, container);
    } else {
        renderVNode(child as VNode, container);
    }
}

// Main render function
export function render(
    vnodes: VNode | VNode[] | string | number | boolean,
    container: HTMLElement
) {
    if (isTextNode(vnodes)) {
        renderTextNode(vnodes, container);
        return;
    }

    if (Array.isArray(vnodes)) {
        vnodes.forEach((vnode) => renderChild(vnode, container));
        return;
    }

    renderVNode(vnodes as VNode, container);
}
