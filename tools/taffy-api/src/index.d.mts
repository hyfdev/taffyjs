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
export function validateWholeSurfaceJsDoc(contract: Record<string, unknown>, actual: string): void;
export function validateNodeIdDeclarationBindings(contract: Record<string, unknown>): void;
export function validatePnpmPins(
  contract: Record<string, unknown>,
  workspace: string,
  lock: string,
  manifests: Record<string, Record<string, unknown>>,
): void;
export function validatePackageBuildScript(packageManifest: Record<string, unknown>): void;
export function validateParsedSourceInventory(
  contract: Record<string, unknown>,
  parsed: Record<string, unknown>,
): void;
export function validateRealPinsAndSource(
  root: string,
  contract: Record<string, unknown>,
): Promise<{
  metadata: Record<string, unknown>;
  parsed: Record<string, unknown>;
  archivePath: string;
}>;
export function validateRealSourceInventory(
  root: string,
  contract: Record<string, unknown>,
  taffyRoot: string,
  archivePath: string,
): Promise<Record<string, unknown>>;
export function validateRunnerTaskGraph(
  contract: Record<string, unknown>,
  expanded: Record<string, unknown>,
  status: Record<string, unknown>,
  tasks: Record<string, unknown>,
): void;
export function validateStatusShape(
  status: Record<string, unknown>,
  contract: Record<string, unknown>,
  expanded: Record<string, unknown>,
): void;
export function validateActualReviewRecord(
  contract: Record<string, unknown>,
  status: Record<string, unknown>,
): void;
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
export function collectStaticEvidence(
  root: string,
  expanded: Record<string, unknown>,
  status: Record<string, unknown>,
): Promise<
  Array<{ id: string; path: string; offset: number; identity: string; modality?: string }>
>;
export function validateStaticCollection(
  contract: Record<string, unknown>,
  expanded: Record<string, unknown>,
  status: Record<string, unknown>,
  calls: Array<Record<string, unknown>>,
): void;
export function validateCurrentEvidence(
  expanded: Record<string, unknown>,
  status: Record<string, unknown>,
  options?: { all?: boolean },
): void;
export function serializeReviewInputProjection(projection: Record<string, unknown>): string;
export function checkRepository(options?: {
  root?: string;
  all?: boolean;
}): Promise<Record<string, unknown>>;
export function checkCompletion(options?: { root?: string }): Promise<Record<string, unknown>>;
export function checkCandidate(options?: { root?: string }): Promise<Record<string, unknown>>;
export function checkReviewCompletion(options?: {
  root?: string;
}): Promise<Record<string, unknown>>;
