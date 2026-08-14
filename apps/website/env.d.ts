declare module "*.vue" {
  const component: import("vue").Component;
  export default component;
}

declare module "*.css";
