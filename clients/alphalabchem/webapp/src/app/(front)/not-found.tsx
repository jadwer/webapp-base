import Link from "next/link";

export default function FrontNotFound() {
  return (
    <>
      <div
        className="container-fluid hero-sections mx-auto"
        style={{ minHeight: "auto" }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1>PAGINA NO ENCONTRADA</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div style={{ fontSize: "5rem", color: "#8AC905", fontWeight: 800 }}>
              404
            </div>
            <h2 className="mb-3" style={{ color: "#333" }}>
              La pagina que buscas no existe o fue movida
            </h2>
            <p className="text-muted mb-4">
              Es posible que el enlace este roto o que la pagina haya sido
              eliminada. Intenta navegar desde el menu principal.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link href="/" className="btn btn-success btn-lg">
                <i className="bi bi-house-door me-2"></i>
                Ir al inicio
              </Link>
              <Link href="/productos" className="btn btn-outline-success btn-lg">
                <i className="bi bi-grid me-2"></i>
                Ver productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
