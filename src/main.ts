import App from './components/App';
import './style.css';

import { render } from './virtual-dom';

const root = document.getElementById('app');

if (root) {
  const appVNode = App();
  render(appVNode, root);
}
