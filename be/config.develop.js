'use strict';

const config = {
  domain: 'http://127.0.0.1:8097',

  host: '127.0.0.1',

  port: '8097',

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
    clientSecret: '8cf2b9c75e540588be69ecbd498fee808abbeadd',
    oauthCallback: 'http://localhost:4201/dashboard'
  },

  tokenPrivateKey: 'kCtfo6go2PQYgXUAYJIqdLkKIxD8C7EwYAFC58kezgQsCzbu+NchwZx+tS/+rQGMFw+kzZHQkkcCz1reSdUgcg==',

  authTokenKey: 'pub_token',

  aesKey256: [
    11, 19, 1, 2, 30, 5, 0, 13, 8, 6, 27, 3, 21, 26, 7,
    25, 9, 20, 31, 17, 22, 14, 24, 23, 29, 15, 4, 16, 18,
    28, 12, 10,
  ],

  testPort: 8092,

  queuePort: 8093,

  prsEndpoint: 'http://127.0.0.1:8090',
};

module.exports = config;