import { template } from '../virtual-dom/template';
import { vNodeToDOM } from '../virtual-dom/vnode';
import { useEffectOnce } from '../virtual-dom/hooks';

let globalState = {
  data: null,
  loading: true,
  error: null as string | null,
};

const setState = (newState: Partial<typeof globalState>) => {
  globalState = { ...globalState, ...newState };
  renderMyComponent2(); // Re-render the component
};

const fetchData = async () => {
  console.log('Fetching data...');
  try {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts/1',
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    setState({ data: await response.json(), loading: false });
    console.log('Data fetched:', globalState.data);
  } catch (err) {
    setState({ error: (err as Error).message, loading: false });
    console.error('Fetch error:', globalState.error);
  }
};

const renderMyComponent2 = () => {
  const existingComponent = document.getElementById('my-component-2');
  const newVNode = MyComponent2();
  const newDOMNode = vNodeToDOM(newVNode);

  if (existingComponent) {
    existingComponent.replaceWith(newDOMNode); // Replace the existing component with the new content
  } else {
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(newDOMNode); // Initial render if not already present
    }
  }
};

const MyComponent2 = () => {
  const handleClick = () => {
    alert('booh');
  };

  // Use the custom hook to fetch data once when the component is loaded
  useEffectOnce(() => {
    fetchData();
  });

  if (globalState.loading) {
    return template`<div id="my-component-2"><p>Loading...</p></div>`;
  }

  if (globalState.error) {
    return template`<div id="my-component-2"><p>Error: ${globalState.error}</p></div>`;
  }

  return template`
    <div id="my-component-2">
      <p>yo</p>
      <button onClick=${handleClick}>click</button>
      <h2>Fetched Data:</h2>
      <pre>${JSON.stringify(globalState.data, null, 2)}</pre>
    </div>
  `;
};

export default MyComponent2;
