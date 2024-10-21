import { template } from '../../virtual-dom';

interface SelectComponentProps {
  country: string;
  handleCountryChange: (e: Event) => void;
  lifeExpectancyData: { [key: string]: number };
}

const Select = ({
  country,
  handleCountryChange,
  lifeExpectancyData,
}: SelectComponentProps) => {
  return template`
    <section class="input-field">
        <label>
          Select your country
        </label>
          <select value=${country} onChange=${handleCountryChange}>
            <option value="">---</option>
            ${Object.keys(lifeExpectancyData).map(
              (country) =>
                template`<option value="${country}">${country}</option>`,
            )}
          </select>
    </section>
  `;
};

export default Select;
