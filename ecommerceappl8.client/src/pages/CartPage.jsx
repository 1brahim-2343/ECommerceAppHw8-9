import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../services/cartService";
import { useAuth } from "../context/AuthContext";

function CartPage() {
  
  const {user} = useAuth();

  const userId = user?.userId;

  const [cart, setCart] = useState({
    items: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);

      const data = await getCart(userId);

      setCart(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const increaseQuantity = async (productId, quantity) => {
    try {
      await updateCartItem(userId, productId, quantity + 1);

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const decreaseQuantity = async (productId, quantity) => {
    if (quantity <= 1) {
      return;
    }

    try {
      await updateCartItem(userId, productId, quantity - 1);

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(userId, productId);

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart(userId);

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Loading cart...</Typography>
      </Container>
    );
  }

  const shipping = cart.items.length > 0 ? 10 : 0;

  const total = cart.total + shipping;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Shopping Cart
        </Typography>

        {cart.items.length > 0 && (
          <Button color="error" onClick={handleClear}>
            Clear Cart
          </Button>
        )}
      </Box>

      {cart.items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
          }}
        >
          <Typography variant="h5">Your cart is empty</Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 3,
            }}
          >
            Add some products to your cart.
          </Typography>

          <Button variant="contained" href="/products">
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            {cart.items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.name}
                      sx={{
                        width: 110,
                        height: 110,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />

                    <Box
                      sx={{
                        flexGrow: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {item.name}
                      </Typography>

                      <Typography color="text.secondary">
                        ${item.price.toFixed(2)}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            decreaseQuantity(item.productId, item.quantity)
                          }
                        >
                          -
                        </Button>

                        <Typography>{item.quantity}</Typography>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            increaseQuantity(item.productId, item.quantity)
                          }
                        >
                          +
                        </Button>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "right",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        ${item.subtotal.toFixed(2)}
                      </Typography>

                      <IconButton
                        color="error"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold">
                  Order Summary
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  <Typography>Subtotal</Typography>

                  <Typography>${cart.total.toFixed(2)}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Typography>Shipping</Typography>

                  <Typography>${shipping.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total
                  </Typography>

                  <Typography variant="h6" fontWeight="bold">
                    ${total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 4 }}
                  href="/checkout"
                >
                  Proceed To Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default CartPage;
