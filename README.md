# Holi Donations

TODO(SF): rename repo to donations-api
or app prefix?

## Getting started

### Deno

Install [`deno`](https://github.com/denoland/deno_install)

## Code style

`deno lint`

`deno fmt`

`deno cache deps.ts`

More tooling see https://deno.land/manual/tools

TODO(SF):: mention deno tasks if kept

## Execute locally

deno run --allow-net app/main.ts

Access graphql UI

http://localhost:8001/graphql

$ docker build -t donations-api . && docker run -it --init -p 8001:8001 donations-api

## VS Code extension

https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno

run `Deno: Initialize Workspace Configuration` command (or enable manually)

## TOODs

TODO: testing

TODO: fix version? version manager necessary? e.g
https://github.com/justjavac/dvm

TODO: cache deps more permanently?

TODO: terraform

TODO: mesh der graphql apis > prefix?

TODO: sentry

TODO: authorization (unified-api > .meshrc.yml)

TODO: e2e tests?
TODO: mention noenv for ci