const BASE_URL = import.meta.env.MODE === 'production'
  ? "https://srvanabackend-268062404120.us-central1.run.app/api"
  : import.meta.env.VITE_LOCAL_API_BASE_URL;

export default BASE_URL;
