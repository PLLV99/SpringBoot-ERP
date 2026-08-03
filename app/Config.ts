import axios from 'axios'

export const Config = {
    apiUrl: '/api',
    tokenKey: 'token_erp'
}

// Attach the JWT to every axios request automatically.
// The backend denies all endpoints (except signin) without a token,
// and most pages don't set the Authorization header themselves.
// Registered once per bundle; guarded against HMR double-registration.
declare global {
    // eslint-disable-next-line no-var
    var __erpAxiosAuthInstalled: boolean | undefined
}

if (typeof window !== 'undefined' && !globalThis.__erpAxiosAuthInstalled) {
    globalThis.__erpAxiosAuthInstalled = true
    axios.interceptors.request.use((request) => {
        if (!request.headers.Authorization) {
            const token = localStorage.getItem(Config.tokenKey)
            if (token) {
                request.headers.Authorization = `Bearer ${token}`
            }
        }
        return request
    })

    // The API answers failures with { status, error, message }, but axios only ever
    // puts "Request failed with status code 409" on error.message - which is what
    // every page shows the user. Rewrite it here so the pages need no changes.
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const data = error.response?.data
            const serverMessage =
                typeof data === 'string' ? data : data?.message

            if (serverMessage) {
                error.message = serverMessage
            }

            // 401 means the token is missing, invalid or expired: there is nothing
            // the current page can do, so send the user back to sign in. Skip it on
            // the login page itself, where 401 just means a wrong password.
            if (error.response?.status === 401 && window.location.pathname !== '/') {
                localStorage.removeItem(Config.tokenKey)
                document.cookie = `${Config.tokenKey}=; path=/; max-age=0`
                window.location.href = '/'
            }

            return Promise.reject(error)
        }
    )
}
