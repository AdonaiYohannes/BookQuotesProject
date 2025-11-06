namespace BookQuotes.Api.Models;

public class User
{
    public int Id {get; set;}
    
    // Unikt användarnamn för inloggning
    public string UserName {get; set;} = string.Empty;
    public string Email {get; set;}

    // Lagrar bara hash och salt (ingen klartextlösenord)
    public byte[] PasswordHash {get; set;} = System.Array.Empty<byte>();
    public byte[] PasswordSalt {get; set;} = System.Array.Empty<byte>();

    public System.DateTime CreatedAt {get; set;} = System.DateTime.UtcNow;
}
