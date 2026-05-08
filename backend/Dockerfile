FROM node:22-alpine

Workdir /app

# Creating group 'appgroup' and user 'appuser' and adding user to group
RUN addgroup appgroup && adduser -S -G appgroup appuser

# Changing permission for the current workdir
RUN chown -R appuser:appgroup .

USER appuser

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]