# NASA Exoplanet Detection - Mobile App

React Native mobile application for exoplanet detection analysis, built with Expo Router and matching the frontend web app design.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Lint code
npm run lint
```

## 📱 Features

- ✅ **Native Bottom Tabs** - Platform-native tab navigation (iOS & Android)
- ✅ **Dark Mode** - Fully themed light/dark mode support
- ✅ **Demo Mode** - Test with LightGBM & CNN examples
- ✅ **Analysis Interface** - Upload, configure parameters, run analysis
- ✅ **Results Display** - Verdict, metrics, probabilities, quality checks
- ✅ **JSON Export** - Share analysis results
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Theme Toggle** - Light/Dark/System modes

## 🏗️ Architecture

```
mobile/
├── app/
│   ├── _layout.tsx               # Root layout (Redux + Theme providers)
│   ├── modal.tsx                 # Modal screen
│   └── (tabs)/
│       ├── _layout.tsx           # Native tabs configuration
│       ├── index.tsx             # Analysis screen
│       └── explore.tsx           # Results screen (tabbed)
├── components/
│   ├── AppHeader.tsx             # Navigation header
│   ├── Card.tsx                  # Reusable card component
│   └── results/                  # Result display components
│       ├── VerdictCard.tsx
│       ├── KPITiles.tsx
│       ├── ClassProbabilityBars.tsx
│       ├── QualityChecks.tsx
│       ├── SummaryTab.tsx
│       ├── JSONTab.tsx
│       └── index.ts
├── contexts/
│   └── ThemeContext.tsx          # Theme management
├── data/
│   └── mockData.ts               # Mock analysis data
├── types/
│   └── index.ts                  # TypeScript interfaces
├── store/
│   ├── index.ts                  # Redux store
│   └── hooks.ts                  # Typed hooks
└── services/
    └── api.ts                    # Axios configuration
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Installation and configuration guide
- **[COMPONENTS.md](./COMPONENTS.md)** - Component architecture
- **[CHANGES.md](./CHANGES.md)** - Recent changes and migration
- **[DARK-MODE-FIXES.md](./DARK-MODE-FIXES.md)** - Dark mode improvements
- **[UI-FIXES.md](./UI-FIXES.md)** - UI fixes applied

## 🎨 Design System

### Color Palette

**Light Mode:**
```
Background: #F8FAFD
Surface: #FFFFFF
Primary Text: #0B0C10
Secondary Text: #3E4755
Accent: #00BFFF
Border: #E2E8F0
```

**Dark Mode:**
```
Background: #0B0C10
Surface: #242936
Primary Text: #E6F1FF
Secondary Text: #A9B4C9
Accent: #00BFFF
Border: #363D50
```

### Typography

- Headers: 18-20px, weight 600-700
- Body: 14-16px, weight 400-500
- Labels: 11-13px, weight 500-600
- Code: 11px monospace

## 🛠️ Tech Stack

- **Framework**: React Native 0.81 + Expo SDK 54
- **Navigation**: Expo Router 6 with Native Tabs
- **State**: Redux Toolkit
- **HTTP**: Axios
- **Icons**: Lucide React Native
- **Language**: TypeScript
- **Styling**: React Native StyleSheet

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.12",
  "expo-router": "~6.0.10",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "@reduxjs/toolkit": "^2.9.0",
  "axios": "^1.12.2",
  "lucide-react-native": "^0.544.0",
  "@react-navigation/material-top-tabs": "^7.4.0",
  "expo-sharing": "^13.0.1",
  "react-redux": "^9.2.0"
}
```

## 🎯 Usage

### Analysis Screen
1. Tap "Upload" to select a CSV file
2. Choose model (LightGBM or CNN)
3. Configure parameters
4. Tap "Run Analysis"

### Results Screen
1. View verdict and confidence
2. Check key metrics
3. Review classification probabilities
4. Inspect quality checks
5. Export JSON results

### Theme Toggle
Tap the theme icon in the header:
- ☀️ Light mode
- 🌙 Dark mode
- 📱 System mode

### Demo Mode
Toggle demo mode to test with:
- **LightGBM Example**: CONFIRMED planet (92%)
- **CNN Example**: FALSE_POSITIVE (70%)

## 🧪 Development

### Run Tests
```bash
npm run lint
```

### Clear Cache
```bash
npm start -- --clear
```

### Build
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 🌐 Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Known Issues

- Chart visualizations not yet implemented
- Phase-fold tab pending
- Explainability tab pending
- CSV/PDF export pending

See [COMPONENTS.md](./COMPONENTS.md) for roadmap.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Test on both iOS and Android
5. Submit pull request

## 📄 License

This project is part of the NASA Exoplanet Detection system.

## 🔗 Related

- **Frontend**: `../frontend/` - Web application
- **Backend**: TBD - API server
- **Data**: `../data/` - Dataset files

---

**Version**: 1.0.0  
**Last Updated**: October 5, 2025  
**Status**: ✅ Production Ready
