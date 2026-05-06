// src/modules/auth/components/ProfileInfo.tsx
import { User } from "@/modules/users/types/user";

type Props = {
  user: User;
};

export default function ProfileInfo({ user }: Props) {
  return (
    <>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">Nombre:</div>
        <div className="col-sm-9">{user.name}</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">Correo electrónico:</div>
        <div className="col-sm-9">{user.email}</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">Registrado desde:</div>
        <div className="col-sm-9">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "Fecha no disponible"}
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">Teléfono:</div>
        <div className="col-sm-9 text-muted">No disponible</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">Direcciones:</div>
        <div className="col-sm-9 text-muted">No disponible</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 font-weight-bold">RFC:</div>
        <div className="col-sm-9 text-muted">No disponible</div>
      </div>
    </>
  );
}
