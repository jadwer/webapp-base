import { Product } from '../types/Product';

<<<<<<< HEAD
export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name} - {product.stock} units</li>
=======
export function ProductList({ items }: { items: Product[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="border p-2 rounded">
          {item.name} - ${item.price}
        </li>
>>>>>>> codex
      ))}
    </ul>
  );
}
