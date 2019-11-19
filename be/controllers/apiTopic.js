const Topic = require('../models/topic');
const Log = require('../models/log');
const {
  assert,
  Errors,
} = require('../models/validator');
const User = require('../models/user');
const Permission = require('../models/permission');
const Chain = require('./chain');
const config = require('../config');
const UserModel = require('../models/sequelize/user');
const PermissionModel = require('../models/sequelize/permission');

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const topic = await Topic.create({
    userId: user.id,
    ...data
  });
  Log.create(user.id, `创建 Topic，id ${topic.id}`);
  ctx.body = topic;
}

/**
 * @param {'allow' | 'deny'} type
 */
const getPermissionList = async (ctx, type) => {
  let {
    offset = 0, limit = 10
  } = ctx.query

  offset = Number(offset)
  limit = Number(limit)

  assert(
    !Number.isNaN(offset) && offset >= 0,
    Errors.ERR_IS_INVALID('offset'),
  )
  assert(
    !Number.isNaN(limit) && limit >= 1 && limit <= 100,
    Errors.ERR_IS_INVALID('limit'),
  )

  const {
    count,
    rows
  } = await Permission.getPermissionList({
    topicAddress: config.settings.topicAddress,
    type,
    offset,
    limit,
  })

  const list = await Promise.all(rows.map(async (permissionItem) => {
    const user = await User.get(permissionItem.userId, {
      withProfile: true
    })
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    }
  }))

  ctx.body = {
    count,
    users: list,
  }
}

/**
 * @param {'allow' | 'deny'} type
 */
const changePermission = async (ctx, type) => {
  const userId = ctx.params.userid
  assert(userId, Errors.ERR_IS_REQUIRED('userid'))

  const user = await User.get(userId)
  assert(user, Errors.ERR_IS_REQUIRED('userId'));

  const {
    updated
  } = await Permission.setPermission({
    userId,
    topicAddress: config.settings.topicAddress,
    type,
  })

  ctx.body = {
    success: true,
  };

  const isProduction = config.env === 'production';
  if (updated && isProduction) {
    const block = await Chain.pushTopic({
      userAddress: user.address,
      topicAddress: config.settings.topicAddress,
      type,
    })
    Log.create(userId, `提交 ${type} 区块, blockId ${block.id}`);
  }
}

exports.getAllowPermissionList = ctx => getPermissionList(ctx, 'allow')
exports.getDenyPermissionList = ctx => getPermissionList(ctx, 'deny')
exports.allow = ctx => changePermission(ctx, 'allow')
exports.deny = ctx => changePermission(ctx, 'deny')

exports.updatescript = async (ctx) => {
  try {
    const userlist = await UserModel.findAll()
    await Promise.all(userlist.map(async (userItem) => {
      await PermissionModel.findOrCreate({
        where: {
          topicAddress: config.settings.topicAddress,
          userId: userItem.id,
        },
        defaults: {
          userId: userItem.id,
          topicAddress: config.settings.topicAddress,
          permission: 'allow',
        },
      })
    }))
  } catch (e) {
    ctx.body = e.stack
    return
  }
  ctx.body = 'success'
}