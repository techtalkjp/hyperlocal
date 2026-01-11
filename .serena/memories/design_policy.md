# UI/UX Design Policy

## Core Philosophy
Prioritize usability over visual aesthetics.

## Three Principles

### 1. Operations Don't Block Users
- Allow other operations during processing
- Run long operations in background
- Provide cancel buttons for time-consuming operations
- Avoid modal dialogs (use popovers/toasts instead)
- If using modals, support ESC key and backdrop click to close

### 2. Immediate Feedback
- Visual feedback for all interactions (clicks, inputs)
- Clear loading, success, and error states
- Show progress for long operations
- Minimize layout shift
- Consider Optimistic UI (but implement rollback)

### 3. Easy State Recovery
- Always provide navigation back to previous screen
- Restore scroll position when returning to lists
- Preserve form input content
- Provide undo functionality for destructive actions
- Prefer toast with "Undo" button over confirmation dialogs

## Implementation Patterns

### Loading Indicators
- Use `h-4 w-4` size for buttons
- Use `text-blue-500` color
- Standardized across the app

### Scroll Restoration
- Use React Router's native `ScrollRestoration` with `getKey`

### Error Handling
- Implement comprehensive error boundaries with `RouteErrorBoundary`

### Navigation
- Ensure breadcrumb navigation is always available
- Fetch from PlaceListing when needed for breadcrumbs

## Checklist
- Can users perform other operations during processing?
- Can time-consuming operations be cancelled?
- Is a modal really necessary? Can popovers substitute?
- Does clicking/input give immediate visual feedback?
- Is loading state clearly indicated?
- Is the back navigation clear?
- Are scroll positions and form inputs preserved?
- Are button labels specific and predictable?
- Do destructive operations have warnings or undo?
