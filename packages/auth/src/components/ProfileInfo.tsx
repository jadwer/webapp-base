'use client'

// Perfil propio: avatar (con selector del diseno 2026-09-30), nombre, correo
// y fecha de alta. Se quitaron las filas fijas "No disponible" (telefono,
// direcciones, RFC) que no leian ningun dato.
import { useState } from "react";
import { AdminUser as User } from "../types/user-admin";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { UserAvatar } from "./UserAvatar";

type Props = {
  user: User;
  onAvatarChange?: (avatar: string | null) => void;
};

export default function ProfileInfo({ user, onAvatarChange }: Props) {
  const [picker, setPicker] = useState(false);
  const created = user.createdAt ?? user.created_at;

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <UserAvatar avatar={user.avatar} name={user.name} size={88} />
        <div>
          <div className="fw-semibold fs-5">{user.name}</div>
          <button type="button" className="btn btn-sm btn-outline-primary mt-1" onClick={() => setPicker(true)}>
            <i className="bi bi-camera me-1" aria-hidden="true"></i>
            Editar foto
          </button>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 fw-semibold">Nombre:</div>
        <div className="col-sm-9">{user.name}</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 fw-semibold">Correo electrónico:</div>
        <div className="col-sm-9">{user.email}</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3 fw-semibold">Registrado desde:</div>
        <div className="col-sm-9">
          {created ? new Date(created).toLocaleDateString("es-MX") : "Fecha no disponible"}
        </div>
      </div>
      <AvatarPickerModal
        show={picker}
        onHide={() => setPicker(false)}
        name={user.name}
        current={user.avatar ?? null}
        onApplied={(avatar) => onAvatarChange?.(avatar)}
      />
    </>
  );
}
