define(['sbl!app'], function (itcApp) {
  itcApp.directive('appClickaway', ['$document', function ($document) {
    var body, doc, lastClickedElement, link;
    doc = $document[0];
    body = angular.element(doc.body);
    lastClickedElement = null;
    link = function(scope, element, attrs) {
      var clickEventHandler;
      element.bind('click', function(e) {
        var callback, el, lastClickedElementScope, ref, sameElement;
        sameElement = element === lastClickedElement;
        if (lastClickedElement && !sameElement) {
          el = angular.element(lastClickedElement);
          lastClickedElementScope = el.isolateScope() || el.scope();
          callback = (ref = lastClickedElement[0]) != null ? ref.getAttribute('app-clickaway') : void 0;
          if (lastClickedElementScope) {
            lastClickedElementScope.$eval(callback);
          }
        }
        lastClickedElement = element;
        return e.stopPropagation();
      });
      clickEventHandler = function() {
        var clickAwayCallback;
        clickAwayCallback = attrs.appClickaway;
        scope.$eval(clickAwayCallback);
        return true;
      };
      body.bind('click', clickEventHandler);
      return scope.$on('$destroy', function() {
        return body.unbind('click', clickEventHandler);
      });
    };
    return {
      link: link,
      restrict: 'A'
    };
  }]);
});