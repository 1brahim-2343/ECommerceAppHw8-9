using ECommerceAppL8.Server.Entities;

namespace ECommerceAppL8.Server.Services
{
    public interface IRefreshTokenService
    {
        RefreshToken Generate(int userId);
    }
}
