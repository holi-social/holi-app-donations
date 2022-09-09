FROM denoland/deno:alpine-1.25.1

# The port that your application listens to.
EXPOSE 8001

# Prefer not to run as root.
USER deno

COPY lock.json .
COPY deno.json .
COPY ./app ./app

RUN deno task install
RUN deno task cache

CMD ["deno", "task", "start"]
