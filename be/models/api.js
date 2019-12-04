const httpStatus = require('http-status');
const config = require('../config');
const Token = require('./token');
const {
  assert,
  Errors,
  throws,
} = require('../models/validator');
const User = require('../models/user');
const Topic = require('../models/topic');
const { log } = require('../utils');

exports.ensureAuthorization = (options = {}) => {
  const {
    strict = true
  } = options;
  return async (ctx, next) => {
    const token = ctx.cookies.get(config.authTokenKey);
    if (!token && !strict) {
      await next();
      return;
    }
    assert(token, Errors.ERR_IS_REQUIRED('token'), 401);
    let decodedToken;
    try {
      const isExistInRedis = await Token.checkFromRedis(token);
      assert(isExistInRedis, Errors.ERR_AUTH_TOKEN_EXPIRED, 401);
      ctx.verification = {};
      decodedToken = Token.verify(token);
      ctx.verification.token = token;
      ctx.verification.decodedToken = decodedToken;
    } catch (err) {
      if (!strict) {
        await next();
        return;
      }
      throws(Errors.ERR_AUTH_TOKEN_EXPIRED, 401);
    }
    const {
      data: {
        userId
      }
    } = decodedToken;
    const user = await User.get(userId, {
      withProfile: true
    });
    ctx.verification.user = user;
    assert(user, Errors.ERR_NOT_FOUND('user'));
    await next();
  }
}

exports.ensureTopicOnwer = () => {
  return async (ctx, next) => {
    let isTopicOwner = false

    const topic = await Topic.getByAddress(config.settings.topicAddress)

    if (topic && topic.userId === ctx.verification.user.id) {
      isTopicOwner = true
    }

    assert(isTopicOwner, Errors.ERR_NO_PERMISSION, 401);
    await next()
  }
}

exports.errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    log(err);
    if (
      err.status &&
      err.status >= httpStatus.BAD_REQUEST &&
      err.status < httpStatus.INTERNAL_SERVER_ERROR
    ) {
      ctx.throws(err);
      return;
    }
    throw err;
  }
};

exports.extendCtx = async (ctx, next) => {
  ctx.ok = data => {
    ctx.body = data;
  };
  ctx.er = (error, code) => {
    ctx.status = code || 400;
    ctx.body = error;
  };
  ctx.throws = (err) => {
    const code = err.code || Errors.ERR_INVALID_FORMAT;
    if (code === 'ERR_NOT_FOUND') {
      ctx.status = httpStatus.NOT_FOUND;
    } else if (code === 'ERR_TOO_MANY_REQUEST') {
      ctx.status = httpStatus.TOO_MANY_REQUESTS;
    } else {
      ctx.status = err.status || httpStatus.BAD_REQUEST;
    }
    ctx.body = {
      code,
      message: err.message || Errors[`${code}_MSG`]
    };
  };
  ctx.attemptRoles = (roles = []) => {
    if (!roles.includes(ctx.verification.user.accountType)) {
      ctx.throws({
        status: httpStatus.FORBIDDEN,
        code: Errors.ERR_NO_PERMISSION
      });
    }
    return ctx.verification.user.accountType;
  };
  await next();
};
