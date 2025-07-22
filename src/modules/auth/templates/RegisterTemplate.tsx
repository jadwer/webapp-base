import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterTemplate() {
  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-4 text-center">Registro</h1>
      <RegisterForm />

      <div className="text-center mt-4">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/auth/login" className="text-primary fw-semibold">
          ¡Inicia sesión!
        </Link>
      </div>
    </div>
  );
}
