import { Product } from '../types/Product';

export function ProductList({ items }: { items: Product[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="border p-2 rounded">
          {item.name} - ${item.price}
        </li>
      ))}
    </ul>
  );
}
