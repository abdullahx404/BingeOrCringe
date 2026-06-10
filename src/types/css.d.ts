declare module '*.module.css' {
  const styles: { [className: string]: string };
  export default styles;
}

declare module '*.module.scss' {
  const styles: { [className: string]: string };
  export default styles;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
