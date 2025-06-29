import { Product } from '../types/Product';

export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name} - {product.stock} units</li>
      ))}
    </ul>
  );
}
