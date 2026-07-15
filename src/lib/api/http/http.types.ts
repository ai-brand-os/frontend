import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * Per-request options passed to the {@link HttpClient} methods. Aliased from
 * Axios so feature code depends on this module, not on Axios directly — the
 * transport can be swapped without touching call sites.
 */
export type HttpRequestConfig = AxiosRequestConfig;

/** Typed configuration for a single {@link HttpClient} instance. */
export interface HttpClientConfig {
  /** Fully-qualified API origin + prefix, e.g. `https://api.host/api/v1`. */
  baseURL: string;
  /** Abort a request after this many milliseconds. */
  timeout: number;
  /** Default headers merged onto every request. */
  headers?: Record<string, string>;
}

/**
 * A request-phase interceptor. `onFulfilled` mutates/returns the outgoing
 * config; `onRejected` handles a config-build failure. This is the seam where
 * auth (bearer header, refresh) plugs in later — without changing the client.
 */
export interface RequestInterceptor {
  onFulfilled?: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRejected?: (error: unknown) => unknown;
}

/**
 * A response-phase interceptor. `onFulfilled` sees a successful response;
 * `onRejected` maps/handles a failure (e.g. normalizing it to an `ApiError`).
 */
export interface ResponseInterceptor {
  onFulfilled?: (
    response: AxiosResponse,
  ) => AxiosResponse | Promise<AxiosResponse>;
  onRejected?: (error: unknown) => unknown;
}

/** Interceptor sets registered on a client, applied in array order. */
export interface HttpInterceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
}

/**
 * Transport abstraction over Axios. Every method resolves to the unwrapped
 * response body (`response.data`) typed as `T`; failures reject with the
 * error produced by the response interceptors.
 */
export interface HttpClient {
  request<T>(config: HttpRequestConfig): Promise<T>;
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}
