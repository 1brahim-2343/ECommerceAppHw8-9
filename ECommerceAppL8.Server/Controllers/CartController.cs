using ECommerceAppL8.Server.Data;
using ECommerceAppL8.Server.DTOs.Cart;
using ECommerceAppL8.Server.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceAppL8.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _context.Carts
                .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
            {
                return Ok(new
                {
                    id = 0,
                    userId,
                    items = Array.Empty<object>(),
                    total = 0
                });
            }

            var items = cart.Items.Select(x => new
            {
                id = x.Id,
                productId = x.ProductId,
                name = x.Product.Name,
                price = x.Product.Price,
                imageUrl = x.Product.ImageUrl,
                quantity = x.Quantity,
                subtotal = x.Product.Price * x.Quantity
            });

            var total = cart.Items.Sum(
                x => x.Product.Price * x.Quantity
            );

            return Ok(new
            {
                cart.Id,
                cart.UserId,
                items,
                total
            });
        }

        [HttpPost("{userId:int}/items")]
        public async Task<IActionResult> AddToCart(
            int userId,
            AddToCartDto dto)
        {
            if (dto.Quantity <= 0)
                return BadRequest("Quantity must be greater than zero.");

            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == dto.ProductId);

            if (product is null)
                return NotFound("Product not found.");

            if (product.Stock < dto.Quantity)
                return BadRequest("Not enough stock.");

            var cart = await _context.Carts
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                _context.Carts.Add(cart);
            }


            var existingItem = cart.Items
                .FirstOrDefault(x => x.ProductId == dto.ProductId);


            if (existingItem is not null)
            {
                if (existingItem.Quantity + dto.Quantity > product.Stock)
                    return BadRequest("Not enough stock.");

                existingItem.Quantity += dto.Quantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{userId:int}/items/{productId:int}")]
        public async Task<IActionResult> UpdateQuantity(
            int userId,
            int productId,
            [FromQuery] int quantity)
        {
            if (quantity <= 0)
                return BadRequest("Quantity must be greater than zero.");

            var cartItem = await _context.CartItems
                .Include(x => x.Cart)
                .Include(x => x.Product)
                .FirstOrDefaultAsync(x =>
                    x.Cart.UserId == userId &&
                    x.ProductId == productId);

            if (cartItem is null)
                return NotFound("Cart item not found.");

            if (quantity > cartItem.Product.Stock)
                return BadRequest("Not enough stock.");

            cartItem.Quantity = quantity;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{userId:int}/items/{productId:int}")]
        public async Task<IActionResult> RemoveFromCart(
            int userId,
            int productId)
        {
            var cartItem = await _context.CartItems
                .Include(x => x.Cart)
                .FirstOrDefaultAsync(x =>
                    x.Cart.UserId == userId &&
                    x.ProductId == productId);

            if (cartItem is null)
                return NotFound("Cart item not found.");

            _context.CartItems.Remove(cartItem);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            var cart = await _context.Carts
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
                return NoContent();

            _context.CartItems.RemoveRange(cart.Items);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
