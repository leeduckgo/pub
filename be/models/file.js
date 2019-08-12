const {
  assert
} = require('./validator');
const Errors = require('./validator/errors');
const File = require('../models/sequelize/file');
const prsUtil = require('prs-utility');

const packFile = file => {
  delete file.deleted;
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

exports.get = async id => {
  assert(id, Errors.ERR_IS_REQUIRED('id'));
  const file = await File.findOne({
    where: {
      id,
      deleted: false
    }
  });
  return file ? packFile(file.toJSON()) : null;
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