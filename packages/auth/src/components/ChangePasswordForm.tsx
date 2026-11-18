"use client";

/**
 * Cambiar contrasena (Figma "Diseno final - Perfil", 2026-11-18): contrasena actual, nueva y
 * confirmacion con mostrar u ocultar, "Recomendar contrasena segura" y las acciones Cancelar
 * y Confirmar. Antes un error que no era de validacion se guardaba y nunca se mostraba.
 */

import { useState } from "react";
import { changePassword } from "../lib/profileApi";
import { generateSecurePassword } from "../lib/password";

type Props = { onCancel?: () => void };

type Field = "currentPassword" | "password" | "passwordConfirmation";

const EMPTY = { currentPassword: "", password: "", passwordConfirmation: "" };

export default function ChangePasswordForm({ onCancel }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [show, setShow] = useState<Record<Field, boolean>>({ currentPassword: false, password: false, passwordConfirmation: false });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const mismatch = form.passwordConfirmation.length > 0 && form.password !== form.passwordConfirmation;
  const incomplete = !form.currentPassword || !form.password || !form.passwordConfirmation;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const recommend = () => {
    const generated = generateSecurePassword();
    setForm({ ...form, password: generated, passwordConfirmation: generated });
    setShow({ ...show, password: true, passwordConfirmation: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch || incomplete) return;
    setErrors({});
    setSuccess(false);
    setSaving(true);
    try {
      await changePassword(form);
      setSuccess(true);
      setForm(EMPTY);
    } catch (err: unknown) {
      const isFieldMap = err && typeof err === "object" && !Array.isArray(err) && !("isAxiosError" in err) && !("response" in err)
        && Object.keys(err).length > 0;
      if (isFieldMap) {
        setErrors(err as Record<string, string[]>);
      } else {
        setErrors({ general: ["No se pudo cambiar la contraseña. Intenta de nuevo."] });
      }
    } finally {
      setSaving(false);
    }
  };

  const input = (name: Field, label: string, placeholder: string) => (
    <>
      <label htmlFor={`pwd-${name}`} className="form-label">{label}</label>
      <div className="input-group has-validation">
        <input
          id={`pwd-${name}`}
          type={show[name] ? "text" : "password"}
          name={name}
          className={`form-control ${errors[name] || (name === "passwordConfirmation" && mismatch) ? "is-invalid" : ""}`}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          required
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShow({ ...show, [name]: !show[name] })}
          aria-label={`${show[name] ? "Ocultar" : "Mostrar"} ${label.replace(/^\*/, "").toLowerCase()}`}
        >
          <i className={`bi ${show[name] ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
        </button>
        {errors[name] ? <div className="invalid-feedback">{errors[name][0]}</div> : null}
        {name === "passwordConfirmation" && mismatch ? <div className="invalid-feedback">Las contraseñas no coinciden.</div> : null}
      </div>
    </>
  );

  const otherErrors = Object.entries(errors).filter(([k]) => !["currentPassword", "password", "passwordConfirmation"].includes(k));

  return (
    <form onSubmit={handleSubmit} noValidate>
      {success && <div className="alert alert-success" role="status">Contraseña actualizada correctamente.</div>}
      {otherErrors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {otherErrors.flatMap(([, v]) => v).map((m, i) => <div key={i}>{m}</div>)}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">{input("currentPassword", "*Contraseña actual", "Ingresa tu contraseña actual")}</div>
        <div className="w-100 d-none d-md-block" />
        <div className="col-md-6">
          {input("password", "*Contraseña nueva", "Ingresa la contraseña")}
          <div className="text-end">
            <button type="button" className="btn btn-link btn-sm p-0" onClick={recommend}>Recomendar contraseña segura</button>
          </div>
        </div>
        <div className="col-md-6">{input("passwordConfirmation", "*Confirmar contraseña nueva", "Confirma tu contraseña")}</div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel ? (
          <button type="button" className="btn btn-outline-primary px-4" onClick={onCancel} disabled={saving}>Cancelar</button>
        ) : null}
        <button type="submit" className="btn btn-primary px-4" disabled={saving || mismatch || incomplete}>
          {saving ? "Guardando..." : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
