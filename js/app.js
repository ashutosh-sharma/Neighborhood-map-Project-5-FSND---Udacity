/* ----Global Variables---- */
// map refrenece which will be intialised after API async call to google maps servers
let map;

// Info Window refrence
let infoWindow;

/* Following MVVM structure - Model View ViewModel */

/* locations collection -- model array */
var locations = [{
    name: "Barbeque Nation",
    id: "4bbf61eef353d13a29837e10",
    lat: 30.725676,
    lng: 76.805326,
    visible: true
}, {
    name: "Pal Dhaba",
    id: "4f452610e4b061ee9870084d",
    lat: 30.7191,
    lng: 76.8015,
    visible: true
}, {
    name: "Tao Asian Restaurant",
    id: "4ccc31f6ba0a5481a5763b59",
    lat: 30.726592,
    lng: 76.803536,
    visible: true
}, {
    name: "Mainland China",
    id: "4b8a5453f964a520bb6832e3",
    lat: 30.725227,
    lng: 76.805645,
    visible: true
}, {
    name: "Oven Fresh",
    id: "4df2273c22718759f81a540e",
    lat: 30.725882,
    lng: 76.804921,
    visible: true
}];

/* Functions  - VIEWMODEL */

var viewModel = function() {

    var self = this;
    self.markers = [];

    // making the location model array observable
    locations: ko.observableArray(locations);
    self.locations = locations;

    // Making a knockout observable to observe value of the search field
    self.searchString = ko.observable('');

    // Defining 'infoWindow' global variable
    infoWindow = new google.maps.InfoWindow();

    // bounds for markers
    var bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < locations.length; i++) {
        if (locations[i].visible === true) {
            putOnMapUtil(locations[i].lat, locations[i].lng, locations[i].name, locations[i].id);
            let position = {
                lat: locations[i].lat,
                lng: locations[i].lng
            };
        }
    }

    // To put a marker on the map
    function putOnMapUtil(latArg, lngArg, name, uniqueId) {
        let uluru = {
            lat: latArg,
            lng: lngArg
        };
        var highlightedIcon = makeMarkerIcon('00FF00');
        var defaultIcon = makeMarkerIcon('f4b042');
        var clickedIcon = makeMarkerIcon('73efdf')

        // creating the marker for the latArg and lngArg passed in parameters
        var marker = new google.maps.Marker({
            position: uluru,
            map: map,
            animation: google.maps.Animation.DROP,
            title: name,
            show: ko.observable(true),
            id: uniqueId
        });

        bounds.extend(marker.position);

        // mouseover event for marker
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        // mouseout event for marker
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

        marker.addListener('click', function() {
            this.setIcon(clickedIcon);
            putMarkerInfoWindow(marker);
        });

        // pushing marker to global marker array
        self.markers.push(marker);
        map.fitBounds(bounds);
    }

    function putMarkerInfoWindow(marker) {
        var id = marker.id;
        console.log('Fetching content for: ' + marker.title + ' (Powered by FourSquare)');
        for (let i = 0; i < locations.length; i++) {
            if (id == locations[i].id) {
                $.ajax({
                    type: "GET",
                    // Url with Unique Client Id and Unique Client Secret Id for this project
                    url: "https://api.foursquare.com/v2/venues/" + locations[i].id + "?ll=40.7,-74&client_id=D3DQAFAV3CGMMYFXRIJDWNDOJ4ESDVGYKRAF3ZPJLIY0YN3M&client_secret=NKDMSDN40ADUCDKE2C4W1VWFF0GFNU1RFLXUB4TCEWL3G10J&v=20180323",
                    dataType: "json",
                    // Success  method. Called if data fetching is successful
                    success: function(data) {
                        // stores ratings to be displayed
                        var rt = data.response.venue;
                        // adds rating to the marker
                        self.markers[i].rating = rt.hasOwnProperty('rating') ? rt.rating : "";

                        self.markers[i].city = rt.hasOwnProperty('location') ? rt.location.city : "";
                        console.log('Data succesfully fetched!');
                        putInfoWindowUtil(self.markers[i], infoWindow);
                    },
                    // Error method. Called if data fetching fails
                    error: function(e) {
                        self.markers[i].rating = "Failed to fetch data";
                        console.log('Failed to fetch data from API');
                        putInfoWindowUtil(self.markers[i], infoWindow);
                    }
                });
            }
        }
    }

    // Transiting marker icon styles
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    // This function will populate infoWindow when marker is clicked, and give information regarding that particular marker
    function putInfoWindowUtil(marker, infoWindow) {
        if (infoWindow.marker != marker) {
            infoWindow.marker = marker;
            // var data = fetchDataFromFourSquare(marker);

            infoWindow.setContent('<div>' + 'Name: ' + marker.title + '<br>' + 'Rating: ' + marker.rating + '<br>' + 'City: ' + marker.city + '<br>' + 'Powered by: ' + '<i class="fa fa-foursquare"></i>' + '</div>');
            infoWindow.open(map, marker);
            // clearing the marker property when infoWindow is closed
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
                infoWindow.close();
            });
        }
    }

    self.putInfoWindow = function() {
        var id = this.id;
        console.log('Fetching content for: ' + this.title + ' (Powered by FourSquare)');
        for (let i = 0; i < locations.length; i++) {
            if (id == locations[i].id) {
                $.ajax({
                    type: "GET",
                    // Url with Unique Client Id and Unique Client Secret Id for this project
                    url: "https://api.foursquare.com/v2/venues/" + locations[i].id + "?ll=40.7,-74&client_id=D3DQAFAV3CGMMYFXRIJDWNDOJ4ESDVGYKRAF3ZPJLIY0YN3M&client_secret=NKDMSDN40ADUCDKE2C4W1VWFF0GFNU1RFLXUB4TCEWL3G10J&v=20180323",
                    dataType: "json",
                    // Success  method. Called if data fetching is successful
                    success: function(data) {
                        // stores ratings to be displayed
                        var rt = data.response.venue;
                        // adds rating to the marker
                        self.markers[i].rating = rt.hasOwnProperty('rating') ? rt.rating : "";

                        self.markers[i].city = rt.hasOwnProperty('location') ? rt.location.city : "";
                        console.log('Data succesfully fetched!');
                        putInfoWindowUtil(self.markers[i], infoWindow);
                    },
                    // Error method. Called if data fetching fails
                    error: function(e) {
                        self.markers[i].rating = "Failed to fetch data";
                        console.log('Failed to fetch data from API');
                        putInfoWindowUtil(self.markers[i], infoWindow);
                    }
                });
            }
        }
    }

    this.searchBar = function() {
        
        infoWindow.marker = null;
        infoWindow.close();
        
        // taking input
        var searchStr = this.searchString();

        // SetVisibility() of all markers which don't match the searchString
        for (var i = 0; i < self.markers.length; i++) {
            if (searchStr.length === 0) {
                for (i = 0; i < self.markers.length; i++) {
                    self.markers[i].show(true);
                    self.markers[i].setVisible(true);
                }
            } else {
                for (i = 0; i < self.markers.length; i++) {
                    if (self.markers[i].title.toLowerCase().indexOf(searchStr.toLowerCase()) > -1) {
                        self.markers[i].show(true);
                        self.markers[i].setVisible(true);
                    } else {
                        self.markers[i].show(false);
                        self.markers[i].setVisible(false);
                    }
                }
            }
        }
    };
};

// Intialising map with call to google maps server (API call)
function initMap() {
    // setting map's center cordinates
    let center_cor = {
        lat: 30.7266018,
        lng: 76.803962
    };

    // setting global map variable to render map in the app
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: center_cor
    });

    // binding after the google map has been loaded
    ko.applyBindings(new viewModel());
}

// Error handling-if some error occurs during map loading
function mapLoadError() {
    document.getElementById('map').innerHTML = "<h1>Unable to load the map due to some error.</h1>";
}
