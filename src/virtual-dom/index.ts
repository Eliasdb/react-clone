// src/virtual-dom/index.ts
export interface VNode {
    type: string; // The type of the HTML element (e.g., 'div', 'h1')
    props: Record<string, any>; // The attributes and properties of the element
    children: (VNode | string | number | boolean)[]; // Children can be other VNodes or primitive values
}

export function template(
    strings: TemplateStringsArray,
    ...values: any[]
): VNode | VNode[] {
    // Create a temporary div to process the child nodes
    const combinedString = combineStringsAndValues(strings, values);
    const div = createDivFromHTML(combinedString);

    const result: VNode[] = []; // Array to hold multiple VNodes

    // Process the child nodes of the div
    processChildNodes(div.childNodes, result);

    // Attach non-string values (e.g., functions for event handlers) to the VNode's props
    attachPropsToVNode(result[0], values); // Attach props to the first VNode if exists

    // If there's only one VNode, return it directly; otherwise, return the array
    return result.length === 1 ? result[0] : result;
}

// Combine strings and values, but keep non-string values intact
function combineStringsAndValues(
    strings: TemplateStringsArray,
    values: any[]
): string {
    return strings.reduce(
        (acc, str, i) =>
            acc + str + (typeof values[i] === 'string' ? values[i] : ''),
        ''
    );
}

// Attach non-string values (e.g., event handlers) to the VNode props
function attachPropsToVNode(vnode: VNode, values: any[]) {
    values.forEach((value) => {
        if (typeof value === 'function') {
            vnode.props['onClick'] = value; // Attach event handler to props
            console.log('Attached event handler:', value); // Add this line
        }
    });
}

// Utility function to create a VNode
function createVNode(type: string): VNode {
    return {
        type,
        props: {},
        children: [],
    };
}

// Create a div element from an HTML string
function createDivFromHTML(html: string): HTMLDivElement {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

// Process child nodes and populate the parent VNode's children
function processChildNodes(
    childNodes: NodeListOf<ChildNode>,
    children: any[]
): void {
    Array.from(childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            addTextNode(node, children);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            addElementNode(node as HTMLElement, children);
        }
    });
}

// Add text nodes to the children array
function addTextNode(node: ChildNode, children: any[]): void {
    const textContent = node.textContent?.trim();
    if (textContent) {
        children.push(textContent); // Add text nodes to the result
    }
}

// Add element nodes to the children array
function addElementNode(element: HTMLElement, children: any[]): void {
    const childVNode = createVNode(element.tagName.toLowerCase());
    addElementAttributes(element, childVNode);
    processChildNodes(element.childNodes, childVNode.children);
    children.push(childVNode); // Add the child VNode to the children array
}

// Add attributes of an element to the VNode
function addElementAttributes(element: HTMLElement, vNode: VNode): void {
    Array.from(element.attributes).forEach((attr) => {
        vNode.props[attr.name] = attr.value;
    });
}
