// src/components/MyComponent.ts

import { template } from '../virtual-dom/template';

interface MyComponentProps {
  count: number;
}

const MyComponent = ({ count }: MyComponentProps) => {
  return template`
    <div>
      <h2>Count from App: ${count}</h2>
    </div>
  `;
};

export default MyComponent;
