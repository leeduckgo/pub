export default {
  getApi: () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? 'http://localhost:8000' : window.location.origin;
  },
};
