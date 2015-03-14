angular.module('angularPromiseButtons').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('promise-btn-d.html',
    "<button ng-transclude></button>"
  );

}]);
