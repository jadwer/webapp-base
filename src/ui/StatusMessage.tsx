interface Props {
  message: string | null
  type?: 'success' | 'danger' | 'warning' | 'info'
}

export default function StatusMessage({ message, type = 'info' }: Props) {
  if (!message) return null

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
    </div>
  )
}
