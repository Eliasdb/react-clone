// src/components/App.ts

import { template } from '../virtual-dom/template';
import LifeExpectancyFormComponent from './FormComponent';

const App = () => {
  console.log('rerender app');

  return template`
    <div class="test">
      <h1>How Long Do You Have Left?</h1>
       <p>Let's find out...</p>
       ${LifeExpectancyFormComponent}
    </div>
  `;
};

export default App;
