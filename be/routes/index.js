var router = require('koa-router')();

router.get('/', async function (ctx) {
  ctx.body = '自学网'
})

module.exports = router;