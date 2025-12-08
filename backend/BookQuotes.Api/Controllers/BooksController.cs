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
public class BooksController : ControllerBase
{
    private readonly AppDbContext _db;

    public BooksController(AppDbContext db)
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
    

    // GET all books (changed to show ALL books from all users)
    [HttpGet]
    public async Task<IActionResult> GetBooks()
    {
        var userId = GetUserId();
        var books = await _db.Books
            .Include(b => b.User) 
            .OrderByDescending(b => b.Id)
            .Select(b => new BookDto(
                b.Id, 
                b.Title, 
                b.Author, 
                b.Published,
                b.User.UserName, 
                b.UserId         
            ))
            .ToListAsync();
        return Ok(books);
    }

    // GET my books only (new endpoint)
    [HttpGet ("my-books")]
    public async Task<IActionResult> GetMyBooks()
    {
        var userId = GetUserId();
        var books = await _db.Books
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.Id)
            .Select(b => new BookDto(
                b.Id, 
                b.Title, 
                b.Author, 
                b.Published, 
                b.User.UserName, 
                b.UserId))
            .ToListAsync();
        return Ok(books);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook(BookCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);

        var book = new Book
        {
            Title = dto.Title,
            Author = dto.Author,
            Published = dto.Published,
            UserId = userId
        };

        _db.Books.Add(book);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooks), new { id = book.Id },
            new BookDto(book.Id, book.Title, book.Author, book.Published, user!.UserName, userId));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, BookCreateUpdateDto dto)
    {
        var userId = GetUserId();
        var book = await _db.Books
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book is null) return NotFound();

        // Only owner can update
        if (book.UserId != userId) 
            return Forbid(); // 403 Forbidden

        book.Title = dto.Title;
        book.Author = dto.Author;
        book.Published = dto.Published;

        await _db.SaveChangesAsync();
        return Ok(new BookDto(book.Id, book.Title, book.Author, book.Published, book.User.UserName, book.UserId));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var userId = GetUserId();
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == id);

        if (book is null) return NotFound();

        // Only owner can delete
        if (book.UserId != userId) 
            return Forbid(); // 403 Forbidden

        _db.Books.Remove(book);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
