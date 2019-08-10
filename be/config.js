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

  github: {
    clientID: 'a269deced07c748a3526',
    clientSecret: '8cf2b9c75e540588be69ecbd498fee808abbeadd'
  }
};

module.exports = config;