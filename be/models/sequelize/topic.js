const Sequelize = require('sequelize');
const sequelize = require('./');

const Topic = sequelize.define('topics', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.BIGINT,
    unique: true
  },
  address: {
    type: Sequelize.STRING,
    unique: true
  },
  aesEncryptedHexOfPrivateKey: {
    type: Sequelize.TEXT
  },
  publicKey: {
    type: Sequelize.TEXT
  },
}, {
  timestamps: true,
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

Topic.sync();

module.exports = Topic;