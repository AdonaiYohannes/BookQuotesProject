namespace BookQuotes.Api.DTOs;

public record QuoteCreateUpdateDto(string Text, string? Source);
public record QuoteDto(int Id, string Text, string? Source);