const File = require('../models/file');
const {
  assert,
  Errors
} = require('../models/validator')

exports.list = async ctx => {
  const userId = ctx.verification.user.id;
  const result = await File.list(userId);
  ctx.body = result;
}

exports.create = async ctx => {
  const userId = ctx.verification.user.id;
  const data = ctx.request.body.payload;
  const file = await File.create(userId, data);
  ctx.body = file;
}

exports.remove = async ctx => {
  const userId = ctx.verification.user.id;
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === userId, Errors.ERR_NO_PERMISSION);
  const deletedFile = await File.delete(id);
  ctx.body = deletedFile;
}

exports.update = async ctx => {
  const userId = ctx.verification.user.id;
  const data = ctx.request.body.payload;
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === userId, Errors.ERR_NO_PERMISSION);
  const isSuccess = await File.update(id, data);
  ctx.body = isSuccess;
}

exports.get = async ctx => {
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file, Errors.ERR_NOT_FOUND('file'));
  ctx.body = file;
}