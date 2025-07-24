"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/profileApi";
import ProfileInfo from "../components/ProfileInfo";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { User } from "@/modules/users/types/user";

export default function ProfileLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Mi perfil</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Perfil
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "security" ? "active" : ""}`}
            onClick={() => setTab("security")}
          >
            Seguridad
          </button>
        </li>
      </ul>

      <div className="card p-4">
        {tab === "profile" && <ProfileInfo user={user} />}
        {tab === "security" && <ChangePasswordForm />}
      </div>
    </div>
  );
}
