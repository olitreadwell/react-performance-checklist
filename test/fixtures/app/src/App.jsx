import { memo, useState } from "react";

const Row = memo(({ onClick }) => <button onClick={onClick}>bump</button>);

export default function App() {
  const [items, setItems] = useState([{ id: "a" }, { id: "b" }]);
  return (
    <section>
      <h1>List</h1>
      <img src="hero.jpg" alt="hero" />
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Row onClick={() => setItems(items)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
