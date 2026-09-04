namespace ECommerceAppL8.Server.Entities
{
    public class Wishlist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<WishlistItem> Items { get; set; } = [];
    }
}
