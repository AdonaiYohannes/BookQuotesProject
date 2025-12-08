using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookQuotes.Api.Data;
using BookQuotes.Api.Dtos;
using BookQuotes.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BookQuotes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuotesController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuotesController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        // Tries "sub" first (standard JWT), then NameIdentifier (mapped shape)
        if (User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value is string sub &&
            int.TryParse(sub, out var idFromSub))
            return idFromSub;

        if (User.FindFirst(ClaimTypes.NameIdentifier)?.Value is string sid &&
            int.TryParse(sid, out var idFromNameId))
            return idFromNameId;

        throw new UnauthorizedAccessException("Missing or invalid user id claim.");
    }

    // GET all quotes (changed to show ALL quotes from all users)
    [HttpGet]
    public async Task<IActionResult> GetQuotes()
    {
        var quotes = await _db.Quotes
            .Include(q => q.User)
            .OrderByDescending(q => q.Id)
            .Select(q => new QuoteDto(
                q.Id, 
                q.Text, 
                q.Author, 
                q.Source,
                q.User.UserName,
                q.UserId
            ))
            .Take(100)
            .ToListAsync();
        return Ok(quotes);
    }

    // Get my quotes only (new endpoint)
    [HttpGet("my-quotes")]
    public async Task<IActionResult> GetMyQuotes()
    {
        var userId = GetUserId();
        var quotes = await _db.Quotes
            .Include(q => q.User)
            .Where(q => q.UserId == userId)
            .OrderByDescending(q => q.Id)
            .Select(q => new QuoteDto(
                q.Id, 
                q.Text, 
                q.Author, 
                q.Source,
                q.User.UserName,
                q.UserId
            ))
            .Take(100)
            .ToListAsync();
        return Ok(quotes);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuote(QuoteCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);

        var quote = new Quote
        {
            Text = dto.Text.Trim(),
            Author = (dto.Author ?? string.Empty).Trim(),
            Source = dto.Source?.Trim(),
            UserId = userId
        };

        _db.Quotes.Add(quote);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetQuotes),
            new { id = quote.Id }, 
            new QuoteDto(quote.Id, quote.Text, quote.Author, quote.Source, user!.UserName, userId)
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateQuote(int id, QuoteCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var quote = await _db.Quotes
            .Include(q => q.User)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote is null) return NotFound();

        // Only owner can update
        if (quote.UserId != userId) 
            return Forbid(); // 403 Forbidden

        quote.Text = dto.Text.Trim();
        quote.Author = (dto.Author ?? string.Empty).Trim();
        quote.Source = dto.Source;

        await _db.SaveChangesAsync();

        return Ok(new QuoteDto(quote.Id, quote.Text, quote.Author,quote.Source, quote.User.UserName, quote.UserId));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuote(int id)
    {
        var userId = GetUserId();
        var quote = await _db.Quotes.FirstOrDefaultAsync(q => q.Id == id);

        if (quote is null) return NotFound();

        // Only owner can delete
        if (quote.UserId != userId) 
            return Forbid(); // 403 Forbidden

        _db.Quotes.Remove(quote);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
