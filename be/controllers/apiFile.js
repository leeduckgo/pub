const File = require("../models/file");
const {
  assert,
  throws,
  Errors
} = require("../models/validator");
const Log = require("../models/log");
const Chain = require("./chain");
// const SensitiveWordsDetector = require("../utils/sensitiveWordsDetector");

exports.list = async ctx => {
  const userId = ctx.verification.user.id;
  const result = await File.list(userId);
  ctx.body = result;
};

const getFrontMatter = (user, title) => {
  return `---
title: ${title}
author: ${user.name}
avatar: ${user.avatar}
published: ${new Date().toISOString()}
---\n`;
};

const tryAppendFrontMatter = (user, title, file) => {
  if (file.content) {
    file.content = getFrontMatter(user, title) + file.content;
    file.content = file.content.trim();
  }
  return file;
};

const createFile = async (user, data, options = {}) => {
  const {
    isDraft
  } = options;
  const shouldPushToChain = !isDraft;
  const derivedData = tryAppendFrontMatter(user, data.title, data);
  let file = await File.create(user.id, derivedData);
  if (shouldPushToChain) {
    const {
      updatedFile
    } = options;
    const block = await Chain.pushFile(file, {
      updatedFile
    });
    const rId = block.id;
    file = await File.update(file.id, {
      rId
    });
    Log.create(user.id, `发布内容区块 ${block.id}`);
  }
  Log.create(user.id, `创建文章 ${file.title} ，id ${file.id}`);
  return file;
};
exports.createFile = createFile;

exports.create = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  const isDraft = ctx.query.type === "DRAFT";
  assert(data, Errors.ERR_IS_REQUIRED("data"));
  console.log(` ------------- data.content ---------------`, data.content);
  // const hasInvalidWord = SensitiveWordsDetector.check(data.content);
  // if (hasInvalidWord) {
  //   throws({
  //     code: 400,
  //     message: `包含敏感词，请修改后重新发布`
  //   })
  // }
  const file = await createFile(user, data, {
    isDraft
  });
  ctx.body = file;
};

exports.remove = async ctx => {
  const userId = ctx.verification.user.id;
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === userId, Errors.ERR_NO_PERMISSION);
  const deletedFile = await File.delete(id);
  Log.create(file.userId, `删除文章 ${file.title}，id ${file.id}`);
  ctx.body = deletedFile;
};

exports.update = async ctx => {
  const {
    user
  } = ctx.verification;
  const data = ctx.request.body.payload;
  assert(data, Errors.ERR_IS_REQUIRED("data"));
  console.log(` ------------- data.content ---------------`, data.content);
  // const hasInvalidWord = SensitiveWordsDetector.check(data.content);
  // if (hasInvalidWord) {
  //   throws({
  //     code: 400,
  //     message: `包含敏感词，请修改后重新发布`
  //   })
  // }
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file.userId === user.id, Errors.ERR_NO_PERMISSION);
  const {
    rId
  } = file;
  const isDraft = !rId;
  if (isDraft) {
    const derivedData = tryAppendFrontMatter(
      user,
      data.title || file.title,
      data
    );
    let updatedFile = await File.update(file.id, derivedData);
    const shouldPushToChain = ctx.query.action === "PUBLISH";
    if (shouldPushToChain) {
      const block = await Chain.pushFile(updatedFile);
      const rId = block.id;
      await File.update(updatedFile.id, {
        rId
      });
      updatedFile = await File.get(updatedFile.id);
      Log.create(file.userId, `发布内容区块 ${block.id}`);
    }
    Log.create(
      file.userId,
      `更新文章 ${updatedFile.title}，id ${updatedFile.id}`
    );
    ctx.body = {
      updatedFile
    };
  } else {
    const {
      status
    } = file;
    assert(
      status === File.FILE_STATUS.PUBLISHED,
      Errors.ERR_FILE_NOT_PUBLISHED
    );
    const newFile = await createFile(user, data, {
      updatedFile: file
    });
    await File.delete(file.id);
    Log.create(
      file.userId,
      `更新文章 ${updatedFile.title}，id ${updatedFile.id}`
    );
    ctx.body = {
      newFile,
      updatedFile: file
    };
  }
};

exports.get = async ctx => {
  const id = ~~ctx.params.id;
  const file = await File.get(id);
  assert(file, Errors.ERR_NOT_FOUND("file"));
  ctx.body = file;
};