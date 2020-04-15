import pointsWithinPolygon from '@turf/points-within-polygon'
import { point, featureCollection, polygon as turfpoly, lineString } from '@turf/helpers'
import { randomPoint, randomPolygon, randomLineString } from "@turf/random"
import booleanWithin from '@turf/boolean-within'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
// Load Chance
var Chance = require('chance');
var downloadButton = document.getElementById('downloadButton')
// Instantiate Chance so it can be used
var chance = new Chance();
// download predicted data 
function downloadPredictions(content, filename) {
    var file = filename + '.geojson';
    saveAs(new File([JSON.stringify(content)], file, {
        type: "text/plain;charset=utf-8"
    }), file);
}
var randomData = function () {
    var randomData = {};
    // find random points within user defined boundary 
    randomData.randomPointInPoly = function randomPointInPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomPointsArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            var mypoint = randomPoint(1, { bbox: bounds })
            var inside = booleanWithin(mypoint.features[0], polygon.features[0]);
            var within = pointsWithinPolygon(mypoint.features[0], polygon.features[0])
            if (inside) {
                randomPointsArray.push(within)
            }
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

        toastr.options = {
            "closeButton": false,
            "timeOut": 7000,
            "positionClass": "toast-top-right",
            "showMethod": 'slideDown',
            "hideMethod": 'slideUp',
            "closeMethod": 'slideUp',
        };
        toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Successfully made ${collection.features.length} out of 100 features </p>`);
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

        downloadButton.addEventListener('click',function () {
            downloadPredictions(collection,'points')
        })
    };

    // find random polygons within user defined boundary 
    randomData.randomPolyinPoly = function randomPolyinPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomPolygonArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            var mypolygon = randomPolygon(1, { bbox: bounds, num_vertices: 4, max_radial_length: 0.1 })

            // i know this is hardcoding but relax...
            var inside1 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][0], polygon.features[0]);
            var inside2 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][1], polygon.features[0]);
            var inside3 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][2], polygon.features[0]);
            var inside4 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][3], polygon.features[0]);
            var inside5 = booleanPointInPolygon(mypolygon.features[0].geometry.coordinates[0][4], polygon.features[0]);
            if (inside1 && inside2 && inside3 && inside4 && inside5) {
                randomPolygonArray.push(mypolygon)
            }
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
        console.log(collection)
        toastr.options = {
            "closeButton": false,
            "timeOut": 7000,
            "positionClass": "toast-top-right",
            "showMethod": 'slideDown',
            "hideMethod": 'slideUp',
            "closeMethod": 'slideUp',
        };

        toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Successfully made ${collection.features.length} out of 100 features </p>`);

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
                'fill-opacity': 1
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
        downloadButton.addEventListener('click',function () {
            downloadPredictions(collection,'polygons')
        })

    };

    // find random line within user defined boundary 
    randomData.randomLineInPoly = function randomLineInPoly(polygon, map, featureCount, userInput) {
        var bounds = turf.extent(polygon);

        var randomLineArray = []
        var randomFinal = []
        for (let index = 0; index < featureCount; index++) {
            var myline = randomLineString(1, { bbox: bounds, num_vertices: 20, max_length: 0.005, max_rotation: Math.PI / 4 })
            // i know this is hardcoding but relax...
            var inside1 = booleanPointInPolygon(myline.features[0].geometry.coordinates[0], polygon.features[0]);
            var inside2 = booleanPointInPolygon(myline.features[0].geometry.coordinates[1], polygon.features[0]);
            var inside3 = booleanPointInPolygon(myline.features[0].geometry.coordinates[2], polygon.features[0]);
            var inside4 = booleanPointInPolygon(myline.features[0].geometry.coordinates[3], polygon.features[0]);
            if (inside1 && inside2 && inside3 && inside4 ) {

                randomLineArray.push(myline)
            }
        }
        for (let i = 0; i < randomLineArray.length; i++) {
            var variablesObj = new Object();

            userInput.forEach(attr => {
                if (attr.name === 'variable') {
                    var value = attr.value
                    variablesObj[attr.value] = chance[value]();

                }
            })
            if (randomLineArray[0].features.length > 0 ) {
                var lineFeature = lineString(randomLineArray[i].features[0].geometry.coordinates, variablesObj)
                randomFinal.push(lineFeature)
            } else {
                randomLineInPoly(polygon,map, featureCount, userInput)
            }

        }

        var collection = featureCollection(
            randomFinal
        );

        console.log(JSON.stringify(collection))
        toastr.options = {
            "closeButton": false,
            "timeOut": 7000,
            "positionClass": "toast-top-right",
            "showMethod": 'slideDown',
            "hideMethod": 'slideUp',
            "closeMethod": 'slideUp',
        };
        toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Successfully made ${collection.features.length} out of ${featureCount} features </p>`);

        map.addSource('Random Line', {
            type: 'geojson',
            data: collection
        });
        map.addLayer({
            'id': 'Random Line',
            'type': 'line',
            'source': 'Random Line',
            'paint': {
                'line-width': 3,
                'line-color': 'black'
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
        downloadButton.addEventListener('click',function () {
            downloadPredictions(collection,'lines')
        })

    };

    return randomData
}();

const _randomData = randomData;
export { _randomData as randomData };