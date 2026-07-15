const originalFetch = window.fetch;

let isInterceptorSetup = false;

export const setupFetchInterceptor = (logoutHandler) => {
  if (isInterceptorSetup) return;
  isInterceptorSetup = true;

  window.fetch = async (...args) => {
    let [resource, config] = args;
    
    // Only intercept requests to our own backend API
    if (typeof resource === 'string' && resource.startsWith('http://localhost:5000')) {
      config = config || {};
      
      let currentHeaders = {};
      if (config.headers) {
        if (config.headers instanceof Headers) {
          config.headers.forEach((value, key) => {
            currentHeaders[key] = value;
          });
        } else {
          currentHeaders = { ...config.headers };
        }
      }
      
      const token = localStorage.getItem('authToken');
      
      if (token && !currentHeaders['Authorization'] && !currentHeaders['authorization']) {
        currentHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      config.headers = currentHeaders;
      
      const response = await originalFetch(resource, config);
      
      if (response.status === 401 && logoutHandler && !resource.includes('/login') && !resource.includes('/register')) {
        logoutHandler();
      }
      
      return response;
    }
    
    return originalFetch(resource, config);
  };
};
