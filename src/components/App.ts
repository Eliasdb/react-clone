// src/components/App.ts

import { template } from '../virtual-dom/template';
import LifeExpectancyFormComponent from './FormComponent';
import SelectComponent from './SelectComponent';
import MyComponent from './TestComponent';

const App = () => {
  console.log('rerender app');

  return template`
    <div class="test">
      <h1>How Long Do You Have Left?</h1>
       ${LifeExpectancyFormComponent}
    </div>
  `;
};

export default App;
