using ECommerceAppL8.Server.Data;
using ECommerceAppL8.Server.DTOs.Wishlist;
using ECommerceAppL8.Server.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceAppL8.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetWishlist(int userId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(w => w.UserId == userId);
            if (wishlist is null)
            {
                return Ok(new
                {
                    id = 0,
                    userId,
                    items = Array.Empty<object>(),
                });
            }

            var wishlistItems = wishlist.Items.Select(i => new
            {
                id = i.Id,
                productId = i.ProductId,
                name = i.Product.Name,
                price = i.Product.Price,
                imageUrl = i.Product.ImageUrl,
            });

            return Ok(new
            {
                wishlist.Id,
                wishlist.UserId,
                wishlistItems
            });
        }

        [HttpPost("{userId:int}/items")]
        public async Task<IActionResult> AddToWishlist(int userId, AddToWishlistDto dto)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (product is null)
            {
                return NotFound("Product was not found.");
            }

            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if(wishlist is null)
            {
                wishlist = new Wishlist
                {
                    UserId = userId
                };
                _context.Wishlists.Add(wishlist);
            }

            var existingItem = wishlist.Items
                .FirstOrDefault(i => i.ProductId == dto.ProductId);

            if(existingItem is not null)
            {
                wishlist.Items.Remove(existingItem); //!!! remove (maybe)
            }
            else
            {
                wishlist.Items.Add(new WishlistItem
                {
                    ProductId = dto.ProductId,
                });
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{userId:int}/items/{productId:int}")]
        public async Task<IActionResult> DeleteFromWishlist(int userId, int productId)
        {
            var wishlistItem = await _context.WishlistItems
                .Include(w => w.Wishlist)
                .FirstOrDefaultAsync(w =>
                w.Wishlist.UserId == userId &&
                w.ProductId == productId);

            if (wishlistItem is null)
                return NotFound("Wishlist item was not found");
            _context.WishlistItems.Remove(wishlistItem);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
