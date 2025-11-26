using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims; 
using BookQuotes.Api.Data;
using BookQuotes.Api.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- JWT Claim Mapping ----------
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// ---------- SQLite ----------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// ---------- JWT options & Auth ----------
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty))
        };
    });

builder.Services.AddAuthorization();

// ---------- Services ----------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers();

// ---------- CORS (Angular dev) ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("ng", p => p
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("Authorization"));
});

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    };
    c.AddSecurityDefinition("Bearer", scheme);

    var requirement = new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    };
    c.AddSecurityRequirement(requirement);
});

var app = builder.Build();

// ---------- Middleware order ----------
app.UseCors("ng"); 

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Redirect root to Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
