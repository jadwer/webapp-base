/**
 * POST /api/revalidate: revalidacion bajo demanda de la ficha publica y del
 * catalogo (P1 granel, decision D5). Lo llama el BACKEND tras cambios de
 * producto o de imagenes (StorefrontRevalidator), con
 * Authorization: Bearer <REVALIDATE_TOKEN>. Sin REVALIDATE_TOKEN responde 503.
 * La logica y la lista blanca de rutas y tags viven en @lwm/ecommerce/server;
 * este archivo es identico en apps/template y en cada tenant.
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { createRevalidateHandler } from '@lwm/ecommerce/server'

export const dynamic = 'force-dynamic'

export const POST = createRevalidateHandler({ revalidatePath, revalidateTag })
