using ECommerceAppL8.Server.Data;
using ECommerceAppL8.Server.DTOs.Product;
using ECommerceAppL8.Server.DTOs.ProductReview;
using ECommerceAppL8.Server.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
    [FromQuery] ProductQueryDto query)
    {
        var productsQuery = _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            productsQuery = productsQuery.Where(x =>
                x.Name.Contains(query.Search) ||
                x.Description.Contains(query.Search));
        }

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.CategoryId == query.CategoryId.Value);
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.Price <= query.MaxPrice.Value);
        }

        productsQuery = query.Sort.ToLower() switch
        {
            "priceasc" =>
                productsQuery.OrderBy(x => x.Price),

            "pricedesc" =>
                productsQuery.OrderByDescending(x => x.Price),

            "nameasc" =>
                productsQuery.OrderBy(x => x.Name),

            "namedesc" =>
                productsQuery.OrderByDescending(x => x.Name),

            "mostviewed" =>
            productsQuery.OrderByDescending(x => x.ViewCount),

            _ =>
                productsQuery.OrderByDescending(x => x.CreatedAt)
        };

        var totalCount = await productsQuery.CountAsync();

        var pageSize = Math.Clamp(query.PageSize, 1, 50);

        var page = Math.Max(query.Page, 1);

        var products = await productsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductListDto
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                Stock = x.Stock,
                ImageUrl = x.ImageUrl,
                CategoryId = x.CategoryId,
                CategoryName = x.Category.Name,
                DiscountPercentage = x.DiscountPercentage
            })
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(
            totalCount / (double)pageSize);

        var result = new PagedResultDto<ProductListDto>
        {
            Items = products,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };

        return Ok(result);
    }

    [HttpGet("discounted")]
    public async Task<IActionResult> GetAllDiscounted([FromQuery] ProductQueryDto query)
    {
        var productsQuery = _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable()
            .Where(p => p.DiscountPercentage > 0);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            productsQuery = productsQuery.Where(x =>
                x.Name.Contains(query.Search) ||
                x.Description.Contains(query.Search));
        }

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.CategoryId == query.CategoryId.Value);
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(x =>
                x.Price <= query.MaxPrice.Value);
        }

        productsQuery = query.Sort.ToLower() switch
        {
            "priceasc" =>
                productsQuery.OrderBy(x => x.Price),

            "pricedesc" =>
                productsQuery.OrderByDescending(x => x.Price),

            "nameasc" =>
                productsQuery.OrderBy(x => x.Name),

            "namedesc" =>
                productsQuery.OrderByDescending(x => x.Name),

            _ =>
                productsQuery.OrderByDescending(x => x.CreatedAt)
        };

        var totalCount = await productsQuery.CountAsync();

        var pageSize = Math.Clamp(query.PageSize, 1, 50);

        var page = Math.Max(query.Page, 1);

        var products = await productsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductListDto
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                Stock = x.Stock,
                ImageUrl = x.ImageUrl,
                CategoryId = x.CategoryId,
                CategoryName = x.Category.Name,
                DiscountPercentage = x.DiscountPercentage,
            })
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(
            totalCount / (double)pageSize);

        var result = new PagedResultDto<ProductListDto>
        {
            Items = products,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };

        return Ok(result);
    }
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
            return NotFound();

        _context.Products.First(p => p.Id == id).ViewCount += 1;
        Console.WriteLine(product.ViewCount);
        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(x => x.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Category does not exist.");

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId,
            DiscountPercentage = dto.DiscountPercentage
        };

        _context.Products.Add(product);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            product
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateProductDto dto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
            return NotFound();

        var categoryExists = await _context.Categories
            .AnyAsync(x => x.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Category does not exist.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.ImageUrl = dto.ImageUrl;
        product.CategoryId = dto.CategoryId;
        product.DiscountPercentage = dto.DiscountPercentage;

        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
            return NotFound();

        _context.Products.Remove(product);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/reviews")]
    public async Task<IActionResult> AddReview(CreateProductReviewDto dto, int id)
    {
        var review = new ProductReview
        {
            Comment = dto.Comment,
            ProductId = id,
            CreatedAt = DateTime.UtcNow,
            Rating = dto.Rating
        };

        await _context.Reviews.AddAsync(review);

        if ((await _context.SaveChangesAsync()) > 0)

            return Ok(new
            {
                Message = "Review added"
            });

        else
            return StatusCode(500, new { Message = "Failed to add review" });
    }
    [HttpGet("{id:int}/reviews")]
    public async Task<IActionResult> GetReviews(int id)
    {
        var product = await _context.Products
            .Include(p => p.Reviews)
            .SingleOrDefaultAsync(p => p.Id == id);

        if (product is not null)
        {
            return Ok(product.Reviews);
        }
        else
        {
            return NotFound(new { Message = $"Product with id {id} was not found" });
        }
    }

}