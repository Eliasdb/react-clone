// src/components/ApproximationText.ts

import { template } from '../../virtual-dom';

interface ApproximationTextProps {
  value: number;
  unit: string;
}

const ApproximationText = ({ value, unit }: ApproximationTextProps) => {
  return template`<p>${'This is approximately ' + value + ' ' + unit + ' left to live.'}</p>`;
};

export default ApproximationText;
