FROM node:24.0.1

# Install pnpm.
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . ./

EXPOSE 3000
CMD ["pnpm", "start"]
