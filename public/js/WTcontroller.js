(function(){
    
    WTcontroller.$inject = ['$scope', '$http'];
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
        vm.initMap = function(coords){
            vm.map = new google.maps.Map(document.getElementById('map'), {
                center: coords,
                zoom: 14,
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
            
            // create double-click listener
            vm.map.addListener('dblclick', function(e){

                var m = addWISPMarker(vm, e.latLng, vm.count++);  //TODO update to not take id
                vm.marker = m;
                vm.clear();
                vm.WISPcreate.open(vm.map, m);
                document.getElementById('wisp-template').style = "display:block";
                
                // create marker listener
                m.addListener('click', function(e){
                    //vm.marker = m;
                    
                    
                    // get WISP data from server
                    wisp = vm.WISPlist[m.id];
                    /*
                    $http.get("/wisp/:" + m.id)
                    .then(function success(response){
                        wisp = JSON.parse(response);
                        displayWISP(wisp, vm.map, m);
                    },
                    function failure(response){
                        //vm.alert("WISP not found");
                    });
                    */
                    
                    
                    vm.setDetails(vm, wisp);
                    vm.WISPdetails.open(vm.map, m);
                    document.getElementById('wisp-display').style = "display:block";
                });
                
                
            });
        }
        
        vm.clear = function(){
            vm.title = "";
            vm.description = "";
            vm.photo = "";
            vm.responses = [];
            $scope.$digest();
        }
        
        vm.setDetails = function(vm, wisp){
            vm.title = wisp.details['title'];
            vm.description = wisp.details['description'];
            vm.photo = wisp.details['photo'];
            vm.responses = wisp.details['responses'];
            vm.showResponseBox = false;
            vm.responseText = "";
            $scope.$digest();
        }
        
        vm.displayWISP = function(wisp, map, marker){
            setDetails(vm, wisp);
            vm.WISPdetails.open(map, marker);
            document.getElementById('wisp-display').style = "display:block";
        }
        
        vm.createWisp = function(){
            pos = vm.marker.getPosition();
            
            var wisp = new WISP({
                "title": vm.title,
                "description": vm.description,
                "email": vm.email,
                "photo": vm.photo,
                "loc": {
                    "lat": pos.lat(),
                    "lon": pos.lng()
                   },
                "creation_date": ""
            });
            
            var wisp = {
                "title": vm.title,
                "description": vm.description,
                "email": vm.email,
                "lat": pos.lat(),
                "lon": pos.lng()   
            }

            
            // 
            /* Send WISP to server
            http.post("/wisps", data)
            .then(function(response){
                wisp = JSON.parse(response);
                vm.marker.id = wisp['id'];
                displayWISP(wisp, vm.map, vm.marker);
            }, function(response){
               vm.alert("Unable to create wisp"); 
                
            });
            */
            
            // add wisp to active list
            vm.WISPlist[vm.marker.id] = wisp;
            vm.WISPcreate.close();

        }
        
        vm.addResponse = function(){
            vm.showResponseBox = true;
        }
        
        vm.submitResponse = function(){
            vm.WISPlist[vm.marker.id].addResponse(vm.responseText);
            
            /* send request to server
            $http.post("/api/wisp/:" + vim.marker.id, data)
            .then(function(response){
                wisp = JSON.parse(response);
                displayWISP(wisp, vm.map, vm.marker);
            }, function(){
                
            });
            
            */
            
            vm.responseText = "";
            vm.showResponseBox = false;
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
            vm.initMap(vm.coords);
        }, function(){
            vm.initMap(vm.coords);;
        }) 
        : function(){
            vm.initMap(vm.coords);;
        }();

    }
    angular.module('WTapp')
    .controller('WTcontroller', ['$scope', WTcontroller]);
    
    function addWISPMarker($scope, coords, id){ 
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: coords,
            title: String($scope.count),
            id: id
        });
        return marker;
    }
    
  
})();
