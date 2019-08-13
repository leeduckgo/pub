const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('@koa/cors');

const index = require('./routes/index');
const user = require('./routes/user');
const github = require('./routes/github');
const logout = require('./routes/logout');
const file = require('./routes/file');
const storage = require('./routes/storage');

const models = require('./models');

const {
  ensureAuthorization,
} = require('./models/api');

models.cache.init();

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(cors({
  credentials: true
}));
app.use(convert(logger()));

router.all('*', models.api.errorHandler);
router.all('*', models.api.extendCtx);

router.use('/', index.routes(), index.allowedMethods());
router.use('/api/user', ensureAuthorization(), user.routes(), user.allowedMethods());
router.use('/api/github', github.routes(), github.allowedMethods());
router.use('/api/logout', ensureAuthorization(), logout.routes(), logout.allowedMethods());
router.use('/api/files', file.routes(), file.allowedMethods());
router.use('/api/storage', storage.routes(), storage.allowedMethods());

app.use(router.routes(), router.allowedMethods());

app.on('error', function (err) {
  console.log(err)
});


module.exports = app;