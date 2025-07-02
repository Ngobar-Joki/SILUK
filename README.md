# SILUK Project

A Laravel-based web application for SILUK system.

## Prerequisites

Before installing this project, make sure you have the following installed on your system:

-   PHP >= 8.1
-   Composer
-   Node.js & NPM
-   MySQL/MariaDB
-   Web server (Apache/Nginx) or use Laravel's built-in server

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url> SILUK
cd SILUK
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Database Setup

Edit your `.env` file and configure your database connection:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siluk_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Create the database:

```bash
# Create database (if using MySQL command line)
mysql -u root -p
CREATE DATABASE siluk_db;
exit;
```

### 6. Run Database Migrations

```bash
# Run migrations
php artisan migrate

# (Optional) Seed the database
php artisan db:seed
```

### 7. Build Assets

```bash
# For development
npm run dev

# For production
npm run build
```

### 8. Storage Link

```bash
php artisan storage:link
```

### 9. Set Permissions (Linux/Mac)

```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

## Running the Application

### Development Server

```bash
php artisan serve
```

The application will be available at `http://localhost:8000`

### Using Laragon (Windows)

If you're using Laragon, simply:

1. Place the project in `c:\laragon\www\SILUK`
2. Start Laragon
3. Access via `http://siluk.test`

## Configuration

### Additional Settings

-   Configure mail settings in `.env` for email functionality
-   Set up queue workers if using background jobs
-   Configure caching if needed

### Environment Variables

Key environment variables to configure:

```env
APP_NAME=SILUK
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siluk_db
DB_USERNAME=root
DB_PASSWORD=

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure storage and bootstrap/cache directories are writable
2. **Database Connection**: Verify database credentials in `.env`
3. **Missing Dependencies**: Run `composer install` and `npm install`
4. **Key Not Generated**: Run `php artisan key:generate`

### Useful Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan optimize
```

## Support

For support and questions, please contact the development team or refer to the project documentation.

## License

This project is proprietary software. All rights reserved.
