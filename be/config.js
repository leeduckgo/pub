'use strict';

const config = {
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    database: 'pub',
    user: 'root',
    password: '632330abc',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    timezone: 'utc',
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
    connectTimeout: 1000 * 3,
  },

  github: {
    clientID: 'a269deced07c748a3526',
    clientSecret: '8cf2b9c75e540588be69ecbd498fee808abbeadd'
  },

  tokenPrivateKey: 'kCtfo6go2PQYgXUAYJIqdLkKIxD8C7EwYAFC58kezgQsCzbu+NchwZx+tS/+rQGMFw+kzZHQkkcCz1reSdUgcg=='
};

module.exports = config;