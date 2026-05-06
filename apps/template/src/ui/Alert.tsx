export function Alert({ message }: { message: string }) {
  return <div className="p-4 bg-yellow-200 border-l-4 border-yellow-600">{message}</div>;
}
