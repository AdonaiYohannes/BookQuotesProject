# BookQuote Project

A full-stack web application for managing and sharing book quotes. 
Users can register, login, add books, and save their favorite quotes from those books.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Book Management**: Add, view, and manage books
- **Quote Collection**: Save and organize favorite quotes from books
- **Personal Library**: View your collection of books and quotes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Server-Side Rendering**: Built with Angular SSR for improved performance and SEO

## Tech Stack

### Frontend
- **Angular 21** (with SSR)
- **TypeScript**
- **RxJS** for reactive programming
- **Angular Router** for navigation
- **HTTP Client** for API communication

### Backend
- **ASP.NET Core 9.0** Web API
- **Entity Framework Core** with SQLite
- **JWT Authentication** with Bearer tokens
- **Swagger/OpenAPI** for API documentation
- **RESTful API** architecture

### Deployment
- **Frontend**: Azure Web App (Sweden Central)
- **Backend**: Azure Web App 
- **Database**: SQLite (development) / Azure SQL (production recommended)

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v20.x or later)
- **npm** (v11.3.0 or later)
- **Angular CLI** (v21.x)
- **.NET 9.0 SDK**
- **Azure Account** (for deployment)
- **SQLite** (for local development)

## Installation & Setup

### Frontend Setup

1. **Clone the repository**
```
git clone <your-repository-url>
cd BookQuotesProject/bookFrontend
```

2. **Install dependencies**
```
npm install
```

3. **Configure environment**

Create or update `src/environments/environment.ts`:
```
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // Your local backend URL
};
```

For production (`src/environments/environment.prod.ts`):
```
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.azurewebsites.net/api'
};
```

4. **Run development server**
```
npm start
```

Navigate to `http://localhost:4200/`

### Backend Setup

1. **Navigate to backend directory**
```
cd BookQuotesProject/backend/BookQuotes.Api
```

2. **Restore dependencies**
```
dotnet restore
```

3. **Configure database**

The project uses SQLite by default. The connection string is in `appsettings.json`:
```
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=bookquotes.db"
  },
  "Jwt": {
    "Key": "your-secret-key-here-min-32-characters",
    "Issuer": "BookQuotesApi",
    "Audience": "BookQuotesClient"
  }
}
```

**Important**: Update the JWT secret key for production!

4. **Apply database migrations**
```
dotnet ef database update
```

This will create the SQLite database with these tables:
- Users
- Books
- Quotes

5. **Run the backend**
```
dotnet run
```

Backend will start at `https://localhost:5001` (or the port specified in `launchSettings.json`)

6. **View API documentation**

Once running, navigate to:
- Swagger UI: `https://localhost:5001/swagger`

### Backend Project Structure

```
BookQuotes.Api/
├── Controllers/
│   ├── AuthController.cs      # Registration & Login
│   ├── BooksController.cs     # Book CRUD operations
│   └── QuotesController.cs    # Quote management
├── Data/
│   └── AppDbContext.cs        # EF Core DbContext
├── DTOs/
│   ├── AuthDtos.cs           # Auth request/response models
│   ├── BookDtos.cs           # Book DTOs
│   └── QuoteDtos.cs          # Quote DTOs
├── Models/
│   ├── User.cs               # User entity
│   ├── Book.cs               # Book entity
│   └── Quote.cs              # Quote entity
├── Migrations/               # EF Core migrations
├── Service/
│   └── AuthService.cs        # Authentication logic
├── Program.cs                # App entry point & configuration
├── appsettings.json          # Configuration
└── bookquotes.db            # SQLite database (generated)
```

### API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Books** (Requires Authentication)
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

**Quotes** (Requires Authentication)
- `GET /api/quotes` - Get all user's quotes
- `GET /api/quotes/{id}` - Get quote by ID
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Delete quote



##  Project Structure

```
bookFrontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/           # Landing page
│   │   │   ├── login/          # User login
│   │   │   ├── register/       # User registration
│   │   │   ├── book-form/      # Add/edit books
│   │   │   ├── book-list/      # Display books
│   │   │   ├── my-quotes/      # User's quote collection
│   │   │   └── navigation/     # Navigation bar
│   │   ├── guards/
│   │   │   └── auth-guard.ts   # Route protection
│   │   └── Services/
│   │       ├── auth.service.ts    # Authentication logic
│   │       ├── book.service.ts    # Book CRUD operations
│   │       ├── quote.service.ts   # Quote management
│   │       └── jwt-interceptor.ts # HTTP interceptor
│   ├── environments/           # Environment configs
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register/login through the frontend
2. Backend returns a JWT token
3. Token is stored and sent with subsequent requests
4. JWT Interceptor automatically adds the token to HTTP headers
5. Auth Guard protects routes requiring authentication

## Deployment

### Deploy to Azure Web App

1. **Build for production**
```
npm run build
```

2. **Deploy via Azure Portal (Kudu)**
   - Go to Azure Portal → Your Web App
   - Open **Advanced Tools** → **Go**
   - Navigate to `site/wwwroot` in Debug Console
   - Upload all files from `dist/bookFrontend/browser`

3. **Or deploy via Azure CLI**
```
cd dist/bookFrontend/browser
Compress-Archive -Path * -DestinationPath deploy.zip
az webapp deployment source config-zip \
  --resource-group <your-resource-group> \
  --name <your-web-app-name> \
  --src deploy.zip
```

### Configure Azure Web App

In Azure Portal → Configuration → Application Settings:
```
WEBSITE_NODE_DEFAULT_VERSION = 20-lts
SCM_DO_BUILD_DURING_DEPLOYMENT = false
```

### Backend Deployment to Azure Web App

1. **Update connection string for production**

In appsettings.json or Azure Application Settings:
```
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:your-server.database.windows.net,1433;Database=bookquotes;User
      ID=your-admin;Password=your-password;Encrypt=True;TrustServerCertificate=False;"
  }
}
```
For Azure SQL Database: Create database first in Azure Portal

2. **Publish from Visual Studio**
  - Right-click project → Publish
  - Select Azure → Azure App Service (Windows)
  - Select your subscription and Web App
  - Click Publish


3. **Or publish via CLI**
```
cd backend/BookQuotes.Api

# Build and publish
dotnet publish -c Release -o ./publish

# Create zip
cd publish
Compress-Archive -Path * -DestinationPath ../bookquotes-api.zip

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group <your-resource-group> \
  --name <your-backend-app-name> \
  --src ../bookquotes-api.zip
```

4. **Configure Azure Web App for .NET**

In Azure Portal → Configuration:
  - **Stack:** .NET
  - **Version:** .NET 9
  - **Platform:** 64-bit


5. **Add Application Settings in Azure Portal**

Jwt__Key = your-production-secret-key-min-32-characters
Jwt__Issuer = BookQuotesApi
Jwt__Audience = BookQuotesClient
ASPNETCORE_ENVIRONMENT = Production

6. **Run database migrations on Azure**

  - **Option A** - Using Package Manager Console in Visual Studio:
    ``` Update-Database -Connection "your-azure-connection-string" ```
    
  - **Option B** - Using Azure Cloud Shell or local CLI:
    ```
    # Install EF Core tools globally if not installed
      dotnet tool install --global dotnet-ef
   
    - # Run migrations 
     dotnet ef database update --connection "your-azure-connection-string"
    ```
  - **Option C** - Enable automatic migrations in Program.cs (for development only):
    ```
    # Apply migrations automatically on startup (not recommended for production)
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
         }
    ```

7. **Enable CORS for frontend**

In Azure Portal → Your Backend Web App → CORS:
  - Add your frontend URL: https://bookquote-client-fkewase3ezasfdc0.swedencentral-01.azurewebsites.net
  - Or add wildcard for testing: * (not recommended for production)


8. **Verify deployment**

  - Navigate to https://your-backend-app.azurewebsites.net/swagger
  - Test authentication and endpoints

**Update Frontend to use Azure Backend**
**Update** src/environments/environment.prod.ts:
```
  export const environment = {
    production: true,
    apiUrl: 'https://your-backend-app.azurewebsites.net/api'
};
```
Rebuild and redeploy frontend after updating the API URL.


## 🌐 Live Demo

**Frontend**: https://bookquote-client-fkewase3ezasfdc0.swedencentral-01.azurewebsites.net/


## 👤 Author

**Adonai Yohannes**
- Email: adonai.yohannes@edu.newton.se
- Organization: Newton Kompetensutveckling AB

## 🐛 Known Issues

- Azure Static Web App deployment blocked by organizational policy
- Workaround: Using Azure Web App (App Service) instead

---
