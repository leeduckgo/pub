const Sequelize = require('sequelize');
const sequelize = require('./');

const File = sequelize.define('files', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.BIGINT,
  },
  rId: {
    type: Sequelize.STRING,
    unique: true
  },
  title: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.TEXT
  },
  msghash: {
    type: Sequelize.STRING,
    unique: true
  },
  mimeType: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

File.sync();

module.exports = File;