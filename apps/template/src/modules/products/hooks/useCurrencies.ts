'use client'

import useSWR from 'swr'
import axios from '@/lib/axiosClient'
import type { ProductCurrency } from '../types'

interface CurrencyJsonApiResource {
  id: string
  type: string
  attributes: {
    code: string
    name: string
    symbol: string
    exchangeRate: number
    isActive: boolean
    isDefault: boolean
  }
}

interface CurrenciesApiResponse {
  data: CurrencyJsonApiResource[]
}

function transformCurrency(resource: CurrencyJsonApiResource): ProductCurrency {
  return {
    id: resource.id,
    code: resource.attributes.code,
    name: resource.attributes.name,
    symbol: resource.attributes.symbol,
  }
}

async function fetchActiveCurrencies(): Promise<{ currencies: ProductCurrency[]; defaultId: string | null }> {
  const response = await axios.get('/api/v1/currencies', {
    params: {
      'filter[isActive]': true,
      sort: 'code',
    },
  })

  const apiResponse = response.data as CurrenciesApiResponse
  const currencies = apiResponse.data.map(transformCurrency)

  const defaultResource = apiResponse.data.find((r) => r.attributes.isDefault)
  const defaultId = defaultResource ? defaultResource.id : null

  return { currencies, defaultId }
}

export function useCurrencies() {
  const { data, error, isLoading } = useSWR(
    'currencies-active',
    fetchActiveCurrencies,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    currencies: data?.currencies || [],
    defaultCurrencyId: data?.defaultId || null,
    isLoading,
    error,
  }
}
