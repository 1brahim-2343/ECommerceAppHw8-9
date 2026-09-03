using ECommerceAppL8.Server.Data;
using ECommerceAppL8.Server.DTOs.Auth;
using ECommerceAppL8.Server.Entities;
using ECommerceAppL8.Server.Services;
using ECommerceAppMorning.Server.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceAppMorning.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtService _jwtService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly AppDbContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        IJwtService jwtService,
        IRefreshTokenService refreshTokenService,
        AppDbContext context)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _refreshTokenService = refreshTokenService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterDto dto)
    {
        var existingUser =
            await _userManager.FindByEmailAsync(dto.Email);

        if (existingUser is not null)
        {
            return BadRequest(new
            {
                message = "User already exists."
            });
        }

        var user = new ApplicationUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            UserName = dto.Email,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(
            user,
            dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors
                    .Select(x => x.Description)
            });
        }

        await _userManager.AddToRoleAsync(
            user,
            "User");

        return Ok(new
        {
            message = "Registration successful."
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
    RefreshTokenDto dto)
    {
        var oldRefreshToken =
            await _context.RefreshTokens
                .Include(x => x.User)
                .FirstOrDefaultAsync(x =>
                    x.Token == dto.RefreshToken);

        if (oldRefreshToken is null ||
            !oldRefreshToken.IsActive)
        {
            return Unauthorized(new
            {
                message = "Invalid or expired refresh token."
            });
        }

        var user = oldRefreshToken.User;

        // Revoke old refresh token
        oldRefreshToken.RevokedAt = DateTime.UtcNow;

        // Generate new access token
        var accessToken =
            await _jwtService.GenerateAccessTokenAsync(user);

        // Generate new refresh token
        var newRefreshToken =
            _refreshTokenService.Generate(user.Id);

        _context.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        var roles =
            await _userManager.GetRolesAsync(user);

        return Ok(new AuthResponseDto
        {
            AccessToken = accessToken,

            RefreshToken = newRefreshToken.Token,

            AccessTokenExpiresAt =
                _jwtService.GetAccessTokenExpiration(),

            UserId = user.Id,

            Email = user.Email!,

            Role = roles.FirstOrDefault() ?? "User"
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginDto dto)
    {
        var user =
            await _userManager.FindByEmailAsync(dto.Email);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var validPassword =
            await _userManager.CheckPasswordAsync(
                user,
                dto.Password);

        if (!validPassword)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var accessToken =
            await _jwtService.GenerateAccessTokenAsync(user);

        var refreshToken =
            _refreshTokenService.Generate(user.Id);

        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync();

        var roles =
            await _userManager.GetRolesAsync(user);

        return Ok(new AuthResponseDto
        {
            AccessToken = accessToken,

            RefreshToken = refreshToken.Token,

            AccessTokenExpiresAt =
                DateTime.UtcNow.AddMinutes(15),

            UserId = user.Id,

            Email = user.Email!,

            Role = roles.FirstOrDefault() ?? "User"
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
    LogoutDto dto)
    {
        var refreshToken =
            await _context.RefreshTokens
                .FirstOrDefaultAsync(x =>
                    x.Token == dto.RefreshToken);

        if (refreshToken is null)
        {
            return NotFound();
        }

        if (!refreshToken.IsRevoked)
        {
            refreshToken.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }
}