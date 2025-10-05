# Exoplanet Analyzer - Architecture

## Component Structure

```
src/
├── App.tsx                      # Main application container
├── main.tsx                     # Application entry point
├── index.css                    # Global styles with Tailwind directives
├── types/
│   └── index.ts                 # Shared TypeScript interfaces
└── components/
    ├── index.ts                 # Component exports
    ├── AppBar.tsx               # Top navigation bar with menu
    ├── UploadCard.tsx           # File upload with drag & drop
    ├── ParametersCard.tsx       # Collapsible analysis parameters
    ├── AnalysisCard.tsx         # Analysis trigger with progress
    └── OutputCard.tsx           # Tabbed results display
```

## Type Definitions

**`types/index.ts`** - Shared interfaces:
- `UploadedFile` - File metadata and validation status
- `Parameters` - Analysis configuration parameters
- `AnalysisResult` - Detection results and metrics
- `defaultParameters` - Default parameter values

## Components

### AppBar
Top navigation with title, subtitle, and logout menu dropdown.

### UploadCard
- Drag & drop file upload
- Browse button
- Accepts: `.csv`, `.fits`, `.zip`
- Shows file metadata, hash, and validation chips

### ParametersCard
Collapsible accordion with:
- Detrend method select
- Window size slider (disabled when detrend=none)
- Period range, oversample, duration, phase bins inputs
- Model selection (LightGBM/CNN)
- Restore defaults & save preset actions

### AnalysisCard
- Primary analyze button
- Progress bar during analysis
- Streaming logs display
- Cancel button

### OutputCard
Tabbed interface with 6 tabs:
1. **Summary** - Classification badge, probability, metrics grid
2. **Time Series** - Raw/Detrended toggle with chart placeholder
3. **Periodogram** - Best period chip with chart placeholder
4. **Phase-Fold** - Show residuals toggle with chart placeholder
5. **Explainability** - SHAP bars (LGBM) or saliency map (CNN)
6. **JSON** - Formatted read-only output

Includes download menu (disabled) and "Run Again" button.

## Layout

**Desktop (≥1024px):**
- Left column (4/12): Upload → Parameters → Analysis
- Right column (8/12): Output

**Mobile (<1024px):**
- Vertical stack: Upload → Parameters → Analysis → Output

## HeroUI Components Used

From [@heroui/react](https://www.heroui.com/docs/guide/introduction):
- Navbar, NavbarBrand, NavbarContent, NavbarItem
- Card, CardHeader, CardBody
- Button, Input, Select, SelectItem, Slider
- Tabs, Tab, Chip, Switch, Progress
- Accordion, AccordionItem
- Dropdown, DropdownTrigger, DropdownMenu, DropdownItem

All components are properly typed and accessible by default via React Aria.

## Tech Stack

- **Vite** - Fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **HeroUI** - React component library
- **Framer Motion** - Animations (via HeroUI)

