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

export function applyProps(
  domElement: HTMLElement,
  props: Record<string, any>,
): void {
  // Retrieve existing listeners or initialize an empty record
  let listeners = eventListenersMap.get(domElement);
  if (!listeners) {
    listeners = {};
    eventListenersMap.set(domElement, listeners);
  }

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      // Extract the event type from the prop key (e.g., 'onClick' -> 'click')
      const eventTypeKey = key.substring(2).toLowerCase();
      const mappedEventType = eventMap[eventTypeKey];

      if (mappedEventType) {
        // Remove existing listener if present
        if (listeners[mappedEventType]) {
          domElement.removeEventListener(
            mappedEventType,
            listeners[mappedEventType]!,
          );
          console.log(`Removed existing listener for ${mappedEventType}`);
        }

        // Add the new event listener
        domElement.addEventListener(mappedEventType, value as EventListener);
        console.log(`Added listener for ${mappedEventType}`);

        // Update the listeners record
        listeners[mappedEventType] = value as EventListener;
      } else {
        console.warn(`Unsupported event type: ${eventTypeKey}`);
      }
    } else if (key === 'value' && domElement instanceof HTMLInputElement) {
      if (domElement.value !== value) {
        domElement.value = value;
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(domElement.style, value);
    } else if (typeof value === 'boolean') {
      if (value) {
        domElement.setAttribute(key, '');
      } else {
        domElement.removeAttribute(key);
      }
    } else {
      domElement.setAttribute(key, String(value));
    }
  });

  // No need to set again as 'listeners' is already in the WeakMap
}
