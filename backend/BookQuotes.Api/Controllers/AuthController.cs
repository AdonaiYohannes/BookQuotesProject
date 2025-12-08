using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookQuotes.Api.Data;
using BookQuotes.Api.Dtos;
using BookQuotes.Api.Models;
using BookQuotes.Api.Service;

namespace BookQuotes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuthService _auth;

    public AuthController(AppDbContext db, IAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Username and password are required.");

        if (await _db.Users.AnyAsync(u => u.UserName == request.UserName))
            return Conflict("Username is already taken.");

        if (!string.IsNullOrWhiteSpace(request.Email) && await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict("Email is already in-use.");

        _auth.CreatePasswordHash(request.Password, out byte[] hash, out byte[] salt);
        var user = new User
        {
            UserName = request.UserName,
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email,
            PasswordHash = hash,
            PasswordSalt = salt
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new RegisterResponse(user.Id, user.UserName, user.Email));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.UserName == request.UserName);
        if (user is null)
            return Unauthorized();

        if (!_auth.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized();

        var token = _auth.CreateToken(user.UserName, user.Id);
        return Ok(new AuthResponse(token, user.UserName, user.Id));
    }
}
