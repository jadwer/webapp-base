"use client";

/**
 * Mi perfil: pestanas Perfil (foto, nombre, correo, alta) y Cambiar contrasena. La pagina lo
 * envuelve con la piel del rediseno; el menu del usuario del encabezado abre la pestana de
 * contrasena con ?tab=security.
 */

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/profileApi";
import ProfileInfo from "../components/ProfileInfo";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { AdminUser as User } from "../types/user-admin";

type Tab = "profile" | "security";

export default function ProfileLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setFailed(true));
    // Sin useSearchParams: la pagina se prerenderiza y no tiene Suspense.
    if (new URLSearchParams(window.location.search).get("tab") === "security") setTab("security");
  }, []);

  const pick = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "security") url.searchParams.set("tab", "security");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url.toString());
  };

  if (failed) return <div className="alert alert-danger" role="alert">No se pudo cargar tu perfil. Recarga la página.</div>;
  if (!user) return <p className="text-muted">Cargando perfil…</p>;

  return (
    <>
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button type="button" role="tab" aria-selected={tab === "profile"} className={`nav-link ${tab === "profile" ? "active" : ""}`} onClick={() => pick("profile")}>
            Perfil
          </button>
        </li>
        <li className="nav-item">
          <button type="button" role="tab" aria-selected={tab === "security"} className={`nav-link ${tab === "security" ? "active" : ""}`} onClick={() => pick("security")}>
            Cambiar contraseña
          </button>
        </li>
      </ul>

      {tab === "profile" && <ProfileInfo user={user} onAvatarChange={(avatar) => setUser({ ...user, avatar })} />}
      {tab === "security" && <ChangePasswordForm onCancel={() => pick("profile")} />}
    </>
  );
}
