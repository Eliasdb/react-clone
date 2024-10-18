// src/index.ts
import App from './components/App'; // Import your App component
import './style.css';
import { render } from './virtual-dom/render'; // Import your render function

// Render the App component to the DOM
const root = document.getElementById('app');
if (root) {
    render(App(), root); // Use your render function with the App component
}
