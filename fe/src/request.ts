import { Endpoint } from './utils';
const BASE = Endpoint.getApi();
export default async (url: any, options: any = {}) => {
  if (options.method === 'POST' || options.method === 'PUT') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(options.body);
  }
  options.credentials = 'include';
  const res = await fetch(new Request((options.base || BASE) + url), options);
  let resData;
  if (options.isTextResponse) {
    resData = await res.text();
  } else {
    resData = await res.json();
  }
  if (res.ok) {
    return resData;
  } else {
    throw Object.assign(new Error(), {
      status: res.status,
      message: resData.message,
    });
  }
};
