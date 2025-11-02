# User Interfaces

<cite>
**Referenced Files in This Document**   
- [button.tsx](file://src/components/ui/button.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [table.tsx](file://src/components/ui/table.tsx)
- [carousel.tsx](file://src/components/ui/carousel.tsx)
- [theme-provider.tsx](file://src/components/theme-provider.tsx)
- [dialog.tsx](file://src/components/ui/dialog.tsx)
- [input.tsx](file://src/components/ui/input.tsx)
- [select.tsx](file://src/components/ui/select.tsx)
- [switch.tsx](file://src/components/ui/switch.tsx)
- [navbar.tsx](file://src/components/landing/navbar.tsx)
- [about-tab.tsx](file://src/components/admin/content-tabs/about-tab.tsx)
- [client-logo-carousel.tsx](file://src/components/client/client-logo-carousel.tsx)
- [quote-request-modal.tsx](file://src/components/modals/quote-request-modal.tsx)
- [layout.tsx](file://src/app/layout.tsx)
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
The smmm-system UI component system is a comprehensive design system built on modern React practices, Tailwind CSS, and Radix UI primitives. The system is organized by feature areas (admin, client, landing, modals, ui) and provides a consistent, accessible, and responsive user interface across the application. This documentation details the organization, implementation, and usage guidelines for the various UI components, with a focus on design patterns, accessibility, and theming.

## Project Structure

The UI components are organized in a feature-based structure within the `src/components` directory:

```mermaid
graph TD
A[components/] --> B[admin/]
A --> C[client/]
A --> D[dashboard/]
A --> E[landing/]
A --> F[modals/]
A --> G[ui/]
A --> H[theme-provider.tsx]
A --> I[dom-error-boundary.tsx]
A --> J[scroll-to-top.tsx]
A --> K[dynamic-favicon.tsx]
G --> G1[button.tsx]
G --> G2[card.tsx]
G --> G3[form.tsx]
G --> G4[table.tsx]
G --> G5[carousel.tsx]
G --> G6[dialog.tsx]
G --> G7[input.tsx]
G --> G8[select.tsx]
G --> G9[switch.tsx]
B --> B1[content-tabs/]
B --> B2[contact-message-modal.tsx]
B --> B3[edit-job-application-modal.tsx]
E --> E1[about-section.tsx]
E --> E2[contact-section.tsx]
E --> E3[hero-section.tsx]
E --> E4[institutions-section.tsx]
E --> E5[navbar.tsx]
E --> E6[services-section.tsx]
F --> F1[career-modal.tsx]
F --> F2[kvkk-modal.tsx]
F --> F3[quote-request-modal.tsx]
F --> F4[terms-modal.tsx]
```

**Diagram sources**
- [src/components/admin](file://src/components/admin)
- [src/components/client](file://src/components/client)
- [src/components/landing](file://src/components/landing)
- [src/components/modals](file://src/components/modals)
- [src/components/ui](file://src/components/ui)

**Section sources**
- [src/components](file://src/components)

## Core Components

The UI component system is built around a set of core components in the `src/components/ui` directory that serve as the foundation for the entire application's user interface. These components are based on Radix UI primitives and styled with Tailwind CSS, providing a consistent, accessible, and customizable design system. The core components include buttons, cards, forms, tables, carousels, dialogs, inputs, selects, and switches, each designed with accessibility, responsiveness, and theming in mind.

**Section sources**
- [src/components/ui/button.tsx](file://src/components/ui/button.tsx)
- [src/components/ui/card.tsx](file://src/components/ui/card.tsx)
- [src/components/ui/form.tsx](file://src/components/ui/form.tsx)
- [src/components/ui/table.tsx](file://src/components/ui/table.tsx)

## Architecture Overview

The UI architecture follows a layered approach with atomic design principles, where primitive components in the `ui` directory are composed into more complex feature-specific components. The system leverages React's composition model, context API, and hooks to provide a flexible and maintainable component system. Theming is handled through the `theme-provider.tsx` component, which wraps the entire application and provides theme context to all components.

```mermaid
graph TD
A[Application] --> B[ThemeProvider]
B --> C[Landing Pages]
B --> D[Admin Dashboard]
B --> E[Client Portal]
C --> F[Landing Components]
D --> G[Admin Components]
E --> H[Client Components]
F --> I[UI Primitives]
G --> I
H --> I
C --> I
D --> I
E --> I
I --> J[Radix UI Primitives]
I --> K[Tailwind CSS]
style I fill:#f9f,stroke:#333,stroke-width:2px
style J fill:#bbf,stroke:#333,stroke-width:1px
style K fill:#bbf,stroke:#333,stroke-width:1px
classDef ui fill:#f9f,stroke:#333,stroke-width:2px;
classDef library fill:#bbf,stroke:#333,stroke-width:1px;
class I ui
class J,K library
```

**Diagram sources**
- [src/components/theme-provider.tsx](file://src/components/theme-provider.tsx)
- [src/app/layout.tsx](file://src/app/layout.tsx)
- [src/components/ui](file://src/components/ui)

## Detailed Component Analysis

### Button Component Analysis
The Button component is a versatile UI primitive that supports multiple variants, sizes, and states. It uses the `class-variance-authority` (cva) library to define variants and the `Slot` component from Radix UI to support the `asChild` prop for seamless integration with other components.

```mermaid
classDiagram
class Button {
+variant : "default"|"destructive"|"outline"|"secondary"|"ghost"|"link"
+size : "default"|"sm"|"lg"|"icon"|"icon-sm"|"icon-lg"
+asChild : boolean
+className : string
}
class buttonVariants {
+default : string
+destructive : string
+outline : string
+secondary : string
+ghost : string
+link : string
}
Button --> buttonVariants : uses
Button --> Slot : asChild
```

**Diagram sources**
- [src/components/ui/button.tsx](file://src/components/ui/button.tsx)

**Section sources**
- [src/components/ui/button.tsx](file://src/components/ui/button.tsx)

### Form Component Analysis
The Form component is built on `react-hook-form` and provides a structured way to handle form state, validation, and submission. It uses React context to manage form field state and provides accessible labels, descriptions, and error messages.

```mermaid
flowchart TD
A[Form] --> B[FormField]
A --> C[FormItem]
A --> D[FormLabel]
A --> E[FormControl]
A --> F[FormDescription]
A --> G[FormMessage]
B --> H[Controller]
C --> I[FormItemContext]
D --> J[useFormField]
E --> J
F --> J
G --> J
J --> K[formState]
J --> L[getFieldState]
style A fill:#f9f,stroke:#333,stroke-width:2px
style B fill:#f9f,stroke:#333,stroke-width:2px
style C fill:#f9f,stroke:#333,stroke-width:2px
style D fill:#f9f,stroke:#333,stroke-width:2px
style E fill:#f9f,stroke:#333,stroke-width:2px
style F fill:#f9f,stroke:#333,stroke-width:2px
style G fill:#f9f,stroke:#333,stroke-width:2px
classDef form fill:#f9f,stroke:#333,stroke-width:2px;
classDef context fill:#bbf,stroke:#333,stroke-width:1px;
class A,B,C,D,E,F,G form
class I,J context
```

**Diagram sources**
- [src/components/ui/form.tsx](file://src/components/ui/form.tsx)

**Section sources**
- [src/components/ui/form.tsx](file://src/components/ui/form.tsx)

### Table Component Analysis
The Table component provides a responsive and accessible table implementation with support for headers, footers, and pagination. It wraps the native table element with a scrollable container and applies consistent styling.

```mermaid
classDiagram
class Table {
+className : string
}
class TableHeader {
+className : string
}
class TableBody {
+className : string
}
class TableFooter {
+className : string
}
class TableRow {
+className : string
}
class TableHead {
+className : string
}
class TableCell {
+className : string
}
class TableCaption {
+className : string
}
Table --> TableHeader
Table --> TableBody
Table --> TableFooter
TableBody --> TableRow
TableRow --> TableHead
TableRow --> TableCell
Table --> TableCaption
```

**Diagram sources**
- [src/components/ui/table.tsx](file://src/components/ui/table.tsx)

**Section sources**
- [src/components/ui/table.tsx](file://src/components/ui/table.tsx)

### Carousel Component Analysis
The Carousel component is a complex, interactive component that supports touch gestures, keyboard navigation, autoplay, and continuous flow. It uses React context to manage state and provides error boundaries for robustness.

```mermaid
sequenceDiagram
participant User
participant Carousel
participant Context
participant Content
participant Item
User->>Carousel : MouseDown/TouchStart(x)
Carousel->>Context : dragStart(x)
Context->>Context : setStartX(x)
Context->>Context : setIsDragging(true)
User->>Carousel : MouseMove/TouchMove(x)
Carousel->>Context : dragMove(x)
Context->>Context : calculate translateX
Context->>Content : update transform
User->>Carousel : MouseUp/TouchEnd
Carousel->>Context : dragEnd()
Context->>Context : setIsDragging(false)
Context->>Context : check threshold
alt drag distance > threshold
Context->>Context : goToNext()/goToPrevious()
else
Context->>Context : reset translateX
end
Context->>Context : AutoPlay(setTimeout)
Context->>Context : goToNext()
Context->>Content : update transform
```

**Diagram sources**
- [src/components/ui/carousel.tsx](file://src/components/ui/carousel.tsx)

**Section sources**
- [src/components/ui/carousel.tsx](file://src/components/ui/carousel.tsx)

### Navigation Bar Analysis
The landing page navigation bar is a responsive component that adapts to different screen sizes, showing a horizontal menu on desktop and a collapsible menu on mobile devices.

```mermaid
flowchart TD
A[Navbar] --> B[Logo]
A --> C[Desktop Menu]
A --> D[Mobile Button]
A --> E[Mobile Menu]
B --> F[Link to Home]
B --> G[Site Settings]
C --> H[Link to Section]
C --> I[Link to Section]
C --> J[Link to Section]
C --> K[Sign In Button]
D --> L[Menu Icon]
L --> M[Click]
M --> E
E --> N[Link to Section]
E --> O[Link to Section]
E --> P[Sign In Button]
style A fill:#f9f,stroke:#333,stroke-width:2px
style C fill:#dfd,stroke:#333,stroke-width:1px
style E fill:#dfd,stroke:#333,stroke-width:1px
classDef navbar fill:#f9f,stroke:#333,stroke-width:2px;
classDef menu fill:#dfd,stroke:#333,stroke-width:1px;
class A navbar
class C,E menu
```

**Diagram sources**
- [src/components/landing/navbar.tsx](file://src/components/landing/navbar.tsx)

**Section sources**
- [src/components/landing/navbar.tsx](file://src/components/landing/navbar.tsx)

### Modal Component Analysis
The quote request modal demonstrates the use of the Dialog component for collecting user information with form validation and submission handling.

```mermaid
sequenceDiagram
participant User
participant Modal
participant Form
participant API
User->>Modal : Open Modal
Modal->>Modal : Show Dialog
Modal->>Form : Display Form
User->>Form : Fill Fields
Form->>Form : Validate Input
User->>Form : Submit
Form->>API : POST /api/quote-requests
API-->>Form : Response
alt Success
Form->>User : Show Success Toast
Form->>Modal : Close
Form->>Form : Reset
else Error
Form->>User : Show Error Toast
end
```

**Diagram sources**
- [src/components/modals/quote-request-modal.tsx](file://src/components/modals/quote-request-modal.tsx)

**Section sources**
- [src/components/modals/quote-request-modal.tsx](file://src/components/modals/quote-request-modal.tsx)

## Dependency Analysis

The UI component system has a clear dependency hierarchy, with primitive components depending on Radix UI and Tailwind CSS, and feature components depending on the primitive components.

```mermaid
graph TD
A[Tailwind CSS] --> B[UI Components]
C[Radix UI] --> B
B --> D[Feature Components]
D --> E[Pages]
E --> F[Application]
B --> G[class-variance-authority]
B --> H[react-hook-form]
B --> I[lucide-react]
style A fill:#bbf,stroke:#333,stroke-width:1px
style C fill:#bbf,stroke:#333,stroke-width:1px
style G fill:#bbf,stroke:#333,stroke-width:1px
style H fill:#bbf,stroke:#333,stroke-width:1px
style I fill:#bbf,stroke:#333,stroke-width:1px
style B fill:#f9f,stroke:#333,stroke-width:2px
style D fill:#9f9,stroke:#333,stroke-width:2px
style E fill:#9f9,stroke:#333,stroke-width:2px
style F fill:#9f9,stroke:#333,stroke-width:2px
classDef library fill:#bbf,stroke:#333,stroke-width:1px;
classDef ui fill:#f9f,stroke:#333,stroke-width:2px;
classDef feature fill:#9f9,stroke:#333,stroke-width:2px;
class A,C,G,H,I library
class B ui
class D,E,F feature
```

**Diagram sources**
- [package.json](file://package.json)
- [src/components/ui](file://src/components/ui)

**Section sources**
- [package.json](file://package.json)
- [src/components/ui](file://src/components/ui)

## Performance Considerations
The UI components are optimized for performance through several techniques:
- Use of React.memo for components that don't need to re-render frequently
- Proper cleanup of event listeners and timeouts in useEffect hooks
- Efficient state management with React context and useState
- Lazy loading of images in the carousel component
- Debouncing and throttling for expensive operations
- Proper handling of component unmounting to prevent memory leaks

The carousel component, in particular, implements several performance optimizations including requestAnimationFrame for smooth animations, proper cleanup of timeouts and animation frames, and memoization of expensive calculations.

## Troubleshooting Guide

Common issues and solutions for the UI components:

1. **Component not rendering**: Ensure the component is properly imported and the required dependencies are installed.
2. **Styling issues**: Check that Tailwind CSS is properly configured and the class names are correct.
3. **Accessibility problems**: Verify that all interactive elements have proper ARIA attributes and keyboard navigation works.
4. **Form validation not working**: Ensure react-hook-form is properly configured and the form components are correctly set up.
5. **Theme not applying**: Check that the ThemeProvider wraps the entire application and the theme attributes are correctly set.

For debugging, use the browser's developer tools to inspect the component hierarchy, check for console errors, and verify the applied CSS classes.

**Section sources**
- [src/components/ui](file://src/components/ui)
- [src/components/theme-provider.tsx](file://src/components/theme-provider.tsx)

## Conclusion
The smmm-system UI component system provides a robust, accessible, and maintainable foundation for the application's user interface. By following atomic design principles and leveraging modern React patterns, the system enables consistent and efficient UI development across different feature areas. The combination of Tailwind CSS for styling and Radix UI for accessible primitives ensures a high-quality user experience, while the theming system allows for easy customization and dark mode support.