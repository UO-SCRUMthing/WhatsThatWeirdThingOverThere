(function(){
function fileReader(){
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onloadend = function (loadEvent) {
                    console.log(loadEvent);
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
                scope.$on('$destroy', function(){ element.unbind("change"); });
            });
        }
    }
}

angular.module("WTApp")
.directive("fileread", fileReader); 
})();