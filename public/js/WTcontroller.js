
(function(){
    
    //WTcontroller.$inject = ['$scope', '$http'];
    function WTcontroller($scope, $http){
        var vm = this;
        
        //WISP details to sync with GUI
        vm.title = "";
        vm.description = "";
        vm.photo = "";
        vm.email = "";
        vm.responseText = "";
        vm.responses = [];
        
        vm.showResponseBox = false;
        
        vm.WISPlist = {};  // all WISPs that have a marker on the map
        
        vm.marker;  // active marker, if any
        vm.count = 0;  //to be replaced when server provides WISP id
        vm.map;
        vm.coords = {lat: 0, lng: 0}; 
        vm.initMap = function(coords, zoom){
            vm.map = new google.maps.Map(document.getElementById('map'), {
                center: coords,
                zoom: zoom,
                disableDoubleClickZoom: true
            });
            
            // create info windows
            vm.WISPdetails = new google.maps.InfoWindow();
            vm.WISPdetails.setContent(document.getElementById('wisp-display'));
            
            vm.WISPcreate = new google.maps.InfoWindow();
            vm.WISPcreate.setContent(document.getElementById('wisp-template'));
            vm.WISPcreate.addListener('closeclick', function(e){
                vm.marker.setMap(null);
            });
            
            $http.get("/api/wisps")
            .then(function(response){
                var data = response.data;
                for(var p in response.data){
                    (function(){
                        var mar = addWISPMarker(vm.map, {lat: data[p].loc.lat, lng: data[p].loc.lon});
                    mar.id = data[p].id;
                    mar.title = data[p].title;
                    mar.addListener('click', function(e){
                        vm.marker = mar;

                        $http.get("/api/wisp/" + mar.id)
                        .then(function success(response){
                            wisp = response.data;
                            vm.displayWISP(wisp, vm.map, mar);
                        },
                        function failure(response){
                            console.log(response);
                            vm.warn("WISP not found");
                        });
                    });
                })();
                }
            }, function(response){
                console.log("something went wrong");
            });
            
            // create double-click listener
            vm.map.addListener('dblclick', function(e){

                var m = addWISPMarker(vm.map, e.latLng);  
                vm.marker = m;
                vm.clear();
                vm.WISPcreate.open(vm.map, m);
                document.getElementById('wisp-template').style = "display:block";
                
                // create marker listener
                m.addListener('click', function(e){
                    vm.marker = m;

                    // get WISP data from server
                    $http.get("/api/wisp/" + m.id)
                    .then(function success(response){
                        wisp = response.data;
                        vm.displayWISP(wisp, vm.map, m);
                    },
                    function failure(response){
                        console.log(response);
                        vm.warn("WISP not found");
                    });

                });
                
                
            });
        }
        
        vm.warn = function(message){
            return
        }
        
        vm.clear = function(){
            vm.title = "";
            vm.description = "";
            vm.photo = "";
            vm.responses = [];
            $scope.$digest();
        }
        
        vm.setDetails = function(vm, wisp){
            console.log(wisp);
            vm.title = wisp['title'];
            vm.description = wisp['description'];
            vm.photos = wisp['photos'];
            vm.responses = wisp['responses'];
            vm.showResponseBox = false;
            vm.responseText = "";
            //$scope.$digest();
        }
        
        vm.displayWISP = function(wisp, map, marker){
            vm.setDetails(vm, wisp);
            vm.WISPdetails.open(map, marker);
            document.getElementById('wisp-display').style = "display:block";
        }
        
        vm.createWisp = function(){
            pos = vm.marker.getPosition(); 
            var wisp = {
                title: vm.title,
                description: vm.description,
                email: vm.email,
                lat: pos.lat(),
                lon: pos.lng(),
                photos: []
            };

            //Send WISP to server
            $http.post("/api/wisps", wisp)
            .then(function(response){
                wisp = response.data
                vm.marker.id = wisp['id'];
                vm.WISPcreate.close();
                vm.displayWISP(wisp, vm.map, vm.marker);
            }, function(response){
               vm.warn("Unable to create wisp"); 
            });

        }
        
        vm.addResponse = function(){
            vm.showResponseBox = true;
        }
        
        vm.submitResponse = function(){

            $http.post("/api/wisp/" + vm.marker.id, {message: vm.responseText})
            .then(function(response){
                wisp = JSON.parse(response);
                displayWISP(wisp, vm.map, vm.marker);
            }, function(response){
                console.log(response);
            });
            
        }
        
        vm.cancelResponse = function(){
            vm.responseText = "";
            vm.showResponseBox = false;
        }
        
        vm.print = function(){
            console.log(JSON.stringify(vm.WISPlist[vm.marker.id]));
        }
        
        vm.update = function(){
            $scope.$apply();
        }    
        
        // Get current location, if available and initialize map
        navigator.geolocation 
        ? navigator.geolocation.getCurrentPosition(function(position){
            vm.coords = {lat: position.coords.latitude, lng: position.coords.longitude};
            vm.initMap(vm.coords, 14);
        }, function(){
            vm.initMap({lat: 39, lng: -98.5}, 4);
        }) 
        : function(){
            vm.initMap({lat: 39, lng: -98.5}, 4);
        }();

    }
    angular.module('WTapp')
    .controller('WTcontroller', ['$scope', '$http', WTcontroller]);
    
    function addWISPMarker(map, coords){ 
        var marker = new google.maps.Marker({
            map: map,
            position: coords
        });
        return marker;
    }
    
  
})();
