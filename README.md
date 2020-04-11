# Random Geojson

## Introduction
![demo](./images/demo.png)
Random Geojson is an open source tool for generating random point, line and polygon data within a user-defined boundary. It was created using of [Materialize](https://materializecss.com/ "Materialize"), [Turf JS](https://turfjs.org "turf js") and [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/ "Mapbox GL JS"). View [demo](https://materialbox.surge.sh/)

## Run Locally

Clone application

```git clone https://github.com/Grace-Amondi/random-geojson.git```

Move into the ordinary_kriging directory

```cd random-geojson```

Change .env.example to .env and Set your *mapbox access token*.Install node modules

```npm install```

Run application

```npm start```

Open application at http://localhost:1234

---

## Build for production

To build the app for production,

```npm run build```

Navigate to /dist folder and deploy to [surge](https://surge.sh/ "surge") or [github pages](https://pages.github.com/ "github pages")

---
