// src/app/(back)/dashboard/profile/page.tsx
import { ProfileLayout } from "@/modules/auth";
import { LwSurface, LwPageTitle } from "@lwm/ui";

export default function ProfilePage() {
  return (
    <div className="container-fluid py-4">
      <LwSurface>
        <LwPageTitle title="Mi perfil" subtitle="Tu foto, tus datos y tu contraseña" />
        <ProfileLayout />
      </LwSurface>
    </div>
  );
}
