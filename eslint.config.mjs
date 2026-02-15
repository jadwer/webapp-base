import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Configuración específica para archivos de producción
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}", 
      "**/tests/**/*",
      "**/test/**/*",
      "**/__tests__/**/*",
      "**/test-utils.ts",
      "**/setup.ts",
      "**/integration-setup.ts"
    ],
    rules: {
      // Reglas estrictas para código de producción (sin type checking)
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off", // Deshabilitado temporalmente para ver errores TypeScript
      "@next/next/no-html-link-for-pages": "off", // Muchas paginas usan <a> para rutas que aun no existen o son externas
    }
  },
  
  // Configuración relajada para archivos de test
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/tests/**/*",
      "**/test/**/*", 
      "**/__tests__/**/*",
      "**/test-utils.ts",
      "**/setup.ts",
      "**/integration-setup.ts"
    ],
    rules: {
      // Permitir any en tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // Otras reglas relajadas para testing
      "prefer-const": "warn",
      "no-console": "off",
    }
  }
];

export default eslintConfig;
