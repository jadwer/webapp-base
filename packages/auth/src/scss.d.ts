// Allow importing SCSS modules in TypeScript declaration generation.
declare module '*.module.scss' {
  const styles: { readonly [className: string]: string }
  export default styles
}

declare module '*.module.css' {
  const styles: { readonly [className: string]: string }
  export default styles
}
