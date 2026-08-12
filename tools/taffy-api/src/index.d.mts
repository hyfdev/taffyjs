export class DiagnosticError extends Error {
  readonly diagnostic: string;
}

export interface RepositoryFixture {
  mutate(kind: string, argument?: string): RepositoryFixture;
  withTaskState(taskId: string, state: string): RepositoryFixture;
}

export interface GeneratedArtifacts {
  readonly canonical: Record<string, unknown>;
  readonly expanded: Record<string, unknown>;
  readonly contractJson: string;
  readonly expectedDeclaration: string;
}

export function extractCanonicalContract(goal: string): Record<string, unknown>;
export function extractLoopStatus(statusSource: string): Record<string, unknown>;
export function expandContract(contract: Record<string, unknown>): Record<string, unknown>;
export function assembleDeclaration(
  contract: Record<string, unknown>,
  taskStates?: Record<string, string> | null,
): string;
export function formatDeclaration(source: string, root: string): Promise<string>;
export function stripDeclarationJsDoc(source: string): string;
export function generateArtifacts(options: {
  root: string;
  goal: string;
  write?: boolean;
}): Promise<GeneratedArtifacts>;
export function createRepositoryFixture(root: string): Promise<RepositoryFixture>;
export function checkRepositoryFixture(fixture: RepositoryFixture): Promise<boolean>;
export function extractContractTestCalls(
  source: string,
  path: string,
  root: string,
): Promise<Array<{ id: string; path: string; offset: number }>>;
export function serializeReviewInputProjection(projection: Record<string, unknown>): string;
export function checkRepository(options?: {
  root?: string;
  all?: boolean;
}): Promise<Record<string, unknown>>;
export function checkCompletion(options?: { root?: string }): Promise<Record<string, unknown>>;
export function checkReviewCompletion(options?: {
  root?: string;
}): Promise<Record<string, unknown>>;
