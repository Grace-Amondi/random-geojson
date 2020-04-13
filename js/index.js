// import mapboxgl from 'mapbox-gl'
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import AroundControl from 'mapbox-gl-controls/lib/around'
import pointsWithinPolygon from '@turf/points-within-polygon'
import { point, featureCollection, polygon as turfpoly, lineString } from '@turf/helpers'
import { randomPoint, randomPolygon, randomLineString } from "@turf/random"
import booleanWithin from '@turf/boolean-within'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { createForm } from 'final-form'
import arrayMutators from 'final-form-arrays'

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
const onSubmit = values => console.log(JSON.stringify(values))

// Create Form
const form = createForm({
    mutators: { ...arrayMutators },
    onSubmit
})
// initialize dropdown 
// $('select').material_select();
$("select[required]").css({ display: "block", height: 0, padding: 0, width: 0, position: 'absolute' });
var uploadInput = document.getElementById("upload_polygon");
var bbox = document.getElementById('bbox')
var generate = document.getElementById("generate")
var attributeInfo = document.getElementById("attributeInfo")
var addProp = document.getElementById('addProp')
var variables = document.getElementById('variables')
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
        // if (content.features.length == 1) {
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
        toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Please upload polygon features only</p>`);
        console.log("not polygon feature");
    }

    // TODO: UNCOMMENT THIS
    // generate.addEventListener('click', function () {

    //     randomLineInPoly(content)


    // })

}

uploadInput.addEventListener('change', uploadPolygon, false)
// find random points within user defined boundary 
function randomPointInPoly(polygon) {
    var bounds = turf.extent(polygon);

    var randomPointsArray = []
    var randomFinal = []
    for (let index = 0; index < 100; index++) {
        var mypoint = randomPoint(1, { bbox: bounds })
        var inside = booleanWithin(mypoint.features[0], polygon.features[0]);
        var within = pointsWithinPolygon(mypoint.features[0], polygon.features[0])
        randomPointsArray.push(within)

    }
    for (let i = 0; i < randomPointsArray.length; i++) {
        if (randomPointsArray[i].features.length > 0) {
            var pointFeature = point(randomPointsArray[i].features[0].geometry.coordinates)
            randomFinal.push(pointFeature)
        }
    }

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

// find random polygons within user defined boundary 
function randomPolyinPoly(polygon) {
    var bounds = turf.extent(polygon);

    var randomPolygonArray = []
    var randomFinal = []
    for (let index = 0; index < 100; index++) {
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
    console.log(randomPolygonArray)
    for (let i = 0; i < randomPolygonArray.length; i++) {
        if (randomPolygonArray[i].features.length > 0) {
            var polygonFeature = turfpoly(randomPolygonArray[i].features[0].geometry.coordinates)
            randomFinal.push(polygonFeature)
        } else {
            randomPolyinPoly(polygon)
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
    return addRandomToMap(collection)
}

// find random line within user defined boundary 
function randomLineInPoly(polygon) {
    var bounds = turf.extent(polygon);

    var randomLineArray = []
    var randomFinal = []
    for (let index = 0; index < 10; index++) {
        var myline = randomLineString(1, { bbox: bounds, num_vertices: 10, max_length: 0.005 })
        console.log(myline)
        // i know this is hardcoding but relax...
        var inside1 = booleanPointInPolygon(myline.features[0].geometry.coordinates[0], polygon.features[0]);
        var inside2 = booleanPointInPolygon(myline.features[0].geometry.coordinates[1], polygon.features[0]);
        var inside3 = booleanPointInPolygon(myline.features[0].geometry.coordinates[2], polygon.features[0]);
        var inside4 = booleanPointInPolygon(myline.features[0].geometry.coordinates[3], polygon.features[0]);
        console.log(myline.features[0].geometry.coordinates[0])
        if (inside1 && inside2 && inside3 && inside4) {

            randomLineArray.push(myline)
        }
    }
    for (let i = 0; i < randomLineArray.length; i++) {
        if (randomLineArray[0].features.length > 0) {
            var lineFeature = lineString(randomLineArray[i].features[0].geometry.coordinates)
            randomFinal.push(lineFeature)
        } else {
            randomPolyinPoly(polygon)
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
    toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Successfully made ${collection.features.length} out of 100 features </p>`);
    return addRandomToMap(collection)

}
// add random data to map
function addRandomToMap(dataset) {
    map.addSource('Random Line', {
        type: 'geojson',
        data: dataset
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
    var bbox = turf.extent(dataset);
    map.fitBounds(bbox, {
        padding: 20,
        linear: false
    });

}

// faker
var faker = require('faker');

let OPTIONS = {};

let modules = Object.keys(faker);

modules = modules.sort();
modules.forEach(function (module) {
    var ignore = ["locale", "locales", "localeFallback", "definitions", "fake"];
    if (ignore.indexOf(module) !== -1) {
        return;
    }
    OPTIONS[module] = Object.keys(faker[module]);
});
for (var index = 0; index < Object.keys(OPTIONS).length; index++) {
    $('#variables').append("<option value='" + Object.keys(OPTIONS)[index] + "'>" + Object.keys(OPTIONS)[index] + "</option>")
    $('select').material_select()
}
console.log(OPTIONS)

// When an option is changed, search the above for matching choices
$('#variables').on('change', function () {
    // Set selected option as variable
    var selectValue = $(this).val();
    console.log(OPTIONS[selectValue])
    // Empty the target field
    $('#variablesOption').empty();

    // For each chocie in the selected option
    for (var i = 0; i < OPTIONS[selectValue].length; i++) {
        // Output choice in the target field
        $('#variablesOption').append("<option value='" + OPTIONS[selectValue][i] + "'>" + OPTIONS[selectValue][i] + "</option>");
        $('select').material_select()
    }
});

$('select').material_select()

// generate.addEventListener('click',function () {
//     var userInput = $("#generateForm").serializeArray()
//     console.log(userInput)
// })

// var selectionCounter = 0
// function cloneSelect() {

//     var clone = attributeInfo.cloneNode(true)
//     //   var id = attributeInfo.getAttribute("id") + selectionCounter++

//     //   clone.id = id
//     //   clone.setAttribute("id", id)
//     document.getElementById("attributeContainer").appendChild(clone)
//     for (var index = 0; index < Object.keys(OPTIONS).length; index++) {
//         $('#variables').append("<option value='" + Object.keys(OPTIONS)[index] + "'>" + Object.keys(OPTIONS)[index] + "</option>")
//         $('select').material_select()
//     }
// }
// addProp.addEventListener('click', function () {
//     cloneSelect()

//     $('select').material_select()

// })



var names=document.getElementsByName('variable');
console.log(names)
for(var key=0; key < names.length; key++)  {
    console.log(names[key].value);

    //your code goes here
}