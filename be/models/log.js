const User = require('./user');
const Log = require('./sequelize/Log');

exports.create = async (userId, message) => {
  const user = await User.get(userId);
  await Log.create({
    userId,
    message: `${user.name}：${message}`,
  })
}

exports.createAnonymity = async (identity, message) => {
  await Log.create({
    userId: 0,
    message: `${identity}：${message}`,
  })
}