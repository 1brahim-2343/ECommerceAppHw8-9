import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();

    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Logo */}
        <Typography
          component={Link}
          to="/"
          variant="h5"
          fontWeight="800"
          sx={{
            textDecoration: "none",
            color: "#111827",
            mr: 5,
          }}
        >
          E-Shop
        </Typography>

        {/* Navigation */}
        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
            gap: 3,
          }}
        >
          <Button
            component={Link}
            to="/"
            sx={{
              color: "#374151",
              textTransform: "none",
            }}
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/products"
            sx={{
              color: "#374151",
              textTransform: "none",
            }}
          >
            Products
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Cart */}
        <IconButton onClick={() => navigate("/cart")} sx={{ mr: 1 }}>
          <Badge badgeContent={0} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        {/* Authentication */}
        {!isAuthenticated ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              component={Link}
              to="/login"
              sx={{
                textTransform: "none",
                color: "#374151",
              }}
            >
              Sign In
            </Button>

            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
              }}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <PersonOutlineIcon />

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Typography variant="body2" fontWeight="600">
                {user?.email}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>

            <Button
              onClick={handleLogout}
              color="error"
              sx={{
                textTransform: "none",
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
