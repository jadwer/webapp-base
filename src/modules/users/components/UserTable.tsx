import { User } from '../types/user'

interface Props {
  users: User[]
  onEdit?: (user: User) => void
  onDelete?: (id: string) => void
}

export default function UserTable({ users, onEdit, onDelete }: Props) {
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
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
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
              <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                {user.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              {onEdit && (
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => onEdit(user)}
                >
                  Editar
                </button>
              )}
              {onDelete && user.id && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(user.id!)}
                >
                  Eliminar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
