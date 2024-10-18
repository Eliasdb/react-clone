import { template } from '../virtual-dom';

const MyComponent = () => {
  return template`
        <div>
            <h2>Hello from MyComponent!</h2>
        </div>
    `;
};

export default MyComponent;
