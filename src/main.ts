// src/index.ts
import App from './components/App'; // Import your App component
import './style.css';
import { render } from './virtual-dom/render'; // Import your render function

// Render the App component to the DOM
const root = document.getElementById('app');
if (root) {
  const appVNode = App(); // Get VNode from App
  console.log('Final App VNode:', appVNode); // Check the VNode before rendering
  render(appVNode, root); // Render the VNode to the DOM
}
