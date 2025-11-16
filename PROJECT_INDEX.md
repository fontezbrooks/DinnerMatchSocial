# Project Index: DinnerMatchSocial

Generated: 2025-11-16

## 📁 Project Structure

```
.
├── apps/                      # Application workspace
│   └── frontend/             # React Native mobile app
│       ├── app/             # Expo Router navigation
│       │   ├── (tabs)/     # Tab navigation screens
│       │   ├── +html.tsx   # HTML wrapper for web
│       │   ├── +not-found.tsx # 404 page
│       │   ├── _layout.tsx # Root layout
│       │   └── modal.tsx   # Modal screen
│       ├── assets/         # Images, fonts, icons
│       ├── components/     # Reusable UI components
│       ├── constants/      # App constants (Colors, etc.)
│       └── .vscode/        # VSCode settings
├── claudedocs/             # Claude-specific documentation
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License
├── README.md              # Project overview
└── CLAUDE.md              # Claude Code guidance
```

## 🚀 Entry Points

- **Mobile App**: `apps/frontend/app/_layout.tsx` - Expo Router entry with navigation stack
- **Main Entry**: `apps/frontend/package.json#main` - Points to expo-router/entry
- **Development**: `apps/frontend/` - Run `bun start` for development server
- **Platforms**: iOS (`bun ios`), Android (`bun android`), Web (`bun web`)

## 📦 Core Modules

### Module: Navigation (`app/`)
- **Root Layout**: `_layout.tsx` - Theme provider, font loading, navigation stack
- **Tab Layout**: `(tabs)/_layout.tsx` - Bottom tab navigation
- **Screens**: `index.tsx`, `two.tsx` - Tab screen content
- **Purpose**: File-based routing with Expo Router v6

### Module: Components (`components/`)
- **Themed Components**: `Themed.tsx` - Theme-aware UI components
- **Utilities**: `useColorScheme`, `useClientOnlyValue` - Custom hooks
- **UI Elements**: `EditScreenInfo`, `ExternalLink`, `StyledText`
- **Purpose**: Reusable React Native components with theme support

### Module: Constants (`constants/`)
- **Colors**: `Colors.ts` - Light/dark theme color definitions
- **Purpose**: Centralized app configuration and theming

## 🔧 Configuration

- `app.json`: Expo configuration (app name, icons, splash, platform settings)
- `tsconfig.json`: TypeScript strict mode, path aliases (`@/*`)
- `package.json`: Dependencies and scripts
- `.gitignore`: Standard Node.js/JavaScript ignores
- `expo-env.d.ts`: Expo environment type definitions

## 📚 Documentation

- `README.md`: Project name placeholder
- `CLAUDE.md`: Development commands and architecture overview

## 🧪 Test Coverage

- Unit tests: 1 file (`components/__tests__/StyledText-test.js`)
- Test framework: React Test Renderer
- Coverage: Not configured

## 🔗 Key Dependencies

### Core Framework
- `expo`: ~54.0.23 - React Native framework
- `react`: 19.1.0 - UI library
- `react-native`: 0.81.5 - Mobile framework
- `expo-router`: ~6.0.14 - File-based navigation

### UI & Styling
- `@expo/vector-icons`: ^15.0.3 - Icon library
- `react-native-reanimated`: ~4.1.1 - Animations
- `react-native-safe-area-context`: ~5.6.0 - Safe area handling

### Development
- `typescript`: ~5.9.2 - Type safety
- `@types/react`: ~19.1.0 - React types
- `bun`: Package manager

## 📝 Quick Start

1. **Install dependencies**:
   ```bash
   cd apps/frontend
   bun install
   ```

2. **Start development server**:
   ```bash
   bun start
   ```

3. **Run on platform**:
   ```bash
   bun ios      # iOS Simulator
   bun android  # Android Emulator
   bun web      # Web Browser
   ```

## 🎯 Architecture Highlights

- **Monorepo Structure**: Apps workspace for future scalability
- **File-based Routing**: Expo Router with typed routes enabled
- **Theme System**: Automatic dark/light mode with React Navigation themes
- **New Architecture**: React Native 0.81.5 with new architecture enabled
- **Platform Support**: iOS, Android, Web with platform-specific code (`.web.ts`)
- **TypeScript**: Strict mode with path aliases for clean imports

## 📊 Project Metrics

- **Total Files**: ~15 source files (excluding node_modules)
- **Languages**: TypeScript/TSX (primary), JavaScript (tests)
- **Package Manager**: Bun (lockfile: bun.lock)
- **Node Version**: Not specified (using default)

## 🔍 Search Patterns

Common file patterns for navigation:
- Components: `apps/frontend/components/*.tsx`
- Screens: `apps/frontend/app/**/*.tsx`
- Constants: `apps/frontend/constants/*.ts`
- Tests: `apps/frontend/**/__tests__/*.js`