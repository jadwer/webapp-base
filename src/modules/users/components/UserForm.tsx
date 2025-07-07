"use client";

import { useState, useEffect } from "react";
import { User } from "../types/user";

interface Props {
  initialValues: Partial<User>;
  onSubmit: (values: Partial<User>) => void;
  loading?: boolean;
  error?: string | null;
}

export default function UserForm({
  initialValues,
  onSubmit,
  loading,
  error,
}: Props) {
  const [formData, setFormData] = useState<
    Partial<
      User & {
        password: string;
        password_confirmation: string;
      }
    >
  >({
    name: "",
    email: "",
    status: "active",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3">
        <label className="form-label">Nombre</label>
        <input
          name="name"
          type="text"
          className="form-control"
          value={formData.name || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          className="form-control"
          value={formData.email || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input
          name="password"
          type="password"
          className="form-control"
          value={formData.password || ""}
          onChange={handleChange}
          placeholder={initialValues.id ? "(Dejar vacío si no cambia)" : ""}
          {...(!initialValues.id && { required: true })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Confirmar contraseña</label>
        <input
          name="password_confirmation"
          type="password"
          className="form-control"
          value={formData.password_confirmation || ""}
          onChange={handleChange}
          {...(!initialValues.id && { required: true })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Rol</label>
        <select
          name="role"
          className="form-select"
          value={formData.role || ""}
          onChange={handleChange}
          required>
          <option value="" disabled>
            Selecciona un rol
          </option>
          <option value="god">God</option>
          <option value="admin">Admin</option>
          <option value="tech">Tech</option>
          <option value="customer">Cliente</option>
          <option value="guest">Invitado</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Estado</label>
        <select
          name="status"
          className="form-select"
          value={formData.status || "active"}
          onChange={handleChange}
          required>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <button type="submit" className="btn btn-success" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
