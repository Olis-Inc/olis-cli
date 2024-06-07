import axios, { AxiosRequestConfig } from "axios";

export interface HTTPError extends Error {
  message: string;
  data?: { message?: string };
  statusCode?: number;
}

class HttpRequest {
  requestOptions: AxiosRequestConfig;

  constructor(options: AxiosRequestConfig = {}) {
    this.requestOptions = {
      baseURL: options.baseURL,
      timeout: options.timeout || 300000,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };
  }

  get api() {
    const instance = axios.create(this.requestOptions);
    instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error.response),
    );

    instance.interceptors.response.use(
      (response) => response.data || response,
      (error) => Promise.reject(error.response),
    );

    return instance;
  }
}

export default HttpRequest;
