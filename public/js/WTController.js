(function(){
    
    function WTController($scope, clientService){
        
        var ui = this;
        
        // Data Model
            
        ui.newWisp = {
            title: "",
            description: "",
            image: null,
            email: "",
        }
        
        ui.displayWISP = {
            title: "",
            description: "",
            photo: "",
            responses: [],
            timestamp: null,
            email: "",
            loc: {}
        
        }; 
        
        ui.email = "";
        ui.saveEmail = false;
    
        ui.response = {
            showBox: false,
            responseText: ""
        }
        
        
        ui.activeMarker = null;  // active marker, if any
        ui.allMarkers = {}
        ui.displayMarkers = []
        ui.map = null;
        ui.filter = false;
        
        ui.lastUpdate = null;
        
        // UI Controller
        
        
        // Methods exposed to UI view
        
        ui.createWISP = function(){
            pos = ui.activeMarker.getPosition(); 
            var wisp = JSON.parse(JSON.stringify(ui.newWisp));
            wisp.lat = pos.lat();
            wisp.lon = pos.lng();
            
            if(!wisp.email){
                alert("Please enter an email address");
                return;
            }
            
            wisp.email = wisp.email.toLowerCase();
            
            var promise = clientService.createWISP(wisp);
            promise.then(function(response){
                registerWISP(response.data);
                setDisplay(response.data);
                displayWISP(response.data);
            }, warn);
        }
        
        ui.deleteWISP = function(){
            id = ui.activeMarker.id;
            
            var promise = clientService.deleteWISP(id);
            promise.then(function(response){
                console.log(response);
                deleteMarker(ui.allMarkers[id]);
            }, warn);
        }
        
        ui.filterWISPs = function(email){
            ui.email = email.toLowerCase();
            var promise = clientService.pollWISPs(dt = null, email = ui.email);
            
            promise.then(function(response){
                console.log(response.data);
                setNewWISPMarkers(response.data);
                for(var i in response.data){
                    
                    ui.displayMarkers.push(ui.allMarkers[response.data[i]['id']])
                }
                Object.values(ui.allMarkers).map(x => x.setMap(null));
                ui.displayMarkers.map(x => x.setMap(ui.map));
            }, warn);
            
  
        }
        
        ui.clearFilter = function(){
            ui.email = "";
            Object.values(ui.allMarkers).map(x => x.setMap(ui.map));
            ui.displayMarkers = [];
        }
        
        ui.submitResponse = function(){
            if(ui.response.responseText.length < 10){
                alert("Responses must be at least 10 characters long");
                return;
            }
            var promise = clientService.addResponse(ui.activeMarker.id, ui.response.responseText);
            promise.then(function(response){
                setDisplay(response.data);
                displayWISP(response.data);
            }, warn);
            
        }
        
        
        
        //internal methods
        
        function initMap(coords, zoom){
            ui.map = new google.maps.Map(document.getElementById('map-panel'), {
                center: coords,
                zoom: zoom,
                disableDoubleClickZoom: true
            });
        }
        function init(coords, zoom){
            
            initMap(coords, zoom);
            
            // create info window
            ui.infoWindow = new google.maps.InfoWindow();
            ui.infoWindow.addListener('closeclick', function(e){
                checkMarker(ui.activeMarker);
            });
            ui.WISPdisplay = document.getElementById("wisp-display");
            ui.WISPtemplate = document.getElementById("wisp-template");
            
            ui.map.addListener('dblclick', function(e){
                
                var m = addMarker(ui.map, e.latLng);  
                clearNewWISP();
                focusMarker(m);
                showWISPtemplate(m);

                m.addListener('click', createMarkerListener(m));
            });
            
            pollWISPs();
            ui.lastUpdate = new Date().getTime();
            synchronize(60000);
        }
        function pollWISPs(){
            var promise = clientService.pollWISPs();
            promise.then(function(response){
                setNewWISPMarkers(response.data);
            }, warn);
        }
        function synchronize(interval){
            setInterval(function(){
                var newTime = new Date().getTime()
                var promise = clientService.pollWISPs(ui.lastUpdate);
                promise.then(function(response){
                    setNewWISPMarkers(response.data);
                }, warn)
                ui.lastUpdate = newTime;
            }, interval);
        }
        
        function addMarker(map, loc){
            var marker = new google.maps.Marker({
                map: map,
                position: loc,
                icon: "images/marker-icon.png"
            });
            return marker;
        }
        
        function focusMarker(marker){
            if(ui.activeMarker != null){
                checkMarker(ui.activeMarker);
            }
            ui.activeMarker = marker;
        }
        
        function deleteMarker(marker){
            marker.setMap(null);
            delete ui.allMarkers[marker.id];
        }
        
        function checkMarker(marker){
            if(!marker.id){
                marker.setMap(null);
            }
        }
        
        function warn(msg){
            console.log(msg);
            //alert(msg);
        }
        
        function displayWISP(wisp){
            var m = ui.allMarkers[wisp['id']]
            ui.infoWindow.setContent(ui.WISPdisplay);
            ui.infoWindow.open(m.getMap(), m);
            ui.WISPdisplay.style = "display:block";

        }
        
        function showWISPtemplate(m){
            ui.infoWindow.setContent(ui.WISPtemplate);
            ui.infoWindow.open(m.getMap(), m);
            ui.WISPtemplate.style = "display:block";
        }
        
        function registerWISP(wisp, marker = ui.activeMarker){
            marker.id = wisp['id'];
            marker.setTitle(wisp['title']);
            ui.allMarkers[wisp['id']] = marker;
        }
        
        function setDisplay(wisp){
            ui.displayWISP.title = wisp.title;
            ui.displayWISP.description = wisp.description;
            ui.displayWISP.photo = /*"data:image/png;base64," + */wisp.photos[0] ? wisp.photos[0] : "";
            ui.displayWISP.responses = wisp.responses;
            ui.displayWISP.email = wisp.email;
            ui.displayWISP.loc = wisp.loc;
            
            date = new Date(wisp.ts);
            ui.displayWISP.timestamp = wisp.ts;
        }
        
        function clearNewWISP(){
            ui.newWisp = {
                title: "",
                description: "",
                photos: [],
                email: ui.saveEmail ? ui.newWisp.email : ""
            }
            $scope.$digest();
        }
        
        function createMarkerListener(m){
            return function(){
                focusMarker(m);
                var promise = clientService.getWISP(m.id);
                promise.then(function(response){
                    setDisplay(response.data);
                    displayWISP(response.data);
                }, function(response){
                    if(response.status == 404){
                        splitUrl = response.config.url.split("/");
                        id = splitUrl[splitUrl.length - 1];
                        if(ui.allMarkers[id]){
                            deleteMarker(ui.allMarkers[id]);
                        }
                    }
                });
            }
        }
        
        function setNewWISPMarkers(wisps){
            for(var i in wisps){
                if(!ui.allMarkers[wisps[i]['id']]){
                var m = addMarker(ui.map, {lat:wisps[i].loc['lat'], lng: wisps[i].loc['lon']} );
                    registerWISP(wisps[i], m)
                    
                    m.addListener('click', createMarkerListener(m));
                }
            }
        }
        
        navigator.geolocation 
            ? navigator.geolocation.getCurrentPosition(function(position){
                init({lat: position.coords.latitude, lng: position.coords.longitude}, 14);
            }, function(){
                init({lat: 39, lng: -98.5}, 4);
            }) 
            : function(){
                init({lat: 39, lng: -98.5}, zoom = 4);
            }();


        ui.print = function(txt){
            //arr = ["y"]
            //console.log(ui.newWisp.img);
            console.log(ui.displayWISP);
            /*
            var reader = new FileReader();
            var file = document.getElementById("img-file").files[0]
            reader.addEventListener('load', function(){
                console.log(reader.result);
            });
            reader.readAsDataURL(file);
            //console.log(reader.result);
            
            console.log(txt);
            re = /\/(\w+);/;
            match = re.exec(txt);
            format = "." + match[1];
            console.log(format);*/
        }
        
        ui.upload = function(){
            
        }
    }

    
angular.module("WTApp")
.component('userInterface', {
    templateUrl: 'templates/interface.html',
    controller: WTController,
    controllerAs: 'ctrl'
});


})();
