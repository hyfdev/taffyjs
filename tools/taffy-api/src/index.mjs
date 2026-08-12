import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

const CONTRACT_START = "<!-- taffy-contract-json:start -->";
const CONTRACT_END = "<!-- taffy-contract-json:end -->";
const STATUS_START = "<!-- loop-status-json:start -->";
const STATUS_END = "<!-- loop-status-json:end -->";
const IMPLEMENTED_STATES = new Set(["implemented", "verified", "under-review", "accepted"]);
const NUMERIC_TYPESCRIPT_PATH = "packages/taffyjs-node/src/generated/numeric-families.ts";
const NUMERIC_RUST_PATH = "crates/taffyjs_binding/src/generated_numeric.rs";
const NUMERIC_TYPE_FIXTURE_PATH = "tests/taffyjs-node/tests/types/INFRA-003/narrowing.test-d.ts";

export class DiagnosticError extends Error {
  constructor(diagnostic, message = diagnostic) {
    super(message);
    this.name = "DiagnosticError";
    this.diagnostic = diagnostic;
  }
}

function fail(diagnostic, message) {
  throw new DiagnosticError(diagnostic, message);
}

function unique(items, diagnostic) {
  if (new Set(items).size !== items.length) fail(diagnostic);
  return items;
}

function asciiCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function exactKeys(value, expected, diagnostic) {
  const actual = Object.keys(value).sort(asciiCompare);
  const wanted = [...expected].sort(asciiCompare);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(diagnostic);
}

function exactRuleKeys(value, expected) {
  exactKeys(value, expected, "contract-schema-unknown-rule-key");
}

function validateCfgRule(value) {
  if (value === true) return;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("contract-schema-unknown-rule-key");
  }
  const keys = Object.keys(value);
  if (keys.length !== 1 || !["feature", "all", "any", "not"].includes(keys[0])) {
    fail("contract-schema-unknown-rule-key");
  }
  if (keys[0] === "feature") {
    if (typeof value.feature !== "string") fail("contract-schema-unknown-rule-key");
    return;
  }
  if (keys[0] === "not") {
    validateCfgRule(value.not);
    return;
  }
  if (!Array.isArray(value[keys[0]])) fail("contract-schema-unknown-rule-key");
  value[keys[0]].forEach(validateCfgRule);
}

function validateRuleSchema(contract) {
  exactRuleKeys(contract.milestones, ["M0", "M1", "M2", "M3", "M4"]);
  exactRuleKeys(contract.milestonePrerequisites, ["M0", "M1", "M2", "M3", "M4"]);
  exactRuleKeys(contract.generatedEvidenceIdRules, [
    "atomicity",
    "nodeIdCollectionInvalid",
    "nodeIdCollectionValid",
    "nodeIdScalar",
    "style",
  ]);
  exactRuleKeys(contract.generatedEvidenceOwners, [
    "atomicity",
    "nodeIdCollectionInvalid",
    "nodeIdCollectionValid",
    "nodeIdScalar",
    "style",
  ]);
  exactRuleKeys(contract.nodeIdCaseKinds, [
    "foreign",
    "malformed",
    "slot-reuse",
    "stale-cleared",
    "stale-removed",
    "valid",
    "wrong-type",
  ]);
  exactRuleKeys(contract.ordinaryFailureKinds, [
    "argument-shape",
    "callback-throw",
    "child-index-out-of-bounds",
    "discrete-value",
    "invalid-topology",
    "measure-result-shape",
    "node-id-serial-exhaustion",
    "tree-busy",
  ]);
  exactRuleKeys(contract.stateComparisonRules, [
    "before-after",
    "control-compute",
    "nontransactional",
    "normalizedCompletePublicState",
  ]);
  exactRuleKeys(contract.pins, [
    "minimumNodeTestRuntime",
    "moduleFormat",
    "napi",
    "napiBuild",
    "napiCli",
    "napiDerive",
    "node",
    "oxfmt",
    "taffyChecksum",
    "taffyCommit",
    "taffyDefaultFeatures",
    "taffyResolvedFeatures",
    "taffyVersion",
    "typescript",
  ]);
  exactRuleKeys(contract.implementationDependencyTargets, ["INFRA-002"]);
  exactRuleKeys(contract.implementationDependencyTargets["INFRA-002"], ["@types/node"]);
  for (const value of Object.values(contract.platformPackages)) {
    exactRuleKeys(value, ["binary", "name"]);
  }
  exactRuleKeys(contract.tarballContents, ["platform", "root", "rootManifest"]);
  exactRuleKeys(contract.tarballContents.rootManifest, ["engines", "owner"]);
  exactRuleKeys(contract.tarballContents.rootManifest.engines, ["node"]);

  exactRuleKeys(contract.reviewPolicy, [
    "candidateReadRule",
    "finalRoles",
    "isolation",
    "m4UsesFinalReviewers",
    "mode",
    "outcomeWriteBarrier",
    "perTaskVerdictMatrix",
    "postReviewValidation",
    "reviewInputStatusHash",
    "sameRoundInput",
  ]);
  exactRuleKeys(contract.reviewPolicy.perTaskVerdictMatrix, [
    "currentTaskIdsRule",
    "currentTaskIdsSource",
    "finalMilestone",
    "finalReviewerSlotIdsSource",
    "noAggregateSubstitution",
    "ordinaryMilestones",
    "ordinaryReviewerSlotIdsSource",
    "ordinaryReviewerSlots",
    "requiredCells",
    "reviewerIdentityRule",
    "reviewerSlotsRule",
  ]);
  for (const slot of contract.reviewPolicy.perTaskVerdictMatrix.ordinaryReviewerSlots) {
    exactRuleKeys(slot, ["focus", "kind", "slot"]);
  }
  exactRuleKeys(contract.reviewPolicy.postReviewValidation, [
    "command",
    "falseGreenOwner",
    "recursive",
    "runAfter",
    "terminalRule",
    "validates",
  ]);
  exactRuleKeys(contract.reviewPolicy.reviewInputStatusHash, [
    "algorithm",
    "projectionKeys",
    "reportRule",
    "selfExclusion",
    "serialization",
  ]);
  exactRuleKeys(contract.taskStatePolicy, [
    "acceptedIsSchedulingHistory",
    "artifactProjectionStartsAt",
    "candidateChangeClears",
    "commitAttestations",
    "finalCommandEvidenceMode",
    "finalMode",
    "greenEvidenceStartsAt",
    "states",
    "testRegistrationStartsAt",
  ]);
  exactRuleKeys(contract.rustSignaturePolicy, [
    "compared",
    "ignored",
    "implHeaderSyntax",
    "methodSyntax",
    "normalization",
    "parser",
  ]);

  const evidence = contract.primaryEvidenceRules;
  exactRuleKeys(evidence, [
    "acceptanceOverrides",
    "commandAttestations",
    "expandedOrdinaryAcceptanceCount",
    "expandedPrimaryAcceptanceCount",
    "generatedModalities",
    "generatedModalityOverrideRule",
    "generatedModalityOverrides",
    "minimumNodeCompatibility",
    "modalities",
    "resolution",
    "taskDefaults",
  ]);
  exactRuleKeys(evidence.commandAttestations["MATURITY-003/local-green"], [
    "command",
    "forbiddenInvocation",
    "requiredCandidate",
    "workingDirectory",
  ]);
  for (const override of evidence.generatedModalityOverrides) {
    exactRuleKeys(override, ["family", "modality", "selector"]);
    exactRuleKeys(override.selector, ["failureKind"]);
  }
  const modalityKeys = {
    "command-attestation": ["identity", "path", "rule", "runner"],
    "machine-check": ["identity", "path", "runner"],
    "minimum-node-js": ["identity", "path", "rule", "runner"],
    "native-js": ["identity", "pathRule", "runner"],
    "public-js": ["identity", "pathRule", "runner"],
    "rust-contract": ["compileTimeRule", "identity", "identityNormalization", "path", "runner"],
    types: ["identity", "path", "runner"],
    "wrapper-js": ["identity", "path", "rule", "runner"],
  };
  exactRuleKeys(evidence.modalities, Object.keys(modalityKeys));
  for (const [name, keys] of Object.entries(modalityKeys)) {
    exactRuleKeys(evidence.modalities[name], keys);
  }
  exactRuleKeys(evidence.taskDefaults, ["default", "overrides"]);
  const minimumNode = evidence.minimumNodeCompatibility;
  exactRuleKeys(minimumNode, [
    "expandedSecondaryAcceptanceCount",
    "expandedSurfaceProbeCount",
    "resultRule",
    "runner",
    "runtime",
    "sameArtifactRule",
    "secondaryAcceptanceIdentity",
    "secondaryAcceptanceRule",
    "sourceOwnerPrefixes",
    "sourcePrimaryModality",
    "surfaceInventorySources",
    "surfaceProbeIdentity",
    "surfaceProbeRule",
    "valueHelperCoverageAcceptanceIdsByExport",
  ]);

  const paths = contract.runtimeEvidencePathRules;
  exactRuleKeys(paths, [
    "acceptanceOverrideIntegrityFixture",
    "acceptanceOverrides",
    "api",
    "apiTaskPrefix",
    "collectionRootRule",
    "collectionRootsByModality",
    "default",
    "overrides",
  ]);
  exactRuleKeys(paths.acceptanceOverrideIntegrityFixture, [
    "acceptanceIds",
    "mutation",
    "owner",
    "requiredResult",
  ]);
  exactRuleKeys(paths.collectionRootsByModality, ["native-js", "public-js"]);

  const declaration = contract.publicDeclarationContract;
  exactRuleKeys(declaration, [
    "classDeclaration",
    "comparison",
    "compiler",
    "fixedStatementsByOwner",
    "formatter",
    "geometryGeneration",
    "numericFamilyGeneration",
    "privateSupportStatements",
    "serialization",
    "styleGeneration",
  ]);
  exactRuleKeys(declaration.comparison, [
    "actual",
    "effect",
    "expected",
    "jsDocProjection",
    "typecheck",
    "unit",
  ]);
  exactRuleKeys(declaration.numericFamilyGeneration, [
    "familyOrderSource",
    "grouping",
    "indexRule",
    "memberTemplate",
    "owner",
    "source",
    "statementOrder",
    "typeTemplate",
    "valueTemplate",
  ]);
  exactRuleKeys(declaration.geometryGeneration, [
    "families",
    "familyOrder",
    "grouping",
    "inputComponentTemplate",
    "inputTemplate",
    "outputComponentTemplate",
    "outputTemplate",
    "owner",
    "partialInputComponentTemplate",
    "partialInputTemplate",
    "statementOrder",
  ]);
  exactRuleKeys(declaration.styleGeneration, [
    "inputPropertyTemplate",
    "inputTemplate",
    "nullableInputJSDoc",
    "nullableInputJSDocFieldsSource",
    "outputPropertyTemplate",
    "outputTemplate",
    "owner",
    "rowOrderSource",
    "statementOrder",
    "typesByField",
  ]);
  exactRuleKeys(declaration.classDeclaration, ["header", "members", "owner"]);
  exactRuleKeys(declaration.serialization, [
    "assemblyOrder",
    "finalNewline",
    "formatCommand",
    "incrementalProjection",
    "lineEnding",
    "privateSupportOwner",
    "templateRule",
    "unformattedSeparator",
  ]);

  exactRuleKeys(contract.childIsolationRules, [
    "allOtherAcceptanceIds",
    "expandedChildAcceptanceCount",
    "generated",
    "ordinaryAcceptanceIds",
    "parentRule",
  ]);
  for (const generated of contract.childIsolationRules.generated) {
    exactRuleKeys(
      generated,
      generated.family === "atomicity" ? ["failureKinds", "family"] : ["caseKinds", "family"],
    );
  }
  exactRuleKeys(contract.nodeIdDeclarationBindingRules, [
    "expectedCollectionRoleCount",
    "expectedRoleCount",
    "expectedScalarRoleCount",
    "ownerToMemberSource",
    "pathGrammar",
    "recordBindings",
    "selfTestMutations",
    "verification",
  ]);
  for (const roles of Object.values(contract.nodeIdRolesByOwner)) {
    for (const role of roles) {
      exactRuleKeys(
        role,
        role.invalidPositions ? ["id", "invalidPositions", "path"] : ["id", "path"],
      );
    }
  }
  for (const value of Object.values(contract.ordinaryFailureKinds)) {
    exactRuleKeys(value, ["atomicity", "error"]);
  }
  exactRuleKeys(contract.errors, [
    "callback-throw",
    "child-index-out-of-bounds",
    "discrete-range-or-enum",
    "foreign-node-id",
    "internal",
    "invalid-topology",
    "malformed-node-id",
    "node-id-not-bigint",
    "node-id-serial-exhaustion",
    "random-source-failure",
    "stale-node-id",
    "tree-busy",
    "tree-poisoned",
    "wrong-type-or-shape",
  ]);
  for (const [name, value] of Object.entries(contract.errors)) {
    exactRuleKeys(
      value,
      name === "tree-busy" ? ["class", "code", "messageTemplate"] : ["class", "code"],
    );
  }

  exactRuleKeys(contract.upstream, [
    "adjacentRoots",
    "exclusionReasons",
    "nonRootConveniences",
    "taffyTree",
    "traversePartialTree",
    "valueTypeAssociatedItems",
  ]);
  exactRuleKeys(contract.upstream.exclusionReasons, [
    "binding-issued-only",
    "capacity-only",
    "composable-helper",
    "identity-context-semantics",
    "output-data-only",
    "owned-array-covers",
    "phantom-generic-marker",
    "private-state",
    "rust-convenience-only",
    "unstable-stdout-debug",
  ]);
  exactRuleKeys(contract.upstream.taffyTree, [
    "feature",
    "implHeader",
    "methodFeatureOverrides",
    "methods",
    "source",
  ]);
  for (const method of Object.values(contract.upstream.taffyTree.methods)) {
    exactRuleKeys(method, ["disposition", "signature"]);
  }
  exactRuleKeys(contract.upstream.traversePartialTree, [
    "declarationSource",
    "feature",
    "for",
    "implHeader",
    "methods",
    "source",
    "trait",
  ]);
  for (const method of Object.values(contract.upstream.traversePartialTree.methods)) {
    exactRuleKeys(method, ["disposition", "signature"]);
  }
  for (const root of contract.upstream.adjacentRoots) {
    exactRuleKeys(
      root,
      root.kind === "struct"
        ? ["cfg", "disposition", "iteratorItem", "kind", "publicFields", "rustPath", "source"]
        : ["cfg", "disposition", "for", "kind", "source", "trait"],
    );
    validateCfgRule(root.cfg);
  }
  exactRuleKeys(contract.upstream.nonRootConveniences, ["includedInU", "items"]);
  for (const item of contract.upstream.nonRootConveniences.items) {
    exactRuleKeys(item, ["cfg", "disposition", "rust", "source"]);
    validateCfgRule(item.cfg);
  }
  exactRuleKeys(contract.upstream.valueTypeAssociatedItems, ["includedInU", "reason"]);
  for (const group of contract.namedDataGroups) {
    exactRuleKeys(group, ["disposition", "features", "items", "source"]);
  }
  const shapeKeys = {
    enum: ["generics", "kind", "variantCfg", "variants"],
    opaqueTupleStruct: ["kind", "publicFields"],
    struct: ["fieldCfg", "fieldDispositions", "fields", "generics", "kind"],
    typeAlias: ["generics", "kind", "target"],
  };
  for (const shape of Object.values(contract.namedDataShapes)) {
    const allowed = shapeKeys[shape.kind];
    if (!allowed) fail("contract-schema-unknown-rule-key");
    const required = allowed.filter((key) => key in shape);
    if (!required.includes("kind")) fail("contract-schema-unknown-rule-key");
    if (Object.keys(shape).some((key) => !allowed.includes(key))) {
      fail("contract-schema-unknown-rule-key");
    }
    for (const cfg of Object.values(shape.fieldCfg ?? {})) validateCfgRule(cfg);
    for (const cfg of Object.values(shape.variantCfg ?? {})) validateCfgRule(cfg);
  }
}

function validateDisposition(disposition, taskIds, exclusionReasons) {
  const match = /^(implement|absorbed|covered-by|absorbed-by|exclude):(.+)$/u.exec(disposition);
  if (!match) fail("task-drift/disposition");
  if (match[1] === "exclude") {
    if (!exclusionReasons.has(match[2])) fail("task-drift/disposition-reason");
  } else if (!taskIds.has(match[2])) {
    fail("task-drift/disposition-owner");
  }
}

function splitTopLevel(source, separator) {
  const output = [];
  let start = 0;
  const depth = { angle: 0, brace: 0, bracket: 0, paren: 0 };
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "<") depth.angle += 1;
    else if (character === ">") depth.angle -= 1;
    else if (character === "{") depth.brace += 1;
    else if (character === "}") depth.brace -= 1;
    else if (character === "[") depth.bracket += 1;
    else if (character === "]") depth.bracket -= 1;
    else if (character === "(") depth.paren += 1;
    else if (character === ")") depth.paren -= 1;
    if (character === separator && Object.values(depth).every((value) => value === 0)) {
      output.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  output.push(source.slice(start).trim());
  return output.filter(Boolean);
}

function declarationParameters(member) {
  const start = member.indexOf("(");
  if (start === -1) return new Map();
  let depth = 0;
  let end = -1;
  for (let index = start; index < member.length; index += 1) {
    if (member[index] === "(") depth += 1;
    if (member[index] === ")") {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }
  if (end === -1) fail("task-drift/node-id-role-binding");
  return new Map(
    splitTopLevel(member.slice(start + 1, end), ",").map((parameter) => {
      const match = /^([A-Za-z_$][\w$]*)(?:\?)?\s*:\s*(.+)$/u.exec(parameter);
      if (!match) fail("task-drift/node-id-role-binding", parameter);
      return [match[1], match[2].trim()];
    }),
  );
}

function fixedInterfaces(contract) {
  const output = new Map();
  for (const [owner, statements] of Object.entries(
    contract.publicDeclarationContract.fixedStatementsByOwner,
  )) {
    for (const statement of statements) {
      const match = /^export interface ([A-Za-z_$][\w$]*)(?:<[^{}]+>)?\s*\{([\s\S]*)\}$/u.exec(
        statement.trim(),
      );
      if (!match) continue;
      const properties = new Map(
        splitTopLevel(match[2], ";").map((property) => {
          const propertyMatch = /^(?:readonly\s+)?([A-Za-z_$][\w$]*)(?:\?)?\s*:\s*(.+)$/u.exec(
            property,
          );
          if (!propertyMatch) fail("task-drift/node-id-role-binding", property);
          return [propertyMatch[1], propertyMatch[2].trim()];
        }),
      );
      if (output.has(match[1])) fail("task-drift/node-id-role-binding", match[1]);
      output.set(match[1], { owner, properties });
    }
  }
  return output;
}

export function validateNodeIdDeclarationBindings(contract) {
  const classMembers = new Map(contract.publicDeclarationContract.classDeclaration.members);
  const interfaces = fixedInterfaces(contract);
  const bindings = contract.nodeIdDeclarationBindingRules.recordBindings;
  const discovered = new Set();
  for (const [owner, memberNames] of Object.entries(contract.publicClassMembersByOwner)) {
    if (memberNames.length !== 1) continue;
    const parameters = declarationParameters(classMembers.get(memberNames[0]) ?? "");
    for (const [parameter, type] of parameters) {
      if (type === "NodeId") discovered.add(`${owner}/${parameter}`);
      if (type === "readonly NodeId[]") discovered.add(`${owner}/${parameter}[]`);
      const binding = bindings[`${owner}/${parameter}`];
      if (!binding) continue;
      if (type !== binding) fail("task-drift/node-id-role-binding", `${owner}/${parameter}`);
      const interfaceName = /^([A-Za-z_$][\w$]*)/u.exec(binding)?.[1];
      const record = interfaces.get(interfaceName);
      if (!record || record.owner !== owner) {
        fail("task-drift/node-id-role-binding", binding);
      }
      for (const [property, propertyType] of record.properties) {
        if (propertyType === "NodeId") discovered.add(`${owner}/${parameter}.${property}`);
        if (propertyType === "readonly NodeId[]") {
          discovered.add(`${owner}/${parameter}.${property}[]`);
        }
      }
    }
  }
  const expected = new Set(
    Object.entries(contract.nodeIdRolesByOwner).flatMap(([owner, roles]) =>
      roles.map(({ path }) => `${owner}/${path}`),
    ),
  );
  if (
    discovered.size !== expected.size ||
    [...discovered].some((path) => !expected.has(path)) ||
    [...expected].some((path) => !discovered.has(path))
  ) {
    fail("task-drift/node-id-role-binding");
  }
}

function validateContractReferences(contract, orderedTaskIds) {
  const taskIds = new Set(orderedTaskIds);
  const ordinaryIds = new Set(
    orderedTaskIds.flatMap((owner) =>
      contract.taskAcceptances[owner].map((slug) => `${owner}/${slug}`),
    ),
  );
  const validateOwners = (map, diagnostic) => {
    for (const owner of Object.keys(map)) {
      if (!taskIds.has(owner)) fail(diagnostic, owner);
    }
  };
  for (const map of [
    contract.publicRuntimeExportsByOwner,
    contract.publicDeclarationExportsByOwner,
    contract.publicClassMembersByOwner,
    contract.publicMutationFailuresByOwner,
    contract.constructionFailureCasesByOwner,
    contract.nodeIdRolesByOwner,
    contract.javascriptConveniencesByOwner,
    contract.primaryEvidenceRules.taskDefaults.overrides,
    contract.runtimeEvidencePathRules.overrides,
    contract.publicDeclarationContract.fixedStatementsByOwner,
  ]) {
    validateOwners(map, "task-drift/owner-missing");
  }
  for (const owner of Object.values(contract.generatedEvidenceOwners)) {
    if (!taskIds.has(owner)) fail("task-drift/generated-owner");
  }
  for (const owner of [
    contract.publicDeclarationContract.classDeclaration.owner,
    contract.publicDeclarationContract.numericFamilyGeneration.owner,
    contract.publicDeclarationContract.geometryGeneration.owner,
    contract.publicDeclarationContract.styleGeneration.owner,
    contract.publicDeclarationContract.serialization.privateSupportOwner,
  ]) {
    if (!taskIds.has(owner)) fail("task-drift/declaration-owner");
  }
  for (const map of [
    contract.publicRuntimeExportsByOwner,
    contract.publicDeclarationExportsByOwner,
    contract.publicClassMembersByOwner,
  ]) {
    unique(Object.values(map).flat(), "task-drift/owner-duplicate");
  }
  for (const acceptanceId of Object.keys(contract.primaryEvidenceRules.acceptanceOverrides)) {
    if (!ordinaryIds.has(acceptanceId)) fail("task-drift/acceptance-override");
  }
  for (const acceptanceId of Object.keys(contract.runtimeEvidencePathRules.acceptanceOverrides)) {
    if (!ordinaryIds.has(acceptanceId)) fail("task-drift/acceptance-path-override");
  }
  for (const acceptanceId of Object.keys(contract.primaryEvidenceRules.commandAttestations)) {
    if (!ordinaryIds.has(acceptanceId)) fail("task-drift/command-attestation");
  }

  const modalities = new Set(Object.keys(contract.primaryEvidenceRules.modalities));
  for (const modality of Object.values(contract.primaryEvidenceRules.generatedModalities)) {
    if (!modalities.has(modality)) fail("task-drift/evidence-modality");
  }
  for (const override of contract.primaryEvidenceRules.generatedModalityOverrides) {
    if (
      override.family !== "atomicity" ||
      !modalities.has(override.modality) ||
      !Object.hasOwn(contract.ordinaryFailureKinds, override.selector.failureKind)
    ) {
      fail("task-drift/generated-modality-override");
    }
  }
  for (const failureKinds of Object.values(contract.publicMutationFailuresByOwner)) {
    for (const failureKind of failureKinds) {
      if (!Object.hasOwn(contract.ordinaryFailureKinds, failureKind)) {
        fail("task-drift/failure-kind");
      }
    }
  }
  for (const value of Object.values(contract.ordinaryFailureKinds)) {
    if (
      !Object.hasOwn(contract.errors, value.error) ||
      !Object.hasOwn(contract.stateComparisonRules, value.atomicity)
    ) {
      fail("task-drift/failure-rule");
    }
  }
  for (const error of Object.values(contract.nodeIdCaseKinds)) {
    if (error !== null && !Object.hasOwn(contract.errors, error)) {
      fail("task-drift/node-id-error");
    }
  }

  const roleRecords = Object.entries(contract.nodeIdRolesByOwner).flatMap(([owner, roles]) =>
    roles.map((role) => ({ owner, ...role })),
  );
  const collectionRoles = roleRecords.filter((role) => role.invalidPositions);
  if (
    roleRecords.length !== contract.nodeIdDeclarationBindingRules.expectedRoleCount ||
    collectionRoles.length !== contract.nodeIdDeclarationBindingRules.expectedCollectionRoleCount ||
    roleRecords.length - collectionRoles.length !==
      contract.nodeIdDeclarationBindingRules.expectedScalarRoleCount
  ) {
    fail("task-drift/node-id-role-count");
  }
  for (const owner of Object.keys(contract.nodeIdRolesByOwner)) {
    if (contract.publicClassMembersByOwner[owner]?.length !== 1) {
      fail("task-drift/node-id-role-binding");
    }
  }
  validateNodeIdDeclarationBindings(contract);

  const styleIds = contract.styleFields.map(([styleId]) => styleId);
  const styleNames = contract.styleFields.map(([, name]) => name);
  unique(styleIds, "task-drift/style-id-duplicate");
  unique(styleNames, "task-drift/style-field-duplicate");
  if (
    contract.nullableStyleFields.some((styleId) => !styleIds.includes(styleId)) ||
    JSON.stringify(Object.keys(contract.publicDeclarationContract.styleGeneration.typesByField)) !==
      JSON.stringify(styleNames)
  ) {
    fail("task-drift/style-declaration-binding");
  }
  const numericOrder =
    contract.publicRuntimeExportsByOwner[
      contract.publicDeclarationContract.numericFamilyGeneration.owner
    ];
  if (
    JSON.stringify(numericOrder) !== JSON.stringify(Object.keys(contract.numericFamilies)) ||
    JSON.stringify(contract.publicDeclarationContract.geometryGeneration.familyOrder) !==
      JSON.stringify(Object.keys(contract.publicDeclarationContract.geometryGeneration.families))
  ) {
    fail("task-drift/declaration-generation-order");
  }

  const groupedNamedData = contract.namedDataGroups.flatMap(({ items }) => items);
  unique(groupedNamedData, "source-drift/named-data-duplicate");
  if (
    JSON.stringify([...groupedNamedData].sort(asciiCompare)) !==
    JSON.stringify(Object.keys(contract.namedDataShapes).sort(asciiCompare))
  ) {
    fail("source-drift/named-data-reachability");
  }
  const exclusionReasons = new Set(Object.keys(contract.upstream.exclusionReasons));
  for (const disposition of [
    ...Object.values(contract.upstream.taffyTree.methods).map((value) => value.disposition),
    ...Object.values(contract.upstream.traversePartialTree.methods).map(
      (value) => value.disposition,
    ),
    ...contract.upstream.adjacentRoots.map((value) => value.disposition),
    ...contract.upstream.nonRootConveniences.items.map((value) => value.disposition),
    ...contract.namedDataGroups.map((value) => value.disposition),
  ]) {
    validateDisposition(disposition, taskIds, exclusionReasons);
  }

  const helperMap =
    contract.primaryEvidenceRules.minimumNodeCompatibility.valueHelperCoverageAcceptanceIdsByExport;
  const helperNames = Object.entries(contract.javascriptConveniencesByOwner)
    .filter(([owner]) => owner.startsWith("TYPE-"))
    .flatMap(([, names]) => names);
  if (
    JSON.stringify(Object.keys(helperMap).sort(asciiCompare)) !==
    JSON.stringify(helperNames.sort(asciiCompare))
  ) {
    fail("task-drift/minimum-node-helper-map");
  }
  for (const acceptanceIds of Object.values(helperMap)) {
    for (const acceptanceId of acceptanceIds) {
      if (!ordinaryIds.has(acceptanceId)) fail("task-drift/minimum-node-helper-acceptance");
    }
  }
}

function deepSort(value) {
  if (Array.isArray(value)) return value.map(deepSort);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort(asciiCompare)
        .map((key) => [key, deepSort(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(deepSort(value), null, 2)}\n`;
}

function clone(value) {
  return structuredClone(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortNestedObjects(value, isRoot = false) {
  if (Array.isArray(value)) {
    return value.map((entry) => sortNestedObjects(entry));
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    if (!isRoot) keys.sort(asciiCompare);
    return Object.fromEntries(keys.map((key) => [key, sortNestedObjects(value[key])]));
  }
  return value;
}

export function serializeReviewInputProjection(projection) {
  return JSON.stringify(sortNestedObjects(projection, true));
}

function rejectDuplicateJsonKeys(source, diagnostic) {
  let index = 0;
  const skipWhitespace = () => {
    while (/\s/u.test(source[index] ?? "")) index += 1;
  };
  const parseString = () => {
    const start = index;
    index += 1;
    while (index < source.length) {
      if (source[index] === "\\") index += 2;
      else if (source[index] === '"') {
        index += 1;
        try {
          return JSON.parse(source.slice(start, index));
        } catch {
          return null;
        }
      } else index += 1;
    }
    return null;
  };
  const parseValue = () => {
    skipWhitespace();
    if (source[index] === "{") {
      index += 1;
      const keys = new Set();
      skipWhitespace();
      while (index < source.length && source[index] !== "}") {
        if (source[index] !== '"') return;
        const key = parseString();
        if (key === null) return;
        if (keys.has(key)) fail(diagnostic, key);
        keys.add(key);
        skipWhitespace();
        if (source[index] !== ":") return;
        index += 1;
        parseValue();
        skipWhitespace();
        if (source[index] !== ",") break;
        index += 1;
        skipWhitespace();
      }
      if (source[index] === "}") index += 1;
      return;
    }
    if (source[index] === "[") {
      index += 1;
      skipWhitespace();
      while (index < source.length && source[index] !== "]") {
        parseValue();
        skipWhitespace();
        if (source[index] !== ",") break;
        index += 1;
      }
      if (source[index] === "]") index += 1;
      return;
    }
    if (source[index] === '"') {
      parseString();
      return;
    }
    while (index < source.length && !/[\s,\]}]/u.test(source[index])) index += 1;
  };
  parseValue();
}

function extractMarkedJson(source, start, end, diagnostic, duplicateDiagnostic = null) {
  const starts = source.split(start).length - 1;
  const ends = source.split(end).length - 1;
  if (starts !== 1 || ends !== 1) fail(diagnostic);
  const startAt = source.indexOf(start) + start.length;
  const endAt = source.indexOf(end, startAt);
  if (endAt < startAt) fail(diagnostic);
  const body = source.slice(startAt, endAt).trim();
  const match = /^```json\s*\n([\s\S]*?)\n```$/.exec(body);
  if (!match) fail(diagnostic);
  if (duplicateDiagnostic) rejectDuplicateJsonKeys(match[1], duplicateDiagnostic);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    fail(diagnostic, `Invalid JSON between ${start} and ${end}: ${error.message}`);
  }
}

export function extractCanonicalContract(goal) {
  const contract = extractMarkedJson(goal, CONTRACT_START, CONTRACT_END, "contract-json-markers");
  validateCanonicalContract(contract);
  return contract;
}

export function extractLoopStatus(statusSource) {
  return extractMarkedJson(
    statusSource,
    STATUS_START,
    STATUS_END,
    "loop-status-markers",
    "loop-status-duplicate-field",
  );
}

function validateCanonicalContract(contract) {
  if (contract.schemaVersion !== 10) fail("contract-schema-version");
  exactKeys(
    contract,
    [
      "schemaVersion",
      "pins",
      "implementationDependencyTargets",
      "targets",
      "platformPackages",
      "tarballContents",
      "milestones",
      "milestonePrerequisites",
      "reviewPolicy",
      "taskStatePolicy",
      "rustSignaturePolicy",
      "documentationRule",
      "primaryEvidenceRules",
      "runtimeEvidencePathRules",
      "taskAcceptances",
      "publicRuntimeExportsByOwner",
      "publicDeclarationExportsByOwner",
      "publicClassMembersByOwner",
      "publicDeclarationContract",
      "generatedEvidenceIdRules",
      "generatedEvidenceOwners",
      "childIsolationRules",
      "nodeIdCaseKinds",
      "nodeIdDeclarationBindingRules",
      "nodeIdRolesByOwner",
      "constructionFailureCasesByOwner",
      "ordinaryFailureKinds",
      "stateComparisonRules",
      "publicMutationFailuresByOwner",
      "nodeIdFailuresUseBeforeAfterForMutationOwners",
      "numericFamilies",
      "styleFields",
      "nullableStyleFields",
      "styleAcceptanceSuffixes",
      "layoutFields",
      "detailedFields",
      "upstream",
      "namedDataGroups",
      "namedDataShapes",
      "errors",
      "secondaryRustTestNameRule",
      "javascriptConveniencesByOwner",
    ],
    "contract-schema-unknown-field",
  );
  validateRuleSchema(contract);
  const taskIds = Object.values(contract.milestones).flat();
  unique(taskIds, "task-drift/task-duplicate");
  if (
    JSON.stringify(Object.keys(contract.taskAcceptances).sort(asciiCompare)) !==
    JSON.stringify([...taskIds].sort(asciiCompare))
  ) {
    fail("task-drift/task-missing");
  }
  for (const taskId of taskIds) {
    const slugs = contract.taskAcceptances[taskId];
    if (!Array.isArray(slugs) || slugs.length === 0) {
      fail("task-drift/acceptance-missing");
    }
    unique(slugs, "task-drift/acceptance-duplicate");
  }
  validateContractReferences(contract, taskIds);
  if (
    contract.primaryEvidenceRules.expandedOrdinaryAcceptanceCount !==
    taskIds.reduce((count, taskId) => count + contract.taskAcceptances[taskId].length, 0)
  ) {
    fail("task-drift/acceptance-count");
  }
}

function taskRecords(contract) {
  const records = [];
  for (const [milestone, taskIds] of Object.entries(contract.milestones)) {
    taskIds.forEach((id, order) => {
      records.push({
        id,
        milestone,
        order,
        documentation: contract.documentationRule.replace("<TASK-ID>", id),
      });
    });
  }
  return records;
}

function resolveRuntimePath(contract, owner, acceptanceId, modality) {
  const rules = contract.runtimeEvidencePathRules;
  let path = rules.acceptanceOverrides[acceptanceId];
  if (!path) path = rules.overrides[owner];
  if (!path) {
    path = owner.startsWith(rules.apiTaskPrefix) ? rules.api : rules.default;
    path = path.replaceAll("<TASK-ID>", owner);
  }
  const root = rules.collectionRootsByModality[modality];
  if (root && !path.startsWith(root)) {
    fail(`task-drift/acceptance-path/${acceptanceId}`);
  }
  return path;
}

function resolveEvidence(contract, owner, acceptanceId, family = null) {
  const rules = contract.primaryEvidenceRules;
  let modality;
  if (family) {
    modality = rules.generatedModalities[family];
    if (family === "atomicity") {
      const failureKind = acceptanceId.split("/").at(-1);
      const matches = rules.generatedModalityOverrides.filter(
        (override) => override.family === family && override.selector.failureKind === failureKind,
      );
      if (matches.length > 1) fail("task-drift/generated-modality-override");
      if (matches.length === 1) modality = matches[0].modality;
    }
  } else {
    modality =
      rules.acceptanceOverrides[acceptanceId] ??
      rules.taskDefaults.overrides[owner] ??
      rules.taskDefaults.default;
  }
  const definition = rules.modalities[modality];
  if (!definition) fail("task-drift/evidence-modality");
  let path = definition.path;
  if (definition.pathRule === "runtimeEvidencePathRules") {
    path = resolveRuntimePath(contract, owner, acceptanceId, modality);
  }
  if (path) {
    path = path
      .replaceAll("<TASK-ID>", owner)
      .replaceAll("<SLUG>", acceptanceId.slice(owner.length + 1));
  }
  let identity = definition.identity;
  if (identity) {
    identity = identity
      .replaceAll("<ACCEPTANCE-ID>", acceptanceId)
      .replaceAll("<TASK-ID-LOWER-SNAKE>", owner.toLowerCase().replaceAll("-", "_"))
      .replaceAll(
        "<SLUG-LOWER-SNAKE>",
        acceptanceId
          .slice(owner.length + 1)
          .toLowerCase()
          .replaceAll("-", "_"),
      );
  }
  return {
    id: acceptanceId,
    owner,
    family,
    modality,
    runner: definition.runner,
    path,
    identity,
  };
}

function expandOrdinary(contract) {
  return taskRecords(contract).flatMap(({ id: owner }) =>
    contract.taskAcceptances[owner].map((slug) =>
      resolveEvidence(contract, owner, `${owner}/${slug}`),
    ),
  );
}

function expandStyle(contract) {
  const owner = contract.generatedEvidenceOwners.style;
  return contract.styleFields.flatMap(([styleId, field]) =>
    contract.styleAcceptanceSuffixes.map((suffix) => ({
      ...resolveEvidence(contract, owner, `${styleId}/${suffix}`, "style"),
      styleId,
      field,
      suffix,
    })),
  );
}

function expandNodeIds(contract) {
  const owner = contract.generatedEvidenceOwners.nodeIdScalar;
  const records = [];
  const caseKinds = Object.keys(contract.nodeIdCaseKinds);
  for (const [apiOwner, roles] of Object.entries(contract.nodeIdRolesByOwner)) {
    for (const role of roles) {
      if (role.invalidPositions) {
        const validId = `NODEID/${apiOwner}/${role.id}/valid`;
        records.push({
          ...resolveEvidence(contract, owner, validId, "nodeIdCollectionValid"),
          apiOwner,
          roleId: role.id,
          rolePath: role.path,
          caseKind: "valid",
          position: null,
        });
        for (const caseKind of caseKinds.filter((kind) => kind !== "valid")) {
          for (const position of role.invalidPositions) {
            const id = `NODEID/${apiOwner}/${role.id}/${caseKind}/${position}`;
            records.push({
              ...resolveEvidence(contract, owner, id, "nodeIdCollectionInvalid"),
              apiOwner,
              roleId: role.id,
              rolePath: role.path,
              caseKind,
              position,
              error: contract.nodeIdCaseKinds[caseKind],
            });
          }
        }
      } else {
        for (const caseKind of caseKinds) {
          const id = `NODEID/${apiOwner}/${role.id}/${caseKind}`;
          records.push({
            ...resolveEvidence(contract, owner, id, "nodeIdScalar"),
            apiOwner,
            roleId: role.id,
            rolePath: role.path,
            caseKind,
            position: null,
            error: contract.nodeIdCaseKinds[caseKind],
          });
        }
      }
    }
  }
  return records;
}

function expandAtomicity(contract) {
  const owner = contract.generatedEvidenceOwners.atomicity;
  return Object.entries(contract.publicMutationFailuresByOwner).flatMap(
    ([apiOwner, failureKinds]) =>
      failureKinds.map((failureKind) => ({
        ...resolveEvidence(contract, owner, `ATOMICITY/${apiOwner}/${failureKind}`, "atomicity"),
        apiOwner,
        failureKind,
        comparison: contract.ordinaryFailureKinds[failureKind].atomicity,
        error: contract.ordinaryFailureKinds[failureKind].error,
      })),
  );
}

function expandMinimumNode(contract, primary) {
  const projection = contract.primaryEvidenceRules.minimumNodeCompatibility;
  return primary
    .filter(
      (record) =>
        record.modality === projection.sourcePrimaryModality &&
        projection.sourceOwnerPrefixes.some((prefix) => record.owner.startsWith(prefix)),
    )
    .map((record) => ({
      id: `${record.id}::node-${projection.runtime}`,
      sourceId: record.id,
      owner: record.owner,
      runtime: projection.runtime,
      runner: projection.runner,
      path: contract.primaryEvidenceRules.modalities["minimum-node-js"].path,
    }));
}

function expandSurfaceProbes(contract) {
  const runtime = contract.primaryEvidenceRules.minimumNodeCompatibility.runtime;
  const records = [];
  for (const [owner, names] of Object.entries(contract.publicRuntimeExportsByOwner)) {
    for (const name of names) {
      records.push({
        id: `MATURITY-002/minimum-node::surface/runtime-export/${owner}/${name}`,
        kind: "runtime-export",
        owner,
        name,
        runtime,
      });
    }
  }
  for (const [owner, names] of Object.entries(contract.publicClassMembersByOwner)) {
    for (const name of names) {
      records.push({
        id: `MATURITY-002/minimum-node::surface/class-member/${owner}/${name}`,
        kind: "class-member",
        owner,
        name,
        runtime,
      });
    }
  }
  return records;
}

function expandChildIsolation(contract, ordinary, nodeIds, atomicity) {
  const ids = new Set(contract.childIsolationRules.ordinaryAcceptanceIds);
  for (const record of nodeIds) {
    if (record.caseKind !== "valid") ids.add(record.id);
  }
  for (const record of atomicity) {
    if (record.failureKind === "tree-busy") ids.add(record.id);
  }
  const primaryById = new Map(
    [...ordinary, ...nodeIds, ...atomicity].map((record) => [record.id, record]),
  );
  return [...ids].sort(asciiCompare).map((id) => {
    const primary = primaryById.get(id);
    if (!primary) fail("task-drift/child-isolation-source");
    return { id, owner: primary.owner, path: primary.path };
  });
}

export function expandContract(contract) {
  const tasks = taskRecords(contract);
  const ordinary = expandOrdinary(contract);
  const style = expandStyle(contract);
  const nodeId = expandNodeIds(contract);
  const atomicity = expandAtomicity(contract);
  const primary = [...ordinary, ...style, ...nodeId, ...atomicity];
  unique(
    primary.map(({ id }) => id),
    "task-drift/generated-id-duplicate",
  );
  const minimumNode = expandMinimumNode(contract, primary);
  const surfaceProbes = expandSurfaceProbes(contract);
  const childIsolation = expandChildIsolation(contract, ordinary, nodeId, atomicity);
  const expected = contract.primaryEvidenceRules;
  if (ordinary.length !== expected.expandedOrdinaryAcceptanceCount) {
    fail("task-drift/ordinary-acceptance-count");
  }
  if (primary.length !== expected.expandedPrimaryAcceptanceCount) {
    fail("task-drift/primary-acceptance-count");
  }
  if (minimumNode.length !== expected.minimumNodeCompatibility.expandedSecondaryAcceptanceCount) {
    fail("task-drift/minimum-node-secondary-count");
  }
  if (surfaceProbes.length !== expected.minimumNodeCompatibility.expandedSurfaceProbeCount) {
    fail("task-drift/surface-probe-count");
  }
  if (childIsolation.length !== contract.childIsolationRules.expandedChildAcceptanceCount) {
    fail("task-drift/child-isolation-count");
  }
  return {
    tasks,
    evidence: {
      ordinary,
      style,
      nodeId,
      atomicity,
      primary,
      minimumNode,
      surfaceProbes,
      childIsolation,
    },
    artifacts: {
      runtimeExportsByOwner: contract.publicRuntimeExportsByOwner,
      declarationExportsByOwner: contract.publicDeclarationExportsByOwner,
      classMembersByOwner: contract.publicClassMembersByOwner,
    },
  };
}

function applyTemplate(template, values) {
  const used = new Set();
  const result = template.replace(/\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g, (_, key) => {
    if (!(key in values)) fail("declaration-template-placeholder");
    used.add(key);
    return values[key];
  });
  if (result.includes("{{") || used.size !== Object.keys(values).length) {
    fail("declaration-template-placeholder");
  }
  return result;
}

function numericFamilyEntries(contract) {
  const rule = contract.publicDeclarationContract.numericFamilyGeneration;
  const order = contract.publicRuntimeExportsByOwner[rule.owner];
  return order.map((family) => [family, contract.numericFamilies[family]]);
}

function numericStatements(contract) {
  const rule = contract.publicDeclarationContract.numericFamilyGeneration;
  return numericFamilyEntries(contract).flatMap(([family, members]) => {
    const memberDeclarations = members
      .map((member, index) => applyTemplate(rule.memberTemplate, { member, index: String(index) }))
      .join(" ");
    return [
      applyTemplate(rule.valueTemplate, { family, memberDeclarations }),
      applyTemplate(rule.typeTemplate, { family }),
    ];
  });
}

function numericTypeScriptSource(contract) {
  const rule = contract.publicDeclarationContract.numericFamilyGeneration;
  const enumValue = contract.publicDeclarationContract.fixedStatementsByOwner[rule.owner][0];
  const families = numericFamilyEntries(contract).flatMap(([family, members]) => [
    `export const ${family} = Object.freeze({\n${members
      .map((member, index) => `  ${member}: ${index},`)
      .join("\n")}\n} as const);`,
    applyTemplate(rule.typeTemplate, { family }),
  ]);
  return `// Generated from tools/taffy-api/contract.json. Do not edit.\n\n${[enumValue, ...families].join("\n\n")}\n`;
}

function numericRustSource(contract) {
  const families = numericFamilyEntries(contract).map(
    ([family, members]) => `#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u8)]
pub(crate) enum ${family}Code {
${members.map((member, index) => `    ${member} = ${index},`).join("\n")}
}

impl TryFrom<i64> for ${family}Code {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
${members.map((member, index) => `            ${index} => Ok(Self::${member}),`).join("\n")}
            _ => Err(()),
        }
    }
}`,
  );
  return `// Generated from tools/taffy-api/contract.json. Do not edit.\n#![allow(dead_code)]\n\n${families.join("\n\n")}\n`;
}

function numericTypeFixtureSource(contract) {
  const entries = numericFamilyEntries(contract);
  const imports = entries
    .flatMap(([family]) => [`  ${family},`, `  type ${family} as ${family}Value,`])
    .join("\n");
  const narrowers = entries.map(
    ([family, members]) => `function narrow${family}(value: ${family}Value): void {
  switch (value) {
${members
  .map(
    (member, index) => `    case ${family}.${member}: {
      const narrowed: ${index} = value;
      void narrowed;
      return;
    }`,
  )
  .join("\n")}
  }
  value satisfies never;
}

void narrow${family};`,
  );
  return `// Generated from tools/taffy-api/contract.json. Do not edit.\n\nimport {\n${imports}\n} from "@taffyjs/node";\n\n${narrowers.join("\n\n")}\n`;
}

function geometryStatements(contract) {
  const rule = contract.publicDeclarationContract.geometryGeneration;
  return rule.familyOrder.flatMap((family) => {
    const components = rule.families[family];
    const input = components
      .map((component) => applyTemplate(rule.inputComponentTemplate, { component }))
      .join(" ");
    const partial = components
      .map((component) => applyTemplate(rule.partialInputComponentTemplate, { component }))
      .join(" ");
    const output = components
      .map((component) => applyTemplate(rule.outputComponentTemplate, { component }))
      .join(" ");
    return [
      applyTemplate(rule.inputTemplate, {
        family,
        componentDeclarations: input,
      }),
      applyTemplate(rule.partialInputTemplate, {
        family,
        componentDeclarations: partial,
      }),
      applyTemplate(rule.outputTemplate, {
        family,
        componentDeclarations: output,
      }),
    ];
  });
}

function styleStatements(contract) {
  const rule = contract.publicDeclarationContract.styleGeneration;
  const nullable = new Set(contract.nullableStyleFields);
  const inputProperties = contract.styleFields
    .map(([styleId, field]) => {
      const [inputType] = rule.typesByField[field];
      return applyTemplate(rule.inputPropertyTemplate, {
        nullableJSDocIfRequired: nullable.has(styleId) ? `${rule.nullableInputJSDoc} ` : "",
        field,
        inputType,
      });
    })
    .join(" ");
  const outputProperties = contract.styleFields
    .map(([, field]) => {
      const [, outputType] = rule.typesByField[field];
      return applyTemplate(rule.outputPropertyTemplate, { field, outputType });
    })
    .join(" ");
  return [
    applyTemplate(rule.inputTemplate, {
      propertyDeclarations: inputProperties,
    }),
    applyTemplate(rule.outputTemplate, {
      propertyDeclarations: outputProperties,
    }),
  ];
}

function stateImplemented(taskStates, owner) {
  return taskStates === null || IMPLEMENTED_STATES.has(taskStates[owner]);
}

export function assembleDeclaration(contract, taskStates = null) {
  const declaration = contract.publicDeclarationContract;
  const sections = {
    privateSupportStatements: stateImplemented(taskStates, "TYPE-NODEID-001")
      ? declaration.privateSupportStatements
      : [],
    "INFRA-003.fixed": stateImplemented(taskStates, "INFRA-003")
      ? declaration.fixedStatementsByOwner["INFRA-003"]
      : [],
    "INFRA-003.numeric": stateImplemented(taskStates, "INFRA-003")
      ? numericStatements(contract)
      : [],
    "TYPE-NODEID-001.fixed": stateImplemented(taskStates, "TYPE-NODEID-001")
      ? declaration.fixedStatementsByOwner["TYPE-NODEID-001"]
      : [],
    "TYPE-GEOMETRY-001.generated": stateImplemented(taskStates, "TYPE-GEOMETRY-001")
      ? geometryStatements(contract)
      : [],
    "TYPE-LENGTH-001.fixed": stateImplemented(taskStates, "TYPE-LENGTH-001")
      ? declaration.fixedStatementsByOwner["TYPE-LENGTH-001"]
      : [],
    "TYPE-AVAILABLE-001.fixed": stateImplemented(taskStates, "TYPE-AVAILABLE-001")
      ? declaration.fixedStatementsByOwner["TYPE-AVAILABLE-001"]
      : [],
    "TYPE-GRID-001.fixed": stateImplemented(taskStates, "TYPE-GRID-001")
      ? declaration.fixedStatementsByOwner["TYPE-GRID-001"]
      : [],
    "TYPE-STYLE-001.generated": stateImplemented(taskStates, "TYPE-STYLE-001")
      ? styleStatements(contract)
      : [],
    "TYPE-LAYOUT-001.fixed": stateImplemented(taskStates, "TYPE-LAYOUT-001")
      ? declaration.fixedStatementsByOwner["TYPE-LAYOUT-001"]
      : [],
    "TYPE-DETAIL-001.fixed": stateImplemented(taskStates, "TYPE-DETAIL-001")
      ? declaration.fixedStatementsByOwner["TYPE-DETAIL-001"]
      : [],
    "TYPE-MEASURE-001.fixed": stateImplemented(taskStates, "TYPE-MEASURE-001")
      ? declaration.fixedStatementsByOwner["TYPE-MEASURE-001"]
      : [],
    "API-TREE-016.fixed": stateImplemented(taskStates, "API-TREE-016")
      ? declaration.fixedStatementsByOwner["API-TREE-016"]
      : [],
    "API-TREE-030.fixed": stateImplemented(taskStates, "API-TREE-030")
      ? declaration.fixedStatementsByOwner["API-TREE-030"]
      : [],
    "API-TREE-031.fixed": stateImplemented(taskStates, "API-TREE-031")
      ? declaration.fixedStatementsByOwner["API-TREE-031"]
      : [],
    "API-TREE-001.class": [],
  };
  if (stateImplemented(taskStates, declaration.classDeclaration.owner)) {
    const memberOwner = new Map();
    for (const [owner, names] of Object.entries(contract.publicClassMembersByOwner)) {
      for (const name of names) memberOwner.set(name, owner);
    }
    const members = declaration.classDeclaration.members
      .filter(([name]) => stateImplemented(taskStates, memberOwner.get(name)))
      .map(([, statement]) => statement)
      .join(" ");
    sections["API-TREE-001.class"] = [`${declaration.classDeclaration.header} { ${members} }`];
  }
  const statements = declaration.serialization.assemblyOrder
    .flatMap((key) => sections[key])
    .join(
      declaration.serialization.unformattedSeparator ===
        "two LF characters between declaration statements"
        ? "\n\n"
        : fail("declaration-separator"),
    );
  return statements.length === 0 ? "export {};\n" : `${statements}\n`;
}

async function runWithInput(command, args, input, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} exited ${code}: ${Buffer.concat(stderr)}`));
        return;
      }
      resolvePromise(Buffer.concat(stdout).toString("utf8"));
    });
    child.stdin.end(input);
  });
}

async function runCommand(command, args, cwd, { allowFailure = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const result = {
        code,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      };
      if (code !== 0 && !allowFailure) {
        reject(new Error(`${command} ${args.join(" ")} exited ${code}: ${result.stderr}`));
        return;
      }
      resolvePromise(result);
    });
  });
}

export async function formatDeclaration(source, root) {
  return runWithInput("vp", ["exec", "oxfmt", "--stdin-filepath", "index.d.ts"], source, root);
}

async function formatTypeScriptArtifact(source, root, path) {
  return runWithInput("vp", ["exec", "oxfmt", "--stdin-filepath", path], source, root);
}

async function formatRustArtifact(source, root) {
  return runWithInput("rustfmt", ["--emit", "stdout", "--edition", "2024"], source, root);
}

export function stripDeclarationJsDoc(source) {
  let output = "";
  let index = 0;
  while (index < source.length) {
    const quote = source[index];
    if (quote === '"' || quote === "'" || quote === "`") {
      const end = skipQuotedSource(source, index, quote);
      if (end === -1) fail("declaration-jsdoc-unterminated-string");
      output += source.slice(index, end);
      index = end;
      continue;
    }
    if (source.startsWith("//", index)) {
      const newline = source.indexOf("\n", index + 2);
      const end = newline === -1 ? source.length : newline + 1;
      output += source.slice(index, end);
      index = end;
      continue;
    }
    if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      if (end === -1) fail("declaration-jsdoc-unterminated-comment");
      const comment = source.slice(index, end + 2);
      if (source.startsWith("/**", index)) {
        if (/@(?:deprecated|internal|private|protected|experimental)\b/u.test(comment)) {
          fail("declaration-jsdoc-forbidden-tag");
        }
        output += comment.replace(/[^\r\n]/gu, " ");
      } else {
        output += comment;
      }
      index = end + 2;
      continue;
    }
    output += source[index];
    index += 1;
  }
  return output;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function validateNullableStyleJsDoc(contract, actual) {
  const rule = contract.publicDeclarationContract.styleGeneration;
  const fields = new Map(contract.styleFields);
  const exactComment = escapeRegExp(rule.nullableInputJSDoc);
  for (const styleId of contract.nullableStyleFields) {
    const field = fields.get(styleId);
    if (!field) fail("declaration-jsdoc-nullable-field");
    const matches = actual.match(new RegExp(`${exactComment}\\s*${escapeRegExp(field)}\\?:`, "gu"));
    if (matches?.length !== 1) fail("declaration-jsdoc-nullable-field", field);
  }
  const allCanonicalComments = actual.match(new RegExp(exactComment, "gu")) ?? [];
  if (allCanonicalComments.length !== contract.nullableStyleFields.length) {
    fail("declaration-jsdoc-nullable-count");
  }
}

function meaningfulJsDocBefore(source, offset, diagnostic) {
  const match = /\/\*\*([\s\S]*?)\*\/\s*$/u.exec(source.slice(0, offset));
  if (!match) fail(diagnostic);
  const words =
    match[1]
      .replace(/^\s*\*\s?/gmu, " ")
      .replace(/@[A-Za-z][^\n]*/gu, " ")
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length < 3 || words.join("").length < 16) fail(diagnostic);
}

export function validateWholeSurfaceJsDoc(_contract, actual) {
  const tokens = tokenizeJavaScript(actual, "packages/taffyjs-node/index.d.ts");
  const exports = tokens.filter(
    (token) =>
      token.value === "export" && token.brace === 0 && token.bracket === 0 && token.paren === 0,
  );
  if (exports.length === 0) fail("declaration-jsdoc-public-symbol");
  for (const token of exports) {
    meaningfulJsDocBefore(actual, token.start, "declaration-jsdoc-public-symbol");
  }
  const memberStarts = tokens.filter((token, index) => {
    if (token.brace === 0 || token.paren !== 0 || token.bracket !== 0) return false;
    if (token.type !== "identifier" && token.value !== "[") return false;
    const previous = tokens[index - 1];
    return (
      (previous?.value === "{" && previous.brace === token.brace - 1) ||
      (previous?.value === ";" && previous.brace === token.brace)
    );
  });
  for (const token of memberStarts) {
    meaningfulJsDocBefore(actual, token.start, "declaration-jsdoc-public-member");
  }
}

async function typecheckDeclaration(root, path, expectedVersion) {
  const compiler = resolve(root, "packages/taffyjs-node/node_modules/.bin/tsc");
  const version = await runCommand(compiler, ["--version"], root);
  if (version.stdout.trim() !== `Version ${expectedVersion}`) {
    fail("pin-drift/typescript-version");
  }
  const result = await runCommand(
    compiler,
    [
      "--ignoreConfig",
      "--noEmit",
      "--strict",
      "--exactOptionalPropertyTypes",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      path,
    ],
    root,
    { allowFailure: true },
  );
  if (result.code !== 0) {
    fail("declaration-typecheck", `${path}:\n${result.stdout}${result.stderr}`);
  }
}

async function validateRealDeclarations(root, contract, status, completeExpectedDeclaration) {
  const completeExpectedPath = resolve(root, "tools/taffy-api/expected-declaration.d.ts");
  await typecheckDeclaration(root, completeExpectedPath, contract.pins.typescript);
  if (!IMPLEMENTED_STATES.has(status.taskStates["INFRA-002"])) return;

  const actualPath = resolve(root, "packages/taffyjs-node/index.d.ts");
  const actual = await readFile(actualPath, "utf8");
  const projectedExpected = await formatDeclaration(
    assembleDeclaration(contract, status.taskStates),
    root,
  );
  const [expectedSkeleton, actualSkeleton] = await Promise.all([
    formatDeclaration(stripDeclarationJsDoc(projectedExpected), root),
    formatDeclaration(stripDeclarationJsDoc(actual), root),
  ]);
  if (actualSkeleton !== expectedSkeleton) fail("declaration-projection-drift");
  if (IMPLEMENTED_STATES.has(status.taskStates["TYPE-STYLE-001"])) {
    validateNullableStyleJsDoc(contract, actual);
  }
  if (IMPLEMENTED_STATES.has(status.taskStates["MATURITY-001"])) {
    validateWholeSurfaceJsDoc(contract, actual);
  }
  await typecheckDeclaration(root, actualPath, contract.pins.typescript);
  if (completeExpectedDeclaration.length === 0) fail("generated-declaration-drift");
}

export async function generateArtifacts({ root, goal, write = false }) {
  const canonical = extractCanonicalContract(goal);
  const expanded = expandContract(canonical);
  const generated = { ...canonical, generated: expanded };
  const contractJson = await runWithInput(
    "vp",
    ["exec", "oxfmt", "--stdin-filepath", "contract.json"],
    canonicalJson(generated),
    root,
  );
  const expectedDeclaration = await formatDeclaration(assembleDeclaration(canonical), root);
  const numericTypeScript = await formatTypeScriptArtifact(
    numericTypeScriptSource(canonical),
    root,
    NUMERIC_TYPESCRIPT_PATH,
  );
  const numericRust = await formatRustArtifact(numericRustSource(canonical), root);
  const numericTypeFixture = await formatTypeScriptArtifact(
    numericTypeFixtureSource(canonical),
    root,
    NUMERIC_TYPE_FIXTURE_PATH,
  );
  if (write) {
    await mkdir(resolve(root, dirname(NUMERIC_TYPESCRIPT_PATH)), { recursive: true });
    await mkdir(resolve(root, dirname(NUMERIC_RUST_PATH)), { recursive: true });
    await mkdir(resolve(root, dirname(NUMERIC_TYPE_FIXTURE_PATH)), { recursive: true });
    await writeFile(resolve(root, "tools/taffy-api/contract.json"), contractJson);
    await writeFile(
      resolve(root, "tools/taffy-api/expected-declaration.d.ts"),
      expectedDeclaration,
    );
    await writeFile(resolve(root, NUMERIC_TYPESCRIPT_PATH), numericTypeScript);
    await writeFile(resolve(root, NUMERIC_RUST_PATH), numericRust);
    await writeFile(resolve(root, NUMERIC_TYPE_FIXTURE_PATH), numericTypeFixture);
  }
  return {
    canonical,
    expanded,
    contractJson,
    expectedDeclaration,
    numericTypeScript,
    numericRust,
    numericTypeFixture,
  };
}

function expectedSourceModel(contract) {
  return {
    taffyTree: clone(contract.upstream.taffyTree),
    traversePartialTree: clone(contract.upstream.traversePartialTree),
    adjacentRoots: clone(contract.upstream.adjacentRoots),
    namedDataGroups: clone(contract.namedDataGroups),
    namedDataShapes: clone(contract.namedDataShapes),
  };
}

function artifactModel(contract) {
  return {
    runtime: Object.fromEntries(
      Object.entries(contract.publicRuntimeExportsByOwner).map(([owner, names]) => [
        owner,
        [...names],
      ]),
    ),
    declaration: Object.fromEntries(
      Object.entries(contract.publicDeclarationExportsByOwner).map(([owner, names]) => [
        owner,
        [...names],
      ]),
    ),
    classMembers: Object.fromEntries(
      Object.entries(contract.publicClassMembersByOwner).map(([owner, names]) => [
        owner,
        [...names],
      ]),
    ),
  };
}

function makeReview(contract, final = false) {
  const activeMilestone = final ? "M4" : "M0";
  const currentTaskIds = [...contract.milestones[activeMilestone]];
  const reviewerSlots = final
    ? [...contract.reviewPolicy.finalRoles]
    : contract.reviewPolicy.perTaskVerdictMatrix.ordinaryReviewerSlots.map(({ slot }) => slot);
  const candidateCommit = "a".repeat(40);
  const projection = {
    contractBaseCommit: "b".repeat(40),
    candidateCommit,
    previousAcceptedMilestoneCommit: final ? "c".repeat(40) : null,
    activeMilestone,
    reviewRoundId: `${activeMilestone}-round-1`,
    currentTaskIds,
    reviewerSlots,
    inspectionCommands: ["git diff --check"],
  };
  const serialized = serializeReviewInputProjection(projection);
  const hash = sha256(serialized);
  const reports = reviewerSlots.map((slot, index) => ({
    slot,
    reviewerIdentity: `fresh-agent-${index + 1}`,
    startCandidateCommit: candidateCommit,
    endCandidateCommit: candidateCommit,
    startReviewInputStatusHash: hash,
    endReviewInputStatusHash: hash,
    earlierImpact: [],
  }));
  const verdicts = currentTaskIds.flatMap((taskId) =>
    reviewerSlots.map((slot) => ({ taskId, slot, verdict: "PASS" })),
  );
  return {
    projection,
    hash,
    reports,
    verdicts,
    findings: [],
    closures: [],
    blockers: [],
    transition: final ? "complete" : "accepted",
  };
}

class RepositoryFixture {
  constructor(data) {
    this.data = data;
  }

  copy() {
    return new RepositoryFixture(clone(this.data));
  }

  withTaskState(taskId, state) {
    const fixture = this.copy();
    fixture.data.status.taskStates[taskId] = state;
    return fixture;
  }

  mutate(kind, argument) {
    const fixture = this.copy();
    const data = fixture.data;
    const pin = (key, value = "drift") => {
      data.actualPins[key] = value;
    };
    switch (kind) {
      case "contract-unknown-field":
        data.contract.unknown = true;
        break;
      case "rule-unknown-field":
        data.contract.reviewPolicy.unknown = true;
        break;
      case "cargo-napi-requirement":
        data.cargoRequirements.napi = "^3.12.0";
        break;
      case "cargo-napi-derive-requirement":
        data.cargoRequirements["napi-derive"] = "^3.6.2";
        break;
      case "cargo-napi-build-requirement":
        data.cargoRequirements["napi-build"] = "^2.4.0";
        break;
      case "cargo-taffy-requirement":
        data.cargoRequirements.taffy = "^0.13.0";
        break;
      case "cargo-lock-version":
        data.lockVersions.taffy = "0.13.1";
        break;
      case "taffy-checksum":
        pin("taffyChecksum");
        break;
      case "taffy-default-features":
        pin("taffyDefaultFeatures", false);
        break;
      case "taffy-resolved-features":
        data.actualPins.taffyResolvedFeatures.pop();
        break;
      case "node-range":
        pin("node", ">=24");
        break;
      case "minimum-node-runtime":
        pin("minimumNodeTestRuntime", "24.0.0");
        break;
      case "oxfmt-version":
        pin("oxfmt", "0.62.0");
        break;
      case "types-node-target":
        data.dependencyTargets["@types/node"] = "24.0.0";
        break;
      case "packed-engines-node":
        data.packedEnginesNode = ">=24";
        break;
      case "method-missing":
        delete data.source.taffyTree.methods.new;
        break;
      case "method-added":
        data.source.taffyTree.methods.extra = {
          signature: "fn extra()",
          disposition: "exclude:capacity-only",
        };
        break;
      case "method-renamed":
        data.source.taffyTree.methods.renamed = data.source.taffyTree.methods.new;
        delete data.source.taffyTree.methods.new;
        break;
      case "method-primitive-argument":
        data.source.taffyTree.methods.with_capacity.signature =
          "fn with_capacity(capacity: u64) -> Self";
        break;
      case "method-return-type":
        data.source.taffyTree.methods.total_node_count.signature =
          "fn total_node_count(&self) -> u64";
        break;
      case "method-feature-gate":
        data.source.taffyTree.methodFeatureOverrides.print_tree = ["taffy_tree"];
        break;
      case "named-data-field":
        data.source.namedDataShapes.Layout.fields.extra = "f32";
        break;
      case "named-data-variant":
        data.source.namedDataShapes.Display.variants.Extra = null;
        break;
      case "named-data-payload":
        data.source.namedDataShapes.AvailableSpace.variants.Definite = ["f64"];
        break;
      case "named-data-feature-gate":
        data.source.namedDataShapes.Display.variantCfg.Grid = true;
        break;
      case "adjacent-root":
        data.source.adjacentRoots.pop();
        break;
      case "task-missing":
        data.tasks.pop();
        break;
      case "task-duplicate":
        data.tasks.push(data.tasks[0]);
        break;
      case "owner-missing":
        delete data.artifacts.runtime["INFRA-003"];
        break;
      case "owner-duplicate":
        data.artifacts.runtime["TYPE-LENGTH-001"].push("Display");
        break;
      case "acceptance-missing":
        data.primary.splice(
          data.primary.findIndex(({ id }) => id === "API-TREE-001/construct"),
          1,
        );
        break;
      case "acceptance-duplicate":
        data.primary.push(clone(data.primary[0]));
        break;
      case "generated-id-missing":
        data.primary.splice(
          data.primary.findIndex(({ id }) => id.startsWith("STYLE-F")),
          1,
        );
        break;
      case "minimum-node-secondary-missing":
        data.minimumNode.pop();
        break;
      case "surface-probe-missing":
        data.surfaceProbes.pop();
        break;
      case "artifact-projection-missing":
        data.artifacts.classMembers["API-TREE-001"] = [];
        break;
      case "status-entry-missing":
        delete data.status.taskStates["INFRA-001"];
        break;
      case "evidence-entry-missing":
        data.primary.find(({ id }) => id === "API-TREE-001/construct").path = null;
        break;
      case "declaration-signature":
        data.declaration = data.declaration.replace(
          "getNodeCount(): number;",
          "getNodeCount(): string;",
        );
        break;
      case "declaration-optional-marker":
        data.declaration = data.declaration.replace("lineNames?:", "lineNames:");
        break;
      case "declaration-readonly-marker":
        data.declaration = data.declaration.replace("readonly order:", "order:");
        break;
      case "declaration-overload-count":
        data.declaration += "\nexport declare class TaffyTree { clear(): void; }\n";
        break;
      case "node-id-role-binding":
        data.nodeIdRoles["API-TREE-008"][0].path = "missing";
        break;
      case "node-id-collection-valid-position": {
        const record = data.primary.find(
          ({ family, caseKind }) => family === "nodeIdCollectionValid" && caseKind === "valid",
        );
        record.position = "first";
        break;
      }
      case "node-id-collection-invalid-position": {
        const record = data.primary.find(({ family }) => family === "nodeIdCollectionInvalid");
        record.position = null;
        break;
      }
      case "remove-acceptance-path-override": {
        const record = data.primary.find(({ id }) => id === argument);
        record.path = data.contract.runtimeEvidencePathRules.overrides[record.owner];
        break;
      }
      case "test-skipped":
        data.collections[0].skip = true;
        break;
      case "test-todo":
        data.collections[0].todo = true;
        break;
      case "test-conditional":
        data.collections[0].conditional = true;
        break;
      case "test-duplicate":
        data.collections.push(clone(data.collections[0]));
        break;
      case "test-uncollected":
        data.collections.pop();
        break;
      case "test-retried":
        data.collections[0].retry = 1;
        break;
      case "suite-zero":
        data.suiteCounts["machine-check"] = 0;
        break;
      case "minimum-node-wrong-runtime":
        data.minimumNodeRuntime = "24.0.0";
        break;
      case "minimum-node-workspace-resolution":
        data.minimumNodeResolution = "workspace";
        break;
      case "evidence-collection-root":
        data.collections.find(({ modality }) => modality === "public-js").path =
          "packages/taffyjs-node/tests/native/wrong.test.mts";
        break;
      case "minimum-node-not-packed":
        data.minimumNodeResolution = "source";
        break;
      case "premature-runtime-artifact":
        data.status.taskStates["INFRA-003"] = "pending";
        data.projected.runtime.push("Display");
        break;
      case "premature-declaration-artifact":
        data.status.taskStates["TYPE-LAYOUT-001"] = "pending";
        data.projected.declaration.push("Layout");
        break;
      case "missing-tests-authored-registration":
        data.status.taskStates["INFRA-001"] = "tests-authored";
        data.projected.registered.delete?.("INFRA-001/generate");
        data.projected.registered = data.projected.registered.filter(
          (id) => id !== "INFRA-001/generate",
        );
        break;
      case "implemented-artifact-missing":
        data.status.taskStates["INFRA-003"] = "implemented";
        data.projected.runtime = data.projected.runtime.filter((name) => name !== "Display");
        break;
      case "verified-evidence-stale":
        data.status.taskStates["INFRA-001"] = "verified";
        data.status.candidateCommit = "d".repeat(40);
        data.status.prefixEvidenceCommit = "e".repeat(40);
        break;
      case "accepted-invalid-order":
        data.status.taskStates["INFRA-002"] = "accepted";
        data.status.taskStates["INFRA-001"] = "pending";
        break;
      case "all-incomplete-task":
        data.allMode = true;
        data.status.taskStates["MATURITY-003"] = "pending";
        break;
      case "completion-command-missing":
        data.completionMode = true;
        data.commandEvidence = {};
        break;
      case "review-hash-wrong":
        data.review.hash = "f".repeat(64);
        break;
      case "review-candidate-wrong":
        data.review.reports[0].endCandidateCommit = "f".repeat(40);
        break;
      case "ordinary-reviewer-slot-missing":
      case "ordinary-reviewer-slot-additional":
      case "ordinary-reviewer-slot-duplicate":
      case "ordinary-reviewer-slot-reordered":
      case "ordinary-reviewer-identity-reused":
      case "ordinary-current-task-missing":
      case "ordinary-current-task-additional":
      case "ordinary-current-task-duplicate":
      case "ordinary-current-task-reordered":
        data.review = makeReview(data.contract, false);
        mutateReview(data.review, kind);
        break;
      case "final-reviewer-slot-missing":
      case "final-reviewer-slot-additional":
      case "final-reviewer-slot-duplicate":
      case "final-reviewer-slot-reordered":
      case "final-reviewer-identity-reused":
      case "final-current-task-missing":
      case "final-current-task-additional":
      case "final-current-task-duplicate":
      case "final-current-task-reordered":
        data.review = makeReview(data.contract, true);
        mutateReview(data.review, kind);
        break;
      case "verdict-cell-missing":
        data.review.verdicts.pop();
        break;
      case "verdict-cell-duplicate":
        data.review.verdicts.push(clone(data.review.verdicts[0]));
        break;
      case "aggregate-only-verdict":
        data.review.verdicts = [{ milestone: "M0", verdict: "PASS" }];
        break;
      case "earlier-impact-verdict-missing":
        data.review.reports[0].earlierImpact = ["EARLIER-001"];
        break;
      case "blocker-unresolved":
        data.review.blockers.push({ id: "B1", resolved: false });
        break;
      case "major-unresolved":
        data.review.findings.push({ id: "F1", severity: "major", resolved: false });
        break;
      case "rejection-unconfirmed":
        data.review.findings.push({
          id: "F1",
          severity: "major",
          disposition: "rejected",
          reviewerConfirmed: false,
        });
        break;
      case "minimum-node-helper-constant-missing":
        data.helperProbe.constants.pop();
        break;
      case "minimum-node-helper-tag-corrupt":
        data.helperProbe.tags.Dimension = "wrong";
        break;
      case "minimum-node-helper-payload-corrupt":
        data.helperProbe.payloads.Dimension = "wrong";
        break;
      case "accepted-transition-invalid":
        data.review = makeReview(data.contract, false);
        data.review.transition = "complete";
        break;
      case "complete-transition-invalid":
        data.review = makeReview(data.contract, true);
        data.review.transition = "accepted";
        break;
      default:
        throw new Error(`Unknown fixture mutation: ${kind}`);
    }
    return fixture;
  }
}

function mutateReview(review, kind) {
  const slots = review.projection.reviewerSlots;
  const tasks = review.projection.currentTaskIds;
  if (kind.endsWith("reviewer-slot-missing")) slots.pop();
  else if (kind.endsWith("reviewer-slot-additional")) slots.push("extra");
  else if (kind.endsWith("reviewer-slot-duplicate")) slots[1] = slots[0];
  else if (kind.endsWith("reviewer-slot-reordered")) slots.reverse();
  else if (kind.endsWith("reviewer-identity-reused")) {
    review.reports[1].reviewerIdentity = review.reports[0].reviewerIdentity;
  } else if (kind.endsWith("current-task-missing")) tasks.pop();
  else if (kind.endsWith("current-task-additional")) tasks.push("EXTRA-001");
  else if (kind.endsWith("current-task-duplicate")) tasks[1] = tasks[0];
  else if (kind.endsWith("current-task-reordered")) tasks.reverse();
}

export async function createRepositoryFixture(root) {
  const goal = await readFile(resolve(root, ".agents/docs/loop-goal.md"), "utf8");
  const contract = extractCanonicalContract(goal);
  const generated = expandContract(contract);
  const primary = clone(generated.evidence.primary);
  const allTaskStates = Object.fromEntries(generated.tasks.map(({ id }) => [id, "accepted"]));
  const declaration = await formatDeclaration(assembleDeclaration(contract), root);
  const expectedHelpers = Object.keys(
    contract.primaryEvidenceRules.minimumNodeCompatibility.valueHelperCoverageAcceptanceIdsByExport,
  );
  return new RepositoryFixture({
    contract,
    actualPins: clone(contract.pins),
    cargoRequirements: {
      napi: `=${contract.pins.napi}`,
      "napi-derive": `=${contract.pins.napiDerive}`,
      "napi-build": `=${contract.pins.napiBuild}`,
      taffy: `=${contract.pins.taffyVersion}`,
    },
    lockVersions: {
      napi: contract.pins.napi,
      "napi-derive": contract.pins.napiDerive,
      "napi-build": contract.pins.napiBuild,
      taffy: contract.pins.taffyVersion,
    },
    dependencyTargets: {
      "@types/node": contract.implementationDependencyTargets["INFRA-002"]["@types/node"],
    },
    packedEnginesNode: contract.tarballContents.rootManifest.engines.node,
    source: expectedSourceModel(contract),
    tasks: generated.tasks.map(({ id }) => id),
    artifacts: artifactModel(contract),
    primary,
    minimumNode: clone(generated.evidence.minimumNode),
    surfaceProbes: clone(generated.evidence.surfaceProbes),
    declaration,
    expectedDeclaration: declaration,
    nodeIdRoles: clone(contract.nodeIdRolesByOwner),
    collections: primary.map((record) => ({
      id: record.id,
      modality: record.modality,
      path: record.path,
      skip: false,
      todo: false,
      conditional: false,
      retry: 0,
    })),
    suiteCounts: Object.fromEntries(
      Object.keys(contract.primaryEvidenceRules.modalities).map((key) => [key, 1]),
    ),
    minimumNodeRuntime: contract.primaryEvidenceRules.minimumNodeCompatibility.runtime,
    minimumNodeResolution: "packed",
    status: {
      taskStates: allTaskStates,
      candidateCommit: "a".repeat(40),
      prefixEvidenceCommit: "a".repeat(40),
    },
    projected: {
      runtime: Object.values(contract.publicRuntimeExportsByOwner).flat(),
      declaration: Object.values(contract.publicDeclarationExportsByOwner).flat(),
      classMembers: Object.values(contract.publicClassMembersByOwner).flat(),
      registered: primary.map(({ id }) => id),
    },
    allMode: false,
    completionMode: false,
    commandEvidence: {
      "MATURITY-003/local-green": {
        command: "vp run ready",
        candidateCommit: "a".repeat(40),
        exitCode: 0,
      },
    },
    review: makeReview(contract, false),
    helperProbe: {
      constants: expectedHelpers,
      tags: Object.fromEntries(expectedHelpers.map((name) => [name, "canonical"])),
      payloads: Object.fromEntries(expectedHelpers.map((name) => [name, "canonical"])),
    },
  });
}

function assertEqual(actual, expected, diagnostic) {
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(diagnostic);
}

function validatePins(data) {
  const pins = data.contract.pins;
  const requirementFields = {
    napi: "napi",
    "napi-derive": "napiDerive",
    "napi-build": "napiBuild",
    taffy: "taffyVersion",
  };
  for (const [dependency, pinKey] of Object.entries(requirementFields)) {
    if (data.cargoRequirements[dependency] !== `=${pins[pinKey]}`) {
      fail(`pin-drift/cargo-${dependency}-requirement`);
    }
    if (data.lockVersions[dependency] !== pins[pinKey]) {
      fail(`pin-drift/cargo-lock-version`);
    }
  }
  const pinDiagnostics = {
    taffyChecksum: "taffy-checksum",
    taffyDefaultFeatures: "taffy-default-features",
    taffyResolvedFeatures: "taffy-resolved-features",
    node: "node-range",
    minimumNodeTestRuntime: "minimum-node-runtime",
    oxfmt: "oxfmt-version",
  };
  for (const [key, suffix] of Object.entries(pinDiagnostics)) {
    if (canonicalJson(data.actualPins[key]) !== canonicalJson(pins[key])) {
      fail(`pin-drift/${suffix}`);
    }
  }
  if (IMPLEMENTED_STATES.has(data.status.taskStates["INFRA-002"])) {
    if (
      data.dependencyTargets["@types/node"] !==
      data.contract.implementationDependencyTargets["INFRA-002"]["@types/node"]
    ) {
      fail("pin-drift/types-node-target");
    }
    if (data.packedEnginesNode !== data.contract.tarballContents.rootManifest.engines.node) {
      fail("pin-drift/packed-engines-node");
    }
  }
}

function validateSource(data) {
  const expected = expectedSourceModel(data.contract);
  if (canonicalJson(data.source.taffyTree) !== canonicalJson(expected.taffyTree)) {
    const actualMethods = Object.keys(data.source.taffyTree.methods);
    const expectedMethods = Object.keys(expected.taffyTree.methods);
    if (actualMethods.length < expectedMethods.length) fail("source-drift/method-missing");
    if (actualMethods.length > expectedMethods.length) fail("source-drift/method-added");
    if (canonicalJson(actualMethods) !== canonicalJson(expectedMethods)) {
      fail("source-drift/method-renamed");
    }
    for (const name of expectedMethods) {
      const actual = data.source.taffyTree.methods[name];
      const wanted = expected.taffyTree.methods[name];
      if (actual.signature !== wanted.signature) {
        if (name === "total_node_count") fail("source-drift/method-return-type");
        fail("source-drift/method-primitive-argument");
      }
    }
    fail("source-drift/method-feature-gate");
  }
  if (canonicalJson(data.source.adjacentRoots) !== canonicalJson(expected.adjacentRoots)) {
    fail("source-drift/adjacent-root");
  }
  if (canonicalJson(data.source.namedDataShapes) !== canonicalJson(expected.namedDataShapes)) {
    const actual = data.source.namedDataShapes;
    const wanted = expected.namedDataShapes;
    if (canonicalJson(actual.Layout.fields) !== canonicalJson(wanted.Layout.fields)) {
      fail("source-drift/named-data-field");
    }
    if (canonicalJson(actual.Display.variants) !== canonicalJson(wanted.Display.variants)) {
      fail("source-drift/named-data-variant");
    }
    if (
      canonicalJson(actual.AvailableSpace.variants) !==
      canonicalJson(wanted.AvailableSpace.variants)
    ) {
      fail("source-drift/named-data-payload");
    }
    fail("source-drift/named-data-feature-gate");
  }
}

function validateTasks(data) {
  const generated = expandContract(data.contract);
  const expectedTasks = generated.tasks.map(({ id }) => id);
  if (data.tasks.length < expectedTasks.length) fail("task-drift/task-missing");
  if (new Set(data.tasks).size !== data.tasks.length) fail("task-drift/task-duplicate");
  assertEqual(data.tasks, expectedTasks, "task-drift/task-missing");
  const expectedArtifacts = artifactModel(data.contract);
  const expectedRuntimeOwners = Object.keys(expectedArtifacts.runtime);
  const actualRuntimeOwners = Object.keys(data.artifacts.runtime);
  if (actualRuntimeOwners.length < expectedRuntimeOwners.length) {
    fail("task-drift/owner-missing");
  }
  const seenRuntime = Object.values(data.artifacts.runtime).flat();
  if (new Set(seenRuntime).size !== seenRuntime.length) {
    fail("task-drift/owner-duplicate");
  }
  if (
    canonicalJson(data.artifacts) !== canonicalJson(expectedArtifacts) &&
    data.artifacts.classMembers["API-TREE-001"]?.length === 0
  ) {
    fail("task-drift/artifact-projection-missing");
  }
  const expectedPrimary = generated.evidence.primary;
  const actualIds = data.primary.map(({ id }) => id);
  const expectedIds = expectedPrimary.map(({ id }) => id);
  if (new Set(actualIds).size !== actualIds.length) {
    fail("task-drift/acceptance-duplicate");
  }
  if (actualIds.length < expectedIds.length) {
    const missing = expectedIds.filter((id) => !actualIds.includes(id));
    if (missing.some((id) => id.startsWith("STYLE-F"))) {
      fail("task-drift/generated-id-missing");
    }
    fail("task-drift/acceptance-missing");
  }
  for (const record of data.primary) {
    if (!record.path) fail("task-drift/evidence-entry-missing");
    const expected = expectedPrimary.find(({ id }) => id === record.id);
    if (expected && record.path !== expected.path) {
      fail(`task-drift/acceptance-path/${record.id}`);
    }
    if (record.family === "nodeIdCollectionValid" && record.position !== null) {
      fail("task-drift/node-id-collection-valid-position");
    }
    if (record.family === "nodeIdCollectionInvalid" && record.position === null) {
      fail("task-drift/node-id-collection-invalid-position");
    }
  }
  if (data.minimumNode.length !== generated.evidence.minimumNode.length) {
    fail("task-drift/minimum-node-secondary-missing");
  }
  if (data.surfaceProbes.length !== generated.evidence.surfaceProbes.length) {
    fail("task-drift/surface-probe-missing");
  }
  for (const taskId of expectedTasks) {
    if (!(taskId in data.status.taskStates)) fail("task-drift/status-entry-missing");
  }
  if (canonicalJson(data.nodeIdRoles) !== canonicalJson(data.contract.nodeIdRolesByOwner)) {
    fail("task-drift/node-id-role-binding");
  }
}

function validateDeclarationFixture(data) {
  if (data.declaration === data.expectedDeclaration) return;
  if (data.declaration.includes("getNodeCount(): string")) {
    fail("task-drift/declaration-signature");
  }
  if (!data.declaration.includes("lineNames?: string[][]")) {
    fail("task-drift/declaration-optional-marker");
  }
  if (/\n\s*order: number;/.test(data.declaration)) {
    fail("task-drift/declaration-readonly-marker");
  }
  fail("task-drift/declaration-overload-count");
}

function validateCollections(data) {
  const ids = data.collections.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) fail("collection-drift/test-duplicate");
  if (ids.length < data.primary.length) fail("collection-drift/test-uncollected");
  for (const record of data.collections) {
    if (record.skip) fail("collection-drift/test-skipped");
    if (record.todo) fail("collection-drift/test-todo");
    if (record.conditional) fail("collection-drift/test-conditional");
    if (record.retry !== 0) fail("collection-drift/test-retried");
    const root = data.contract.runtimeEvidencePathRules.collectionRootsByModality[record.modality];
    if (root && !record.path.startsWith(root)) {
      fail("collection-drift/evidence-collection-root");
    }
  }
  if (Object.values(data.suiteCounts).some((count) => count === 0)) {
    fail("collection-drift/suite-zero");
  }
  if (
    data.minimumNodeRuntime !== data.contract.primaryEvidenceRules.minimumNodeCompatibility.runtime
  ) {
    fail("collection-drift/minimum-node-wrong-runtime");
  }
  if (data.minimumNodeResolution === "workspace") {
    fail("collection-drift/minimum-node-workspace-resolution");
  }
  if (data.minimumNodeResolution !== "packed") {
    fail("collection-drift/minimum-node-not-packed");
  }
}

function validateIncremental(data) {
  const generated = expandContract(data.contract);
  const expectedRuntime = new Set();
  const expectedDeclaration = new Set();
  const expectedMembers = new Set();
  for (const [owner, names] of Object.entries(data.contract.publicRuntimeExportsByOwner)) {
    if (stateImplemented(data.status.taskStates, owner)) {
      names.forEach((name) => expectedRuntime.add(name));
    }
  }
  for (const [owner, names] of Object.entries(data.contract.publicDeclarationExportsByOwner)) {
    if (stateImplemented(data.status.taskStates, owner)) {
      names.forEach((name) => expectedDeclaration.add(name));
    }
  }
  for (const [owner, names] of Object.entries(data.contract.publicClassMembersByOwner)) {
    if (stateImplemented(data.status.taskStates, owner)) {
      names.forEach((name) => expectedMembers.add(name));
    }
  }
  const actualRuntime = new Set(data.projected.runtime);
  const actualDeclaration = new Set(data.projected.declaration);
  for (const value of actualRuntime) {
    if (!expectedRuntime.has(value)) fail("incremental-all/premature-runtime-artifact");
  }
  for (const value of actualDeclaration) {
    if (!expectedDeclaration.has(value)) {
      fail("incremental-all/premature-declaration-artifact");
    }
  }
  for (const value of expectedRuntime) {
    if (!actualRuntime.has(value)) fail("incremental-all/implemented-artifact-missing");
  }
  const registered = new Set(data.projected.registered);
  for (const record of generated.evidence.primary) {
    const state = data.status.taskStates[record.owner];
    if (["tests-authored", ...IMPLEMENTED_STATES].includes(state) && !registered.has(record.id)) {
      fail("incremental-all/missing-tests-authored-registration");
    }
  }
  if (
    Object.values(data.status.taskStates).some((state) =>
      ["verified", "under-review"].includes(state),
    ) &&
    data.status.prefixEvidenceCommit !== data.status.candidateCommit
  ) {
    fail("incremental-all/verified-evidence-stale");
  }
  const orderedTasks = generated.tasks.map(({ id }) => id);
  let sawIncomplete = false;
  for (const taskId of orderedTasks) {
    const state = data.status.taskStates[taskId];
    if (state !== "accepted") sawIncomplete = true;
    if (state === "accepted" && sawIncomplete) {
      fail("incremental-all/accepted-invalid-order");
    }
  }
  if (data.allMode && Object.values(data.status.taskStates).some((state) => state !== "accepted")) {
    fail("incremental-all/all-incomplete-task");
  }
  if (data.completionMode && !data.commandEvidence["MATURITY-003/local-green"]) {
    fail("incremental-all/completion-command-missing");
  }
}

function expectedReviewSlots(contract, milestone) {
  return milestone === contract.reviewPolicy.perTaskVerdictMatrix.finalMilestone
    ? contract.reviewPolicy.finalRoles
    : contract.reviewPolicy.perTaskVerdictMatrix.ordinaryReviewerSlots.map(({ slot }) => slot);
}

function validateReview(data) {
  const review = data.review;
  const projection = review.projection;
  const final =
    projection.activeMilestone === data.contract.reviewPolicy.perTaskVerdictMatrix.finalMilestone;
  const category = final ? "final" : "ordinary";
  const expectedSlots = expectedReviewSlots(data.contract, projection.activeMilestone);
  const slots = projection.reviewerSlots;
  if (slots.length < expectedSlots.length) {
    fail(`incremental-all/${category}-reviewer-slot-missing`);
  }
  if (slots.length > expectedSlots.length) {
    fail(`incremental-all/${category}-reviewer-slot-additional`);
  }
  if (new Set(slots).size !== slots.length) {
    fail(`incremental-all/${category}-reviewer-slot-duplicate`);
  }
  if (JSON.stringify(slots) !== JSON.stringify(expectedSlots)) {
    fail(`incremental-all/${category}-reviewer-slot-reordered`);
  }
  const expectedTasks = data.contract.milestones[projection.activeMilestone];
  const tasks = projection.currentTaskIds;
  if (tasks.length < expectedTasks.length) {
    fail(`incremental-all/${category}-current-task-missing`);
  }
  if (tasks.length > expectedTasks.length) {
    fail(`incremental-all/${category}-current-task-additional`);
  }
  if (new Set(tasks).size !== tasks.length) {
    fail(`incremental-all/${category}-current-task-duplicate`);
  }
  if (JSON.stringify(tasks) !== JSON.stringify(expectedTasks)) {
    fail(`incremental-all/${category}-current-task-reordered`);
  }
  const identities = review.reports.map(({ reviewerIdentity }) => reviewerIdentity);
  if (new Set(identities).size !== identities.length) {
    fail(`incremental-all/${category}-reviewer-identity-reused`);
  }
  const expectedHash = sha256(serializeReviewInputProjection(projection));
  if (review.hash !== expectedHash) fail("incremental-all/review-hash-wrong");
  for (const report of review.reports) {
    if (
      report.startCandidateCommit !== projection.candidateCommit ||
      report.endCandidateCommit !== projection.candidateCommit
    ) {
      fail("incremental-all/review-candidate-wrong");
    }
    if (
      report.startReviewInputStatusHash !== review.hash ||
      report.endReviewInputStatusHash !== review.hash
    ) {
      fail("incremental-all/review-hash-wrong");
    }
  }
  const required = new Set(tasks.flatMap((taskId) => slots.map((slot) => `${taskId}\0${slot}`)));
  const actual = review.verdicts
    .filter(({ taskId, slot }) => taskId && slot)
    .map(({ taskId, slot }) => `${taskId}\0${slot}`);
  if (review.verdicts.some(({ milestone }) => milestone)) {
    fail("incremental-all/aggregate-only-verdict");
  }
  if (new Set(actual).size !== actual.length) {
    fail("incremental-all/verdict-cell-duplicate");
  }
  if ([...required].some((cell) => !actual.includes(cell))) {
    fail("incremental-all/verdict-cell-missing");
  }
  for (const report of review.reports) {
    for (const taskId of report.earlierImpact) {
      if (
        !review.verdicts.some(
          (verdict) => verdict.taskId === taskId && verdict.slot === report.slot,
        )
      ) {
        fail("incremental-all/earlier-impact-verdict-missing");
      }
    }
  }
  if (review.blockers.some(({ resolved }) => !resolved)) {
    fail("incremental-all/blocker-unresolved");
  }
  if (
    review.findings.some(
      ({ severity, resolved, disposition }) =>
        ["blocker", "major"].includes(severity) && disposition !== "rejected" && !resolved,
    )
  ) {
    fail("incremental-all/major-unresolved");
  }
  if (
    review.findings.some(
      ({ disposition, reviewerConfirmed }) => disposition === "rejected" && !reviewerConfirmed,
    )
  ) {
    fail("incremental-all/rejection-unconfirmed");
  }
  if (!final && review.transition !== "accepted") {
    fail("incremental-all/accepted-transition-invalid");
  }
  if (final && review.transition !== "complete") {
    fail("incremental-all/complete-transition-invalid");
  }
}

function validateHelperProbe(data) {
  const expected = Object.keys(
    data.contract.primaryEvidenceRules.minimumNodeCompatibility
      .valueHelperCoverageAcceptanceIdsByExport,
  );
  if (data.helperProbe.constants.length !== expected.length) {
    fail("incremental-all/minimum-node-helper-constant-missing");
  }
  if (Object.values(data.helperProbe.tags).some((value) => value !== "canonical")) {
    fail("incremental-all/minimum-node-helper-tag-corrupt");
  }
  if (Object.values(data.helperProbe.payloads).some((value) => value !== "canonical")) {
    fail("incremental-all/minimum-node-helper-payload-corrupt");
  }
}

export async function checkRepositoryFixture(fixture) {
  const data = fixture instanceof RepositoryFixture ? fixture.data : fixture;
  validateCanonicalContract(data.contract);
  validatePins(data);
  validateSource(data);
  validateTasks(data);
  validateDeclarationFixture(data);
  validateCollections(data);
  validateIncremental(data);
  validateReview(data);
  validateHelperProbe(data);
  return true;
}

async function readJson(path, diagnostic) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    fail(diagnostic, `Could not read JSON from ${path}: ${error.message}`);
  }
}

async function walkFiles(directory) {
  const output = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return output;
    throw error;
  }
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "target") {
        output.push(...(await walkFiles(path)));
      }
    } else if (entry.isFile()) {
      output.push(path);
    }
  }
  return output;
}

function skipQuotedSource(source, start, quote) {
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === "\\") index += 2;
    else if (source[index] === quote) return index + 1;
    else index += 1;
  }
  return -1;
}

function tokenizeJavaScript(source, path) {
  const tokens = [];
  const depths = { brace: 0, bracket: 0, paren: 0 };
  const expressionPrefix = new Set([
    null,
    "(",
    "[",
    "{",
    ",",
    ";",
    ":",
    "=",
    "=>",
    "!",
    "?",
    "&&",
    "||",
    "??",
    "return",
    "case",
  ]);
  let index = 0;
  let previousValue = null;
  while (index < source.length) {
    const character = source[index];
    if (/\s/u.test(character)) {
      index += 1;
      continue;
    }
    if (source.startsWith("//", index)) {
      const newline = source.indexOf("\n", index + 2);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }
    if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      if (end === -1) fail("collection-drift/test-parse", `Unclosed comment in ${path}`);
      index = end + 2;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      const end = skipQuotedSource(source, index, character);
      if (end === -1) fail("collection-drift/test-parse", `Unclosed string in ${path}`);
      const raw = source.slice(index, end);
      tokens.push({
        type: character === "`" ? "template" : "string",
        value: raw,
        start: index,
        end,
        ...depths,
      });
      previousValue = raw;
      index = end;
      continue;
    }
    if (character === "/" && expressionPrefix.has(previousValue)) {
      let end = index + 1;
      let inClass = false;
      let closed = false;
      while (end < source.length) {
        if (source[end] === "\\") end += 2;
        else if (source[end] === "[" && !inClass) {
          inClass = true;
          end += 1;
        } else if (source[end] === "]" && inClass) {
          inClass = false;
          end += 1;
        } else if (source[end] === "/" && !inClass) {
          closed = true;
          end += 1;
          while (/[a-z]/iu.test(source[end] ?? "")) end += 1;
          break;
        } else if (source[end] === "\n") break;
        else end += 1;
      }
      if (!closed) fail("collection-drift/test-parse", `Unclosed regular expression in ${path}`);
      tokens.push({ type: "regex", value: source.slice(index, end), start: index, end, ...depths });
      previousValue = "regex";
      index = end;
      continue;
    }
    const identifier = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(source.slice(index));
    if (identifier) {
      const end = index + identifier[0].length;
      tokens.push({ type: "identifier", value: identifier[0], start: index, end, ...depths });
      previousValue = identifier[0];
      index = end;
      continue;
    }
    const operator = ["=>", "&&", "||", "??", "?."].find((value) =>
      source.startsWith(value, index),
    );
    const value = operator ?? character;
    tokens.push({
      type: "punctuation",
      value,
      start: index,
      end: index + value.length,
      ...depths,
    });
    if (value === "{") depths.brace += 1;
    else if (value === "}") depths.brace -= 1;
    else if (value === "[") depths.bracket += 1;
    else if (value === "]") depths.bracket -= 1;
    else if (value === "(") depths.paren += 1;
    else if (value === ")") depths.paren -= 1;
    if (Object.values(depths).some((depth) => depth < 0)) {
      fail("collection-drift/test-parse", `Unbalanced source in ${path}`);
    }
    previousValue = value;
    index += value.length;
  }
  if (Object.values(depths).some((depth) => depth !== 0)) {
    fail("collection-drift/test-parse", `Unbalanced source in ${path}`);
  }
  return tokens;
}

function decodeStaticTestId(token, path) {
  const body = token.value.slice(1, -1);
  if (token.value[0] === "`" || body.includes("\\") || body.includes("\n") || body.includes("\r")) {
    fail("collection-drift/test-conditional", `Test identity is not a plain literal in ${path}`);
  }
  return body;
}

export async function extractContractTestCalls(source, path) {
  const tokens = tokenizeJavaScript(source, path);
  const calls = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "identifier" || token.value !== "contractTest") continue;
    if (tokens[index + 1]?.value === "." || tokens[index + 1]?.value === "?.") {
      const modifier = tokens[index + 2]?.value;
      if (["skip", "todo", "only"].includes(modifier)) {
        fail(
          modifier === "todo" ? "collection-drift/test-todo" : "collection-drift/test-skipped",
          `Forbidden contractTest.${modifier} registration in ${path}`,
        );
      }
      continue;
    }
    if (tokens[index + 1]?.value !== "(") continue;
    const previous = tokens[index - 1];
    if (
      token.brace !== 0 ||
      token.bracket !== 0 ||
      token.paren !== 0 ||
      (previous && previous.value !== ";" && previous.value !== "}")
    ) {
      fail(
        "collection-drift/test-conditional",
        `contractTest must be an unconditional top-level statement in ${path}`,
      );
    }
    const id = tokens[index + 2];
    if (!id || id.type !== "string" || tokens[index + 3]?.value !== ",") {
      fail(
        "collection-drift/test-conditional",
        `contractTest identity must be a static string literal in ${path}`,
      );
    }
    let cursor = index + 1;
    let callDepth = 0;
    for (; cursor < tokens.length; cursor += 1) {
      if (tokens[cursor].value === "(") callDepth += 1;
      if (tokens[cursor].value === ")") {
        callDepth -= 1;
        if (callDepth === 0) break;
      }
    }
    if (callDepth !== 0 || (tokens[cursor + 1] && tokens[cursor + 1].value !== ";")) {
      fail(
        "collection-drift/test-conditional",
        `contractTest call must be a complete top-level statement in ${path}`,
      );
    }
    calls.push({ id: decodeStaticTestId(id, path), path, offset: token.start });
  }
  return calls;
}

async function extractRustContractTests(root, path) {
  const parserManifest = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../rust-parser/Cargo.toml",
  );
  const result = await runCommand(
    "cargo",
    [
      "run",
      "--quiet",
      "--locked",
      "--manifest-path",
      parserManifest,
      "--",
      "--contract-tests",
      resolve(root, path),
    ],
    root,
  );
  let records;
  try {
    records = JSON.parse(result.stdout);
  } catch (error) {
    fail("collection-drift/test-parse", error.message);
  }
  if (!Array.isArray(records)) fail("collection-drift/test-parse", path);
  for (const record of records) {
    if (!record.isTest || record.forbiddenAttribute) {
      fail(
        "collection-drift/test-conditional",
        `${record.identity} has invalid attributes in ${path}`,
      );
    }
  }
  return records.map(({ identity }) => ({
    identity,
    path,
    offset: 0,
    modality: "rust-contract",
  }));
}

export async function collectStaticEvidence(root, expanded, status) {
  const roots = [
    resolve(root, "tools/taffy-api/tests"),
    resolve(root, "packages/taffyjs-node/tests"),
    resolve(root, "tests/taffyjs-node"),
  ];
  const calls = [];
  for (const collectionRoot of roots) {
    for (const path of await walkFiles(collectionRoot)) {
      if (!path.endsWith(".test.mts") && !path.endsWith(".test.mjs")) continue;
      const relative = path.slice(root.length + 1).replaceAll("\\", "/");
      calls.push(
        ...(await extractContractTestCalls(await readFile(path, "utf8"), relative, root)).map(
          (call) => ({ ...call, identity: call.id }),
        ),
      );
    }
  }

  const expectedByPath = new Map(
    expanded.evidence.primary
      .filter(({ modality }) => modality === "types")
      .map((record) => [record.path, record]),
  );
  for (const path of await walkFiles(resolve(root, "tests/taffyjs-node/tests/types"))) {
    if (!path.endsWith(".test-d.ts")) continue;
    const relative = path.slice(root.length + 1).replaceAll("\\", "/");
    const record = expectedByPath.get(relative);
    calls.push({
      id: record?.id ?? `unknown-types:${relative}`,
      identity: record?.identity ?? relative,
      modality: "types",
      path: relative,
      offset: 0,
    });
  }

  const rustRecords = expanded.evidence.primary.filter(
    ({ modality }) => modality === "rust-contract",
  );
  for (const path of new Set(rustRecords.map(({ path }) => path))) {
    try {
      await readFile(resolve(root, path), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    const identityToRecord = new Map(
      rustRecords
        .filter((record) => record.path === path)
        .map((record) => [record.identity.split("::").at(-1), record]),
    );
    for (const call of await extractRustContractTests(root, path)) {
      const record = identityToRecord.get(call.identity);
      calls.push({ ...call, id: record?.id ?? `unknown-rust:${call.identity}` });
    }
  }

  for (const record of expanded.evidence.primary) {
    if (
      record.modality === "command-attestation" &&
      requiredRegistrationState(status.taskStates[record.owner])
    ) {
      calls.push({
        id: record.id,
        identity: record.identity,
        modality: record.modality,
        path: record.path,
        offset: 0,
      });
    }
  }
  return calls;
}

function requiredRegistrationState(state) {
  return ["tests-authored", ...IMPLEMENTED_STATES].includes(state);
}

function normalizeCfgRule(value) {
  if (value === true || value === false) return value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
  for (const operator of ["all", "any"]) {
    if (!Array.isArray(value[operator])) continue;
    const entries = value[operator]
      .map(normalizeCfgRule)
      .flatMap((entry) =>
        entry && typeof entry === "object" && Array.isArray(entry[operator])
          ? entry[operator]
          : [entry],
      )
      .filter((entry) => operator !== "all" || entry !== true)
      .sort((left, right) => asciiCompare(JSON.stringify(left), JSON.stringify(right)));
    if (entries.length === 0) return operator === "all";
    if (entries.length === 1) return entries[0];
    return { [operator]: entries };
  }
  if (Object.hasOwn(value, "not")) return { not: normalizeCfgRule(value.not) };
  return deepSort(value);
}

function cfgRuleFromFeatures(features) {
  return normalizeCfgRule({ all: features.map((feature) => ({ feature })) });
}

export function validateStaticCollection(contract, expanded, status, calls) {
  const byId = new Map();
  for (const call of calls) {
    const records = byId.get(call.id) ?? [];
    records.push(call);
    byId.set(call.id, records);
  }
  for (const [id, records] of byId) {
    if (records.length !== 1) {
      fail("collection-drift/test-duplicate", `${id} is registered ${records.length} times`);
    }
  }
  const expectedById = new Map(expanded.evidence.primary.map((record) => [record.id, record]));
  for (const record of expanded.evidence.primary) {
    const shouldExist = requiredRegistrationState(status.taskStates[record.owner]);
    const callsForId = byId.get(record.id) ?? [];
    if (shouldExist && callsForId.length !== 1) {
      fail(
        "collection-drift/test-uncollected",
        `${record.id} must be statically registered exactly once`,
      );
    }
    if (!shouldExist && callsForId.length !== 0) {
      fail(
        "incremental-all/premature-test-registration",
        `${record.id} is owned by ${record.owner} before tests-authored`,
      );
    }
    if (shouldExist && callsForId[0].path !== record.path) {
      fail(
        "collection-drift/evidence-collection-root",
        `${record.id} is in ${callsForId[0].path}, expected ${record.path}`,
      );
    }
    if (
      shouldExist &&
      callsForId[0].identity !== record.id &&
      record.modality !== "rust-contract"
    ) {
      fail("collection-drift/test-identity", record.id);
    }
    if (
      shouldExist &&
      record.modality === "rust-contract" &&
      callsForId[0].identity !== record.identity.split("::").at(-1)
    ) {
      fail("collection-drift/test-identity", record.id);
    }
  }
  for (const id of byId.keys()) {
    if (!expectedById.has(id)) {
      fail("collection-drift/additional-id", `Unknown contractTest identity ${id}`);
    }
  }
}

export function validateStatusShape(status, contract, expanded) {
  exactKeys(
    status,
    [
      "schemaVersion",
      "contractBaseCommit",
      "candidateCommit",
      "activeMilestone",
      "phase",
      "activeTaskId",
      "taskStates",
      "prefixEvidenceCommit",
      "milestoneReviewCommit",
      "previousAcceptedMilestoneCommit",
      "redEvidence",
      "greenEvidence",
      "commandEvidence",
      "finalOutputs",
      "reviewRoundId",
      "reviewerSlots",
      "reviewedCommits",
      "inspectionCommands",
      "currentTaskIds",
      "reviewInputProjection",
      "reviewInputStatusHash",
      "reports",
      "verdicts",
      "findings",
      "closures",
      "earlierDefects",
      "blockers",
      "remainingMinorFindings",
      "nextAction",
    ],
    "loop-status-unknown-field",
  );
  if (status.schemaVersion !== 1) fail("loop-status-schema-version");
  const taskIds = expanded.tasks.map(({ id }) => id);
  if (JSON.stringify(Object.keys(status.taskStates)) !== JSON.stringify(taskIds)) {
    fail("task-drift/status-entry-missing");
  }
  const states = new Set(contract.taskStatePolicy.states);
  for (const [taskId, state] of Object.entries(status.taskStates)) {
    if (!states.has(state)) fail("loop-status-task-state", `${taskId}: ${state}`);
  }
  if (!Object.hasOwn(contract.milestones, status.activeMilestone)) {
    fail("loop-status-active-milestone");
  }
  if (!contract.taskStatePolicy.states || !status.nextAction) {
    fail("loop-status-next-action");
  }
  const phases = new Set(["build", "verify", "review", "review-fix", "blocked", "complete"]);
  if (!phases.has(status.phase)) fail("loop-status-phase");
  if (["build", "review-fix"].includes(status.phase)) {
    if (!status.activeTaskId || !taskIds.includes(status.activeTaskId)) {
      fail("loop-status-active-task");
    }
    if (!contract.milestones[status.activeMilestone].includes(status.activeTaskId)) {
      fail("loop-status-active-task");
    }
  } else if (status.activeTaskId !== null) {
    fail("loop-status-active-task");
  }
  const milestoneOrder = Object.keys(contract.milestones);
  const activeIndex = milestoneOrder.indexOf(status.activeMilestone);
  for (let index = 0; index < activeIndex; index += 1) {
    for (const taskId of contract.milestones[milestoneOrder[index]]) {
      if (status.taskStates[taskId] !== "accepted") {
        fail("incremental-all/accepted-invalid-order");
      }
    }
  }
  for (let index = activeIndex + 1; index < milestoneOrder.length; index += 1) {
    for (const taskId of contract.milestones[milestoneOrder[index]]) {
      if (status.taskStates[taskId] !== "pending") {
        fail("incremental-all/accepted-invalid-order", taskId);
      }
    }
  }
  const activeTasks = contract.milestones[status.activeMilestone];
  const implementedStates = new Set(["implemented", "verified", "under-review", "accepted"]);
  const blockedTasks = taskIds.filter((taskId) => status.taskStates[taskId] === "blocked");
  if (status.phase === "blocked") {
    if (blockedTasks.length !== 1 || !activeTasks.includes(blockedTasks[0])) {
      fail("loop-status-blocked-task");
    }
    if (!Array.isArray(status.blockers) || status.blockers.length !== 1) {
      fail("loop-status-blocker-record");
    }
    const blocker = status.blockers[0];
    exactKeys(
      blocker,
      ["taskId", "category", "evidence", "attempts", "requiredDecision"],
      "loop-status-blocker-record",
    );
    const allowedCategories = new Set([
      "contract-source-conflict",
      "unauthorized-scope-change",
      "uncontainable-upstream-defect",
      "review-contract-conflict",
      "external-tool-barrier",
    ]);
    const nonemptyStrings = (values) =>
      Array.isArray(values) &&
      values.length !== 0 &&
      values.every((value) => typeof value === "string" && value.trim().length !== 0);
    if (
      blocker.taskId !== blockedTasks[0] ||
      !allowedCategories.has(blocker.category) ||
      !nonemptyStrings(blocker.evidence) ||
      !Array.isArray(blocker.attempts) ||
      blocker.attempts.some(
        (attempt) => typeof attempt !== "string" || attempt.trim().length === 0,
      ) ||
      (blocker.category === "external-tool-barrier" &&
        (blocker.attempts.length !== 3 || new Set(blocker.attempts).size !== 3)) ||
      typeof blocker.requiredDecision !== "string" ||
      blocker.requiredDecision.trim().length === 0 ||
      status.nextAction !== blocker.requiredDecision
    ) {
      fail("loop-status-blocker-record");
    }
    const blockedIndex = activeTasks.indexOf(blockedTasks[0]);
    if (
      activeTasks
        .slice(0, blockedIndex)
        .some((taskId) => !implementedStates.has(status.taskStates[taskId])) ||
      activeTasks.slice(blockedIndex + 1).some((taskId) => status.taskStates[taskId] !== "pending")
    ) {
      fail("incremental-all/accepted-invalid-order");
    }
  } else {
    if (blockedTasks.length !== 0) fail("loop-status-blocked-task");
    if (!Array.isArray(status.blockers) || status.blockers.length !== 0) {
      fail("loop-status-blocker-record");
    }
  }
  if (status.phase === "build") {
    const currentIndex = activeTasks.indexOf(status.activeTaskId);
    if (
      currentIndex === -1 ||
      !["active", "tests-authored", "implemented"].includes(status.taskStates[status.activeTaskId])
    ) {
      fail("loop-status-active-task-state");
    }
    if (
      activeTasks
        .slice(0, currentIndex)
        .some((taskId) => !implementedStates.has(status.taskStates[taskId])) ||
      activeTasks.slice(currentIndex + 1).some((taskId) => status.taskStates[taskId] !== "pending")
    ) {
      fail("incremental-all/accepted-invalid-order");
    }
  }
  if (status.phase === "review-fix") {
    if (!implementedStates.has(status.taskStates[status.activeTaskId])) {
      fail("loop-status-active-task-state");
    }
    if (activeTasks.some((taskId) => !implementedStates.has(status.taskStates[taskId]))) {
      fail("incremental-all/accepted-invalid-order");
    }
  }
  if (
    status.phase === "verify" &&
    activeTasks.some((taskId) => !implementedStates.has(status.taskStates[taskId]))
  ) {
    fail("incremental-all/accepted-invalid-order");
  }
  if (
    status.phase === "review" &&
    activeTasks.some(
      (taskId) => !["verified", "under-review", "accepted"].includes(status.taskStates[taskId]),
    )
  ) {
    fail("incremental-all/accepted-invalid-order");
  }
  if (
    status.prefixEvidenceCommit !== null &&
    status.prefixEvidenceCommit !== status.candidateCommit
  ) {
    fail("incremental-all/verified-evidence-stale");
  }
  if (
    status.milestoneReviewCommit !== null &&
    status.milestoneReviewCommit !== status.candidateCommit
  ) {
    fail("incremental-all/review-candidate-wrong");
  }
}

function cargoLockPackage(lock, name) {
  const blocks = lock.split("[[package]]").slice(1);
  const matches = blocks.filter((block) =>
    new RegExp(`(?:^|\\n)name = "${name.replaceAll("-", "\\-")}"(?:\\n|$)`).test(block),
  );
  return matches.map((block) => ({
    version: /(?:^|\n)version = "([^"]+)"/.exec(block)?.[1],
    checksum: /(?:^|\n)checksum = "([^"]+)"/.exec(block)?.[1],
  }));
}

function lockVersion(lock, name, expected) {
  const matches = cargoLockPackage(lock, name).filter(({ version }) => version === expected);
  if (matches.length !== 1) fail("pin-drift/cargo-lock-version");
  return matches[0];
}

function yamlKeyValue(body) {
  if (body.startsWith("'") || body.startsWith('"')) {
    const quote = body[0];
    const end = body.indexOf(quote, 1);
    if (end === -1 || body[end + 1] !== ":") return null;
    return [body.slice(1, end), body.slice(end + 2).trim()];
  }
  const colon = body.indexOf(":");
  if (colon === -1) return null;
  return [body.slice(0, colon).trim(), body.slice(colon + 1).trim()];
}

function yamlScalar(value) {
  if (
    value.length >= 2 &&
    ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"')))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function yamlScalarPaths(source, diagnostic) {
  const stack = [];
  const values = new Map();
  const paths = new Set();
  for (const rawLine of source.split(/\r?\n/u)) {
    if (/^\s*(?:#.*)?$/u.test(rawLine) || rawLine === "---") continue;
    const indentation = /^ */u.exec(rawLine)[0].length;
    if (rawLine.slice(0, indentation).includes("\t")) fail(diagnostic);
    const body = rawLine.slice(indentation);
    while (stack.at(-1)?.indentation >= indentation) stack.pop();
    if (body.startsWith("- ")) continue;
    const pair = yamlKeyValue(body);
    if (!pair || pair[0].length === 0) continue;
    const [key, value] = pair;
    const path = [...stack.map((entry) => entry.key), key];
    paths.add(JSON.stringify(path));
    if (value.length === 0) {
      stack.push({ indentation, key });
      continue;
    }
    const encoded = JSON.stringify(path);
    const entries = values.get(encoded) ?? [];
    entries.push(yamlScalar(value));
    values.set(encoded, entries);
  }
  const read = (path) => {
    const entries = values.get(JSON.stringify(path)) ?? [];
    return entries.length === 1 ? entries[0] : null;
  };
  read.has = (path) => paths.has(JSON.stringify(path));
  return read;
}

function requireYamlScalar(readScalar, path, expected, diagnostic, peerSuffix = false) {
  const actual = readScalar(path);
  const matches = peerSuffix
    ? actual === expected || actual?.startsWith(`${expected}(`)
    : actual === expected;
  if (!matches) fail(diagnostic, path.join("."));
}

function validSha512Resolution(value) {
  const match = /^\{integrity: (sha512-([A-Za-z0-9+/]{86}==))\}$/u.exec(value ?? "");
  return match !== null && Buffer.from(match[2], "base64").length === 64;
}

export function validatePnpmPins(
  contract,
  workspace,
  lock,
  manifests,
  { includeTypesNode = false } = {},
) {
  const workspaceValue = yamlScalarPaths(workspace, "pin-drift/workspace-yaml");
  const lockValue = yamlScalarPaths(lock, "pin-drift/lock-yaml");
  const dependencies = [
    {
      name: "typescript",
      specifier: `^${contract.pins.typescript}`,
      version: contract.pins.typescript,
      diagnostic: "pin-drift/typescript-version",
      consumers: ["packages/taffyjs-node", "tests/taffyjs-node"],
      peerSuffix: false,
    },
    {
      name: "@napi-rs/cli",
      specifier: contract.pins.napiCli,
      version: contract.pins.napiCli,
      diagnostic: "pin-drift/napi-cli-version",
      consumers: ["packages/taffyjs-node"],
      peerSuffix: true,
    },
    {
      name: "@types/node",
      specifier: contract.implementationDependencyTargets["INFRA-002"]["@types/node"],
      version: contract.implementationDependencyTargets["INFRA-002"]["@types/node"],
      diagnostic: "pin-drift/types-node-target",
      consumers: [".", "packages/taffyjs-node", "tests/taffyjs-node"],
      peerSuffix: false,
    },
  ];
  for (const dependency of dependencies.filter(
    ({ name }) => name !== "@types/node" || includeTypesNode,
  )) {
    requireYamlScalar(
      workspaceValue,
      ["catalog", dependency.name],
      dependency.specifier,
      dependency.diagnostic,
    );
    requireYamlScalar(
      lockValue,
      ["catalogs", "default", dependency.name, "specifier"],
      dependency.specifier,
      dependency.diagnostic,
    );
    requireYamlScalar(
      lockValue,
      ["catalogs", "default", dependency.name, "version"],
      dependency.version,
      dependency.diagnostic,
    );
    if (
      !validSha512Resolution(
        lockValue(["packages", `${dependency.name}@${dependency.version}`, "resolution"]),
      )
    ) {
      fail(dependency.diagnostic, `${dependency.name} package resolution`);
    }
    for (const importer of dependency.consumers) {
      if (manifests[importer]?.devDependencies?.[dependency.name] !== "catalog:") {
        fail(dependency.diagnostic, importer);
      }
      requireYamlScalar(
        lockValue,
        ["importers", importer, "devDependencies", dependency.name, "specifier"],
        "catalog:",
        dependency.diagnostic,
      );
      requireYamlScalar(
        lockValue,
        ["importers", importer, "devDependencies", dependency.name, "version"],
        dependency.version,
        dependency.diagnostic,
        dependency.peerSuffix,
      );
      const lockedVersion = lockValue([
        "importers",
        importer,
        "devDependencies",
        dependency.name,
        "version",
      ]);
      if (!lockValue.has(["snapshots", `${dependency.name}@${lockedVersion}`])) {
        fail(dependency.diagnostic, `${dependency.name} snapshot`);
      }
    }
  }
}

function exportedRuntimeNames(source, path) {
  const tokens = tokenizeJavaScript(source, path);
  const names = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.value !== "export" || token.brace !== 0 || token.bracket !== 0 || token.paren !== 0) {
      continue;
    }
    let cursor = index + 1;
    if (tokens[cursor]?.value === "type" || tokens[cursor]?.value === "interface") continue;
    if (tokens[cursor]?.value === "default") {
      names.push("default");
      continue;
    }
    if (tokens[cursor]?.value === "async") cursor += 1;
    if (["class", "enum", "function", "const", "let", "var"].includes(tokens[cursor]?.value)) {
      const name = tokens[cursor + 1];
      if (!name || name.type !== "identifier") fail("artifact-drift/public-export-syntax", path);
      names.push(name.value);
      continue;
    }
    if (tokens[cursor]?.value === "*") fail("artifact-drift/public-export-wildcard", path);
    if (tokens[cursor]?.value !== "{") {
      fail("artifact-drift/public-export-syntax", path);
    }
    cursor += 1;
    let segment = [];
    const recordSegment = () => {
      const identifiers = segment.filter(({ type }) => type === "identifier");
      segment = [];
      if (identifiers.length === 0 || identifiers[0].value === "type") return;
      const asIndex = identifiers.findIndex(({ value }) => value === "as");
      const name = asIndex === -1 ? identifiers[0] : identifiers[asIndex + 1];
      if (!name) fail("artifact-drift/public-export-syntax", path);
      names.push(name.value);
    };
    while (cursor < tokens.length) {
      const current = tokens[cursor];
      if (current.value === "}" && current.brace === 1) {
        recordSegment();
        break;
      }
      if (
        current.value === "," &&
        current.brace === 1 &&
        current.bracket === 0 &&
        current.paren === 0
      ) {
        recordSegment();
      } else {
        segment.push(current);
      }
      cursor += 1;
    }
    if (cursor === tokens.length) fail("artifact-drift/public-export-syntax", path);
    index = cursor;
  }
  unique(names, "artifact-drift/public-export-duplicate");
  return names.sort(asciiCompare);
}

function assertBareNativeImport(source, path) {
  const tokens = tokenizeJavaScript(source, path);
  const nativeImports = tokens.filter(
    (token, index) =>
      token.value === "import" &&
      token.brace === 0 &&
      token.bracket === 0 &&
      token.paren === 0 &&
      tokens[index + 1]?.type === "string" &&
      tokens[index + 1].value.slice(1, -1) === "#native",
  );
  if (nativeImports.length !== 1) fail("artifact-drift/private-native-entry", path);
  if (
    source.includes("__bootstrap") ||
    /(?:from\s*|import\s*)["'][^"']*(?:native\.js|\.node)["']/u.test(source)
  ) {
    fail("artifact-drift/private-native-leak", path);
  }
}

const PACKAGE_BUILD_COMMAND =
  "napi build --manifest-path ../../crates/taffyjs_binding/Cargo.toml --package-json-path package.json --output-dir . --platform --js native.js --dts native.d.ts --esm --release && vp fmt native.js native.d.ts package.json && node ../../tools/taffy-api/src/sync-platform-artifact.mjs && vp pack && node ../../tools/taffy-api/src/sync-public-declaration.mjs && napi build --manifest-path ../../crates/taffyjs_binding/Cargo.toml --package-json-path package.json --output-dir node_modules/.cache/taffyjs-test-hooks --platform --js test-hooks.js --dts test-hooks.d.ts --esm --release --features test-hooks";

export function validatePackageBuildScript(packageManifest) {
  if (packageManifest.scripts?.build !== PACKAGE_BUILD_COMMAND) {
    fail("collection-drift/runner-graph", "@taffyjs/node#build");
  }
}

async function validateRealPackageFoundation(root, contract, status) {
  if (!IMPLEMENTED_STATES.has(status.taskStates["INFRA-002"])) return;

  const packageRoot = resolve(root, "packages/taffyjs-node");
  const [
    rootManifest,
    packageManifest,
    integrationManifest,
    sourceEntry,
    builtEntry,
    nativeEntry,
    nativeDeclaration,
  ] = await Promise.all([
    readJson(resolve(root, "package.json"), "pin-drift/root-manifest"),
    readJson(resolve(packageRoot, "package.json"), "artifact-drift/root-package-manifest"),
    readJson(resolve(root, "tests/taffyjs-node/package.json"), "pin-drift/integration-manifest"),
    readFile(resolve(packageRoot, "src/index.ts"), "utf8"),
    readFile(resolve(packageRoot, "index.js"), "utf8"),
    readFile(resolve(packageRoot, "native.js"), "utf8"),
    readFile(resolve(packageRoot, "native.d.ts"), "utf8"),
  ]);

  const nodeRanges = [
    contract.pins.node,
    contract.tarballContents.rootManifest.engines.node,
    rootManifest.engines?.node,
    packageManifest.engines?.node,
  ];
  if (new Set(nodeRanges).size !== 1) fail("pin-drift/packed-engines-node");
  validatePackageBuildScript(packageManifest);
  if (
    rootManifest.devDependencies?.["@types/node"] !== "catalog:" ||
    packageManifest.devDependencies?.["@types/node"] !== "catalog:" ||
    integrationManifest.devDependencies?.["@types/node"] !== "catalog:"
  ) {
    fail("pin-drift/types-node-target");
  }

  const expectedFiles = contract.tarballContents.root
    .filter((path) => path !== "package/package.json")
    .map((path) => path.slice("package/".length));
  const expectedOptionalDependencies = Object.fromEntries(
    Object.values(contract.platformPackages).map(({ name }) => [name, "0.0.0"]),
  );
  if (
    packageManifest.private !== true ||
    packageManifest.version !== "0.0.0" ||
    packageManifest.license !== "UNLICENSED" ||
    contract.pins.moduleFormat !== "esm" ||
    packageManifest.type !== "module" ||
    packageManifest.main !== "./index.js" ||
    packageManifest.types !== "./index.d.ts" ||
    canonicalJson(packageManifest.files) !== canonicalJson(expectedFiles) ||
    canonicalJson(packageManifest.imports) !== canonicalJson({ "#native": "./native.js" }) ||
    canonicalJson(packageManifest.exports) !==
      canonicalJson({
        ".": { types: "./index.d.ts", default: "./index.js" },
        "./package.json": "./package.json",
      }) ||
    canonicalJson(packageManifest.optionalDependencies) !==
      canonicalJson(expectedOptionalDependencies) ||
    canonicalJson(packageManifest.napi?.targets) !== canonicalJson(contract.targets)
  ) {
    fail("artifact-drift/root-package-manifest");
  }

  const targetMetadata = {
    "x86_64-apple-darwin": { directory: "darwin-x64", os: ["darwin"], cpu: ["x64"] },
    "aarch64-apple-darwin": { directory: "darwin-arm64", os: ["darwin"], cpu: ["arm64"] },
    "x86_64-pc-windows-msvc": {
      directory: "win32-x64-msvc",
      os: ["win32"],
      cpu: ["x64"],
    },
    "x86_64-unknown-linux-gnu": {
      directory: "linux-x64-gnu",
      os: ["linux"],
      cpu: ["x64"],
      libc: ["glibc"],
    },
  };
  for (const rustTarget of contract.targets) {
    const platform = contract.platformPackages[rustTarget];
    const metadata = targetMetadata[rustTarget];
    if (!platform || !metadata) fail("artifact-drift/platform-target", rustTarget);
    const platformRoot = resolve(packageRoot, "npm", metadata.directory);
    const manifest = await readJson(
      resolve(platformRoot, "package.json"),
      "artifact-drift/platform-package-manifest",
    );
    const expectedManifest = {
      name: platform.name,
      version: "0.0.0",
      private: true,
      license: "UNLICENSED",
      os: metadata.os,
      cpu: metadata.cpu,
      ...(metadata.libc ? { libc: metadata.libc } : {}),
      main: platform.binary,
      files: [platform.binary],
    };
    if (canonicalJson(manifest) !== canonicalJson(expectedManifest)) {
      fail("artifact-drift/platform-package-manifest", rustTarget);
    }
    const readme = await readFile(resolve(platformRoot, "README.md"), "utf8");
    if (!readme.includes(platform.name)) fail("artifact-drift/platform-readme", rustTarget);
  }

  assertBareNativeImport(sourceEntry, "packages/taffyjs-node/src/index.ts");
  assertBareNativeImport(builtEntry, "packages/taffyjs-node/index.js");
  if (nativeEntry.includes("__bootstrap") || nativeDeclaration.includes("__bootstrap")) {
    fail("artifact-drift/private-native-leak");
  }
  const expectedRuntimeExports = Object.entries(contract.publicRuntimeExportsByOwner)
    .filter(([owner]) => stateImplemented(status.taskStates, owner))
    .flatMap(([, names]) => names)
    .sort(asciiCompare);
  for (const [path, source] of [
    ["packages/taffyjs-node/src/index.ts", sourceEntry],
    ["packages/taffyjs-node/index.js", builtEntry],
  ]) {
    if (
      canonicalJson(exportedRuntimeNames(source, path)) !== canonicalJson(expectedRuntimeExports)
    ) {
      fail("artifact-drift/public-runtime-exports", path);
    }
  }
}

function prefixTaskNames(contract, expanded, status) {
  const modalities = new Set(
    expanded.evidence.primary
      .filter(
        ({ modality, owner }) =>
          modality !== "machine-check" &&
          modality !== "command-attestation" &&
          IMPLEMENTED_STATES.has(status.taskStates[owner]),
      )
      .map(({ modality }) => modality),
  );
  return [...modalities].map((modality) => {
    if (modality === "rust-contract") return "check:test:rust-contract";
    const runner = contract.primaryEvidenceRules.modalities[modality]?.runner;
    const match = /^vp run (check:test:[a-z-]+)$/u.exec(runner ?? "");
    if (!match) fail("collection-drift/runner-graph", modality);
    return match[1];
  });
}

export function validateRunnerTaskGraph(contract, expanded, status, tasks) {
  const minimumRuntime = contract.pins.minimumNodeTestRuntime;
  const testTasks = {
    "check:test:native":
      "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native",
    "check:test:wrapper":
      "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/wrapper",
    "check:test:integration": "vp run @taffyjs/node-integration-tests#test",
    "check:test:types": "node tools/taffy-api/src/run-type-tests.mjs",
    "check:test:node-minimum": `vp env exec --node ${minimumRuntime} -- node tests/taffyjs-node/minimum-node/run.mjs`,
    "check:test:rust-contract": "node tools/taffy-api/src/run-rust-tests.mjs",
  };
  for (const [name, command] of Object.entries(testTasks)) {
    if (
      canonicalJson(tasks[name]) !==
      canonicalJson({ command, dependsOn: ["build", "check:contract"] })
    ) {
      fail("collection-drift/runner-graph", name);
    }
  }
  const readyDependencies = [
    "check:contract",
    "check:format",
    "check:lint",
    "check:rust",
    ...prefixTaskNames(contract, expanded, status),
  ];
  const expectedTasks = {
    "check:contract:generate": { command: "node tools/taffy-api/src/index.mjs generate --check" },
    "check:contract:self-test": {
      command:
        "vp test --config tools/taffy-api/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs",
    },
    "check:contract": {
      command: "node tools/taffy-api/src/index.mjs check",
      dependsOn: ["build", "check:contract:generate", "check:contract:self-test"],
    },
    "check:contract:all": {
      command: "node tools/taffy-api/src/index.mjs check --all",
      dependsOn: ["build", "check:contract:generate", "check:contract:self-test"],
    },
    "check:completion": { command: "node tools/taffy-api/src/index.mjs completion" },
    "check:review-completion": {
      command: "node tools/taffy-api/src/index.mjs review-completion",
    },
    "build:binding": { command: "vp run @taffyjs/node#build" },
    build: { command: "echo build ok", dependsOn: ["build:binding"] },
    "check:format": { command: "vp fmt --check", dependsOn: ["build"] },
    "check:lint": { command: "vp lint --deny-warnings", dependsOn: ["build"] },
    "check:rust": {
      command:
        "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features -- --list && cargo test --workspace --all-features",
    },
    "check:test": {
      command: "echo tests ok",
      dependsOn: Object.keys(testTasks),
    },
    check: {
      command: "echo check ok",
      dependsOn: ["check:contract:all", "check:format", "check:lint", "check:rust", "check:test"],
    },
    "ready:loop:body": {
      command: "echo ready:loop checks passed",
      dependsOn: readyDependencies,
    },
    "ready:loop": { command: "node tools/taffy-api/src/run-ready.mjs loop" },
    "ready:body": { command: "echo ready checks passed", dependsOn: ["check"] },
    ready: { command: "node tools/taffy-api/src/run-ready.mjs all" },
  };
  for (const [name, expected] of Object.entries(expectedTasks)) {
    if (canonicalJson(tasks[name]) !== canonicalJson(expected)) {
      fail("collection-drift/runner-graph", name);
    }
  }
  if (
    Object.hasOwn(tasks, "check:test:prefix") ||
    Object.values(tasks).some(({ command }) => command?.includes("--passWithNoTests"))
  ) {
    fail("collection-drift/runner-graph");
  }
}

async function validateRealRunnerGraph(root, contract, expanded, status) {
  const minimumRuntime = contract.pins.minimumNodeTestRuntime;
  const [
    rootConfigModule,
    rustRunner,
    typeRunner,
    readyRunner,
    toolConfig,
    nativeConfig,
    publicConfig,
  ] = await Promise.all([
    import(
      `${pathToFileURL(resolve(root, "vite.config.ts")).href}?candidate=${status.candidateCommit}`
    ),
    readFile(resolve(root, "tools/taffy-api/src/run-rust-tests.mjs"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/src/run-type-tests.mjs"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/src/run-ready.mjs"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/vite.config.ts"), "utf8"),
    readFile(resolve(root, "packages/taffyjs-node/vite.config.ts"), "utf8"),
    readFile(resolve(root, "tests/taffyjs-node/vite.config.ts"), "utf8"),
  ]);
  validateRunnerTaskGraph(contract, expanded, status, rootConfigModule.default.run?.tasks ?? {});
  if (
    !rustRunner.includes('"--list"') ||
    !rustRunner.includes('"--exact"') ||
    !rustRunner.includes('"--include-ignored"') ||
    !rustRunner.includes("JSON.stringify(identities) !== JSON.stringify(expectedIdentities)") ||
    !typeRunner.includes(".test-d.ts") ||
    !readyRunner.includes(
      "await checkCandidate({ root });\nawait runBody();\nawait checkCandidate({ root });",
    ) ||
    [toolConfig, nativeConfig, publicConfig].some(
      (source) => !/retry:\s*0/u.test(source) || source.includes("passWithNoTests"),
    )
  ) {
    fail("collection-drift/runner-graph");
  }
  if (requiredRegistrationState(status.taskStates["MATURITY-002"])) {
    const harness = await readFile(
      resolve(root, "tests/taffyjs-node/minimum-node/run.mjs"),
      "utf8",
    );
    if (
      !harness.includes(`v${minimumRuntime}`) ||
      !harness.includes("process.version") ||
      !harness.includes("@taffyjs/node")
    ) {
      fail("collection-drift/minimum-node-wrong-runtime");
    }
  }
}

export function validateParsedSourceInventory(contract, parsed) {
  if (parsed.parser !== "syn-2.0.119") fail("source-drift/parser-version");
  if (!parsed.inherentImplMatches) fail("source-drift/impl-header");
  if ((parsed.inherentMethodDuplicates ?? []).length !== 0) {
    fail("source-drift/method-added", parsed.inherentMethodDuplicates.join(", "));
  }
  const inherentNames = Object.keys(parsed.inherentMethods);
  const expectedInherentNames = Object.keys(contract.upstream.taffyTree.methods);
  if (inherentNames.length < expectedInherentNames.length) {
    fail("source-drift/method-missing");
  }
  if (inherentNames.length > expectedInherentNames.length) {
    fail("source-drift/method-added");
  }
  if (
    JSON.stringify(inherentNames.sort(asciiCompare)) !==
    JSON.stringify(expectedInherentNames.sort(asciiCompare))
  ) {
    fail("source-drift/method-renamed");
  }
  for (const [name, method] of Object.entries(parsed.inherentMethods)) {
    if (!method.signatureMatches) {
      fail("source-drift/method-signature", `${name}: ${method.normalizedSignature}`);
    }
    const expectedCfg = cfgRuleFromFeatures(
      contract.upstream.taffyTree.methodFeatureOverrides[name] ?? [
        contract.upstream.taffyTree.feature,
      ],
    );
    if (JSON.stringify(normalizeCfgRule(method.cfg)) !== JSON.stringify(expectedCfg)) {
      fail("source-drift/method-feature-gate", name);
    }
  }
  if (!parsed.traitImplMatches) fail("source-drift/trait-impl-header");
  if ((parsed.traitMethodDuplicates ?? []).length !== 0) {
    fail("source-drift/trait-method-signature", parsed.traitMethodDuplicates.join(", "));
  }
  const traitNames = Object.keys(parsed.traitMethods);
  const expectedTraitNames = Object.keys(contract.upstream.traversePartialTree.methods);
  if (
    JSON.stringify(traitNames.sort(asciiCompare)) !==
      JSON.stringify(expectedTraitNames.sort(asciiCompare)) ||
    Object.values(parsed.traitMethods).some(({ signatureMatches }) => !signatureMatches)
  ) {
    fail("source-drift/trait-method-signature");
  }
  const expectedTraitCfg = cfgRuleFromFeatures([contract.upstream.traversePartialTree.feature]);
  if (
    Object.values(parsed.traitMethods).some(
      ({ cfg }) => JSON.stringify(normalizeCfgRule(cfg)) !== JSON.stringify(expectedTraitCfg),
    )
  ) {
    fail("source-drift/trait-method-feature-gate");
  }
  if (
    parsed.adjacentRoots.length !== contract.upstream.adjacentRoots.length ||
    parsed.adjacentRoots.some(({ matches }) => !matches)
  ) {
    fail("source-drift/adjacent-root");
  }
  if (Object.keys(parsed.namedData).length !== Object.keys(contract.namedDataShapes).length) {
    fail("source-drift/named-data-count");
  }
  const badNamedData = Object.entries(parsed.namedData).filter(([, value]) => !value.shapeMatches);
  if (badNamedData.length !== 0) {
    fail("source-drift/named-data-shape", badNamedData.map(([name]) => name).join(", "));
  }
}

const verifiedTaffyArchives = new Map();

function taffyArchivePath(taffyRoot, version) {
  const registrySource = dirname(taffyRoot);
  const registryRoot = dirname(dirname(registrySource));
  return resolve(registryRoot, "cache", basename(registrySource), `taffy-${version}.crate`);
}

async function verifiedTaffyArchiveSources(contract, archivePath) {
  const cacheKey = `${archivePath}\0${contract.pins.taffyChecksum}`;
  if (verifiedTaffyArchives.has(cacheKey)) return verifiedTaffyArchives.get(cacheKey);
  let archive;
  try {
    archive = await readFile(archivePath);
  } catch {
    fail("pin-drift/taffy-source-archive", archivePath);
  }
  if (sha256(archive) !== contract.pins.taffyChecksum) {
    fail("pin-drift/taffy-checksum");
  }
  let tar;
  try {
    tar = gunzipSync(archive);
  } catch {
    fail("pin-drift/taffy-source-archive", archivePath);
  }
  const prefix = `taffy-${contract.pins.taffyVersion}/`;
  const sources = new Map();
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, end) => header.subarray(start, end).toString("utf8").split("\0", 1)[0];
    const name = [field(345, 500), field(0, 100)].filter(Boolean).join("/");
    const size = Number.parseInt(field(124, 136).trim() || "0", 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) {
      fail("pin-drift/taffy-source-archive", archivePath);
    }
    const type = header[156];
    if ((type === 0 || type === 48) && name.startsWith(prefix)) {
      const relative = name.slice(prefix.length);
      if (sources.has(relative)) fail("pin-drift/taffy-source-archive", archivePath);
      sources.set(relative, Buffer.from(tar.subarray(offset + 512, offset + 512 + size)));
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (sources.size === 0) {
    fail("pin-drift/taffy-source-archive", archivePath);
  }
  verifiedTaffyArchives.set(cacheKey, sources);
  return sources;
}

async function validateTaffySourceArchive(contract, taffyRoot, archivePath) {
  const archiveSources = await verifiedTaffyArchiveSources(contract, archivePath);
  const listFiles = async (prefix = "") => {
    const entries = await readdir(resolve(taffyRoot, prefix), { withFileTypes: true });
    const paths = [];
    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (path === ".cargo-ok") continue;
      if (entry.isDirectory()) paths.push(...(await listFiles(path)));
      else if (entry.isFile()) paths.push(path);
      else fail("source-drift/named-data-binding", `unsupported extracted entry ${path}`);
    }
    return paths;
  };
  let actualEntries;
  try {
    actualEntries = (await listFiles()).sort(asciiCompare);
  } catch (error) {
    if (error instanceof DiagnosticError) throw error;
    fail("source-drift/named-data-binding", "failed to inspect extracted Taffy package");
  }
  const expectedEntries = [...archiveSources.keys()].sort(asciiCompare);
  if (canonicalJson(actualEntries) !== canonicalJson(expectedEntries)) {
    fail("source-drift/named-data-binding", "Taffy extracted file set differs from its archive");
  }
  let matches;
  try {
    matches = await Promise.all(
      [...archiveSources].map(async ([entry, expected]) =>
        expected.equals(await readFile(resolve(taffyRoot, entry))),
      ),
    );
  } catch {
    fail("source-drift/named-data-binding", "pinned Taffy source file missing");
  }
  if (matches.some((matches) => !matches)) {
    fail("source-drift/named-data-binding", "Taffy source differs from its verified archive");
  }
}

export async function validateRealSourceInventory(root, contract, taffyRoot, archivePath) {
  const parserResult = await runCommand(
    "cargo",
    [
      "run",
      "--quiet",
      "-p",
      "taffy-api-parser",
      "--",
      taffyRoot,
      resolve(root, "tools/taffy-api/contract.json"),
    ],
    root,
  );
  let parsed;
  try {
    parsed = JSON.parse(parserResult.stdout);
  } catch (error) {
    fail("source-drift/parser-output", error.message);
  }
  validateParsedSourceInventory(contract, parsed);
  await validateTaffySourceArchive(contract, taffyRoot, archivePath);
  return parsed;
}

export async function validateRealPinsAndSource(root, contract, status) {
  const metadataResult = await runCommand(
    "cargo",
    ["metadata", "--locked", "--format-version", "1"],
    root,
  );
  const metadata = JSON.parse(metadataResult.stdout);
  const binding = metadata.packages.find(({ name }) => name === "taffyjs_binding");
  if (!binding) fail("pin-drift/binding-package");
  const requirements = {
    napi: contract.pins.napi,
    "napi-derive": contract.pins.napiDerive,
    "napi-build": contract.pins.napiBuild,
    taffy: contract.pins.taffyVersion,
  };
  for (const [name, version] of Object.entries(requirements)) {
    const dependency = binding.dependencies.find((candidate) => candidate.name === name);
    if (!dependency || dependency.req !== `=${version}`) {
      fail(`pin-drift/cargo-${name}-requirement`);
    }
  }
  const taffyDependency = binding.dependencies.find(({ name }) => name === "taffy");
  if (taffyDependency.uses_default_features !== contract.pins.taffyDefaultFeatures) {
    fail("pin-drift/taffy-default-features");
  }
  const lock = await readFile(resolve(root, "Cargo.lock"), "utf8");
  lockVersion(lock, "napi", contract.pins.napi);
  lockVersion(lock, "napi-derive", contract.pins.napiDerive);
  lockVersion(lock, "napi-build", contract.pins.napiBuild);
  const lockedTaffy = lockVersion(lock, "taffy", contract.pins.taffyVersion);
  if (lockedTaffy.checksum !== contract.pins.taffyChecksum) {
    fail("pin-drift/taffy-checksum");
  }
  const taffyPackage = metadata.packages.find(
    ({ name, version }) => name === "taffy" && version === contract.pins.taffyVersion,
  );
  if (!taffyPackage || !taffyPackage.source?.startsWith("registry+")) {
    fail("pin-drift/taffy-source");
  }
  const taffyNode = metadata.resolve.nodes.find(({ id }) => id === taffyPackage.id);
  if (
    !taffyNode ||
    JSON.stringify([...taffyNode.features].sort(asciiCompare)) !==
      JSON.stringify([...contract.pins.taffyResolvedFeatures].sort(asciiCompare))
  ) {
    fail("pin-drift/taffy-resolved-features");
  }
  const [rootManifest, packageManifest, integrationManifest] = await Promise.all([
    readJson(resolve(root, "package.json"), "pin-drift/root-manifest"),
    readJson(
      resolve(root, "packages/taffyjs-node/package.json"),
      "artifact-drift/root-package-manifest",
    ),
    readJson(resolve(root, "tests/taffyjs-node/package.json"), "pin-drift/integration-manifest"),
  ]);
  if (rootManifest.engines?.node !== contract.pins.node) {
    fail("pin-drift/node-range");
  }
  const pnpmLock = await readFile(resolve(root, "pnpm-lock.yaml"), "utf8");
  const workspace = await readFile(resolve(root, "pnpm-workspace.yaml"), "utf8");
  validatePnpmPins(
    contract,
    workspace,
    pnpmLock,
    {
      ".": rootManifest,
      "packages/taffyjs-node": packageManifest,
      "tests/taffyjs-node": integrationManifest,
    },
    {
      includeTypesNode: IMPLEMENTED_STATES.has(status.taskStates["INFRA-002"]),
    },
  );
  const vpVersion = await runCommand("vp", ["--version"], root);
  if (!vpVersion.stdout.includes(`oxfmt            v${contract.pins.oxfmt}`)) {
    fail("pin-drift/oxfmt-version");
  }
  const taffyRoot = dirname(taffyPackage.manifest_path);
  const archivePath = taffyArchivePath(taffyRoot, contract.pins.taffyVersion);
  const parsed = await validateRealSourceInventory(root, contract, taffyRoot, archivePath);
  return { metadata, parsed, archivePath };
}

async function validateContractBase(root, goal, status) {
  if (!/^\[VOUCHED @hyfdev 2026-08-12\]$/m.test(goal.slice(0, 160))) {
    fail("contract-base-vouch");
  }
  const exists = await runCommand(
    "git",
    ["cat-file", "-e", `${status.contractBaseCommit}^{commit}`],
    root,
    { allowFailure: true },
  );
  if (exists.code !== 0) fail("contract-base-commit");
  const committedGoal = await runCommand(
    "git",
    ["show", `${status.contractBaseCommit}:.agents/docs/loop-goal.md`],
    root,
  );
  if (committedGoal.stdout !== goal) fail("contract-base-goal-drift");
  const candidateExists = await runCommand(
    "git",
    ["cat-file", "-e", `${status.candidateCommit}^{commit}`],
    root,
    { allowFailure: true },
  );
  if (candidateExists.code !== 0) fail("candidate-commit");
  const ancestry = await runCommand(
    "git",
    ["merge-base", "--is-ancestor", status.contractBaseCommit, status.candidateCommit],
    root,
    { allowFailure: true },
  );
  if (ancestry.code !== 0) fail("candidate-ancestry");
}

export function validateCurrentEvidence(expanded, status, { all = false } = {}) {
  const green = new Map();
  for (const record of status.greenEvidence) {
    if (!record.acceptanceId) continue;
    const entries = green.get(record.acceptanceId) ?? [];
    entries.push(record);
    green.set(record.acceptanceId, entries);
  }
  const required = new Set(
    expanded.evidence.primary
      .filter(({ modality }) => modality !== "command-attestation")
      .filter((evidence) => {
        if (all) return true;
        const state = status.taskStates[evidence.owner];
        return (
          ["verified", "under-review"].includes(state) ||
          (status.prefixEvidenceCommit === status.candidateCommit && IMPLEMENTED_STATES.has(state))
        );
      })
      .map(({ id }) => id),
  );
  for (const evidence of expanded.evidence.primary) {
    if (!required.has(evidence.id)) continue;
    const records = (green.get(evidence.id) ?? []).filter(
      ({ candidateCommit }) => candidateCommit === status.candidateCommit,
    );
    if (
      records.length !== 1 ||
      records[0].result !== "pass" ||
      records[0].runner !== evidence.runner ||
      records[0].path !== evidence.path
    ) {
      fail("evidence-current-commit", evidence.id);
    }
  }
  const expectedById = new Map(
    expanded.evidence.primary.map((evidence) => [evidence.id, evidence]),
  );
  for (const [id, records] of green) {
    const evidence = expectedById.get(id);
    if (!evidence) fail("evidence-additional-id", id);
    const current = records.filter(
      ({ candidateCommit }) => candidateCommit === status.candidateCommit,
    );
    if (current.length > 1) fail("evidence-current-commit", id);
    if (
      current.length === 1 &&
      !required.has(id) &&
      !["accepted"].includes(status.taskStates[evidence.owner])
    ) {
      fail("evidence-premature", id);
    }
  }
}

export async function checkRepository({ root, all = false } = {}) {
  const resolvedRoot = resolve(root ?? process.cwd());
  const goal = await readFile(resolve(resolvedRoot, ".agents/docs/loop-goal.md"), "utf8");
  const generated = await generateArtifacts({
    root: resolvedRoot,
    goal,
    write: false,
  });
  if (
    (await readFile(resolve(resolvedRoot, "tools/taffy-api/contract.json"), "utf8")) !==
    generated.contractJson
  ) {
    fail("generated-contract-drift");
  }
  if (
    (await readFile(resolve(resolvedRoot, "tools/taffy-api/expected-declaration.d.ts"), "utf8")) !==
    generated.expectedDeclaration
  ) {
    fail("generated-declaration-drift");
  }
  if (
    (await readFile(resolve(resolvedRoot, NUMERIC_TYPESCRIPT_PATH), "utf8")) !==
    generated.numericTypeScript
  ) {
    fail("generated-numeric-typescript-drift");
  }
  if (
    (await readFile(resolve(resolvedRoot, NUMERIC_RUST_PATH), "utf8")) !== generated.numericRust
  ) {
    fail("generated-numeric-rust-drift");
  }
  if (
    (await readFile(resolve(resolvedRoot, NUMERIC_TYPE_FIXTURE_PATH), "utf8")) !==
    generated.numericTypeFixture
  ) {
    fail("generated-numeric-type-fixture-drift");
  }
  const statusSource = await readFile(resolve(resolvedRoot, ".agents/docs/loop-status.md"), "utf8");
  const status = extractLoopStatus(statusSource);
  validateStatusShape(status, generated.canonical, generated.expanded);
  await validateContractBase(resolvedRoot, goal, status);
  await validateRealPinsAndSource(resolvedRoot, generated.canonical, status);
  await validateRealRunnerGraph(resolvedRoot, generated.canonical, generated.expanded, status);
  await validateRealPackageFoundation(resolvedRoot, generated.canonical, status);
  await validateRealDeclarations(
    resolvedRoot,
    generated.canonical,
    status,
    generated.expectedDeclaration,
  );
  const calls = await collectStaticEvidence(resolvedRoot, generated.expanded, status);
  validateStaticCollection(generated.canonical, generated.expanded, status, calls);
  validateCurrentEvidence(generated.expanded, status, { all });
  if (all) {
    const incomplete = Object.entries(status.taskStates).filter(
      ([, state]) => !["implemented", "verified", "under-review", "accepted"].includes(state),
    );
    if (incomplete.length !== 0) {
      fail("incremental-all/all-incomplete-task", incomplete.map(([taskId]) => taskId).join(", "));
    }
    if (calls.length !== generated.expanded.evidence.primary.length) {
      fail("collection-drift/test-uncollected");
    }
  }
  return {
    contract: generated.canonical,
    expanded: generated.expanded,
    status,
    collectedPrimaryIds: calls.map(({ id }) => id).sort(asciiCompare),
  };
}

function validateUtcTimestamp(value, diagnostic) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    fail(diagnostic);
  }
}

function validateCommandAttestation(contract, status) {
  const definition = contract.primaryEvidenceRules.commandAttestations["MATURITY-003/local-green"];
  const evidence = status.commandEvidence["MATURITY-003/local-green"];
  if (!evidence) fail("completion-command-missing");
  exactKeys(
    evidence,
    [
      "command",
      "workingDirectory",
      "candidateCommit",
      "startedAt",
      "finishedAt",
      "exitCode",
      "output",
      "sha256",
    ],
    "completion-command-schema",
  );
  if (
    evidence.command !== definition.command ||
    evidence.workingDirectory !== definition.workingDirectory
  ) {
    fail("completion-command-definition");
  }
  if (evidence.command.includes(definition.forbiddenInvocation)) {
    fail("completion-command-recursive");
  }
  if (evidence.candidateCommit !== status.candidateCommit || evidence.exitCode !== 0) {
    fail("completion-command-stale-or-failed");
  }
  validateUtcTimestamp(evidence.startedAt, "completion-command-start");
  validateUtcTimestamp(evidence.finishedAt, "completion-command-finish");
  if (Date.parse(evidence.finishedAt) < Date.parse(evidence.startedAt)) {
    fail("completion-command-time-order");
  }
  if (
    typeof evidence.output !== "string" ||
    !/^[a-f0-9]{64}$/.test(evidence.sha256) ||
    sha256(evidence.output) !== evidence.sha256
  ) {
    fail("completion-command-output-hash");
  }
}

async function validateCandidateHeadAndClean(root, status) {
  const head = (await runCommand("git", ["rev-parse", "HEAD"], root)).stdout.trim();
  if (head !== status.candidateCommit) fail("candidate-head-mismatch");
  const worktree = (await runCommand("git", ["status", "--porcelain=v1"], root)).stdout
    .split("\n")
    .filter(Boolean);
  const unexpected = worktree.filter((line) => line.slice(3) !== ".agents/docs/loop-status.md");
  if (unexpected.length !== 0) {
    fail("candidate-worktree-dirty", unexpected.join("\n"));
  }
}

export async function checkCandidate({ root } = {}) {
  const resolvedRoot = resolve(root ?? process.cwd());
  const statusSource = await readFile(resolve(resolvedRoot, ".agents/docs/loop-status.md"), "utf8");
  const status = extractLoopStatus(statusSource);
  await validateCandidateHeadAndClean(resolvedRoot, status);
  return status;
}

export async function checkCompletion({ root } = {}) {
  const resolvedRoot = resolve(root ?? process.cwd());
  const result = await checkRepository({ root: resolvedRoot, all: true });
  validateCommandAttestation(result.contract, result.status);
  await validateCandidateHeadAndClean(resolvedRoot, result.status);
  for (const taskId of result.contract.milestones.M4) {
    if (
      !["implemented", "verified", "under-review", "accepted"].includes(
        result.status.taskStates[taskId],
      )
    ) {
      fail("completion-m4-task-state", taskId);
    }
  }
  if (result.status.prefixEvidenceCommit !== null) {
    fail("completion-prefix-premature");
  }
  return result;
}

function buildReviewProjection(contract, status) {
  const values = {
    contractBaseCommit: status.contractBaseCommit,
    candidateCommit: status.candidateCommit,
    previousAcceptedMilestoneCommit: status.previousAcceptedMilestoneCommit,
    activeMilestone: status.activeMilestone,
    reviewRoundId: status.reviewRoundId,
    currentTaskIds: status.currentTaskIds,
    reviewerSlots: status.reviewerSlots,
    inspectionCommands: status.inspectionCommands,
  };
  return Object.fromEntries(
    contract.reviewPolicy.reviewInputStatusHash.projectionKeys.map((key) => [key, values[key]]),
  );
}

export function validateActualReviewRecord(contract, status) {
  const expectedTasks = contract.milestones[status.activeMilestone];
  if (JSON.stringify(status.currentTaskIds) !== JSON.stringify(expectedTasks)) {
    fail("review-current-task-ids");
  }
  const expectedSlots = expectedReviewSlots(contract, status.activeMilestone);
  if (JSON.stringify(status.reviewerSlots) !== JSON.stringify(expectedSlots)) {
    fail("review-reviewer-slots");
  }
  if (!status.reviewRoundId || status.inspectionCommands.length === 0) {
    fail("review-input-incomplete");
  }
  const projection = buildReviewProjection(contract, status);
  if (canonicalJson(status.reviewInputProjection) !== canonicalJson(projection)) {
    fail("review-input-projection");
  }
  const projectionBytes = serializeReviewInputProjection(projection);
  const expectedHash = sha256(projectionBytes);
  if (status.reviewInputStatusHash !== expectedHash) {
    fail("review-input-hash");
  }
  if (
    status.reviewedCommits.contractBaseCommit !== status.contractBaseCommit ||
    status.reviewedCommits.previousCommit !== status.previousAcceptedMilestoneCommit ||
    status.reviewedCommits.candidateCommit !== status.candidateCommit
  ) {
    fail("reviewed-commits");
  }
  if (status.reports.length !== expectedSlots.length) {
    fail("review-report-count");
  }
  const reportBySlot = new Map();
  const identities = new Set();
  for (const report of status.reports) {
    if (!expectedSlots.includes(report.slot) || reportBySlot.has(report.slot)) {
      fail("review-report-slot");
    }
    if (
      typeof report.reviewerIdentity !== "string" ||
      report.reviewerIdentity.length === 0 ||
      identities.has(report.reviewerIdentity)
    ) {
      fail("review-reviewer-identity");
    }
    identities.add(report.reviewerIdentity);
    if (
      report.startCandidateCommit !== status.candidateCommit ||
      report.endCandidateCommit !== status.candidateCommit
    ) {
      fail("review-report-candidate");
    }
    if (
      report.startReviewInputStatusHash !== expectedHash ||
      report.endReviewInputStatusHash !== expectedHash
    ) {
      fail("review-report-hash");
    }
    if (
      !Array.isArray(report.earlierImpact) ||
      !Array.isArray(report.inspectedEvidence) ||
      report.inspectedEvidence.length === 0
    ) {
      fail("review-report-evidence");
    }
    reportBySlot.set(report.slot, report);
  }
  const requiredCells = new Set(
    expectedTasks.flatMap((taskId) => expectedSlots.map((slot) => `${taskId}\0${slot}`)),
  );
  const milestoneNames = Object.keys(contract.milestones);
  const activeMilestoneIndex = milestoneNames.indexOf(status.activeMilestone);
  const priorTasks = new Set(
    milestoneNames
      .slice(0, activeMilestoneIndex)
      .flatMap((milestone) => contract.milestones[milestone]),
  );
  const earlierImpact = new Set();
  for (const report of status.reports) {
    for (const taskId of report.earlierImpact) {
      if (!priorTasks.has(taskId)) fail("review-earlier-impact-task", taskId);
      earlierImpact.add(taskId);
    }
  }
  for (const taskId of earlierImpact) {
    for (const slot of expectedSlots) requiredCells.add(`${taskId}\0${slot}`);
  }
  const seenCells = new Set();
  for (const verdict of status.verdicts) {
    const cell = `${verdict.taskId}\0${verdict.slot}`;
    if (seenCells.has(cell)) fail("review-verdict-duplicate");
    seenCells.add(cell);
    if (
      !expectedSlots.includes(verdict.slot) ||
      (!expectedTasks.includes(verdict.taskId) && !earlierImpact.has(verdict.taskId)) ||
      !["PASS", "FAIL"].includes(verdict.verdict) ||
      verdict.candidateCommit !== status.candidateCommit ||
      verdict.reviewInputStatusHash !== expectedHash
    ) {
      fail("review-verdict-invalid");
    }
  }
  if (
    requiredCells.size !== seenCells.size ||
    [...requiredCells].some((cell) => !seenCells.has(cell))
  ) {
    fail("review-verdict-matrix");
  }
  if (status.verdicts.some(({ verdict }) => verdict !== "PASS")) {
    fail("review-verdict-failed");
  }
  unique(
    status.findings.map(({ id }) => id),
    "review-finding-duplicate",
  );
  unique(
    status.closures.map(({ findingId }) => findingId),
    "review-closure-duplicate",
  );
  const findingIds = new Set(status.findings.map(({ id }) => id));
  if (status.closures.some(({ findingId }) => !findingIds.has(findingId))) {
    fail("review-closure-orphan");
  }
  const closureByFinding = new Map(status.closures.map((closure) => [closure.findingId, closure]));
  for (const finding of status.findings) {
    if (!identities.has(finding.reviewerIdentity)) fail("review-finding-reviewer");
    if (!["blocker", "major", "minor"].includes(finding.severity)) {
      fail("review-finding-severity");
    }
    if (!["fixed", "rejected", "remaining-minor"].includes(finding.disposition)) {
      fail("review-finding-disposition");
    }
    if (
      ["blocker", "major"].includes(finding.severity) &&
      finding.disposition === "remaining-minor"
    ) {
      fail("review-material-finding-unresolved");
    }
    if (["fixed", "rejected"].includes(finding.disposition)) {
      const closure = closureByFinding.get(finding.id);
      if (
        !closure ||
        closure.reviewerIdentity !== finding.reviewerIdentity ||
        closure.candidateCommit !== status.candidateCommit ||
        closure.confirmed !== true
      ) {
        fail("review-finding-closure");
      }
    }
    if (finding.disposition === "fixed" && finding.fixCommit !== status.candidateCommit) {
      fail("review-finding-fix-commit");
    }
  }
  if (status.blockers.length !== 0) fail("review-blocker-unresolved");
  if (
    status.remainingMinorFindings.some(
      (findingId) =>
        !status.findings.some(
          (finding) =>
            finding.id === findingId &&
            finding.severity === "minor" &&
            finding.disposition === "remaining-minor",
        ),
    )
  ) {
    fail("review-minor-finding-record");
  }
}

export async function checkReviewCompletion({ root } = {}) {
  const resolvedRoot = resolve(root ?? process.cwd());
  const result = await checkRepository({
    root: resolvedRoot,
    all: false,
  });
  const { contract, status } = result;
  validateActualReviewRecord(contract, status);
  if (
    status.prefixEvidenceCommit !== status.candidateCommit ||
    status.milestoneReviewCommit !== status.candidateCommit
  ) {
    fail("review-commit-attestation");
  }
  for (const taskId of contract.milestones[status.activeMilestone]) {
    if (status.taskStates[taskId] !== "accepted") {
      fail("review-task-transition", taskId);
    }
  }
  if (status.activeMilestone === "M4") {
    if (status.phase !== "complete") fail("review-complete-transition");
    validateCommandAttestation(contract, status);
  } else if (status.phase !== "review") {
    fail("review-milestone-transition");
  }
  await validateCandidateHeadAndClean(resolvedRoot, status);
  return result;
}

async function cli() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const command = process.argv[2];
  if (command === "generate") {
    const goal = await readFile(resolve(root, ".agents/docs/loop-goal.md"), "utf8");
    const result = await generateArtifacts({
      root,
      goal,
      write: !process.argv.includes("--check"),
    });
    if (process.argv.includes("--check")) {
      const actualContract = await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8");
      const actualDeclaration = await readFile(
        resolve(root, "tools/taffy-api/expected-declaration.d.ts"),
        "utf8",
      );
      const actualNumericTypeScript = await readFile(
        resolve(root, NUMERIC_TYPESCRIPT_PATH),
        "utf8",
      );
      const actualNumericRust = await readFile(resolve(root, NUMERIC_RUST_PATH), "utf8");
      const actualNumericTypeFixture = await readFile(
        resolve(root, NUMERIC_TYPE_FIXTURE_PATH),
        "utf8",
      );
      if (actualContract !== result.contractJson) fail("generated-contract-drift");
      if (actualDeclaration !== result.expectedDeclaration) {
        fail("generated-declaration-drift");
      }
      if (actualNumericTypeScript !== result.numericTypeScript) {
        fail("generated-numeric-typescript-drift");
      }
      if (actualNumericRust !== result.numericRust) {
        fail("generated-numeric-rust-drift");
      }
      if (actualNumericTypeFixture !== result.numericTypeFixture) {
        fail("generated-numeric-type-fixture-drift");
      }
    }
    process.stdout.write(
      `taffy contract generation ${process.argv.includes("--check") ? "clean" : "updated"}\n`,
    );
    return;
  }
  if (command === "check") {
    const result = await checkRepository({
      root,
      all: process.argv.includes("--all"),
    });
    process.stdout.write(
      `taffy contract check passed: ${result.collectedPrimaryIds.length} primary IDs currently registered\n`,
    );
    return;
  }
  if (command === "candidate") {
    await checkCandidate({ root });
    process.stdout.write("candidate commit and worktree passed\n");
    return;
  }
  if (command === "completion") {
    await checkCompletion({ root });
    process.stdout.write("completion evidence passed\n");
    return;
  }
  if (command === "review-completion") {
    await checkReviewCompletion({ root });
    process.stdout.write("review completion passed\n");
    return;
  }
  throw new Error(`Unknown tools/taffy-api command: ${command ?? "<missing>"}`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    if (error instanceof DiagnosticError) {
      process.stderr.write(`${error.diagnostic}: ${error.message}\n`);
    } else {
      process.stderr.write(`${error.stack ?? error}\n`);
    }
    process.exitCode = 1;
  });
}
