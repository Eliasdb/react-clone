import './style.css';
import App from './components/App';
import { render } from './virtual-dom/renderer';

const root = document.getElementById('app');

if (root) {
  render(App(), root);
}
