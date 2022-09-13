# Holi App Donations

The backend for handling donation projects, including a GraphQL API for
[betterplace](https://www.betterplace.org).

<!-- TOC -->

- [Holi App Donations](#holi-app-donations)
  - [Getting started](#getting-started)
    - [Setup](#setup)
    - [Code style](#code-style)
    - [Dependencies](#dependencies)
    - [Compiling (optional)](#compiling-optional)
    - [Testing](#testing)
    - [Tasks](#tasks)
    - [VS Code extension](#vs-code-extension)
  - [Local execution](#local-execution)
  - [Continuous Integration and Deployment](#continuous-integration-and-deployment)
    - [Skipping parts of CI](#skipping-parts-of-ci)
      - [noenv Branches](#noenv-branches)
  - [TODOs](#todos)

<!-- /TOC -->

## Getting started

### Setup

Install [`deno`](https://github.com/denoland/deno_install) in version 1.25.1.

### Code style

Linting:

```sh
deno lint
```

Formatting:

```sh
deno fmt
```

Configuration for
[typescript](https://deno.land/manual/typescript/configuration),
[linter](https://deno.land/manual/tools/linter) or
[formatter](https://deno.land/manual/tools/formatter) can be added in
`deno.json`.

See the [deno manual](https://deno.land/manual/tools) for more tools.

### Dependencies

All dependencies should be added in `app/deps.ts` (similiar as you would do in a
Node.js `package.json`) for caching and integrity checks. After adding a
dependency run

```sh
deno task updateDeps
```

to update the `lock.json` file (similiar to Node.js `package.lock` including
hashes).

To just install and cache dependencies locally or force a reload of
dependencies, run

```sh
deno task install
```

### Compiling (optional)

Deno will compile all TypeScript code to JavaScript and cache the resulting
files. This will happen automatically when you run the code, but you can also
trigger this manually by running

```sh
deno task cache
```

### Testing

Tests can be executed with

```sh
deno test
```

(Test filenames should end on a `_test` prefix).

To get information about test coverage use

```sh
deno task coverage
```

For more information, e.g. on how to create different coverage formats, see the
[documentation](https://deno.land/manual/testing/coverage)

### Tasks

Currently we are using `deno task` for execution of scripts that are defined in
`deno.json` (similiar to scripts defined in Node.js `package.json`). Beware that
this is declared "unstable and may drastically change in the future" (see
[documentation](https://deno.land/manual/tools/task_runner)).

TODO: use [Velocirator](https://velociraptor.run/) instead?

### VS Code extension

There is an official VS Code extension for Deno:
[vscode-deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

It should already be enabled for the workspace, for more information check the
[documentation](https://deno.land/manual/vscode_deno).

## Local execution

To watch for file changes during development, run

```sh
deno task dev
```

To execute the application without watching for file changes run

```sh
deno task start
```

or run

```sh
deno task docker
```

to execute the application in a local docker container.

Afterwards you can access the graphql playground here:

`http://localhost:8001/graphql`

## Continuous Integration and Deployment

### Skipping parts of CI

Sometimes, changes don't need to be verified by the full pipeline, e.g. changes
in linting or documentation.

#### noenv Branches

When you prefix your branch name with `noenv/` (e.g. `noenv/my-readme-update`)
the pipeline only lints & builds, but does not publish, deploy or run e2e test.
This saves quite some time. Obviously, many things go untested so only use this
if "you know what you're doing".

## TODOs

TODO: add commit hooks for fmt + lint > vr (velociraptor) seems to be the
easiest solution <https://velociraptor.run/docs/git-hooks/> 2nd place
<https://github.com/nozaq/pre-commit-deno>
