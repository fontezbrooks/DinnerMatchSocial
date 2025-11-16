# DinnerMatchSocial Project Overview

## Project Description
DinnerMatchSocial is a React Native mobile application for social dining experiences. Currently in early development phase with base Expo template structure.

## Technology Stack
- **Framework**: React Native 0.81.5 with Expo SDK ~54.0
- **Navigation**: Expo Router v6 (file-based routing)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **Platforms**: iOS, Android, Web

## Project Structure
- Monorepo architecture with apps/ workspace
- Frontend app located at apps/frontend/
- Component-based architecture with theme support
- Platform-specific code using .web.ts extensions

## Key Features (Current)
- Tab-based navigation structure
- Dark/Light theme support
- Modal presentation capability
- Reusable component library

## Development Status
- Base template implementation
- Documentation established (CLAUDE.md, PROJECT_INDEX.md)
- Ready for feature development

## Quick Commands
```bash
cd apps/frontend
bun install          # Install dependencies
bun start           # Start dev server
bun ios/android/web # Platform-specific launch
```