import { template } from '../virtual-dom';
import MyComponent from './TestComponent';

const App = () => {
  const handleClick = () => {
    alert('yo');
  };

  const handleClick2 = () => {
    alert('yo2');
  };

  return template`
    <div class="test">
      <h1>Welcome to My App!</h1>
      <button onClick=${handleClick}>click</button>
      <button onClick=${handleClick2}>click</button>

      ${MyComponent()}  <!-- Insert the VNode here -->
    </div>
  `;
};

export default App;
