import { ProductList } from '../components/ProductList.html';
import { useInventory } from '../hooks/useInventory';

export default function InventoryPageTemplate() {
  const { products, isLoading } = useInventory();
  if (isLoading) return <div>Cargando...</div>;
  return <ProductList products={products || []} />;
}
