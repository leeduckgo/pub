const Permission = require('./sequelize/permission');

const { assert, Errors } = require('../models/validator');
const User = require('../models/user');

/**
 * @param {object} option
 * @param {string} option.topicAddress
 * @param {number} option.offset
 * @param {number} option.limit
 * @param {'allow' | 'deny'} option.type
 */
exports.getPermissionList = async (option) => {
  const { topicAddress, type, offset, limit } = option
  assert(topicAddress, Errors.ERR_IS_REQUIRED('topicAddress'));
  assert(type, Errors.ERR_IS_REQUIRED('type'));

  const { count, rows } = await Permission.findAndCountAll({
    where: {
      topicAddress,
      permission: type,
    },
    offset,
    limit,
  });

  return { count, rows }
};

/**
 * @param {object} option
 * @param {number} option.userId
 * @param {string} option.topicAddress
 * @param {'allow' | 'deny'} option.type
 */
exports.setPermission = async (option) => {
  const { userId, topicAddress, type } = option
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  assert(topicAddress, Errors.ERR_IS_REQUIRED('topicAddress'));
  assert(type, Errors.ERR_IS_REQUIRED('type'));

  const user = await User.get(userId)
  assert(user, Errors.ERR_IS_REQUIRED('userId'));

  const [permissionItem] = await Permission.findOrCreate({
    where: {
      userId,
      topicAddress,
    },
    defaults: {
      userId,
      topicAddress,
      permission: type,
    },
  });

  if (permissionItem.permission === type) {
    return { updated: false }
  }

  await Permission.update(
    { permission: type },
    {
      where: { id: permissionItem.id },
    },
  )

  return { updated: true }
};
