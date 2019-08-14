import { parse } from 'query-string';

export const getQueryObject = () => {
  return parse(window.location.search)
}