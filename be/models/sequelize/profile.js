const Sequelize = require('sequelize');
const sequelize = require('./');

const Profile = sequelize.define('profiles', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.BIGINT,
    unique: true
  },
  provider: {
    type: Sequelize.STRING
  },
  providerId: {
    type: Sequelize.BIGINT,
    unique: true
  },
  name: {
    type: Sequelize.STRING
  },
  avatar: {
    type: Sequelize.STRING
  },
  bio: {
    type: Sequelize.STRING
  },
  raw: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

Profile.sync();

module.exports = Profile;