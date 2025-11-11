namespace BookQuotes.Api.Models;

public class Book 
{
    public int Id {get; set;}
    public string Title {get; set;} = string.Empty;
    public string Author {get; set;} = string.Empty;
    public System.DateOnly? Published {get; set;}

    // Användare som har lagt till boken
    public int UserId {get; set;}
}