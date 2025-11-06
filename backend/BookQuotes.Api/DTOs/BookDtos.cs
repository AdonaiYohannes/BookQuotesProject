namespace BookQuotes.Api.DTOs;

public record BookCreateUpdateDto(string Title, string Author, System.DateOnly? Published);
public record BookDto(int Id, string Title, string Author, System.DateOnly Published);