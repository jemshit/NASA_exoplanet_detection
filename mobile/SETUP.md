# Mobile App Setup

## Installed Packages

### 1. **NativeWind** (Tailwind CSS for React Native)
- Configured with `tailwind.config.js`
- Metro bundler configured in `metro.config.js`
- Global styles in `global.css`
- TypeScript support via `nativewind-env.d.ts`
- **Matches frontend color scheme** (same as web app)

**Color Palette:**
- Light: `background`, `surface`, `primary-text`, `secondary-text`, `accent`
- Dark: `dark-background`, `dark-surface`, `dark-primary-text`, `dark-secondary-text`, `dark-accent`

**Usage:**
```tsx
import { View, Text } from 'react-native';

export function Example() {
  return (
    <View className="flex-1 p-4 bg-background dark:bg-dark-background">
      <Text className="text-primary-text dark:text-dark-primary-text text-xl font-bold">
        Hello NativeWind!
      </Text>
    </View>
  );
}
```

### 2. **Lucide React Native** (Icons)
- Modern icon library with 1000+ icons
- Tree-shakeable and performant
- Same icons as frontend web app

**Usage:**
```tsx
import { Rocket, Star, Settings } from 'lucide-react-native';

<Rocket size={24} color="#00BFFF" />
<Star size={32} color="#00BFFF" />
<Settings size={28} color="#3E4755" />
```

### 3. **Redux Toolkit** (State Management)
- Store configured in `store/index.ts`
- Custom hooks in `store/hooks.ts`
- Provider added to root layout
- **FIXED**: Added placeholder slice to resolve "valid reducer" error

**Usage:**
```tsx
import { useAppSelector, useAppDispatch } from '@/store/hooks';

export function Component() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.app);
  
  // Dispatch actions
  // dispatch(someAction());
}
```

### 4. **Axios** (HTTP Client)
- Configured in `services/api.ts`
- Base URL, timeouts, and interceptors set up

**Usage:**
```tsx
import api from '@/services/api';

// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', { data });
```

### 5. **Native Bottom Tabs**
- Using Expo Router's native tabs (experimental)
- Configured in `app/(tabs)/_layout.tsx`
- Uses platform-native tab bars (iOS/Android)

**Features:**
- SF Symbols on iOS
- Material icons on Android
- Native animations and gestures
- Better performance than JS tabs

## UI Architecture (Matching Frontend)

### Theme System
- **ThemeContext** (`contexts/ThemeContext.tsx`)
  - Supports light/dark/system modes
  - Syncs with device color scheme
  - Toggle between themes

### Components
- **AppHeader** - Top navigation bar with logo, theme toggle, user menu
- **Card** - Reusable card component matching frontend design
- **Custom screens** matching frontend layout

### Screens
1. **Analysis Tab** (`app/(tabs)/index.tsx`)
   - File upload card
   - Parameters configuration
   - Analysis controls
   
2. **Results Tab** (`app/(tabs)/explore.tsx`)
   - Verdict display
   - Classification probabilities
   - Key metrics
   - Quality checks

## Configuration Files

- `tailwind.config.js` - Tailwind with frontend color palette
- `metro.config.js` - Metro bundler with NativeWind
- `babel.config.js` - Babel preset for NativeWind
- `global.css` - Global Tailwind styles
- `nativewind-env.d.ts` - TypeScript types
- `store/index.ts` - Redux store (fixed)
- `services/api.ts` - Axios configuration
- `contexts/ThemeContext.tsx` - Theme management

## Running the App

```bash
# Clear cache and start (recommended after setup)
npm start -- --clear

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## UI Architecture

The mobile app uses **React Native StyleSheet** for styling (not NativeWind/Tailwind classes) to ensure reliable rendering. All components follow the same color scheme as the frontend web app.

### Color System
```typescript
const colors = {
  // Light mode
  background: '#F8FAFD',
  surface: '#FFFFFF',
  primaryText: '#0B0C10',
  secondaryText: '#3E4755',
  accent: '#00BFFF',
  border: '#E2E8F0',
  
  // Dark mode
  background: '#0B0C10',
  surface: '#242936',
  primaryText: '#E6F1FF',
  secondaryText: '#A9B4C9',
  accent: '#00BFFF',
  border: '#363D50',
};
```

### Component Pattern
```tsx
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#0B0C10' : '#F8FAFD' }
    ]}>
      {/* Content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

## Component Architecture

The mobile app now matches the frontend structure with:
- **Separated components** in `components/results/`
- **Type definitions** in `types/index.ts`
- **Mock data** in `data/mockData.ts`
- **Tabbed interface** using Material Top Tabs
- **Demo mode** with example switching

See [COMPONENTS.md](./COMPONENTS.md) for detailed documentation.

### New Dependencies
- `expo-sharing` - Share JSON files
- `expo-file-system` - File operations
- `@react-navigation/material-top-tabs` - Tab navigation
- `react-native-pager-view` - Pager for tabs

## Fixed Issues
✅ Redux store "valid reducer" error - Added placeholder app slice  
✅ UI properly styled with StyleSheet API matching frontend design  
✅ Theme context implemented with light/dark/system modes  
✅ Native tabs configured with proper icons  
✅ All components use proper React Native styling (no broken className)  
✅ Results screen matches frontend with tabs and separated components  
✅ Loads data from JSON (mockData.ts) like frontend  
✅ Demo mode with LightGBM/CNN examples

