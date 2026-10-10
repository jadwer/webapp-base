/**
 * Subruta @lwm/products/pricing: constantes del tipo de precio sin componentes
 * cliente. La usan codigo de servidor y el catalogo publico, que no deben
 * importar el barrel principal (trae componentes 'use client').
 */
export * from './utils/pricingType'
