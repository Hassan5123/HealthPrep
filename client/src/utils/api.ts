/**
 * API utility for making HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  message: string | string[];
  statusCode?: number;
}

export class ApiRequestError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Makes an API request to the backend
 * @param endpoint The API endpoint (e.g., '/users/login')
 * @param options Fetch options (method, body, headers, etc.)
 * @returns Promise with the response data or throws an error
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      try {
        const errorData: ApiError = await response.json();
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message[0];
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = `Request failed with status ${response.status}`;
      }
      
      throw new ApiRequestError(errorMessage, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiRequestError('Unable to connect to server', 0);
  }
}