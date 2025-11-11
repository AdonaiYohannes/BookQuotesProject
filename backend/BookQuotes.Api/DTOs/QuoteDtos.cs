namespace BookQuotes.Api.Dtos;


public record QuoteCreateUpdateDto(string Text, string? Source);
public record QuoteDto(int Id, string Text, string? Source);