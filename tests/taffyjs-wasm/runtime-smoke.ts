import { TaffyTree } from "@taffyjs/wasm";

import { runRuntimeSmoke } from "../runtime-smoke.ts";

runRuntimeSmoke("@taffyjs/wasm", new TaffyTree());
