const request = require('request-promise');
const {
  mimeTypes
} = require('../../utils')
const config = require('../../config');
const User = require('../../models/user');
const PrsUtil = require('prs-utility');

const SIGN_URL = `${config.prsEndpoint}/api/v2/datasign`;

const makeRequest = (data) => {
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
  return `${config.origin}/api/storage/${name}.${postfix}`;
}

const getPayload = (file, user) => {
  const data = {
    file_hash: file.msghash
  };
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

exports.push = async file => {
  const user = await User.get(file.userId, {
    withKeys: true
  });
  const payload = getPayload(file, user);
  console.log(` ------------- payload ---------------`);
  console.log(payload)
  const hash = await makeRequest(payload);
  console.log(` ------------- pressone hash ---------------`);
  console.log(hash)
}