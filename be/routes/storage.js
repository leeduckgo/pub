var router = require('koa-router')();
const {
  get
} = require('../controllers/storage');

router.get('/:filename', get);

module.exports = router;