namespace BookQuotes.Api.Dtos;


public record QuoteCreateUpdateDto(string Text, string? Author, string? Source );
public record QuoteDto(int Id, string Text, string? Author, string? Source );