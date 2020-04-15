import RulerControl from 'mapbox-gl-controls/lib/ruler';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import AroundControl from 'mapbox-gl-controls/lib/around'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { randomData } from './random';

require('dotenv').config()

var uploadInput = document.getElementById("upload_polygon");
var drawbbox = document.getElementById('drawbbox')

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

var draw = new MapboxDraw({
    displayControlsDefault: false,
    modes: {
        ...MapboxDraw.modes,
        'draw_rectangle': DrawRectangle
    }
});
map.addControl(draw, 'top-left');

// map controls 
map.addControl(new ZoomControl(), 'top-left');
map.addControl(new RulerControl(), 'top-left');
map.addControl(new AroundControl(), 'top-left')
map.addControl(new CompassControl(), 'top-left');
const onSubmit = values => console.log(JSON.stringify(values))

// initialize dropdown 
$("select[required]").css({ display: "block", height: 0, padding: 0, width: 0, position: 'absolute' });
// prevent page reload on any form submit 
function handleForm(event) { event.preventDefault(); }

drawbbox.addEventListener('click', function () {
    if (document.getElementById('drawSpan').innerHTML == "CANCEL") {
        drawbbox.classList.remove('red')
        drawbbox.classList.add('green')
        document.getElementById('drawSpan').innerHTML = "DRAW EXTENT"
        toastr.options = {
            "closeButton": false,
            "timeOut": 7000,
            "positionClass": "toast-top-right",
            "showMethod": 'slideDown',
            "hideMethod": 'slideUp',
            "closeMethod": 'slideUp',
        };
        toastr.warning(`<p  style="font-family: 'Patrick Hand', cursive;">Extent deleted successfully</p>`);
        draw.deleteAll()
        map.removeLayer('BBOX Layer')
        map.removeSource('BBOX Layer')
        map.fitBounds([0, 90, 0, -90], {
            padding: { bottom: 80 },
            linear: false
        });
    } else {
        drawbbox.classList.remove('green')
        drawbbox.classList.add('red')
        document.getElementById('drawSpan').innerHTML = "CANCEL"
        draw.changeMode('draw_rectangle');
    }
})

// when bounding box is drawn 
map.on('draw.create', function () {
    toastr.options = {
        "closeButton": false,
        "timeOut": 7000,
        "positionClass": "toast-top-right",
        "showMethod": 'slideDown',
        "hideMethod": 'slideUp',
        "closeMethod": 'slideUp',
    };
    toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Extent created successfully</p>`);
    var bboxExtent = draw.getAll()
    retrieveBbox(bboxExtent)
});

// when bounding box is updated
map.on('draw.update', function () {
    toastr.options = {
        "closeButton": false,
        "timeOut": 7000,
        "positionClass": "toast-top-right",
        "showMethod": 'slideDown',
        "hideMethod": 'slideUp',
        "closeMethod": 'slideUp',
    };
    toastr.success(`<p  style="font-family: 'Patrick Hand', cursive;">Extent updated successfully</p>`);
    var bboxExtent = draw.getAll()
    retrieveBbox(bboxExtent)
})

// retrieve bounding box polygon from map 
function retrieveBbox(data) {
    document.getElementById("generateForm").addEventListener('submit', handleForm)
    // generate random data on form submit 
    document.getElementById("generateForm").addEventListener('submit', function () {
        var userInput = $("#generateForm").serializeArray();
        console.log(userInput)



        if (userInput[0].value === 'Point') {
            randomData.randomPointInPoly(data, map, userInput[1].value, userInput)
        } else if (userInput[0].value === 'Line') {
            randomData.randomLineInPoly(data, map, userInput[1].value, userInput)
        } else if (userInput[0].value === 'Polygon') {
            randomData.randomPolyinPoly(data, map, userInput[1].value, userInput)
        } else {
            toastr.options = {
                "closeButton": false,
                "timeOut": 7000,
                "positionClass": "toast-top-right",
                "showMethod": 'slideDown',
                "hideMethod": 'slideUp',
                "closeMethod": 'slideUp',
            };
            toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Something went wrong</p>`);
        }
    })
    // if (content.features.length == 1) {
    map.addSource('BBOX Layer', {
        type: 'geojson',
        data: data
    });
    map.addLayer({
        'id': 'BBOX Layer',
        'type': 'fill',
        'source': 'BBOX Layer',
        'paint': {
            'fill-color': '#81d4fa',
            'fill-opacity': 0.5
        }
    });
    var bbox = turf.extent(data);
    map.fitBounds(bbox, {
        padding: 50,
        linear: false
    });
}

// upload polygon 
function uploadPolygon() {
    // upload datasets
    var reader = new FileReader();
    reader.onload = function () {
        var dataURL = reader.result;
        var polygon = JSON.parse(dataURL);
        console.log(polygon)
        displayPolygonData(polygon)
        document.getElementById("generateForm").addEventListener('submit', handleForm)
        // generate random data on form submit 
        document.getElementById("generateForm").addEventListener('submit', function () {
            var userInput = $("#generateForm").serializeArray();
            console.log(userInput)



            if (userInput[0].value === 'Point') {
                randomData.randomPointInPoly(polygon, map, userInput[1].value, userInput)
            } else if (userInput[0].value === 'Line') {
                randomData.randomLineInPoly(polygon, map, userInput[1].value, userInput)
            } else if (userInput[0].value === 'Polygon') {
                randomData.randomPolyinPoly(polygon, map, userInput[1].value, userInput)
            } else {
                toastr.options = {
                    "closeButton": false,
                    "timeOut": 7000,
                    "positionClass": "toast-top-right",
                    "showMethod": 'slideDown',
                    "hideMethod": 'slideUp',
                    "closeMethod": 'slideUp',
                };
                toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Something went wrong</p>`);
            }
        })
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
    // generateButton.addEventListener('click', function () {

    //     randomData.randomLineInPoly(content,map)


    // })

}

uploadInput.addEventListener('change', uploadPolygon, false)

var variableArray = ['bool', 'floating', 'integer', 'age', 'first', 'last', 'gender', 'animal', 'color', 'company', 'profession', 'address', 'altitude', 'phone', 'zip', 'date']
variableArray.forEach(opt => {
    var innerValue = opt.substr(0, 1).toUpperCase() + opt.substr(1)
    $('#variables').append("<option value='" + opt + "'>" + innerValue + "</option>")
    $('select').material_select()
});
