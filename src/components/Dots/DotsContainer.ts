import { template } from '../../virtual-dom';

interface DotsContainerProps {
  length: number;
  livedUnits: number;
  label: string;
  dotClass: string;
  livedDotsColour: string;
}

const DotsContainer = ({
  length,
  livedUnits,
  label,
  dotClass,
  livedDotsColour,
}: DotsContainerProps) => {
  return template`
    <div class="dots-container">
      <p>${label} Lived:</p>
      <section class="dots-container">
        ${Array.from({ length }).map(
          (_, index) =>
            template`<span class="dot ${dotClass} ${index < livedUnits ? `lived ${livedDotsColour}` : ''}"></span>`,
        )}
      </section>
    </div>
  `;
};

export default DotsContainer;
