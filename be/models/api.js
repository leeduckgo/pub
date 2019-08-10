const httpStatus = require('http-status');

exports.errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
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