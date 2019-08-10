const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');

const index = require('./routes/index');
const users = require('./routes/users');
const wechat = require('./routes/wechat');
const github = require('./routes/github');

const models = require('./models');

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'jade'
}));

router.all('*', models.api.errorHandler);
router.all('*', models.api.extendCtx);

router.use('/', index.routes(), index.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());
router.use('/login', wechat.routes(), wechat.allowedMethods());
router.use('/github', github.routes(), wechat.allowedMethods());

app.use(router.routes(), router.allowedMethods());
// response

app.on('error', function (err) {
  console.log(err)
});


module.exports = app;