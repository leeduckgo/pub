import qs from 'query-string';

export { default as Endpoint } from './endpoint';
export { default as IntroHints } from './introHints';
export { FileStatus, FileStatusTip } from './enum';

export const isDevelopment = process.env.NODE_ENV === 'development';

export const isProduction = process.env.NODE_ENV === 'production';

export const getQueryObject = () => {
  return qs.parse(window.location.search);
};

export const getQuery = (name: string) => {
  return qs.parse(window.location.search)[name];
};

export const setQuery = (param: any = {}) => {
  let parsed = qs.parse(window.location.search);
  parsed = {
    ...parsed,
    ...param,
  };
  if (window.history.pushState) {
    const newUrl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      `?${decodeURIComponent(qs.stringify(parsed))}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }
};

export const removeQuery = (name: string) => {
  let parsed = qs.parse(window.location.search);
  delete parsed[name];
  const isEmpty = Object.keys(parsed).length === 0;
  if (window.history.pushState) {
    const newUrl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      `${isEmpty ? '' : '?' + decodeURIComponent(qs.stringify(parsed))}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }
};

export const ago = (timestamp: string) => {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffValue = now - past;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = month * 12;
  const _year = diffValue / year;
  const _month = diffValue / month;
  const _week = diffValue / (7 * day);
  const _day = diffValue / day;
  const _hour = diffValue / hour;
  const _min = diffValue / minute;
  let result = '';
  if (_year >= 1) {
    result = Math.floor(_year) + '年前';
  } else if (_month >= 1) {
    result = Math.floor(_month) + '个月前';
  } else if (_week >= 1) {
    result = Math.floor(_week) + '周前';
  } else if (_day >= 1) {
    result = Math.floor(_day) + '天前';
  } else if (_hour >= 1) {
    result = Math.floor(_hour) + '个小时前';
  } else if (_min >= 1) {
    result = Math.floor(_min) + '分钟前';
  } else {
    result = '刚刚';
  }
  return result;
};

export const sleep = (duration: number) =>
  new Promise((resolve: any) => {
    setTimeout(resolve, duration);
  });

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
