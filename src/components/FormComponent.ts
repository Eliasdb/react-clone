// src/components/FormComponent.ts

import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';

const FormComponent = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Form submitted with:', inputValue);
    setInputValue('');
  };

  return template`
    <form onSubmit=${handleSubmit}>
      <label>
        Enter something:
        <input type="text" value=${inputValue} placeholder="hi" onInput=${handleInput} />
      </label>
      <button type="submit">Submit</button>
    </form>
  `;
};

export default FormComponent;
