// src/components/App.ts

import { withProps } from '../virtual-dom/helpers';
import { template } from '../virtual-dom/template';
import FormComponent from './FormComponent';
import MyComponent from './TestComponent';

const myComponentProps = {
  initialCount: 10, // Example prop
  label: 'Counter', // Another example prop
};

const App = () => {
  console.log('App component is rendering');

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
         ${withProps(MyComponent, myComponentProps)} 
        ${FormComponent} 

    </div>
  `;
};

export default App;
