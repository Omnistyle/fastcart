define([], function () {

    var form_elements = angular.module('form_elements', []);
    /*
    place directive on form to add placeholders for non-html5 browsers
    */
    form_elements.directive('itcPlaceholderSupport',function(){
        return {
            link: function(scope,element,attrs) {
                if(!Modernizr.input.placeholder) {
                    var placeholders = [];
                    scope.$watch(function(){  
                        if (placeholders.length <= 0) { //make sure we haven't applied this yet
                            $('.inputWrapper [placeholder]').each(function(){
                                $(this).addClass('hasStaticPlaceholder');
                                $(this).after('<span class="placeholder">'+$(this).attr('placeholder')+'</span>');
                            });
                        }
                        placeholders = $('[placeholder]');
                
                        $('.inputWrapper [placeholder]').focus(function() {
                            $(this).next('.placeholder').hide();
                        }).blur(function(){
                            if ($(this).val() !== "") {
                                $(this).next('.placeholder').hide();
                            } else {
                                $(this).next('.placeholder').show();
                            }
                        });
                        $('.inputWrapper [placeholder]').each(function(){
                            if ($(this).val() !== "") {
                                $(this).next('.placeholder').hide();
                            } else {
                                $(this).next('.placeholder').show();
                            }
                        });
                        $('.placeholder').click(function(){
                            $(this).prev('input').focus();
                        });

                    });
                }
            }
        }
    });

    /* tempPageContent.formErrors  itc-form-error-tracker */
    form_elements.directive('itcFormErrorTracker',function(){
        return {
            scope: {
                'itcFormErrorTracker':'='
            },
            link: function(scope,element,attrs) {
                //watch page for changes look for .invalid - and return count
                scope.$watch(function(){
                        if (scope.itcFormErrorTracker !== undefined) {
                            scope.itcFormErrorTracker.count = element.find('.invalid').length;
                            //console.log("element.find('.invalid').length "+element.find('.invalid').length);
                            scope.itcFormErrorTracker.count += element.find('.ng-invalid').length;
                            //console.log("element.find('.ng-invalid').length "+ element.find('.ng-invalid').length)
                            scope.itcFormErrorTracker.count += element.find('.invalid-srvr').length;
                        }
                });
            }
        }
    });

    /*
    place directive on form wrapper - fields will get "hasVisited" class after field has been clicked into. Style for ng-invalid isn't shown unless 'hasVisited' is present.
    IMPORTANT NOTE: THIS DIRECTIVE IS INCOMPAITBLE WITH NG-IF!!! It will find NOTHING on the page and not apply the "blur" action even if ng-if resolves to true!
    */
    form_elements.directive('itcValidateOnBlur',function(){
        return {
            scope: {
                'validateClear':'=?',
                'exposeRequiredFields':'=?'
            },
            link: function(scope,element,attrs) {
                /*element.on('blur',function(){
                    element.addClass('hasVisited');
                });
                if(element.is('textarea') && element.parent('.textareaWithCounter').length > 0) {
                    element.on('blur',function(){
                        element.parent('.textareaWithCounter').addClass('hasVisited');
                    });
                }*/
                element.find('input').each(function(){
                    $(this).blur(function(){
                        $(this).addClass('hasVisited');
                    });
                });
                element.find('select').each(function(){
                    $(this).blur(function(){
                        $(this).addClass('hasVisited');
                    });
                });
                element.find('textarea').each(function(){
                    $(this).blur(function(){
                        $(this).addClass('hasVisited');
                    });
                });
                scope.$watch('validateClear',function(){
                    if(scope.validateClear !== undefined) {
                        element.find('.hasVisited').removeClass('hasVisited');
                        scope.validateClear = false;
                    }
                },true);
                scope.$watch('exposeRequiredFields',function(){
                    if (scope.exposeRequiredFields !== undefined && scope.exposeRequiredFields) {
                        element.find('input').each(function(){
                                $(this).addClass('hasVisited');
                        });
                        element.find('select').each(function(){
                                $(this).addClass('hasVisited');
                        });
                        element.find('textarea').each(function(){
                                $(this).addClass('hasVisited');
                        });
                    }
                });
                /*element.find('.textareaWithCounter').each(function(){
                    $(this).find('textarea').blur(function(){
                        $(this).parent('.textareaWithCounter').addClass('hasVisited');
                    });
                });*/
                /*scope.$watch(function(){
                    if(element.find('.ng-invalid')) {
                        return true;
                    } 
                    return false;
                },function(val){
                    if (val) {
                        element.find('.ng-invalid').each(function() {
                            $(this).blur(function(){
                                $(this).addClass('hasVisited');
                            });
                        });
                    }
                });*/
            }
        }
    });

    /*
    Description: For creating start and end date date pickers
    Usage: apply as an attribute to the wrapper. Give start date field a class of "startdate", give enddate a class of "enddate"
    */
    form_elements.directive('itcDateGroup',['datePickerSerivce','$timeout',function(datePickerSerivce,$timeout){
        return {
            scope: {},
            restrict: 'A',
            require : '?ngModel',
            link: function(scope,element,attrs,ngModelCtrl) {
                $(function(){
                    var startdate =  element.find('.startdate');
                    var enddate = element.find('.enddate');
                    var today = new Date();
                    var todayFormatted = datePickerSerivce.getShortMonth(today.getMonth()) + " " + today.getDate() + ", " + today.getFullYear();
                    startdate.datepicker({
                        dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
                        dateFormat: "M d, yy",
                        minDate: new Date(),
                        maxDate: datePickerSerivce.getMaxDay(),
                        onClose: function(selectedDate) { 
                            $(this).val(datePickerSerivce.cleanDate(selectedDate));
                            
                            //determine end date
                            var minDate = new Date(Date.parse(startdate.val()));
                            minDate.setDate(minDate.getDate() + 1);
                            updatedMinDate = datePickerSerivce.getShortMonth(minDate.getMonth()) + " " + minDate.getDate() + ", " + minDate.getFullYear();
                            
                            if (startdate.val() === datePickerSerivce.getMaxDay()) {
                                scope.endDateValue = "";
                                enddate.datepicker( "option", "minDate", updatedMinDate );
                                startdate.datepicker("option","maxDate",datePickerSerivce.getMaxDay());
                                popupmessage(enddate,"<p>End date can not be set.</p>");
                                //can not set end date if start date is furthest possible
                            } else if (minDate.getTime() < today.getTime()) {
                                $(this).val(todayFormatted);
                                popupmessage($(this),"<p>Start date can not be earlier than today.</p>");
                            } else if (enddate.val() !== "" && enddate.val() !== "No End Date" && enddate.val() !== "None" && startdate.val() !== "" && !datePickerSerivce.checkRange(startdate,enddate)) {
                                //bad range - all fields filled
                                enddate.val(updatedMinDate);
                                enddate.datepicker( "option", "minDate", updatedMinDate );
                                popupmessage(enddate,"<p>End date must be after start date.</p>");
                            } else {
                                enddate.datepicker( "option", "minDate", updatedMinDate );
                            }
                        }
                    });
                    enddate.datepicker({
                        dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
                        dateFormat: "M d, yy",
                        minDate: "+1d",
                        maxDate: datePickerSerivce.getMaxDay(),
                        onClose: function(selectedDate) {
                            $(this).val(datePickerSerivce.cleanDate(selectedDate));
                            
                            //determine end date
                            var maxDate = new Date(Date.parse($(this).val()));
                            maxDate.setDate(maxDate.getDate() - 1);
                            updatedmaxDate = datePickerSerivce.getShortMonth(maxDate.getMonth()) + " " + maxDate.getDate() + ", " + maxDate.getFullYear();
                            console.log(updatedmaxDate);
                            var minDate = new Date(Date.parse(startdate.val()));
                            minDate.setDate(minDate.getDate() + 1);
                            updatedMinDate = datePickerSerivce.getShortMonth(minDate.getMonth()) + " " + minDate.getDate() + ", " + minDate.getFullYear();

                            if (startdate.val() === datePickerSerivce.getMaxDay()) {
                                //start date was set to max date - can not set end date...
                                $(this).val("");
                                $(this).datepicker( "option", "minDate", updatedMinDate );
                                popupmessage($(this),"<p>End date must be after start date.</p>");
                                //can not set end date if start date is furthest possible
                            } else if ($(this).val() !== "" && $(this).val() !== "No End Date" && $(this).val() !== "None" && startdate.val() !== "" && !datePickerSerivce.checkRange(startdate,$(this))) {
                                //bad range - all fields filled
                                $(this).val(updatedMinDate);
                                startdate.datepicker( "option", "maxDate", datePickerSerivce.getMaxDay() );
                                popupmessage(enddate,"<p>End date must be after start date.</p>");
                            } else if ($(this).val() === "" || $(this).val() === "No End Date" || $(this).val() === "None") {
                                // This field not filled - reset max day for start date
                                startdate.datepicker( "option", "maxDate", datePickerSerivce.getMaxDay() );
                            } else {
                                startdate.datepicker( "option", "maxDate", updatedmaxDate );
                            }
                        }
                    });
                });
                var popupmessage = function(el,message) {
                    var messagepopup = el.next();
                    $('.stayopen').removeClass('stayopen'); //hide other stayopen popups
                    messagepopup.html(message).addClass('stayopen');
                    $timeout(function(){
                        messagepopup.removeClass('stayopen');
                    },5000);
                }
            }
        }
    }]);

    /*
    Pass an array of errorkeys, pass copy of original value (not scope model) and current model. 
    if errorkeys passed exist and > 0 - will compare original value and current model - if the same, will add class of "invalid-srvr". if different, will remove "invalid-srvr" class

    will also seperately show/hide error bubbles on mouseover.
    html needs to be set up with these elements/classes:
        <span class="inputWrapper">
            <input type="text" ng-model="..." ng-required="...">
            <span class="errorPopUp mainError">error message here</span>
            <span class="errorPopUp srvError">Server error message here</span>
        </span>
    
    adds "invalid-srvr" to input tag. when "invalid-srvr" is in the class list - it will open up the .errorPopUp.srvError inline message.
   otherwise if element has "invalid" (ie too many characters in textarea) or ng-invalid + .hasVisisted (angular adds ng-invalid if it's required but empty - another directive adds 'hasVisited' once a user clicks into the field) - it will open up .errorPopUp.mainError 

    */
    form_elements.directive('itcFieldServerError',function(){
        return {
            scope: {
                'itcFieldServerError': '=', //an array of error keys
                'itcFieldInfo' : "=", // Array of "info keys"
                'itcFieldOrigVal':'=',
                'itcFieldCurVal':'=',
                'itcFieldPopUpErrors': "@" //set to true to look for sibling ".errorPopUp" - add "open" on mouseover
            },
            link: function(scope,element,attrs) {
                var checkValues = function() {
                    element.siblings('.errorPopUp').removeClass('open'); //first hide errors before evaluation if they should show (prevents issue of error popup still being displayed on undo)
                    if (scope.itcFieldServerError !== undefined && scope.itcFieldServerError !== null && scope.itcFieldServerError.length > 0) {
                        if (scope.itcFieldOrigVal === scope.itcFieldCurVal) {
                            element.addClass('invalid-srvr');
                        } else {
                            element.removeClass('invalid-srvr');
                        }
                    } else {
                        element.removeClass('invalid-srvr');
                    }

                    if (scope.itcFieldPopUpErrors === "true") {
                        element.on('mouseenter', function(){
                            if (element.hasClass('invalid-srvr')) {
                                element.siblings('.errorPopUp.srvError').addClass('open');
                            } else if (element.hasClass('invalid') || (element.hasClass('ng-invalid') && element.hasClass('hasVisited') ) ) {
                                element.siblings('.errorPopUp.mainError').addClass('open');
                            }

                        });
                        element.on('mouseleave', function(){
                            element.siblings('.errorPopUp').removeClass('open');
                        });
                    }
                }
                checkValues();


                var checkInfoValues = function() {
                    element.siblings('.errorPopUp').removeClass('open'); //first hide errors before evaluation if they should show (prevents issue of error popup still being displayed on undo)

                    if (scope.itcFieldPopUpErrors === "true") {
                        if (scope.itcFieldInfo !== undefined && scope.itcFieldInfo !== null && scope.itcFieldInfo.length > 0) {
                            element.addClass('has-warning');
                        } else {
                            element.removeClass('has-warning');
                        }

                        element.on('mouseenter', function () {
                            if (element.hasClass('has-addtl-warning')) {
                                element.siblings('.errorPopUp.addtl-warning').addClass('open');
                            }
                            if (element.hasClass('has-warning')) {
                                element.siblings('.errorPopUp.warning').addClass('open');
                            }
                        });
                        element.on('mouseleave', function () {
                            element.siblings('.errorPopUp').removeClass('open');
                        });
                    }


                };

                //var classnames="";
                scope.$watch('itcFieldCurVal',function(){
                    checkValues();
                    //classnames = element.attr("class");
                });
                scope.$watch('itcFieldServerError',function(){
                    checkValues();
                    //classnames = element.attr("class");
                });

                scope.$watch('itcFieldInfo',function(){
                    checkInfoValues();
                }, true);

                scope.$watch(function(){
                    return element.attr("class");
                },function(){
                    checkValues();
                    checkInfoValues();
                });

                /*scope.$watch('classnames',function() {
                    if (scope.itcFieldPopUpErrors === "true") {
                        element.on('mouseenter', function(){
                            if (element.hasClass('invalid') || element.hasClass('invalid-srvr') || (element.hasClass('ng-invalid') && element.hasClass('hasVisited') ) ) {
                                element.siblings('.errorPopUp').addClass('open');
                                if (element.is("textarea") && element.parent('.textareaWithCounter').length > 0) {
                                    element.find('.errorPopUp').addClass('open');
                                }
                            }
                        });
                        element.on('mouseleave', function(){
                            element.siblings('.errorPopUp').removeClass('open');
                            if (element.is("textarea") && element.parent('.textareaWithCounter').length > 0) {
                                element.find('.errorPopUp').removeClass('open');
                            }
                        });
                    }
                });*/
                
                //watch textarea's for "ng-invalid" state when textareaWithCounter exists - and add invalid class to parent...
                /*scope.$watch(function() {
                    if (element.is("textarea") && element.parent('.textareaWithCounter').length > 0 && (element.hasClass('invalid') || element.hasClass('invalid-srvr') || (element.hasClass('ng-invalid') && element.hasClass('hasVisited') ))) {
                        return true;
                    }
                },function(val){
                    console.log("VAL CHECK"+val);
                    if (val) {
                        element.parent('.textareaWithCounter').addClass('invalid');
                    } else {
                        element.parent('.textareaWithCounter').removeClass('invalid');
                    }
                });*/
            }
        }
    });


    // Slimmer version of the 'itcFieldServerError', used for client-side errors on data-heavy pages.
    // Uses data attributes to trigger 'error' and 'warning' states, so it can be used in conjunction
    // with other directives (especially when the input element is dynamically generated)
    form_elements.directive('itcFieldError',function(){
        return {
            scope: {
                'itcFieldError': '=', //an array of error keys
                'itcFieldPopUpErrors': "@" //set to true to look for sibling ".errorPopUp" - add "open" on mouseover
            },
            link: function(scope,el,attrs) {
                
                var s = scope;
                
                s.hasError   = false;
                s.hasWarning = false;
                
                s.errorMsgs  = el.siblings('.errorPopUp');
                s.errorMsg   = el.siblings('.errorPopUp.mainError');
                s.warningMsg = el.siblings('.errorPopUp.warning');
                
                
                el.on('mouseenter', function(){
 
                    if (el.hasClass('has-error')) {
                        s.errorMsg.addClass('open');
                     
                    } else if (el.hasClass('has-warning')) {
                        s.warningMsg.addClass('open');
                    }
                    
                });
                
                el.on('mouseleave', function(){
                    s.errorMsgs.removeClass('open');
                });
            }
        }
    });



    /*
    Description: Simple directive to launch the filechooser from a link. Pass in the ID of the <input type="file"> to reference when link is clicked.
    <a href="" itc-launch-filechooser="fileselector">Upload file</a>
    <input type="file" id="fileselector">
    */
    form_elements.directive('itcLaunchFilechooser',function() {
        return {
            /*scope: {
                itcLaunchFilechooser: "@"
            },*/
            link: function(scope, element, attrs) {
                element.bind('click',function(e){
                    e.preventDefault();
                    // $('#'+scope.itcLaunchFilechooser).click();
                    element.next('input').click();
                });
            }
        }
    });

    /* use for contract interstitial - condtionally scroll content depending on length of content in modal... */
    form_elements.directive('itcConditionalScrollingBox',['$timeout',function($timeout){
        return function(scope,element,attrs) {
            function checkScroller() {
                element.find('.'+attrs.wrapperClass).css('maxHeight',attrs.maxHeight+"px");
                if (element.find("."+attrs.innerWrapperClass).height() > attrs.maxHeight) {
                    element.find('.'+attrs.wrapperClass).addClass('scroll-content');
                } else {
                    element.find('.'+attrs.wrapperClass).removeClass('scroll-content');
                }
            }
            checkScroller();
            if(scope.$last) {
                $timeout(function(){
                    //console.log("timeout");
                    checkScroller();
                });
            }
            scope.$watch(function(){
                return element.find("."+attrs.innerWrapperClass).height();
            },function(){
                checkScroller();
            });
            /*
            $timeout(function(){
                console.log("timeout 2");
                checkScroller();
            });*/
        }
    }]);

    /* 
    Description: created a checkbox that will check all checkboxes in the given object json.
    Usage: <span itc-check-all-checkbox checkboxes="filtered"></span>
    IMPORTANT: "filtered" needs a isSelected: true/false key-value!

    (where "filtered" is the json listing in scope and what is used in the ng-repeat)
    ie: <tr ng-repeat="iapInfo in filtered | startFrom:(currentPage-1)*entryLimit | limitTo:entryLimit">

    can-be-checked - optional attribute to add to itc-check-all-checkbox. Used when a checkbox in the list might not be editable. Enter the TEXT (string) for the key to check. ie. "isEditable" or "canBeDeleted"
    */
    form_elements.directive('itcCheckAllCheckbox', function() {
        return {
            replace: true,
            restrict: 'A',
            scope: { 
                checkboxes: '=',
                disabled: '=?',
                canBeChecked: '@' //if this is provided - use this property during iteration if item in list can be checked
            },
            template: ''+
                    '<span>'+
                    '<input type="checkbox" class="a11y" ng-model="master">' +
                    '<a href="" class="checkboxstyle" ng-class="{\'checked\':master,\'disabled\':disabled}" ng-click="masterChange()"></a>'+
                    '</span>',
            controller: function($scope, $element, $attrs) {
                $scope.propertyToSet = "isSelected";
                if ($attrs.checkboxProperty) $scope.propertyToSet = $attrs.checkboxProperty;

                $scope.masterChange = function() {
                    
                    if ($scope.disabled === true) return false;

                    if($scope.master) {
                        $scope.master = false;
                        angular.forEach($scope.checkboxes, function(cb, index){
                            if (cb.isStatic !== true) {
                                if ($scope.canBeChecked !== undefined) {
                                    if (cb[$scope.canBeChecked]) {
                                        cb[$scope.propertyToSet] = false;
                                    }
                                } else {
                                    cb[$scope.propertyToSet] = false;
                                }
                            }
                        });
                    } else {
                        $scope.master = true;
                        angular.forEach($scope.checkboxes, function(cb, index){
                            if (cb.isStatic !== true) {
                                if ($scope.canBeChecked !== undefined) {
                                    if (cb[$scope.canBeChecked]) {
                                        cb[$scope.propertyToSet] = true;
                                    }
                                } else {
                                    cb[$scope.propertyToSet] = true;
                                }
                            }
                        });
                    }
                };

            $scope.$watch('checkboxes', function() {
                var allSet = true, allClear = true;
                angular.forEach($scope.checkboxes, function(cb, index){
                    if ($scope.canBeChecked !== undefined) {
                        if (cb[$scope.canBeChecked]) {
                            if(cb[$scope.propertyToSet]) {
                                allClear = false;
                            } else {
                                allSet = false;
                            }
                        } //skip over any items that can't be checked anyway
                    } else {
                        if(cb[$scope.propertyToSet]) {
                            allClear = false;
                        } else {
                            allSet = false;
                        }
                    }
                });
                if(allSet)        { 
                  $scope.master = true; 
                  $element.prop('indeterminate', false);
                }
                else if(allClear) { 
                  $scope.master = false; 
                  $element.prop('indeterminate', false);
                }
                else { 
                  $scope.master = false;
                  $element.prop('indeterminate', true);
                }
              }, true);
            }
        };
    });


    /*
    Description: Stylized Checkbox
    Usage: <div itc-checkbox="ngmodel_variable_name"  itc-checkbox-disabled="object.trueOrFalse"></div>
    */
    /* for ss */
    form_elements.directive('itcCheckbox',['$timeout',function($timeout) {
        return {
            restrict: 'A',
            scope: {
                checkboxValue: '=itcCheckbox',
                itcCheckboxDisabled:'=?',
                itcCheckboxCallback: '&',
                preCheckCallback: '&', // an (optional) function that returns a promise! Only when the promise complete's does the checkbox get checked.
                checkboxLabel: '@checkboxLabel'
            },
            template: ''+
                '<span class="itc-checkbox">'+
                '<input type="checkbox" class="a11y" ng-model="checkboxValue">' +
                '<a href="javascript:void(0)" class="checkboxstyle" ng-class="{\'checked\':checkboxValue,\'disabled\':itcCheckboxDisabled}" ng-click="checkit($event)"></a>'+
                '</span>',
            link: function($scope, $element, attrs) {
                
                // Uneditable checkboxes cannot be interacted with
                if ($element.attr('force-enabled') !== undefined) {
                    $element.find('a.checkboxstyle').addClass('disabled');
                    return false;
                }
                
                $scope.checkit = function(e) {
                    // check for a pre-check callback.
                    if ($scope.preCheckCallback && !$scope.checkboxValue) { // only if check box is currently unchecked and it's being checked
                        var promise = $scope.preCheckCallback();
                        if (promise && promise.then) { // check to make sure it's a promise
                            promise.then(function(result) {
                                //log(result); 
                                $scope.reallyCheckit(e);
                                $scope.$apply();
                            }, function(err) {
                                // Error: don't continue. Ie. don't check the box. 
                                // Returns this if the promise called reject();
                                // log(err); 
                            });
                        }
                        else {
                            $scope.reallyCheckit(e);    
                        }
                    }
                    else {
                        $scope.reallyCheckit(e);
                    }
                }

                $scope.reallyCheckit = function(e) {
                    
                    // if (e.stopPropagation) e.stopPropagation(); // Commented out for rdar://problem/22308901
                    
                    if (!$scope.itcCheckboxDisabled || $scope.itcCheckboxDisabled === undefined || $scope.itcCheckboxDisabled === null) {
                        if ($scope.checkboxValue) {
                            $scope.checkboxValue = false;
                        } else {
                            $scope.checkboxValue = true;
                        } 
                        $scope.event = e; // save the event to pass along to itcCheckboxCallback
                    }
                }
                
                $scope.checkboxLabel = $scope.checkboxLabel || attrs.checkboxLabel;
                
                // If label is provided, add it -- and link it to the checkbox
                if ($scope.checkboxLabel) {
                    var label = $element.find('span').append('<label>' + $scope.checkboxLabel + '</label>');
                    var uniqID = _.guid();
                    $element.find('input').attr( 'id',  uniqID );
                    $element.find('label').attr( 'for', uniqID );
                }

                $scope.$watch('checkboxValue', function(newValue, oldValue) {
                    $scope.itcCheckboxCallback({evt: $scope.event});
                    $scope.event = null; // reset it
                });
            }
        }
    }]);

    // form_elements.directive( 'clickRowToSelect', [ '$timeout', function( $timeout ) {
        
    //     return {
    //         restrict: 'A',
    //         scope: {
    //             selectableItem: '=clickRowToSelect',
    //             ignoreRowClickIf: '=?'
    //         },
    //         link: function( scope, el, attrs ) {
                
    //             var item = scope.selectableItem;
                
    //             el.on( 'click', function( e ) {
                    
    //                 var startNode = angular.element( e.target );
                    
    //                 function checkForListeners( node ) {
                        
    //                     if ( node[0].isSameNode( el[0] )) {
                            
    //                         log('done')
                            
    //                     } else {
                            
    //                         // log(node.attributes)
    //                         // log( node[0].attributes );
                            
    //                         log( angular.element(node).data('events'))
                            
    //                         // _.each( node[0].attributes, function(attr) {
    //                         //     log(attr);
    //                         // })
                            
    //                         log('----------')
                            
    //                         checkForListeners( node.parent() );
    //                     }
    //                 }
                    
    //                 checkForListeners( startNode );

    //             })
    //         }
    //     }
    // }]);

    /*
    Description: Stylized Checkbox
    Usage: <div itc-checkbox="ngmodel_variable_name"  itc-checkbox-disabled="object.trueOrFalse"></div>
    */
    form_elements.directive('itcThreeStateCheckbox',['$timeout',function($timeout) {
        return {
            restrict: 'A',
            scope: {
                checkboxValue: '=itcThreeStateCheckbox',
                itcCheckboxDisabled:'=?',
                itcCheckboxCallback: '&',
                checkboxLabel: '=?'
            },
            template: ''+
                '<span class="itc-checkbox">'+
                '<input type="checkbox" class="a11y" ng-model="checkboxValue">' +
                '<a href="javascript:void(0)" class="checkboxstyle" ng-class="{\'checked\':checkboxValue,\'indeterminate\':indeterminate,\'disabled\':itcCheckboxDisabled}" ng-click="checkit()"></a>'+
                '</span>',
            link: function($scope, $element) {
                
                // Uneditable checkboxes cannot be interacted with
                if ($element.attr('force-enabled') !== undefined) {
                    $element.find('a.checkboxstyle').addClass('disabled');
                    return false;
                }
                
                $scope.checkit = function() {
                    
                    if (!$scope.itcCheckboxDisabled || $scope.itcCheckboxDisabled === undefined || $scope.itcCheckboxDisabled === null) {
                        if ($scope.checkboxValue) {
                            $scope.checkboxValue = false;
                            $scope.indeterminate = false;
                        } else {
                            $scope.checkboxValue = true;
                            $scope.indeterminate = false;
                        }
                    }
                }
                
                // If label is provided, add it -- and link it to the checkbox
                if ($scope.checkboxLabel) {
                    var label = $element.find('span').append('<label>' + $scope.checkboxLabel + '</label>');
                    var uniqID = _.guid();
                    $element.find('input').attr( 'id',  uniqID );
                    $element.find('label').attr( 'for', uniqID );
                }

                $scope.$watch('checkboxValue', function(newValue, oldValue) {
                    $scope.itcCheckboxCallback();
                    if ($scope.checkboxValue === null) {
                        $scope.indeterminate = true;
                    } else {
                        $scope.indeterminate = false;
                    }
                });
            }
        }
    }]);

    /*
    Description: Stylized Radio Button
    Usage: <div itc-radio="ngmodel_name" radio-value="radio_value" radio-required="obj.valueTrueOrFalse"></div>
    */
    form_elements.directive('itcRadio',function() {
        return {
            restrict: 'A',
            scope: {
                'radioValue': '@',
                'radioGroup': '=itcRadio',
                'radioRequired': '@?', //set this as a string so it could be "evaluated" inline
                'radioDisabled': '@?'
            },
            template: ''+
                '<span>'+
                '<input type="radio" class="a11y" ng-model="radioGroup" ng-value="radioValue" ng-required="isRequired" ng-disabled="isDisabled">'+
                '<a href="" class="radiostyle" ng-class="{\'checked\':isChecked(),\'disabled\':isDisabled}" ng-click="checkit()"></a>'+
                '</span>',
            link: function(scope,element,attrs) {
                scope.checkit = function() {
                    if (!scope.isDisabled || scope.radioDisabled === undefined || scope.itcCheckboxDisabled === null) {
                        scope.radioGroup = scope.radioValue;
                    }
                }
                scope.isChecked = function() {
                    if (scope.radioGroup === scope.radioValue) {
                        return true;
                    }
                }
                if (scope.radioDisabled !== undefined) {
                    scope.$watch('radioDisabled',function(value) {
                        if (value === true || value == "true") {
                            scope.isDisabled = true;
                        } else {
                            scope.isDisabled = false;
                        }
                        
                    });
                }
                if (scope.radioRequired !== undefined) {
                    scope.$watch('radioRequired',function(value) {
                        if (value === true || value == "true") {
                            scope.isRequired = true;
                        } else {
                            scope.isRequired = false;
                        }
                        
                    });
                }
            }
        }
    });

    
    /*
    Different styling than the above itcRadio and takes a label (text) attribute for display next to the radio button
    Usage example:
                    <div itc-radio-button 
                        text="{{ l10n.interpolate('ITC.pricing.volumePurchaseProg.educationalDiscount') }}"
                        model="tempPageContent.vppSelection"
                        value="4"
                        disabled="false"
                        > 
                    </div>
    */
    form_elements.directive('itcRadioButton', function() {
        return {
            replace: true,
            transclude: true,
            scope: {
                'text': '@', 
                'classOnLabel': '@',
                'model': '=', // whatever this is will change when this radio button is selected (group radio buttons by giving them this same model)
                'value': '@',
                'disabled': '='
            },  

            template:
                '<div class="flex-row radio-button-row">' +
                    '<div class="auto-flex-item cell-select-build">' +
                        //'<input type="radio" ng-model="model" value="{{value}}"/><label class="label"></label><label ng-transclude></label>' +
                        '<div itc-radio="model" radio-value="{{value}}" radio-disabled="{{isDisabled}}"></div><label class="label {{classOnLabel}}"></label><label class="extraLabel" ng-transclude></label>' +
                    '</div>' +
                '</div>',
              
                
            link: function(scope, element, attrs) {
                scope.isDisabled = false;
                var inp = element.find("input");
                if (scope.disabled) {
                    //inp.attr("disabled", true);
                    scope.isDisabled = true;
                }

                if (scope.text && scope.text.length > 0) { // add a closer margin-left, so the two labels are closer to each other.
                    element.find(".extraLabel").addClass("closer");
                }

                var lbl = element.find("label.label");
                if (!scope.text || scope.text.length===0) {
                    lbl.remove();
                }
                else {
                    lbl.text(scope.text);
                }

                scope.$watch('disabled',function(val){
                    if (val) {
                        //inp.attr("disabled", true);
                        scope.isDisabled = true;
                    }
                    else {
                        //inp.removeAttr("disabled");  
                        scope.isDisabled = false; 
                    }
                });

                scope.$watch('text',function(val, oldVal){
                    if (val) {
                        lbl.text(val);
                    }
                });

                /*scope.$watch('model',function(val){
                    if (val) {
                        console.log("model", scope.model);
                    }
                }); */
            }

        }
    });

    form_elements.directive('timePicker', function($filter, ITC) {
        return {
            replace: true,
            transclude: false,
            scope: {
                'timeSel': "=", 
                'disabled': "="
            },  

            templateUrl: getGlobalPath('/itc/views/directives/time-picker.html'),
                
            link: function(scope, element, attrs) {

                // Gets TODAY at midnight.
                scope.getTodayMoment = function() {
                    var year = moment().get('year');
                    var month = moment().get('month') + 1;
                    var date = moment().get('date');
                    return moment(year+"-"+month+"-"+date, "YYYY-MM-DD"); 
                }
                
                scope.hours = new Array(24);

                var firstHour = scope.getTodayMoment();

                var mmnt = firstHour;
                for (var hour = 0; hour < scope.hours.length; hour++) {
                    scope.hours[hour] = {};
                    
                    //scope.hours[hour].display = mmnt.format("h:mm A");
                    var timestamp = mmnt.valueOf();
                    scope.hours[hour].timestamp = timestamp;
                    scope.hours[hour].display = ITC.time.showTime( timestamp ); //$filter('date')( timestamp, 'shortTime'); 

                    scope.hours[hour].ms = hour * 60 * 60 * 1000;

                    mmnt.add(1, "hours");
                }

                // Given a timestamp, returns the localized time.
                scope.getLocalizedTime = function(timestamp) {
                    if (timestamp) {
                        return ITC.time.showTime( timestamp );
                    }
                    else {
                        return "";
                    }
                }

                // Given ms since midnight, returns the localized time.
                scope.getDisplayTime = function(msSinceMidnight) {
                    if (msSinceMidnight === undefined) {
                        return "";
                    }
                    var matchingHour = _.find(scope.hours, function(hour) {
                        return hour.ms === msSinceMidnight;
                    });
                    return scope.getLocalizedTime(matchingHour.timestamp);
                };

                scope.setTime = function(str) {
                    scope.timeSel = str;
                    element.find(".open").removeClass("open");
                }
                
            }

        }
    });
    
    /*
     * Search input field itcSearch
     *
     * @param searchModel The model you want to search on
     * @param searchResultsTally An integer that describes the number of results left (optional)
     *
     * Usage: <div itc-search search-model="some_var" searchResultsTally="some_int"></div>
     */
    form_elements.directive('itcSearch', function($filter) {
        return {
            restrict: 'AE',
            scope: {
                searchModel : '=',
                searchResultsTally : '='
            },
            template: '' +
                '<div class="search-input-container" ng-class="{\'has-query\': hasQuery, \'has-focus\': searchFocus}">' +
                    '<div class="watermark">' +
                      '<div class="search-icon icon"></div><div class="placeholder-text">{{ $parent.l10n.interpolate(\'ITC.apps.manageyourapps.summary.search\') }}</div>' +
                    '</div>' +
                    '<input ng-model="searchModel" class="search-input" ng-focus="searchFocus = true" ng-blur="searchFocus = false" ng-class="{\'no-tally\':searchResultsTally == undefined}" type="text"/>' +
                    '<div class="results-tally" ng-show="searchModel.length && searchResultsTally != undefined">{{ resultsString(searchResultsTally, $parent) }}</div>' +
                    '<div class="close-icon icon" ng-show="searchModel.length" ng-click="searchModel=clearSearch()"></div>' +
                '</div>',
            link: function(scope, element, attrs) {
                scope.hasQuery = false;

                scope.clearSearch = function() {
                    scope.searchModel = '';
                }

                scope.resultsString = function(searchResultsTally, parent) {
                    if (parent.l10n.length == 0) return;

                    var stringToReturn = '';

                    switch (searchResultsTally) {
                        case 0:
                            stringToReturn = parent.l10n.interpolate('ITC.apps.manageyourapps.summary.resultZero', {'numResults': $filter('number')(searchResultsTally) });
                            break;
                        case 1:
                            stringToReturn = parent.l10n.interpolate('ITC.apps.manageyourapps.summary.result', {'numResults': $filter('number')(searchResultsTally) });
                            break;
                        default:
                            stringToReturn = parent.l10n.interpolate('ITC.apps.manageyourapps.summary.results', {'numResults': $filter('number')(searchResultsTally) });
                            break;
                    }

                    return stringToReturn;
                }

                //watch for double byte character entry...
                element.on('compositionstart', function(data) {
                    scope.$apply(function(){
                        scope.hasQuery = true;
                    });
                });
                element.on('compositionend',function(data){
                    scope.$apply(function(){
                        if (scope.searchModel !== undefined && scope.searchModel.length > 0) {
                            scope.hasQuery = true;
                        } else {
                            scope.hasQuery = false;
                        }
                    });
                });

                scope.$watch('searchModel',function(){
                    if (scope.searchModel !== undefined && scope.searchModel.length) {
                        scope.hasQuery = true;
                    } else {
                        scope.hasQuery = false;
                    }
                });
            }
        };
    });


    /*
    Description: attribute that will add a class to element when it is in focus
    Usage: <input type="text" itc-focus-input>
    */
    form_elements.directive('itcFocusInput', function() {
      return {
        link: function(scope, element, attrs) {
          element.bind('focus', function() {
            $(element).addClass('focus');
          });
          element.bind('blur',function(){
            $(element).removeClass('focus');
          });
        }
      };
    });

    /*

    */
    form_elements.directive('itcSwitcherCheckbox',function(){
        return {
            restrict: 'A',
            scope: {
                'checkboxValue': '=itcSwitcherCheckbox',
                'checkboxName': '@',
                'checkboxLabel': '@',
                'callBackFuncForValue': '&',
                'checkboxEditable': '=',
            },
            template: ''+
                '<span class="switch" ng-class="{disabled: checkboxEditable === false}">'+
                '   <input type="checkbox" class="switchbox a11y" name="{{checkboxName}}" id="{{checkboxName}}"  ng-model="checkboxValue"  />'+
                '   <a href="" class="switcher" ng-class="{\'checked\':checkboxValue}" for="{{checkboxName}}" ng-click="switchit()">{{checkboxLabel}}<span></span></a>'+
                '</span>',
            link: function(scope,element,attrs){
                scope.switchit = function() {
                    if (attrs.checkboxEditable && attrs.checkboxEditable == false) return;
                    if (attrs.callBackFuncForValue === undefined || attrs.callBackFuncForValue === null) {
                      if (scope.checkboxValue) {
                            scope.checkboxValue = false;
                        } else {
                            scope.checkboxValue = true;
                        }
                    } else {
                        scope.checkboxValue = scope.callBackFuncForValue() || scope.checkboxValue;
                    }
                    
                }
            }
        }
    });

    /*
    Description: attribute that will show a textarea with a counter that updates on typing.
    Usage: <span ng-show="OPTIONAL_VARIABLE" text-area-with-counter="SCOPE_VAR" text-limit="350" text-area-class="tall"></span>

    more complete example:

    <span ng-show="versionInfo.appReviewInfo.reviewNotes.isEditable" 
                    text-area-with-counter="versionInfo.appReviewInfo.reviewNotes.value" 
                    text-limit="350"
                    text-area-required="versionInfo.appReviewInfo.reviewNotes.isRequired"
                    text-area-itc-field-server-error="{{ versionInfo.appReviewInfo.reviewNotes.errorKeys.length > 0 }}"
                    text-area-itc-field-orig-val="orignalVersionInfo.appReviewInfo.reviewNotes.value" 
                    text-area-itc-field-cur-val="versionInfo.appReviewInfo.reviewNotes.value"
                    text-area-itc-empty-errormsg="Provide a Review Notes for your app."
                    text-area-itc-char-exceed-errormsg="The Review Notes can not exceed 350 characters"
                    text-area-itc-field-server-error-msg="versionInfo.appReviewInfo.reviewNotes.errorKeys"
                    text-area-itc-field-pop-up-errors="true"></span>

    */
    form_elements.directive('textAreaWithCounter',function($sce){
        return {
            restrict: 'A',
            scope: {
                'text': '=textAreaWithCounter',
                'textAreaClass': '@',
                'textLimit':'@',
                'textAreaRequired':'=',
                'textAreaItcFieldServerError':'=',
                'textAreaItcFieldOrigVal': '=',
                'textAreaItcFieldCurVal': '=',
                'textAreaItcEmptyErrormsg': '@',
                'textAreaItcCharExceedErrormsg': '@',
                'textAreaItcFieldPopUpErrors': '@',
                'textAreaItcFieldWarningMsg': "=",
                'textAreaItcFieldServerErrorMsg':'=',
                'textAreaItcChangeCallback': '&',
                'hideTextCounter': '=',
                'placeholder': "@",
                'allowResize': '=?',
                'textAreaBlur': '&', // function to call on blur
                'textAreaName': '@',
                'textAreaLocName': '@',
                'textAreaFieldInfo': '=', // include if you want warnings
                'itcNgModelOptions': '='
            },
            template: function(element,attrs) {
                var includeNgModelOptions = attrs.itcNgModelOptions!==undefined ? 'ng-model-options="itcNgModelOptions"' : '';
                var includeTextLimit = 'ng-show="textLimit != null && !hideTextCounter"';
                if (attrs.textLimit === undefined) {
                    includeTextLimit = 'ng-hide="true"';
                }
                var htmlText =  '<span class="textareaWithCounter inputWrapper">'+
                                '   <textarea class="{{ textAreaClassUpdated }} {{ resizeClass }}" ng-model="text" ' +
                                        'ng-required="textAreaRequired" ' +
                                        'ng-blur="onBlur($event)" ' +
                                        'placeholder="{{placeholder}}"' + 
                                        'itc-field-server-error="textAreaItcFieldServerError" ' +
                                        'itc-field-info="textAreaFieldInfo" ' +
                                        'itc-field-orig-val="textAreaItcFieldOrigVal" ' +
                                        'itc-field-cur-val="textAreaItcFieldCurVal" ' +
                                        'itc-field-pop-up-errors="{{ textAreaItcFieldPopUpErrors }}" '+
                                        includeNgModelOptions +
                                        '></textarea>' +
                                '   <span class="errorPopUp mainError"> ' +
                                '       {{ errorMsg }} ' +
                                '   </span>' +
                                '   <span class="errorPopUp srvError">' +
                                '       <p ng-repeat="msg in textAreaItcFieldServerErrorMsg" ng-bind-html="renderHtml(msg)"></p>' +
                                '   </span>'  +
                                '   <span class="errorPopUp warning">' +
                                '       <p ng-repeat="msg in textAreaItcFieldWarningMsg" ng-bind-html="renderHtml(msg)"></p>' +
                                '   </span>'  +
                                '   <span class="{{ classlist }}" '+ includeTextLimit +'>{{ textremaining() }}</span>' +
                                '</span>';
                return htmlText;
            },
            link: function(scope,element,attrs) {

                scope.textLimit = parseInt(scope.textLimit);

                //console.log("Testing is textarea required: "+ scope.textAreaRequired + " " + scope.text);
                if (scope.textAreaRequired === "true") {
                     scope.textAreaRequired = true;
                } else if (scope.textAreaRequired === "false") {
                    scope.textAreaRequired = false;
                }
                if(scope.textAreaItcFieldServerError === "true") {
                    scope.textAreaItcFieldServerError = true;
                } else if(scope.textAreaItcFieldServerError === "true") {
                    scope.textAreaItcFieldServerError = false;
                }

                // Optionally, allow user to resize the textarea (for things like EULA)
                // Height remains capped at 500px, and it cannot be resized horizontally.
                if (attrs.allowResize !== undefined) {
                    if (attrs.allowResize === '') scope.resizeClass = "resizable";
                    if (/vert/i.test(attrs.allowResize)) scope.resizeClass = "resizable-vertical";
                }

                scope.onBlur = function(evt) {
                    if (scope.textAreaBlur) {
                        scope.textAreaBlur({event: evt, name: scope.textAreaName, locName: scope.textAreaLocName}); // this is how to pass params to & functions.
                    }
                }
                
                scope.checkErrorMsgs = function() {
                    /*
                    PRIORITY OF ERROR MESSAGES IS:
                    Highest: DISPLAY ERROR FROM SERVER FIRST (will go away once fields are different)
                    next: Characters are exceeded max #
                    next: no characters enetered
                    */
                    //console.log("scope.textAreaItcFieldServerError" + scope.textAreaItcFieldServerError);
                    if (scope.textAreaItcFieldServerError !== undefined && scope.textAreaItcFieldServerError !== null && (scope.textAreaItcFieldServerError === "true" || scope.textAreaItcFieldServerError === true)) {
                        scope.errorMsg = scope.textAreaItcFieldServerErrorMsg;
                    } else if (scope.textAreaItcFieldWarningMsg) {
                        scope.errorMsg = scope.textAreaItcFieldWarningMsg;
                    }
                    else if (scope.text !== undefined && scope.textremaining() < 0) {
                        scope.errorMsg = scope.textAreaItcCharExceedErrormsg;
                    } else {
                        scope.errorMsg = scope.textAreaItcEmptyErrormsg;
                    }
                    //console.log("final error message check " + scope.errorMsg);
                }

                scope.textremaining = function() {
                    if (scope.text !== undefined && scope.textLimit !== undefined && scope.textLimit !== "" && scope.text !== null && !scope.hideTextCounter) {
                        return (scope.textLimit - scope.text.length);
                    } else {
                        return scope.textLimit;
                    }
                   
                }
                scope.counterClasses = function() {
                    scope.classlist = "textCounter";
                    scope.textAreaClassUpdated = scope.textAreaClass;
                    if (scope.textremaining() < 0) {
                        scope.classlist += " overLimit";
                        //element.find('.textareaWithCounter').addClass('invalid');
                        scope.textAreaClassUpdated += " invalid";
                        //console.log("textAreaClassUpdated "+ scope.textAreaClassUpdated);
                    }
                }
                
                scope.counterClasses();
                
                scope.$watch('text',function(){
                    scope.checkErrorMsgs();
                    scope.counterClasses();
                    if (scope.textAreaItcChangeCallback) scope.textAreaItcChangeCallback();
                    //console.log("classlist: " + scope.classlist);
                });
                scope.$watch('textAreaClass',function(){
                    scope.counterClasses();
                });
                scope.renderHtml = function(html_code) {
                    return $sce.trustAsHtml(html_code);
                };

            }
        }
    });

    /* 
    Auto-appends "http://" to input fields that contain URL's
    OPTIONAL ATTRIBUTES:
    url-required-error-msg="{{ l10n.interpolate('ITC.apps.validation.url_field_incorrect_format') }}"
    field-required-error-msg="{{ l10n.interpolate('ITC.AppVersion.ErrorMessages.FieldRequired') }}"

    field-required-error-msg - pass in default string when field is required but left blank. Will be added to the "errorPopUp mainError" div which SHOULD BE the very next element to the input field

    url-required-error-msg - pass in string error message when field is not blank and a non http / https value has been left in the field. Will display in "errorPopUp mainError" div on blur. (error div should be the NEXT element to the input field)
    */
    form_elements.directive('urlInputField',function() {
        return {
            restrict: 'A',
            /*scope: {
                itcLaunchFilechooser: "@"
            },*/
            link: function(scope, element, attrs) {
                
                var protocolText = "http://"
                
                element.on('focus', function() {
                    if (element.val() === "") element.val( protocolText )
                });
                
                element.on('blur', function() {
                    element.removeClass('invalid');
                    var rgx = new RegExp( element.val() )
                    var elementVal = element.val();
                    if (rgx.test( protocolText )) {
                        element.val("");
                        if (attrs.fieldRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.fieldRequiredErrorMsg); 
                        }
                    } else if (elementVal.substring(0, 7) !== "http://" && elementVal.substring(0, 8) !== "https://") {
                        if (attrs.urlRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.urlRequiredErrorMsg);
                            element.addClass('invalid');
                        }
                    } else {
                        if (attrs.fieldRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.fieldRequiredErrorMsg); 
                        }
                    }
                });
            }
        }
    });

    /*

    attributes to include:
    passwordMatch
    fieldsMisMatchErrorMsg
    fieldRequiredErrorMsg
    */
    form_elements.directive('passwordMatchField',function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('blur',function() {
                    scope.checkFields();
                });
                
                scope.$watch(function(){
                    return attrs.passwordMatch;
                },function(val){
                    if (val) {
                        var elementVal = $(element).val();
                        //console.log(elementVal.length);
                        //console.log(attrs.passwordMatch.length);
                        if (elementVal.length <= attrs.passwordMatch.length) { //wait until field is longer than or equal to other field before checking equality
                          scope.checkFields();  
                        } else {
                            element.removeClass('invalid');
                            if (attrs.fieldRequiredErrorMsg !== undefined) {
                                element.next().html(attrs.fieldRequiredErrorMsg); 
                            }
                        }
                    }
                });

                scope.checkFields = function() {
                    element.removeClass('invalid');
                    if (attrs.passwordMatch !== '' && $(element).val() !== '' && attrs.passwordMatch !== $(element).val()) {
                        if (attrs.fieldsMisMatchErrorMsg !== undefined) {
                            element.next().html(attrs.fieldsMisMatchErrorMsg);
                            element.addClass('invalid');
                        }
                    } else {
                        if (attrs.fieldRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.fieldRequiredErrorMsg); 
                        }
                    }
                }
                /*var protocolText = "http://"
                
                element.on('focus', function() {
                    if (element.val() === "") element.val( protocolText )
                });
                
                element.on('blur', function() {
                    element.removeClass('invalid');
                    var rgx = new RegExp( element.val() )
                    var elementVal = element.val();
                    if (rgx.test( protocolText )) {
                        element.val("");
                        if (attrs.fieldRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.fieldRequiredErrorMsg); 
                        }
                    } else if (elementVal.substring(0, 7) !== "http://" && elementVal.substring(0, 8) !== "https://") {
                        if (attrs.urlRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.urlRequiredErrorMsg);
                            element.addClass('invalid');
                        }
                    } else {
                        if (attrs.fieldRequiredErrorMsg !== undefined) {
                            element.next().html(attrs.fieldRequiredErrorMsg); 
                        }
                    }
                });*/
            }
        }
    });

    /*
    See users_roles -> edit user notifications for use. styles found in _chosen.scss
    */
    form_elements.directive('chosenSelect',function($timeout){
        return {
            scope: {
                watchModel: "=",
                callbackFunction: '=',
                additionalReference: '@',
                emptyPlaceholderText: '@' 
            },
            link: function(scope,element,attrs) {
                scope.$watch('watchModel',function(newVal,oldVal) {
                    element.trigger("chosen:updated");
                    if (!($(newVal).not(oldVal).length == 0 && $(oldVal).not(newVal).length == 0)) {
                        if (scope.callbackFunction !== undefined) {
                           $timeout(function(){
                                scope.$apply(scope.callbackFunction(newVal,oldVal,scope.additionalReference))
                            });
                        }
                        element.trigger("chosen:updated");
                    } 
                },true);
                element.chosen({
                    width:"100%",
                    placeholder_text_multiple: scope.emptyPlaceholderText
                });
            }
        }
    });



        /*
    TODO - THIS DOESN"T WORK YET _ NEED TO MODIFY TO CREATE A SINGLE DATE PICKER....
    */
    form_elements.directive('itcDatepicker', function() {
        return {
            restrict: 'A',
            link : function (scope, element, attrs, ngModelCtrl) {
                $(function(){
                    element.datepicker({
                        dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
                        dateFormat: "M d, yy",
                        onSelect:function (date) {
                          //console.log(element)
                            scope.$apply(function () {
                                ngModelCtrl.$setViewValue(date);
                            });
                        }
                    });
                });
            }
        }
    });

    form_elements.directive('itcCharCounter', function() {
        var link = function(scope, element, attrs){
            scope.remainingCount = (scope.data || '').length;
            scope.maxLength = parseInt(scope.maxLength || 0);

            scope.$watch('data', function(newVal, oldVal, theScope){
                theScope.remainingCount = theScope.maxLength - (newVal || '').length;
            });
        };

        return {
            restrict: 'E',
            link : link,
            template: '{{remainingCount}}',
            scope: {
                data: '=',
                maxLength: '@',
            }
        }
    });


    /*
        Usage: 

       <div itc-pretty-popup-menu 
            disabled="disabled"
            current-selection="countryData"
            current-selection-text-function="getMenuItemHeaderText(menuItemHeaderObj)"
            popup-menu-id="countryChoices{{$index}}"
            extra-class="useIndexFromHere"
            list="filtered"
            on-click-func="setCountry(event, newlySelectedObj)"
            item-is-currently-selected="isCurrentlySelected(menuItemObj, selectedObj)"
            menu-item-text-func="getMenuItemText(menuItemObj)"
            popup-type="centerPopDown"
            select-style="true"
        >
        </div>

        disabled - true/false - depending if you want the popup disabled.
        current-selection - the object that is currently (initially) selected
        current-selection-text-function - the function called to get the header text (currently selected text)
        popup-menu-id - the id of the popup menu
        extra-class - any extra class you want to add to the centerPopDown
        list - the array of menu items - should be an array of objects such as current-selection
        on-click-func - a function to be called when a menu item is selected - takes 2 params - the event and the selected item (object). This function should do something to put a different object in currentSelection
        item-is-currently-selected - a function, that if it returns true, puts a check mark near that item in the list - takes 2 params - an item in the list and the current selection
        menu-item-text-func - the function called to get the menu item text (given the item object from the list)
        popup-type - popup class. example: centerPopDown
        select-style - if true, makes it look like a (pretty) select box

    */
    form_elements.directive('itcPrettyPopupMenu', ['$rootScope',function($rootScope) {
        return {
            replace: true,
            transclude: false,
            scope: {
                'disabled': "=",
                'currentSelectionTextFunction': "&",
                'currentSelection': "=", 
                'popupMenuId': "@",
                'extraClass': "@",
                'list': "=",
                'onClickFunc': "&",
                'itemIsCurrentlySelected': "&",
                'menuItemTextFunc': "&",
                'popupType': "@",
                'width': "@",
                'selectStyle': "="
            },  

            templateUrl: getGlobalPath('/itc/views/directives/prettyPopUp.html'),
                
            link: function(scope, element, attrs) {
                //console.log("currentSelection: ", scope.currentSelection);
                
                scope.clickFunc = function(e, item) { 
                    scope.onClickFunc({event: e, newlySelectedObj: item}); // this is how to pass params to & functions.

                    element.find("#" + scope.popupMenuId).removeClass("open"); // close the popup.
                }

                scope.currentlySelected = function(item) { 
                    return scope.itemIsCurrentlySelected({menuItemObj: item, selectedObj: scope.currentSelection});
                }

                scope.getMenuItemText = function(item) {
                    return scope.menuItemTextFunc({menuItemObj: item});
                }

                scope.getHeaderText = function() {
                    if (!$rootScope || !$rootScope.l10n) return "";
                    if (scope.currentSelection === undefined) {
                        return $rootScope.l10n.interpolate('ITC.apps.createNewApp.defaultLang.initSelect');
                    }
                    if (scope.selectStyle) {
                        element.find(".select-like a").addClass("selected"); // makes link black instead of blue on non-choose choice.
                    }
                    return scope.currentSelectionTextFunction({menuItemHeaderObj: scope.currentSelection});
                }

                scope.setWidth = function() {
                    if (scope.width && scope.width.length > 0) {
                        var el = element.find('.label');
                        el.css("width", scope.width);
                        el.css("maxWidth", scope.width);
                        el.css("minWidth", "0px");
                    }
                }

                // To show a tooltip if the title is shortened with ellipses
                element.find(".prettyPopupHeader a").bind('mouseenter', function(){
                    var $this = $(this);

                    if(this.offsetWidth < this.scrollWidth && (!$this.attr('title') || $this.attr('title').length===0)) {
                        $this.attr('title', $this.text().trim());
                    }
                    else {
                        $this.attr('title', "");
                    }
                });

                scope.setWidth();
            }

        }
    }]);

    /*
        Just add show-tooltip-if-ellipsed to any element that might ellipsis's its text to show a tooltip.
    */
    form_elements.directive('showTooltipIfEllipsed', function() {
        return {
            replace: true,
            transclude: false,
            scope: {
            },   
            link: function(scope, element, attrs) {
                
                // To show a tooltip if the title is shortened with ellipses
                element.bind('mouseenter', function(){
                    var $this = $(this);

                    var widthShortened = this.offsetWidth < this.scrollWidth;
                    var heightShortened = this.offsetHeight < this.scrollHeight;

                    if((widthShortened || heightShortened) && (!$this.attr('title') || $this.attr('title').length===0)) {
                        var str = $this.text().trim();
                        // replace <br>s with spaces
                        var regex = /<br\s*[\/]?>/gi;
                        str = str.replace(regex, " ");

                        // replace $nbsp;'s
                        //var re = new RegExp(String.fromCharCode(160), "g"); // does not work because at this point it's just text.
                        str = str.replace(new RegExp("&nbsp;", 'g'), " ");

                        $this.attr('title', str);
                    }
                    else {
                        $this.attr('title', "");
                    }
                });
            }
        }
    });

    /*
        To have a link popup a filechooser and do something (anything) with the selected files, use this directive. 
        Calls the on-file-select-func function once the files are selected from the file chooser.

        Usage example:
        <div import-file-link 
            link-text="{{ l10n['ITC.pricing.volumePurchaseProg.importFile'] }}" 
            popup-menu-id="importVppPopup"
            loc-file="l10n"
            tooltip-text-key="ITC.pricing.volumePurchaseProg.importFile.tooltip"
            template-file="/itc/docs/vpp_import.csv"
            on-file-select-func="importVPPfileSelected(files)" 
            errors="tempPageContent.vppErrors"
            >
        </div>

        link-text - the text for the link (something like 'Import File' or 'Choose File') 
        popup-menu-id - the id for the help popup 
        loc-file - in our case l10n
        tooltip-text-key - the tooltip loc key - (example: "ITC.pricing.volumePurchaseProg.importFile.tooltip")
        template-csv-file - the filesystem string to an example file template - (example: "/itc/docs/vpp_import.csv")
        on-file-select-func - a function to call when files are selected! Always use the "files" parameter. Just do it.
        errors - a place to store errors.
    */
    form_elements.directive('importFileLink', function() {
        return {
            replace: true,
            transclude: false,
            scope: {
                'linkText': "@",
                'popupMenuId': "@",
                'onFileSelectFunc': '&',
                'locFile': "=",
                'tooltipTextKey': "@",
                'templateFile': "@",
                'errors': "="
            },  

            templateUrl: getGlobalPath('/itc/views/directives/import_file.html'),
                
            link: function(scope, element, attrs) {
                
                scope.openFileDialog = function() {
                    element.find("input").click();
                }

                scope.onFileSelect = function(selectedFiles) { 
                    scope.onFileSelectFunc({files: selectedFiles}); // this is how to pass params to & functions.
                }

            }

        }
    });


    form_elements.directive('itcLink', function() {
        return {
            replace: true,
            transclude: false,
            scope: {
                'disable': "=",
                'onClickFunc': "&",
                'text': "@"
            },  

            template: '<a href class="disableable" ng-click="clickFunc($event)">{{text}}</a>',
            
            link: function(scope, element, attrs) {
                
                scope.clickFunc = function(e) { 
                    if (scope.disable) {
                        e.preventDefault();
                    }
                    else {
                        scope.onClickFunc({event: e}); // this is how to pass params to & functions.
                    }
                }

                scope.$watch('disable', function(newVal, oldVal){
                    if (newVal) {
                        element.attr("disabled", true);
                    }
                    else {
                        element.removeAttr("disabled");
                    }
                });

                
            }

        }
    });

    /*
        Add to any element you want to listen to dragenter/dragleave/drop events on (and prevent the default browser behavior on).

        Example:
        <div itc-drag-drop-listener 
            drop-func="mediaStackZoneDrop(el)"
            dragover-func="mediaStackZoneDragover(el)"
            dragleave-func="mediaStackZoneDragleave(el)">
        </div>    
    */
    form_elements.directive('itcDragDropListener', function() {
        return {
            scope: {
                dropFunc: '&',
                dragoverFunc: '&',
                dragleaveFunc: '&',
            },  
            link: function(scope, element, attrs) {
                element
                    .bind('drop', function (event) {
                        var dataTransfer = event.dataTransfer ?
                            event.dataTransfer :
                            event.originalEvent.dataTransfer; // jQuery fix;
                        if (!dataTransfer) return;
                        event.preventDefault();
                        event.stopPropagation();
                        if (scope.dropFunc) {
                            scope.dropFunc({el: element}); 
                        }
                    })
                    .bind('dragover', function (event) {
                        var dataTransfer = event.dataTransfer ?
                            event.dataTransfer :
                            event.originalEvent.dataTransfer; // jQuery fix;

                        event.preventDefault();
                        event.stopPropagation();
                        dataTransfer.dropEffect = 'copy';
                        if (scope.dragoverFunc) {
                            scope.dragoverFunc({el: element});
                        }
                    })
                    .bind('dragleave', function () {
                        if (scope.dragleaveFunc) {
                            scope.dragleaveFunc({el: element});
                        }
                    });
            }

        }
    });

    /*
        Adds an error popup to any element (so far only tested on a dropwell), which appears when the popup-error-displayer attribute becomes something truthy.
        Example: 
            <div popup-error-displayer="tempPageContent.mediaData[currentLoc][currentDevice].errorInPopup">
            </div>
    */
    form_elements.directive('popupErrorDisplayer', function($compile, $timeout) {
        return {
            scope: {
                'error': '=popupErrorDisplayer',
                'positionErrorRelativeTo': "="
            },  
            link: function(scope, element, attrs) {

                // append the error popup to this element!
                var errorPopupHTML = '<span class="errorPopUp thisErrorPopup" ng-show="error" >' +
                    '<p ng-bind-html="error"></p>' +
                    '</span>';
                var el = angular.element(errorPopupHTML);          
                $compile(el)(scope);
                element.append(el);

                scope.getFixedPos = function() {
                    var rect = null;
                    var thisRect;

                    var enclosingEl = element.closest("." + scope.positionErrorRelativeTo);
                    if (enclosingEl && enclosingEl[0]) {
                        rect = enclosingEl[0].getBoundingClientRect();
                        //console.log(rect.top, rect.right, rect.bottom, rect.left);
                    }
                    return rect;
                }

                scope.$watch('error',function(val, oldVal) {
                    if (scope.error) {

                         if (!scope.positionErrorRelativeTo) {
                            scope.showError();
                        }
                            
                        element
                            .bind('mouseenter', function(event) {
                                var errorPopup = $(this).find(".errorPopUp.thisErrorPopup");
                                if (scope.positionErrorRelativeTo) {
                                    var pos = scope.getFixedPos();
                                    var left = pos.left + (pos.right - pos.left)/2;
                                    errorPopup.css('top', (pos.top + 5) + "px");
                                    errorPopup.css('left', left + "px");
                                }
                                errorPopup.addClass("open");
                            })
                            .bind('mouseleave', function(event) {
                                if (!scope.stayOpen) {
                                    var errorPopup = $(this).find(".errorPopUp.thisErrorPopup");
                                    errorPopup.removeClass("open");
                                }  
                            });
                    }
                    else {
                        if (scope.error !== undefined) {
                            scope.clearError();

                            element.unbind("mouseenter");
                            element.unbind("mouseleave");
                        }
                    }
                });

                scope.showError = function() {
                    element.addClass("error"); // adds red border around this element

                    var errorPopup = element.find(".errorPopUp.thisErrorPopup");
                    errorPopup.addClass("open");

                    // show the error popup for 3 seconds regardless of mouse hover.
                    scope.stayOpen = true;
                    $timeout(function(){
                        errorPopup.removeClass("open");
                        scope.stayOpen = false;
                    },3000);
                };

                scope.clearError = function() {
                    element.removeClass("error"); // removes red border
                };          
            }
        }
    });

    /*
        A wizard in a modal!
        Usage:

        <div itc-wizard-modal 
            show='tempPageContent.showDocModal' 
            l10n='l10n' 
            curr-step='tempPageContent.currentStepName'
            include-func="getGlobalFilePathMap(template)" 
            step-array="tempPageContent.steps"
            on-finish="xcWizardFinished(data)" 
            exit-validation-func="validateStep()"
            step-models="tempPageContent.stepModels">
        </div>

        show: if true, this modal will show.
        l10n: the loc file
        curr-step: the model on which current step name will be set on. Currently will set it to the step number
        include-func: just literally use getGlobalFilePathMap(template)
        step-array - an array of wizard steps. Each element of the array should look something like '/itc/views/app/step1.html')
        on-finish: the function to be called when "next" is clicked on the last step
        exit-validation-func: the function to be called to validate the current step. if it returns true, the next button will be enabled, disabled otherwise.
        step-models: the models on which the current step's data will be set as it is changed   
        header: the title in the modal, if the title should be the same at each step.    
        headerArr: an array of titles for the different steps in the wizard. Should correspond to same order as stepArray. Leave 'header' out of directive
            if using 'headerArr'
        data: some data to pass down to each step's scope.
        onFileSelectFunc: if this modal contains a file chooser, can use this function to pass along the data
    */
    form_elements.directive( 'itcWizardModal', [ '$timeout', 'ITC', function( $timeout, ITC ) {
        return {
            replace: false,
            transclude: false,
            scope: {
                'show': "=",
                'l10n': '=',
                'includeFunc': '&',
                'onFileSelectFunc': '&', // optional
                'fileUploading': '=', // optional
                'fileUploadError': '=',
                'stepArray': "=",
                'onFinish': '&',
                'onCancel': '&',
                'currStep': "=",
                'saveInProgress': "=",
                'saveErrors': "=",
                'exitValidationFunc': "&",
                'onNextFunc': "&",
                'extraTextFunc': "&", // optional
                'stepModels': "=",
                'header': "@",
                'headerArr': "=",
                'data': "=",
                'file': "=",
                'width': "@",
                'wizardName': "@",
                'lastStepNextButtonLocKey': "@",
                'height': "@",
                'dataloaded': "=?",
                'minheight': "@"
            },  

            templateUrl: getGlobalPath('/itc/views/directives/wizard-modal.html'),
            link: function(scope, element, attrs) {

                scope.namespace = '.wizardListener';

                scope.temp = {};
                scope.temp.currentStep = scope.currStep;
                scope.temp.reset = false;
                scope.temp.disableDefaultEscape = true; //disable default escape on itc-modal - because we'll handle it here differently
                scope.ITC = ITC;
                if (scope.dataloaded === undefined) {
                    scope.dataloaded = { value:true};
                }

                scope.finishedWizard = function(someData) {
                    scope.onFinish({data: someData}); // pass someData along
                    
                    // timeout here because saveInProgress is set to true in onFinish and it takes a moment.
                    $timeout( function() {
                        if (scope.saveInProgress === undefined) {
                            scope.hideModal(false);
                        }
                    }, 10); 
                    
                }

                scope.$watch('saveInProgress',function(val, oldVal) {
                    if (val !== undefined && val === false && oldVal === true) {
                        if (!scope.saveErrors || scope.saveErrors.length === 0) {
                            scope.hideModal(false);
                        }
                    }
                }, true);
                
                scope.$watch('show',function(val,oldval){
                    if (val !== undefined && val !== oldval && val) {
                        scope.bindListeners();
                    }
                });

                scope.hideModal = function(cancel) {
                    scope.show = false;

                    scope.temp.currentStep = "0";

                    // clear step models
                    if (scope.stepModels) {
                        scope.stepModels.length = 0;
                    }

                    scope.temp.reset = true;

                    if (scope.onCancel && cancel) {
                        scope.onCancel();
                    }
                    scope.unbindListeners();
                }

                //itc-modals close on esc key - run "hideModal" when someone clicks esc...
                scope.bindListeners = function() {
                    $(document).bind( 'keyup' + scope.namespace, function(e) {
                        var keyCode = e.keyCode || e.which;
                        if (keyCode === 27) scope.hideModal(true);
                    });
                }
                scope.unbindListeners = function() {
                    $(document).unbind(scope.namespace)
                    $(element).unbind(scope.namespace)
                }
            

                scope.clearFile= function() {
                    scope.file = null;
                }

                scope.getNextButtonText = function() {
                    if (!scope.l10n || !scope.stepArray || !scope.currStep) {
                        return;
                    }
                    if (scope.isOnLastStep()) {
                        var step = scope.stepArray[scope.currStep];
                        if (step.customLastButtonLocKey) {
                            return scope.l10n.interpolate(step.customLastButtonLocKey); // custom last step text
                        }
                        else {
                            return scope.l10n.interpolate(scope.lastStepNextButtonLocKey); // default last step text
                        }
                    } 
                    else { 
                        return scope.l10n.interpolate('ITC.btn.next');
                    }
                }

                /*scope.$watch('stepModels',function(val) {
                    if (val) {
                        console.log("stepModels", val);
                    }
                }, true);
                */

                scope.$watch('temp.currentStep',function(val) {
                    if (val) {
                        scope.currStep = val;

                        if (scope.stepArray[val].isGeneric) { 
                            scope.question = scope.stepArray[val].data;
                        }
                        if (scope.stepArray[val].questionKey) {
                            scope.questionKey = scope.stepArray[val].questionKey;
                        }

                        scope.temp.scrollToDivTop = true;
                    }
                });

                /*
                scope.$watch('data',function(val) {
                    if (val) {
                        console.log("data: ", val);
                    }
                });
                */

                scope.getExtraText = function() {
                    return scope.extraTextFunc();
                }

                scope.exitValidation = function() {
                    return scope.exitValidationFunc();
                }

                scope.onNext = function() {
                    return scope.onNextFunc();
                }

                scope.isOnFirstStep = function() {
                    return (parseInt(scope.currStep) === 0);
                }

                scope.isOnLastStep = function() {
                    if (scope.currStep === undefined || scope.currStep === null) {
                        return true;
                    }
                    var model = scope.stepModels[scope.currStep]; // get the current answer.
                    var nextStep = scope.stepArray[scope.currStep].nextStep[model]; // get the next step given the current answer.
                    return (nextStep === null); // return true if there's no next step.
                }
            }

        }
    }]);

    // Use on an <input> field to ensure its ngModel binding yields an integer
    form_elements.directive( 'integer', function (){
        return {
            require: 'ngModel',
            link: function( $$, el, attr, ctrl ) {
                ctrl.$parsers.unshift( function( viewValue ) {
                    return parseInt( viewValue, 10 ) || 0;
                });
            }
        };
    });

    // Restricts a text input to positive integers < a given maximum value.
    form_elements.directive( 'inputMaximumValue', [ '$timeout', function( $timeout ) {
        return {
            
            restrict: 'A',
            require:  'ngModel', // so we can keep the bound value in sync with the visible value
            
            link: function( $$, el, attrs, ngModelCtrl ) {
                
                $timeout( function() {
                    
                    var $el = $(el);
                    
                    // Get the max value that's allowed for this input
                    // <input ... input-maximum-value="100" ... />
                    var $maxValue = parseInt( attrs.inputMaximumValue, 10 ),
                        $allowZero = !!( attrs.allowZero ) || false,
                        previousValue;
                    
                    // Bail out if we've received an invalid maximum value
                    if (isNaN($maxValue) || $maxValue < 0) return;
                    
                    // Check the input + react if needed
                    function enforceMaxValue() {
                        // Remove non-numerical values
                        var number = $el.val();
                        var value = parseInt( number, 10 );

                        // If value is un-changed, return (to avoid kicking the
                        // user's cursor toward the right side of the input)
                        if ( value === previousValue && number === value) return;
                        
                        previousValue = value;
                        var newValue = value;
                        // Reject text input + zeroes (if desired)
                        if ( isNaN(value) || (!$allowZero && value === 0)) 
                            newValue = '';
                        // Enforce the maximum value
                        else if (value > $maxValue )
                            newValue = $maxValue;
                        
                        else newValue = value;

                        // Because we're modifying the DOM,
                        $el[0].value = newValue;
                        // this second method is necessary to keep model in sync.
                        ngModelCtrl.$setViewValue(newValue);
                    }
                    
                    // Check for changes on keyup
                    $el.keyup( function() {
                        enforceMaxValue();
                        $timeout( enforceMaxValue, 2 );
                    });
                    
                });
            }
        } 
    }]);

});
