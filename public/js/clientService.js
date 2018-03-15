(function(){

//clientService.$inject = ['$http']
function clientService($http){
    var clientService = {};
    
    clientService.createWISP = function(WISP){

        return $http.post("/api/wisps", WISP)
            

    }
    
    clientService.addResponse = function(id, msg){
        return $http.post("/api/wisp/" + id, {message: msg})

    }
    
    clientService.pollWISPs = function(dt = null, email = ""){
        data = {};
        if(dt != null){
            data['params'] = {ts: dt};
        }
        return $http.get("/api/wisps/" + email, data);

    }
    
    clientService.getWISP = function(id){
        
        return $http.get("/api/wisp/" + id);

    }
    
    clientService.deleteWISP = function(id){
        
        return $http.delete("/api/wisp/" + id);

    }
    
    return clientService

}

angular.module('WTApp')
.factory('clientService', clientService);

})()