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
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
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
