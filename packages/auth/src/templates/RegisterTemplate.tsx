import { RegisterForm } from '../components/RegisterForm';
import { withRedirect } from '../lib/redirect';
import Link from "next/link";
import styles from '../styles/AuthTemplate.module.scss';

interface Props {
  /** Pagina a la que iba el visitante; viaja al inicio de sesion tras registrarse. */
  redirect?: string | null
}

export default function RegisterTemplate({ redirect }: Props = {}) {
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
          <RegisterForm redirect={redirect} />
        </div>
        
        <div className={styles.authFooter}>
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link href={withRedirect('/auth/login', redirect)}>
              ¡Inicia sesión aquí!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
