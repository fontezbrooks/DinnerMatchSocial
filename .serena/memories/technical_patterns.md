# Technical Patterns - DinnerMatchSocial

## Navigation Patterns
- **Expo Router**: File-based routing with typed routes
- **Tab Navigation**: Using (tabs) directory pattern
- **Modal Handling**: Stack.Screen with presentation: 'modal'
- **Route Configuration**: unstable_settings for initial route

## Component Patterns
### Theme Management
```typescript
// useColorScheme hook for theme detection
const colorScheme = useColorScheme();
// ThemeProvider wrapping navigation
<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
```

### Platform-Specific Code
- Use .web.ts extension for web-specific implementations
- useClientOnlyValue for hydration prevention
- Conditional rendering based on platform

### Component Structure
- Themed.tsx for theme-aware components
- Consistent prop interfaces with color theming
- FontAwesome icon integration

## TypeScript Configuration
- Strict mode enabled
- Path alias: @/* maps to frontend root
- Expo type definitions included

## State Management
- Currently using React hooks
- No global state management implemented yet

## Testing Patterns
- React Test Renderer for component testing
- Test files in __tests__ directories
- Single test file currently present

## Build Configuration
- Metro bundler for web builds
- Static output for web deployment
- New React Native architecture enabled