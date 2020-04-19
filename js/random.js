import pointsWithinPolygon from '@turf/points-within-polygon'
import { point, featureCollection, polygon as turfpoly, lineString } from '@turf/helpers'
import { randomPoint, randomPolygon, randomLineString } from "@turf/random"
import booleanWithin from '@turf/boolean-within'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import area from '@turf/area'
// Load Chance
var Chance = require('chance');
// Instantiate Chance so it can be used
var chance = new Chance();

var randomData = function () {
    var randomData = {};
    // find random points within user defined boundary 
    randomData.randomPointInPoly = function randomPointInPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomPointsArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            let mypoint
            let within
            let inside = false
            do {
                mypoint = randomPoint(1, { bbox: bounds })
                inside = booleanWithin(mypoint.features[0], polygon.features[0]);
                within = pointsWithinPolygon(mypoint.features[0], polygon.features[0])
            } while (!inside);
            inside && randomPointsArray.push(within)

        }
        for (let i = 0; i < randomPointsArray.length; i++) {
            var variablesObj = new Object();

            userInput.forEach(attr => {
                if (attr.name === 'variable') {
                    var value = attr.value
                    variablesObj[attr.value] = chance[value]();

                }
            })
            if (randomPointsArray[i].features.length > 0) {
                var pointFeature = point(randomPointsArray[i].features[0].geometry.coordinates, variablesObj)
                randomFinal.push(pointFeature)
            } else {
                randomPointInPoly(polygon, map)
            }
        }

        var collection = featureCollection(
            randomFinal
        );

        console.log("number of final features");

        map.addSource('Random Point', {
            type: 'geojson',
            data: collection
        });
        map.addLayer({
            // 'id': 'Random Line',
            'id': 'Random Point',
            'type': 'circle',
            'source': 'Random Point',
            'paint': {
                'circle-radius': 9.75,
                // color circles by ethnicity, using a match expression	
                // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match	
                'circle-color': '#01579b',
                'circle-stroke-color': 'white',
                'circle-stroke-width': 2
            }
        });
        var bbox = turf.extent(collection);
        map.fitBounds(bbox, {
            padding: 20,
            linear: false
        });
        var description = []
        map.on('click', 'Random Point', function (e) {
            for (var m = 0; m < Object.keys(e.features[0].properties).length; m++) {
                var coordinates = e.features[0].geometry.coordinates.slice();
                description[m] = `${Object.keys(e.features[0].properties)[m]}:${Object.values(e.features[0].properties)[m]}<br>`;
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);

        });
        // Change the cursor to a pointer when the mouse is over the Train layer.
        map.on('mouseenter', 'Random Point', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'Random Point', function () {
            map.getCanvas().style.cursor = 'default';
        });

    };

    // find random polygons within user defined boundary 
    randomData.randomPolyinPoly = function randomPolyinPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomPolygonArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            let inside1 = false
            let inside2 = false
            let inside3 = false
            let inside4 = false
            let inside5 = false
            let mypolygon
            do {
                mypolygon = randomPolygon(1, { bbox: bounds, num_vertices: 4, max_radial_length: 0.06 })

                // i know this is hardcoding but relax...
                inside1 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][0], polygon.features[0]);
                inside2 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][1], polygon.features[0]);
                inside3 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][2], polygon.features[0]);
                inside4 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][3], polygon.features[0]);
                inside5 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][4], polygon.features[0]);

            } while (!inside1 && !inside2 && !inside3 && !inside4 && !inside5);
            inside1 && inside2 && inside3 && inside4 && inside5 && randomPolygonArray.push(mypolygon)

        }
        for (let i = 0; i < randomPolygonArray.length; i++) {
            var variablesObj = new Object();

            userInput.forEach(attr => {
                if (attr.name === 'variable') {
                    var value = attr.value
                    variablesObj[attr.value] = chance[value]();

                }
            })
            if (randomPolygonArray[i].features.length > 0) {
                var polygonFeature = turfpoly(randomPolygonArray[i].features[0].geometry.coordinates, variablesObj)
                randomFinal.push(polygonFeature)
            } else {
                randomPolyinPoly(polygon)
            }
        }

        var collection = featureCollection(
            randomFinal
        );

        map.addSource('Random Polygon', {
            type: 'geojson',
            data: collection
        });
        map.addLayer({
            'id': 'Random Polygon',
            'type': 'fill',
            'source': 'Random Polygon',
            'paint': {
                'fill-color': '#01579b',
                'fill-opacity': 0.6,
                'fill-outline-color': 'black'
            }
        });
        var bbox = turf.extent(collection);
        map.fitBounds(bbox, {
            padding: 20,
            linear: false
        });
        var description = []
        map.on('click', 'Random Polygon', function (e) {
            for (var m = 0; m < Object.keys(e.features[0].properties).length; m++) {
                description[m] = `${Object.keys(e.features[0].properties)[m]}:${Object.values(e.features[0].properties)[m]}<br>`;


            }
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(description)
                .addTo(map);

        });

        // Change the cursor to a pointer when the mouse is over the Train layer.
        map.on('mouseenter', 'Random Polygon', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'Random Polygon', function () {
            map.getCanvas().style.cursor = 'default';
        });
      
    };

    // find random line within user defined boundary 
    randomData.randomLineInPoly = function randomLineInPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomLineArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            let inside1 = false
            let inside2 = false
            let inside3 = false
            let inside4 = false
            let myline
            do {
                myline = randomLineString(1, { bbox: bounds, num_vertices: 20, max_length: 0.005, max_rotation: Math.PI / 4 })
                inside1 = booleanPointInPolygon(myline.features[0].geometry.coordinates[0], polygon.features[0]);
                inside2 = booleanPointInPolygon(myline.features[0].geometry.coordinates[1], polygon.features[0]);
                inside3 = booleanPointInPolygon(myline.features[0].geometry.coordinates[2], polygon.features[0]);
                inside4 = booleanPointInPolygon(myline.features[0].geometry.coordinates[3], polygon.features[0]);


            } while (!inside1 && !inside2 && !inside3 && !inside4);
            inside1 && inside2 && inside3 && inside4 && randomLineArray.push(myline)
        }
        for (let i = 0; i < randomLineArray.length; i++) {
            var variablesObj = new Object();

            userInput.forEach(attr => {
                if (attr.name === 'variable') {
                    var value = attr.value
                    variablesObj[attr.value] = chance[value]();

                }
            })
            if (randomLineArray[0].features.length > 0) {
                var lineFeature = lineString(randomLineArray[i].features[0].geometry.coordinates, variablesObj)
                randomFinal.push(lineFeature)
            } else {
                randomLineInPoly(polygon, map, featureCount, userInput)
            }

        }

        var collection = featureCollection(
            randomFinal
        );

        map.addSource('Random Line', {
            type: 'geojson',
            data: collection
        });
        map.addLayer({
            'id': 'Random Line',
            'type': 'line',
            'source': 'Random Line',
            'paint': {
                'line-width': 2,
                'line-color': 'black',
                'line-gap-width': 2
            },
            'layout': {
                'line-cap': 'round',
            }
        });
        var bbox = turf.extent(collection);
        map.fitBounds(bbox, {
            padding: 20,
            linear: false
        });
        var description = []
        map.on('click', 'Random Line', function (e) {
            for (var m = 0; m < Object.keys(e.features[0].properties).length; m++) {
                description[m] = `${Object.keys(e.features[0].properties)[m]}:${Object.values(e.features[0].properties)[m]}<br>`;

            }
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(description)
                .addTo(map);

        });

        // Change the cursor to a pointer when the mouse is over the Train layer.
        map.on('mouseenter', 'Random Line', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'Random Line', function () {
            map.getCanvas().style.cursor = 'default';
        });
        

    };

    return randomData
}();

const _randomData = randomData;
export { _randomData as randomData };