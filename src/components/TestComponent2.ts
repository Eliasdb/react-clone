// src/components/MyComponent.ts

import { template } from '../virtual-dom/template';

const MyComponent2 = () => {
  const handleClick = () => {
    alert('booh');
  };

  return template`
    <div>
     <p>yo</p>
      <button onClick=${handleClick}>click</button>
    </div>
  `;
};

export default MyComponent2;
