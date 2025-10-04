# NASA Exoplanet Detection - Visualization Test

This directory contains a standalone HTML visualization page for testing and demonstrating the NASA Kepler Objects of Interest (KOI) dataset visualizations.

## 🚀 Features

### Interactive Visualizations
- **Classification Distribution** - Pie chart showing confirmed planets, candidates, and false positives
- **Planet Radius Distribution** - Histogram of planet sizes
- **Orbital Period vs Planet Radius** - Interactive scatter plot with logarithmic scales
- **Stellar vs Planet Temperature** - Correlation analysis
- **Signal-to-Noise Ratio** - Data quality metrics by classification
- **Transit Depth Analysis** - Relationship between transit depth and planet size

### Technologies Used
- **Chart.js** - For clean, responsive charts (pie, bar, histogram)
- **Plotly.js** - For interactive scientific plots (scatter, correlation)
- **D3.js** - For advanced data manipulation
- **Bootstrap 5** - For responsive design and styling

### Key Features
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🌙 **Dark space theme** - Professional astronomical styling
- 📊 **Real-time statistics** - Dynamic dataset overview
- 🎯 **Interactive tooltips** - Detailed information on hover
- 📈 **Logarithmic scales** - Proper scientific visualization
- ⚡ **Fast loading** - Optimized for performance

## 📂 File Structure

```
sample-visualization-app/
├── index.html          # Main visualization page
├── README.md           # This file
├── js/
│   ├── chart.js        # Chart.js visualizations
│   ├── plotly.js       # Plotly.js visualizations
│   ├── d3.js           # D3.js utilities
│   └── main.js         # Initialization and logic
├── css/
│   └── style.css       # Custom styles and Bootstrap overrides
└── data/
	└── dataset-sample.csv  # Sample KOI dataset
```

## 🔧 How to Use

### Option 1: Local File (Simple)
1. Open `index.html` directly in your web browser
2. The page will automatically load `../data/dataset-sample.csv`
3. Wait for visualizations to render

### Option 2: Local Server (Recommended)
For better performance and to avoid CORS issues:

```bash
# Navigate to the test directory
cd test/

# Start a simple HTTP server
# Python 3
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Or Node.js (if you have http-server installed)
npx http-server -p 8000

# Or PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 3: Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📊 Visualizations Explained

### 1. Dataset Overview
- **Total Objects**: Number of observations in the dataset
- **Confirmed Planets**: Validated exoplanets
- **Planet Candidates**: Objects requiring further validation
- **False Positives**: Objects that mimic planetary signals
- **Average Values**: Mean orbital period and planet radius

### 2. Classification Distribution
Shows the proportion of each classification type in the dataset. This helps understand:
- Dataset balance for machine learning
- Success rate of planet detection
- Distribution of validation outcomes

### 3. Planet Radius Distribution
Histogram showing the size distribution of detected planets:
- Most planets are small (Earth to Neptune sized)
- Larger planets are easier to detect but less common
- Detection bias toward larger planets

### 4. Period vs Radius Scatter Plot
Interactive plot revealing:
- **Hot Jupiters**: Large planets with short periods
- **Earth-like**: Small planets with moderate periods
- **Detection limits**: Gaps in the data show observational biases
- **Color coding**: Different classifications show validation patterns

### 5. Temperature Correlation
Compares stellar temperature to planet equilibrium temperature:
- Hotter stars generally host hotter planets
- Orbital distance affects planet temperature
- Habitability zone analysis

### 6. Signal-to-Noise Analysis
Shows data quality by classification:
- Higher SNR generally leads to confirmation
- False positives can have high SNR (systematic errors)
- Quality thresholds for validation

### 7. Transit Depth Analysis
Relationship between observable transit depth and planet size:
- Deeper transits indicate larger planets
- Detection sensitivity limits
- Validation confidence correlation

## 🎨 Customization

### Modifying Colors
Edit the `colors` object in the JavaScript:
```javascript
const colors = {
    confirmed: '#28a745',    // Green for confirmed
    candidate: '#ffc107',    // Yellow for candidates
    falsepositv: '#dc3545',  // Red for false positives
    primary: '#00d4ff',      // Primary accent
    secondary: '#7c3aed'     // Secondary accent
};
```

### Adding New Charts
1. Add a new card in the HTML structure
2. Create a canvas or div for the chart
3. Implement the chart function in JavaScript
4. Call it in `initializeVisualization()`

### Changing Data Source
Modify the CSV path in the `initializeVisualization()` function:
```javascript
const csvData = await loadCSV('../data/your-dataset.csv');
```

## 🐛 Troubleshooting

### Common Issues

**Charts not loading:**
- Ensure the dataset path is correct
- Check browser console for errors
- Verify CSV file is accessible

**CORS errors:**
- Use a local server instead of opening file directly
- Check that the CSV file path is relative and correct

**Responsive issues:**
- Refresh the page after resizing window
- Charts automatically resize on window resize events

**Performance issues:**
- The page is optimized for small datasets (5-1000 rows)
- For larger datasets, consider data sampling or pagination

### Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **JavaScript**: ES6+ features used
- **CSS**: Flexbox and Grid layouts

## 📈 Performance Notes

- **Dataset size**: Optimized for sample datasets (5-1000 rows)
- **Loading time**: ~2-3 seconds for typical datasets
- **Memory usage**: Efficient chart rendering
- **Mobile performance**: Responsive charts with touch interactions

## 🔗 Links & Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [D3.js Documentation](https://d3js.org/)
- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- [Kepler Objects of Interest](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative)
