var router = require('koa-router')();
const {
  list,
  create,
  remove,
  update,
  get
} = require('../controllers/apiFile');
const {
  ensureAuthorization
} = require('../models/api');

router.get('/', ensureAuthorization(), list);
router.post('/', ensureAuthorization(), create);
router.del('/:id', ensureAuthorization(), remove);
router.put('/:id', ensureAuthorization(), update);
router.get('/:id', get);

module.exports = router;