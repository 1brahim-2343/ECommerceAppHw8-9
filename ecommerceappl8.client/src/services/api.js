import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7220/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    "https://localhost:7220/api",
                    {
                        refreshToken: refreshToken
                    }
                );

                const data = response.data;

                localStorage.setItem(
                    "accessToken",
                    data.accessToken
                );

                localStorage.setItem(
                    "refreshToken",
                    data.refreshToken
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        userId: data.userId,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        role: data.role
                    })
                );

                originalRequest.headers.Authorization =
                    `Bearer ${data.accessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;