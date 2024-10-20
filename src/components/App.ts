// src/components/App.ts

import { withProps } from '../virtual-dom/helpers';
import { template } from '../virtual-dom/template';
import FormComponent from './FormComponent';
import MyComponent from './TestComponent';
import MyComponent2 from './TestComponent2';

const App = () => {
  console.log('rerender app');

  return template`
<div class="test">
  <h1>Welcome to My App!</h1>
    ${MyComponent}

  ${FormComponent}
</div>
`;
};

export default App;
