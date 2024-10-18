// src/components/App.tsx
import { template } from '../virtual-dom';

const App = () => {
    const handleClick = () => {
        alert('Button clicked!');
    };

    return template`
    <div>
        <h1>Welcome to My React-like Library!</h1>
        <p>This is a paragraph.</p>
        <button onClick=${handleClick}>Click Me!</button>
    </div>`;
};

export default App;
