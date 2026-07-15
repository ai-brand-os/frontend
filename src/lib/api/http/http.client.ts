import axios, { type AxiosInstance, type AxiosResponse } from "axios";

import type {
  HttpClient,
  HttpClientConfig,
  HttpInterceptors,
  HttpRequestConfig,
} from "./http.types";

/** Creates a configured Axios instance (no interceptors attached yet). */
export function createAxiosInstance(config: HttpClientConfig): AxiosInstance {
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: { "Content-Type": "application/json", ...config.headers },
  });
}

/** Registers interceptor sets on an instance, in array order. */
export function applyInterceptors(
  instance: AxiosInstance,
  interceptors: HttpInterceptors = {},
): void {
  for (const { onFulfilled, onRejected } of interceptors.request ?? []) {
    instance.interceptors.request.use(onFulfilled, onRejected);
  }
  for (const { onFulfilled, onRejected } of interceptors.response ?? []) {
    instance.interceptors.response.use(onFulfilled, onRejected);
  }
}

/** Extracts the typed body from an Axios response. */
function unwrap<T>(response: AxiosResponse<T>): T {
  return response.data;
}

/**
 * Wraps an Axios instance in the {@link HttpClient} facade. Every method
 * resolves to the unwrapped response body; feature code depends on this
 * interface, never on Axios directly.
 */
export function createHttpClient(instance: AxiosInstance): HttpClient {
  return {
    request: <T>(config: HttpRequestConfig) =>
      instance.request<T>(config).then(unwrap),
    get: <T>(url: string, config?: HttpRequestConfig) =>
      instance.get<T>(url, config).then(unwrap),
    post: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      instance.post<T>(url, data, config).then(unwrap),
    put: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      instance.put<T>(url, data, config).then(unwrap),
    patch: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      instance.patch<T>(url, data, config).then(unwrap),
    delete: <T>(url: string, config?: HttpRequestConfig) =>
      instance.delete<T>(url, config).then(unwrap),
  };
}
