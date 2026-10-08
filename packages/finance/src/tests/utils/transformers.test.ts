/**
 * Payloads JSON:API que finanzas envia al backend.
 * Fuente de verdad: Modules/Finance/app/JsonApi/V1/*Schema.php y *Request.php.
 */

import { describe, it, expect } from 'vitest'
import {
  transformAPInvoiceToAPI,
  transformAPInvoiceUpdateToAPI,
  transformARInvoiceToAPI,
  transformARInvoiceUpdateToAPI,
  transformPaymentToAPI,
  transformPaymentUpdateToAPI,
  transformAPPaymentToAPI,
  transformARReceiptToAPI,
  transformBankAccountToAPI,
  transformBankAccountUpdateToAPI,
  transformBankAccountFromAPI,
  transformPaymentApplicationToAPI,
  transformPaymentApplicationUpdateToAPI,
  transformPaymentApplicationFromAPI,
  transformBankTransactionToAPI,
  transformBankTransactionUpdateToAPI,
  transformAPPaymentFromAPI,
} from '../../utils/transformers'
import { isInvoiceOpen, isInvoiceOverdue, INVOICE_STATUS_FILTER_OPTIONS } from '../../utils/invoiceStatus'
import { getFinanceErrorMessage } from '../../utils/errors'
import { INVOICE_STATUSES, PAYMENT_STATUSES } from '../../types'

describe('Finance transformers ToAPI', () => {
  it('AP invoice: tipo ap-invoices, camelCase y sin llaves que no son atributo', () => {
    const payload = transformAPInvoiceToAPI({
      contactId: '7' as unknown as number,
      invoiceNumber: 'FP-1',
      invoiceDate: '2026-10-01',
      dueDate: '2026-10-31',
      subtotal: '100' as unknown as number,
      taxAmount: 16,
      totalAmount: 116,
      status: 'pending',
      notes: 'nota',
      ...({ paidDate: '2026-10-02', contactName: 'Proveedor' } as object),
    })

    expect(payload).toEqual({
      data: {
        type: 'ap-invoices',
        attributes: {
          invoiceNumber: 'FP-1',
          invoiceDate: '2026-10-01',
          dueDate: '2026-10-31',
          contactId: 7,
          purchaseOrderId: null,
          currency: 'MXN',
          subtotal: 100,
          taxAmount: 16,
          totalAmount: 116,
          status: 'pending',
          notes: 'nota',
        },
      },
    })
  })

  it('AR invoice: tipo ar-invoices e incluye campos de descuento cuando vienen', () => {
    const payload = transformARInvoiceToAPI({
      contactId: 3,
      invoiceNumber: 'FC-1',
      invoiceDate: '2026-10-01',
      dueDate: '2026-10-31',
      subtotal: 200,
      taxAmount: 32,
      totalAmount: 232,
      status: 'draft',
      discountPercent: 2,
      discountDays: 10,
    })

    expect(payload).toEqual({
      data: {
        type: 'ar-invoices',
        attributes: {
          invoiceNumber: 'FC-1',
          invoiceDate: '2026-10-01',
          dueDate: '2026-10-31',
          contactId: 3,
          salesOrderId: null,
          currency: 'MXN',
          subtotal: 200,
          taxAmount: 32,
          totalAmount: 232,
          status: 'draft',
          discountPercent: 2,
          discountDays: 10,
        },
      },
    })
  })

  it('updates de facturas mandan id y solo atributos presentes', () => {
    expect(transformAPInvoiceUpdateToAPI('5', { status: 'posted' })).toEqual({
      data: { type: 'ap-invoices', id: '5', attributes: { status: 'posted' } },
    })
    expect(transformARInvoiceUpdateToAPI('6', { totalAmount: '50.5' as unknown as number })).toEqual({
      data: { type: 'ar-invoices', id: '6', attributes: { totalAmount: 50.5 } },
    })
  })

  it('pagos AP y cobros AR van al recurso payments con numeros como number', () => {
    const form = {
      paymentNumber: 'PAG-1',
      paymentDate: '2026-10-08',
      contactId: '4' as unknown as number,
      bankAccountId: '2' as unknown as number,
      paymentMethodId: '1' as unknown as number,
      amount: '0.50' as unknown as number,
    }
    const expected = {
      data: {
        type: 'payments',
        attributes: {
          paymentNumber: 'PAG-1',
          paymentDate: '2026-10-08',
          contactId: 4,
          bankAccountId: 2,
          paymentMethodId: 1,
          amount: 0.5,
          currency: 'MXN',
          appliedAmount: 0,
          unappliedAmount: 0.5,
          status: 'unapplied',
        },
      },
    }
    expect(transformPaymentToAPI(form)).toEqual(expected)
    expect(transformAPPaymentToAPI(form)).toEqual(expected)
    expect(transformARReceiptToAPI(form)).toEqual(expected)

    const attrs = transformPaymentToAPI(form).data.attributes
    expect(attrs).not.toHaveProperty('paymentMethod')
    expect(attrs).not.toHaveProperty('receiptDate')
    expect(attrs).not.toHaveProperty('apInvoiceId')
  })

  it('pago sin folio no manda paymentNumber (lo genera el backend)', () => {
    const base = { paymentDate: '2026-10-08', contactId: 4, bankAccountId: 2, paymentMethodId: 1, amount: 10 }
    expect(transformPaymentToAPI(base).data.attributes).not.toHaveProperty('paymentNumber')
    expect(transformPaymentToAPI({ ...base, paymentNumber: '   ' }).data.attributes).not.toHaveProperty('paymentNumber')
    expect(transformPaymentToAPI({ ...base, paymentNumber: ' PAG-9 ' }).data.attributes.paymentNumber).toBe('PAG-9')
  })

  it('update de pago descarta llaves legadas', () => {
    expect(transformPaymentUpdateToAPI('9', {
      status: 'voided',
      ...({ receiptDate: '2026-01-01', paymentMethod: 'transfer' } as object),
    })).toEqual({
      data: { type: 'payments', id: '9', attributes: { status: 'voided' } },
    })
  })

  it('cuenta bancaria: sin accountType ni clabe y openingBalance numerico', () => {
    const payload = transformBankAccountToAPI({
      accountName: 'Operativa',
      accountNumber: '0123',
      bankName: 'BBVA',
      currency: 'MXN',
      glAccountId: '11' as unknown as number,
      openingBalance: '1500.25' as unknown as number,
      ...({ accountType: 'checking', clabe: '012180001234567890' } as object),
    })

    expect(payload).toEqual({
      data: {
        type: 'bank-accounts',
        attributes: {
          accountNumber: '0123',
          accountName: 'Operativa',
          bankName: 'BBVA',
          currency: 'MXN',
          glAccountId: 11,
          openingBalance: 1500.25,
        },
      },
    })
    expect(transformBankAccountUpdateToAPI('2', { isActive: false })).toEqual({
      data: { type: 'bank-accounts', id: '2', attributes: { isActive: false } },
    })
  })

  it('aplicacion de pago: amount y arInvoiceId, nunca apInvoiceId ni appliedAmount', () => {
    expect(transformPaymentApplicationToAPI({
      paymentId: 1,
      arInvoiceId: 2,
      amount: '300' as unknown as number,
      applicationDate: '2026-10-08',
    })).toEqual({
      data: {
        type: 'payment-applications',
        attributes: { paymentId: 1, arInvoiceId: 2, amount: 300, applicationDate: '2026-10-08' },
      },
    })
    expect(transformPaymentApplicationUpdateToAPI('3', { notes: 'x' })).toEqual({
      data: { type: 'payment-applications', id: '3', attributes: { notes: 'x' } },
    })
  })

  it('transaccion bancaria en camelCase', () => {
    expect(transformBankTransactionToAPI({
      bankAccountId: 1,
      transactionDate: '2026-10-08',
      amount: 10,
      transactionType: 'debit',
    })).toEqual({
      data: {
        type: 'bank-transactions',
        attributes: {
          bankAccountId: 1,
          transactionDate: '2026-10-08',
          amount: 10,
          transactionType: 'debit',
          reference: null,
          description: null,
          reconciliationStatus: 'unreconciled',
          statementNumber: null,
          runningBalance: null,
          isActive: true,
        },
      },
    })
    expect(transformBankTransactionUpdateToAPI('4', { reconciledById: null, statementNumber: 'E-1' })).toEqual({
      data: { type: 'bank-transactions', id: '4', attributes: { reconciledById: null, statementNumber: 'E-1' } },
    })
  })
})

describe('Finance transformers FromAPI', () => {
  it('cuenta bancaria expone openingBalance numerico y status', () => {
    const account = transformBankAccountFromAPI({
      id: '1',
      attributes: { accountName: 'A', openingBalance: '250.50', status: 'active', glAccountId: 3 },
    })
    expect(account.openingBalance).toBe(250.5)
    expect(account.status).toBe('active')
    expect(account).not.toHaveProperty('accountType')
    expect(account).not.toHaveProperty('clabe')
  })

  it('aplicacion de pago expone amount numerico', () => {
    const app = transformPaymentApplicationFromAPI({
      id: '1',
      attributes: { paymentId: 4, arInvoiceId: 5, amount: '120.00', applicationDate: '2026-10-08' },
    })
    expect(app.amount).toBe(120)
    expect(app.arInvoiceId).toBe(5)
    expect(app).not.toHaveProperty('apInvoiceId')
  })

  it('pago resuelve metodo y cuenta desde included', () => {
    const payment = transformAPPaymentFromAPI(
      { id: '1', attributes: { contactId: 1, bankAccountId: 2, paymentMethodId: 3, amount: 10 } },
      [
        { type: 'bank-accounts', id: '2', attributes: { accountName: 'Operativa' } },
        { type: 'payment-methods', id: '3', attributes: { name: 'Transferencia' } },
      ]
    )
    expect(payment.bankAccountName).toBe('Operativa')
    expect(payment.paymentMethodName).toBe('Transferencia')
  })
})

describe('Estados de factura y pago', () => {
  it('los enums coinciden con Rule::in de los Requests', () => {
    expect([...INVOICE_STATUSES]).toEqual(['draft', 'pending', 'posted', 'partial', 'paid', 'void', 'voided', 'cancelled'])
    expect([...PAYMENT_STATUSES]).toEqual(['draft', 'unapplied', 'partial', 'applied', 'fully_applied', 'void', 'voided'])
    expect(INVOICE_STATUS_FILTER_OPTIONS.map((o) => o.value)).not.toContain('sent')
    expect(INVOICE_STATUS_FILTER_OPTIONS.map((o) => o.value)).not.toContain('void')
  })

  it('pendiente = pending/posted/partial con saldo; vencida se calcula con dueDate', () => {
    const base = { totalAmount: 100, paidAmount: 0, dueDate: '2026-10-01' }
    const asOf = new Date(2026, 9, 8)
    expect(isInvoiceOpen({ ...base, status: 'posted' })).toBe(true)
    expect(isInvoiceOpen({ ...base, status: 'draft' })).toBe(false)
    expect(isInvoiceOpen({ ...base, status: 'partial', paidAmount: 100 })).toBe(false)
    expect(isInvoiceOverdue({ ...base, status: 'pending' }, asOf)).toBe(true)
    expect(isInvoiceOverdue({ ...base, status: 'paid' }, asOf)).toBe(false)
    expect(isInvoiceOverdue({ ...base, status: 'pending', dueDate: '2026-10-08' }, asOf)).toBe(false)
  })
})

describe('Errores y folios', () => {
  it('muestra el detalle del error JSON:API con el campo', () => {
    const error = {
      response: {
        data: {
          errors: [{ detail: 'The payment number has already been taken.', source: { pointer: '/data/attributes/paymentNumber' } }],
        },
      },
    }
    expect(getFinanceErrorMessage(error, 'fallo')).toBe('paymentNumber: The payment number has already been taken.')
  })

  it('soporta validacion Laravel y { error } de controladores custom', () => {
    expect(getFinanceErrorMessage({ response: { data: { message: 'x', errors: { amount: ['Monto excede saldo'] } } } }, 'f'))
      .toBe('Monto excede saldo')
    expect(getFinanceErrorMessage({ response: { data: { error: 'Periodo fiscal cerrado' } } }, 'f'))
      .toBe('Periodo fiscal cerrado')
    expect(getFinanceErrorMessage(null, 'f')).toBe('f')
  })
})
