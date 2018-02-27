class WISP {

    constructor(args = null){
        this.details = {
            "title": "",
            "description": "",
            "loc": {
                "lat": 0,
                "lon": 0,
            },
            "creation_date": "",
            "email": "",
            "photo": [],
            "responses": []
        };
        if(args){
            this.updateDetails(args);
        }
    }
    
    updateDetails(args){
        for(var attr in args){
            this.details[attr] = args[attr];
        }
    }
    
    toJSON(){
        return JSON.stringify(this.details)
    }
    
    addResponse(txt){
        this.details["responses"].push(new Response(txt));
    }
}