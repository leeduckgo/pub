FROM node:10.15.2

ADD . /app
RUN mv /app/fe/build /app/be/build

WORKDIR /app/be
RUN ls
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install -g -s --no-progress yarn
RUN yarn install

WORKDIR /app

EXPOSE 4060 8060

CMD chmod 777 *.sh && ./start-prod.sh
