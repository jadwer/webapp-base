// Design System Components (includes Button, Input, and all base components)
export * from './components/base';

// Module-specific Components
export * from './components/products';
// @lwm/ui tambien exporta un StatusBadge (patrones); aqui se conserva el de productos
export { StatusBadge } from './components/products';

// Hooks
export * from './hooks';

// Navigation with progress  
export { default as NavigationProgress } from './components/NavigationProgress';
