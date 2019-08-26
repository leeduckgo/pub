const request = require('request-promise');
const {
  mimeTypes
} = require('../../utils')
const config = require('../../config');
const User = require('../../models/user');
const PrsUtil = require('prs-utility');
const {
  assert,
  Errors
} = require('../../models/validator');
const Block = require('../../models/block');

const SIGN_URL = `${config.prsEndpoint}/api/v2/datasign`;

const signBlock = (data) => {
  return request({
    method: 'post',
    uri: SIGN_URL,
    json: true,
    headers: {
      accept: 'application/json'
    },
    body: data
  }).promise();
}

const getPostfix = mimeType => {
  let postfix;
  for (const key in mimeTypes) {
    if (mimeTypes[key] === mimeType) {
      postfix = key;
      break;
    }
  }
  return postfix;
}

const getFileUrl = file => {
  const name = file.msghash;
  const postfix = getPostfix(file.mimeType);
  return `${config.serviceRoot}/api/storage/${name}.${postfix}`;
}

const getPayload = ({
  file,
  user,
  topic,
}, options = {}) => {

  assert(file, Errors.ERR_IS_REQUIRED(file));
  assert(user, Errors.ERR_IS_REQUIRED(user));
  assert(topic, Errors.ERR_IS_REQUIRED(topic));

  const data = {
    file_hash: file.msghash,
    topic
  };

  const {
    updatedFile
  } = options;
  if (updatedFile) {
    const {
      blockTransactionId,
      blockNum
    } = updatedFile;
    assert(blockTransactionId, Errors.ERR_IS_REQUIRED(blockTransactionId));
    assert(blockNum, Errors.ERR_IS_REQUIRED(blockNum));
    data.updated_file_id = `${blockTransactionId}@${blockNum}`;
  }

  const payload = {
    user_address: user.address,
    type: 'PIP:2001',
    meta: {
      uris: [getFileUrl(file)],
      mime: `${file.mimeType};charset=UTF-8`
    },
    data,
    hash: PrsUtil.hashBlockData(data),
    signature: PrsUtil.signBlockData(data, user.privateKey).signature
  };
  return payload;
}

const packBlock = block => {
  const result = {};
  delete block['createdAt'];
  for (const key in block) {
    const value = block[key];
    const isObj = typeof value === 'object';
    result[key] = isObj ? JSON.stringify(value) : value;
  }
  return result;
}

exports.push = async (file, options = {}) => {
  const user = await User.get(file.userId, {
    withKeys: true
  });
  const payload = getPayload({
    file,
    user,
    topic: user.address,
  }, options);
  const block = await signBlock(payload);
  assert(block, Errors.ERR_NOT_FOUND('block'));
  const packedBlock = packBlock(block);
  const dbBlock = await Block.create(packedBlock);
  return dbBlock;
}