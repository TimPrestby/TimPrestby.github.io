/**************************************************************************************************
This code was edited specifically for use within the "Remembering Native America" map by Joe Marks
***************************************************************************************************/

// A Map (data structure) to sort the layers by year
var combinedPropsMap = new Map();
var resultsMap = new Map();
var selectionMap = new Map();

// From http://www.tutorialspoint.com/javascript/array_map.htm
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

L.Control.FuseSearch = L.Control.extend({
    
    includes: L.Evented.prototype,
    
    options: {
        position: 'topright',
        title: 'Search',
        panelTitle: '',
        placeholder: 'Search',
        caseSensitive: false,
        threshold: 0.5,
        maxResultLength: null,
        showResultFct: null,
        showInvisibleFeatures: true
    },
    
    initialize: function(options) {
        L.setOptions(this, options);
        this._panelOnLeftSide = (this.options.position.indexOf("left") !== -1);
    },
    
    onAdd: function(map) {
        
        var ctrl = this._createControl();
        this._createPanel(map);
        this._setEventListeners();
        map.invalidateSize();
        
        return ctrl;
    },
    
    onRemove: function(map) {
        
        this.hidePanel(map);
        this._clearEventListeners();
        this._clearPanel(map);
        this._clearControl();
        
        return this;
    },
    
    _createControl: function() {

        var className = 'leaflet-fusesearch-control',
            container = L.DomUtil.create('div', className);

        // Control to open the search panel
        var butt = this._openButton = L.DomUtil.create('a', 'button', container);
        butt.href = '#';
        butt.title = this.options.title;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(butt, 'click', stop)
                  .on(butt, 'mousedown', stop)
                  .on(butt, 'touchstart', stop)
                  .on(butt, 'mousewheel', stop)
                  .on(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.on(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.on(butt, 'click', this.showPanel, this);

        return container;
    },
    
    _clearControl: function() {
        // Unregister events to prevent memory leak
        var butt = this._openButton;
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.off(butt, 'click', stop)
                  .off(butt, 'mousedown', stop)
                  .off(butt, 'touchstart', stop)
                  .off(butt, 'mousewheel', stop)
                  .off(butt, 'MozMousePixelScroll', stop);
        L.DomEvent.off(butt, 'click', L.DomEvent.preventDefault);
        L.DomEvent.off(butt, 'click', this.showPanel);
    },
    
    _createPanel: function(map) {
        var _this = this;

        // Create the search panel
        var mapContainer = map.getContainer();
        var className = 'leaflet-fusesearch-panel',
            pane = this._panel = L.DomUtil.create('div', className, mapContainer);
        
        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(pane, 'click', stop)
                .on(pane, 'dblclick', stop)
                .on(pane, 'mousedown', stop)
                .on(pane, 'touchstart', stop)
                .on(pane, 'mousewheel', stop)
                .on(pane, 'MozMousePixelScroll', stop);

        // place the pane on the same side as the control
        if (this._panelOnLeftSide) {
            L.DomUtil.addClass(pane, 'left');
        } else {
            L.DomUtil.addClass(pane, 'right');
        }

        // Intermediate container to get the box sizing right
        var container = L.DomUtil.create('div', 'content', pane);
        
        var header = L.DomUtil.create('div', 'header', container);
        if (this.options.panelTitle) {
           var title = L.DomUtil.create('p', 'panel-title', header);
            title.innerHTML = this.options.panelTitle;
        }
        
        // Search image and input field
        L.DomUtil.create('img', 'search-image', header);
        this._input = L.DomUtil.create('input', 'search-input', header);
        this._input.maxLength = 30;
        this._input.placeholder = this.options.placeholder;
        this._input.onkeyup = function(evt) {
            var searchString = evt.currentTarget.value;
            _this.searchFeatures(searchString);
        };

        // Close button
        var close = this._closeButton = L.DomUtil.create('a', 'close', header);
        close.innerHTML = '&times;';
        L.DomEvent.on(close, 'click', this.hidePanel, this);
        
        // Where the result will be listed
        this._resultList = L.DomUtil.create('div', 'result-list', container); 
        
        return pane;
    },
    
    _clearPanel: function(map) {

        // Unregister event handlers
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.off(this._panel, 'click', stop)
                  .off(this._panel, 'dblclick', stop)
                  .off(this._panel, 'mousedown', stop)
                  .off(this._panel, 'touchstart', stop)
                  .off(this._panel, 'mousewheel', stop)
                  .off(this._panel, 'MozMousePixelScroll', stop);

        L.DomEvent.off(this._closeButton, 'click', this.hidePanel);
        
        var mapContainer = map.getContainer();
        mapContainer.removeChild(this._panel);
        
        this._panel = null;
    },
    
    _setEventListeners : function() {
        var that = this;
        var input = this._input;
        this._map.addEventListener('overlayadd', function() {
            that.searchFeatures(input.value);
        });
        this._map.addEventListener('overlayremove', function() {
            that.searchFeatures(input.value);
        });
    },
    
    _clearEventListeners: function() {
        this._map.removeEventListener('overlayadd');
        this._map.removeEventListener('overlayremove');        
    },
    
    isPanelVisible: function () {
        return L.DomUtil.hasClass(this._panel, 'visible');
    },

    showPanel: function () {
        if (! this.isPanelVisible()) {
            L.DomUtil.addClass(this._panel, 'visible');
            // Preserve map centre
            this._map.panBy([this.getOffset() * 0.5, 0], {duration: 0.5});
            this.fire('show');
            this._input.select();
            // Search again as visibility of features might have changed
            this.searchFeatures(this._input.value);
        }
        var selectionList = document.querySelector('.selection-list');
        var panelHeight = document.querySelector('.leaflet-fusesearch-panel').offsetHeight;
        selectionList.style.marginTop = panelHeight + 'px';
    },

    hidePanel: function (e) {
        if (this.isPanelVisible()) {
            L.DomUtil.removeClass(this._panel, 'visible');
            // Move back the map centre - only if we still hold this._map
            // as this might already have been cleared up by removeFrom()
            if (null !== this._map) {
                this._map.panBy([this.getOffset() * -0.5, 0], {duration: 0.5});
            };
            this.fire('hide');
            if(e) {
                L.DomEvent.stopPropagation(e);
            }
        }
        var selectionList = document.querySelector('.selection-list');
        selectionList.style.marginTop = '8px';
    },
    
    getOffset: function() {
        if (this._panelOnLeftSide) {
            return - this._panel.offsetWidth;
        } else {
            return this._panel.offsetWidth;
        }
    },

    indexFeatures: function(featureProps, keys) {

        
        this._keys = keys;
 
        var options = {
            keys: keys,
            caseSensitive: this.options.caseSensitive,
            threshold : this.options.threshold
        };
        // Create fuse index using feature properties and passed in keys (options)
        this._fuseIndex = new Fuse(featureProps, options);
    },
    
    searchFeatures: function(string) {
        
        var result = this._fuseIndex.search(string);

        // Empty result list
        var listItems = document.querySelectorAll(".result-item");
        for (var i = 0 ; i < listItems.length ; i++) {
            listItems[i].remove();
        }

        var resultList = document.querySelector('.result-list');
        var selectionList = document.querySelector('.selection-list');
        var num = 0;
        var max = this.options.maxResultLength;
        // For each entry in result
        for (var i in result) {
            var props = result[i];
            var feature = props._feature;
            this.createResultItem(props, resultList, selectionList)
        }
    },
    
    refresh: function() {
        // Reapply the search on the indexed features - useful if features have been filtered out
        if (this.isPanelVisible()) {
            this.searchFeatures(this._input.value);
        }
    },
    
    _getFeaturePopupIfVisible: function(feature) {
        var layer = feature.layer;
        if (undefined !== layer && this._map.hasLayer(layer)) {
            return layer.getPopup();
        }
    },
    

    
    createResultItem: function(props, container, selectionContainer) {
        
        var _this = this;
        var feature = props.feature;

        
        // Check if props in map
        
        
        // Does this result already exist in the resultsMap
        var resultItem;
        console.log(props.Nation_Cor);
        console.log(props.Year_value);
        if((resultItem = resultsMap.get(props.Nation_Cor+props.Year_value)) != undefined) {
            // If it does, remove the old entry from the container
            L.DomUtil.remove(resultItem);
            // Create a new entry and place it in the container
            resultItem = L.DomUtil.create('p', 'result-item', container);
            // Replace the entry in the results map
            resultsMap.set(props.Nation_Cor+props.Year_value, resultItem);
            
            // Add the props to the our combined props map
            combinedPropsMap.get(props.Nation_Cor+props.Year_value).set(props.layer, props.layer);
        }else{
            // If it does not exist in the results map
            // Create a new entry and place it in the container
            resultItem = L.DomUtil.create('p', 'result-item', container);
            // Place the entry in the results map
            resultsMap.set(props.Nation_Cor+props.Year_value, resultItem);
            // Create an entry for our combined props map
            combinedPropsMap.set(props.Nation_Cor+props.Year_value, myMap = new Map());
            combinedPropsMap.get(props.Nation_Cor+props.Year_value).set(props.layer, props.layer);
        }
        
        L.DomUtil.addClass(resultItem, 'clickable');
        resultItem.onclick = function() {
            // Select (highlight) corresponding layers on click
            // Get the corresponding layers for what was clicked
            var values = Array.from(combinedPropsMap.get(props.Nation_Cor+props.Year_value).values())
            for(i = 0; i < values.length; i++){
                // Set the style for highlight
                values[i].setStyle({
                fillColor: '#009900',
                dashArray: '',
                fillOpacity: 1
                });
            }
            
            // Check if this is the first item added to our selected list
            if (selectionMap.size == 0) {
                // If it is, add in the title and the "Clear all" item
                
                // Create the title and add it to the div
                titleDiv = document.createElement('div');
                titleDiv.className ='selection-list-title';
                titleDiv.innerHTML = "Selected Names:";
                selectionContainer.appendChild(titleDiv);
                
                // Create the Clear All item
                var selectedItem = L.DomUtil.create('p', 'selected-item', selectionContainer);
                
                // Add text to Clear All
                selectionContent = document.createElement('div');
                selectionContent.className ='selection-content';
                str = '<b>Clear All</b>';
                selectionContent.innerHTML=str;
                selectedItem.appendChild(selectionContent);
                
                // Add X for affordance
                selectionX = document.createElement('div');
                selectionX.className ='selection-x';
                selectionX.innerHTML = " &times";
                selectedItem.appendChild(selectionX);
                
                // Add clickability functionality to Clear All
                L.DomUtil.addClass(selectedItem, 'clickable');
                selectedItem.onclick = function() {
 
                    // Get the all layers
                    var values1 = Array.from(combinedPropsMap.values());
                    for(j = 0; j< values1.length; j++){
                        var values = Array.from(values1[j].values())
                        for(i = 0; i < values.length; i++){
                            // Set the style for highlight to default
                            values[i].setStyle({
                            fillColor: 'rgb(255, 255, 255)',
                            dashArray: '',
                            fillOpacity: 1
                            });
                        }
                    }
                    // Remove the item from the selection map and the selection container
                    selectionMap.clear();
                    // Empty selection list
                    var listItems = document.querySelectorAll(".selected-item");
                    for (var i = 0 ; i < listItems.length ; i++) {
                        listItems[i].remove();
                    }
                    // Remove the title
                    titleDiv.remove();
                }// End selectedItem onclick
                
                
            }
            
            
            // Add props from the combined Props map to the selection map if needed
            if((selectionMap.get(props.Nation_Cor+props.Year_value)) != undefined) {
                // If it already exists in the map, nothing else to do
            }else{
                // If it does not exist in the map, add it
                selectionMap.set(props.Nation_Cor+props.Year_value, props);
                
                // Create a selected item and place it in the selectionContainer
                var selectedItem = L.DomUtil.create('p', 'selected-item', selectionContainer);
                
                // Add text to selectedItem
                selectionContent = document.createElement('div');
                selectionContent.className ='selection-content';
                str = '<b>' + props.Nation_Cor+' - '+props.Year_value + '</b>';
                selectionContent.innerHTML=str;
                selectedItem.appendChild(selectionContent);
                
                // Add X for affordance
                selectionX = document.createElement('div');
                selectionX.className ='selection-x';
                selectionX.innerHTML = " &times";
                selectedItem.appendChild(selectionX);
                
                L.DomUtil.addClass(selectedItem, 'clickable');
                selectedItem.onclick = function() {
 
                    // Get the corresponding layers for what was clicked
                    var values = Array.from(combinedPropsMap.get(props.Nation_Cor+props.Year_value).values())
                    for(i = 0; i < values.length; i++){
                        // Set the style for highlight to default
                        values[i].setStyle({
                        fillColor: 'rgb(255, 255, 255)',
                        dashArray: '',
                        fillOpacity: 1
                        });
                    }
                    // Remove the item from the selection map and the selection container
                    selectionMap.delete(props.Nation_Cor+props.Year_value);
                    L.DomUtil.remove(selectedItem);
                    
                    // Check if this was the last item in the selection container
                    if (selectionMap.size == 0) {
                        // Remove Clear All and title if so
                        // Empty selection list
                        var listItems = document.querySelectorAll(".selected-item");
                        for (var i = 0 ; i < listItems.length ; i++) {
                            listItems[i].remove();
                        }
                        // Remove title
                        document.querySelector(".selection-list-title").remove();
                    }
                }// End selectedItem onclick
            }// End else statement
        }// End resultItem onclick
        
        
            
        // Fill in the container with the user-supplied function if any,
        // otherwise display the feature properties used for the search.

        if (null !== this.options.showResultFct) {
            this.options.showResultFct(feature, resultItem);
        } else {
            // console.log(this);
            // console.log(this._keys);
            // console.log(props);
            // console.log(props[this._keys[0]]);
            // console.log(props["Year_value"]);
            str = '<b>' + props[this._keys[0]] + '</b>';
            for (var i = 1; i < this._keys.length; i++) {
                str += '<br/>' + props[this._keys[i]];
                // console.log(props[this._keys[i]]);
            }
            str += " - " + props["Year_value"];
            resultItem.innerHTML = str;
        };

        return resultItem;
    },
    
});

L.control.fuseSearch = function(options) {
    return new L.Control.FuseSearch(options);
};
