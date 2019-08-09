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
};

module.exports = config;