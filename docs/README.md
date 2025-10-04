# 2025 NASA Space Apps Challenge

You can find the complete source code, documentation, and updates for this project in our [GitHub repository](https://github.com/jemshit/NASA_exoplanet_detection). The repository contains instructions for setup, usage, and contribution guidelines. All development, issue tracking, and collaboration for the challenge will be managed through this repo.

- Project: `A World Away: Hunting for Exoplanets with AI`
- Team: `Outlander`
- Team Members:
	- **Jemshit Iskanderov (Team Owner)**
	- **Nurmyrat Amanmadov**
	- **Tarlan Abdullayev**
	- **Parahat Iljanov**


## Challenge Summary

Data from several different **space-based** exoplanet surveying missions have enabled discovery of thousands of new planets outside our solar system, but most of these exoplanets were identified manually. With advances in artificial intelligence and machine learning (AI/ML), it is possible to automatically analyze large sets of data collected by these missions to identify exoplanets. Our challenge is to create an AI/ML model that is trained on one or more of the open-source exoplanet datasets offered by **NASA** and that can analyze new data to accurately identify exoplanets.

Exoplanetary identification is becoming an increasingly popular area of astronomical exploration. Several survey missions have been launched with the primary objective of identifying exoplanets. Utilizing the `transit method` for exoplanet detection, scientists are able to detect a decrease in light when a planetary body passes between a star and the surveying satellite. `Kepler` is one of the more well-known transit-method satellites, and provided data for nearly a decade. `Kepler` was followed by its successor mission, `K2`, which utilized the same hardware and transit method, but maintained a different path for surveying. During both of these missions, much of the work to identify exoplanets was done manually by astrophysicists at **NASA** and research institutions that sponsored the missions. After the retirement of `Kepler`, the `Transiting Exoplanet Survey Satellite (TESS)`, which has a similar mission of exoplanetary surveying, launched and has been collecting data since **2018**.

For each of these missions (`Kepler`, `K2`, and `TESS`), publicly available datasets exist that include data for all confirmed exoplanets, planetary candidates, and false positives obtained by the mission. For each data point, these spreadsheets also include variables such as the `orbital period`, `transit duration`, `planetary radius`, and much more. As this data has become public, many individuals have researched methods to automatically identify exoplanets using machine learning. But despite the availability of new technology and previous research in automated classification of exoplanetary data, much of this exoplanetary transit data is still analyzed manually. Promising research studies have shown great results can be achieved when data is automatically analyzed to identify exoplanets. Much of the research has proven that preprocessing of data, as well as the choice of model, can result in high-accuracy identification. Utilizing the `Kepler`, `K2`, `TESS`, and other NASA-created, open-source datasets can help lead to discoveries of new exoplanets hiding in the data these satellites have provided.

### Challenge Objectives

Our challenge is to create an artificial intelligence/machine learning model that is trained on one or more of NASA’s open-source exoplanet datasets, and not only analyzes data to identify new exoplanets, but includes a web interface to facilitate user interaction. A number of exoplanet datasets from NASA’s `Kepler`, `K2`, and `TESS` missions are available. As we implement this project, we carefully consider how each data variable—such as `orbital period`, `transit duration`, and `planetary radius`—affects the classification of a data point as a `confirmed exoplanet`, `planetary candidate`, or `false positive`. Our approach involves experimenting with different methods of processing, removing, or incorporating specific data to optimize model accuracy. We also focus on user interaction, enabling users to upload new data or manually enter data through the web interface. User-provided data can be used to update and improve our model, making the system more dynamic and responsive to new discoveries.

### Considerations

As we implement this project, we will:
- Design the tool to support both researchers seeking to classify new data and novices interested in exploring exoplanet datasets.
- Build an interface that allows users to upload new data and retrain models dynamically.
- Provide real-time statistics on model accuracy within the interface.
- Enable users to adjust model hyperparameters directly through the web interface.

### NASA Data & Resources

Dataset: `Kepler Objects of Interest (KOI)`: This dataset is a comprehensive list of all confirmed exoplanets, planetary candidates, and false positives determined on all the transits captured by Kepler. Utilizing the variables in this labeled dataset could make for a solid method of performing supervised learning from different variables in the dataset. See column “Disposition Using Kepler Data” for classification.

> **Note:** [Kepler Objects of Interest (KOI) Dataset](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative)

### Subjects

- `Artificial Intelligence & Machine Learning`
- `Coding`
- `Data Analysis`
- `Data Management`
- `Data Visualization`
- `Extrasolar Objects`
- `Planets & Moons`
- `Software`
- `Space Exploration`


## Technologies Used

- **Frontend**
	- [React](https://react.dev/) (JavaScript library for building user interfaces)
	- [Vite](https://vitejs.dev/) (Frontend build tool for fast development)
	- [Bootstrap](https://getbootstrap.com/) (CSS framework for responsive design)

- **Backend**
	- [Python](https://www.python.org/) (Programming language for server-side logic)
	- [Flask](https://flask.palletsprojects.com/) (Web framework for building APIs)
	- Machine Learning libraries (for AI model development)

