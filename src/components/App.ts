import { template } from '../virtual-dom';
import FormContainer from './Form/FormContainer';
import IntroText from './IntroText';

const App = () => {
  return template`
    <main class="test">
      ${IntroText}
      ${FormContainer}
    </main>
  `;
};

export default App;
