const request = require('request-promise');
const User = require('./user');
const Log = require('./sequelize/log');
const config = require('../config');

exports.create = async (userId, message) => {
  const user = await User.get(userId);
  const data = {
    userId,
    message: `${user.name}：${message}`,
  };
  await Log.create(data);
  if (config.botEnabled) {
    sendToBot(data);
  }
}

exports.createAnonymity = async (identity, message) => {
  const data = {
    userId: 0,
    message: `${identity}：${message}`,
  };
  await Log.create(data);
  if (config.botEnabled) {
    sendToBot(data);
  }
}

const sendToBot = async data => {
  request({
    uri: config.botUrl,
    method: 'post',
    json: true,
    body: {
      payload: data
    }
  });
};