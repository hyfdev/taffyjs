interface RuntimeSmokeTree<TNode> {
  newLeaf(style: { size: { width: number; height: number } }): TNode;
  computeLayout(options: { root: TNode; availableSpace: { width: number; height: number } }): void;
  getLayout(node: TNode): { size: { width: number; height: number } };
}

interface YogaRuntimeSmokeNode {
  setWidth(width: number): void;
  setHeight(height: number): void;
  calculateLayout(width: number | undefined, height: number | undefined): void;
  getComputedLayout(): { width: number; height: number };
  free(): void;
}

interface YogaRuntimeSmokeFacade {
  Node: { create(): YogaRuntimeSmokeNode };
}

function runtimeLabel(): string {
  const bun = Reflect.get(globalThis, "Bun");
  if (typeof bun?.version === "string") return `Bun ${bun.version}`;

  const deno = Reflect.get(globalThis, "Deno");
  if (typeof deno?.version?.deno === "string") return `Deno ${deno.version.deno}`;

  return "unknown runtime";
}

export function runRuntimeSmoke<TNode>(packageName: string, tree: RuntimeSmokeTree<TNode>): void {
  const root = tree.newLeaf({ size: { width: 120, height: 80 } });
  tree.computeLayout({ root, availableSpace: { width: 800, height: 600 } });

  const { width, height } = tree.getLayout(root).size;
  if (width !== 120 || height !== 80) {
    throw new Error(`${packageName} produced an unexpected layout: ${width}x${height}`);
  }

  console.log(`${packageName} smoke passed on ${runtimeLabel()}`);
}

export function runYogaRuntimeSmoke(packageName: string, yoga: YogaRuntimeSmokeFacade): void {
  const node = yoga.Node.create();

  try {
    node.setWidth(120);
    node.setHeight(80);
    node.calculateLayout(undefined, undefined);

    const { width, height } = node.getComputedLayout();
    if (width !== 120 || height !== 80) {
      throw new Error(`${packageName} produced an unexpected layout: ${width}x${height}`);
    }

    console.log(`${packageName} smoke passed on ${runtimeLabel()}`);
  } finally {
    node.free();
  }
}
