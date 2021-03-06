const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('@koa/cors');
const session = require('koa-session');
const serve = require('koa-static');
const views = require('koa-views');

const user = require('./routes/user');
const auth = require('./routes/auth');
const logout = require('./routes/logout');
const file = require('./routes/file');
const topic = require('./routes/topic');
const storage = require('./routes/storage');
const finance = require('./routes/finance');
const ping = require('./routes/ping');
const webhook = require('./routes/webhook');
const settings = require('./routes/settings');
const importRoute = require('./routes/import');

const config = require('./config');
const models = require('./models');

const {
  ensureAuthorization
} = require('./models/api');

const redis = models.cache.init();

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(
  cors({
    credentials: true
  })
);
app.use(convert(logger()));

app.keys = config.encryption.sessionKeys;
app.use(session(config.session, app));
const passport = models.auth.buildPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(views(__dirname + '/build'));
app.use(serve('build'));

router.all('*', models.api.errorHandler);
router.all('*', models.api.extendCtx);

router.use(
  '/api/user',
  ensureAuthorization(),
  user.routes(),
  user.allowedMethods()
);
router.use('/api/auth', auth.routes(), auth.allowedMethods());
router.use(
  '/api/logout',
  ensureAuthorization(),
  logout.routes(),
  logout.allowedMethods()
);
router.use('/api/files', file.routes(), file.allowedMethods());
router.use('/api/topics', topic.routes(), topic.allowedMethods());
router.use('/api/storage', storage.routes(), storage.allowedMethods());
router.use('/api/finance', finance.routes(), finance.allowedMethods());
router.use('/api/ping', ping.routes(), ping.allowedMethods());
router.use('/api/webhook', webhook.routes(), webhook.allowedMethods());
router.use('/api/settings', settings.routes(), settings.allowedMethods());
router.use('/api/import', importRoute.routes(), importRoute.allowedMethods());
router.get('*', async ctx => ctx.render('index'));

app.use(router.routes(), router.allowedMethods());

app.on('error', function (err) {
  console.log(err);
});

app.serverUpCallback = server => {
  models.socketIo.init(redis, server);
};

module.exports = app;