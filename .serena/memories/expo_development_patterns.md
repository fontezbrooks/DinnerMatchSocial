# Expo Development Patterns & Learnings
**Last Updated**: 2025-11-16
**Framework**: React Native + Expo SDK 54

## Setup Patterns

### Dependency Management
- Use `bun` as primary package manager for Expo projects
- Remove outdated @expo/eslint-config if causing 404 errors
- Version compatibility warnings can often be non-blocking

### Shell Navigation Workarounds
```bash
# If cd commands fail with zoxide errors:
(cd /path && command)  # Subshell approach
pushd /path && command; popd  # Stack-based navigation
bun --cwd /path run script  # Direct cwd specification
```

### Running Expo Commands
```bash
# Preferred methods:
pushd apps/frontend && bun run start; popd
bun --cwd apps/frontend run start

# Platform-specific:
bun ios      # iOS Simulator
bun android  # Android Emulator  
bun web      # Web browser
```

## Environment Configuration

### Required .env Variables
- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY - Auth provider key
- EXPO_PUBLIC_API_URL - Backend API endpoint
- EXPO_PUBLIC_API_TIMEOUT - API timeout setting
- EXPO_PUBLIC_SCHEME - URL scheme for deep linking
- EXPO_PUBLIC_ENVIRONMENT - dev/staging/production
- EXPO_PUBLIC_ENABLE_SOCIAL_LOGIN - Feature flag
- EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS - Feature flag
- EXPO_PUBLIC_ENABLE_ANALYTICS - Feature flag

### Project Structure
```
apps/frontend/
├── app/           # Expo Router pages
├── components/    # Reusable UI components
├── constants/     # App constants & colors
├── contexts/      # React contexts
├── features/      # Feature modules
├── hooks/         # Custom hooks
├── services/      # API & external services
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

## Common Issues & Solutions

### Package Resolution Errors
- **Issue**: @expo/eslint-config 404 error
- **Solution**: Remove from devDependencies, use eslint-config-expo instead

### Navigation Command Errors
- **Issue**: zoxide command not found errors
- **Solution**: Use pushd/popd or subshells for directory changes

### Version Mismatches
- **Issue**: Package version warnings (e.g., eslint-config-expo)
- **Solution**: Often non-blocking, app runs despite warnings

## Performance Optimizations
- Metro bundler runs on http://localhost:8081
- Hot reloading enabled by default
- Use React Native new architecture (enabled in this project)

## Testing Approach
- Use Expo Go app for physical device testing
- Simulators/emulators for platform-specific testing
- Web testing for rapid iteration

## Development Workflow
1. Start dev server: `bun run start`
2. Choose platform (i/a/w keys or separate commands)
3. Make changes - hot reload applies automatically
4. Test on multiple platforms before committing

## Security Considerations
- All sensitive config in .env files (gitignored)
- Use EXPO_PUBLIC_ prefix for client-accessible vars
- Never commit .env files to repository