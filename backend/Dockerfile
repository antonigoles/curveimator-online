FROM denoland/deno:2.1.4
EXPOSE 3000
WORKDIR /app
COPY deno.json .
ADD . /app
RUN deno install
CMD ["run", "--allow-all", "src/index.ts"]