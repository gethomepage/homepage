ARG VARIANT="16-buster"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

RUN npm install -g pnpm

RUN apt-get update \
   && apt-get -y install --no-install-recommends \
        python3-pip \
        && apt-get clean -y \
        && rm -rf /var/lib/apt/lists/*

ENV PATH="${PATH}:./node_modules/.bin"
