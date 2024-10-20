// src/components/App.ts

import { template } from '../virtual-dom/template';
import FormComponent from './FormComponent';
import MyComponent from './TestComponent';

const App = () => {
  console.log('rerender app');

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
      ${FormComponent}
    </div>
  `;
};

export default App;
