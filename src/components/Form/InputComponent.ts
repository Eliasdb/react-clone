import { template } from '../../virtual-dom';

interface InputProps {
  age: number;
  handleAgeInput: (e: Event) => void;
}

const Input = ({ age, handleAgeInput }: InputProps) => {
  return template`
    <section class="input-field">
      <label>Enter your age</label>
      <input type="number" value=${age} placeholder="Age" onInput=${handleAgeInput} />
    </section>
  `;
};

export default Input;
