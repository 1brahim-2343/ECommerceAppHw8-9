import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      await login(email, password);

      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            p: 5,
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
            Welcome Back
          </Typography>

          <Typography color="text.secondary" textAlign="center" mb={4}>
            Sign in to your account
          </Typography>

          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Typography textAlign="center" mt={3}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage;
