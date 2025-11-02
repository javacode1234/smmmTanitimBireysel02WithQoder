# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [prisma.config.ts](file://prisma.config.ts)
- [README.md](file://README.md)
- [prisma/seed.ts](file://prisma/seed.ts)
- [src/lib/db.ts](file://src/lib/db.ts)
- [src/lib/auth.ts](file://src/lib/auth.ts)
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql)
- [next.config.ts](file://next.config.ts)
- [tsconfig.json](file://tsconfig.json)
- [src/app/api/auth/[...nextauth]/route.ts](file://src/app/api/auth/[...nextauth]/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Development Workflow](#development-workflow)
7. [Running the Application](#running-the-application)
8. [Accessing the Application](#accessing-the-application)
9. [Common Issues and Solutions](#common-issues-and-solutions)
10. [Production Deployment](#production-deployment)

## Introduction

The SMMM System is a comprehensive management solution for Serbest Muhasebeci Mali Müşavir (SMMM) offices, built with modern web technologies. This system provides integrated solutions for client management, administrative tasks, and customer engagement through a professional web interface.

**Key Features:**
- **Next.js 16** with App Router architecture
- **MySQL** database with **Prisma ORM**
- **Role-based authentication** (ADMIN/CLIENT)
- **Modern UI** with TailwindCSS and shadcn/ui components
- **Admin Dashboard** for office management
- **Client Portal** for customer self-service
- **Content Management** for marketing materials
- **Email Integration** with Nodemailer

## Prerequisites

Before setting up the development environment, ensure you have the following prerequisites installed:

### Required Software
- **Node.js** (v20 or higher) - JavaScript runtime environment
- **npm** or **yarn** - Package managers
- **MySQL** (v8.0+) - Database server
- **Git** - Version control system

### Recommended Tools
- **Code Editor** (VS Code, WebStorm, etc.)
- **Postman** - API testing tool (optional)
- **MySQL Workbench** - Database management (optional)

## Project Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repository/smmm-system.git
cd smmm-system
```

### Step 2: Install Dependencies

Choose either npm or yarn for package installation:

```bash
# Using npm
npm install

# Using yarn
yarn install
```

**Section sources**
- [package.json](file://package.json#L1-L64)

### Step 3: Verify Installation

After installation completes, verify that all dependencies are properly installed:

```bash
npm run lint  # Run ESLint for code quality checks
```

## Environment Configuration

### Creating Environment Variables

Create a `.env.local` file in the project root directory:

```bash
touch .env.local
```

### Essential Environment Variables

Configure the following environment variables in your `.env.local` file:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/smmm_system"

# Authentication Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# SMTP Configuration (for email notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
SMTP_FROM="noreply@yourdomain.com"
```

### Environment Variable Details

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | MySQL connection string | `mysql://root:password@localhost:3306/smmm_system` |
| `NEXTAUTH_URL` | Base URL for authentication | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for JWT tokens | `your-secret-key-here` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email account username | `your-email@gmail.com` |
| `SMTP_PASS` | Email account password | `your-app-password` |
| `SMTP_FROM` | Default sender email | `noreply@yourdomain.com` |

### Security Best Practices

1. **Never commit `.env` files** to version control
2. Use strong, unique passwords for database and email accounts
3. Generate secure random strings for `NEXTAUTH_SECRET`
4. Use app-specific passwords for email services

## Database Setup

### Step 1: Initialize Prisma

Run the following command to initialize Prisma and create the database schema:

```bash
npx prisma db push
```

This command will:
- Create the database if it doesn't exist
- Apply all pending migrations
- Generate Prisma client types

### Step 2: Apply Database Migrations

Verify that all migrations have been applied successfully:

```bash
npx prisma migrate dev --name init
```

### Step 3: Generate Prisma Client

Generate the TypeScript client for database operations:

```bash
npx prisma generate
```

### Step 4: Seed the Database

Initialize the database with sample data and admin credentials:

```bash
npm run db:seed
```

**Section sources**
- [prisma/seed.ts](file://prisma/seed.ts#L1-L222)

### Database Schema Overview

The system uses a comprehensive database schema with the following key entities:

```mermaid
erDiagram
USER {
string id PK
string name
string email UK
string password
enum role ADMIN_CLIENT
string image
datetime createdAt
datetime updatedAt
}
CLIENT {
string id PK
string userId FK
string companyName
string taxNumber UK
string phone
text address
datetime createdAt
datetime updatedAt
}
ANNOUNCEMENT {
string id PK
string title
text message
enum type INFO_WARNING_REMINDER_URGENT
boolean targetAll
datetime createdAt
datetime updatedAt
}
DECLARATION {
string id PK
string clientId FK
string period
string title
string pdfUrl
datetime uploadedAt
datetime updatedAt
}
COLLECTION {
string id PK
string clientId FK
decimal amount
enum type INCOME_EXPENSE
datetime date
text note
datetime createdAt
datetime updatedAt
}
USER ||--|| CLIENT : "has"
USER ||--o{ ANNOUNCEMENT : "receives"
CLIENT ||--o{ DECLARATION : "owns"
CLIENT ||--o{ COLLECTION : "generates"
```

**Diagram sources**
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql#L1-L450)

## Development Workflow

### Available Scripts

The project includes several useful scripts for development:

| Script | Command | Purpose |
|--------|---------|---------|
| Development | `npm run dev` | Start development server |
| Build | `npm run build` | Compile for production |
| Start | `npm run start` | Run production build |
| Lint | `npm run lint` | Run ESLint code quality checks |
| Database Push | `npm run db:push` | Apply schema changes |
| Database Seed | `npm run db:seed` | Populate database with sample data |
| Database Studio | `npm run db:studio` | Open Prisma Studio UI |

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run code quality checks
npm run lint
```

### Prisma Studio

Explore and manage your database visually:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` for database management.

## Running the Application

### Step 1: Start the Development Server

```bash
npm run dev
```

The development server will start on `http://localhost:3000`.

### Step 2: Verify Application Startup

Check the terminal for successful startup messages:

```
Ready on http://localhost:3000
```

### Step 3: Access the Application

Open your browser and navigate to:
- **Public Site**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Client Portal**: `http://localhost:3000/client`

## Accessing the Application

### Test Credentials

The system comes pre-configured with test accounts for easy development and testing.

#### Admin Account
- **Email**: `admin@smmm.com`
- **Password**: `password123`
- **Access**: Full administrative privileges

#### Client Accounts
- **Email**: `mukellef@example.com`
- **Password**: `password123`
- **Company**: ABC Ticaret Ltd. Şti.

- **Email**: `firma@example.com`
- **Password**: `password123`
- **Company**: XYZ Danışmanlık A.Ş.

### Navigation Guide

```mermaid
flowchart TD
Start([Application Start]) --> PublicSite["Public Site<br/>http://localhost:3000"]
PublicSite --> SignIn["Sign In Page<br/>http://localhost:3000/auth/signin"]
SignIn --> AdminDashboard["Admin Dashboard<br/>http://localhost:3000/admin"]
SignIn --> ClientPortal["Client Portal<br/>http://localhost:3000/client"]
AdminDashboard --> AdminFeatures["Admin Features:<br/>• Content Management<br/>• Client Management<br/>• Quote Requests<br/>• Contact Messages"]
ClientPortal --> ClientFeatures["Client Features:<br/>• Profile Management<br/>• Declaration Viewing<br/>• Announcement Access<br/>• Message History"]
```

**Section sources**
- [prisma/seed.ts](file://prisma/seed.ts#L10-L50)

## Common Issues and Solutions

### Port Conflicts

**Problem**: Port 3000 is already in use.

**Solution**:
1. Check for running processes:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # macOS/Linux
   lsof -i :3000
   ```

2. Kill the conflicting process or change the port:
   ```bash
   # Change port in .env.local
   PORT=3001
   ```

### Database Connection Issues

**Problem**: Cannot connect to MySQL database.

**Solution**:
1. Verify MySQL server is running
2. Check database credentials in `.env.local`
3. Ensure database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS smmm_system;
   ```

4. Test connection manually:
   ```bash
   mysql -u username -p -h localhost smmm_system
   ```

### Authentication Problems

**Problem**: Login fails or redirects incorrectly.

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set in `.env.local`
2. Check `NEXTAUTH_URL` matches your development URL
3. Clear browser cookies and cache
4. Restart the development server

### Migration Failures

**Problem**: Prisma migrations fail or get stuck.

**Solution**:
1. Reset database state:
   ```bash
   npx prisma db push --force-reset
   ```

2. Remove problematic migrations:
   ```bash
   rm -rf prisma/migrations/*
   npx prisma db push
   ```

### Email Configuration Issues

**Problem**: Email notifications not sending.

**Solution**:
1. Verify SMTP credentials in `.env.local`
2. Enable less secure apps (for Gmail):
   - Go to Google Account > Security
   - Enable "Less secure app access"
3. Use app-specific passwords for Gmail
4. Check firewall settings for SMTP ports

### TypeScript Compilation Errors

**Problem**: Type errors preventing compilation.

**Solution**:
1. Regenerate Prisma types:
   ```bash
   npx prisma generate
   ```

2. Clean TypeScript cache:
   ```bash
   rm -rf .next/cache
   ```

3. Restart development server

## Production Deployment

### Building for Production

Prepare the application for production deployment:

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Production Checklist

Before deploying to production, ensure:

1. **Environment Variables**: All production secrets configured
2. **Database**: Production database connected and migrated
3. **SSL/TLS**: HTTPS enabled for all endpoints
4. **CORS**: Proper CORS policies configured
5. **Rate Limiting**: API rate limiting implemented
6. **Monitoring**: Application monitoring and logging setup

### Deployment Commands

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run in production mode with custom port
PORT=8080 npm run start
```

### Performance Optimization

For production deployments, consider:

1. **Image Optimization**: Configure image optimization in `next.config.ts`
2. **Code Splitting**: Leverage Next.js automatic code splitting
3. **Caching**: Implement appropriate caching strategies
4. **CDN**: Use CDN for static assets
5. **Database Optimization**: Optimize database queries and indexes

### Monitoring and Maintenance

Set up monitoring for:
- Application health checks
- Database performance
- Error tracking
- User analytics
- Resource utilization

**Section sources**
- [package.json](file://package.json#L5-L11)
- [next.config.ts](file://next.config.ts#L1-L18)