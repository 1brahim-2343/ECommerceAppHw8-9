import api from "./api";

export const register = async (data) => {
    const response = await api.post(
        "/auth/register",
        data
    );

    return response.data;
};

export const login = async (data) => {
    const response = await api.post(
        "/auth/login",
        data
    );

    return response.data;
};

export const refreshToken = async (token) => {
    const response = await api.post(
        "/auth/refresh",
        {
            refreshToken: token
        }
    );

    return response.data;
};

export const logout = async (token) => {
    const response = await api.post(
        "/auth/logout",
        {
            refreshToken: token
        }
    );

    return response.data;
};