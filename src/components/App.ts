// src/components/App.ts

import { template } from '../virtual-dom/template';
import MyComponent from './TestComponent';

const App = () => {
  console.log('App component is rendering');

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
 

      ${MyComponent()}
    </div>
  `;
};

export default App;
