// Allow importing SCSS modules in TypeScript declaration generation.
// Consumers (Next.js apps) handle the actual SCSS compilation; tsup ships the
// .module.scss files alongside the JS entry via the onSuccess copy step.
declare module '*.module.scss' {
  const styles: { readonly [className: string]: string }
  export default styles
}

declare module '*.module.css' {
  const styles: { readonly [className: string]: string }
  export default styles
}
