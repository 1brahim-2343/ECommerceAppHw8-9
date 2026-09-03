namespace ECommerceAppL8.Server.DTOs.ProductReview
{
    public class ProductReviewDto
    {
        public int ProductId { get; set; }
        public double Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
