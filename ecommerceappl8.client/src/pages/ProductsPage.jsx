import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";

function ProductsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const userId = user?.userId;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("newest");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [discounted, setDiscounted] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const pageSize = 8;

  useEffect(() => {
    getProducts();
  }, [search, categoryId, sort, page, minPrice, maxPrice, discounted]);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (authLoading) return; 

    if (!userId) {
      setWishlistedIds(new Set());
      return;
    }

    loadWishlistIds();
  }, [userId, authLoading]);

  const getProducts = async () => {
    try {
      setLoading(true);

      const endpoint = discounted ? "/products/discounted" : "/products";
      const response = await api.get(endpoint, {
        params: {
          search: search || undefined,
          categoryId: categoryId || undefined,
          sort,
          page,
          pageSize,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        },
      });

      setProducts(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadWishlistIds = async () => {
    try {
      const data = await getWishlist(userId);
      const wishlistedItems = data.wishlistItems;
      const ids = new Set(wishlistedItems.map(i=>i.productId));
      setWishlistedIds(ids);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlistedIds(new Set());
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategoryId(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleToggleWishlist = async (event, productId) => {
    event.stopPropagation();

    if (!userId) {
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistedIds.has(productId);

    setWishlistedIds((prev) => {
      const updated = new Set(prev);
      if (isWishlisted) {
        updated.delete(productId);
      } else {
        updated.add(productId);
      }
      return updated;
    });

    try {
      if (isWishlisted) {
        await removeFromWishlist(userId, productId);
      } else {
        await addToWishlist(userId, productId);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      await loadWishlistIds();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
        Products
      </Typography>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            label="Search products"
            placeholder="Search..."
            value={search}
            onChange={handleSearch}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>

            <Select
              value={categoryId}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>

              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Sort</InputLabel>

            <Select
              value={sort}
              label="Sort"
              onChange={handleSortChange}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="priceasc">Price: Low to High</MenuItem>
              <MenuItem value="pricedesc">Price: High to Low</MenuItem>
              <MenuItem value="nameasc">Name: A-Z</MenuItem>
              <MenuItem value="namedesc">Name: Z-A</MenuItem>
              <MenuItem value="mostviewed">Most Viewed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Min Price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Max Price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant={discounted ? "contained" : "outlined"}
            color="primary"
            sx={{ height: "56px" }}
            onClick={() => {
              setDiscounted((prev) => !prev);
              setPage(1);
            }}
          >
            Discounted
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
              }}
            >
              <Skeleton variant="rectangular" height={250} />
              <Skeleton height={40} />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
          }}
        >
          <Typography variant="h5">
            No products found
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Try changing your search or filters.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid
                key={product.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                }}
              >
                <Card
                  onClick={() =>
                    navigate(`/products/${product.id}`)
                  }
                  sx={{
                    height: "100%",
                    cursor: "pointer",
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
                    onClick={(e) =>
                      handleToggleWishlist(e, product.id)
                    }
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor:
                        "rgba(255,255,255,0.9)",
                      "&:hover": {
                        backgroundColor:
                          "rgba(255,255,255,1)",
                      },
                    }}
                  >
                    {wishlistedIds.has(product.id) ? (
                      <FavoriteIcon
                        fontSize="small"
                        color="error"
                      />
                    ) : (
                      <FavoriteBorderIcon
                        fontSize="small"
                      />
                    )}
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="240"
                    image={product.imageUrl}
                    alt={product.name}
                  />

                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {product.categoryName}
                    </Typography>

                    {product.discountPercentage > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textDecoration: "line-through",
                          }}
                        >
                          ${product.price.toFixed(2)}
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="error.main"
                        >
                          $
                          {(
                            product.price *
                            (1 -
                              product.discountPercentage /
                                100)
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ mt: 2 }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      color={
                        product.stock > 0
                          ? "success.main"
                          : "error.main"
                      }
                      sx={{ mt: 1 }}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
}

export default ProductsPage;