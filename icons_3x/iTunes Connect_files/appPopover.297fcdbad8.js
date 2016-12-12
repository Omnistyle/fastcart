define(['sbl!app'], function (itcApp) {
  itcApp.directive('appPopover', ['$window', '$document', '$animate', function ($window, $document, $animate) {
    var calculatePositioning, controller, doc, getElementBoundingClientRect, gutterComp, link;
    doc = $document[0];
    controller = [
      '$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
        var body;
        return body = angular.element(doc.body);
      }
    ];
    link = function(scope, element, attrs) {
      //$animate.enabled(false, element);
      $animate.enabled(element, false);

      scope.showPopover = false;
      
      return attrs.$observe('show', function(val) {
        var boolVal, pop_wrap;
        boolVal = scope.$eval(val);
        if (scope.disabled) {
          boolVal = false;
        }
        if (boolVal) {
          calculatePositioning(element, scope);
          return scope.showPopover = boolVal;
        } else {
          pop_wrap = element.find('.popover-wrap');
          element.find('.popover-wrap:first').css({
            opacity: 0
          });
          return _.delay(function() {
            scope.showUpwards = false;
            element.css('top', '');
            element.find('.popover-wrap').css({
              'top': ''
            });
            scope.showPopover = boolVal;
            return scope.$apply();
          }, 200);
        }
      });
    };
    calculatePositioning = function($element, scope) {
      var boundingClientRect, contentElement, contentWidth, parentHeight, parentWidth, positionLeft;
      parentWidth = $element[0].parentElement.clientWidth;
      parentHeight = $element[0].parentElement.clientHeight;
      contentElement = $element.find('.popover-wrap')[0];
      boundingClientRect = getElementBoundingClientRect($element, contentElement);
      angular.element(contentElement).css('opacity', 0);
      contentWidth = boundingClientRect.width;
      if (scope.right != null) {
        angular.element(contentElement).css('right', scope.right);
      } else if (scope.left != null) {
        angular.element(contentElement).css('left', scope.left);
      } else {
        positionLeft = (parentWidth - contentWidth) / 2;
        if (scope.float === 'left') {
          positionLeft = 10;
        }
        angular.element(contentElement).css('left', positionLeft + 'px');
      }
      if (scope.forceBottom != null) {
        angular.element(contentElement).css('top', '');
        scope.showUpwards = false;
        gutterComp(contentElement, scope);
        return false;
      }
      scope.showUpwards = $window.innerHeight < (boundingClientRect.top + boundingClientRect.height);
      if (scope.top != null) {
        angular.element(contentElement).css('top', scope.top);
        scope.showUpwards = false;
      } else if (scope.showUpwards) {
        angular.element(contentElement).css('top', -1 * (boundingClientRect.height + parentHeight) + 'px');
      } else {
        angular.element(contentElement).css('top', '');
      }
      return gutterComp(contentElement, scope);
    };
    gutterComp = function(contentElement, scope) {
      return _.defer(function() {
        return _.delay(function() {
          var afterpos, cc, diff;
          cc = $(contentElement);
          afterpos = cc[0].getBoundingClientRect();
          if (afterpos.left < 20) {
            diff = 20 - afterpos.left;
            cc.css({
              left: "+=" + diff + "px"
            });
            cc.find(".popover-tip").css({
              position: "absolute",
              left: (scope.tipleft || diff) + 'px'
            });
          }
          return _.defer(function() {
            return cc.css({
              opacity: "1"
            });
          });
        }, 75);
      });
    };
    getElementBoundingClientRect = function(element, contentElement) {
      var boundingClientRect;
      element.css('visibility', 'hidden');
      element.removeClass('ng-hide');
      boundingClientRect = contentElement.getBoundingClientRect();
      element.addClass('ng-hide');
      element.css('visibility', '');
      return boundingClientRect;
    };
    return {
      link: link,
      controller: controller,
      restrict: 'E',
      replace: true,
      templateUrl: getGlobalPath('/itc/views/directives/popover.html'),
      transclude: true,
      scope: {
        float: '@',
        right: '@',
        left: '@',
        top: '@',
        forceBottom: '@',
        tipleft: '@',
        disabled: '=',
        additionalPopupClass: '@',
        arrowRightPosition: '@'
      }
    };
  }]);
});