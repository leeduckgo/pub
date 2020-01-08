const Sequelize = require('sequelize');
const sequelize = require('./');

const Permission = sequelize.define('permissions', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.BIGINT,
  },
  topicAddress: {
    type: Sequelize.STRING,
  },
  permission: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: true,
  charset: 'utf8mb4',
  indexes: [{
    fields: ['userId']
  }, {
    fields: ['topicAddress']
  }, {
    fields: ['permission']
  }]
});

Permission.sync();

module.exports = Permission;