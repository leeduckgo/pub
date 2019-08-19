const File = require('../../models/file');
const {
  assert,
  Errors
} = require('../../models/validator')
const Chain = require('./chain');

exports.list = async ctx => {
  const userId = ctx.verification.user.id;
  const result = await File.list(userId);
  ctx.body = result;
}

const createFile = async (userId, data, options = {}) => {
  const file = await File.create(userId, data);
  const block = await Chain.push(file, options);
  const rId = block.id;
  await File.update(file.id, {
    rId
  });
  file.rId = rId;
  return file;
}

exports.create = async ctx => {
  const userId = ctx.verification.user.id;
  const data = ctx.request.body.payload;
  const file = await createFile(userId, data);
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

const getNewFilePayload = (file, payload) => {
  return {
    userId: file.userId,
    title: file.title,
    content: file.content,
    mimeType: file.mimeType,
    description: file.description,
    userId: file.userId,
    ...payload
  }
}

exports.update = async ctx => {
  const userId = ctx.verification.user.id;
  const data = ctx.request.body.payload;
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === userId, Errors.ERR_NO_PERMISSION);
  console.log(` ------------- file ---------------`, file);
  const {
    status
  } = file;
  assert(status === File.FILE_STATUS.PUBLISHED, Errors.ERR_FILE_NOT_PUBLISHED)
  const newFilePayload = getNewFilePayload(file, data);
  console.log(` ------------- newFilePayload ---------------`, newFilePayload);
  const newFile = await createFile(userId, newFilePayload, {
    updatedFile: file
  });
  const deletedFile = await File.delete(file.id);
  ctx.body = {
    newFile,
    deletedFile
  };
}

exports.get = async ctx => {
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file, Errors.ERR_NOT_FOUND('file'));
  ctx.body = file;
}