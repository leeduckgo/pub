const router = require('koa-router')();
const {
  create,
  allow,
  deny,
  getAllowPermissionList,
  getDenyPermissionList,
  updatescript,
} = require('../controllers/apiTopic');
const {
  ensureAuthorization,
  ensureAdmin,
} = require('../models/api');

router.post('/', ensureAuthorization(), create);
router.get('/allow', ensureAuthorization(), ensureAdmin(), getAllowPermissionList);
router.get('/deny', ensureAuthorization(), ensureAdmin(), getDenyPermissionList);
router.post('/allow/:userid', ensureAuthorization(), ensureAdmin(), allow);
router.post('/deny/:userid', ensureAuthorization(), ensureAdmin(), deny);
router.get('/updatescript', ensureAuthorization(), ensureAdmin(), updatescript);

module.exports = router;