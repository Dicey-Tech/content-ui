// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
    var Accordion = function(element) {
      this.element = element;
      this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
      this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
      this.showClass = 'accordion'+this.version+'__item--is-open';
      this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
      this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
      this.initAccordion();
    };
  
    Accordion.prototype.initAccordion = function() {
      //set initial aria attributes
      for( var i = 0; i < this.items.length; i++) {
        var button = this.items[i].getElementsByTagName('button')[0],
          content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
          isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
        Util.setAttributes(button, {'aria-expanded': isOpen, 'aria-controls': 'accordion-content-'+i, 'id': 'accordion-header-'+i});
        Util.addClass(button, 'js-accordion__trigger');
        Util.setAttributes(content, {'aria-labelledby': 'accordion-header-'+i, 'id': 'accordion-content-'+i});
      }
  
      //listen for Accordion events
      this.initAccordionEvents();
    };
  
    Accordion.prototype.initAccordionEvents = function() {
      var self = this;
  
      this.element.addEventListener('click', function(event) {
        var trigger = event.target.closest('.js-accordion__trigger');
        //check index to make sure the click didn't happen inside a children accordion
        if( trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
      });
    };
  
    Accordion.prototype.triggerAccordion = function(trigger) {
      var self = this;
      var bool = (trigger.getAttribute('aria-expanded') === 'true');
  
      this.animateAccordion(trigger, bool);
    };
  
    Accordion.prototype.animateAccordion = function(trigger, bool) {
      var self = this;
      var item = trigger.closest('.js-accordion__item'),
        content = item.getElementsByClassName('js-accordion__panel')[0],
        ariaValue = bool ? 'false' : 'true';
  
      if(!bool) Util.addClass(item, this.showClass);
      trigger.setAttribute('aria-expanded', ariaValue);
      self.resetContentVisibility(item, content, bool);
  
      if( !this.multiItems && !bool) this.closeSiblings(item);
    };
  
    Accordion.prototype.resetContentVisibility = function(item, content, bool) {
      Util.toggleClass(item, this.showClass, !bool);
      content.removeAttribute("style");
      if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
        this.moveContent();
      }
    };
  
    Accordion.prototype.closeSiblings = function(item) {
      //if only one accordion can be open -> search if there's another one open
      var index = Util.getIndexInArray(this.items, item);
      for( var i = 0; i < this.items.length; i++) {
        if(Util.hasClass(this.items[i], this.showClass) && i != index) {
          this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true);
          return false;
        }
      }
    };
  
    Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
      var openAccordion = this.element.getElementsByClassName(this.showClass);
      if(openAccordion.length == 0) return;
      var boundingRect = openAccordion[0].getBoundingClientRect();
      if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
        var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
        window.scrollTo(0, boundingRect.top + windowScrollTop);
      }
    };
  
    window.Accordion = Accordion;
    
    //initialize the Accordion objects
    var accordions = document.getElementsByClassName('js-accordion');
    if( accordions.length > 0 ) {
      for( var i = 0; i < accordions.length; i++) {
        (function(i){new Accordion(accordions[i]);})(i);
      }
    }
  }());
// File#: _1_circular-progress-bar
// Usage: codyhouse.co/license
(function() {	
    var CProgressBar = function(element) {
      this.element = element;
      this.fill = this.element.getElementsByClassName('c-progress-bar__fill')[0];
      this.fillLength = getProgressBarFillLength(this);
      this.label = this.element.getElementsByClassName('js-c-progress-bar__value');
      this.value = parseFloat(this.element.getAttribute('data-progress'));
      // before checking if data-animation is set -> check for reduced motion
      updatedProgressBarForReducedMotion(this);
      this.animate = this.element.hasAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on';
      this.animationDuration = this.element.hasAttribute('data-duration') ? this.element.getAttribute('data-duration') : 1000;
      // animation will run only on browsers supporting IntersectionObserver
      this.canAnimate = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
      // this element is used to announce the percentage value to SR
      this.ariaLabel = this.element.getElementsByClassName('js-c-progress-bar__aria-value');
      // check if we need to update the bar color
      this.changeColor =  Util.hasClass(this.element, 'c-progress-bar--color-update') && Util.cssSupports('color', 'var(--color-value)');
      if(this.changeColor) {
        this.colorThresholds = getProgressBarColorThresholds(this);
      }
      initProgressBar(this);
      // store id to reset animation
      this.animationId = false;
    };
  
    // public function
    CProgressBar.prototype.setProgressBarValue = function(value) {
      setProgressBarValue(this, value);
    };
  
    function getProgressBarFillLength(progressBar) {
      return parseFloat(2*Math.PI*progressBar.fill.getAttribute('r')).toFixed(2);
    };
  
    function getProgressBarColorThresholds(progressBar) {
      var thresholds = [];
      var i = 1;
      while (!isNaN(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--c-progress-bar-color-'+i)))) {
        thresholds.push(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--c-progress-bar-color-'+i)));
        i = i + 1;
      }
      return thresholds;
    };
  
    function updatedProgressBarForReducedMotion(progressBar) {
      // if reduced motion is supported and set to reduced -> remove animations
      if(osHasReducedMotion) progressBar.element.removeAttribute('data-animation');
    };
  
    function initProgressBar(progressBar) {
      // set shape initial dashOffset
      setShapeOffset(progressBar);
      // set initial bar color
      if(progressBar.changeColor) updateProgressBarColor(progressBar, progressBar.value);
      // if data-animation is on -> reset the progress bar and animate when entering the viewport
      if(progressBar.animate && progressBar.canAnimate) animateProgressBar(progressBar);
      else setProgressBarValue(progressBar, progressBar.value);
      // reveal fill and label -> --animate and --color-update variations only
      setTimeout(function(){Util.addClass(progressBar.element, 'c-progress-bar--init');}, 30);
  
      // dynamically update value of progress bar
      progressBar.element.addEventListener('updateProgress', function(event){
        // cancel request animation frame if it was animating
        if(progressBar.animationId) window.cancelAnimationFrame(progressBar.animationId);
        
        var final = event.detail.value,
          duration = (event.detail.duration) ? event.detail.duration : progressBar.animationDuration;
        var start = getProgressBarValue(progressBar);
        // trigger update animation
        updateProgressBar(progressBar, start, final, duration, function(){
          emitProgressBarEvents(progressBar, 'progressCompleted', progressBar.value+'%');
          // update value of label for SR
          if(progressBar.ariaLabel.length > 0) progressBar.ariaLabel[0].textContent = final+'%';
        });
      });
    }; 
  
    function setShapeOffset(progressBar) {
      var center = progressBar.fill.getAttribute('cx');
      progressBar.fill.setAttribute('transform', "rotate(-90 "+center+" "+center+")");
      progressBar.fill.setAttribute('stroke-dashoffset', progressBar.fillLength);
      progressBar.fill.setAttribute('stroke-dasharray', progressBar.fillLength);
    };
  
    function animateProgressBar(progressBar) {
      // reset inital values
      setProgressBarValue(progressBar, 0);
      
      // listen for the element to enter the viewport -> start animation
      var observer = new IntersectionObserver(progressBarObserve.bind(progressBar), { threshold: [0, 0.1] });
      observer.observe(progressBar.element);
    };
  
    function progressBarObserve(entries, observer) { // observe progressBar position -> start animation when inside viewport
      var self = this;
      if(entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
        updateProgressBar(this, 0, this.value, this.animationDuration, function(){
          emitProgressBarEvents(self, 'progressCompleted', self.value+'%');
        });
      }
    };
  
    function setProgressBarValue(progressBar, value) {
      var offset = ((100 - value)*progressBar.fillLength/100).toFixed(2);
      progressBar.fill.setAttribute('stroke-dashoffset', offset);
      if(progressBar.label.length > 0 ) progressBar.label[0].textContent = value;
      if(progressBar.changeColor) updateProgressBarColor(progressBar, value);
    };
  
    function updateProgressBar(progressBar, start, to, duration, cb) {
      var change = to - start,
        currentTime = null;
  
      var animateFill = function(timestamp){  
        if (!currentTime) currentTime = timestamp;         
        var progress = timestamp - currentTime;
        var val = parseInt((progress/duration)*change + start);
        // make sure value is in correct range
        if(change > 0 && val > to) val = to;
        if(change < 0 && val < to) val = to;
        if(progress >= duration) val = to;
  
        setProgressBarValue(progressBar, val);
        if(progress < duration) {
          progressBar.animationId = window.requestAnimationFrame(animateFill);
        } else {
          progressBar.animationId = false;
          cb();
        }
      };
      if ( window.requestAnimationFrame && !osHasReducedMotion ) {
        progressBar.animationId = window.requestAnimationFrame(animateFill);
      } else {
        setProgressBarValue(progressBar, to);
        cb();
      }
    };
  
    function updateProgressBarColor(progressBar, value) {
      var className = 'c-progress-bar--fill-color-'+ progressBar.colorThresholds.length;
      for(var i = progressBar.colorThresholds.length; i > 0; i--) {
        if( !isNaN(progressBar.colorThresholds[i - 1]) && value <= progressBar.colorThresholds[i - 1]) {
          className = 'c-progress-bar--fill-color-' + i;
        } 
      }
      
      removeProgressBarColorClasses(progressBar);
      Util.addClass(progressBar.element, className);
    };
  
    function removeProgressBarColorClasses(progressBar) {
      var classes = progressBar.element.className.split(" ").filter(function(c) {
        return c.lastIndexOf('c-progress-bar--fill-color-', 0) !== 0;
      });
      progressBar.element.className = classes.join(" ").trim();
    };
  
    function getProgressBarValue(progressBar) {
      return (100 - Math.round((parseFloat(progressBar.fill.getAttribute('stroke-dashoffset'))/progressBar.fillLength)*100));
    };
  
    function emitProgressBarEvents(progressBar, eventName, detail) {
      progressBar.element.dispatchEvent(new CustomEvent(eventName, {detail: detail}));
    };
  
    window.CProgressBar = CProgressBar;
  
    //initialize the CProgressBar objects
    var circularProgressBars = document.getElementsByClassName('js-c-progress-bar');
    var osHasReducedMotion = Util.osHasReducedMotion();
    if( circularProgressBars.length > 0 ) {
      for( var i = 0; i < circularProgressBars.length; i++) {
        (function(i){new CProgressBar(circularProgressBars[i]);})(i);
      }
    }
  }());
// File#: _1_popover
// Usage: codyhouse.co/license
(function() {
    var Popover = function(element) {
      this.element = element;
      this.elementId = this.element.getAttribute('id');
      this.trigger = document.querySelectorAll('[aria-controls="'+this.elementId+'"]');
      this.selectedTrigger = false;
      this.popoverVisibleClass = 'popover--is-visible';
      this.selectedTriggerClass = 'popover-control--active';
      this.popoverIsOpen = false;
      // focusable elements
      this.firstFocusable = false;
      this.lastFocusable = false;
      // position target - position tooltip relative to a specified element
      this.positionTarget = getPositionTarget(this);
      // gap between element and viewport - if there's max-height 
      this.viewportGap = parseInt(getComputedStyle(this.element).getPropertyValue('--popover-viewport-gap')) || 20;
      initPopover(this);
      initPopoverEvents(this);
    };
  
    // public methods
    Popover.prototype.togglePopover = function(bool, moveFocus) {
      togglePopover(this, bool, moveFocus);
    };
  
    Popover.prototype.checkPopoverClick = function(target) {
      checkPopoverClick(this, target);
    };
  
    Popover.prototype.checkPopoverFocus = function() {
      checkPopoverFocus(this);
    };
  
    // private methods
    function getPositionTarget(popover) {
      // position tooltip relative to a specified element - if provided
      var positionTargetSelector = popover.element.getAttribute('data-position-target');
      if(!positionTargetSelector) return false;
      var positionTarget = document.querySelector(positionTargetSelector);
      return positionTarget;
    };
  
    function initPopover(popover) {
      // init aria-labels
      for(var i = 0; i < popover.trigger.length; i++) {
        Util.setAttributes(popover.trigger[i], {'aria-expanded': 'false', 'aria-haspopup': 'true'});
      }
    };
    
    function initPopoverEvents(popover) {
      for(var i = 0; i < popover.trigger.length; i++) {(function(i){
        popover.trigger[i].addEventListener('click', function(event){
          event.preventDefault();
          // if the popover had been previously opened by another trigger element -> close it first and reopen in the right position
          if(Util.hasClass(popover.element, popover.popoverVisibleClass) && popover.selectedTrigger !=  popover.trigger[i]) {
            togglePopover(popover, false, false); // close menu
          }
          // toggle popover
          popover.selectedTrigger = popover.trigger[i];
          togglePopover(popover, !Util.hasClass(popover.element, popover.popoverVisibleClass), true);
        });
      })(i);}
      
      // trap focus
      popover.element.addEventListener('keydown', function(event){
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
          //trap focus inside popover
          trapFocus(popover, event);
        }
      });
    };
    
    function togglePopover(popover, bool, moveFocus) {
      // toggle popover visibility
      Util.toggleClass(popover.element, popover.popoverVisibleClass, bool);
      popover.popoverIsOpen = bool;
      if(bool) {
        popover.selectedTrigger.setAttribute('aria-expanded', 'true');
        getFocusableElements(popover);
        // move focus
        focusPopover(popover);
        popover.element.addEventListener("transitionend", function(event) {focusPopover(popover);}, {once: true});
        // position the popover element
        positionPopover(popover);
        // add class to popover trigger
        Util.addClass(popover.selectedTrigger, popover.selectedTriggerClass);
      } else if(popover.selectedTrigger) {
        popover.selectedTrigger.setAttribute('aria-expanded', 'false');
        if(moveFocus) Util.moveFocus(popover.selectedTrigger);
        // remove class from menu trigger
        Util.removeClass(popover.selectedTrigger, popover.selectedTriggerClass);
        popover.selectedTrigger = false;
      }
    };
    
    function focusPopover(popover) {
      if(popover.firstFocusable) {
        popover.firstFocusable.focus();
      } else {
        Util.moveFocus(popover.element);
      }
    };
  
    function positionPopover(popover) {
      // reset popover position
      resetPopoverStyle(popover);
      var selectedTriggerPosition = (popover.positionTarget) ? popover.positionTarget.getBoundingClientRect() : popover.selectedTrigger.getBoundingClientRect();
      
      var menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
        
      var left = selectedTriggerPosition.left,
        right = (window.innerWidth - selectedTriggerPosition.right),
        isRight = (window.innerWidth < selectedTriggerPosition.left + popover.element.offsetWidth);
  
      var horizontal = isRight ? 'right: '+right+'px;' : 'left: '+left+'px;',
        vertical = menuOnTop
          ? 'bottom: '+(window.innerHeight - selectedTriggerPosition.top)+'px;'
          : 'top: '+selectedTriggerPosition.bottom+'px;';
      // check right position is correct -> otherwise set left to 0
      if( isRight && (right + popover.element.offsetWidth) > window.innerWidth) horizontal = 'left: '+ parseInt((window.innerWidth - popover.element.offsetWidth)/2)+'px;';
      // check if popover needs a max-height (user will scroll inside the popover)
      var maxHeight = menuOnTop ? selectedTriggerPosition.top - popover.viewportGap : window.innerHeight - selectedTriggerPosition.bottom - popover.viewportGap;
  
      var initialStyle = popover.element.getAttribute('style');
      if(!initialStyle) initialStyle = '';
      popover.element.setAttribute('style', initialStyle + horizontal + vertical +'max-height:'+Math.floor(maxHeight)+'px;');
    };
    
    function resetPopoverStyle(popover) {
      // remove popover inline style before appling new style
      popover.element.style.maxHeight = '';
      popover.element.style.top = '';
      popover.element.style.bottom = '';
      popover.element.style.left = '';
      popover.element.style.right = '';
    };
  
    function checkPopoverClick(popover, target) {
      // close popover when clicking outside it
      if(!popover.popoverIsOpen) return;
      if(!popover.element.contains(target) && !target.closest('[aria-controls="'+popover.elementId+'"]')) togglePopover(popover, false);
    };
  
    function checkPopoverFocus(popover) {
      // on Esc key -> close popover if open and move focus (if focus was inside popover)
      if(!popover.popoverIsOpen) return;
      var popoverParent = document.activeElement.closest('.js-popover');
      togglePopover(popover, false, popoverParent);
    };
    
    function getFocusableElements(popover) {
      //get all focusable elements inside the popover
      var allFocusable = popover.element.querySelectorAll(focusableElString);
      getFirstVisible(popover, allFocusable);
      getLastVisible(popover, allFocusable);
    };
  
    function getFirstVisible(popover, elements) {
      //get first visible focusable element inside the popover
      for(var i = 0; i < elements.length; i++) {
        if( isVisible(elements[i]) ) {
          popover.firstFocusable = elements[i];
          break;
        }
      }
    };
  
    function getLastVisible(popover, elements) {
      //get last visible focusable element inside the popover
      for(var i = elements.length - 1; i >= 0; i--) {
        if( isVisible(elements[i]) ) {
          popover.lastFocusable = elements[i];
          break;
        }
      }
    };
  
    function trapFocus(popover, event) {
      if( popover.firstFocusable == document.activeElement && event.shiftKey) {
        //on Shift+Tab -> focus last focusable element when focus moves out of popover
        event.preventDefault();
        popover.lastFocusable.focus();
      }
      if( popover.lastFocusable == document.activeElement && !event.shiftKey) {
        //on Tab -> focus first focusable element when focus moves out of popover
        event.preventDefault();
        popover.firstFocusable.focus();
      }
    };
    
    function isVisible(element) {
      // check if element is visible
      return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    };
  
    window.Popover = Popover;
  
    //initialize the Popover objects
    var popovers = document.getElementsByClassName('js-popover');
    // generic focusable elements string selector
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    
    if( popovers.length > 0 ) {
      var popoversArray = [];
      var scrollingContainers = [];
      for( var i = 0; i < popovers.length; i++) {
        (function(i){
          popoversArray.push(new Popover(popovers[i]));
          var scrollableElement = popovers[i].getAttribute('data-scrollable-element');
          if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
        })(i);
      }
  
      // listen for key events
      window.addEventListener('keyup', function(event){
        if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
          // close popover on 'Esc'
          popoversArray.forEach(function(element){
            element.checkPopoverFocus();
          });
        } 
      });
      // close popover when clicking outside it
      window.addEventListener('click', function(event){
        popoversArray.forEach(function(element){
          element.checkPopoverClick(event.target);
        });
      });
      // on resize -> close all popover elements
      window.addEventListener('resize', function(event){
        popoversArray.forEach(function(element){
          element.togglePopover(false, false);
        });
      });
      // on scroll -> close all popover elements
      window.addEventListener('scroll', function(event){
        popoversArray.forEach(function(element){
          if(element.popoverIsOpen) element.togglePopover(false, false);
        });
      });
      // take into account additinal scrollable containers
      for(var j = 0; j < scrollingContainers.length; j++) {
        var scrollingContainer = document.querySelector(scrollingContainers[j]);
        if(scrollingContainer) {
          scrollingContainer.addEventListener('scroll', function(event){
            popoversArray.forEach(function(element){
              if(element.popoverIsOpen) element.togglePopover(false, false);
            });
          });
        }
      }
    }
  }());
// File#: _1_progress-bar
// Usage: codyhouse.co/license
(function() {	
    var ProgressBar = function(element) {
      this.element = element;
      this.fill = this.element.getElementsByClassName('progress-bar__fill')[0];
      this.label = this.element.getElementsByClassName('progress-bar__value');
      this.value = getProgressBarValue(this);
      // before checking if data-animation is set -> check for reduced motion
      updatedProgressBarForReducedMotion(this);
      this.animate = this.element.hasAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on';
      this.animationDuration = this.element.hasAttribute('data-duration') ? this.element.getAttribute('data-duration') : 1000;
      // animation will run only on browsers supporting IntersectionObserver
      this.canAnimate = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
      // this element is used to announce the percentage value to SR
      this.ariaLabel = this.element.getElementsByClassName('js-progress-bar__aria-value');
      // check if we need to update the bar color
      this.changeColor =  Util.hasClass(this.element, 'progress-bar--color-update') && Util.cssSupports('color', 'var(--color-value)');
      if(this.changeColor) {
        this.colorThresholds = getProgressBarColorThresholds(this);
      }
      initProgressBar(this);
      // store id to reset animation
      this.animationId = false;
    }; 
  
    // public function
    ProgressBar.prototype.setProgressBarValue = function(value) {
      setProgressBarValue(this, value);
    };
  
    function getProgressBarValue(progressBar) { // get progress value
      // return (fill width/total width) * 100
      return parseFloat(progressBar.fill.offsetWidth*100/progressBar.element.getElementsByClassName('progress-bar__bg')[0].offsetWidth);
    };
  
    function getProgressBarColorThresholds(progressBar) {
      var thresholds = [];
      var i = 1;
      while (!isNaN(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--progress-bar-color-'+i)))) {
        thresholds.push(parseInt(getComputedStyle(progressBar.element).getPropertyValue('--progress-bar-color-'+i)));
        i = i + 1;
      }
      return thresholds;
    };
  
    function updatedProgressBarForReducedMotion(progressBar) {
      // if reduced motion is supported and set to reduced -> remove animations
      if(osHasReducedMotion) progressBar.element.removeAttribute('data-animation');
    };
  
    function initProgressBar(progressBar) {
      // set initial bar color
      if(progressBar.changeColor) updateProgressBarColor(progressBar, progressBar.value);
      // if data-animation is on -> reset the progress bar and animate when entering the viewport
      if(progressBar.animate && progressBar.canAnimate) animateProgressBar(progressBar);
      // reveal fill and label -> --animate and --color-update variations only
      setTimeout(function(){Util.addClass(progressBar.element, 'progress-bar--init');}, 30);
  
      // dynamically update value of progress bar
      progressBar.element.addEventListener('updateProgress', function(event){
        // cancel request animation frame if it was animating
        if(progressBar.animationId) window.cancelAnimationFrame(progressBar.animationId);
        
        var final = event.detail.value,
          duration = (event.detail.duration) ? event.detail.duration : progressBar.animationDuration;
        var start = getProgressBarValue(progressBar);
        // trigger update animation
        updateProgressBar(progressBar, start, final, duration, function(){
          emitProgressBarEvents(progressBar, 'progressCompleted', progressBar.value+'%');
          // update value of label for SR
          if(progressBar.ariaLabel.length > 0) progressBar.ariaLabel[0].textContent = final+'%';
        });
      });
    };
  
    function animateProgressBar(progressBar) {
      // reset inital values
      setProgressBarValue(progressBar, 0);
      
      // listen for the element to enter the viewport -> start animation
      var observer = new IntersectionObserver(progressBarObserve.bind(progressBar), { threshold: [0, 0.1] });
      observer.observe(progressBar.element);
    };
  
    function progressBarObserve(entries, observer) { // observe progressBar position -> start animation when inside viewport
      var self = this;
      if(entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
        updateProgressBar(this, 0, this.value, this.animationDuration, function(){
          emitProgressBarEvents(self, 'progressCompleted', self.value+'%');
        });
      }
    };
  
    function updateProgressBar(progressBar, start, to, duration, cb) {
      var change = to - start,
        currentTime = null;
  
      var animateFill = function(timestamp){  
        if (!currentTime) currentTime = timestamp;         
        var progress = timestamp - currentTime;
        var val = parseInt((progress/duration)*change + start);
        // make sure value is in correct range
        if(change > 0 && val > to) val = to;
        if(change < 0 && val < to) val = to;
        if(progress >= duration) val = to;
  
        setProgressBarValue(progressBar, val);
        if(progress < duration) {
          progressBar.animationId = window.requestAnimationFrame(animateFill);
        } else {
          progressBar.animationId = false;
          cb();
        }
      };
      if ( window.requestAnimationFrame && !osHasReducedMotion ) {
        progressBar.animationId = window.requestAnimationFrame(animateFill);
      } else {
        setProgressBarValue(progressBar, to);
        cb();
      }
    };
  
    function setProgressBarValue(progressBar, value) {
      progressBar.fill.style.width = value+'%';
      if(progressBar.label.length > 0 ) progressBar.label[0].textContent = value+'%';
      if(progressBar.changeColor) updateProgressBarColor(progressBar, value);
    };
  
    function updateProgressBarColor(progressBar, value) {
      var className = 'progress-bar--fill-color-'+ progressBar.colorThresholds.length;
      for(var i = progressBar.colorThresholds.length; i > 0; i--) {
        if( !isNaN(progressBar.colorThresholds[i - 1]) && value <= progressBar.colorThresholds[i - 1]) {
          className = 'progress-bar--fill-color-' + i;
        } 
      }
      
      removeProgressBarColorClasses(progressBar);
      Util.addClass(progressBar.element, className);
    };
  
    function removeProgressBarColorClasses(progressBar) {
      var classes = progressBar.element.className.split(" ").filter(function(c) {
        return c.lastIndexOf('progress-bar--fill-color-', 0) !== 0;
      });
      progressBar.element.className = classes.join(" ").trim();
    };
  
    function emitProgressBarEvents(progressBar, eventName, detail) {
      progressBar.element.dispatchEvent(new CustomEvent(eventName, {detail: detail}));
    };
  
    window.ProgressBar = ProgressBar;
  
    //initialize the ProgressBar objects
    var progressBars = document.getElementsByClassName('js-progress-bar');
    var osHasReducedMotion = Util.osHasReducedMotion();
    if( progressBars.length > 0 ) {
      for( var i = 0; i < progressBars.length; i++) {
        (function(i){new ProgressBar(progressBars[i]);})(i);
      }
    }
  }());
// File#: _1_read-more
// Usage: codyhouse.co/license
(function() {
    var ReadMore = function(element) {
      this.element = element;
      this.moreContent = this.element.getElementsByClassName('js-read-more__content');
      this.count = this.element.getAttribute('data-characters') || 200;
      this.counting = 0;
      this.btnClasses = this.element.getAttribute('data-btn-class');
      this.ellipsis = this.element.getAttribute('data-ellipsis') && this.element.getAttribute('data-ellipsis') == 'off' ? false : true;
      this.btnShowLabel = 'Read more';
      this.btnHideLabel = 'Read less';
      this.toggleOff = this.element.getAttribute('data-toggle') && this.element.getAttribute('data-toggle') == 'off' ? false : true;
      if( this.moreContent.length == 0 ) splitReadMore(this);
      setBtnLabels(this);
      initReadMore(this);
    };
  
    function splitReadMore(readMore) { 
      splitChildren(readMore.element, readMore); // iterate through children and hide content
    };
  
    function splitChildren(parent, readMore) {
      if(readMore.counting >= readMore.count) {
        Util.addClass(parent, 'js-read-more__content');
        return parent.outerHTML;
      }
      var children = parent.childNodes;
      var content = '';
      for(var i = 0; i < children.length; i++) {
        if (children[i].nodeType == Node.TEXT_NODE) {
          content = content + wrapText(children[i], readMore);
        } else {
          content = content + splitChildren(children[i], readMore);
        }
      }
      parent.innerHTML = content;
      return parent.outerHTML;
    };
  
    function wrapText(element, readMore) {
      var content = element.textContent;
      if(content.replace(/\s/g,'').length == 0) return '';// check if content is empty
      if(readMore.counting >= readMore.count) {
        return '<span class="js-read-more__content">' + content + '</span>';
      }
      if(readMore.counting + content.length < readMore.count) {
        readMore.counting = readMore.counting + content.length;
        return content;
      }
      var firstContent = content.substr(0, readMore.count - readMore.counting);
      firstContent = firstContent.substr(0, Math.min(firstContent.length, firstContent.lastIndexOf(" ")));
      var secondContent = content.substr(firstContent.length, content.length);
      readMore.counting = readMore.count;
      return firstContent + '<span class="js-read-more__content">' + secondContent + '</span>';
    };
  
    function setBtnLabels(readMore) { // set custom labels for read More/Less btns
      var btnLabels = readMore.element.getAttribute('data-btn-labels');
      if(btnLabels) {
        var labelsArray = btnLabels.split(',');
        readMore.btnShowLabel = labelsArray[0].trim();
        readMore.btnHideLabel = labelsArray[1].trim();
      }
    };
  
    function initReadMore(readMore) { // add read more/read less buttons to the markup
      readMore.moreContent = readMore.element.getElementsByClassName('js-read-more__content');
      if( readMore.moreContent.length == 0 ) {
        Util.addClass(readMore.element, 'read-more--loaded');
        return;
      }
      var btnShow = ' <button class="js-read-more__btn '+readMore.btnClasses+'">'+readMore.btnShowLabel+'</button>';
      var btnHide = ' <button class="js-read-more__btn is-hidden '+readMore.btnClasses+'">'+readMore.btnHideLabel+'</button>';
      if(readMore.ellipsis) {
        btnShow = '<span class="js-read-more__ellipsis" aria-hidden="true">...</span>'+ btnShow;
      }
  
      readMore.moreContent[readMore.moreContent.length - 1].insertAdjacentHTML('afterend', btnHide);
      readMore.moreContent[0].insertAdjacentHTML('afterend', btnShow);
      resetAppearance(readMore);
      initEvents(readMore);
    };
  
    function resetAppearance(readMore) { // hide part of the content
      for(var i = 0; i < readMore.moreContent.length; i++) Util.addClass(readMore.moreContent[i], 'is-hidden');
      Util.addClass(readMore.element, 'read-more--loaded'); // show entire component
    };
  
    function initEvents(readMore) { // listen to the click on the read more/less btn
      readMore.btnToggle = readMore.element.getElementsByClassName('js-read-more__btn');
      readMore.ellipsis = readMore.element.getElementsByClassName('js-read-more__ellipsis');
  
      readMore.btnToggle[0].addEventListener('click', function(event){
        event.preventDefault();
        updateVisibility(readMore, true);
      });
      readMore.btnToggle[1].addEventListener('click', function(event){
        event.preventDefault();
        updateVisibility(readMore, false);
      });
    };
  
    function updateVisibility(readMore, visibile) {
      for(var i = 0; i < readMore.moreContent.length; i++) Util.toggleClass(readMore.moreContent[i], 'is-hidden', !visibile);
      // reset btns appearance
      Util.toggleClass(readMore.btnToggle[0], 'is-hidden', visibile);
      Util.toggleClass(readMore.btnToggle[1], 'is-hidden', !visibile);
      if(readMore.ellipsis.length > 0 ) Util.toggleClass(readMore.ellipsis[0], 'is-hidden', visibile);
      if(!readMore.toggleOff) Util.addClass(readMore.btn, 'is-hidden');
      // move focus
      if(visibile) {
        var targetTabIndex = readMore.moreContent[0].getAttribute('tabindex');
        Util.moveFocus(readMore.moreContent[0]);
        resetFocusTarget(readMore.moreContent[0], targetTabIndex);
      } else {
        Util.moveFocus(readMore.btnToggle[0]);
      }
    };
  
    function resetFocusTarget(target, tabindex) {
      if( parseInt(target.getAttribute('tabindex')) < 0) {
        target.style.outline = 'none';
        !tabindex && target.removeAttribute('tabindex');
      }
    };
  
    //initialize the ReadMore objects
    var readMore = document.getElementsByClassName('js-read-more');
    if( readMore.length > 0 ) {
      for( var i = 0; i < readMore.length; i++) {
        (function(i){new ReadMore(readMore[i]);})(i);
      }
    };
  }());
// File#: _1_swipe-content
(function() {
    var SwipeContent = function(element) {
      this.element = element;
      this.delta = [false, false];
      this.dragging = false;
      this.intervalId = false;
      initSwipeContent(this);
    };
  
    function initSwipeContent(content) {
      content.element.addEventListener('mousedown', handleEvent.bind(content));
      content.element.addEventListener('touchstart', handleEvent.bind(content));
    };
  
    function initDragging(content) {
      //add event listeners
      content.element.addEventListener('mousemove', handleEvent.bind(content));
      content.element.addEventListener('touchmove', handleEvent.bind(content));
      content.element.addEventListener('mouseup', handleEvent.bind(content));
      content.element.addEventListener('mouseleave', handleEvent.bind(content));
      content.element.addEventListener('touchend', handleEvent.bind(content));
    };
  
    function cancelDragging(content) {
      //remove event listeners
      if(content.intervalId) {
        (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
        content.intervalId = false;
      }
      content.element.removeEventListener('mousemove', handleEvent.bind(content));
      content.element.removeEventListener('touchmove', handleEvent.bind(content));
      content.element.removeEventListener('mouseup', handleEvent.bind(content));
      content.element.removeEventListener('mouseleave', handleEvent.bind(content));
      content.element.removeEventListener('touchend', handleEvent.bind(content));
    };
  
    function handleEvent(event) {
      switch(event.type) {
        case 'mousedown':
        case 'touchstart':
          startDrag(this, event);
          break;
        case 'mousemove':
        case 'touchmove':
          drag(this, event);
          break;
        case 'mouseup':
        case 'mouseleave':
        case 'touchend':
          endDrag(this, event);
          break;
      }
    };
  
    function startDrag(content, event) {
      content.dragging = true;
      // listen to drag movements
      initDragging(content);
      content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
      // emit drag start event
      emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };
  
    function endDrag(content, event) {
      cancelDragging(content);
      // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
      var dx = parseInt(unify(event).clientX), 
        dy = parseInt(unify(event).clientY);
      
      // check if there was a left/right swipe
      if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
        var s = getSign(dx - content.delta[0]);
        
        if(Math.abs(dx - content.delta[0]) > 30) {
          (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
        }
        
        content.delta[0] = false;
      }
      // check if there was a top/bottom swipe
      if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
          var y = getSign(dy - content.delta[1]);
  
          if(Math.abs(dy - content.delta[1]) > 30) {
            (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
        }
  
        content.delta[1] = false;
      }
      // emit drag end event
      emitSwipeEvents(content, 'dragEnd', [dx, dy]);
      content.dragging = false;
    };
  
    function drag(content, event) {
      if(!content.dragging) return;
      // emit dragging event with coordinates
      (!window.requestAnimationFrame) 
        ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
        : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };
  
    function emitDrag(event) {
      emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };
  
    function unify(event) { 
      // unify mouse and touch events
      return event.changedTouches ? event.changedTouches[0] : event; 
    };
  
    function emitSwipeEvents(content, eventName, detail, el) {
      var trigger = false;
      if(el) trigger = el;
      // emit event with coordinates
      var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
      content.element.dispatchEvent(event);
    };
  
    function getSign(x) {
      if(!Math.sign) {
        return ((x > 0) - (x < 0)) || +x;
      } else {
        return Math.sign(x);
      }
    };
  
    window.SwipeContent = SwipeContent;
    
    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
      for( var i = 0; i < swipe.length; i++) {
        (function(i){new SwipeContent(swipe[i]);})(i);
      }
    }
  }());
// File#: _1_table
// Usage: codyhouse.co/license
(function() {
    function initTable(table) {
      checkTableLayour(table); // switch from a collapsed to an expanded layout
      Util.addClass(table, 'table--loaded'); // show table
  
      // custom event emitted when window is resized
      table.addEventListener('update-table', function(event){
        checkTableLayour(table);
      });
    };
  
    function checkTableLayour(table) {
      var layout = getComputedStyle(table, ':before').getPropertyValue('content').replace(/\'|"/g, '');
      Util.toggleClass(table, tableExpandedLayoutClass, layout != 'collapsed');
    };
  
    var tables = document.getElementsByClassName('js-table'),
      tableExpandedLayoutClass = 'table--expanded';
    if( tables.length > 0 ) {
      var j = 0;
      for( var i = 0; i < tables.length; i++) {
        var beforeContent = getComputedStyle(tables[i], ':before').getPropertyValue('content');
        if(beforeContent && beforeContent !='' && beforeContent !='none') {
          (function(i){initTable(tables[i]);})(i);
          j = j + 1;
        } else {
          Util.addClass(tables[i], 'table--loaded');
        }
      }
      
      if(j > 0) {
        var resizingId = false,
          customEvent = new CustomEvent('update-table');
        window.addEventListener('resize', function(event){
          clearTimeout(resizingId);
          resizingId = setTimeout(doneResizing, 300);
        });
  
        function doneResizing() {
          for( var i = 0; i < tables.length; i++) {
            (function(i){tables[i].dispatchEvent(customEvent)})(i);
          };
        };
  
        (window.requestAnimationFrame) // init table layout
          ? window.requestAnimationFrame(doneResizing)
          : doneResizing();
      }
    }
  }());
// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
    var Tab = function(element) {
      this.element = element;
      this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
      this.listItems = this.tabList.getElementsByTagName('li');
      this.triggers = this.tabList.getElementsByTagName('a');
      this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
      this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
      this.hideClass = 'is-hidden';
      this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
      this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
      // deep linking options
      this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
      // init tabs
      this.initTab();
    };
  
    Tab.prototype.initTab = function() {
      //set initial aria attributes
      this.tabList.setAttribute('role', 'tablist');
      for( var i = 0; i < this.triggers.length; i++) {
        var bool = (i == 0),
          panelId = this.panels[i].getAttribute('id');
        this.listItems[i].setAttribute('role', 'presentation');
        Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
        Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
        Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
        Util.toggleClass(this.panels[i], this.hideClass, !bool);
  
        if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
      }
  
      //listen for Tab events
      this.initTabEvents();
  
      // check deep linking option
      this.initDeepLink();
    };
  
    Tab.prototype.initTabEvents = function() {
      var self = this;
      //click on a new tab -> select content
      this.tabList.addEventListener('click', function(event) {
        if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
      });
      //arrow keys to navigate through tabs 
      this.tabList.addEventListener('keydown', function(event) {
        ;
        if( !event.target.closest('.js-tabs__trigger') ) return;
        if( tabNavigateNext(event, self.layout) ) {
          event.preventDefault();
          self.selectNewTab('next');
        } else if( tabNavigatePrev(event, self.layout) ) {
          event.preventDefault();
          self.selectNewTab('prev');
        }
      });
    };
  
    Tab.prototype.selectNewTab = function(direction) {
      var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
        index = Util.getIndexInArray(this.triggers, selectedTab);
      index = (direction == 'next') ? index + 1 : index - 1;
      //make sure index is in the correct interval 
      //-> from last element go to first using the right arrow, from first element go to last using the left arrow
      if(index < 0) index = this.listItems.length - 1;
      if(index >= this.listItems.length) index = 0;	
      this.triggerTab(this.triggers[index]);
      this.triggers[index].focus();
    };
  
    Tab.prototype.triggerTab = function(tabTrigger, event) {
      var self = this;
      event && event.preventDefault();	
      var index = Util.getIndexInArray(this.triggers, tabTrigger);
      //no need to do anything if tab was already selected
      if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
      
      for( var i = 0; i < this.triggers.length; i++) {
        var bool = (i == index);
        Util.toggleClass(this.panels[i], this.hideClass, !bool);
        if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
        this.triggers[i].setAttribute('aria-selected', bool);
        bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
      }
  
      // update url if deepLink is on
      if(this.deepLinkOn) {
        history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
      }
    };
  
    Tab.prototype.initDeepLink = function() {
      if(!this.deepLinkOn) return;
      var hash = window.location.hash.substr(1);
      var self = this;
      if(!hash || hash == '') return;
      for(var i = 0; i < this.panels.length; i++) {
        if(this.panels[i].getAttribute('id') == hash) {
          this.triggerTab(this.triggers[i], false);
          setTimeout(function(){self.panels[i].scrollIntoView(true);});
          break;
        }
      };
    };
  
    function tabNavigateNext(event, layout) {
      if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
      else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
      else {return false;}
    };
  
    function tabNavigatePrev(event, layout) {
      if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
      else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
      else {return false;}
    };
    
    //initialize the Tab objects
    var tabs = document.getElementsByClassName('js-tabs');
    if( tabs.length > 0 ) {
      for( var i = 0; i < tabs.length; i++) {
        (function(i){new Tab(tabs[i]);})(i);
      }
    }
  }());
// File#: _1_tooltip
// Usage: codyhouse.co/license
(function () {
    var Tooltip = function (element) {
        this.element = element;
        this.tooltip = false;
        this.tooltipIntervalId = false;
        this.tooltipContent = this.element.getAttribute('title');
        this.tooltipPosition = (this.element.getAttribute('data-tooltip-position')) ? this.element.getAttribute('data-tooltip-position') : 'top';
        this.tooltipClasses = (this.element.getAttribute('data-tooltip-class')) ? this.element.getAttribute('data-tooltip-class') : false;
        this.tooltipId = 'js-tooltip-element'; // id of the tooltip element -> trigger will have the same aria-describedby attr
        // there are cases where you only need the aria-label -> SR do not need to read the tooltip content (e.g., footnotes)
        this.tooltipDescription = (this.element.getAttribute('data-tooltip-describedby') && this.element.getAttribute('data-tooltip-describedby') == 'false') ? false : true;

        this.tooltipDelay = 300; // show tooltip after a delay (in ms)
        this.tooltipDelta = 10; // distance beetwen tooltip and trigger element (in px)
        this.tooltipTriggerHover = false;
        // tooltp sticky option
        this.tooltipSticky = (this.tooltipClasses && this.tooltipClasses.indexOf('tooltip--sticky') > -1);
        this.tooltipHover = false;
        if (this.tooltipSticky) {
            this.tooltipHoverInterval = false;
        }
        resetTooltipContent(this);
        initTooltip(this);
    };

    function resetTooltipContent(tooltip) {
        var htmlContent = tooltip.element.getAttribute('data-tooltip-title');
        if (htmlContent) {
            tooltip.tooltipContent = htmlContent;
        }
    };

    function initTooltip(tooltipObj) {
        // reset trigger element
        tooltipObj.element.removeAttribute('title');
        tooltipObj.element.setAttribute('tabindex', '0');
        // add event listeners
        tooltipObj.element.addEventListener('mouseenter', handleEvent.bind(tooltipObj));
        tooltipObj.element.addEventListener('focus', handleEvent.bind(tooltipObj));
    };

    function removeTooltipEvents(tooltipObj) {
        // remove event listeners
        tooltipObj.element.removeEventListener('mouseleave', handleEvent.bind(tooltipObj));
        tooltipObj.element.removeEventListener('blur', handleEvent.bind(tooltipObj));
    };

    function handleEvent(event) {
        // handle events
        switch (event.type) {
            case 'mouseenter':
            case 'focus':
                showTooltip(this, event);
                break;
            case 'mouseleave':
            case 'blur':
                checkTooltip(this);
                break;
        }
    };

    function showTooltip(tooltipObj, event) {
        // tooltip has already been triggered
        if (tooltipObj.tooltipIntervalId) return;
        tooltipObj.tooltipTriggerHover = true;
        // listen to close events
        tooltipObj.element.addEventListener('mouseleave', handleEvent.bind(tooltipObj));
        tooltipObj.element.addEventListener('blur', handleEvent.bind(tooltipObj));
        // show tooltip with a delay
        tooltipObj.tooltipIntervalId = setTimeout(function () {
            createTooltip(tooltipObj);
        }, tooltipObj.tooltipDelay);
    };

    function createTooltip(tooltipObj) {
        tooltipObj.tooltip = document.getElementById(tooltipObj.tooltipId);

        if (!tooltipObj.tooltip) { // tooltip element does not yet exist
            tooltipObj.tooltip = document.createElement('div');
            document.body.appendChild(tooltipObj.tooltip);
        }

        // reset tooltip content/position
        Util.setAttributes(tooltipObj.tooltip, { 'id': tooltipObj.tooltipId, 'class': 'tooltip tooltip--is-hidden js-tooltip', 'role': 'tooltip' });
        tooltipObj.tooltip.innerHTML = tooltipObj.tooltipContent;
        if (tooltipObj.tooltipDescription) tooltipObj.element.setAttribute('aria-describedby', tooltipObj.tooltipId);
        if (tooltipObj.tooltipClasses) Util.addClass(tooltipObj.tooltip, tooltipObj.tooltipClasses);
        if (tooltipObj.tooltipSticky) Util.addClass(tooltipObj.tooltip, 'tooltip--sticky');
        placeTooltip(tooltipObj);
        Util.removeClass(tooltipObj.tooltip, 'tooltip--is-hidden');

        // if tooltip is sticky, listen to mouse events
        if (!tooltipObj.tooltipSticky) return;
        tooltipObj.tooltip.addEventListener('mouseenter', function cb() {
            tooltipObj.tooltipHover = true;
            if (tooltipObj.tooltipHoverInterval) {
                clearInterval(tooltipObj.tooltipHoverInterval);
                tooltipObj.tooltipHoverInterval = false;
            }
            tooltipObj.tooltip.removeEventListener('mouseenter', cb);
            tooltipLeaveEvent(tooltipObj);
        });
    };

    function tooltipLeaveEvent(tooltipObj) {
        tooltipObj.tooltip.addEventListener('mouseleave', function cb() {
            tooltipObj.tooltipHover = false;
            tooltipObj.tooltip.removeEventListener('mouseleave', cb);
            hideTooltip(tooltipObj);
        });
    };

    function placeTooltip(tooltipObj) {
        // set top and left position of the tooltip according to the data-tooltip-position attr of the trigger
        var dimention = [tooltipObj.tooltip.offsetHeight, tooltipObj.tooltip.offsetWidth],
            positionTrigger = tooltipObj.element.getBoundingClientRect(),
            position = [],
            scrollY = window.scrollY || window.pageYOffset;

        position['top'] = [(positionTrigger.top - dimention[0] - tooltipObj.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)];
        position['bottom'] = [(positionTrigger.bottom + tooltipObj.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)];
        position['left'] = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.left - dimention[1] - tooltipObj.tooltipDelta];
        position['right'] = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.right + tooltipObj.tooltipDelta];

        var direction = tooltipObj.tooltipPosition;
        if (direction == 'top' && position['top'][0] < scrollY) direction = 'bottom';
        else if (direction == 'bottom' && position['bottom'][0] + tooltipObj.tooltipDelta + dimention[0] > scrollY + window.innerHeight) direction = 'top';
        else if (direction == 'left' && position['left'][1] < 0) direction = 'right';
        else if (direction == 'right' && position['right'][1] + dimention[1] > window.innerWidth) direction = 'left';

        if (direction == 'top' || direction == 'bottom') {
            if (position[direction][1] < 0) position[direction][1] = 0;
            if (position[direction][1] + dimention[1] > window.innerWidth) position[direction][1] = window.innerWidth - dimention[1];
        }
        tooltipObj.tooltip.style.top = position[direction][0] + 'px';
        tooltipObj.tooltip.style.left = position[direction][1] + 'px';
        Util.addClass(tooltipObj.tooltip, 'tooltip--' + direction);
    };

    function checkTooltip(tooltipObj) {
        tooltipObj.tooltipTriggerHover = false;
        if (!tooltipObj.tooltipSticky) hideTooltip(tooltipObj);
        else {
            if (tooltipObj.tooltipHover) return;
            if (tooltipObj.tooltipHoverInterval) return;
            tooltipObj.tooltipHoverInterval = setTimeout(function () {
                hideTooltip(tooltipObj);
                tooltipObj.tooltipHoverInterval = false;
            }, 300);
        }
    };

    function hideTooltip(tooltipObj) {
        if (tooltipObj.tooltipHover || tooltipObj.tooltipTriggerHover) return;
        clearInterval(tooltipObj.tooltipIntervalId);
        if (tooltipObj.tooltipHoverInterval) {
            clearInterval(tooltipObj.tooltipHoverInterval);
            tooltipObj.tooltipHoverInterval = false;
        }
        tooltipObj.tooltipIntervalId = false;
        if (!tooltipObj.tooltip) return;
        // hide tooltip
        removeTooltip(tooltipObj);
        // remove events
        removeTooltipEvents(tooltipObj);
    };

    function removeTooltip(tooltipObj) {
        Util.addClass(tooltipObj.tooltip, 'tooltip--is-hidden');
        if (tooltipObj.tooltipDescription) tooltipObj.element.removeAttribute('aria-describedby');
    };

    window.Tooltip = Tooltip;

    //initialize the Tooltip objects
    var tooltips = document.getElementsByClassName('js-tooltip-trigger');
    if (tooltips.length > 0) {
        for (var i = 0; i < tooltips.length; i++) {
            (function (i) { new Tooltip(tooltips[i]); })(i);
        }
    }
}());
// File#: _1_vertical-timeline
// Usage: codyhouse.co/license
(function () {
    var VTimeline = function (element) {
        this.element = element;
        this.sections = this.element.getElementsByClassName('js-v-timeline__section');
        this.animate = this.element.getAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on' ? true : false;
        this.animationClass = 'v-timeline__section--animate';
        this.animationDelta = '-150px';
        initVTimeline(this);
    };

    function initVTimeline(element) {
        if (!element.animate) return;
        for (var i = 0; i < element.sections.length; i++) {
            var observer = new IntersectionObserver(vTimelineCallback.bind(element, i),
                { rootMargin: "0px 0px " + element.animationDelta + " 0px" });
            observer.observe(element.sections[i]);
        }
    };

    function vTimelineCallback(index, entries, observer) {
        if (entries[0].isIntersecting) {
            Util.addClass(this.sections[index], this.animationClass);
            observer.unobserve(this.sections[index]);
        }
    };

    //initialize the VTimeline objects
    var timelines = document.querySelectorAll('.js-v-timeline'),
        intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
        reducedMotion = Util.osHasReducedMotion();
    if (timelines.length > 0) {
        for (var i = 0; i < timelines.length; i++) {
            if (intersectionObserverSupported && !reducedMotion) (function (i) { new VTimeline(timelines[i]); })(i);
            else timelines[i].removeAttribute('data-animation');
        }
    }
}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
    var Slideshow = function(opts) {
      this.options = slideshowAssignOptions(Slideshow.defaults , opts);
      this.element = this.options.element;
      this.items = this.element.getElementsByClassName('js-slideshow__item');
      this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
      this.selectedSlide = 0;
      this.autoplayId = false;
      this.autoplayPaused = false;
      this.navigation = false;
      this.navCurrentLabel = false;
      this.ariaLive = false;
      this.moveFocus = false;
      this.animating = false;
      this.supportAnimation = Util.cssSupports('transition');
      this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
      this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
      this.animatingClass = 'slideshow--is-animating';
      initSlideshow(this);
      initSlideshowEvents(this);
      initAnimationEndEvents(this);
    };
  
    Slideshow.prototype.showNext = function() {
      showNewItem(this, this.selectedSlide + 1, 'next');
    };
  
    Slideshow.prototype.showPrev = function() {
      showNewItem(this, this.selectedSlide - 1, 'prev');
    };
  
    Slideshow.prototype.showItem = function(index) {
      showNewItem(this, index, false);
    };
  
    Slideshow.prototype.startAutoplay = function() {
      var self = this;
      if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
        self.autoplayId = setInterval(function(){
          self.showNext();
        }, self.options.autoplayInterval);
      }
    };
  
    Slideshow.prototype.pauseAutoplay = function() {
      var self = this;
      if(this.options.autoplay) {
        clearInterval(self.autoplayId);
        self.autoplayId = false;
      }
    };
  
    function slideshowAssignOptions(defaults, opts) {
      // initialize the object options
      var mergeOpts = {};
      mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
      mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
      mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
      mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
      mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
      return mergeOpts;
    };
  
    function initSlideshow(slideshow) { // basic slideshow settings
      // if no slide has been selected -> select the first one
      if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
      slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
      // create an element that will be used to announce the new visible slide to SR
      var srLiveArea = document.createElement('div');
      Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
      slideshow.element.appendChild(srLiveArea);
      slideshow.ariaLive = srLiveArea;
    };
  
    function initSlideshowEvents(slideshow) {
      // if slideshow navigation is on -> create navigation HTML and add event listeners
      if(slideshow.options.navigation) {
        // check if navigation has already been included
        if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
          var navigation = document.createElement('ol'),
            navChildren = '';
  
          var navClasses = 'slideshow__navigation js-slideshow__navigation';
          if(slideshow.items.length <= 1) {
            navClasses = navClasses + ' is-hidden';
          } 
          
          navigation.setAttribute('class', navClasses);
          for(var i = 0; i < slideshow.items.length; i++) {
            var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
              navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
            navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
          }
          navigation.innerHTML = navChildren;
          slideshow.element.appendChild(navigation);
        }
        
        slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
        slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');
  
        var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];
  
        dotsNavigation.addEventListener('click', function(event){
          navigateSlide(slideshow, event, true);
        });
        dotsNavigation.addEventListener('keyup', function(event){
          navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
        });
      }
      // slideshow arrow controls
      if(slideshow.controls.length > 0) {
        // hide controls if one item available
        if(slideshow.items.length <= 1) {
          Util.addClass(slideshow.controls[0], 'is-hidden');
          Util.addClass(slideshow.controls[1], 'is-hidden');
        }
        slideshow.controls[0].addEventListener('click', function(event){
          event.preventDefault();
          slideshow.showPrev();
          updateAriaLive(slideshow);
        });
        slideshow.controls[1].addEventListener('click', function(event){
          event.preventDefault();
          slideshow.showNext();
          updateAriaLive(slideshow);
        });
      }
      // swipe events
      if(slideshow.options.swipe) {
        //init swipe
        new SwipeContent(slideshow.element);
        slideshow.element.addEventListener('swipeLeft', function(event){
          slideshow.showNext();
        });
        slideshow.element.addEventListener('swipeRight', function(event){
          slideshow.showPrev();
        });
      }
      // autoplay
      if(slideshow.options.autoplay) {
        slideshow.startAutoplay();
        // pause autoplay if user is interacting with the slideshow
        slideshow.element.addEventListener('mouseenter', function(event){
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('focusin', function(event){
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('mouseleave', function(event){
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
        slideshow.element.addEventListener('focusout', function(event){
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
      }
      // detect if external buttons control the slideshow
      var slideshowId = slideshow.element.getAttribute('id');
      if(slideshowId) {
        var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
        for(var i = 0; i < externalControls.length; i++) {
          (function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
        }
      }
      // custom event to trigger selection of a new slide element
      slideshow.element.addEventListener('selectNewItem', function(event){
        // check if slide is already selected
        if(event.detail) {
          if(event.detail - 1 == slideshow.selectedSlide) return;
          showNewItem(slideshow, event.detail - 1, false);
        }
      });
    };
  
    function navigateSlide(slideshow, event, keyNav) { 
      // user has interacted with the slideshow navigation -> update visible slide
      var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
      if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
        slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
        slideshow.moveFocus = true;
        updateAriaLive(slideshow);
      }
    };
  
    function initAnimationEndEvents(slideshow) {
      // remove animation classes at the end of a slide transition
      for( var i = 0; i < slideshow.items.length; i++) {
        (function(i){
          slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
          slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
        })(i);
      }
    };
  
    function resetAnimationEnd(slideshow, item) {
      setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
        if(Util.hasClass(item,'slideshow__item--selected')) {
          if(slideshow.moveFocus) Util.moveFocus(item);
          emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
          slideshow.moveFocus = false;
        }
        Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
        item.removeAttribute('aria-hidden');
        slideshow.animating = false;
        Util.removeClass(slideshow.element, slideshow.animatingClass); 
      }, 100);
    };
  
    function showNewItem(slideshow, index, bool) {
      if(slideshow.items.length <= 1) return;
      if(slideshow.animating && slideshow.supportAnimation) return;
      slideshow.animating = true;
      Util.addClass(slideshow.element, slideshow.animatingClass); 
      if(index < 0) index = slideshow.items.length - 1;
      else if(index >= slideshow.items.length) index = 0;
      // skip slideshow item if it is hidden
      if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
        slideshow.animating = false;
        index = bool == 'next' ? index + 1 : index - 1;
        showNewItem(slideshow, index, bool);
        return;
      }
      // index of new slide is equal to index of slide selected item
      if(index == slideshow.selectedSlide) {
        slideshow.animating = false;
        return;
      }
      var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
      var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
      // transition between slides
      if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
      Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
      slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
      if(slideshow.animationOff) {
        Util.addClass(slideshow.items[index], 'slideshow__item--selected');
      } else {
        Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
      }
      // reset slider navigation appearance
      resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
      slideshow.selectedSlide = index;
      // reset autoplay
      slideshow.pauseAutoplay();
      slideshow.startAutoplay();
      // reset controls/navigation color themes
      resetSlideshowTheme(slideshow, index);
      // emit event
      emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
      if(slideshow.animationOff) {
        slideshow.animating = false;
        Util.removeClass(slideshow.element, slideshow.animatingClass);
      }
    };
  
    function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
      var className = '';
      if(bool) {
        className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
      } else {
        className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
      }
      return className;
    };
  
    function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
      var className = '';
      if(bool) {
        className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
      } else {
        className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
      }
      return className;
    };
  
    function resetSlideshowNav(slideshow, newIndex, oldIndex) {
      if(slideshow.navigation) {
        Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
        Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
        slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
        slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
      }
    };
  
    function resetSlideshowTheme(slideshow, newIndex) {
      var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
      if(dataTheme) {
        if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
        if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
      } else {
        if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
        if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
      }
    };
  
    function emitSlideshowEvent(slideshow, eventName, detail) {
      var event = new CustomEvent(eventName, {detail: detail});
      slideshow.element.dispatchEvent(event);
    };
  
    function updateAriaLive(slideshow) {
      slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
    };
  
    function externalControlSlide(slideshow, button) { // control slideshow using external element
      button.addEventListener('click', function(event){
        var index = button.getAttribute('data-index');
        if(!index || index == slideshow.selectedSlide + 1) return;
        event.preventDefault();
        showNewItem(slideshow, index - 1, false);
      });
    };
  
    Slideshow.defaults = {
      element : '',
      navigation : true,
      autoplay : false,
      autoplayInterval: 5000,
      swipe: false
    };
  
    window.Slideshow = Slideshow;
    
    //initialize the Slideshow objects
    var slideshows = document.getElementsByClassName('js-slideshow');
    if( slideshows.length > 0 ) {
      for( var i = 0; i < slideshows.length; i++) {
        (function(i){
          var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
            autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
            autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
            swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
          new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
        })(i);
      }
    }
  }());