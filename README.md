# Holi App Donations

## Getting started

### Deno

Install [`deno`](https://github.com/denoland/deno_install)

## Code style

Linting: `deno lint`

Formatting: `deno fmt`

Configuration can be added in `deno.json`
https://deno.land/manual/typescript/configuration
https://deno.land/manual/tools/linter https://deno.land/manual/tools/formatter

More tooling see https://deno.land/manual/tools

## Dependencies

Add all dependencies to `app/deps.ts` (similiar as you would do in a Node.js
`package.json`). After adding a dependency run `deno task updateDeps` to update
the `lock.json` file (similiar to Node.js `package.lock` including hashes).

To just install and cache dependencies locally, run `deno task install`.

## Execute locally

Optional: Run `deno task cache` to cache the main application for quicker
execution.

Run `deno task start` to execute the application locally.

Afterwards you can access the graphql UI here:

http://localhost:8001/graphql

## Execute locally using docker

```sh
deno task docker
```

## VS Code extension

https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno

run `Deno: Initialize Workspace Configuration` command (or enable manually)

## TOODs

TODO: testing https://deno.land/manual/testing

TODO: fix version? version manager necessary? e.g
https://github.com/justjavac/dvm

TODO: sentry

TODO: e2e tests?

TODO: mention noenv for ci

TODO: build binary and copy to docker container?
https://deno.land/manual/tools/compiler deno compile --allow-net
--lock=lock.json --cached-only --output=donations-api app/main.ts

TODO: use other lib for http? std/http, tinyhttp or Opine
https://deno.land/x/gql@1.1.2

TODO: use oak for server? https://deno.land/x/oak/mod.ts

TODO: use velociraptor for scripts?
https://deno.land/x/velociraptor@1.0.0-beta.16

TODO: logging https://deno.land/x/deno_util/logger.ts
