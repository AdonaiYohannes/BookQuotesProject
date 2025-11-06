namespace BookQuotes.Api.Models;

public class Quote
{
    public int Id {get; set;}
    public string Text {get; set;} = string.Empty;
    public string? Source {get; set;}

    //Användare som har lagt till citatet
    public int UserId {get; set;}
}