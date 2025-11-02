# Content Management System

<cite>
**Referenced Files in This Document**   
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [about-tab.tsx](file://src/components/admin/content-tabs/about-tab.tsx)
- [services-tab.tsx](file://src/components/admin/content-tabs/services-tab.tsx)
- [workflow-tab.tsx](file://src/components/admin/content-tabs/workflow-tab.tsx)
- [pricing-tab.tsx](file://src/components/admin/content-tabs/pricing-tab.tsx)
- [testimonials-tab.tsx](file://src/components/admin/content-tabs/testimonials-tab.tsx)
- [team-tab.tsx](file://src/components/admin/content-tabs/team-tab.tsx)
- [faq-tab.tsx](file://src/components/admin/content-tabs/faq-tab.tsx)
- [route.ts](file://src/app/api/content/site-settings/route.ts)
- [route.ts](file://src/app/api/content/hero/route.ts)
- [route.ts](file://src/app/api/content/institutions/route.ts)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)
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
The Content Management System (CMS) in the smmm-system provides administrators with a comprehensive dashboard to manage all website content. This documentation details the implementation and usage of the CMS functionality, focusing on content management through the admin interface, API integration for data persistence, media handling, and extensibility patterns.

## Project Structure

```mermaid
graph TB
subgraph "Admin Interface"
A[Admin Dashboard]
B[Content Management]
C[Contact Messages]
D[Job Applications]
E[Quote Requests]
end
subgraph "Content Components"
F[Content Tabs]
G[Site Settings Tab]
H[Hero Section Tab]
I[Institutions Tab]
J[About Tab]
K[Services Tab]
L[Workflow Tab]
M[Pricing Tab]
N[Testimonials Tab]
O[Team Tab]
P[FAQ Tab]
end
subgraph "API Routes"
Q[Content API]
R[Site Settings Route]
S[Hero Route]
T[Institutions Route]
U[Institutions Reorder Route]
end
subgraph "Data Layer"
V[Prisma ORM]
W[Database]
end
A --> B
B --> F
F --> G
F --> H
F --> I
F --> J
F --> K
F --> L
F --> M
F --> N
F --> O
F --> P
Q --> R
Q --> S
Q --> T
Q --> U
G --> R
H --> S
I --> T
I --> U
V --> W
R --> V
S --> V
T --> V
U --> V
```

**Diagram sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)

**Section sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [components/admin/content-tabs](file://src/components/admin/content-tabs)

## Core Components

The CMS functionality is organized around several core components that enable administrators to manage different aspects of website content. The system follows a modular architecture with dedicated tabs for each content type, API routes for data persistence, and a consistent user interface pattern across all content management sections.

**Section sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [components/admin/content-tabs](file://src/components/admin/content-tabs)

## Architecture Overview

```mermaid
graph TD
A[Admin Dashboard] --> B[Content Management Page]
B --> C[Content Tabs Component]
C --> D[Site Settings Tab]
C --> E[Hero Section Tab]
C --> F[Institutions Tab]
C --> G[About Tab]
C --> H[Services Tab]
C --> I[Workflow Tab]
C --> J[Pricing Tab]
C --> K[Testimonials Tab]
C --> L[Team Tab]
C --> M[FAQ Tab]
D --> N[Site Settings API]
E --> O[Hero API]
F --> P[Institutions API]
F --> Q[Institutions Reorder API]
G --> R[About API]
N --> S[Prisma ORM]
O --> S
P --> S
Q --> S
R --> S
S --> T[Database]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#f96,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#6f9,stroke:#333
style J fill:#6f9,stroke:#333
style K fill:#6f9,stroke:#333
style L fill:#6f9,stroke:#333
style M fill:#6f9,stroke:#333
style N fill:#9cf,stroke:#333
style O fill:#9cf,stroke:#333
style P fill:#9cf,stroke:#333
style Q fill:#9cf,stroke:#333
style R fill:#9cf,stroke:#333
style S fill:#cfc,stroke:#333
style T fill:#ffc,stroke:#333
```

**Diagram sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [about-tab.tsx](file://src/components/admin/content-tabs/about-tab.tsx)
- [route.ts](file://src/app/api/content/site-settings/route.ts)
- [route.ts](file://src/app/api/content/hero/route.ts)
- [route.ts](file://src/app/api/content/institutions/route.ts)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)

## Detailed Component Analysis

### Content Management Dashboard

The content management dashboard serves as the central interface for administrators to manage all website content. It implements a tab-based navigation system that organizes different content types into separate sections.

```mermaid
graph TD
A[Content Management Page] --> B[Tabs Component]
B --> C[Site Settings Tab]
B --> D[Hero Tab]
B --> E[Clients/Institutions Tab]
B --> F[About Tab]
B --> G[Services Tab]
B --> H[Workflow Tab]
B --> I[Pricing Tab]
B --> J[Testimonials Tab]
B --> K[Team Tab]
B --> L[FAQ Tab]
C --> M[Settings Icon]
D --> N[Home Icon]
E --> O[Users Icon]
F --> P[Info Icon]
G --> Q[Briefcase Icon]
H --> R[Workflow Icon]
I --> S[DollarSign Icon]
J --> T[MessageSquare Icon]
K --> U[UserCircle Icon]
L --> V[HelpCircle Icon]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#6f9,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#6f9,stroke:#333
style J fill:#6f9,stroke:#333
style K fill:#6f9,stroke:#333
style L fill:#6f9,stroke:#333
```

**Diagram sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)

**Section sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)

### Content Tabs Implementation

The content tabs system provides a consistent interface for managing different types of website content. Each tab represents a specific content section and follows a similar pattern of data fetching, form handling, and persistence.

```mermaid
classDiagram
class ContentTab {
<<interface>>
+fetchData() void
+renderForm() JSX.Element
+handleSave() Promise~void~
}
class SiteSettingsTab {
-isLoading : boolean
-isSaving : boolean
-settingsId : string | null
-formData : SiteSettingsData
+fetchSettings() Promise~void~
+handleImageUpload(event : ChangeEvent) void
+handleSave() Promise~void~
}
class HeroSectionTab {
-isLoading : boolean
-isSaving : boolean
-heroId : string | null
-formData : HeroData
+fetchHeroData() Promise~void~
+handleImageUpload(event : ChangeEvent) void
+handleSave() Promise~void~
}
class InstitutionsTab {
-items : ClientLogo[]
-isLoading : boolean
-isModalOpen : boolean
-editingItem : ClientLogo | null
-formData : Partial~ClientLogo~
+fetchItems() Promise~void~
+handleLogoUpload(event : ChangeEvent) void
+handleSave() Promise~void~
+handleDelete(id : string) Promise~void~
+moveItem(item : ClientLogo, direction : 'up'|'down') void
+handleReorder(newItems : ClientLogo[]) Promise~void~
}
class AboutTab {
-aboutData : AboutData
-loading : boolean
-saving : boolean
-searchTerm : string
-currentPage : number
-editingFeature : Feature | null
-isDialogOpen : boolean
+fetchAboutData() Promise~void~
+handleTitleChange(event : ChangeEvent) void
+handleSubtitleChange(event : ChangeEvent) void
+handleDescriptionChange(event : ChangeEvent) void
+addFeature() void
+editFeature(feature : Feature) void
+saveFeature() void
+saveAboutData() Promise~void~
}
ContentTab <|-- SiteSettingsTab
ContentTab <|-- HeroSectionTab
ContentTab <|-- InstitutionsTab
ContentTab <|-- AboutTab
```

**Diagram sources**
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [about-tab.tsx](file://src/components/admin/content-tabs/about-tab.tsx)

**Section sources**
- [components/admin/content-tabs](file://src/components/admin/content-tabs)

### API Integration and Data Persistence

The CMS implements a RESTful API architecture for data persistence, with dedicated routes for each content type. The API routes handle CRUD operations and integrate with the Prisma ORM for database interactions.

```mermaid
sequenceDiagram
participant Admin as "Admin Dashboard"
participant API as "API Routes"
participant Prisma as "Prisma ORM"
participant DB as "Database"
Admin->>API : GET /api/content/site-settings
API->>Prisma : findFirst()
Prisma->>DB : Query Database
DB-->>Prisma : Return Settings
Prisma-->>API : Settings Object
API-->>Admin : JSON Response
Admin->>API : POST /api/content/site-settings
API->>Prisma : update() or create()
Prisma->>DB : Insert/Update Record
DB-->>Prisma : Success
Prisma-->>API : Settings Object
API-->>Admin : JSON Response
Admin->>API : POST /api/content/institutions/reorder
API->>Prisma : update() for each item
Prisma->>DB : Update Multiple Records
DB-->>Prisma : Success
Prisma-->>API : Success Response
API-->>Admin : JSON Response
```

**Diagram sources**
- [route.ts](file://src/app/api/content/site-settings/route.ts)
- [route.ts](file://src/app/api/content/hero/route.ts)
- [route.ts](file://src/app/api/content/institutions/route.ts)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)

**Section sources**
- [src/app/api/content](file://src/app/api/content)

### Reordering Functionality

The CMS implements reordering functionality for content sections that require custom ordering, such as the hero and institutions sections. This functionality allows administrators to control the display order of items through a drag-inspired interface.

```mermaid
flowchart TD
A[User Clicks Move Button] --> B{Determine Direction}
B --> |Up| C[Find Current Index]
B --> |Down| C
C --> D{Boundary Check}
D --> |Valid| E[Create New Array with Item Moved]
D --> |Invalid| F[Disable Button]
E --> G[Update Order Property for All Items]
G --> H[Call handleReorder Function]
H --> I[Send POST Request to /reorder]
I --> J[Update Database with New Order]
J --> K[Update Local State]
K --> L[Refresh UI with New Order]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#f96,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#9cf,stroke:#333
style J fill:#cfc,stroke:#333
style K fill:#cfc,stroke:#333
style L fill:#ffc,stroke:#333
```

**Diagram sources**
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)

**Section sources**
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)

### Form Validation and Media Management

The CMS implements form validation and media management through client-side validation and base64 encoding for image uploads. This approach simplifies the storage model by embedding images directly in the database.

```mermaid
flowchart TD
A[User Selects Image] --> B{Validate File Type}
B --> |Invalid| C[Show Error Message]
B --> |Valid| D{Validate File Size}
D --> |Too Large| E[Show Error Message]
D --> |Valid| F[Read File as Data URL]
F --> G[Preview Image]
G --> H[Store Base64 String in Form Data]
H --> I[Submit Form]
I --> J[Send Base64 to API]
J --> K[Store in Database]
style A fill:#f9f,stroke:#333
style B fill:#f96,stroke:#333
style C fill:#f66,stroke:#333
style D fill:#f96,stroke:#333
style E fill:#f66,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#9cf,stroke:#333
style J fill:#9cf,stroke:#333
style K fill:#cfc,stroke:#333
```

**Diagram sources**
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)

**Section sources**
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)

## Dependency Analysis

```mermaid
graph TD
A[Admin Dashboard] --> B[Content Management Page]
B --> C[UI Components]
B --> D[Content Tabs]
D --> E[Site Settings Tab]
D --> F[Hero Section Tab]
D --> G[Institutions Tab]
D --> H[About Tab]
E --> I[API Client]
F --> I
G --> I
H --> I
I --> J[Site Settings API]
I --> K[Hero API]
I --> L[Institutions API]
I --> M[About API]
J --> N[Prisma ORM]
K --> N
L --> N
M --> N
N --> O[Database]
P[Content Tabs] --> Q[UI Library Components]
Q --> R[Card]
Q --> S[Tabs]
Q --> T[Button]
Q --> U[Input]
Q --> V[Dialog]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#6f9,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#9cf,stroke:#333
style J fill:#9cf,stroke:#333
style K fill:#9cf,stroke:#333
style L fill:#9cf,stroke:#333
style M fill:#9cf,stroke:#333
style N fill:#cfc,stroke:#333
style O fill:#ffc,stroke:#333
style P fill:#6f9,stroke:#333
style Q fill:#6f9,stroke:#333
style R fill:#6f9,stroke:#333
style S fill:#6f9,stroke:#333
style T fill:#6f9,stroke:#333
style U fill:#6f9,stroke:#333
style V fill:#6f9,stroke:#333
```

**Diagram sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [components/admin/content-tabs](file://src/components/admin/content-tabs)
- [src/app/api/content](file://src/app/api/content)
- [lib/prisma.ts](file://src/lib/prisma.ts)

**Section sources**
- [content/page.tsx](file://src/app/admin/content/page.tsx)
- [components/admin/content-tabs](file://src/components/admin/content-tabs)
- [src/app/api/content](file://src/app/api/content)

## Performance Considerations

The CMS implementation includes several performance considerations to ensure a responsive user experience:

1. **Lazy Loading**: Content is fetched only when the corresponding tab is activated
2. **Optimized Image Handling**: Images are validated for size (maximum 2MB) and type before processing
3. **Efficient Reordering**: The reorder API updates multiple records in a single transaction using Promise.all
4. **Client-Side Filtering**: The institutions tab implements client-side filtering and pagination to reduce server requests
5. **Base64 Optimization**: Images are stored as base64 strings, eliminating the need for separate file storage but requiring careful size management

The system balances performance with simplicity by using base64 encoding for images, which avoids the complexity of file storage management but requires careful attention to image size limits to prevent database bloat.

**Section sources**
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [reorder/route.ts](file://src/app/api/content/institutions/reorder/route.ts)
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)

## Troubleshooting Guide

Common issues and their solutions in the CMS implementation:

1. **Image Upload Failures**: Ensure images are under 2MB and in supported formats (PNG, JPG, SVG)
2. **Reordering Not Persisting**: Verify that the reorder API is properly updating the order field in the database
3. **Content Not Displaying**: Check that the isActive flag is set to true for the content items
4. **API Connection Errors**: Verify that the Prisma client is properly configured and the database is accessible
5. **Form Validation Issues**: Ensure all required fields are filled before submission

The system includes comprehensive error handling with user-friendly toast notifications to guide administrators through common issues.

**Section sources**
- [site-settings-tab.tsx](file://src/components/admin/content-tabs/site-settings-tab.tsx)
- [hero-section-tab.tsx](file://src/components/admin/content-tabs/hero-section-tab.tsx)
- [institutions-tab.tsx](file://src/components/admin/content-tabs/institutions-tab.tsx)
- [about-tab.tsx](file://src/components/admin/content-tabs/about-tab.tsx)

## Conclusion

The Content Management System in smmm-system provides a comprehensive solution for administrators to manage website content through an intuitive dashboard interface. The system implements a modular architecture with dedicated tabs for different content types, consistent API patterns for data persistence, and user-friendly features for content management.

Key strengths of the implementation include:
- A unified tab-based interface for managing all content types
- Robust API integration with Prisma ORM for reliable data persistence
- Intuitive reordering functionality for content sections
- Comprehensive form validation and media management
- Responsive design with client-side filtering and pagination

The system is designed to be extensible, with a clear pattern for adding new content types by implementing additional tabs and API routes following the established conventions.