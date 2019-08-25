'use strict';

const config = require('../config');
const auth = require('../models/auth');
const {
  assert,
  Errors
} = require('../models/validator');
const Profile = require('../models/profile')
const Token = require('../models/token')

const providers = ['mixin'];

let redirect = (url, params, ctx) => {
  let idx = 0;
  for (let key in params || []) {
    url += ((idx++ === 0) && !url.includes('?') ? '?' : '&') +
      `${key}=` + encodeURIComponent(params[key]);
  }
  ctx.redirect(url);
};

exports.oauthLogin = async (ctx, next) => {
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
  return authenticate[provider](ctx, next);
};

exports.oauthCallback = async (ctx, next) => {
  const {
    provider
  } = ctx.params;
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

  if (provider === 'mixin') {
    const {
      user
    } = ctx.session.passport;
    const profile = {
      id: user._json.identity_number,
      name: user._json.full_name,
      avatar_url: user._json.avatar_url,
      bio: '',
      raw: user._json
    };
    const isNewUser = !await Profile.isExist(profile.id, {
      provider,
    });
    let insertedProfile = {};
    if (isNewUser) {
      insertedProfile = await Profile.createProfile(profile, {
        provider
      });
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
    ctx.redirect(ctx.session.auth.redirect);
  }
}