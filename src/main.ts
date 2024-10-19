import './style.css';
import App from './components/App';
import { render } from './virtual-dom/renderer';
import { setRoot } from './virtual-dom/scheduler';

const root = document.getElementById('app');

if (root) {
  setRoot(App, root);
  render(App, root);
}
