using ECommerceAppL8.Server.Entities;
using ECommerceAppL8.Server.Models;
using ECommerceAppL8.Server.Services;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace ECommerceAppMorning.Server.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly JwtSettings _settings;

    public RefreshTokenService(
        IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public RefreshToken Generate(int userId)
    {
        return new RefreshToken
        {
            Token = Convert.ToBase64String(
                RandomNumberGenerator.GetBytes(64)),

            UserId = userId,

            ExpiresAt = DateTime.UtcNow.AddDays(
                _settings.RefreshTokenExpirationDays),

            CreatedAt = DateTime.UtcNow
        };
    }
}