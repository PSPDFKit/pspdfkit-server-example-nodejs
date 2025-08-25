FROM node:24.0.1

# Install pnpm.
ARG PNPM_VERSION
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=${PNPM_VERSION} SHELL=bash sh - && \
  ln -s /root/.local/share/pnpm/pnpm /usr/local/bin/pnpm


WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . ./

EXPOSE 3000
CMD ["pnpm", "start"]
