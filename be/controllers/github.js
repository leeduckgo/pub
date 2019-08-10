const request = require('request-promise');
const config = require('../config');
const Errors = require('../models/validator/errors');
const {
  assert
} = require('../models/validator');
const Profile = require('../models/profile')
const Token = require('../models/token')

exports.callback = async ctx => {
  const {
    code
  } = ctx.query
  const resp = await fetchAccessToken(code);
  assert(!resp.error, 500, resp.error_description);
  const {
    access_token
  } = resp;
  assert(access_token, Errors.ERR_IS_REQUIRED('access_token'));
  const profileStr = await fetchProfile(access_token);
  const profile = JSON.parse(profileStr);
  console.log(` ------------- profile ---------------`, profile);
  const isNewUser = !await Profile.isExist(profile.id, {
    provider: 'github',
  });
  console.log(` ------------- isNewUser ---------------`, isNewUser);
  let insertedProfile = {};
  if (isNewUser) {
    insertedProfile = await Profile.createProfile(profile, {
      provider: 'github'
    });
  } else {
    insertedProfile = await Profile.get(profile.id);
  }
  console.log(` ------------- insertedProfile ---------------`, insertedProfile);
  const token = await Token.create({
    userId: insertedProfile.userId,
    providerId: insertedProfile.providerId
  });
  ctx.body = token;
}

const fetchAccessToken = (code) => {
  const {
    clientID,
    clientSecret
  } = config.github;
  const url = getAccessTokenUrl(clientID, clientSecret, code);
  return request({
    method: 'post',
    uri: url,
    json: true,
    headers: {
      accept: 'application/json'
    }
  }).promise();
}

const getAccessTokenUrl = (clientID, clientSecret, code) => {
  const path = 'https://github.com/login/oauth/access_token';
  return `${path}?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`;
}

const fetchProfile = (accessToken) => {
  return request({
    uri: 'https://api.github.com/user',
    headers: {
      'user-agent': 'node.js',
      Authorization: 'token ' + accessToken
    }
  }).promise();
}

const generateToken = () => '假的 token';