FROM node:24.12.0

COPY package*.json ./

RUN npm ci
RUN npx -y playwright@1.57.0 install --with-deps --only-shell chromium

COPY . .

CMD ["npx", "playwright", "test"]