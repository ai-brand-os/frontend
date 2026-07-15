import {
  applyInterceptors,
  createAxiosInstance,
  createHttpClient,
} from "./http.client";
import { getDefaultHttpConfig } from "./http.config";
import { createAuthInterceptor } from "./interceptors/auth.interceptor";
import { createRefreshInterceptor } from "./interceptors/refresh.interceptor";
import { defaultRequestInterceptor } from "./interceptors/request.interceptor";
import { errorNormalizationInterceptor } from "./interceptors/response.interceptor";

/**
 * The shared, centralized API client. Built once: an Axios instance with the
 * auth interceptor (attaches the bearer token), the refresh interceptor
 * (single-flight 401 refresh + one replay), and error normalization. Import
 * this everywhere instead of calling Axios directly.
 *
 * The refresh interceptor is registered before normalization so it inspects
 * the raw Axios error, and replays through this same instance so the retried
 * request re-runs the request interceptors with the fresh token.
 */
const instance = createAxiosInstance(getDefaultHttpConfig());

applyInterceptors(instance, {
  request: [createAuthInterceptor(), defaultRequestInterceptor],
  response: [
    createRefreshInterceptor({ retry: (config) => instance.request(config) }),
    errorNormalizationInterceptor,
  ],
});

export const httpClient = createHttpClient(instance);

export {
  applyInterceptors,
  createAxiosInstance,
  createHttpClient,
} from "./http.client";
export { getDefaultHttpConfig } from "./http.config";
export {
  createAuthInterceptor,
  DEFAULT_PUBLIC_ENDPOINTS,
  isPublicEndpoint,
} from "./interceptors/auth.interceptor";
export {
  createRefreshInterceptor,
  type RefreshInterceptorOptions,
} from "./interceptors/refresh.interceptor";
export { defaultRequestInterceptor } from "./interceptors/request.interceptor";
export { errorNormalizationInterceptor } from "./interceptors/response.interceptor";
export { refreshAccessToken } from "./token-refresher";
export type {
  HttpClient,
  HttpClientConfig,
  HttpInterceptors,
  HttpRequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from "./http.types";
