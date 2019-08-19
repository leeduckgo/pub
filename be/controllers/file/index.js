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

const getFrontMatter = (user, file) => {
  return `---
author_name: ${user.name}
author_avatar: ${user.avatar}
title: ${file.title}
---\n`;
}

const appendFrontMatter = (user, file) => {
  if (file.content) {
    file.content = getFrontMatter(user, file) + file.content;
  }
  return file;
}

const createFile = async (user, data, options = {}) => {
  const derivedData = appendFrontMatter(user, data);
  const file = await File.create(user.id, derivedData);
  const block = await Chain.push(file, options);
  const rId = block.id;
  await File.update(file.id, {
    rId
  });
  file.rId = rId;
  return file;
}

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const file = await createFile(user, data);
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
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === user.id, Errors.ERR_NO_PERMISSION);
  const {
    status
  } = file;
  assert(status === File.FILE_STATUS.PUBLISHED, Errors.ERR_FILE_NOT_PUBLISHED)
  const newFilePayload = getNewFilePayload(file, data);
  const newFile = await createFile(user, newFilePayload, {
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