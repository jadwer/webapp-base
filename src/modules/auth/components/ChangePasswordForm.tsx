"use client";

import { useState } from "react";
import { changePassword } from "../lib/profileApi";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    try {
      await changePassword(form);
      setSuccess(true);
      setForm({
        currentPassword: "",
        password: "",
        passwordConfirmation: "",
      });
    } catch (err: unknown) {
      // Si es un objeto con el formato de errores de validación
      if (err && typeof err === 'object' && !Array.isArray(err)) {
        setErrors(err as Record<string, string[]>);
      } else {
        // Para otros tipos de errores, mostrar un error genérico
        setErrors({ general: ['Ocurrió un error inesperado'] });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="alert alert-success">Contraseña actualizada correctamente.</div>
      )}

      <div className="mb-3">
        <label className="form-label">Contraseña actual</label>
        <input
          type="password"
          name="currentPassword"
          className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
          value={form.currentPassword}
          onChange={handleChange}
        />
        {errors.currentPassword && (
          <div className="invalid-feedback">{errors.currentPassword[0]}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Nueva contraseña</label>
        <input
          type="password"
          name="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password[0]}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Confirmar contraseña</label>
        <input
          type="password"
          name="passwordConfirmation"
          className="form-control"
          value={form.passwordConfirmation}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Guardar cambios
      </button>
    </form>
  );
}
