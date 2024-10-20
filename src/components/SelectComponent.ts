// src/components/SelectComponent.ts
import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';

const SelectComponent = () => {
  // Initialize state to keep track of the selected option
  const [selectedOption, setSelectedOption] = useState('');
  console.log('SelectComponent rerendered');

  // Event handler for when the selection changes
  const handleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setSelectedOption(target.value);
    console.log('Selected Option:', target.value); // For testing purposes
  };

  return template`
    <div class="select-container">
      <label for="test-select">Choose an option:</label>
      <select id="test-select" value=${selectedOption} onChange=${handleChange}>
        <option value="">--Select an option--</option>
        <option value="Option1">Option 1</option>
        <option value="Option2">Option 2</option>
        <option value="Option3">Option 3</option>
      </select>
      <p>Currently Selected: ${selectedOption || 'None'}</p>
    </div>
  `;
};

export default SelectComponent;
