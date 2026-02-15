"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

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
        src="/images/laborwasser/labor-wasser-mexico-logo.webp"
        alt="Labor Wasser de Mexico"
        style={{ height: 60, marginBottom: 30 }}
      />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#dc354520",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <i
          className="bi bi-exclamation-triangle"
          style={{ fontSize: "1.8rem", color: "#dc3545" }}
        ></i>
      </div>
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          color: "#333",
          margin: "0 0 10px",
        }}
      >
        Algo salio mal
      </h1>
      <p
        style={{
          color: "#666",
          fontSize: "1rem",
          marginBottom: 30,
          maxWidth: 400,
        }}
      >
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: "12px 28px",
            backgroundColor: "#8AC905",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
        <a
          href="/"
          style={{
            padding: "12px 28px",
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #dee2e6",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
          }}
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
