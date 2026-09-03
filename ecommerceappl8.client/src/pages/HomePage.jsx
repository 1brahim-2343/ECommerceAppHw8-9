import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Container
        maxWidth="lg"
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Discover Your Style
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Find everything you need in one place.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
