import { User } from '../types/user'

interface Props {
  users: User[]
  onEdit?: (user: User) => void
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
}

export default function UserTable({ users, onEdit, onDelete, onRestore }: Props) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const isDeleted = !!user.deletedAt
          return (
            <tr key={user.id} style={isDeleted ? { opacity: 0.5, backgroundColor: '#f8f9fa' } : undefined}>
              <td>
                {user.name}
                {isDeleted && <span className="badge bg-danger ms-2">Eliminado</span>}
              </td>
              <td>{user.email}</td>
              <td>
                <span className="badge bg-secondary">
                  {user.roles && user.roles.length > 0
                    ? user.roles[0].name.charAt(0).toUpperCase() + user.roles[0].name.slice(1)
                    : user.role || '-'
                  }
                </span>
              </td>
              <td>
                {isDeleted ? (
                  <span className="badge bg-danger">Eliminado</span>
                ) : (
                  <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </td>
              <td>
                {isDeleted ? (
                  onRestore && user.id && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => onRestore(user.id!)}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1" />
                      Restaurar
                    </button>
                  )
                ) : (
                  <div className="d-flex gap-1">
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => onEdit(user)}
                        title="Editar usuario"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    )}
                    {onDelete && user.id && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(user.id!)}
                        title="Eliminar usuario"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
