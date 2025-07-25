"use client";

import { useState, useEffect } from "react";
import { User } from "../types/user";
import { useRoles } from "../hooks/useRoles";

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
  const { roles, loading: rolesLoading } = useRoles();
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
    role: "", // Este será el ID del rol
  });

  useEffect(() => {
    // Si tenemos initialValues con un role (nombre), necesitamos convertirlo a ID
    if (initialValues && roles.length > 0) {
      let roleId = "";
      
      // Si initialValues.role es un nombre de rol, buscar su ID
      if (initialValues.role && typeof initialValues.role === 'string') {
        const foundRole = roles.find(role => role.name === initialValues.role);
        roleId = foundRole?.id || "";
      }
      
      setFormData((prev) => ({ 
        ...prev, 
        ...initialValues,
        role: roleId
      }));
    } else {
      setFormData((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues, roles]);

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
          required
          disabled={rolesLoading}
        >
          <option value="" disabled>
            {rolesLoading ? "Cargando roles..." : "Selecciona un rol"}
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </option>
          ))}
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

      <button type="submit" className="btn btn-success" disabled={loading || rolesLoading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
