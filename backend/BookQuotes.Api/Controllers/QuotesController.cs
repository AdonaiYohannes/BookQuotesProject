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

    [HttpGet]
    public async Task<IActionResult> GetQuotes()
    {
        var userId = GetUserId();
        var quotes = await _db.Quotes
            .Where(q => q.UserId == userId)
            .Select(q => new QuoteDto(q.Id, q.Text, q.Source))
            .Take(100)
            .ToListAsync();
        return Ok(quotes);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuote(QuoteCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var quote = new Quote
        {
            Text = dto.Text,
            Source = dto.Source,
            UserId = userId
        };

        _db.Quotes.Add(quote);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetQuotes),
            new { id = quote.Id }, new QuoteDto(quote.Id, quote.Text, quote.Source));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateQuote(int id, QuoteCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var quote = await _db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
        if (quote is null) return NotFound();

        quote.Text = dto.Text;
        quote.Source = dto.Source;
        await _db.SaveChangesAsync();
        return Ok(new QuoteDto(quote.Id, quote.Text, quote.Source));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuote(int id)
    {
        var userId = GetUserId();
        var quote = await _db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
        if (quote is null) return NotFound();

        _db.Quotes.Remove(quote);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
