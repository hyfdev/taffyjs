<template>
  <div class="home-content">
    <section id="model" class="home-section home-section--workflow" aria-labelledby="model-title">
      <p class="home-eyebrow">The model</p>
      <h2 id="model-title">Build a tree. Compute layout. Read the result.</h2>
      <p class="home-lead">
        TaffyJS keeps layout explicit. Create nodes, run layout once from a root, then read detached
        JavaScript objects.
      </p>

      <ol class="workflow">
        <li>
          <span class="workflow__number">01</span>
          <h3>Build the tree</h3>
          <p>Describe each node with typed style values and connect its children explicitly.</p>
        </li>
        <li>
          <span class="workflow__number">02</span>
          <h3>Compute layout</h3>
          <p>Choose a root and available space. Taffy runs Block, Flexbox, or Grid in Rust.</p>
        </li>
        <li>
          <span class="workflow__number">03</span>
          <h3>Read the result</h3>
          <p>Read sizes, positions, and spacing as ordinary JavaScript objects.</p>
        </li>
      </ol>
    </section>

    <section class="home-section home-section--split" aria-labelledby="engine-title">
      <div>
        <p class="home-eyebrow">The engine</p>
        <h2 id="engine-title">A mature layout engine, written in Rust.</h2>
      </div>
      <div class="home-copy">
        <p>
          Taffy implements CSS Block, Flexbox, and Grid layout. It is used by projects including
          Servo, Bevy, Slint, and Zed.
        </p>
        <p>
          TaffyJS brings that engine to JavaScript instead of rebuilding layout behavior in
          JavaScript.
        </p>
        <a class="home-link" href="https://github.com/DioxusLabs/taffy">Explore Taffy</a>
      </div>
    </section>

    <section class="home-section" aria-labelledby="binding-title">
      <p class="home-eyebrow">The binding</p>
      <h2 id="binding-title">A JavaScript API without a JavaScript layout engine.</h2>
      <p class="home-lead">
        Inputs stay readable and typed. Layout state, caching, and computation stay in native Taffy.
        Results return as detached JavaScript snapshots.
      </p>

      <ol class="binding-path" aria-label="How data moves through TaffyJS">
        <li>
          <span>Input</span>
          <strong>Typed JS values</strong>
        </li>
        <li>
          <span>Boundary</span>
          <strong>Native binding</strong>
        </li>
        <li>
          <span>Layout</span>
          <strong>Rust / Taffy</strong>
        </li>
        <li>
          <span>Output</span>
          <strong>JS snapshots</strong>
        </li>
      </ol>
    </section>

    <section id="node" class="home-section home-section--split" aria-labelledby="node-title">
      <div>
        <p class="home-eyebrow">Current package</p>
        <h2 id="node-title"><code>@taffyjs/node</code></h2>
      </div>
      <div class="home-copy">
        <p>
          The first TaffyJS package is an ESM-only Node-API binding. The repository currently
          targets Node.js 22.18 or newer and is not yet published to npm.
        </p>
        <dl class="support-list">
          <div>
            <dt>Runtime</dt>
            <dd>Node.js 22.18+</dd>
          </div>
          <div>
            <dt>Modules</dt>
            <dd>ESM</dd>
          </div>
          <div>
            <dt>Targets</dt>
            <dd>Linux x64 GNU, Windows x64 MSVC</dd>
          </div>
        </dl>
        <a
          class="home-link"
          href="https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node"
        >
          Read the package documentation
        </a>
      </div>
    </section>
  </div>
</template>
