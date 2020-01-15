exports.get = async ctx => {
  const user = ctx.verification.user;

  ctx.body = {
    ...user,
  };
};