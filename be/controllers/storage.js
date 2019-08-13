const File = require('../models/file');
const {
  mimeTypes
} = require('../utils');
const {
  assert,
  Errors
} = require('../models/validator');

exports.get = async ctx => {
  const filename = ctx.params.filename;
  assert(filename, Errors.ERR_IS_REQUIRED('filename'));
  const [msghash, postfix] = filename.split('.');
  assert(msghash, Errors.ERR_IS_REQUIRED('msghash'));
  assert(postfix, Errors.ERR_IS_REQUIRED('postfix'));
  const mimeType = mimeTypes[postfix];
  assert(mimeType, Errors.ERR_IS_INVALID('mimeType'));
  const file = await File.getByMsghash(msghash);
  assert(file, Errors.ERR_NOT_FOUND('file'));
  assert(file.mimeType === mimeType, Errors.ERR_NOT_FOUND('mimeType'));
  ctx.body = file.content;
}