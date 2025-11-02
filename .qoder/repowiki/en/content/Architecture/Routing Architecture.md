# Routing Architecture

<cite>
**Referenced Files in This Document**   
- [layout.tsx](file://src/app/layout.tsx)
- [layout.tsx](file://src/app/(public)/layout.tsx)
- [layout.tsx](file://src/app/admin/layout.tsx)
- [layout.tsx](file://src/app/client/layout.tsx)
- [page.tsx](file://src/app/admin/page.tsx)
- [page.tsx](file://src/app/client/page.tsx)
- [signin/page.tsx](file://src/app/auth/signin/page.tsx)
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [route.ts](file://src/app/api/contact-messages/route.ts)
- [route.ts](file://src/app/api/content/about/route.ts)
- [route.ts](file://src/app/api/content/hero/reorder/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive architectural documentation for the Next.js App Router routing system in the smmm-system application. The system implements a role-based routing architecture with distinct interfaces for public visitors, administrators, and clients. The routing structure leverages Next.js App Router conventions with nested layouts, dynamic API routes, and authentication integration to create a secure, scalable application with shared UI components and role-specific experiences.

## Project Structure

```mermaid
graph TD
A[src/app] --> B[(public)]
A --> C[admin]
A --> D[client]
A --> E[api]
A --> F[auth/signin]
A --> G[layout.tsx]
B --> H[layout.tsx]
B --> I[page.tsx]
C --> J[layout.tsx]
C --> K[page.tsx]
C --> L[contact-messages]
C --> M[content]
C --> N[job-applications]
C --> O[profile]
C --> P[quote-requests]
D --> Q[layout.tsx]
D --> R[page.tsx]
D --> S[profile]
E --> T[auth/[...nextauth]]
E --> U[contact-messages]
E --> V[content]
E --> W[job-applications]
E --> X[profile]
E --> Y[quote-requests]
T --> Z[route.ts]
U --> AA[route.ts]
V --> AB[about/route.ts]
V --> AC[hero/reorder/route.ts]
V --> AD[hero/route.ts]
V --> AE[institutions/route.ts]
V --> AF[institutions/reorder/route.ts]
V --> AG[site-settings/route.ts]
```

**Diagram sources**
- [src/app](file://src/app)
- [src/app/admin](file://src/app/admin)
- [src/app/api](file://src/app/api)

**Section sources**
- [src/app](file://src/app)

## Core Components

The routing system in smmm-system is built around several core components that enable the nested layout structure, role-based access, and API route handling. The application uses Next.js App Router conventions with folder-based routing, layout components for shared UI, and API routes for server-side operations. The authentication system is integrated with NextAuth.js, providing secure access control across different user roles.

**Section sources**
- [layout.tsx](file://src/app/layout.tsx)
- [auth.ts](file://src/lib/auth.ts)
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts)

## Architecture Overview

```mermaid
graph TB
subgraph "Client-Side"
A[URL Request] --> B{Route Match}
B --> C[/admin/*]
B --> D[/client/*]
B --> E[/api/*]
B --> F[/public/*]
end
subgraph "Server-Side"
C --> G[AdminLayout]
D --> H[ClientLayout]
E --> I[API Route Handler]
F --> J[PublicLayout]
G --> K[Admin Dashboard]
H --> L[Client Dashboard]
I --> M[Database Operations]
J --> N[Public Page]
end
subgraph "Authentication"
O[NextAuth] --> P[Credentials Provider]
P --> Q[Prisma Adapter]
Q --> R[Database]
end
A --> O
O --> C
O --> D
O --> I
```

**Diagram sources**
- [layout.tsx](file://src/app/admin/layout.tsx)
- [layout.tsx](file://src/app/client/layout.tsx)
- [layout.tsx](file://src/app/(public)/layout.tsx)
- [auth.ts](file://src/lib/auth.ts)

## Detailed Component Analysis

### Layout Structure Analysis

The application implements a nested layout structure with four distinct layout levels: root, public, admin, and client. This hierarchical approach enables shared UI elements while maintaining role-specific interfaces.

#### Root Layout
```mermaid
classDiagram
class RootLayout {
+metadata : Metadata
+ThemeProvider
+DynamicFavicon
+Toaster
+children : React.ReactNode
}
RootLayout --> ThemeProvider : "uses"
RootLayout --> DynamicFavicon : "uses"
RootLayout --> Toaster : "uses"
```

**Diagram sources**
- [layout.tsx](file://src/app/layout.tsx#L1-L43)

**Section sources**
- [layout.tsx](file://src/app/layout.tsx#L1-L43)

#### Public Layout
```mermaid
classDiagram
class PublicLayout {
+children : React.ReactNode
}
PublicLayout --> RootLayout : "extends"
```

**Diagram sources**
- [layout.tsx](file://src/app/(public)/layout.tsx#L1-L8)

**Section sources**
- [layout.tsx](file://src/app/(public)/layout.tsx#L1-L8)

#### Admin Layout
```mermaid
classDiagram
class AdminLayout {
-pathname : string
-sidebarState : "open" | "collapsed" | "hidden"
-navigation : Array
+DashboardNavbar
+Breadcrumb
+children : React.ReactNode
+handleToggleSidebar()
+handleLogout()
}
AdminLayout --> DashboardNavbar : "uses"
AdminLayout --> Breadcrumb : "uses"
AdminLayout --> usePathname : "uses"
```

**Diagram sources**
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)

**Section sources**
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)

#### Client Layout
```mermaid
classDiagram
class ClientLayout {
-pathname : string
-sidebarState : "open" | "collapsed" | "hidden"
-navigation : Array
+DashboardNavbar
+Breadcrumb
+children : React.ReactNode
+handleToggleSidebar()
+handleLogout()
}
ClientLayout --> DashboardNavbar : "uses"
ClientLayout --> Breadcrumb : "uses"
ClientLayout --> usePathname : "uses"
```

**Diagram sources**
- [layout.tsx](file://src/app/client/layout.tsx#L1-L133)

**Section sources**
- [layout.tsx](file://src/app/client/layout.tsx#L1-L133)

### API Routing Analysis

The API routing system follows RESTful conventions with CRUD operations implemented for various resources. The system uses dynamic route segments and special route handlers to manage different operations.

#### Authentication Route Handling
```mermaid
sequenceDiagram
participant Client
participant AuthRoute
participant AuthLib
participant Database
Client->>AuthRoute : POST /api/auth/[...nextauth]
AuthRoute->>AuthLib : Forward to handlers
AuthLib->>Database : Validate credentials
Database-->>AuthLib : User data
AuthLib->>AuthLib : Hash password comparison
AuthLib->>AuthLib : Create JWT session
AuthLib-->>AuthRoute : Return response
AuthRoute-->>Client : Set session cookie
```

**Diagram sources**
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts#L1-L4)
- [auth.ts](file://src/lib/auth.ts#L1-L87)

**Section sources**
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts#L1-L4)
- [auth.ts](file://src/lib/auth.ts#L1-L87)

#### CRUD API Route Patterns
```mermaid
flowchart TD
Start([API Request]) --> MethodCheck{"HTTP Method?"}
MethodCheck --> |GET| HandleGet["Fetch data from database"]
MethodCheck --> |POST| HandlePost["Create new record"]
MethodCheck --> |PATCH| HandlePatch["Update existing record"]
MethodCheck --> |DELETE| HandleDelete["Delete record"]
HandleGet --> ValidateQuery["Validate query parameters"]
HandlePost --> ValidateBody["Validate request body"]
HandlePatch --> ValidateBody
HandleDelete --> ValidateParams["Validate ID parameter"]
ValidateQuery --> ExecuteQuery["Execute Prisma query"]
ValidateBody --> ProcessData["Process and sanitize data"]
ValidateParams --> ExecuteDelete["Execute delete operation"]
ProcessData --> ExecuteCreate["Create record in database"]
ExecuteQuery --> FormatResponse["Format response data"]
ExecuteCreate --> FormatResponse
ExecuteDelete --> FormatResponse
FormatResponse --> ReturnSuccess["Return 200/201 response"]
HandleError["Handle error"] --> ReturnError["Return 500 response"]
HandleGet --> HandleError
HandlePost --> HandleError
HandlePatch --> HandleError
HandleDelete --> HandleError
ReturnSuccess --> End([Response sent])
ReturnError --> End
```

**Diagram sources**
- [route.ts](file://src/app/api/contact-messages/route.ts#L1-L97)
- [route.ts](file://src/app/api/content/about/route.ts#L1-L190)

**Section sources**
- [route.ts](file://src/app/api/contact-messages/route.ts#L1-L97)
- [route.ts](file://src/app/api/content/about/route.ts#L1-L190)

### Request Flow Analysis

The request flow from URL to server component rendering involves several stages, including routing, authentication, data fetching, and client-side navigation.

```mermaid
sequenceDiagram
participant Browser
participant NextJS
participant Layout
participant Page
participant API
participant Database
Browser->>NextJS : Navigate to URL
NextJS->>NextJS : Match route pattern
NextJS->>Layout : Render layout component
alt Public Route
Layout-->>Browser : Render layout
NextJS->>Page : Render page component
Page-->>Browser : Render page
else Protected Route
NextJS->>Auth : Check authentication
Auth->>Database : Validate session
Database-->>Auth : User data
Auth-->>NextJS : Authentication status
alt Authenticated
NextJS->>Layout : Render role-specific layout
Layout-->>Browser : Render layout
NextJS->>Page : Render page component
Page->>API : Server-side data fetching
API->>Database : Query data
Database-->>API : Return data
API-->>Page : Return data
Page-->>Browser : Render page with data
else Not Authenticated
NextJS->>Browser : Redirect to sign-in
end
end
Browser->>Page : Client-side navigation
Page->>NextJS : usePathname hook
NextJS-->>Page : Current pathname
Page->>Page : Update UI based on route
```

**Diagram sources**
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)
- [page.tsx](file://src/app/admin/page.tsx#L1-L108)
- [page.tsx](file://src/app/client/page.tsx#L1-L136)
- [signin/page.tsx](file://src/app/auth/signin/page.tsx#L1-L194)

**Section sources**
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)
- [page.tsx](file://src/app/admin/page.tsx#L1-L108)
- [page.tsx](file://src/app/client/page.tsx#L1-L136)
- [signin/page.tsx](file://src/app/auth/signin/page.tsx#L1-L194)

## Dependency Analysis

```mermaid
graph LR
A[RootLayout] --> B[PublicLayout]
A --> C[AdminLayout]
A --> D[ClientLayout]
A --> E[ThemeProvider]
A --> F[DynamicFavicon]
A --> G[Toaster]
B --> H[Public Pages]
C --> I[Admin Pages]
C --> J[DashboardNavbar]
C --> K[Breadcrumb]
C --> L[usePathname]
D --> M[Client Pages]
D --> N[DashboardNavbar]
D --> O[Breadcrumb]
D --> P[usePathname]
Q[API Routes] --> R[Prisma]
Q --> S[NextRequest]
Q --> T[NextResponse]
U[Auth] --> V[CredentialsProvider]
U --> W[PrismaAdapter]
U --> X[bcryptjs]
U --> Y[JWT]
H --> A
I --> C
M --> D
J --> C
K --> C
N --> D
O --> D
```

**Diagram sources**
- [layout.tsx](file://src/app/layout.tsx#L1-L43)
- [layout.tsx](file://src/app/(public)/layout.tsx#L1-L8)
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)
- [layout.tsx](file://src/app/client/layout.tsx#L1-L133)
- [auth.ts](file://src/lib/auth.ts#L1-L87)

**Section sources**
- [layout.tsx](file://src/app/layout.tsx#L1-L43)
- [layout.tsx](file://src/app/(public)/layout.tsx#L1-L8)
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)
- [layout.tsx](file://src/app/client/layout.tsx#L1-L133)
- [auth.ts](file://src/lib/auth.ts#L1-L87)

## Performance Considerations

The routing architecture in smmm-system incorporates several performance optimizations:

1. **Server-Side Rendering (SSR)**: Pages are rendered on the server for improved initial load performance and SEO.
2. **Static Generation**: Public pages can be pre-rendered at build time for faster delivery.
3. **Client-Side Navigation**: The use of Next.js Link component enables fast client-side navigation without full page reloads.
4. **Code Splitting**: The App Router automatically splits code by route, loading only necessary components.
5. **Efficient Data Fetching**: API routes use Prisma for optimized database queries with proper indexing.
6. **Caching Strategies**: The application can implement caching for frequently accessed data to reduce database load.

The layout structure minimizes redundant rendering by sharing common UI components across routes while allowing for role-specific customizations. The use of React Server Components enables selective server-side rendering of data-intensive components.

## Troubleshooting Guide

Common routing issues and their solutions:

**Section sources**
- [auth.ts](file://src/lib/auth.ts#L1-L87)
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts#L1-L4)
- [layout.tsx](file://src/app/admin/layout.tsx#L1-L144)

## Conclusion

The Next.js App Router routing system in smmm-system provides a robust, scalable architecture for a multi-role web application. The nested layout structure enables efficient code reuse while maintaining distinct interfaces for different user roles. The folder-based routing convention provides clear organization and intuitive navigation patterns. The integration of NextAuth.js with Prisma provides secure authentication and authorization at the routing level. API routes follow RESTful principles with consistent CRUD patterns for data management. The system leverages modern Next.js features including server components, client-side navigation, and efficient data fetching to deliver a responsive user experience. Security considerations are addressed through role-based access control and proper session management. This architecture provides a solid foundation for future enhancements and scaling.