const BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

export default BASE_URL;
