export interface ApiErrorPayload {
  message?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiFailureResponse {
  success: false;
  error?: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response body');
  }
  return JSON.parse(text) as T;
}
