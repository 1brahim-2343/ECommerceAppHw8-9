import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import { addToCart } from "../services/cartService";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const userId = user?.userId;

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);



  const handleAddToCart = async () => {
    try {
      await addToCart(userId, product.id, quantity);

      alert("Product added to cart!");
    } catch (error) {
      console.error(error);
    }
  };

  const getReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);

      setReviews(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) return;

    try {
      setSubmittingReview(true);

      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      setReviewRating(0);
      setReviewComment("");

      getReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        setProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    getProduct();
  }, [id]);

  useEffect(() => {
    getReviews();
  }, [id]);

  if (!product) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            sx={{
              width: "100%",
              borderRadius: 3,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h3" fontWeight="bold">
            {product.name}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 2 }}>
            {product.category?.name}
          </Typography>

          {product.discountPercentage > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                ${product.price.toFixed(2)}
              </Typography>

              <Typography variant="h6" fontWeight="bold" color="error.main">
                $
                {(
                  product.price *
                  (1 - product.discountPercentage / 100)
                ).toFixed(2)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
          )}

          <Typography sx={{ mt: 3 }}>{product.description}</Typography>

          <Typography sx={{ mt: 3 }}>Stock: {product.stock}</Typography>
          <Typography sx={{ mt: 3 }}>{product.viewCount} Views</Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </Button>

            <Typography>{quantity}</Typography>

            <Button
              variant="outlined"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            >
              +
            </Button>
          </Box>

          <Button
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            Add To Cart
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Reviews
      </Typography>

      {userId && (
        <Box sx={{ mb: 5 }}>
          <Rating
            value={reviewRating}
            onChange={(_, value) => setReviewRating(value)}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your review..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={submittingReview || reviewRating === 0}
            onClick={handleReviewSubmit}
          >
            Submit Review
          </Button>
        </Box>
      )}

      {reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet.</Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id} sx={{ mb: 3 }}>
            <Rating value={review.rating} readOnly size="small" />

            <Typography sx={{ mt: 0.5 }}>{review.comment}</Typography>

            <Typography variant="caption" color="text.secondary">
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Container>
  );
}

export default ProductDetailsPage;