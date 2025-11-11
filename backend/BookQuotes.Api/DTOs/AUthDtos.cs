using System.ComponentModel.DataAnnotations;

namespace BookQuotes.Api.Dtos;


public record RegisterRequest
{

    [Required, MinLength(3), MaxLength(20)]
    public string UserName {get; set;} = string.Empty;

    [Required, EmailAddress, MaxLength(50)]
    public string? Email {get; set;}

    [Required, MinLength(6), MaxLength(20)]
    public string Password {get; set;} = string.Empty;

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
    public string? ConfirmPassword {get; set;} 
}

public record LoginRequest([Required] string UserName, [Required] string Password);
public record AuthResponse(string Token, string UserName);
public record RegisterResponse(int Id, string UserName, string? Email);