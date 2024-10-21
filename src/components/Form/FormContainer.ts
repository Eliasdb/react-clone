import { template } from '../../virtual-dom';
import { useState } from '../../virtual-dom';
import { withProps } from '../../virtual-dom';

import InputField from './InputField';
import Select from './Select';
import LifeExpectancyVisualization from '../Dots/LifeExpectancyVisualization';

import { lifeExpectancyData } from '../../data/data';

const FormContainer = () => {
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  const handleAgeInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setAge(target.value);
  };

  const handleCountryChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setCountry(target.value);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!country) {
      alert('Please select a country.');
      return;
    }
    if (!age || isNaN(parseInt(age, 10))) {
      alert('Please enter a valid age.');
      return;
    }

    const fetchedLifeExpectancy = lifeExpectancyData[country];
    setLifeExpectancy(fetchedLifeExpectancy);

    const currentAge = parseInt(age, 10);

    const totalDays = fetchedLifeExpectancy * 365.25;
    const daysLived = currentAge * 365.25;
    const remainingDays = totalDays - daysLived;

    setDaysLeft(Math.floor(remainingDays));
  };

  const inputProps = {
    age,
    handleAgeInput,
  };

  const selectProps = {
    country,
    handleCountryChange,
    lifeExpectancyData,
  };

  return template`
    <section>
      <section class="life-expectancy-form">
        <form onSubmit=${handleSubmit}>
          <section class="input-fields">
            ${withProps(InputField, inputProps)}
            ${withProps(Select, selectProps)}
            <button type="submit">Calculate</button>
          </section>
        </form>
      </section>
      <div>
        ${
          daysLeft !== null && lifeExpectancy !== null
            ? withProps(LifeExpectancyVisualization, {
                daysLeft,
                country,
                lifeExpectancy,
              })
            : ''
        }
      </div>
    </section>
  `;
};

export default FormContainer;
