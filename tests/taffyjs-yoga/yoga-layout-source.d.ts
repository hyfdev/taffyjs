// Keep the public specifiers out of tsconfig paths because Bun applies those mappings at runtime.
declare module "yoga-layout" {
  export { default } from "#taffyjs-yoga-test-source";
  export * from "#taffyjs-yoga-test-source";
}

declare module "yoga-layout/load" {
  export * from "#taffyjs-yoga-test-load-source";
}
