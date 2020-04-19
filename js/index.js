import RulerControl from 'mapbox-gl-controls/lib/ruler';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import AroundControl from 'mapbox-gl-controls/lib/around'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { randomData } from './random';
import { featureCollection } from '@turf/helpers'
import { formSubscriptionItems } from 'final-form';

// import config variables
require('dotenv').config()

var uploadInput = document.getElementById("upload_polygon");
var drawbbox = document.getElementById('drawbbox')
var uploadForm = document.getElementById("uploadtrainForm")
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
mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/graceamondi/ck1p6wqfs0vj81cqwbikdv87j',
    center: [36.74446105957031, -1.2544011203660779],
    // zoom: 12
});

// draw instance constructor
var draw = new MapboxDraw({
    boxSelect: false,
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

// initialize dropdown 
$("select[required]").css({ display: "block", height: 0, padding: 0, width: 0, position: 'absolute' });
// prevent page reload on any form submit 
function handleForm(event) { event.preventDefault(); }

// generate bounding box on user interaction 
drawbbox.addEventListener('click', function () {
    // check if state is cancel 
    if (document.getElementById('drawSpan').innerHTML == "CANCEL") {
        // change button style color 
        drawbbox.classList.remove('red')
        drawbbox.classList.add('green')
        // enable upload button interactivity 
        document.getElementById("upload_polygon_button").classList.remove('disabled')
        // disable draw extent button interactivity 
        document.getElementById("generateButton").classList.add('disabled')
        document.getElementById('drawSpan').innerHTML = "DRAW EXTENT"

        //    delete bounding box if user clicks cancel 
        if (map.getStyle().layers.slice(-1)[0].id === 'BBOX Layer') {
            // delete bounding box 
            draw.deleteAll()
            // remove bbox layer and source 
            map.removeLayer('BBOX Layer')
            map.removeSource('BBOX Layer')
            toastr.options = {
                "closeButton": false,
                "timeOut": 7000,
                "positionClass": "toast-top-right",
                "showMethod": 'slideDown',
                "hideMethod": 'slideUp',
                "closeMethod": 'slideUp',
            };
            toastr.warning(`<p  style="font-family: 'Patrick Hand', cursive;">Extent deleted successfully</p>`);
        }

        // fit map to global bounds 
        map.fitBounds([0, 90, 0, -90], {
            padding: { top: 0, bottom: 100 },
            linear: false
        });



    } else {
        // if state is draw extent 
        // change button style color 
        drawbbox.classList.remove('green')
        drawbbox.classList.add('red')
        // disable upload button interactity 
        document.getElementById("upload_polygon_button").classList.add('disabled')
        // change draw extent button to cancel
        document.getElementById('drawSpan').innerHTML = "CANCEL"
        // enable generate form submit button  
        document.getElementById("generateButton").classList.remove('disabled')
        draw.changeMode('draw_polygon');

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
    // retrieve bbox geojson data 
    var bboxExtent = draw.getAll()
    retrieveBbox(bboxExtent)
});

// when bounding box is updated
map.on('draw.update', function (e) {
    // prevent moving bounding box 
    if (e.action === 'move') {
        draw.deleteAll();
    }
})

// retrieve bounding box polygon from map 
function retrieveBbox(data) {
    // prevent page reload on submit 
    document.getElementById("generateForm").addEventListener('submit', handleForm)
    // generate random data on form submit 
    document.getElementById("generateForm").addEventListener('submit', function () {
        // check if button state is in cancel mode 
        // if (document.getElementById('generateInput').value === 'CANCEL') {
        //     // change button state to generate mode 
        //     document.getElementById('generateInput').value = 'GENERATE'

        //     // remove added layer 
        //     if (map.getStyle().layers.slice(-1)[0].id === 'Random Point') {
        //         map.removeLayer('Random Point');
        //         map.removeSource('Random Point')
        //     } else if (map.getStyle().layers.slice(-1)[0].id === 'Random Line') {
        //         map.removeLayer('Random Line');
        //         map.removeSource('Random Line')
        //     } else if (map.getStyle().layers.slice(-1)[0].id === 'Random Polygon') {
        //         map.removeLayer('Random Polygon');
        //         map.removeSource('Random Polygon')
        //     } else {
        //         console.log("nothing added")
        //     }

        // } else {
        //     // change button state to cancel mode instead
        //     document.getElementById('generateInput').value = 'CANCEL'
        // retrieve form data 
        var userInput = $("#generateForm").serializeArray();
        // generate random data based on selected geometry 
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
        document.getElementById('generateButton').classList.add('disabled')
        document.getElementById('downloadButton').classList.remove('disabled')
        document.getElementById("upload_polygon_button").classList.add('disabled')

        document.getElementById("remove_polygon_button").classList.add('disabled')

        // }
    })
    // add bbox layer and source 
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
    console.log(map.getStyle().sources)

    // fit map to bbox extent 
    var bbox = turf.extent(data);
    map.fitBounds(bbox, {
        padding: 50,
        linear: false
    });
}
var reader = new FileReader();

// upload polygon file
function uploadPolygon() {
    // upload datasets
    reader.onload = function () {
        var dataURL = reader.result;
        var polygon = JSON.parse(dataURL);
        displayPolygonData(polygon)
        console.log(uploadInput.files[0])
    };

    reader.readAsText(uploadInput.files[0]);

}
var featureCollects = []
// display uploaded polygon geojson data 
function displayPolygonData(feature) {
    var featureIds = draw.add(feature);
    var pointId = featureIds[0];
    var featureCollect = featureCollection([draw.get(pointId)])
    console.log(featureCollect);
    // only upload polygon files
    if (featureCollect.features[0].geometry.type == 'Polygon') {
        map.addSource('Polygon Layer', {
            type: 'geojson',
            data: featureCollect
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
        var bbox = turf.extent(featureCollect);
        console.log(bbox)
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
    draw.delete(featureIds)
    featureCollects.push(featureCollect)
    var latestFeatureCollect = featureCollects[featureCollects.length - 1]

    console.log(featureCollects)
    // prevent page reload on submit 
    document.getElementById("generateButton").addEventListener('click', handleForm)
    // generate random data on form submit 
    document.getElementById("generateButton").addEventListener('click', function () {
        // is state in cancel mode 
        // if (document.getElementById('generateInput').value === 'CANCEL') {
        //     document.getElementById('generateInput').value = 'GENERATE'

        //     // remove added layer 
        //     if (map.getStyle().layers.slice(-1)[0].id === 'Random Point') {
        //         map.removeLayer('Random Point');
        //         map.removeSource('Random Point')
        //     } else if (map.getStyle().layers.slice(-1)[0].id === 'Random Line') {
        //         map.removeLayer('Random Line');
        //         map.removeSource('Random Line')
        //     } else if (map.getStyle().layers.slice(-1)[0].id === 'Random Polygon') {
        //         map.removeLayer('Random Polygon');
        //         map.removeSource('Random Polygon')
        //     } else {
        //         console.log("nothing added")
        //     }
        // } else {
        // is state in generate mode 
        if (document.getElementById("generateSpan").innerHTML === 'GENERATE') {
            document.getElementById('generateSpan').innerHTML = 'CANCEL'
            // document.getElementById('generateButton').style.color = 'red'
            // retrieve form data 
            var userInput = $("#generateForm").serializeArray();
            // get the latest polygon added 
            // console.log(featureCollects)
            // while (featureCollects.length == 1) {
            //     // generate random data based on selected geometry 
            //     if (userInput[0].value === 'Point') {
            //         new randomData.randomPointInPoly(latestFeatureCollect, map, userInput[1].value, userInput)
            //     } else if (userInput[0].value === 'Line') {
            //         new randomData.randomLineInPoly(latestFeatureCollect, map, userInput[1].value, userInput)
            //     } else if (userInput[0].value === 'Polygon') {
            //         new randomData.randomPolyinPoly(latestFeatureCollect, map, userInput[1].value, userInput)
            //     } else {
            //         toastr.options = {
            //             "closeButton": false,
            //             "timeOut": 7000,
            //             "positionClass": "toast-top-right",
            //             "showMethod": 'slideDown',
            //             "hideMethod": 'slideUp',
            //             "closeMethod": 'slideUp',
            //         };
            //         toastr.error(`<p  style="font-family: 'Patrick Hand', cursive;">Something went wrong</p>`);
            //     }
            // }
            // if user changed file input then pick the latest file 

            if (featureCollects.length < 2) {
                console.log("less than 2",latestFeatureCollect)
                // generate random data based on selected geometry 
                if (userInput[0].value === 'Point') {
                    new randomData.randomPointInPoly(latestFeatureCollect, map, userInput[1].value, userInput)
                } else if (userInput[0].value === 'Line') {
                    new randomData.randomLineInPoly(latestFeatureCollect, map, userInput[1].value, userInput)
                } else if (userInput[0].value === 'Polygon') {
                    new randomData.randomPolyinPoly(latestFeatureCollect, map, userInput[1].value, userInput)
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
            }
            if (featureCollects.length > 1) {
                console.log("greater than 1",JSON.stringify(featureCollects[1]))
                // generate random data based on selected geometry 
                if (userInput[0].value === 'Point') {
                    new randomData.randomPointInPoly(featureCollects[1], map, userInput[1].value, userInput)
                } else if (userInput[0].value === 'Line') {
                    new randomData.randomLineInPoly(featureCollects[1], map, userInput[1].value, userInput)
                } else if (userInput[0].value === 'Polygon') {
                    new randomData.randomPolyinPoly(featureCollects[1], map, userInput[1].value, userInput)
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
            }

            // document.getElementById('generateButton').classList.add('disabled')
            document.getElementById('downloadButton').classList.remove('disabled')
            // drawbbox.classList.add('disabled')
            // document.getElementById("upload_polygon_button").classList.add('disabled')
            // document.getElementById('remove_polygon_button').classList.add('disabled')
        }

        // }
    })
}


// upload polygon on click 
uploadInput.addEventListener('change', function () {
    uploadPolygon()
    draw.deleteAll()
    drawbbox.classList.add('disabled')
    document.getElementById("generateButton").classList.remove('disabled')
    document.getElementById("upload_polygon_button").classList.add('disabled')
    document.getElementById("remove_polygon_button").style.visibility = 'visible'
})

// when user removes polygon file
document.getElementById("remove_polygon_button").addEventListener('click', function () {
    uploadInput.value = null;
    uploadForm.reset();
    draw.deleteAll()
    console.log(uploadInput.value)
    map.removeLayer('Polygon Layer')
    map.removeSource('Polygon Layer')
    drawbbox.classList.remove('disabled')
    document.getElementById("upload_polygon_button").classList.remove('disabled')
    document.getElementById("generateButton").classList.add('disabled')
    document.getElementById("uploadSpan").innerHTML = `Upload File<i class="material-icons right">attach_file</i>`
    // fit map to global bounds 
    map.fitBounds([0, 90, 0, -90], {
        padding: { top: 0, bottom: 100 },
        linear: false
    });
    document.getElementById("remove_polygon_button").style.visibility = 'hidden'

})

// select geojson properties 
var variableArray = ['bool', 'floating', 'integer', 'age', 'first', 'last', 'gender', 'animal', 'color', 'company', 'profession', 'address', 'altitude', 'phone', 'zip', 'date']
variableArray.forEach(opt => {
    var innerValue = opt.substr(0, 1).toUpperCase() + opt.substr(1)
    $('#variables').append("<option value='" + opt + "'>" + innerValue + "</option>")
    $('select').material_select()
});