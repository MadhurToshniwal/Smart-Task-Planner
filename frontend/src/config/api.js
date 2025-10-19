// API Configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // In production, use relative URLs (same domain)
  : 'http://localhost:5000'; // In development, use localhost

export default API_BASE_URL;