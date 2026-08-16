export class CodegenError extends Error {
  override readonly name = "CodegenError";
}

export async function runCodegen(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof CodegenError ? error.message : error);
    process.exitCode = 1;
  }
}
