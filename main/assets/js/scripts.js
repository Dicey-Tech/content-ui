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