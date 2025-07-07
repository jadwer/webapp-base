import dynamic from 'next/dynamic'

const UsersCrudTemplate = dynamic(
  () => import('@/modules/users/templates/UsersCrudTemplate'),
  { ssr: true }
)

export default function Page() {
  return <UsersCrudTemplate />
}
