import Cookies from 'js-cookie';

export const LOGIN_URL = '/oauth2/authorization/oidcng';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const apiFetch = async <T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
): Promise<T> => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    const csrf = Cookies.get('XSRF-TOKEN');
    if (csrf) {
        headers['X-XSRF-TOKEN'] = csrf;
    }
    const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'same-origin',
    });
    if (response.status === 401) {
        // the session is gone, authenticate again
        window.location.href = LOGIN_URL;
        return new Promise<T>(() => {});
    }
    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }
    // 204 and the empty 200 of the logout have no body
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
};
