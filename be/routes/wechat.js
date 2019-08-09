var router = require('koa-router')();
var OAuth = require('wechat-oauth');
var client = new OAuth('wxa623e401972f777d', 'b16cedaf22c77f05953c966f0962d0a4');
var url = client.getAuthorizeURLForWebsite('http://pub.xue.cn/wechat/callback', '7669988597', 'snsapi_base');

router.get('/', async function (ctx, next) {
  ctx.body = url;
})

module.exports = router;
