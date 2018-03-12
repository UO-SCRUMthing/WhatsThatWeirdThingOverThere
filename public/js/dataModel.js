(function(){
angular.module('WTApp')
.service('dataModel', dataModel);

function dataModel(){
    var dataModel = {}
    
    dataModel.newWisp = {
        title: "",
        description: "",
        photos: [],
        email: "",
    }
    
    dataModel.displayWisp = {
        title: "",
        description: "",
        photos: [],
        responses: [],
        timestamp: null,
        email: "",
        loc: {}
        
    };
    dataModel.email = "";
    
    dataModel.response = {
        showBox: false,
        responseText: ""
    }
    
    dataModel.clearNewWISP = function(){
        dataModel.newWisp.title = "";
        dataModel.newWisp.description = "";
        dataModel.newWisp.photos = [];
        dataModel.newWisp.responses = [];
    }
    
    
    dataModel.setDisplayWISP = function(w){
        console.log(w);
        if(w.title){
            dataModel.displayWisp.title = w.title;
        }
        if(w.description){
            dataModel.displayWisp.description = w.description;
        }
        if(w.photos){
            dataModel.displayWisp.photos = w.photos;
        }
        if(w.responses){
            dataModel.displayWisp.responses = w.responses;
        }
        if(w.ts){
            dataModel.displayWisp.timestamp = w.ts;
        }
    }
    
    dataModel.getNewWISP = function(){
        return dataModel.newWisp;
    }
    
    dataModel.getResponse = function(){
        return dataModel.response.responseText;
    }
    
    
    
    return dataModel
}
})();