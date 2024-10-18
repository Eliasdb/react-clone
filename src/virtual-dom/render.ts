import { VNode } from './index';

// src/virtual-dom/index.ts
export interface Component {
  (props?: Record<string, any>): VNode; // Function that returns a VNode
}

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
  container: HTMLElement,
) {
  container.appendChild(document.createTextNode(String(value)));
}
function renderVNode(vnode: VNode, container: HTMLElement) {
  let domElement: HTMLElement;

  // Check if the vnode type is a component
  if (typeof vnode.type === 'function') {
    // Invoke the component function to get the child VNode
    const childVNode = (vnode.type as Component)(vnode.props);
    console.log('Rendering child VNode from component:', childVNode); // Log the child VNode

    // Create the DOM element based on the child VNode type
    domElement = document.createElement(childVNode.type);
    applyProps(childVNode.props, domElement);

    // Render the children of the child VNode
    childVNode.children.forEach((child) => renderChild(child, domElement));
  } else {
    // Regular element rendering
    domElement = document.createElement(vnode.type);
    applyProps(vnode.props, domElement);

    // Render the children of the current VNode
    vnode.children.forEach((child) => renderChild(child, domElement));
  }

  // Append the created element to the container
  container.appendChild(domElement);
  console.log('Appended VNode:', vnode); // Debugging line
}

function applyProps(props: Record<string, any>, domElement: HTMLElement) {
  if (props) {
    Object.keys(props).forEach((key) => {
      if (key.startsWith('on')) {
        const eventType = key.substring(2).toLowerCase();
        const eventHandler = props[key];

        // Ensure that eventHandler is a function
        if (typeof eventHandler === 'function') {
          domElement.addEventListener(eventType, eventHandler);
          console.log(`Event listener for ${eventType} attached.`);
        } else {
          console.error(
            `Event handler for ${eventType} is not a function: `,
            eventHandler,
          );
        }
      } else {
        // Only set attributes that are not event handlers
        domElement.setAttribute(key, props[key]);
      }
    });
  }
}

// Render a child node
function renderChild(
  child: VNode | string | number | boolean,
  container: HTMLElement,
) {
  if (isTextNode(child)) {
    renderTextNode(child, container);
  } else {
    renderVNode(child as VNode, container);
  }
}

export function render(
  vnodes: VNode | VNode[] | string | number | boolean,
  container: HTMLElement,
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
