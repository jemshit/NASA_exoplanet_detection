
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

		// Load the engineered CSV data
		const csvData = await loadCSV('../machine_learning/dataset/kepler_koi_engineered.csv');
		dataset = parseCSVData(csvData);

		console.log(`Loaded ${dataset.length} records from dataset`);
		console.log('Sample record:', dataset[0]);

		// Calculate statistics
		stats = calculateStatistics(dataset);
		console.log('Calculated stats:', stats);

		// Create all visualizations
		createStatisticsOverview();
		createClassificationChart();
		createRadiusDistribution();
		createScatterPlot();
		createTemperaturePlot();
		createTransitDepthPlot();
		createStellarClassDistribution();
		createErrorAnalysisChart();
		createDetectabilityChart();
		createPeriodRadiusRatioChart();
		createTransitCharacteristicsChart();
		createMultiplanetSystemsChart();
		createLogScaleComparisons();
		createCorrelationMatrix();

		showContent();

		// Force resize all Plotly charts after a short delay to ensure proper rendering
		setTimeout(() => {
			['scatterPlot', 'temperaturePlot', 'transitDepthPlot', 'detectabilityPlot', 'logScalePlot', 'correlationMatrix'].forEach(plotId => {
				if (document.getElementById(plotId)) {
					Plotly.Plots.resize(plotId);
				}
			});
		}, 500);
	} catch (error) {
		console.error('Error initializing visualization:', error);
		showError('Failed to load or process the dataset. Please check the console for details.');
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
		avgTemp: 0,
		avgSNR: 0,
		multiplanetSystems: 0,
		grazingTransits: 0,
		avgDetectability: 0,
		stellarClasses: {}
	};

	// Calculate averages for valid numeric values
	const validPeriods = data.filter(d => d.koi_period && !isNaN(parseFloat(d.koi_period)));
	const validRadii = data.filter(d => d.koi_prad && !isNaN(parseFloat(d.koi_prad)));
	const validTemps = data.filter(d => d.koi_teq && !isNaN(parseFloat(d.koi_teq)));
	const validSNR = data.filter(d => d.koi_model_snr && !isNaN(parseFloat(d.koi_model_snr)));
	const validDetectability = data.filter(d => d.detectability && !isNaN(parseFloat(d.detectability)));

	stats.avgPeriod = validPeriods.length > 0 ?
		(validPeriods.reduce((sum, d) => sum + parseFloat(d.koi_period), 0) / validPeriods.length).toFixed(1) : 0;

	stats.avgRadius = validRadii.length > 0 ?
		(validRadii.reduce((sum, d) => sum + parseFloat(d.koi_prad), 0) / validRadii.length).toFixed(1) : 0;

	stats.avgTemp = validTemps.length > 0 ?
		(validTemps.reduce((sum, d) => sum + parseFloat(d.koi_teq), 0) / validTemps.length).toFixed(0) : 0;

	stats.avgSNR = validSNR.length > 0 ?
		(validSNR.reduce((sum, d) => sum + parseFloat(d.koi_model_snr), 0) / validSNR.length).toFixed(1) : 0;

	stats.avgDetectability = validDetectability.length > 0 ?
		(validDetectability.reduce((sum, d) => sum + parseFloat(d.detectability), 0) / validDetectability.length).toFixed(3) : 0;

	// Count special characteristics
	stats.multiplanetSystems = data.filter(d => d.is_multiplanet === '1').length;
	stats.grazingTransits = data.filter(d => d.is_grazing_transit === '1').length;
	stats.longTransits = data.filter(d => d.is_long_transit === '1').length;

	// Count stellar classes
	data.forEach(d => {
		if (d.stellar_class && !isNaN(parseFloat(d.stellar_class))) {
			const stellarClass = parseFloat(d.stellar_class);
			stats.stellarClasses[stellarClass] = (stats.stellarClasses[stellarClass] || 0) + 1;
		}
	});

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
		<div class="stat-card">
			<span class="stat-number">${stats.avgTemp}</span>
			<div class="stat-label">Avg Temperature (K)</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.avgSNR}</span>
			<div class="stat-label">Avg SNR</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.multiplanetSystems}</span>
			<div class="stat-label">Multiplanet Systems</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.grazingTransits}</span>
			<div class="stat-label">Grazing Transits</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.longTransits}</span>
			<div class="stat-label">Long Transits</div>
		</div>
		<div class="stat-card">
			<span class="stat-number">${stats.avgDetectability}</span>
			<div class="stat-label">Avg Detectability</div>
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
			font: { color: '#ffffff' },
			orientation: 'h',
			x: 0,
			y: -0.15
		},
		margin: {
			l: 60,
			r: 20,
			t: 30,
			b: 100
		},
		autosize: true,
		width: null,
		height: null
	};

	const config = {
		responsive: true,
		displayModeBar: true,
		toImageButtonOptions: {
			format: 'png',
			filename: 'exoplanet_scatter',
			height: 500,
			width: 1200,
			scale: 1
		}
	};

	Plotly.newPlot('scatterPlot', traces, layout, config);

	// Force resize after plot creation
	setTimeout(() => {
		Plotly.Plots.resize('scatterPlot');
	}, 100);
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

	// Create separate traces for each classification
	const traces = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'].map(disposition => {
		const filteredData = validData.filter(d => d.koi_disposition === disposition);
		return {
			x: filteredData.map(d => parseFloat(d.koi_steff)),
			y: filteredData.map(d => parseFloat(d.koi_teq)),
			mode: 'markers',
			type: 'scatter',
			name: disposition,
			text: filteredData.map(d => `${d.kepoi_name || 'Unknown'}<br>Classification: ${d.koi_disposition}<br>Stellar Temp: ${d.koi_steff}K<br>Planet Temp: ${d.koi_teq}K`),
			marker: {
				color: disposition === 'CONFIRMED' ? colors.confirmed :
					   disposition === 'CANDIDATE' ? colors.candidate : colors.falsepositv,
				size: 8,
				opacity: 0.8
			}
		};
	});

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
		font: { color: '#ffffff' },
		legend: {
			font: { color: '#ffffff' },
			orientation: 'h',
			x: 0,
			y: -0.15
		},
		margin: {
			l: 60,
			r: 20,
			t: 30,
			b: 100
		},
		autosize: true,
		width: null,
		height: null
	};

	const config = {
		responsive: true,
		displayModeBar: true,
		toImageButtonOptions: {
			format: 'png',
			filename: 'stellar_planet_temperature',
			height: 500,
			width: 1200,
			scale: 1
		}
	};

	Plotly.newPlot('temperaturePlot', traces, layout, config);

	// Force resize after plot creation
	setTimeout(() => {
		Plotly.Plots.resize('temperaturePlot');
	}, 100);
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
	const binWidth = (max - min) / numBins;

	const bins = Array(numBins).fill(0);
	const labels = [];

	for (let i = 0; i < numBins; i++) {
		const binStart = min + i * binWidth;
		const binEnd = min + (i + 1) * binWidth;
		labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
	}

	data.forEach(value => {
		const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
		bins[binIndex]++;
	});

	return { labels, counts: bins };
}

/**
 * Creates a bar chart showing the distribution of stellar classes.
 */
function createStellarClassDistribution() {
	const ctx = document.getElementById('stellarClassChart').getContext('2d');

	// Count stellar classes
	const stellarClassCounts = {};
	dataset.forEach(d => {
		if (d.stellar_class && !isNaN(parseFloat(d.stellar_class))) {
			const stellarClass = `Class ${parseFloat(d.stellar_class)}`;
			stellarClassCounts[stellarClass] = (stellarClassCounts[stellarClass] || 0) + 1;
		}
	});

	const labels = Object.keys(stellarClassCounts);
	const data = Object.values(stellarClassCounts);

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [{
				label: 'Number of Objects',
				data: data,
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
						text: 'Stellar Class',
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
 * Creates a chart showing measurement error analysis across different parameters.
 */
function createErrorAnalysisChart() {
	const ctx = document.getElementById('errorAnalysisChart').getContext('2d');

	// Calculate average relative errors for each classification
	const errorData = {
		confirmed: [],
		candidates: [],
		falsepositives: []
	};

	dataset.forEach(d => {
		if (d.period_relative_error && d.depth_relative_error && d.total_uncertainty) {
			const periodError = parseFloat(d.period_relative_error);
			const depthError = parseFloat(d.depth_relative_error);
			const totalUncertainty = parseFloat(d.total_uncertainty);

			if (!isNaN(periodError) && !isNaN(depthError) && !isNaN(totalUncertainty)) {
				const avgError = (periodError + depthError + totalUncertainty) / 3;

				if (d.koi_disposition === 'CONFIRMED') {
					errorData.confirmed.push(avgError);
				} else if (d.koi_disposition === 'CANDIDATE') {
					errorData.candidates.push(avgError);
				} else if (d.koi_disposition === 'FALSE POSITIVE') {
					errorData.falsepositives.push(avgError);
				}
			}
		}
	});

	const avgErrors = [
		errorData.confirmed.length > 0 ? errorData.confirmed.reduce((a, b) => a + b) / errorData.confirmed.length : 0,
		errorData.candidates.length > 0 ? errorData.candidates.reduce((a, b) => a + b) / errorData.candidates.length : 0,
		errorData.falsepositives.length > 0 ? errorData.falsepositives.reduce((a, b) => a + b) / errorData.falsepositives.length : 0
	];

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Confirmed', 'Candidates', 'False Positives'],
			datasets: [{
				label: 'Average Measurement Error',
				data: avgErrors,
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
						text: 'Average Error',
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
 * Creates a scatter plot showing detectability vs SNR.
 */
function createDetectabilityChart() {
	const validData = dataset.filter(d =>
		d.detectability && d.koi_model_snr &&
		!isNaN(parseFloat(d.detectability)) &&
		!isNaN(parseFloat(d.koi_model_snr))
	);

	const traces = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'].map(disposition => {
		const filteredData = validData.filter(d => d.koi_disposition === disposition);
		return {
			x: filteredData.map(d => parseFloat(d.detectability)),
			y: filteredData.map(d => parseFloat(d.koi_model_snr)),
			mode: 'markers',
			type: 'scatter',
			name: disposition,
			marker: {
				color: disposition === 'CONFIRMED' ? colors.confirmed :
					   disposition === 'CANDIDATE' ? colors.candidate : colors.falsepositv,
				size: 8
			}
		};
	});

	const layout = {
		xaxis: {
			title: 'Detectability Score',
			color: '#ffffff'
		},
		yaxis: {
			title: 'Signal-to-Noise Ratio',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' },
		legend: {
			font: { color: '#ffffff' }
		}
	};

	Plotly.newPlot('detectabilityPlot', traces, layout, {responsive: true});
}

/**
 * Creates a histogram showing the distribution of period-radius ratios.
 */
function createPeriodRadiusRatioChart() {
	const ctx = document.getElementById('periodRadiusRatioChart').getContext('2d');

	const validRatios = dataset
		.filter(d => d.period_radius_ratio && !isNaN(parseFloat(d.period_radius_ratio)))
		.map(d => parseFloat(d.period_radius_ratio));

	const bins = createHistogramBins(validRatios, 12);

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: bins.labels,
			datasets: [{
				label: 'Number of Objects',
				data: bins.counts,
				backgroundColor: colors.secondary,
				borderColor: colors.primary,
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
						text: 'Period-Radius Ratio',
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
 * Creates a chart showing various transit characteristics.
 */
function createTransitCharacteristicsChart() {
	const ctx = document.getElementById('transitCharacteristicsChart').getContext('2d');

	const grazingCount = dataset.filter(d => d.is_grazing_transit === '1').length;
	const normalCount = dataset.filter(d => d.is_grazing_transit === '0').length;
	const longTransitCount = dataset.filter(d => d.is_long_transit === '1').length;
	const shortTransitCount = dataset.filter(d => d.is_long_transit === '0').length;

	new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Grazing Transits', 'Normal Transits', 'Long Transits', 'Short Transits'],
			datasets: [{
				data: [grazingCount, normalCount, longTransitCount, shortTransitCount],
				backgroundColor: [colors.falsepositv, colors.confirmed, colors.candidate, colors.primary],
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
						font: { size: 10 }
					}
				}
			}
		}
	});
}

/**
 * Creates a chart showing multiplanet system statistics.
 */
function createMultiplanetSystemsChart() {
	const ctx = document.getElementById('multiplanetChart').getContext('2d');

	const multiplanetCount = dataset.filter(d => d.is_multiplanet === '1').length;
	const singlePlanetCount = dataset.filter(d => d.is_multiplanet === '0').length;

	// Group by planet position for multiplanet systems
	const planetPositions = {};
	dataset.filter(d => d.is_multiplanet === '1' && d.koi_tce_plnt_num).forEach(d => {
		const position = parseFloat(d.koi_tce_plnt_num);
		if (!isNaN(position)) {
			planetPositions[position] = (planetPositions[position] || 0) + 1;
		}
	});

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Single Planet Systems', 'Multiplanet Systems'],
			datasets: [{
				label: 'Number of Systems',
				data: [singlePlanetCount, multiplanetCount],
				backgroundColor: [colors.primary, colors.secondary],
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
 * Creates a multi-dimensional scatter plot using logarithmic features.
 */
function createLogScaleComparisons() {
	const validData = dataset.filter(d =>
		d.koi_period_log && d.koi_prad_log && d.log_snr &&
		!isNaN(parseFloat(d.koi_period_log)) &&
		!isNaN(parseFloat(d.koi_prad_log)) &&
		!isNaN(parseFloat(d.log_snr))
	);

	const traces = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'].map(disposition => {
		const filteredData = validData.filter(d => d.koi_disposition === disposition);
		return {
			x: filteredData.map(d => parseFloat(d.koi_period_log)),
			y: filteredData.map(d => parseFloat(d.koi_prad_log)),
			mode: 'markers',
			type: 'scatter',
			name: disposition,
			text: filteredData.map(d => `SNR (log): ${parseFloat(d.log_snr).toFixed(2)}`),
			marker: {
				color: filteredData.map(d => parseFloat(d.log_snr)),
				colorscale: 'Viridis',
				size: 8,
				colorbar: {
					title: 'Log SNR',
					titlefont: { color: '#ffffff' },
					tickfont: { color: '#ffffff' }
				}
			}
		};
	});

	const layout = {
		xaxis: {
			title: 'Log(Orbital Period)',
			color: '#ffffff'
		},
		yaxis: {
			title: 'Log(Planet Radius)',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' },
		legend: {
			font: { color: '#ffffff' }
		}
	};

	Plotly.newPlot('logScalePlot', traces, layout, {responsive: true});
}

/**
 * Calculates the correlation coefficient between two arrays of numbers.
 * @param {Array<number>} x - First array of numbers
 * @param {Array<number>} y - Second array of numbers
 * @returns {number} - Correlation coefficient (-1 to 1)
 */
function calculateCorrelation(x, y) {
	const n = x.length;
	if (n !== y.length || n === 0) return 0;

	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = y.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
	const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
	const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

	const numerator = n * sumXY - sumX * sumY;
	const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

	return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Creates a correlation matrix heatmap for key numerical features.
 */
function createCorrelationMatrix() {
	// Select key numerical features for correlation analysis
	const numericFeatures = [
		'koi_period', 'koi_prad', 'koi_depth', 'koi_teq', 'koi_steff',
		'koi_slogg', 'koi_srad', 'koi_model_snr', 'koi_kepmag',
		'period_radius_ratio', 'detectability', 'total_uncertainty'
	];

	// Filter and prepare data
	const featureData = {};
	numericFeatures.forEach(feature => {
		featureData[feature] = dataset
			.map(d => parseFloat(d[feature]))
			.filter(val => !isNaN(val));
	});

	// Remove features with insufficient data
	const validFeatures = numericFeatures.filter(feature => featureData[feature].length > 100);

	// Calculate correlation matrix
	const correlationMatrix = [];
	const labels = validFeatures.map(feature => {
		// Clean up feature names for display
		return feature.replace('koi_', '').replace('_', ' ');
	});

	validFeatures.forEach((feature1, i) => {
		const row = [];
		validFeatures.forEach((feature2, j) => {
			// Get common valid indices for both features
			const validIndices = [];
			dataset.forEach((d, idx) => {
				const val1 = parseFloat(d[feature1]);
				const val2 = parseFloat(d[feature2]);
				if (!isNaN(val1) && !isNaN(val2)) {
					validIndices.push(idx);
				}
			});

			if (validIndices.length > 10) {
				const x = validIndices.map(idx => parseFloat(dataset[idx][feature1]));
				const y = validIndices.map(idx => parseFloat(dataset[idx][feature2]));
				row.push(calculateCorrelation(x, y));
			} else {
				row.push(0);
			}
		});
		correlationMatrix.push(row);
	});

	// Create the heatmap
	const trace = {
		z: correlationMatrix,
		x: labels,
		y: labels,
		type: 'heatmap',
		colorscale: [
			[0, '#440154'],     // Dark purple (negative correlation)
			[0.25, '#3b528b'],  // Blue
			[0.5, '#21908c'],   // Teal (no correlation)
			[0.75, '#5dc863'],  // Green
			[1, '#fde725']      // Yellow (positive correlation)
		],
		zmin: -1,
		zmax: 1,
		hoverongaps: false,
		text: correlationMatrix.map(row =>
			row.map(val => val.toFixed(3))
		),
		texttemplate: '%{text}',
		textfont: {
			size: 10,
			color: '#ffffff'
		},
		colorbar: {
			title: 'Correlation',
			titlefont: { color: '#ffffff' },
			tickfont: { color: '#ffffff' }
		}
	};

	const layout = {
		title: {
			text: 'Feature Correlation Matrix',
			font: { color: '#ffffff', size: 16 }
		},
		xaxis: {
			title: 'Features',
			color: '#ffffff',
			tickangle: 45
		},
		yaxis: {
			title: 'Features',
			color: '#ffffff'
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		font: { color: '#ffffff' },
		margin: { l: 100, r: 50, t: 80, b: 100 }
	};

	Plotly.newPlot('correlationMatrix', [trace], layout, {responsive: true});
}

//#endregion

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
	document.getElementById('aiEngineSection').style.display = 'block';
	document.getElementById('chartsSection').style.display = 'block';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeVisualization);

// Handle responsive resizing
window.addEventListener('resize', () => {
	// Redraw Plotly charts on window resize
	setTimeout(() => {
		Plotly.Plots.resize('scatterPlot');
		Plotly.Plots.resize('temperaturePlot');
		Plotly.Plots.resize('transitDepthPlot');
		Plotly.Plots.resize('detectabilityPlot');
		Plotly.Plots.resize('logScalePlot');
		Plotly.Plots.resize('correlationMatrix');
	}, 100);
});

//#endregion