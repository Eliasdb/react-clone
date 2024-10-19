// src/components/App.ts

import { template } from '../virtual-dom/template';
import MyComponent from './TestComponent';
import { useState } from '../virtual-dom/hooks';

const App = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  const handleClick2 = () => {
    setCount((prev) => prev - 1);
  };

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
      <p>Count: ${count}</p>
      <button onClick=${handleClick}>Increment</button>
       <button onClick=${handleClick2}>Decrement</button>

      ${MyComponent({ count })}
    </div>
  `;
};

export default App;
