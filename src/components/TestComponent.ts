// src/components/MyComponent.ts

import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';

interface MyComponentProps {
  initialCount?: number;
  label?: string;
}

const MyComponent = ({
  initialCount = 0,
  label = 'Count',
}: MyComponentProps) => {
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  const handleClick2 = () => {
    setCount((prev) => prev - 1);
  };
  console.log('MyComponent is rendering');

  return template`
    <div>
      <h2>${label}: ${count}</h2>
      <button onClick=${handleClick}>Increment</button>
      <button onClick=${handleClick2}>Decrement</button>
    </div>
  `;
};

export default MyComponent;
