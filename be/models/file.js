const {
  assert,
  Errors
} = require('./validator');
const prsUtil = require('prs-utility');
const File = require('./sequelize/file');
const Block = require('./block');

const FILE_STATUS = {
  PUBLISHED: 'published',
  PENDING: 'pending'
}

exports.FILE_STATUS = FILE_STATUS;

const removeFrontMatter = (content = '') => {
  return content = content.replace(/^---(.|\n)*?---\n/, '');
}

const packFile = file => {
  delete file.deleted;
  file.content = removeFrontMatter(file.content);
  return file;
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
  const payload = {
    ...data,
    userId,
    msghash
  };
  const file = await File.create(payload);
  return packFile(file.toJSON());
};

exports.list = async (userId) => {
  assert(userId, Errors.ERR_IS_REQUIRED('userId'));
  const files = await File.findAll({
    where: {
      userId,
      deleted: false
    }
  });
  return files.map((file) => packFile(file.toJSON()))
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

exports.get = async id => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  const file = await File.findOne({
    where: {
      id,
      deleted: false
    }
  });
  assert(file, Errors.ERR_NOT_FOUND('file'));
  const {
    rId
  } = file;
  assert(rId, Errors.ERR_IS_REQUIRED('rId'));
  const block = await Block.get(rId);
  const status = getStatusByBlock(block);
  return file ? packFile({
    ...file.toJSON(),
    status
  }) : null;
};

exports.update = async (id, data) => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  verifyData(data, {
    isUpdating: true
  });
  await File.update(data, {
    where: {
      id,
      deleted: false
    }
  });
  return true;
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

exports.getByMsghash = async msghash => {
  assert(msghash, Errors.ERR_IS_REQUIRED('msghash'));
  const file = await File.findOne({
    where: {
      msghash,
      deleted: false
    }
  });
  return file ? packFile(file.toJSON()) : null;
};