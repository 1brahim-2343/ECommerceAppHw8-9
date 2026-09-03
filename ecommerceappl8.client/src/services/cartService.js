import api from "./api";

export const getCart = async (userId) => {

    const response = await api.get(`/cart/${userId}`);

    return response.data;

};

export const addToCart = async (

    userId,

    productId,

    quantity = 1

) => {

    const response = await api.post(

        `/cart/${userId}/items`,

        {

            productId,

            quantity

        }

    );

    return response.data;

};

export const updateCartItem = async (

    userId,

    productId,

    quantity

) => {

    const response = await api.put(

        `/cart/${userId}/items/${productId}?quantity=${quantity}`

    );

    return response.data;

};

export const removeFromCart = async (

    userId,

    productId

) => {

    await api.delete(

        `/cart/${userId}/items/${productId}`

    );

};

export const clearCart = async (userId) => {

    await api.delete(`/cart/${userId}`);

};
