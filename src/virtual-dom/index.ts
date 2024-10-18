// src/virtual-dom/index.ts
export interface VNode {
    type: string; // The type of the HTML element (e.g., 'div', 'h1')
    props: Record<string, any>; // The attributes and properties of the element
    children: (VNode | string | number | boolean)[]; // Children can be other VNodes or primitive values
}

export function template(
    strings: TemplateStringsArray,
    ...values: any[]
): VNode[] {
    // Change return type to VNode[]
    const combinedString = combineStrings(strings, values).trim();
    const div = createDivFromHTML(combinedString);

    const result: VNode[] = []; // Change result to an array of VNodes
    processChildNodes(div.childNodes, result); // Populate the result directly with children

    return result; // Return the array of VNodes
}

// Utility function to create a VNode
function createVNode(type: string): VNode {
    return {
        type,
        props: {},
        children: [],
    };
}

// Utility function to combine string parts and values
function combineStrings(strings: TemplateStringsArray, values: any[]): string {
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
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
