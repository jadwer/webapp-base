'use client'

import { useBankAccounts } from '@/modules/finance'
import { Button } from '@/ui/components/base/Button'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'

export default function BankAccountsPage() {
  const navigation = useNavigationProgress()
  const { bankAccounts, isLoading, error } = useBankAccounts()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h4>Error al cargar cuentas bancarias</h4>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-2">
                <i className="bi bi-bank me-3"></i>
                Cuentas Bancarias
              </h1>
              <p className="text-muted">
                Administración de cuentas bancarias de la empresa
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigation.push('/dashboard/finance/bank-accounts/create')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva Cuenta
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Listado de Cuentas Bancarias
                {bankAccounts.length > 0 && (
                  <span className="badge bg-primary ms-2">{bankAccounts.length}</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bank display-1 text-muted mb-3"></i>
                  <h5>No hay cuentas bancarias configuradas</h5>
                  <p className="text-muted">
                    Las cuentas bancarias aparecerán aquí una vez que se conecte con el backend
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Banco</th>
                        <th>Número de Cuenta</th>
                        <th>CLABE</th>
                        <th>Tipo</th>
                        <th>Moneda</th>
                        <th>Saldo Inicial</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankAccounts.map((account) => (
                        <tr key={account.id}>
                          <td>
                            <strong>{account.bankName}</strong>
                          </td>
                          <td>
                            <code className="bg-light px-2 py-1 rounded">
                              {account.accountNumber}
                            </code>
                          </td>
                          <td>{account.clabe}</td>
                          <td>{account.accountType}</td>
                          <td>{account.currency}</td>
                          <td>{account.openingBalance}</td>
                          <td>
                            <span className={`badge ${account.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {account.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}