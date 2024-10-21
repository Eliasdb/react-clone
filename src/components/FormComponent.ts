import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';
import { lifeExpectancyData } from '../data/data'; // Import the data
import Input from './InputComponent';
import { withProps } from '../virtual-dom/helpers';
import SelectComponent from './SelectComponent';
import DotsContainer from './DotsContainer';

const LifeExpectancyFormComponent = () => {
  console.log('rerender');
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

    // Use 365.25 to account for leap years, without rounding here
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
          ${withProps(Input, inputProps)}
          ${withProps(SelectComponent, selectProps)}
          <button type="submit">Calculate</button>
        </section>
      </form>
    </section>
    <div>
      ${
        daysLeft !== null && lifeExpectancy !== null
          ? template`
            <div class="visual-representation">
              <p>
                ${'You have ' + daysLeft + ' days left to live, based on the average life expectancy in ' + country + ' (' + lifeExpectancy + ' years).'}
              </p>
              
              <!-- Months lived section -->
              ${withProps(DotsContainer, {
                length: lifeExpectancy * 12,
                livedUnits: Math.floor(lifeExpectancy * 12 - daysLeft / 30.44),
                label: 'Months ',
                dotClass: 'month-dot', // Specify class for month dots
                livedDotsColour: 'green-dot',
              })}
              <p>
                ${'This is approximately ' + Math.floor(daysLeft / 30.44) + ' months left to live.'}
              </p>

              <!-- Weeks lived section -->
              ${withProps(DotsContainer, {
                length: lifeExpectancy * 52,
                livedUnits: Math.floor(lifeExpectancy * 52 - daysLeft / 7),
                label: 'Weeks ',
                dotClass: 'week-dot',
                livedDotsColour: 'blue-dot',
              })}
                
              <p>
                ${'This is approximately ' + Math.floor(daysLeft / 7) + ' weeks left to live.'}
              </p>
            </div>
          `
          : ''
      }
    </div>
  </section>
`;
};

export default LifeExpectancyFormComponent;
