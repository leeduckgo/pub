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
const Block = require('../models/block');
const Log = require('../models/log');
const Permission = require('../models/permission');
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

const checkPermission = async (provider, profile) => {
  const providerId = profile.id;
  const isInWhiteList = config.whitelist[provider].includes(~~providerId);
  if (isInWhiteList) {
    return true;
  }
  const hasProviderPermission = await providerPermissionChecker[provider](profile);
  return hasProviderPermission;
}

const providerPermissionChecker = {
  mixin: async profile => {
    const rawJson = JSON.parse(profile.raw);
    const IsInMixinBoxGroup = await checkIsInMixinBoxGroup(rawJson.user_id);
    return IsInMixinBoxGroup;
  },
  github: async profile => {
    const isPaidUserOfXue = await checkIsPaidUserOfXue(profile.name);
    return isPaidUserOfXue;
  },
};

const checkIsInMixinBoxGroup = async mixinUuid => {
  try {
    await request({
      uri: `https://xiaolai-ri-openapi.groups.xue.cn/v1/users/${mixinUuid}`,
      json: true,
      headers: {
        Authorization: `Bearer ${config.boxGroupToken}`
      },
    }).promise();
    return true;
  } catch (err) {
    return false;
  }
}

const checkIsPaidUserOfXue = async githubNickName => {
  try {
    const user = await request({
      uri: `${config.xueUserExtraApi}/${githubNickName}`,
      json: true,
      headers: {
        'x-po-auth-token': config.xueAdminToken
      },
    }).promise();
    const isPaidUser = user.balance > 0;
    return isPaidUser;
  } catch (err) {
    return false;
  }
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
  Log.createAnonymity(profile.id, `登陆 oauth 成功`);
  const hasPermission = await checkPermission(provider, profile);
  const noPermission = !hasPermission;
  if (noPermission) {
    Log.createAnonymity(profile.id, `没有 ${provider} 权限，raw ${profile.raw}`);
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
    Log.create(insertedProfile.userId, `我被创建了`);
  } else {
    insertedProfile = await Profile.get(profile.id);
    Log.create(insertedProfile.userId, `登陆成功`);
  }

  const { topicAddress } = config.settings;

  const insertedUser = await User.get(insertedProfile.userId);
  const allowBlock = await Block.getAllowBlockByAddress(insertedUser.address);

  if (!allowBlock) {
    Permission.setPermission({
      userId: insertedUser.id,
      topicAddress,
      type: 'allow',
    })

    // 暂时只给 mixin, github 登陆的账号授权，其他账号可以用来测试【无授权】的情况
    const isProduction = config.env === 'production';
    if (topicAddress && isProduction && ['mixin', 'github'].includes(provider)) {
      const block = await Chain.pushTopic({
        userAddress: insertedUser.address,
        topicAddress,
        type: 'allow',
      });
      Log.create(insertedProfile.userId, `提交 allow 区块, blockId ${block.id}`);
    }
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
