import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useNavigate } from "react-router-dom";

import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.userId;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);

      const data = await getWishlist(userId);
      
      setItems(data.wishlistItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(userId, productId);

      setItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) loadWishlist();
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={250} />
              <Skeleton height={40} />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
        Wishlist
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h5">Your wishlist is empty</Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Save products you like to find them here later.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid key={item.productId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >
                <IconButton
                  onClick={() => handleRemove(item.productId)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </IconButton>

                <CardMedia
                  component="img"
                  height="240"
                  image={item.imageUrl}
                  alt={item.productName}
                  onClick={() => navigate(`/products/${item.productId}`)}
                  sx={{ cursor: "pointer" }}
                />

                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {item.productName}
                  </Typography>

                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}