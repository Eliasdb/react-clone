// src/components/LifeExpectancyFormComponent.ts

import { useState } from '../virtual-dom/hooks';
import { template } from '../virtual-dom/template';
import { lifeExpectancyData } from '../data/data'; // Import the data

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
    const totalDays = fetchedLifeExpectancy * 365;
    const daysLived = currentAge * 365;
    setDaysLeft(totalDays - daysLived);
  };

  return template`
    <div class="life-expectancy-form">
      <form onSubmit=${handleSubmit}>
        <label>
          Enter your age:
          <input type="number" value=${age} placeholder="Age" onInput=${handleAgeInput} />
        </label>
        <label>
          Select your country:
          <select value=${country} onChange=${handleCountryChange}>
            <option value="">--Select a country--</option>
            ${Object.keys(lifeExpectancyData).map(
              (country) =>
                template`<option value="${country}">${country}</option>`,
            )}
          </select>
        </label>
        <button type="submit">Calculate</button>
      </form>
      ${
        daysLeft !== null && lifeExpectancy !== null
          ? template`
            <div class="visual-representation">
              <p>
                ${'You have ' + daysLeft + ' days left to live, based on the average life expectancy in ' + country + ' (' + lifeExpectancy + ' years).'}
              </p>
            
              <div class="dots-container">
                <p>Months Lived:</p>
                ${Array.from({ length: lifeExpectancy * 12 }).map(
                  (_, index) =>
                    template`<span class="dot ${index < Math.floor(lifeExpectancy * 12 - daysLeft / 30.44) ? 'lived' : ''}"></span>`,
                )}
              </div>
              <p>
                ${
                  'This is approximately ' +
                  Math.floor(daysLeft / 7) +
                  ' weeks left to live.'
                }
              </p></div>
       <div class="dots-container">
                <p>Weeks Lived:</p>
                ${Array.from({ length: lifeExpectancy * 52 }).map(
                  (_, index) =>
                    template`<span class="dot ${index < Math.floor(lifeExpectancy * 52 - daysLeft / 7) ? 'lived' : ''}"></span>`,
                )}
              </div>
            </div>
          `
          : ''
      }
      
      
    </div>
  `;
};

export default LifeExpectancyFormComponent;
