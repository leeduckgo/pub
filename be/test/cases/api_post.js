require('should');
const config = require('../../config');
const api = require('../api');

it('should be 200', () => {
  return api
    .get(`/api/user`)
    .set('Cookie', [`${config.authTokenKey}=${global.token}`]).expect(200);
});