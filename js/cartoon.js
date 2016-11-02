/*!
 * 神行百变 - varyH5 （ CSS3 transitions and transformations ）
 * Version :  v0.01 beta
 * Creator By @zore
 * Created : 2015
 *
 *
 */

/* jshint expr: true */


/*
* animo.js 缺点：可控性不足
* effeckt.css 过于复杂、大
* morf.js 可控性不足、臃肿
* animate.css 可控性不足
* agile.js （css3动画控制，确实不错，单太过庞大）
*
* */

/*
* + zepto support
* + blur/focus
* + 时间：infinite
* */


;"use strict"
;(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		factory(root.jQuery || root.Zepto );
	}

}(this, function($) {
	$.veryHtml = {
		version: "0.0.1",

		// $.css()   'transitionProperty'.
		// 查阅 https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
		propertyMap: {
			marginLeft    : 'margin',
			marginRight   : 'margin',
			marginBottom  : 'margin',
			marginTop     : 'margin',
			paddingLeft   : 'padding',
			paddingRight  : 'padding',
			paddingBottom : 'padding',
			paddingTop    : 'padding'
		},

		// false ： 简单过度
		enabled: true,

		//不使用过渡
		useTransitionEnd: false
	};



	var div = document.createElement('div');
	var support = {};

	// 匹配合适的属性. (`transition` => `WebkitTransition`)
	function getVendorPropertyName(prop) {
		// 处理无前缀浏览器  (FF16+ )
		if (prop in div.style) return prop;

		var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
		var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

		for (var i=0; i<prefixes.length; ++i) {
			var vendorProp = prefixes[i] + prop_;
			if (vendorProp in div.style) { return vendorProp; }
		}
	}

	// 检查 transform3D 支持
	function checkTransform3dSupport() {
		div.style[support.transform] = '';
		div.style[support.transform] = 'rotateY(90deg)';
		return div.style[support.transform] !== '';
	}

	var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

	// 检查浏览器  transitions 支持 .
	support.transition      = getVendorPropertyName('transition');
	support.transitionDelay = getVendorPropertyName('transitionDelay');
	support.transform       = getVendorPropertyName('transform');
	support.transformOrigin = getVendorPropertyName('transformOrigin');
	support.filter          = getVendorPropertyName('Filter');
	support.transform3d     = checkTransform3dSupport();

	var eventNames = {
		'transition':       'transitionend',
		'MozTransition':    'transitionend',
		'OTransition':      'oTransitionEnd',
		'WebkitTransition': 'webkitTransitionEnd',
		'msTransition':     'MSTransitionEnd'
	};

	// 检查 'transitionend' 事件支持.
	var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

	// `$.support` prefixes   http://api.jquery.com/jQuery.cssHooks
	for (var key in support) {
		if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
			$.support[key] = support[key];
		}
	}

	// 避免内存泄露， in IE.
	div = null;

	// ## $.cssEase
	$.cssEase = {
		'_default':       'ease',
		'in':             'ease-in',
		'out':            'ease-out',
		'in-out':         'ease-in-out',
		'snap':           'cubic-bezier(0,1,.5,1)',
		// Penner equations
		'easeInCubic':    'cubic-bezier(.550,.055,.675,.190)',
		'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
		'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
		'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
		'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
		'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
		'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
		'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
		'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
		'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
		'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
		'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
		'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
		'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
		'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
		'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
		'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
		'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
		'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
		'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
		'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
		'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
		'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
		'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
	};

	// ## 'transform'
	//
	//     $("#hello").css({ transform: "rotate(90deg)" });
	//
	//     $("#hello").css('transform');
	//     //=> { rotate: '90deg' }
	//
	$.cssHooks['transit:transform'] = {
		// 返回 `Transform` object.
		get: function(elem) {
			return $(elem).data('transform') || new Transform();
		},

		// The setter accepts a `Transform` object or a string.
		set: function(elem, v) {
			var value = v;

			if (!(value instanceof Transform)) {
				value = new Transform(value);
			}

			// We've seen the 3D version of Scale() not work in Chrome when the
			// element being scaled extends outside of the viewport.  Thus, we're
			// forcing Chrome to not use the 3d transforms as well.  Not sure if
			// translate is affectede, but not risking it.  Detection code from
			// http://davidwalsh.name/detecting-google-chrome-javascript
			if (support.transform === 'WebkitTransform' && !isChrome) {
				elem.style[support.transform] = value.toString(true);
			} else {
				elem.style[support.transform] = value.toString();
			}

			$(elem).data('transform', value);
		}
	};

	// Add a CSS hook for `.css({ transform: '...' })`.
	// In jQuery 1.8+, this will intentionally override the default `transform`
	// CSS hook so it'll play well with Transit. (see issue #62)
	$.cssHooks.transform = {
		set: $.cssHooks['transit:transform'].set
	};

	// ## 'filter' CSS hook
	// Allows you to use the `filter` property in CSS.
	//
	//     $("#hello").css({ filter: 'blur(10px)' });
	//
	$.cssHooks.filter = {
		get: function(elem) {
			return elem.style[support.filter];
		},
		set: function(elem, value) {
			elem.style[support.filter] = value;
		}
	};

	// jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
	// be necessary.
	if ($.fn.jquery < "1.8") {
		// ## 'transformOrigin' CSS hook
		// Allows the use for `transformOrigin` to define where scaling and rotation
		// is pivoted.
		//
		//     $("#hello").css({ transformOrigin: '0 0' });
		//
		$.cssHooks.transformOrigin = {
			get: function(elem) {
				return elem.style[support.transformOrigin];
			},
			set: function(elem, value) {
				elem.style[support.transformOrigin] = value;
			}
		};

		// ## 'transition' CSS hook
		// Allows you to use the `transition` property in CSS.
		//
		//     $("#hello").css({ transition: 'all 0 ease 0' });
		//
		$.cssHooks.transition = {
			get: function(elem) {
				return elem.style[support.transition];
			},
			set: function(elem, value) {
				elem.style[support.transition] = value;
			}
		};
	}

	// ## Other CSS hooks
	// Allows you to rotate, scale and translate.
	registerCssHook('scale');
	registerCssHook('scaleX');
	registerCssHook('scaleY');
	registerCssHook('translate');
	registerCssHook('rotate');
	registerCssHook('rotateX');
	registerCssHook('rotateY');
	registerCssHook('rotate3d');
	registerCssHook('perspective');
	registerCssHook('skewX');
	registerCssHook('skewY');
	registerCssHook('x', true);
	registerCssHook('y', true);
	registerCssHook('blur'); //特殊处理





	// ## Transform class
	// This is the main class of a transformation property that powers
	// `$.fn.css({ transform: '...' })`.
	//
	// This is, in essence, a dictionary object with key/values as `-transform`
	// properties.
	//
	//     var t = new Transform("rotate(90) scale(4)");
	//
	//     t.rotate             //=> "90deg"
	//     t.scale              //=> "4,4"
	//
	// Setters are accounted for.
	//
	//     t.set('rotate', 4)
	//     t.rotate             //=> "4deg"
	//
	// Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
	// functions.
	//
	//     t.toString()         //=> "rotate(90deg) scale(4,4)"
	//     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
	//




	function Transform(str) {
		if (typeof str === 'string') { this.parse(str); }
		return this;
	}

	Transform.prototype = {
		// ### setFromString()
		// Sets a property from a string.
		//
		//     t.setFromString('scale', '2,4');
		//     // Same as set('scale', '2', '4');
		//
		setFromString: function(prop, val) {
			var args =
				(typeof val === 'string')  ? val.split(',') :
					(val.constructor === Array) ? val :
						[ val ];

			args.unshift(prop);

			Transform.prototype.set.apply(this, args);


		},

		// ### set()
		// Sets a property.
		//
		//     t.set('scale', 2, 4);
		//
		set: function(prop) {
			var args = Array.prototype.slice.apply(arguments, [1]);
			if (this.setter[prop]) {
				this.setter[prop].apply(this, args);
			} else {
				this[prop] = args.join(',');
			}


		},

		get: function(prop) {
			if (this.getter[prop]) {
				return this.getter[prop].apply(this);
			} else {
				return this[prop] || 0;
			}
		},

		setter: {
			// ### rotate
			//
			//     .css({ rotate: 30 })
			//     .css({ rotate: "30" })
			//     .css({ rotate: "30deg" })
			//     .css({ rotate: "30deg" })
			//
			rotate: function(theta) {
				this.rotate = unit(theta, 'deg');
			},

			rotateX: function(theta) {
				this.rotateX = unit(theta, 'deg');
			},

			rotateY: function(theta) {
				this.rotateY = unit(theta, 'deg');
			},

			// ### scale
			//
			//     .css({ scale: 9 })      //=> "scale(9,9)"
			//     .css({ scale: '3,2' })  //=> "scale(3,2)"
			//
			scale: function(x, y) {
				if (y === undefined) { y = x; }
				this.scale = x + "," + y;
			},

			// ### skewX + skewY
			skewX: function(x) {
				this.skewX = unit(x, 'deg');
			},

			skewY: function(y) {
				this.skewY = unit(y, 'deg');
			},

			// ### perspectvie
			perspective: function(dist) {
				this.perspective = unit(dist, 'px');
			},

			// ### x / y
			// Translations. Notice how this keeps the other value.
			//
			//     .css({ x: 4 })       //=> "translate(4px, 0)"
			//     .css({ y: 10 })      //=> "translate(4px, 10px)"
			//
			x: function(x) {
				this.set('translate', x, null);
			},

			y: function(y) {
				this.set('translate', null, y);
			},


			// 单独处理 模糊效果
			blur: function( len ) {

				console.log( 'blur' );

				if(this.element.is("img")) {

					var svg_id = "svg_" + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);
					var filter_id = "filter_" + (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);

					$('body').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="'+svg_id+'" style="height:0;position:absolute;top:-1000px;"><filter id="'+filter_id+'"><feGaussianBlur stdDeviation="'+this.options.amount+'" /></filter></svg>');

					var ai = this.prefixes.length;

					while(ai--) {

						this.element.css(this.prefixes[ai]+"filter", "blur("+this.options.amount+"px)");

						this.element.css(this.prefixes[ai]+"transition", this.options.duration+"s all linear");

					}

					this.element.css("filter", "url(#"+filter_id+")");

					this.element.data("svgid", svg_id);

				} else {

					var color = this.element.css('color');

					var ai = this.prefixes.length;

					// Add the options for each prefix
					while(ai--) {

						this.element.css(this.prefixes[ai]+"transition", "all "+this.options.duration+"s linear");

					}

					this.element.css("text-shadow", "0 0 "+this.options.amount+"px "+color);
					this.element.css("color", "transparent");
				}

				this._end("TransitionEnd", null, callback);

				var $me = this;

				if(this.options.focusAfter) {

					var focus_wait = window.setTimeout(function() {

						$me._focus();

						focus_wait = window.clearTimeout(focus_wait);

					}, (this.options.focusAfter*1000));
				}

			},

			focus: function() {

				var ai = this.prefixes.length;

				if(this.element.is("img")) {

					while(ai--) {

						this.element.css(this.prefixes[ai]+"filter", "");

						this.element.css(this.prefixes[ai]+"transition", "");

					}

					var $svg = $('#'+this.element.data('svgid'));

					$svg.remove();
				} else {

					while(ai--) {

						this.element.css(this.prefixes[ai]+"transition", "");

					}

					this.element.css("text-shadow", "");
					this.element.css("color", "");
				}
			},



			// ### translate
			// Notice how this keeps the other value.
			//
			//     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
			//
			translate: function(x, y) {
				if (this._translateX === undefined) { this._translateX = 0; }
				if (this._translateY === undefined) { this._translateY = 0; }

				if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
				if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

				this.translate = this._translateX + "," + this._translateY;
			}
		},

		getter: {
			x: function() {
				return this._translateX || 0;
			},

			y: function() {
				return this._translateY || 0;
			},

			scale: function() {
				var s = (this.scale || "1,1").split(',');
				if (s[0]) { s[0] = parseFloat(s[0]); }
				if (s[1]) { s[1] = parseFloat(s[1]); }

				// "2.5,2.5" => 2.5
				// "2.5,1" => [2.5,1]
				return (s[0] === s[1]) ? s[0] : s;
			},

			rotate3d: function() {
				var s = (this.rotate3d || "0,0,0,0deg").split(',');
				for (var i=0; i<=3; ++i) {
					if (s[i]) { s[i] = parseFloat(s[i]); }
				}
				if (s[3]) { s[3] = unit(s[3], 'deg'); }

				return s;
			}
		},

		// ### parse()
		// Parses from a string. Called on constructor.
		parse: function(str) {
			var self = this;
			str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
				self.setFromString(prop, val);
			});
		},

		// ### toString()
		// Converts to a `transition` CSS property string. If `use3d` is given,
		// it converts to a `-webkit-transition` CSS property string instead.
		toString: function(use3d) {
			var re = [];

			for (var i in this) {
				if (this.hasOwnProperty(i)) {
					// Don't use 3D transformations if the browser can't support it.
					if ((!support.transform3d) && (
						(i === 'rotateX') ||
						(i === 'rotateY') ||
						(i === 'perspective') ||
						(i === 'transformOrigin'))) { continue; }

					if (i[0] !== '_') {
						if (use3d && (i === 'scale')) {
							re.push(i + "3d(" + this[i] + ",1)");
						} else if (use3d && (i === 'translate')) {
							re.push(i + "3d(" + this[i] + ",0)");
						} else {
							re.push(i + "(" + this[i] + ")");
						}
					}
				}
			}

			return re.join(" ");
		}
	};

	function callOrQueue(self, queue, fn) {

		self.each(function () {
			fn.call(this);
		});

		//<div class="vary-ui-wheel-bg" style="transition: transform 8000ms ease; -webkit-transition: transform 8000ms ease;"></div>
		//<div class="vary-ui-wheel-bg" style="transition: transform 8000ms ease; -webkit-transition: transform 8000ms ease; transform: rotate(1440deg);"></div>

		return ; // todo
		if (queue === true) {
			self.queue(fn);
		} else if (queue) {
			self.queue(queue, fn);
		} else {
			self.each(function () {
				fn.call(this);
			});
		}
	}

	// ### getProperties(dict)
	// Returns properties (for `transition-property`) for dictionary `props`. The
	// value of `props` is what you would expect in `$.css(...)`.
	function getProperties(props) {
		var re = [];

		$.each(props, function(key) {
			key = $.camelCase(key); // Convert "text-align" => "textAlign"
			key = $.veryHtml.propertyMap[key] || $.cssProps[key] || key;
			key = uncamel(key); // Convert back to dasherized

			// Get vendor specify propertie
			if (support[key])
				key = uncamel(support[key]);

			if ($.inArray(key, re) === -1) { re.push(key); }
		});

		return re;
	}

	// ### getTransition()
	// Returns the transition string to be used for the `transition` CSS property.
	//
	// Example:
	//
	//     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
	//     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
	//
	function getTransition(properties, duration, easing, delay) {
		// Get the CSS properties needed.
		var props = getProperties(properties);

		// Account for aliases (`in` => `ease-in`).
		if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

		// Build the duration/easing/delay attributes for it.
		var attribs = '' + toMS(duration) + ' ' + easing;
		if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

		// For more properties, add them this way:
		// "margin 200ms ease, padding 200ms ease, ..."
		var transitions = [];
		$.each(props, function(i, name) {
			transitions.push(name + ' ' + attribs);
		});

		return transitions.join(', ');
	}

	// ## $.fn.varyH5
	// Works like $.fn.animate(), but uses CSS transitions.
	//
	//     $("...").varyH5({ opacity: 0.1, scale: 0.3 });
	//
	//     // Specific duration
	//     $("...").varyH5({ opacity: 0.1, scale: 0.3 }, 500);
	//
	//     // With duration and easing
	//     $("...").varyH5({ opacity: 0.1, scale: 0.3 }, 500, 'in');
	//
	//     // With callback
	//     $("...").varyH5({ opacity: 0.1, scale: 0.3 }, function() { ... });
	//
	//     // With everything
	//     $("...").varyH5({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
	//
	//     // Alternate syntax
	//     $("...").varyH5({
	//       opacity: 0.1,
	//       duration: 200,
	//       delay: 40,
	//       easing: 'in',
	//       complete: function() { /* ... */ }
	//      });
	//
	$.fn.varyH5 = $.fn.veryHtml = function(properties, duration, easing, callback) {
		var self  = this;
		var delay = 0;
		var queue = true;


		var theseProperties = $.extend(true, {}, properties);

		// Account for `.varyH5(properties, callback)`.
		if (typeof duration === 'function') {
			callback = duration;
			duration = undefined;
		}

		// Account for `.varyH5(properties, options)`.
		if (typeof duration === 'object') {
			easing = duration.easing;
			delay = duration.delay || 0;
			queue = typeof duration.queue === "undefined" ? true : duration.queue;
			callback = duration.complete;
			duration = duration.duration;
		}

		// Account for `.varyH5(properties, duration, callback)`.
		if (typeof easing === 'function') {
			callback = easing;
			easing = undefined;
		}

		// Alternate syntax.
		if (typeof theseProperties.easing !== 'undefined') {
			easing = theseProperties.easing;
			delete theseProperties.easing;
		}

		if (typeof theseProperties.duration !== 'undefined') {
			duration = theseProperties.duration;
			delete theseProperties.duration;
		}

		if (typeof theseProperties.complete !== 'undefined') {
			callback = theseProperties.complete;
			delete theseProperties.complete;
		}

		if (typeof theseProperties.queue !== 'undefined') {
			queue = theseProperties.queue;
			delete theseProperties.queue;
		}

		if (typeof theseProperties.delay !== 'undefined') {
			delay = theseProperties.delay;
			delete theseProperties.delay;
		}

		// Set defaults. (`400` duration, `ease` easing)
		if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
		if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

		duration = toMS(duration);

		// Build the `transition` property.
		var transitionValue = getTransition(theseProperties, duration, easing, delay);

		// Compute delay until callback.
		// If this becomes 0, don't bother setting the transition property.
		var work = $.veryHtml.enabled && support.transition;
		var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

		// If there's nothing to do...
		if (i === 0) {
			var fn = function(next) {
				self.css(theseProperties);
				if (callback) { callback.apply(self); }
				if (next) { next(); }
			};

			callOrQueue(self, queue, fn);
			return self;
		}

		// Save the old transitions of each element so we can restore it later.
		var oldTransitions = {};

		var run = function(nextCall) {
			var bound = false;

			// Prepare the callback.
			var cb = function() {
				if (bound) { self.unbind(transitionEnd, cb); }

				if (i > 0) {
					self.each(function() {
						this.style[support.transition] = (oldTransitions[this] || null);
					});
				}

				if (typeof callback === 'function') { callback.apply(self); }
				if (typeof nextCall === 'function') { nextCall(); }
			};

			if ((i > 0) && (transitionEnd) && ($.veryHtml.useTransitionEnd)) {
				// Use the 'transitionend' event if it's available.
				bound = true;
				self.bind(transitionEnd, cb);
			} else {
				// Fallback to timers if the 'transitionend' event isn't supported.
				window.setTimeout(cb, i);
			}

			// Apply transitions.
			self.each(function() {
				if (i > 0) {
					this.style[support.transition] = transitionValue;
				}
				$(this).css(theseProperties);
			});
		};

		// Defer running. This allows the browser to paint any pending CSS it hasn't
		// painted yet before doing the transitions.
		var deferredRun = function(next) {
			this.offsetWidth; // force a repaint
			run(next);
		};


		// Use jQuery's fx queue.
		callOrQueue(self, queue, deferredRun);

		// Chainability.
		return this;
	};

	function registerCssHook(prop, isPixels) {
		// For certain properties, the 'px' should not be implied.
		if (!isPixels) { $.cssNumber[prop] = true; }

		$.veryHtml.propertyMap[prop] = support.transform;

		$.cssHooks[prop] = {
			get: function(elem) {
				var t = $(elem).css('transit:transform');
				return t.get(prop);
			},

			set: function(elem, value) {
				var t = $(elem).css('transit:transform');
				t.setFromString(prop, value);

				$(elem).css({ 'transit:transform': t });
			}
		};

	}

	// ### uncamel(str)
	// Converts a camelcase string to a dasherized string.
	// (`marginLeft` => `margin-left`)
	function uncamel(str) {
		return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
	}

	// ### unit(number, unit)
	// Ensures that number `number` has a unit. If no unit is found, assume the
	// default is `unit`.
	//
	//     unit(2, 'px')          //=> "2px"
	//     unit("30deg", 'rad')   //=> "30deg"
	//
	function unit(i, units) {
		if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
			return i;
		} else {
			return "" + i + units;
		}
	}

	// ### toMS(duration)
	// Converts given `duration` to a millisecond string.
	//
	// toMS('fast') => $.fx.speeds[i] => "200ms"
	// toMS('normal') //=> $.fx.speeds._default => "400ms"
	// toMS(10) //=> '10ms'
	// toMS('100ms') //=> '100ms'
	//
	function toMS(duration) {
		var i = duration;

		// Allow string durations like 'fast' and 'slow', without overriding numeric values.
		if (typeof i === 'string' && (!i.match(/^[\-0-9\.]+/))) { i = $.fx.speeds[i] || $.fx.speeds._default; }

		return unit(i, 'ms');
	}

	// Export some functions for testable-ness.
	$.veryHtml.getTransitionValue = getTransition;

	return $;
}));
