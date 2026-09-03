namespace ECommerceAppL8.Server.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public decimal DiscountPercentage { get; set; }
        public List<ProductReview> Reviews { get; set; }
        public int ViewCount { get; set; }
    }


}
