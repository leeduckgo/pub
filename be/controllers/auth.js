'use strict';

const request = require('request-promise');
const config = require('../config');
const auth = require('../models/auth');
const {
  assert,
  Errors
} = require('../models/validator');
const Profile = require('../models/profile');
const Token = require('../models/token');
const User = require('../models/user');
const Chain = require('./chain');

const providers = ['pressone', 'github', 'mixin'];

const DEFAULT_AVATAR = 'https://static.press.one/pub/avatar.png';

exports.oauthLogin = async ctx => {
  const {
    authenticate
  } = auth;
  const {
    provider
  } = ctx.params;
  assert(providers.includes(provider), Errors.ERR_IS_INVALID(`provider: ${provider}`))
  assert(authenticate[provider], Errors.ERR_IS_INVALID(`provider: ${provider}`));
  assert(ctx.query.redirect, Errors.ERR_IS_REQUIRED('redirect'));
  ctx.session.auth = {
    provider: ctx.params.provider,
    redirect: ctx.query.redirect
  };
  return authenticate[provider](ctx);
};

const hasPermission = (provider, providerId) => {
  return config.whitelist[provider].includes(~~providerId);
}

exports.oauthCallback = async (ctx, next) => {
  const {
    provider
  } = ctx.params;

  let user;
  if (provider === 'pressone') {
    user = await handlePressOneCallback(ctx, provider);
  } else {
    user = await handleOauthCallback(ctx, next, provider);
  }

  assert(user, Errors.ERR_NOT_FOUND(`${provider} user`));

  const profile = providerGetter[provider](user);
  const noPermission = !hasPermission(provider, profile.id);
  if (noPermission) {
    ctx.redirect(config.permissionDenyUrl);
    return false;
  }

  await tryCreateUser(ctx, user, provider);

  ctx.redirect(ctx.session.auth.redirect);
}

const handlePressOneCallback = async (ctx, provider) => {
  const {
    userAddress
  } = ctx.query;
  assert(userAddress, Errors.ERR_IS_REQUIRED('userAddress'));
  const user = await request({
    uri: `https://press.one/api/v2/users/${userAddress}`,
    json: true,
    headers: {
      accept: 'application/json'
    },
  }).promise();
  return user
}

const handleOauthCallback = async (ctx, next, provider) => {
  const {
    authenticate
  } = auth;
  assert(authenticate[provider], Errors.ERR_IS_INVALID(`provider: ${provider}`))
  assert(ctx.session, Errors.ERR_IS_REQUIRED('session'));
  assert(ctx.session.auth, Errors.ERR_IS_REQUIRED('session.auth'));
  assert(ctx.session.auth.redirect, Errors.ERR_IS_REQUIRED('session.auth.redirect'));
  assert(ctx.session.auth.provider === provider, Errors.ERR_IS_INVALID(`provider mismatch: ${provider}`));

  await authenticate[provider](ctx, next);
  assert(ctx.session, Errors.ERR_IS_REQUIRED('session'));
  assert(ctx.session.passport, Errors.ERR_IS_REQUIRED('session.passport'));
  assert(ctx.session.passport.user, Errors.ERR_IS_REQUIRED('session.passport.user'));
  assert(ctx.session.passport.user.auth, Errors.ERR_IS_REQUIRED('session.passport.user.auth'));
  assert(ctx.session.passport.user.auth.accessToken, Errors.ERR_IS_REQUIRED('session.passport.user.auth.accessToken'));
  assert(ctx.session.passport.user.provider === provider, Errors.ERR_IS_INVALID(`provider mismatch: ${provider}`));

  const {
    user
  } = ctx.session.passport;
  return user;
}

const tryCreateUser = async (ctx, user, provider) => {
  const profile = providerGetter[provider](user);
  const isNewUser = !await Profile.isExist(profile.id, {
    provider,
  });
  let insertedProfile = {};
  if (isNewUser) {
    insertedProfile = await Profile.createProfile(profile, {
      provider
    });

    // 暂时只给 mixin 登陆的账号授权，其他账号可以用来测试【无授权】的情况
    if (provider === 'mixin') {
      const insertedUser = await User.get(insertedProfile.userId);
      await Chain.pushTopic({
        userAddress: insertedUser.address,
        topicAddress: config.boxTopicAddress
      });
      console.log(` ------------- allow 区块已提交 ---------------`);
    }
  } else {
    insertedProfile = await Profile.get(profile.id);
  }

  const token = await Token.create({
    userId: insertedProfile.userId,
    providerId: insertedProfile.providerId
  });

  ctx.cookies.set(
    config.authTokenKey,
    token, {
      expires: new Date('2100-01-01')
    }
  )
}

const providerGetter = {
  github: user => {
    return {
      id: user._json.id,
      name: user.username,
      avatar: user._json.avatar_url || DEFAULT_AVATAR,
      bio: user._json.bio,
      raw: user._raw,
    };
  },

  mixin: user => {
    return {
      id: user._json.identity_number,
      name: user._json.full_name,
      avatar: user._json.avatar_url || DEFAULT_AVATAR,
      bio: '',
      raw: JSON.stringify(user._json)
    }
  },

  pressone: user => {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar || DEFAULT_AVATAR,
      bio: user.bio,
      raw: JSON.stringify(user)
    }
  }
}