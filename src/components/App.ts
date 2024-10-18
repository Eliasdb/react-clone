import { template } from '../virtual-dom';
import MyComponent from './TestComponent';

const App = () => {
  const handleClick = () => {
    alert('yo');
  };
  return template`
    <div>
      <h1>Welcome to My App!</h1>
      <button onClick=${handleClick}>click</button>
      ${MyComponent()}  <!-- Insert the VNode here -->
    </div>
  `;
};

export default App;
