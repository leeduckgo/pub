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

const getFrontMatter = (user, title) => {
  return `---
title: ${title}
author: ${user.name}
avatar: ${user.avatar}
---\n`;
}

const appendFrontMatter = (user, title, file) => {
  if (file.content) {
    file.content = getFrontMatter(user, title) + file.content;
  }
  return file;
}

const createFile = async (user, data, options = {}) => {
  const {
    isDraft
  } = options;
  const shouldPushToChain = !isDraft;
  assert(data.title, Errors.ERR_IS_REQUIRED('title'));
  const derivedData = appendFrontMatter(user, data.title, data);
  const file = await File.create(user.id, derivedData);
  if (shouldPushToChain) {
    const block = await Chain.push(file, options);
    const rId = block.id;
    await File.update(file.id, {
      rId
    });
    file.rId = rId;
  }
  return file;
}

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const isDraft = ctx.query.type === 'DRAFT';
  const file = await createFile(user, data, {
    isDraft
  });
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
    title: file.title,
    content: file.content,
    mimeType: file.mimeType,
    description: file.description,
    ...payload
  };
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
    rId
  } = file;
  const isDraft = !rId;
  if (isDraft) {
    const derivedData = appendFrontMatter(user, file.title, data);
    let updatedFile = await File.update(file.id, derivedData);
    const shouldPushToChain = ctx.query.action === 'PUBLISH';
    if (shouldPushToChain) {
      const block = await Chain.push(updatedFile);
      const rId = block.id;
      await File.update(updatedFile.id, {
        rId
      });
      updatedFile = await File.get(updatedFile.id);
    }
    ctx.body = {
      updatedFile
    };
  } else {
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
}

exports.get = async ctx => {
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file, Errors.ERR_NOT_FOUND('file'));
  ctx.body = file;
}