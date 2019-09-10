var router = require('koa-router')();
const {
  get
} = require('../controllers/settings');

router.get('/', get);

module.exports = router;