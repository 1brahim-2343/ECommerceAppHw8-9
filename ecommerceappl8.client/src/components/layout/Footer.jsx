import { Box, Container, Grid, Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,

        py: 6,

        backgroundColor: "grey.900",

        color: "white",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ShopX
            </Typography>

            <Typography color="grey.400">
              Everything you need, all in one place.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography fontWeight="bold" gutterBottom>
              Shop
            </Typography>

            <Link
              href="/products"
              color="grey.400"
              underline="none"
              display="block"
            >
              Products
            </Link>

            <Link href="#" color="grey.400" underline="none" display="block">
              Categories
            </Link>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography fontWeight="bold" gutterBottom>
              Account
            </Typography>

            <Link href="#" color="grey.400" underline="none" display="block">
              My Account
            </Link>

            <Link href="#" color="grey.400" underline="none" display="block">
              Orders
            </Link>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography fontWeight="bold" gutterBottom>
              Contact
            </Typography>

            <Typography color="grey.400">support@shopx.com</Typography>

            <Typography color="grey.400">+994 50 000 00 00</Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 5,

            pt: 3,

            borderTop: "1px solid",

            borderColor: "grey.700",
          }}
        >
          <Typography variant="body2" color="grey.500" textAlign="center">
            © 2026 ShopX. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
