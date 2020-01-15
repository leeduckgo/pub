'use strict';

const passport = require('koa-passport');
const GithubStrategy = require('passport-github2').Strategy;
const MixinStrategy = require('passport-mixin').Strategy;
const {
  provider
} = require('../config');

const buildPassport = () => {
  if (provider.github) {
    passport.use(new GithubStrategy({
      clientID: provider.github.clientID,
      clientSecret: provider.github.clientSecret,
      callbackURL: provider.github.callbackUrl
    }, (accessToken, refreshToken, profile, callback) => {
      profile.auth = {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      callback(null, profile);
    }));
  }

  if (provider.mixin) {
    passport.use(new MixinStrategy({
      clientID: provider.mixin.clientId,
      clientSecret: provider.mixin.clientSecret,
      callbackURL: provider.mixin.callbackUrl
    }, (accessToken, refreshToken, profile, callback) => {
      profile.auth = {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      callback(null, profile);
    }));
  }

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser((obj, callback) => {
    callback(null, obj);
  });

  return passport;
};

const authenticate = {};

if (provider.github) {
  authenticate.github = passport.authenticate('github', {
    failureRedirect: provider.github.loginUrl,
    scope: ['read:user']
  });
}

if (provider.mixin) {
  authenticate.mixin = passport.authenticate('mixin', {
    failureRedirect: provider.mixin.loginUrl,
    scope: 'PROFILE:READ'
  })
}

if (provider.pressone) {
  authenticate.pressone = ctx => {
    ctx.redirect(`https://press.one/developer/apps/${provider.pressone.appAddress}/authorize?scope=user`);
  }
}

module.exports = {
  authenticate,
  buildPassport
};