import { TaffyTree } from "@taffyjs/node";

type Context = { readonly label: string };

const explicit = new TaffyTree<Context>();
const preserved: TaffyTree<Context> = explicit;
const defaulted: TaffyTree<unknown> = new TaffyTree();

// @ts-expect-error The public constructor takes no arguments.
const withOptions = new TaffyTree({});
// @ts-expect-error TaffyTree has one context type parameter.
const tooMany: TaffyTree<Context, Context> = explicit;

void [preserved, defaulted, withOptions, tooMany];
