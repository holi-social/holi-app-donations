FROM denoland/deno:alpine-1.25.1

# The port that your application listens to.
EXPOSE 8001

# Prefer not to run as root.
USER deno

COPY lock.json .
COPY deno.json .
COPY ./app ./app

RUN deno cache --lock=lock.json app/deps.ts
RUN deno cache app/main.ts

CMD ["deno", "run", "--allow-net", "--allow-env", "--lock=lock.json", "--cached-only", "app/main.ts"]
