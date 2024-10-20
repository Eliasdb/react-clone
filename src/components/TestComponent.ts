// src/components/TestComponent.ts

import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';

const MyComponent = () => {
  const [count, setCount] = useState(10);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  const handleClick2 = () => {
    setCount((prev) => prev - 1);
  };

  console.log('rerender MyComponent', count);

  return template`
    <div>
      <h2>Counter: ${count}</h2>
      <button onClick=${handleClick}>Increment</button>
      <button onClick=${handleClick2}>Decrement</button>
    </div>
  `;
};

export default MyComponent;
