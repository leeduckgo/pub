const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('@koa/cors');

const index = require('./routes/index');
const user = require('./routes/user');
const github = require('./routes/github');
const logout = require('./routes/logout');

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
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views'));

router.all('*', models.api.errorHandler);
router.all('*', models.api.extendCtx);

router.use('/', index.routes(), index.allowedMethods());
router.use('/user', ensureAuthorization(), user.routes(), user.allowedMethods());
router.use('/github', github.routes(), github.allowedMethods());
router.use('/logout', ensureAuthorization(), logout.routes(), logout.allowedMethods());

app.use(router.routes(), router.allowedMethods());
// response

app.on('error', function (err) {
  console.log(err)
});


module.exports = app;