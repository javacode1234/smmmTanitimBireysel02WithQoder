# Role-Based Access Control

<cite>
**Referenced Files in This Document**   
- [auth.ts](file://src/lib/auth.ts)
- [route.ts](file://src/app/api/auth/[...nextauth]/route.ts)
- [admin/layout.tsx](file://src/app/admin/layout.tsx)
- [client/layout.tsx](file://src/app/client/layout.tsx)
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Role Definition and Database Schema](#role-definition-and-database-schema)
3. [NextAuth Session Extension via Module Augmentation](#nextauth-session-extension-via-module-augmentation)
4. [Role Flow from Database to Session](#role-flow-from-database-to-session)
5. [Protected Routing and Layout Components](#protected-routing-and-layout-components)
6. [API Route Access Control](#api-route-access-control)
7. [Common Issues and Debugging](#common-issues-and-debugging)
8. [Best Practices for Role Management](#best-practices-for-role-management)

## Introduction
This document details the role-based access control (RBAC) system implemented in the SMMM application. The system leverages NextAuth for authentication and extends its default session object to include user roles (admin, client). These roles are used to control access to different parts of the application, including protected routes, layout components, and API endpoints. The implementation ensures type safety through TypeScript module augmentation and maintains role persistence across sessions via JWT token callbacks.

**Section sources**
- [auth.ts](file://src/lib/auth.ts)
- [admin/layout.tsx](file://src/app/admin/layout.tsx)
- [client/layout.tsx](file://src/app/client/layout.tsx)

## Role Definition and Database Schema
The application defines two primary user roles: ADMIN and CLIENT. These roles are stored in the database as an ENUM type within the User table. The schema ensures data integrity by restricting role values to only these two options, with CLIENT as the default value for new users.

```sql
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `image` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
)
```

This database-level constraint ensures that only valid roles can be assigned to users, preventing invalid or malicious role assignments at the data layer.

**Diagram sources**
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql#L1-L15)

**Section sources**
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql#L1-L15)

## NextAuth Session Extension via Module Augmentation
The application extends the default NextAuth session object using TypeScript module augmentation. This allows the addition of custom properties (id and role) to the session user object while maintaining type safety throughout the codebase.

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}
```

This module augmentation is crucial for type safety, as it informs TypeScript about the extended structure of the session object. Components and API routes that access the session can now safely reference `session.user.role` and `session.user.id` without type errors. The augmentation applies to both the Session and User interfaces, ensuring consistency across the authentication flow.

**Section sources**
- [auth.ts](file://src/lib/auth.ts#L7-L17)

## Role Flow from Database to Session
The role information flows from the database through the authentication process and is attached to both the JWT token and the session object via NextAuth callbacks. This ensures role persistence across sessions and page reloads.

The process begins in the `authorize` callback, where the user is retrieved from the database and their role is included in the returned user object:

```typescript
async authorize(credentials) {
  // ... authentication logic
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}
```

Once authenticated, the role is attached to the JWT token in the `jwt` callback:

```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role
    token.id = user.id
  }
  return token
}
```

Finally, the role is transferred from the JWT token to the session object in the `session` callback:

```typescript
async session({ session, token }) {
  if (session?.user) {
    session.user.role = token.role as string
    session.user.id = token.id as string
  }
  return session
}
```

This three-step process ensures that the role information is securely stored in the JWT token and made available in the session object for easy access throughout the application.

**Section sources**
- [auth.ts](file://src/lib/auth.ts#L53-L85)

## Protected Routing and Layout Components
The application implements role-based access control through protected routing and layout components. Different layouts are provided for admin and client users, each with role-specific navigation options and UI elements.

The admin layout (`admin/layout.tsx`) includes navigation to administrative features such as content management, client management, and system settings:

```typescript
const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "İçerik Yönetimi", href: "/admin/content", icon: FileEdit },
  { name: "Müşteriler", href: "/admin/clients", icon: Users },
  // ... other admin routes
]
```

In contrast, the client layout (`client/layout.tsx`) provides access to client-specific features:

```typescript
const navigation = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "Profilim", href: "/client/profile", icon: User },
  { name: "Beyannamelerim", href: "/client/declarations", icon: FileText },
  // ... other client routes
]
```

These layout components are automatically rendered based on the user's role, providing a tailored experience for each user type. The role information from the session is used to determine which layout to display and what navigation options to present.

**Section sources**
- [admin/layout.tsx](file://src/app/admin/layout.tsx)
- [client/layout.tsx](file://src/app/client/layout.tsx)

## API Route Access Control
API routes implement role-based access control by checking the user's role before processing requests. Although the current implementation has TODO comments indicating that session-based user identification is pending, the pattern is established for securing API endpoints.

For example, the profile API route currently uses a temporary approach to identify users:

```typescript
// TODO: Get user ID from session
// For now, using the first admin user from database
const users = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  take: 1,
})
```

Once the session integration is complete, this will be replaced with a check against the authenticated user's role from the session. Other API routes like job applications and contact messages follow a similar pattern, where the user's role will determine their ability to read, create, update, or delete data.

The route structure itself provides a natural layer of access control, with admin-specific APIs under `/api/admin` and client-specific APIs under `/api/client`, though the actual authorization logic will be implemented within each route handler.

**Section sources**
- [profile/route.ts](file://src/app/api/profile/route.ts)
- [job-applications/route.ts](file://src/app/api/job-applications/route.ts)
- [contact-messages/route.ts](file://src/app/api/contact-messages/route.ts)

## Common Issues and Debugging
Several common issues can arise in the role-based access control system, particularly around role persistence and type safety.

**Role Persistence Across Sessions**: Since the role is stored in the JWT token, it's essential that the `jwt` and `session` callbacks are properly configured. If roles are missing after login, verify that both callbacks are correctly transferring the role from the user object to the token and then to the session.

**Type Safety with TypeScript Extensions**: Ensure that the module augmentation in `auth.ts` is correctly defined and that the file is imported in contexts where the session is accessed. Type errors may occur if the augmentation is not properly recognized by TypeScript.

**Debugging Missing Role Information**: When roles are not appearing in the session, check the following:
1. Verify the user in the database has a valid role assigned
2. Confirm the `authorize` callback returns the role property
3. Check that the `jwt` callback correctly assigns the role to the token
4. Ensure the `session` callback transfers the role from the token to the session object

The use of console logging in development can help trace the role through each step of the authentication flow.

**Section sources**
- [auth.ts](file://src/lib/auth.ts)
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql)

## Best Practices for Role Management
When extending the role-based access control system, follow these best practices:

**Adding New Roles**: To add new roles, update the ENUM definition in the database schema and regenerate the Prisma client. Then, extend any role-based logic in the application to handle the new role appropriately.

**Modifying Access Policies**: Centralize access policy logic in utility functions rather than scattering role checks throughout the codebase. For example, create a `canAccessResource` function that encapsulates complex permission logic.

**Security Considerations**: Always validate roles on the server side, never relying solely on client-side checks. The API routes should verify user roles before processing sensitive operations.

**Testing Role Transitions**: Implement comprehensive tests that verify role assignment, persistence across sessions, and proper access control for each role. Test edge cases such as role changes during an active session.

**Documentation**: Maintain clear documentation of role permissions and access policies to ensure consistency across the development team.

By following these practices, the RBAC system can be extended and maintained effectively as the application evolves.

**Section sources**
- [auth.ts](file://src/lib/auth.ts)
- [prisma/migrations/20251101125707_init/migration.sql](file://prisma/migrations/20251101125707_init/migration.sql)