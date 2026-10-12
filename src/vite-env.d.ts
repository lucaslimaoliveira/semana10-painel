/// <reference types="vite/client" />

// o .env e' texto; sem esta interface, import.meta.env.VITE_API_URL e' `any` (medido:
// `const n: number = import.meta.env.VITE_API_URL` compilava). Com ela, e' string.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
