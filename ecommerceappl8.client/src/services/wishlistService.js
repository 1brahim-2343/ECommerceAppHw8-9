import api from "./api"

export const getWishlist = async (userId) => {
    const response = await api.get(`/wishlist/${userId}`);

    return response.data;
}

export const addToWishlist = async (userId, productId) => {
    const response = await api.post(`wishlist/${userId}/items`, { productId });

    return response.data;
}

export const removeFromWishlist = async (userId, productId) => {
    await api.delete(`wishlist/${userId}/items/${productId}`);
}