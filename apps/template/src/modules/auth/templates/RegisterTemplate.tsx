import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import Link from "next/link";
import styles from '@/modules/auth/styles/AuthTemplate.module.scss';

export default function RegisterTemplate() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.brandIcon}>
            <i className="bi bi-atom" aria-hidden="true"></i>
          </div>
          <h1 className={styles.authTitle}>Crear cuenta</h1>
          <p className={styles.authSubtitle}>Únete a nuestra plataforma</p>
        </div>
        
        <div className={styles.authForm}>
          <RegisterForm />
        </div>
        
        <div className={styles.authFooter}>
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login">
              ¡Inicia sesión aquí!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
