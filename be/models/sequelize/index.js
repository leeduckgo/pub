const config = require('../../config');
const {
  Sequelize
} = require('sequelize');

const db = config.db;

const sequelize = new Sequelize(db.database, db.user, db.password, {
  host: db.host,
  dialect: db.dialect,
  port: db.port,
  logging: config.sequelizeLogging
});

sequelize.sync().then(() => {
  console.log('DB connected successfully.');
}, () => {
  process.exit(0);
});

module.exports = sequelize;