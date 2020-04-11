// import mapboxgl from 'mapbox-gl'
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import AroundControl from 'mapbox-gl-controls/lib/around'
import pointsWithinPolygon from '@turf/points-within-polygon'
import { point, featureCollection } from '@turf/helpers'
require('dotenv').config()

// mobile nav bar 
$(".button-collapse").sideNav();

// page preloader 
window.onload = function () {
    $('.loader').fadeOut('slow');
    document.getElementById("page").style.visibility = 'visible'

    // welcome popup 
    setTimeout(function () { $('.tap-target').tapTarget('open') }, 5000)
    setTimeout(function () { $('.tap-target').tapTarget('close') }, 10000)
}

// map container //replace with your mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3JhY2VhbW9uZGkiLCJhIjoiY2s4dGphcGQwMDBhcjNmcnkzdGk3MnlrZCJ9.54r40Umo0l3dHseEbrQpUg'
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/graceamondi/ck1p6wqfs0vj81cqwbikdv87j',
    center: [36.74446105957031, -1.2544011203660779],
    // zoom: 12
});

// map controls 
map.addControl(new ZoomControl(), 'top-left');
map.addControl(new RulerControl(), 'top-left');
map.addControl(new AroundControl(), 'top-left')
map.addControl(new CompassControl(), 'top-left');

// initialize dropdown 
$('select').material_select();
$("select[required]").css({ display: "block", height: 0, padding: 0, width: 0, position: 'absolute' });
var uploadInput = document.getElementById("upload_polygon");
var bbox = document.getElementById('bbox')
var generate = document.getElementById("generate")

// upload polygon 
function uploadPolygon() {
    // upload datasets
    var reader = new FileReader();
    reader.onload = function () {
        var dataURL = reader.result;
        var polygon = JSON.parse(dataURL);
        console.log(polygon)
        displayPolygonData(polygon)

    };

    reader.readAsText(uploadInput.files[0]);
}

function displayPolygonData(content) {
    if (content.features[0].geometry.type == 'Polygon') {
        if (content.features.length == 1) {
            map.addSource('Polygon Layer', {
                type: 'geojson',
                data: content
            });
            map.addLayer({
                'id': 'Polygon Layer',
                'type': 'fill',
                'source': 'Polygon Layer',
                'paint': {
                    'fill-color': '#81d4fa',
                    'fill-opacity': 0.5
                }
            });
            var bbox = turf.extent(content);
            map.fitBounds(bbox, {
                padding: 20,
                linear: false
            });

        } else {
            toastr.options = {
                "closeButton": false,
                "timeOut": 7000,
                "positionClass": "toast-top-right",
                "showMethod": 'slideDown',
                "hideMethod": 'slideUp',
                "closeMethod": 'slideUp',
            };
            toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Upload a single polygon feature</p>`);
            console.log("single polygon");
        }
    } else {
        toastr.options = {
            "closeButton": false,
            "timeOut": 7000,
            "positionClass": "toast-top-right",
            "showMethod": 'slideDown',
            "hideMethod": 'slideUp',
            "closeMethod": 'slideUp',
        };
        toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Please upload polygon features only</p>`);
        console.log("not polygon feature");
    }
    generate.addEventListener('click', function () {
        addRandomToMap(content)
    })

}

uploadInput.addEventListener('change', uploadPolygon, false)
// define the function
function randomPointInPoly(polygon) {
    var bounds = turf.extent(polygon);
    console.log(bounds)
    var x_min = bounds[0];
    var x_max = bounds[2];
    var y_min = bounds[1];
    var y_max = bounds[3];

    var randomPointsArray = []
    var randomFinal = []
    for (let index = 0; index < 100; index++) {
        var lat = y_min + (Math.random() * (y_max - y_min));
        var lng = x_min + (Math.random() * (x_max - x_min));

        var mypoint = point([lng, lat]);
        // var poly = polygon.toGeoJSON();
        // console.log(poly)
        var inside = pointsWithinPolygon(mypoint, polygon);
        randomPointsArray.push(inside)

    }
    for (let i = 0; i < randomPointsArray.length; i++) {
        if (randomPointsArray[i].features.length > 0) {
            var pointFeature = point(randomPointsArray[i].features[0].geometry.coordinates)
            randomFinal.push(pointFeature)
        }
    }
    console.log(randomFinal)

    var collection = featureCollection(
        randomFinal
    );

    if (inside) {
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
        console.log("number of final features");
        return collection
    } else {
        randomPointInPoly(polygon)
    }

}

function addRandomToMap(polygon) {
    map.addSource('Random Points', {
        type: 'geojson',
        data: randomPointInPoly(polygon)
    });
    map.addLayer({
        'id': 'Random Points',
        'type': 'circle',
        'source': 'Random Points',
        'paint': {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': 9.75,
            // color circles by ethnicity, using a match expression
            // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            'circle-color': '#01579b',
            'circle-stroke-color': 'white',
            'circle-stroke-width': 2
        }
    });
}

