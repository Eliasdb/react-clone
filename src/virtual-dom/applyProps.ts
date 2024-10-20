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

function updateInputValue(domElement: HTMLInputElement, value: any): void {
  if (domElement.value !== value) {
    domElement.value = value;
  }
}

export function applyProps(
  domElement: HTMLElement,
  props: Record<string, any>,
): void {
  let listeners = eventListenersMap.get(domElement) || {};
  eventListenersMap.set(domElement, listeners);

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      handleEventListeners(domElement, key, value, listeners);
    } else if (key === 'value' && domElement instanceof HTMLInputElement) {
      updateInputValue(domElement, value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(domElement.style, value);
    } else {
      updateAttribute(domElement, key, value);
    }
  });
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
