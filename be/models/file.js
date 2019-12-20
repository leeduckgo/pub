const {
  assert,
  Errors
} = require('./validator');
const prsUtil = require('prs-utility');
const File = require('./sequelize/file');
const Block = require('./block');
const config = require('../config');
const ase256cbcCrypto = require('../utils/ase256cbcCrypto');

const FILE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PENDING: 'pending'
}

exports.FILE_STATUS = FILE_STATUS;

const removeFrontMatter = (content = '') => {
  return content = content.replace(/^---(.|\n)*?---\n/, '');
}

const packFile = async (file, options = {}) => {
  assert(file, Errors.ERR_NOT_FOUND('file'));
  const fileJson = file.toJSON();
  const {
    rId
  } = fileJson;
  const isDraft = !rId;
  if (isDraft) {
    fileJson.status = FILE_STATUS.DRAFT;
  } else {
    const block = await Block.get(rId);
    const status = getStatusByBlock(block);
    fileJson.status = status;
    fileJson.block = block;
  }
  fileJson.content = fileJson.content.toString('utf8');
  const {
    withRawContent
  } = options;
  if (!withRawContent) {
    fileJson.content = removeFrontMatter(fileJson.content);
  }
  delete fileJson.deleted;
  return fileJson;
}

const verifyData = (data, options = {}) => {
  assert(data, Errors.ERR_IS_REQUIRED('data'));

  const {
    isUpdating
  } = options;
  const requiredKeys = [
    'title',
    'content',
    'mimeType'
  ];
  const editableKeys = [
    'rId',
    'title',
    'content',
    'mimeType',
    'description',
    'deleted'
  ];

  if (!isUpdating) {
    for (const key of requiredKeys) {
      let value = data[key];
      switch (key) {
        case 'title':
          assert(value, Errors.ERR_IS_REQUIRED('title'));
          break;
        case 'content':
          assert(value, Errors.ERR_IS_REQUIRED('content'));
          break;
        case 'mimeType':
          assert(value, Errors.ERR_IS_REQUIRED('mimeType'));
          break;
      }
    }
  }

  for (const key in data) {
    assert(editableKeys.includes(key), `${key} is invalid`);
  }
};

exports.create = async (userId, data) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  verifyData(data);
  const msghash = prsUtil.keccak256(data.content);
  const maybeExistedFile = await exports.getByMsghash(msghash);
  assert(!maybeExistedFile, Errors.ERR_IS_DUPLICATED('msghash'), 409);
  const encryptedContent = JSON.stringify(ase256cbcCrypto.encrypt(data.content));
  data.content = Buffer.from(data.content, 'utf8');
  const payload = {
    ...data,
    userId,
    msghash,
    topicAddress: config.settings['site.topicAddress'],
    encryptedContent
  };
  const file = await File.create(payload);
  const derivedFile = await packFile(file);
  return derivedFile;
};

exports.list = async (userId) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  const files = await File.findAll({
    where: {
      userId,
      deleted: false,
      topicAddress: config.settings['site.topicAddress']
    }
  });
  const list = await Promise.all(
    files.map((file) => {
      return packFile(file);
    })
  )
  return list;
};

const getStatusByBlock = block => {
  const {
    blockNum,
    blockTransactionId
  } = block;
  if (blockNum && blockTransactionId) {
    return FILE_STATUS.PUBLISHED;
  }
  return FILE_STATUS.PENDING;
}

exports.get = async (id, options = {}) => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  const file = await File.findOne({
    where: {
      id,
      deleted: false
    }
  });
  assert(file, Errors.ERR_NOT_FOUND('file'));
  const {
    withRawContent
  } = options;
  const derivedFile = await packFile(file, {
    withRawContent
  });
  return derivedFile;
};

exports.update = async (id, data) => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  verifyData(data, {
    isUpdating: true
  });
  const payload = data;
  if (data.content) {
    const msghash = prsUtil.keccak256(data.content);
    const maybeExistedFile = await exports.getByMsghash(msghash);
    assert(!maybeExistedFile, Errors.ERR_IS_DUPLICATED('msghash'), 409);
    const encryptedContent = JSON.stringify(ase256cbcCrypto.encrypt(data.content));
    payload.encryptedContent = encryptedContent;
    data.content = Buffer.from(data.content, 'utf8');
    payload.msghash = msghash;
  }

  await File.update(payload, {
    where: {
      id,
      deleted: false
    }
  });
  const derivedFile = await exports.get(id);
  return derivedFile;
};

exports.delete = async id => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  await File.update({
    deleted: true
  }, {
    where: {
      id
    }
  });
  return true;
};

exports.getByMsghash = async (msghash, options = {}) => {
  assert(msghash, Errors.ERR_IS_REQUIRED('msghash'));
  const file = await File.findOne({
    where: {
      msghash,
      deleted: false
    }
  });
  if (!file) {
    return null
  }
  const {
    withRawContent
  } = options;
  const derivedFile = await packFile(file, {
    withRawContent
  });
  return derivedFile;
};

exports.getByRId = async (rId) => {
  assert(rId, Errors.ERR_IS_REQUIRED('rId'));
  const file = await File.findOne({
    where: {
      rId,
      deleted: false
    }
  });
  if (!file) {
    return null
  }
  const derivedFile = await packFile(file);
  return derivedFile;
};