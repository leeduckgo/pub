const Sequelize = require('sequelize');
const sequelize = require('./');

const User = sequelize.define('users', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  providerId: {
    type: Sequelize.BIGINT,
    unique: true
  },
  provider: {
    type: Sequelize.STRING
  },
}, {
  timestamps: true
});

User.sync();

module.exports = User;