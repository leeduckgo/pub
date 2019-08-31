const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('@koa/cors');
const config = require('./config');
const Sentry = require('@sentry/node');
const session = require('koa-session');

if (config.env === 'production') {
  Sentry.init({
    dsn: config.sentryDsn
  });
}

const index = require('./routes/index');
const user = require('./routes/user');
const auth = require('./routes/auth');
const logout = require('./routes/logout');
const file = require('./routes/file');
const topic = require('./routes/topic');
const storage = require('./routes/storage');
const ping = require('./routes/ping');
const webhook = require('./routes/webhook');

const models = require('./models');

const {
  ensureAuthorization,
} = require('./models/api');

const redis = models.cache.init();

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(cors({
  credentials: true
}));
app.use(convert(logger()));

app.keys = config.sessionKeys;
app.use(session(config.session, app));
const passport = models.auth.buildPassport();
app.use(passport.initialize());
app.use(passport.session());

router.all('*', models.api.errorHandler);
router.all('*', models.api.extendCtx);

router.use('/', index.routes(), index.allowedMethods());
router.use('/api/user', ensureAuthorization(), user.routes(), user.allowedMethods());
router.use('/api/auth', auth.routes(), auth.allowedMethods());
router.use('/api/logout', ensureAuthorization(), logout.routes(), logout.allowedMethods());
router.use('/api/files', file.routes(), file.allowedMethods());
router.use('/api/topics', topic.routes(), topic.allowedMethods());
router.use('/api/storage', storage.routes(), storage.allowedMethods());
router.use('/api/ping', ping.routes(), ping.allowedMethods());
router.use('/api/webhook', webhook.routes(), webhook.allowedMethods());

app.use(router.routes(), router.allowedMethods());

app.on('error', function (err) {
  console.log(err)
});

app.serverUpCallback = (server) => {
  models.socketIo.init(redis, server);
}

module.exports = app;