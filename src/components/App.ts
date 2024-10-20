// src/components/App.ts

import { template } from '../virtual-dom/template';
import FormComponent from './FormComponent';
import SelectComponent from './SelectComponent';
import MyComponent from './TestComponent';

const App = () => {
  console.log('rerender app');

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
 
      ${SelectComponent}

    </div>
  `;
};

export default App;
