// src/components/MyComponent.ts

import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  const handleClick2 = () => {
    setCount((prev) => prev - 1);
  };
  console.log('MyComponent is rendering');

  return template`
    <div>
      <h2>Count from App: ${count}</h2>
      <button onClick=${handleClick}>click</button>
            <button onClick=${handleClick2}>click</button>

    </div>
  `;
};

export default MyComponent;
