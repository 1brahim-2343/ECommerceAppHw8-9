using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceAppMorning.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        return Ok(new
        {
            message = "You are authenticated.",
            userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value,

            email = User.FindFirst(
                System.Security.Claims.ClaimTypes.Email
            )?.Value,

            role = User.FindFirst(
                System.Security.Claims.ClaimTypes.Role
            )?.Value
        });
    }
}