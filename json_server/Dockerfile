FROM node:10

COPY json_server/db.json /tmp/json_server/db.json
COPY json_server/index.js /tmp/json_server/index.js

RUN npm install -g json-server

EXPOSE 3000

CMD json-server --watch /tmp/json_server/index.js --port 3000 --host 0.0.0.0