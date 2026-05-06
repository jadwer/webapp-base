import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: "#f8f9fa",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/laborwasser/labor-wasser-mexico-logo2.webp"
        alt="Labor Wasser de Mexico"
        style={{ height: 60, marginBottom: 30 }}
      />
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: 800,
          color: "#8AC905",
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#333",
          margin: "15px 0 10px",
        }}
      >
        Ups, no podemos encontrar la pagina solicitada
      </h2>
      <p style={{ color: "#666", fontSize: "1rem", marginBottom: 30 }}>
        La pagina que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 32px",
          backgroundColor: "#8AC905",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        Volver al sitio web
      </Link>
    </div>
  );
}
