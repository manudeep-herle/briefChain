export default {
  async run(context, params, secrets) {
    const {
      url,
      method = "GET",
      headers = {},
      body,
      auth,
      timeout = 30000
    } = params;

    if (!url) {
      throw new Error("URL is required");
    }

    // Build request headers
    const requestHeaders = {
      "User-Agent": "briefChain-HTTP-Connector",
      ...headers
    };

    // Handle authentication
    if (auth && auth.type && auth.value) {
      switch (auth.type) {
        case "bearer":
          requestHeaders.Authorization = `Bearer ${auth.value}`;
          break;
        case "apikey":
          const headerName = auth.headerName || "Authorization";
          requestHeaders[headerName] = auth.value;
          break;
        case "basic":
          // For basic auth, value should be base64 encoded username:password
          requestHeaders.Authorization = `Basic ${auth.value}`;
          break;
      }
    }

    // Build request options
    const requestOptions = {
      method: method.toUpperCase(),
      headers: requestHeaders,
      timeout: timeout
    };

    // Add body for non-GET requests
    if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      requestOptions.body = body;
    }

    try {
      console.log(`Making ${method} request to: ${url}`);
      console.log("Request headers:", requestHeaders);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get("content-type");
      let responseData;
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Build result object
      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        url: response.url
      };

      console.log(`HTTP request completed with status: ${response.status}`);

      // Throw error for non-2xx status codes if configured to do so
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      console.error("HTTP request failed:", error.message);
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  },
};