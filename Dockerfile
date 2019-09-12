FROM node:10.15.2

ADD . /app

WORKDIR /app/fe
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install -g -s --no-progress yarn
RUN yarn install
RUN yarn build

WORKDIR /app/be
RUN yarn install

WORKDIR /app

EXPOSE 4007 8097 8093

CMD chmod 777 *.sh && ./start-prod.sh