var router = require('koa-router')();
const {
  get
} = require('../controllers/apiSettings');

router.get('/', get);

module.exports = router;