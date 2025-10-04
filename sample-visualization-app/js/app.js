
// Global variables
let dataset = [];
let stats = {};

// Color schemes
const colors = {
	confirmed: '#28a745',
	candidate: '#ffc107',
	falsepositv: '#dc3545',
	primary: '#00d4ff',
	secondary: '#7c3aed'
};

/**
 * Main initialization function for the visualization app.
 * Loads CSV data, parses it, calculates statistics, and renders charts.
 * Handles loading and error states in the UI.
 * @async
 * @returns {Promise<void>}
 */
async function initializeVisualization() {
	try {
		showLoading(true);

		// Load and parse CSV data
		const csvData = await loadCSV('../data/dataset.csv');
		dataset = parseCSVData(csvData);

		// Calculate statistics
		stats = calculateStatistics(dataset);

		// Create visualizations
		createStatisticsOverview();
		createClassificationChart();
		createRadiusDistribution();
		createScatterPlot();
		createTemperaturePlot();
		createSNRChart();
		createTransitDepthPlot();

		showContent();

	} catch (error) {
		console.error('Error initializing visualization:', error);
		showError('Failed to load dataset: ' + error.message);
	}
}

//#region Data Loading and Parsing

/**
 * CSV loading function
 * Fetches CSV data from the given URL.
 * @param {string} url - The URL of the CSV file to load.
 * @returns {Promise<string>} - The raw CSV text.
 * @throws {Error} - If the fetch fails or the response is not OK.
 */
async function loadCSV(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const csvText = await response.text();
		return csvText;
	} catch (error) {
		throw new Error(`Failed to load CSV file: ${error.message}`);
	}
}

/**
 * Parses the CSV data and converts it into an array of objects.
 * @param {string} csvText - The raw CSV text to parse.
 * @returns {Array<Object>} - The parsed data as an array of objects.
 */
function parseCSVData(csvText) {
	const lines = csvText.trim().split('\n');
	const headers = lines[0].split(',');
	const data = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',');
		const row = {};

		headers.forEach((header, index) => {
			const value = values[index]?.trim();
			row[header] = value === '' || value === undefined ? null : value;
		});

		data.push(row);
	}

	return data;
}

//#endregion

//#region Statistics Calculation and Visualization Creation

/**
 * Calculates statistics from the dataset.
 * @param {Array<Object>} data - The dataset to analyze.
 * @returns {Object} - The calculated statistics.
 */
function calculateStatistics(data) {
	const stats = {
		total: data.length,
		confirmed: data.filter(d => d.koi_disposition === 'CONFIRMED').length,
		candidates: data.filter(d => d.koi_disposition === 'CANDIDATE').length,
		falsepositives: data.filter(d => d.koi_disposition === 'FALSE POSITIVE').length,
		avgPeriod: 0,
		avgRadius: 0,
		avgTemp: 0
	};

	// Calculate averages for valid numeric values
	const validPeriods = data.filter(d => d.koi_period && !isNaN(parseFloat(d.koi_period)));
	const validRadii = data.filter(d => d.koi_prad && !isNaN(parseFloat(d.koi_prad)));
	const validTemps = data.filter(d => d.koi_teq && !isNaN(parseFloat(d.koi_teq)));

	stats.avgPeriod = validPeriods.length > 0 ?
		(validPeriods.reduce((sum, d) => sum + parseFloat(d.koi_period), 0) / validPeriods.length).toFixed(1) : 0;

	stats.avgRadius = validRadii.length > 0 ?
		(validRadii.reduce((sum, d) => sum + parseFloat(d.koi_prad), 0) / validRadii.length).toFixed(1) : 0;

	stats.avgTemp = validTemps.length > 0 ?
		(validTemps.reduce((sum, d) => sum + parseFloat(d.koi_teq), 0) / validTemps.length).toFixed(0) : 0;

	return stats;
}

/**
 * Renders the statistics overview section in the UI.
 * Displays total objects, confirmed planets, candidates, false positives,
 * average orbital period, and average planet radius.
 *
 * @returns {void}
 */
function createStatisticsOverview() {
	const statsGrid = document.getElementById('statsGrid');
	statsGrid.innerHTML = `
		<div class="stat-card">
			<span class="stat-number">${stats.total}</span>
			<div class="stat-label">Total Objects</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.confirmed}</span>
			<div class="stat-label">Confirmed Planets</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.candidates}</span>
			<div class="stat-label">Planet Candidates</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.falsepositives}</span>
			<div class="stat-label">False Positives</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.avgPeriod}</span>
			<div class="stat-label">Avg Period (days)</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.avgRadius}</span>
			<div class="stat-label">Avg Radius (R⊕)</div>
		</div>
	`;
}

/**
 * Creates a doughnut chart to visualize the classification of exoplanet candidates.
 * The chart displays the proportions of confirmed planets, planet candidates, and false positives.
 * Utilizes Chart.js for rendering the chart.
 *
 * @returns {void}
 */
function createClassificationChart() {
	const ctx = document.getElementById('classificationChart').getContext('2d');

	new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Confirmed Planets', 'Planet Candidates', 'False Positives'],
			datasets: [{
				data: [stats.confirmed, stats.candidates, stats.falsepositives],
				backgroundColor: [colors.confirmed, colors.candidate, colors.falsepositv],
				borderWidth: 2,
				borderColor: '#ffffff'
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						color: '#ffffff',
						padding: 20,
						font: { size: 12 }
					}
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							const percentage = ((context.parsed / stats.total) * 100).toFixed(1);
							return `${context.label}: ${context.parsed} (${percentage}%)`;
						}
					}
				}
			}
		}
	});
}

/**
 * Creates a histogram to visualize the distribution of planet radii in the dataset.
 * Utilizes Chart.js for rendering the histogram.
 *
 * @returns {void}
 */
function createRadiusDistribution() {
	const ctx = document.getElementById('radiusChart').getContext('2d');

	// Get valid radius data
	const validRadii = dataset
		.filter(d => d.koi_prad && !isNaN(parseFloat(d.koi_prad)))
		.map(d => parseFloat(d.koi_prad));

	// Create bins
	const bins = createHistogramBins(validRadii, 10);

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: bins.labels,
			datasets: [{
				label: 'Number of Planets',
				data: bins.counts,
				backgroundColor: colors.primary,
				borderColor: colors.secondary,
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: { color: '#ffffff' }
				}
			},
			scales: {
				x: {
					title: {
						display: true,
						text: 'Planet Radius (Earth Radii)',
						color: '#ffffff'
					},
					ticks: { color: '#ffffff' },
					grid: { color: 'rgba(255,255,255,0.1)' }
				},
				y: {
					title: {
						display: true,
						text: 'Count',
						color: '#ffffff'
					},
					ticks: { color: '#ffffff' },
					grid: { color: 'rgba(255,255,255,0.1)' }
				}
			}
		}
	});
}

/**
 * Creates a scatter plot to visualize the relationship between orbital period and planet radius.
 * Points are color-coded based on their classification (confirmed, candidate, false positive).
 * Utilizes Plotly.js for rendering the scatter plot.
 *
 * @returns {void}
 */
function createScatterPlot() {
	const validData = dataset.filter(d =>
		d.koi_period && d.koi_prad &&
		!isNaN(parseFloat(d.koi_period)) &&
		!isNaN(parseFloat(d.koi_prad))
	);

	const traces = [
		{
			x: validData.filter(d => d.koi_disposition === 'CONFIRMED').map(d => parseFloat(d.koi_period)),
			y: validData.filter(d => d.koi_disposition === 'CONFIRMED').map(d => parseFloat(d.koi_prad)),
			mode: 'markers',
			type: 'scatter',
			name: 'Confirmed Planets',
			marker: { color: colors.confirmed, size: 8 }
		},
		{
			x: validData.filter(d => d.koi_disposition === 'CANDIDATE').map(d => parseFloat(d.koi_period)),
			y: validData.filter(d => d.koi_disposition === 'CANDIDATE').map(d => parseFloat(d.koi_prad)),
			mode: 'markers',
			type: 'scatter',
			name: 'Planet Candidates',
			marker: { color: colors.candidate, size: 8 }
		},
		{
			x: validData.filter(d => d.koi_disposition === 'FALSE POSITIVE').map(d => parseFloat(d.koi_period)),
			y: validData.filter(d => d.koi_disposition === 'FALSE POSITIVE').map(d => parseFloat(d.koi_prad)),
			mode: 'markers',
			type: 'scatter',
			name: 'False Positives',
			marker: { color: colors.falsepositv, size: 8 }
		}
	];

	const layout = {
		xaxis: {
			title: 'Orbital Period (days)',
			type: 'log',
			color: '#ffffff'
		},
		yaxis: {
			title: 'Planet Radius (Earth Radii)',
			type: 'log',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' },
		legend: {
			font: { color: '#ffffff' }
		}
	};

	Plotly.newPlot('scatterPlot', traces, layout, {responsive: true});
}

/**
 * Creates a scatter plot to visualize the relationship between stellar temperature and planet equilibrium temperature.
 * Points are color-coded based on their classification (confirmed, candidate, false positive).
 * Utilizes Plotly.js for rendering the scatter plot.
 *
 * @returns {void}
 */
function createTemperaturePlot() {
	const validData = dataset.filter(d =>
		d.koi_steff && d.koi_teq &&
		!isNaN(parseFloat(d.koi_steff)) &&
		!isNaN(parseFloat(d.koi_teq))
	);

	const trace = {
		x: validData.map(d => parseFloat(d.koi_steff)),
		y: validData.map(d => parseFloat(d.koi_teq)),
		mode: 'markers',
		type: 'scatter',
		text: validData.map(d => `${d.kepoi_name || 'Unknown'}<br>Classification: ${d.koi_disposition}`),
		marker: {
			color: validData.map(d => {
				switch(d.koi_disposition) {
					case 'CONFIRMED': return colors.confirmed;
					case 'CANDIDATE': return colors.candidate;
					default: return colors.falsepositv;
				}
			}),
			size: 10
		}
	};

	const layout = {
		xaxis: {
			title: 'Stellar Temperature (K)',
			color: '#ffffff'
		},
		yaxis: {
			title: 'Planet Equilibrium Temperature (K)',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' }
	};

	Plotly.newPlot('temperaturePlot', [trace], layout, {responsive: true});
}

/**
 * Creates a bar chart to visualize the average signal-to-noise ratio (SNR) for each classification.
 * Utilizes Chart.js for rendering the chart.
 *
 * @returns {void}
 */
function createSNRChart() {
	const ctx = document.getElementById('snrChart').getContext('2d');

	const snrData = {
		confirmed: dataset.filter(d => d.koi_disposition === 'CONFIRMED' && d.koi_model_snr && !isNaN(parseFloat(d.koi_model_snr))).map(d => parseFloat(d.koi_model_snr)),
		candidates: dataset.filter(d => d.koi_disposition === 'CANDIDATE' && d.koi_model_snr && !isNaN(parseFloat(d.koi_model_snr))).map(d => parseFloat(d.koi_model_snr)),
		falsepositives: dataset.filter(d => d.koi_disposition === 'FALSE POSITIVE' && d.koi_model_snr && !isNaN(parseFloat(d.koi_model_snr))).map(d => parseFloat(d.koi_model_snr))
	};

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Confirmed', 'Candidates', 'False Positives'],
			datasets: [{
				label: 'Average SNR',
				data: [
					snrData.confirmed.length > 0 ? snrData.confirmed.reduce((a, b) => a + b) / snrData.confirmed.length : 0,
					snrData.candidates.length > 0 ? snrData.candidates.reduce((a, b) => a + b) / snrData.candidates.length : 0,
					snrData.falsepositives.length > 0 ? snrData.falsepositives.reduce((a, b) => a + b) / snrData.falsepositives.length : 0
				],
				backgroundColor: [colors.confirmed, colors.candidate, colors.falsepositv],
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: { color: '#ffffff' }
				}
			},
			scales: {
				x: {
					ticks: { color: '#ffffff' },
					grid: { color: 'rgba(255,255,255,0.1)' }
				},
				y: {
					title: {
						display: true,
						text: 'Signal-to-Noise Ratio',
						color: '#ffffff'
					},
					ticks: { color: '#ffffff' },
					grid: { color: 'rgba(255,255,255,0.1)' }
				}
			}
		}
	});
}

/**
 * Creates a scatter plot to visualize the relationship between transit depth and planet radius.
 * Points are color-coded based on their classification (confirmed, candidate, false positive).
 * Utilizes Plotly.js for rendering the scatter plot.
 *
 * @returns {void}
 */
function createTransitDepthPlot() {
	const validData = dataset.filter(d =>
		d.koi_depth && d.koi_prad &&
		!isNaN(parseFloat(d.koi_depth)) &&
		!isNaN(parseFloat(d.koi_prad))
	);

	const traces = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'].map(disposition => {
		const filtered = validData.filter(d => d.koi_disposition === disposition);
		return {
			x: filtered.map(d => parseFloat(d.koi_depth)),
			y: filtered.map(d => parseFloat(d.koi_prad)),
			mode: 'markers',
			type: 'scatter',
			name: disposition.charAt(0) + disposition.slice(1).toLowerCase(),
			marker: {
				color: disposition === 'CONFIRMED' ? colors.confirmed :
						disposition === 'CANDIDATE' ? colors.candidate : colors.falsepositv,
				size: 8
			}
		};
	});

	const layout = {
		xaxis: {
			title: 'Transit Depth (ppm)',
			type: 'log',
			color: '#ffffff'
		},
		yaxis: {
			title: 'Planet Radius (Earth Radii)',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' },
		legend: {
			font: { color: '#ffffff' }
		}
	};

	Plotly.newPlot('transitDepthPlot', traces, layout, {responsive: true});
}

/**
 * Creates histogram bins for the given data.
 * @param {Array<number>} data - The numeric data to bin.
 * @param {number} numBins - The number of bins to create.
 * @returns {Object} - An object containing the bin labels and counts.
 */
function createHistogramBins(data, numBins) {
	const min = Math.min(...data);
	const max = Math.max(...data);
	const binSize = (max - min) / numBins;

	const bins = Array(numBins).fill(0);
	const labels = [];

	for (let i = 0; i < numBins; i++) {
		const binStart = min + i * binSize;
		const binEnd = min + (i + 1) * binSize;
		labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
	}

	data.forEach(value => {
		const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
		bins[binIndex]++;
	});

	return { labels, counts: bins };
}

//#endregion

//#region UI State Management

function showLoading(show) {
	document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
}

function showError(message) {
	document.getElementById('errorMessage').textContent = message;
	document.getElementById('errorState').style.display = 'block';
	document.getElementById('loadingState').style.display = 'none';
}

function showContent() {
	document.getElementById('loadingState').style.display = 'none';
	document.getElementById('errorState').style.display = 'none';
	document.getElementById('statsSection').style.display = 'block';
	document.getElementById('chartsSection').style.display = 'block';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeVisualization);

// Handle responsive resizing
window.addEventListener('resize', () => {
	// Redraw Plotly charts on window resize
	Plotly.Plots.resize('scatterPlot');
	Plotly.Plots.resize('temperaturePlot');
	Plotly.Plots.resize('transitDepthPlot');
});

//#endregion