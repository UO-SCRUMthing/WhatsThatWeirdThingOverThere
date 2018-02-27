
class Response {
    constructor(message){
        this.msg = message;
        // this.children = [];
    }
    
    addResponse(message){
        // TODO: allow subthreads of responses
    }
    
    toString(){
        return this.msg;
    }
    
    toJSON(){
        return {message: this.msg};
    }
}