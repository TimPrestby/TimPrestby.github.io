//Main  Code//

//Global var for time stamp
var TimeStamp = -9000000000000;
// A Map (data structure) to sort the layers by year
var yearMap = new Map();
// A Map (data structure) to hold the layerGroups
var layerGroups = new Map();
// A counter to track how many Ajax requests have been completed
var numAjax = 0;
// Holds value of previous year selected in timeline
var prevYear = 1775;
// The leaflet map
var map;
//The data layers 
var dataLayer;
//Area value
var area=6741197.56764674;
var landLost=0;
var endDate=1775;
var landGained=0;
// Spinner
var spinner;

//Function: Initialize map
function createMap(){

    
    
    // Start a spinner
    var opts = {
      lines: 13, // The number of lines to draw
      length: 38, // The length of each line
      width: 17, // The line thickness
      radius: 45, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#ffffff', // CSS color or array of colors
      fadeColor: 'transparent', // CSS color or array of colors
      speed: 1, // Rounds per second
      rotate: 0, // The rotation offset
      animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
      direction: 1, // 1: clockwise, -1: counterclockwise
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '50%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: '0 0 1px transparent', // Box-shadow for the lines
      position: 'absolute' // Element positioning
    };

    var target = document.getElementById('spinnerDiv');
    spinner = new Spinner(opts).spin(target);
    
    
    //Set Max bounds for map to limit panning
    var bounds = [[51.3457868, -62.9513812],
    [22.7433195,-127.7844079]];
    if (screen.width > 1200){
	map = L.map('map',{
		//Sets default properties of the map
			center: [37,-96.55],
            zoom: 4,
            maxZoom:8,
            minZoom:4,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            keyboard: false
        });
    }

    if (screen.width <= 1200 && screen.width > 600){
        map = L.map('map',{
            //Sets default properties of the map
                center: [37,-96.55],
                zoom: 3,
                maxZoom:8,
                minZoom:3,
                maxBounds: bounds,
                maxBoundsViscosity: 1.0,
                doubleClickZoom: false,
                scrollWheelZoom: false,
                keyboard: false
            });
        }
    if (screen.width <= 600){
        map = L.map('map',{
            //Sets default properties of the map
                center: [37,-96.55],
                zoom: 3,
                maxZoom:8,
                minZoom:3,
                maxBounds: bounds,
                maxBoundsViscosity: 1.0,
                doubleClickZoom: false,
                scrollWheelZoom: false,
                keyboard: false
            });
        }
    
        
		//Add OSM baselayer
		L.tileLayer.provider('CartoDB.DarkMatterNoLabels').addTo(map);
		//Remove tile outlines
		(function(){
			var originalInitTile = L.GridLayer.prototype._initTile
			L.GridLayer.include({
				_initTile: function (tile) {
					originalInitTile.call(this, tile);
                    //Fix tile edges
					var tileSize = this.getTileSize();
                    //Add the dimensions
					tile.style.width = tileSize.x + .5 + 'px';
					tile.style.height = tileSize.y + 1 + 'px';
				}
			});
		})()
    
    // Change attributions; include disclaimer
    map.attributionControl.setPrefix('<div id = disclaimerLink>DISCLAIMER</div> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');
    //Add data to the map
    loadData(map);

    
    //Responsive design for mobile
    if($(window).width()<600){
        $('#dates-container').remove();
        $('.leaflet-control-attribution').remove();
        $('.leaflet-control-zoom').remove();
    }
    
};

//Function: Add barebones to map//
function ajaxCompleted(map){
    //Create layer groups from GeoJSON
    createLayerGroups();

    //Responsive design for mobile
    var timelineSlider;
    timelineSlider = createTimeline(map);
    addSearch(map);
    //Call create legend function
    
    createLegend(map);
    //Ensures that the legend loads with the correct first year
    updateLegend('1775');
    //Allow for scrollytelling watchers
    
    //Responsive design for mobile
    if($(window).width()>=600){

    createSectionWatchers(timelineSlider);
    //Add affordances to click dates
    makeDatesClickable();
    };
    //Insert Disclaimer
    addDisclaimer();  
    
    // Stop the spinner
    spinner.stop();
    $('#spinnerDiv').fadeOut(500);
    
}

function addDisclaimer(){
    $('#disclaimerLink').mouseover(function(){
        this.style.textDecoration = "underline";
    });
    $('#disclaimerLink').mouseout(function(){
        this.style.textDecoration = "initial";
    });
    $('#disclaimerLink').click(function(){
        showDisclaimer()
    });
    $('#xOut').click(function(){
        hideDisclaimer();
    })
};

function showDisclaimer(){
    $('#disclaimer').fadeIn(500);
    $('#disclaimerBackground').fadeIn(500);
};

function hideDisclaimer(){
    //$('#disclaimer').hide();
    //$('#disclaimerBackground').hide();
    $('#disclaimer').fadeOut(500);
    $('#disclaimerBackground').fadeOut(500);
};

function makeDatesClickable(){
    
    // Set a click event for each date to scroll to the corresponding div
    document.getElementById('date-1776').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1776').offset().top
        }, 1000);
    });

    document.getElementById('date-1787').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1787').offset().top
        }, 1000);
    });

    document.getElementById('date-1791').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1791').offset().top
        }, 1000);
    });

    document.getElementById('date-1803').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1803').offset().top
        }, 1000);
    });

    document.getElementById('date-1814').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1814').offset().top
        }, 1000);
    });

    document.getElementById('date-1819').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1819').offset().top
        }, 1000);
    });

    document.getElementById('date-1830').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1830').offset().top
        }, 1000);
    });

    document.getElementById('date-1848').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1848').offset().top
        }, 1000);
    });

    document.getElementById('date-1851').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1851').offset().top
        }, 1000);
    });

    document.getElementById('date-1871').addEventListener("click", function(){

        $('html, body').animate({
            scrollTop: $('#1871').offset().top
        }, 1000);

    });

    document.getElementById('date-1876').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1876').offset().top
        }, 1000);
    });

    document.getElementById('date-1887').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1887').offset().top
        }, 1000);
    });

    document.getElementById('date-1897').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1897').offset().top
        }, 1000);
    });

    document.getElementById('date-1906').addEventListener("click", function(){
        $('html, body').animate({
            scrollTop: $('#1906').offset().top
        }, 1000);
    });
    
    
    // Add mouseover events to underline the dates when hovered
    document.getElementById('date-1776').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1787').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1791').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1803').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1814').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1819').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1830').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1848').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1851').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1871').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1876').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1887').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1897').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    document.getElementById('date-1906').addEventListener("mouseover", function(){
        this.style.textDecoration = "underline";
    });
    
    // Add mouseout events to return the sytling to normal
    document.getElementById('date-1776').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1787').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1791').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1803').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1814').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1819').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1830').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1848').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1851').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1871').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1876').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1887').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1897').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
    document.getElementById('date-1906').addEventListener("mouseout", function(){
        this.style.textDecoration = "initial";
    });
}

function createSectionWatchers(timelineSlider){
    
    // Create watchers (scroll monitors) for each date
    var introWatcher = scrollMonitor.create($('#intro'), 1);
    var d1776Watcher = scrollMonitor.create($('#1776'), 1);
    var d1787Watcher = scrollMonitor.create($('#1787'), 1);
    var d1791Watcher = scrollMonitor.create($('#1791'), 1);
    var d1803Watcher = scrollMonitor.create($('#1803'), 1);
    var d1814Watcher = scrollMonitor.create($('#1814'), 1);
    var d1819Watcher = scrollMonitor.create($('#1819'), 1);
    var d1830Watcher = scrollMonitor.create($('#1830'), 1);
    var d1848Watcher = scrollMonitor.create($('#1848'), 1);
    var d1851Watcher = scrollMonitor.create($('#1851'), 1);
    var d1871Watcher = scrollMonitor.create($('#1871'), 1);
    var d1876Watcher = scrollMonitor.create($('#1876'), 1);
    var d1887Watcher = scrollMonitor.create($('#1887'), 1);
    var d1897Watcher = scrollMonitor.create($('#1897'), 1);
    var d1906Watcher = scrollMonitor.create($('#1906'), 1);

    // Add watch events to move timeline to corresponding date  
    introWatcher.fullyEnterViewport(function () {
        slideToDate(1775, timelineSlider);
    });
    
    d1776Watcher.fullyEnterViewport(function () {
        slideToDate(1776, timelineSlider);
    });
    
    d1787Watcher.fullyEnterViewport(function () {
        slideToDate(1787, timelineSlider);
    });
    
    d1791Watcher.fullyEnterViewport(function () {
        slideToDate(1791, timelineSlider);
    });
    
    d1803Watcher.fullyEnterViewport(function () {
        slideToDate(1803, timelineSlider);
    });
    
    d1814Watcher.fullyEnterViewport(function () {
        slideToDate(1814, timelineSlider);
    });
    
    d1819Watcher.fullyEnterViewport(function () {
        slideToDate(1819, timelineSlider);
    });
    
    d1830Watcher.fullyEnterViewport(function () {
        slideToDate(1830, timelineSlider);
    });
    
    d1848Watcher.fullyEnterViewport(function () {
        slideToDate(1848, timelineSlider);
    });
    
    d1851Watcher.fullyEnterViewport(function () {
        slideToDate(1851, timelineSlider);
    });
    d1871Watcher.fullyEnterViewport(function () {
        slideToDate(1871, timelineSlider);
    });
    d1876Watcher.fullyEnterViewport(function () {
        slideToDate(1876, timelineSlider);
    });
    
    d1887Watcher.fullyEnterViewport(function () {
        slideToDate(1887, timelineSlider);
    });
    
    d1897Watcher.fullyEnterViewport(function () {
        slideToDate(1897, timelineSlider);
    });
    
    d1906Watcher.fullyEnterViewport(function () {
        slideToDate(1906, timelineSlider);
    });
}

function removeSectionWatchers(){
    
    // Destroy watchers (scroll monitors) for each date
    if(introWatcher != undefined){introWatcher.destroy();};
    if(d1776Watcher != undefined){d1776Watcher.destroy();};
    if(d1787Watcher != undefined){d1787Watcher.destroy();};
    if(d1791Watcher != undefined){d1791Watcher.destroy();};
    if(d1803Watcher != undefined){d1803Watcher.destroy();};
    if(d1814Watcher != undefined){d1814Watcher.destroy();};
    if(d1819Watcher != undefined){d1819Watcher.destroy();};
    if(d1830Watcher != undefined){d1830Watcher.destroy();};
    if(d1848Watcher != undefined){d1848Watcher.destroy();};
    if(d1851Watcher != undefined){d1851Watcher.destroy();};
    if(d1871Watcher != undefined){d1871Watcher.destroy();};
    if(d1876Watcher != undefined){d1876Watcher.destroy();};
    if(d1887Watcher != undefined){d1887Watcher.destroy();};
    if(d1897Watcher != undefined){d1897Watcher.destroy();};
    if(d1906Watcher != undefined){d1906Watcher.destroy();};
    
}

// This function makes use of the timeout function in order to
// gradually increment/decrement the timeline slider to a specific
// date.
function slideToDate(newEndDate, timelineSlider){
    // Update the global endDate value
    endDate = newEndDate;
    // Update the slider after a 10 millisecond delay
    setTimeout(function(){updateSlider(timelineSlider)}, 10);
}

// This function works with slideToDate to increment/decrement
// the timeline slider to a specific date.
function updateSlider(timelineSlider){
    // Increment or decrement the slider towards the endDate
    if(endDate > timelineSlider.slider.value){
        timelineSlider.slider.value++;
    } else if (endDate < timelineSlider.slider.value){
        timelineSlider.slider.value--;
    }
    // Update everything with the new slider value
    updateLayerGroups(timelineSlider.slider.value);
    prevYear = timelineSlider.slider.value;
    updateLegend(timelineSlider.slider.value)

    // If we have not reached our end date yet, call this function again
    // with a 10 millisecond delay
    if(timelineSlider.slider.value != endDate){
        setTimeout(function(){updateSlider(timelineSlider)}, 10);
    }
}

//Function: Load all the data using AJAX//
function loadData(map, year){
    $.ajax("./data/NativeLand1880On.geojson", {
        dataType: "json",
        success: function(response){
            // Sort the data in yearMap by year
            processData(response);
            // Update number of completed Ajax requests
            numAjax++;
            // Create layer groups once all Ajax requests are completed and add to map
            if(numAjax == 3) {
                ajaxCompleted(map);
            };
        }
    });
    $.ajax("./data/NativeLandPre1880.geojson", {
        dataType: "json",
        success: function(response){
            // Sort the data in yearMap by year
            processData(response);
            // Update number of completed Ajax requests
            numAjax++;
            // Create layer groups once all Ajax requests are completed and add to map
            if(numAjax == 3) {
                ajaxCompleted(map);
            };
        }
    });
    $.ajax("./data/LandLostWithoutTreaty.geojson", {
        dataType: "json",
        success: function(response){
            // Sort the data in yearMap by year
            processData(response);
            // Update number of completed Ajax requests
            numAjax++;
            // Create layer groups once all Ajax requests are completed and add to map
            if(numAjax == 3) {
                ajaxCompleted(map);
            };
        }
    });
}

// Function to process data
function processData(data, map){
    var myStyle = {
        "color": "#dddddd",
        "weight": 2,
        "opacity": 1,
        "fill": true,
        "fillColor": "#ffffff",
        "fillOpacity": 1
    };
    dataLayer = L.geoJson(data, {
        style: myStyle,
        onEachFeature: onEachFeature
    });
};


    

// Creates group layers from yearMap
function createLayerGroups() {
    for (var [key, value] of yearMap.entries()){
        var layerGroup = L.featureGroup(value);
        layerGroup.setZIndex(1906 - key);
        layerGroups.set(key, layerGroup);
    }
}

// Updates group layers on map to match selected year on timeline
function updateLayerGroups(selectedYear){
    // Create an array of the key values in reverse
    var keys = Array.from(layerGroups.keys()).sort().reverse();
    // If we have moved forward in time, we will need to remove layers
    if (selectedYear > prevYear) {
        for(i = 0; i < keys.length; i++) {
            if (keys[i] > prevYear && keys[i] <= selectedYear) {
                for(j=0; j<layerGroups.get(keys[i]).getLayers().length; j++){
                    landLost += layerGroups.get(keys[i]).getLayers()[j].feature.properties.Square_Mil
                };
                map.removeLayer(layerGroups.get(keys[i]));
            }
        }

    // If we have moved backwards in time, we will need to add layers
    } else if (selectedYear < prevYear) {
        for(i = 0; i < keys.length; i++) {
            if (keys[i] <= prevYear && keys[i] > selectedYear) {
                for(j=0; j<layerGroups.get(keys[i]).getLayers().length; j++){
                    if(layerGroups.get(keys[i]).getLayers()[j].feature.properties.feature.layer._path.attributes.fill.value=='#008080'){
                        layerGroups.get(keys[i]).getLayers()[j].feature.properties.feature.layer.setStyle({
                            fillColor: '#ffffff',
                            dashArray: '',
                            fillOpacity: 1
                        });
                    
                    }
                    landGained += layerGroups.get(keys[i]).getLayers()[j].feature.properties.Square_Mil
                };

                map.addLayer(layerGroups.get(keys[i]));
                //layerGroups.get(keys[i]).bringToFront();
            }
        }

    } else if (selectedYear == 1775 && prevYear == 1775) {
        // We want to add the groups to the map starting with most recent
        // Work our way back (using our reverse order keys array)
        // Iterate through layer groups and add them to the map
        for(i = 0; i < keys.length; i++) {
            layerGroups.get(keys[i]).addTo(map);
            //layerGroups.get(keys[i]).bringToFront();
        }
    }
};

function addSearch(map){

    
    
    // Add search control to map
    var searchControl = L.control.fuseSearch();
    searchControl.addTo(map);
    
    // Create Clear Selection to remove all highlight from map
    L.Control.ClearSelection = L.Control.extend({
        onAdd: function(map) {
            var myDiv = L.DomUtil.create('div');
            myDiv.className = 'selection-list';

            return myDiv;
        },

        onRemove: function(map) {
        }
    });
    
    L.control.clearselection = function(opts) {
        return new L.Control.ClearSelection(opts);
    }
    
    // Add Clear Selection to map
    L.control.clearselection({ position: 'topright' }).addTo(map);
    
    // Get properties from layer groups to perform search on
    
    // Get keys for indexing
    var keys = Array.from(layerGroups.keys()).sort().reverse();
    // Create array to hold feature properties
    var featureProps = [];
    // Iterate through layer groups
    for(i = 0; i < keys.length; i++) {
        for(j=0; j<layerGroups.get(keys[i]).getLayers().length; j++){
            // Save the feature information for future use
            layerGroups.get(keys[i]).getLayers()[j].feature.properties.feature = layerGroups.get(keys[i]).getLayers()[j].feature;
            // Save the layer information for future use
            layerGroups.get(keys[i]).getLayers()[j].feature.properties.layer = layerGroups.get(keys[i]).getLayers()[j]
            // Add the properties to our array
            featureProps.push(layerGroups.get(keys[i]).getLayers()[j].feature.properties);
        }
    }
    // Pass the properties to the search function
    searchControl.indexFeatures(featureProps, ['Nation_Cor']);
}

//Function: to create the sequence controls for the interactive timeline//
function createTimeline(map){
    
    // Create additional Control placeholders for vertical centers of map
    function addControlPlaceholders(map) {
        var corners = map._controlCorners,
            l = 'leaflet-',
            container = map._controlContainer;
        //Create corners for controls
        function createCorner(vSide, hSide) {
            var className = l + vSide + ' ' + l + hSide;

            corners[vSide + hSide] = L.DomUtil.create('div', className, container);
        }
        createCorner('verticalcenter', 'left');
        createCorner('verticalcenter', 'right');
    }
    addControlPlaceholders(map);

    //Responsive design for mobile
    if($(window).width()>=600){

    // Create slider for timeline
    var timelineSlider = L.control.slider(function(value) {
        // Put function calls that use the slider value here
            updateLayerGroups(value);
            updateLegend(value);
            prevYear = value;
        // Update the endDate global variable if someone manually changes the timeline value
        endDate = value;
        }, 
        {
        // Styling the slider
        size: window.innerHeight + 'px',
        position: 'verticalcenterleft',
        id: 'timelineSlider',
        min: 1775,
        max: 1906,
        value: 1775,
        step: 1,
        collapsed: false,
        orientation: 'vertical',
        syncSlider: true,
        showValue: false,
        }).addTo(map);
    } else{
          // Create slider for timeline
    var timelineSlider = L.control.slider(function(value) {
        // Put function calls that use the slider value here
            updateLayerGroups(value);
            updateLegend(value);
            prevYear = value;
        // Update the endDate global variable if someone manually changes the timeline value
        endDate = value;
        }, 
        {
        // Styling the slider
        size: window.innerHeight + 'px',
        position: 'bottomleft',
        id: 'timelineSlider',
        min: 1775,
        max: 1906,
        value: 1775,
        step: 1,
        collapsed: false,
        orientation: 'horizontal',
        syncSlider: true,
        showValue: false,
        }).addTo(map);
  
    }
    
        
    //Responsive design for mobile
    if($(window).width()>=600){

    // After adding it to the map, update the arrangement of the dates along the timline
    // As of 5-9, this does not keep up with the responsive design.  Assigned using vh instead.
    //updateDatePlacement();
        
        
    };
    return timelineSlider;
}

// Function to update date's vertical spacing along the timeline to match the current height of the timeline
function updateDatePlacement() {
    
    // Variables for the math of calculating the position along the timeline
    var slideSelectorHeight = 15;
    var timelineHeight = (Number(document.getElementById("timelineSlider").style.width.split("px")[0]))-slideSelectorHeight;
    console.log(timelineHeight);
    var numYears = 1906-1775;
    var timelineOffsetHeight = 3.75; //1/4 slideSelectorHeight
    var yearPerPx = timelineHeight/numYears;

    // Update date placement along timeline
    document.getElementById('date-1776-').style.top = ((1776-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1787-').style.top = ((1787-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1791-').style.top = ((1791-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1803-').style.top = ((1803-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1814-').style.top = ((1814-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1819-').style.top = ((1819-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1830-').style.top = ((1830-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1848-').style.top = ((1848-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1851-').style.top = ((1851-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1871-').style.top = ((1871-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1876-').style.top = ((1876-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1887-').style.top = ((1887-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1897-').style.top = ((1897-1775)*yearPerPx+timelineOffsetHeight) + 'px';
    document.getElementById('date-1906-').style.top = ((1906-1775)*yearPerPx+timelineOffsetHeight) + 'px';
}

function onEachFeature(feature, layer) {
    // Does this feature have a property named Nation_Cor?
    if (feature.properties && feature.properties.Nation_Cor) {
        var popupContent = "<p><b>Nation(s):</b> " + feature.properties.Nation_Cor + "</p><p><b>Double Click for primary source</p></b>";
        //Create responsive popup that cannot extend beyond borders
        var popup=L.responsivePopup({offset: [25,25], autoPanPadding: [40,40], hasTip: false }).setContent(popupContent);
        layer.bindPopup(popup)
    };
    // Add event listeners to open the popup on hover
    layer.on({
        mouseover: highlightFeature,

        dblclick: function(){
            window.open(feature.properties.LinkRoyce)
        },
        mouseout: deHighlight,
    });
    
    /*** Sorting data by year value ***/
    // Does this feature have a property called Year_value?
    if (feature.properties && feature.properties.Year_value) {
        // Does this year already exist in the yearMap?
        if (yearMap.get(feature.properties.Year_value) != undefined){
            // If it does, add the layer to the entry
            yearMap.get(feature.properties.Year_value).push(layer);
        }else{
            // If it does not, create an entry
            yearMap.set(feature.properties.Year_value, [layer]);
        }
    }
    feature.layer = layer;
};

function filter(feature) {
    if (feature.properties && feature.properties.Cession_Da) {
        if (feature.properties.Cession_Da > TimeStamp){
            return true;
        }
    }
}

 //Function: highlight enumeration units and bars//
 function highlightFeature(e) {
    var layer = e.target;
    //Access old styles
    layer.options.oldFillColor = layer._path.attributes.fill.value;
    layer.setStyle({
        fillColor: '#006600',
        dashArray: '',
        fillOpacity: 1
    });
    this.openPopup()
}

//Function: dehighlight regions//
function deHighlight(e) {
    this.closePopup()
    var layer = e.target;
    layer.setStyle({
        fillColor: layer.options.oldFillColor
    });
}

function resetHighlight() {
    // Create an array of the key values in reverse
    var keys = Array.from(layerGroups.keys()).sort().reverse();
    // Iterate through layers
    for(i = 0; i < keys.length; i++) {
        for(j=0; j<layerGroups.get(keys[i]).getLayers().length; j++){
            dataLayer.resetStyle(layerGroups.get(keys[i]).getLayers()[j]);
        }
    }
}

//Function: create legend//
function createLegend(map){
    var LegendControl = L.Control.extend({
		options: {
			position: 'bottomright'
		},
            onAdd: function (map) {
                //Create the control container with a particular class name
                var container = L.DomUtil.create('div', 'legend-control-container');
                //Add temporal legend div to container
                $(container).append('<div id="temporal-legend">')
                //Start attribute legend div string to further be manipulated below 
                var div = L.DomUtil.create('div', 'attribute-legend');
                    categories = ['Native Land','Searched Native Land'];
                    symbols=['images/NativeLand.svg','images/SelectedTribe.svg',]
                //Iterate through the symbols
                for (var i = 0; i < symbols.length; i++) {
                    div.innerHTML += "<p>" + categories[i] + "</p>" + (" <img id='small' src="+ symbols[i] +" height='75' width='75'>");
                };
            //Add attribute legend to container
            $(container).append(div);
            return container
            }
        });
    map.addControl(new LegendControl());
};

//Function: Update the legend with new attribute//
function updateLegend(value){
    //Create Content for legend using the year and text
    if(value==1775){
        var content = '<p id=legend-title><strong>Year: '+ value + '<br>' + ' Approximate Land Lost: ' +  0 + '%'
        '</strong></p>'
    } else{
	var content = '<p id=legend-title><strong>Year: '+ value + '<br>' + ' Approximate Land Lost: ' +  parseInt((landLost-landGained)/(area)*(100)) + '%'
    '</strong></p>'}
	//Replace legend content with updated content
	$('#temporal-legend').html(content);
};   

/*****************************************************************************************

    The following is the code from spin.js
    I couldn't get import/export to work, so I'm cheating by placing it in directly

*****************************************************************************************/

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-default',
    rotate: 0,
    direction: 1,
    speed: 1,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: '0 0 1px transparent',
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign({}, defaults, opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        this.stop();
        this.el = document.createElement('div');
        this.el.className = this.opts.className;
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top,
            transform: "scale(" + this.opts.scale + ")",
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        drawLines(this.el, this.opts);
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());

/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
    var shadow = 'none';
    if (opts.shadow === true) {
        shadow = '0 2px 4px #000'; // default shadow
    }
    else if (typeof opts.shadow === 'string') {
        shadow = opts.shadow;
    }
    var shadows = parseBoxShadow(shadow);
    for (var i = 0; i < opts.lines; i++) {
        var degrees = ~~(360 / opts.lines * i + opts.rotate);
        var backgroundLine = css(document.createElement('div'), {
            position: 'absolute',
            top: -opts.width / 2 + "px",
            width: (opts.length + opts.width) + 'px',
            height: opts.width + 'px',
            background: getColor(opts.fadeColor, i),
            borderRadius: borderRadius,
            transformOrigin: 'left',
            transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)",
        });
        var delay = i * opts.direction / opts.lines / opts.speed;
        delay -= 1 / opts.speed; // so initial animation state will include trail
        var line = css(document.createElement('div'), {
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
        });
        backgroundLine.appendChild(line);
        el.appendChild(backgroundLine);
    }
}
function parseBoxShadow(boxShadow) {
    var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
    var shadows = [];
    for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
        var shadow = _a[_i];
        var matches = shadow.match(regex);
        if (matches === null) {
            continue; // invalid syntax
        }
        var x = +matches[2];
        var y = +matches[5];
        var xUnits = matches[4];
        var yUnits = matches[7];
        if (x === 0 && !xUnits) {
            xUnits = yUnits;
        }
        if (y === 0 && !yUnits) {
            yUnits = xUnits;
        }
        if (xUnits !== yUnits) {
            continue; // units must match to use as coordinates
        }
        shadows.push({
            prefix: matches[1] || '',
            x: x,
            y: y,
            xUnits: xUnits,
            yUnits: yUnits,
            end: matches[8],
        });
    }
    return shadows;
}
/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
    var normalized = [];
    for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
        var shadow = shadows_1[_i];
        var xy = convertOffset(shadow.x, shadow.y, degrees);
        normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
    }
    return normalized.join(', ');
}
function convertOffset(x, y, degrees) {
    var radians = degrees * Math.PI / 180;
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    return [
        Math.round((x * cos + y * sin) * 1000) / 1000,
        Math.round((-x * sin + y * cos) * 1000) / 1000,
    ];
}

/*****************************************************************************************

    This ends the code from spin.js

*****************************************************************************************/

$(document).ready(createMap);


$(window).resize(function(){
//Responsive design for mobile

if($(window).width()<600 && $(window).width()>570){
    location.reload();

}
});