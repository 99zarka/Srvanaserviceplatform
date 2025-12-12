const BASE_URL = import.meta.env.MODE === 'production'
  ? "https://srvanabackend-268062404120.us-central1.run.app/api"
  : "http://localhost:8000/api";

export default BASE_URL;
