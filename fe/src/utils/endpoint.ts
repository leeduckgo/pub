export default {
  getApi: () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? 'http://localhost:8097' : window.location.origin;
  },
};
