FROM dockerhub.qingcloud.com/pressone/node:10

ADD . /app
RUN rm -rf /app/be/build
RUN mv /app/fe/build /app/be/build

WORKDIR /app/be
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install

WORKDIR /app

EXPOSE 8000