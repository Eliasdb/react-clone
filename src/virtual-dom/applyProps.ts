// src/virtual-dom/applyProps.ts

const eventMap: Record<string, keyof HTMLElementEventMap> = {
  click: 'click',
  input: 'input',
  submit: 'submit',
  change: 'change',
  focus: 'focus',
  blur: 'blur',
  keydown: 'keydown',
  keyup: 'keyup',
  mouseover: 'mouseover',
  mouseout: 'mouseout',
  // Add more events as needed
};

const eventListenersMap = new WeakMap<
  HTMLElement,
  Partial<Record<keyof HTMLElementEventMap, EventListener>>
>();

// src/virtual-dom/applyProps.ts

export function applyProps(
  domElement: HTMLElement,
  props: Record<string, any>,
): void {
  let listeners = eventListenersMap.get(domElement) || {};
  eventListenersMap.set(domElement, listeners);

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      console.log(
        `Adding/updating event listener '${key}' on ${domElement.tagName}`,
      );
      handleEventListeners(domElement, key, value, listeners);
    } else if (key === 'value' && domElement instanceof HTMLInputElement) {
      console.log(`Updating 'value' of <input> to '${value}'`);
      updateInputValue(domElement, value);
    } else if (key === 'style' && typeof value === 'object') {
      console.log(
        `Applying styles to ${domElement.tagName}: ${JSON.stringify(value)}`,
      );
      Object.assign(domElement.style, value);
    } else {
      console.log(
        `Setting attribute '${key}' to '${value}' on ${domElement.tagName}`,
      );
      updateAttribute(domElement, key, value);
    }
  });
}

function updateInputValue(domElement: HTMLInputElement, value: any): void {
  if (domElement.value !== value) {
    domElement.value = value;
  }
}

function handleEventListeners(
  domElement: HTMLElement,
  key: string,
  value: EventListener,
  listeners: Partial<Record<keyof HTMLElementEventMap, EventListener>>,
): void {
  const eventTypeKey = key.substring(2).toLowerCase();
  const mappedEventType = eventMap[eventTypeKey];

  if (!mappedEventType) {
    console.warn(`Unsupported event type: ${eventTypeKey}`);
    return;
  }

  // Remove the old event listener, if one exists
  if (listeners[mappedEventType]) {
    domElement.removeEventListener(
      mappedEventType,
      listeners[mappedEventType]!,
    );
  }

  // Add the new event listener and update the listeners record
  domElement.addEventListener(mappedEventType, value);
  listeners[mappedEventType] = value;
}

function updateAttribute(
  domElement: HTMLElement,
  key: string,
  value: any,
): void {
  if (typeof value === 'boolean') {
    value ? domElement.setAttribute(key, '') : domElement.removeAttribute(key);
  } else {
    domElement.setAttribute(key, String(value));
  }
}
