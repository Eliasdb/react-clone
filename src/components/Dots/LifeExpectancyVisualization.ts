// src/components/LifeExpectancyVisualization.ts

import { template } from '../../virtual-dom';
import { withProps } from '../../virtual-dom';
import DotsContainer from '../Dots/DotsContainer';
import ApproximationText from '../Dots/ApproximationText';

interface LifeExpectancyVisualizationProps {
  daysLeft: number;
  country: string;
  lifeExpectancy: number;
}

const LifeExpectancyVisualization = ({
  daysLeft,
  country,
  lifeExpectancy,
}: LifeExpectancyVisualizationProps) => {
  return template`
    <div class="visual-representation">
      <p>
        ${'You have ' + daysLeft + ' days left to live, based on the average life expectancy in ' + country + ' (' + lifeExpectancy + ' years).'}
      </p>
      
      <!-- Months lived section -->
      ${withProps(DotsContainer, {
        length: lifeExpectancy * 12,
        livedUnits: Math.floor(lifeExpectancy * 12 - daysLeft / 30.44),
        label: 'Months',
        dotClass: 'month-dot', // Specify class for month dots
        livedDotsColour: 'green-dot',
      })}
      ${withProps(ApproximationText, {
        value: Math.floor(daysLeft / 30.44),
        unit: 'months',
      })}

      <!-- Weeks lived section -->
      ${withProps(DotsContainer, {
        length: lifeExpectancy * 52,
        livedUnits: Math.floor(lifeExpectancy * 52 - daysLeft / 7),
        label: 'Weeks',
        dotClass: 'week-dot',
        livedDotsColour: 'blue-dot',
      })}
      ${withProps(ApproximationText, {
        value: Math.floor(daysLeft / 7),
        unit: 'weeks',
      })}
    </div>
  `;
};

export default LifeExpectancyVisualization;
