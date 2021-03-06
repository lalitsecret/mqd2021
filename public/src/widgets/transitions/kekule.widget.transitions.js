/**
 * @fileoverview
 * Implementation of different HTML transitions.
 * @author Partridge Jiang
 */

/*
 * requires /lan/classes.js
 * requires /core/kekule.common.js
 * requires /utils/kekule.utils.js
 * requires /utils/kekule.domUtils.js
 * requires /xbrowsers/kekule.x.js
 */

(function(){

/** @ignore */
var D = Kekule.Widget.Direction;
/** @ignore */
var SU = Kekule.StyleUtils;
/** @ignore */
var AU = Kekule.ArrayUtils;

/**
 * Class to execute transition on HTML elements.
 * This is the base (abstract class), concrete job need to be done in descendants.
 * @class
 * @arguments {ObjectEx}
 *
 * @property {HTMLElement} caller Who calls this transition. Usually a base HTML element of a widget.
 * @property {HTMLElement} element The element to run the transition.
 */
/**
 * Invoked when the transition beginning.
 * @name Kekule.Widget.BaseTransition#execute
 * @event
 */
/**
 * Invoked when the transition is finished.
 * @name Kekule.Widget.BaseTransition#finish
 * @event
 */
/**
 * Invoked when the transition is halted.
 * @name Kekule.Widget.BaseTransition#halt
 * @event
 */
Kekule.Widget.BaseTransition = Class.create(ObjectEx,
/** @lends Kekule.Widget.BaseTransition# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.BaseTransition',
	/** @constructs */
	initialize: function(/*$super*/)
	{
		this.tryApplySuper('initialize')  /* $super() */;
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('element', {'dataType': DataType.OBJECT, 'serializable': false});
		this.defineProp('caller', {'dataType': DataType.OBJECT, 'serializable': false});
		//this.defineProp('currParams', {'dataType': DataType.HASH, 'serializable': false});  // private
	},
	/**
	 * Return if transition can be executed in current browser and element.
	 * @param {HTMLElement} element
	 * @param {Hash} options Transition options.
	 */
	canExecute: function(element, options)
	{
		return true;
	},
	/**
	 * Prepare before run the execution.
	 * In most cases, information (position, color and so on) need to be saved before execution.
	 * Descendants need to override this method to save their own info.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} caller
	 * @param {Hash} options
	 * @private
	 */
	prepare: function(element, caller, options)
	{
		//return this.doPrepare(element, options);
		// do nothing here
	},
	/**
	 * Called after the transition is done.
	 * Usually some properties of element (position, color and so on) need to be restored after execution.
	 * Descendants need to override this method to do their own job.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} caller
	 * @param {Hash} options
	 */
	finish: function(element, caller, options)
	{
		// do nothing here
	},
	/**
	 * Execute transition on element, from and to is the position of the begin and end of transition.
	 * Those position values are in 0..1. In appear/disappear transition, 0 means invisible and 1 means totally visible.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} caller
	 * @param {Function} callback Function that will be called when the transition is done. This function has no parameters.
	 * @param {Hash} options Transition options, can include the following fields:
	 *   {
	 *     from: Float, the starting position of transition. For appear/disappear transition, 0 means hidden and 1 means totally shown.
	 *     to: Float, the ending position of transition. For appear/disappear transition, 0 means hidden and 1 means totally shown.
	 *     duration: Int, in millisecond, the duration of transition.
	 *     callerRect: {left, top, width, height}, explicitly set the page rect of caller
	 *     ...
	 *   }
	 *   Different transition may has more properties here.
	 * @returns {Object} Transition info, an object that contains the basic information of transition, including: {element, caller, callback, options, executor(this)}.
	 */
	execute: function(element, caller, callback, options)
	{
		this.setElement(element);
		if (caller)
			this.setCaller(caller);
		var ops = Object.extend({
			'from': 0,
			'to': 1
		}, options);
		var self = this;
		var done = function()
		{
			if (done.__$applied__)  // avoid duplicated call
				return;
			done.__$applied__ = true;
			self.finish(element, caller, ops);
			if (callback)
				callback();
			self.invokeEvent('finish');
		};
		done.__$applied__ = false;
		this.prepare(element, caller, ops);
		this.invokeEvent('execute');

		var self = this;
		var result = {
			'element': element,
			'caller': caller,
			'callback': callback,
			'doneCallback': done,
			'options': options,
			'executor': this,
			'halt': function()    // a helper function to call halt by transition info easily
				{
					self.halt(result);
				}
		};
		this.doExecute(element, caller, done, ops);
		return result;
	},
	/**
	 * Do actual job of execute. Descendants should override this method.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} caller
	 * @param {Function} callback Function that will be called when the transition is done. This function has no parameters.
	 * @param {Hash} options Transition options.
	 */
	doExecute: function(element, caller, callback, options)
	{
		// do nothing here
	},

	/**
	 * Stop and jump to the end of a executing transition.
	 * @param {Object} transitionInfo Transition info object returned by {@link Kekule.Widget.BaseTransition.execute}.
	 */
	halt: function(transitionInfo)
	{
		if (transitionInfo.executor !== this)
			transitionInfo.executor.halt(transitionInfo);
		else
		{
			this.doHalt(transitionInfo);
			if (transitionInfo.doneCallback)
			{
				transitionInfo.doneCallback();
			}
			this.invokeEvent('halt');
		}
	},
	/**
	 * Do actual work of halt, descendants should override this method.
	 * @param {Object} transitionInfo
	 */
	doHalt: function(transitionInfo)
	{
		// do nothing here
	},

	/**
	 * Prepare HTML element before transition executing. Set property properly according to transition position.
	 * Descendants should override this method.
	 * @param {HTMLElement} element
	 * @param {Float} position
	 * @param {Hash} options
	 */
	setElementProp: function(element, position, options)
	{
		// do nothing here
	},

	/**
	 * Store CSS element inline style into a JavaScript object.
	 * @param {HTMLElement} element
	 * @param {Array} propNames Stored property names
	 * @returns {Hash}
	 * @private
	 */
	storeCssInlineValues: function(element, propNames)
	{
		var style = element.style;
		var result = {};
		//var names = Kekule.ObjUtils.getOwnedFieldNames(props);
		for (var i = 0, l = propNames.length; i < l; ++i)
		{
			var name = propNames[i];
			result[name] = style[name];
		}
		return result;
	},
	/**
	 * Restore element CSS inline styles from a JavaScript hash object.
	 * @param {HTMLElement} element
	 * @param {Array} propNames
	 * @param {Hash} storage
	 * @private
	 */
	restoreCssInlineValues: function(element, propNames, storage)
	{
		var style = element.style;
		for (var i = 0, l = propNames.length; i < l; ++i)
		{
			var name = propNames[i];
			if (!storage[name])
			{
				try
				{
					style.removeProperty(name);
				}
				catch(e)
				{
					style[name] = '';
				}
			}
			else
				style[name] = storage[name];
		}
	},
	/** @private */
	storeCssComputedValues: function(element, propNames)
	{
		var result = {};
		for (var i = 0, l = propNames.length; i < l; ++i)
		{
			var name = propNames[i];
			var s = SU.getComputedStyle(element, name);
			result[name] = s;  //SU.analysisUnitsValue(s);
		}
		return result;
	}
});

/**
 * Special base class for calculating the transition properties for {@link Kekule.Widget.Css3Transition}.
 * @class
 * @arguments {ObjectEx}
 */
Kekule.Widget.Css3TransitionRunner = Class.create(ObjectEx,
/** @lends Kekule.Widget.Css3TransitionRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3TransitionRunner',
	/** @private */
	initProperties: function()
	{
		this.defineProp('parent', {'dataType': 'Kekule.Widget.BaseTransition'});
	},
	/** @private */
	getCaller: function()
	{
		var p = this.getParent();
		return p && p.getCaller();
	},
	/** @private */
	getElement: function()
	{
		var p = this.getParent();
		return p && p.getElement();
	},
	/**
	 * Returns an array of CSS property names that may be changed during transition.
	 * Descendants may override this method.
	 * @param {Hash} transOptions
	 * @returns {Array}
	 * @private
	 */
	getAffectedCssPropNames: function(transOptions)
	{
		// do nothing here
		return [];
	},
	/**
	 * Determinate the direct CSS transition property names.
	 * Descendants may override this method.
	 * @param {Hash} transOptions
	 * @returns {Array} Properties to be changed.
	 * @private
	 */
	getTransCssPropNames: function(transOptions)
	{
		// do nothing here
		return [];
	},
	/**
	 * Prepare before run the execution.
	 * In most cases, information (position, color and so on) need to be saved before execution.
	 * Descendants need to override this method to save their own info.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} caller
	 * @param {Hash} options
	 * @private
	 */
	prepare: function(element, caller, options)
	{
		//return this.doPrepare(element, options);
		// do nothing here
	},
	/** @private */
	setElementProp: function(element, position, options)
	{
		//do nothing here
	}
});

/**
 * Opacity transition runner based on CSS3 transition.
 * @class
 * @arguments {Kekule.Widget.Css3TransitionRunner}
 *
 * @property {Int} direction The direction of slide transition.
 */
Kekule.Widget.Css3OpacityTransRunner = Class.create(Kekule.Widget.Css3TransitionRunner,
/** @lends Kekule.Widget.Css3OpacityTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3OpacityTransRunner',
	/** @private */
	getAffectedCssPropNames: function(transOptions)
	{
		return ['opacity'];
	},
	/** @private */
	getTransCssPropNames: function(transOptions)
	{
		return ['opacity'];
	},
	/** @private */
	prepare: function(element, caller, options)
	{
		// do nothing here
	},
	/** @private */
	setElementProp: function(element, position, options)
	{
		var p = this.getParent();
		if (p)
		{
			//console.log(this._computedCssValues);
			var originOpacity = parseFloat(p.getComputedCssValues().opacity) || 1;
			element.style.opacity = originOpacity * position;
		}
	}
});

/**
 * Slide transition executor based on CSS3 transition.
 * @class
 * @arguments {Kekule.Widget.Css3TransitionRunner}
 *
 * @property {Int} direction The direction of slide transition.
 */
Kekule.Widget.Css3SlideTransRunner = Class.create(Kekule.Widget.Css3TransitionRunner,
/** @lends Kekule.Widget.Css3SlideTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3SlideTransRunner',
	/** @constructs */
	initialize: function(direction)
	{
		this.tryApplySuper('initialize');
		if (Kekule.ObjUtils.notUnset(direction))
			this.setDirection(direction);
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('direction', {'dataType': DataType.INT});
	},

	/** @private */
	prepare: function(/*$super, */element, caller, options)
	{
		//console.log('prepare', options);
		SU.setDisplay(element, true);  // important, otherwise width/height info could not be get.
		this._direction = this.getActualDirection(element, options);  // save this value, avoid user change direction property during transition

		this.tryApplySuper('prepare', [element, caller, options])  /* $super(element, caller, options) */;

		element.style.overflow = 'hidden';
		this._clearDimesionConstraints(element);
	},
	/** @private */
	_clearDimesionConstraints: function(elem)
	{
		var style = elem.style;
		style.minWidth = '0';
		style.minHeight = '0';
		style.maxWidth = 'none';
		style.maxHeight = 'none';
	},
	/** @private */
	getComputedCssValues: function()
	{
		return this.getParent().getComputedCssValues();
	},
	/** @private */
	setElementProp: function(element, position, options)
	{
		var direction = this._direction;
		var s;
		if (D.isInHorizontal(direction))
		{
			s = this.getComputedCssValues().width;
			var widthInfo = SU.analysisUnitsValue(s);
			element.style.width = widthInfo.value * position + widthInfo.units;

			s = this.getComputedCssValues().left;
			if (s)
			{
				var leftInfo = SU.analysisUnitsValue(s);
				if (leftInfo.units === widthInfo.units)
				{
					element.style.left = (widthInfo.value * (1 - position) + leftInfo.value) + leftInfo.units;
				}
			}
		}
		if (D.isInVertical(direction))
		{
			s = this.getComputedCssValues().height;
			var heightInfo = SU.analysisUnitsValue(s);
			element.style.height = heightInfo.value * position + heightInfo.units;

			s = this.getComputedCssValues().top;
			if (s)
			{
				var topInfo = SU.analysisUnitsValue(s);
				if (topInfo.units === heightInfo.units)
					element.style.top = (heightInfo.value * (1 - position) + topInfo.value) + topInfo.units;
			}
		}
	},

	/** @private */
	getAffectedCssPropNames: function(transOptions)
	{
		var result = [].concat(this.getTransCssPropNames(transOptions));
		result = result.concat(['overflow', 'min-width', 'min-height', 'max-width', 'max-height']);
		return result;
	},

	/**
	 * Determinate the CSS properties to be changed in transition.
	 * @returns {Array} Properties to be changed.
	 * @private
	 */
	getTransCssPropNames: function(transOptions)
	{
		var direction = this.getActualDirection(this.getElement(), transOptions);
		var result = [];
		if (D.isInHorizontal(direction))
		{
			result.push('width');
			if (direction & D.RTL)
				result.push('left');
		}
		if (D.isInVertical(direction))
		{
			result.push('height');
			if (direction & D.BTT)
				result.push('top');
		}
		return result;
	},

	/** @private */
	getRefRect: function(transOptions)
	{
		/*
		var result;
		var EU = Kekule.HtmlElementUtils;
		if (this.getCaller())
		{
			result = EU.getElemPageRect(this.getCaller());
			//result = EU.getElemBoundingClientRect(this.getCaller(), true);
			if (Kekule.RectUtils.isZero(result))  // rect is null, maybe the caller widget is hidden, use cached one instead
			{
				result = (transOptions || {}).callerPageRect || null;
			}
		}
		else
		{
			result = null;
		}
		return result;
		*/
		return Kekule.Widget.TransitionUtils.getCallerRefRect(this.getCaller(), transOptions);
	},
	getActualDirection: function(element, transOptions)
	{
		/*
		if (!element)
			element = this.getElement();

		var D = Kekule.Widget.Direction;
		var EU = Kekule.HtmlElementUtils;
		var result = this.getDirection();
		if (!result || (result === D.AUTO))
		{
			var refRect = this.getRefRect(transOptions);
			//console.log(refRect);
			if (!refRect)
				result = D.TTB;  // default
			else
			{
				var refCenter = {'x': refRect.x + refRect.width / 2, 'y': refRect.y + refRect.height / 2};
				var selfPos = EU.getElemPagePos(element);
				var selfDim = EU.getElemClientDimension(element);
				var selfCenter = {'x': selfPos.x + (selfDim.width || 0) / 2, 'y': selfPos.y + (selfDim.height || 0) / 2};
				var delta = Kekule.CoordUtils.substract(selfCenter, refCenter);

				if (refRect.width < 1)  // very slim refRect
				{
					result = (delta.x >= 0)? D.LTR: D.RTL;
				}
				else if (delta.x < 1)  // very close to horizontal line
				{
					result = (delta.y >= 0)? D.TTB: D.BTT;
				}
				else
				{
					var r1 = Math.abs(refRect.height / refRect.width);
					var r2 = Math.abs(delta.y / delta.x);
					if (r1 > r2)  // left or right side
					{
						result = (delta.x >= 0)? D.LTR: D.RTL;
					}
					else  // top or bottom side
					{
						result = (delta.y >= 0)? D.TTB: D.BTT;
					}
				}
			}
		}
		return result;
		*/
		if (!element)
			element = this.getElement();

		var result = this.getDirection();
		if (!result || (result === D.AUTO))
		{
			result = Kekule.Widget.TransitionUtils.getPreferredSlideDirection(element, this.getCaller(), transOptions);
		}
		return result;
	}

});

/**
 * A slide transition runner based on CSS3 clip path transition.
 * @class
 * @arguments {Kekule.Widget.Css3TransitionRunner}
 *
 * @property {Hash} baseRect. The starting rectangle to grow or the ending rectangle to shrink.
 *   Note the x/y value is relative to top-left corner of HTML page.
 *   If this property is not set, rect calculated from caller will be used.
 * //@property {HTMLElement} baseElement The baseRect can be calculated from this element.
 */
Kekule.Widget.Css3ClipPathSlideTransRunner = Class.create(Kekule.Widget.Css3TransitionRunner,
/** @lends Kekule.Widget.Css3ClipPathSlideTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3ClipPathSlideTransRunner',
	/** @constructs */
	initialize: function(direction)
	{
		this.tryApplySuper('initialize');
		if (Kekule.ObjUtils.notUnset(direction))
			this.setDirection(direction);
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('direction', {'dataType': DataType.INT});
	},

	/** @ignore */
	prepare: function(element, caller, options)
	{
		this._direction = this.getActualDirection(element, options);  // save this value, avoid user change direction property during transition
		this.tryApplySuper('prepare', [element, caller, options]);
	},

	/** @ignore */
	setElementProp: function(element, position, options)
	{
		var direction = this._direction;

		var clipValue = '' + ((1 - position) * 100) + '%';
		// the clip is in inset(top right bottom left) order
		var clipEdgeIndex = (direction === D.TTB)? 2:
			(direction === D.BTT)? 0:
			(direction === D.RTL)? 3:
			1;  // default, left to right

		var edgeClips = ['0%', '0%', '0%', '0%'];
		edgeClips[clipEdgeIndex] = clipValue;
		var sStyle = 'inset(' + edgeClips.join(' ') + ')';
		element.style.clipPath = sStyle;
		//console.log('clipPath', sStyle, position);
	},

	/** @ignore */
	getAffectedCssPropNames: function(transOptions)
	{
		return (this.tryApplySuper('getAffectedCssPropNames', [transOptions]) || []).concat(['clip-path']);
	},
	/** @ignore */
	getTransCssPropNames: function(transOptions)
	{
		return (this.tryApplySuper('getTransCssPropNames', [transOptions]) || []).concat(['clip-path']);
	},

	/** @private */
	getActualDirection: function(element, transOptions)
	{
		if (!element)
			element = this.getElement();

		var result = this.getDirection();
		if (!result || (result === D.AUTO))
		{
			result = Kekule.Widget.TransitionUtils.getPreferredSlideDirection(element, this.getCaller(), transOptions);
		}
		return result;
	}
});

/**
 * Grow/shrink transition runner based on CSS3 transition.
 * @class
 * @arguments {Kekule.Widget.Css3TransitionRunner}
 *
 * @property {Hash} baseRect. The starting rectangle to grow or the ending rectangle to shrink.
 *   Note the x/y value is relative to top-left corner of HTML page.
 *   If this property is not set, rect calculated from caller will be used.
 * //@property {HTMLElement} baseElement The baseRect can be calculated from this element.
 */
Kekule.Widget.Css3GrowTransRunner = Class.create(Kekule.Widget.Css3TransitionRunner,
/** @lends Kekule.Widget.Css3GrowTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3GrowTransRunner',
	/** @constructs */
	initialize: function(baseRectOrCaller)
	{
		this.tryApplySuper('initialize');
		if (baseRectOrCaller)
		{
			if (baseRectOrCaller.ownerDocument)  // is element
			{
				this.setBaseElement(baseRectOrCaller);
			}
			else
			{
				this.setCaller(baseRectOrCaller);
			}
		}
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('baseRect', {'dataType': DataType.HASH});
		//this.defineProp('baseElement', {'dataType': DataType.OBJECT, 'serializable': false});
	},

	/** @private */
	getRefRect: function(transOptions)
	{
		var EU = Kekule.HtmlElementUtils;
		var result = null;
		if (this.getBaseRect())
			result = this.getBaseRect();
		else if (this.getCaller())
		{
			/*
			var pos = EU.getElemPagePos(this.getCaller());
			var dim = EU.getElemClientDimension(this.getCaller());
			return {
				'x': pos.x,
				'y': pos.y,
				'width': dim.width,
				'height': dim.height
			};
			*/
			//result = EU.getElemPageRect(this.getCaller());
			result = EU.getElemBoundingClientRect(this.getCaller(), true);
			if (Kekule.RectUtils.isZero(result))
				result = (transOptions || {}).callerPageRect || null;
		}

		if (!result)
		{
			result = {'x': 0, 'y': 0, 'width': 0, 'height': 0};
		}
		return result;
	},

	/** @private */
	prepare: function(/*$super, */element, caller, options)
	{
		SU.setDisplay(element, true);  // important, otherwise width/height info could not be get.

		this.tryApplySuper('prepare', [element, caller, options])  /* $super(element, caller, options) */;
		element.style.overflow = 'hidden';
		Kekule.HtmlElementUtils.makePositioned(element);

		var refRect = this.getRefRect(options);

		// calculate delta information
		var EU = Kekule.HtmlElementUtils;
		/*
		var opos = EU.getElemPagePos(element);
		var odim = EU.getElemClientDimension(element);
		var delta = {
			x: opos.x - refRect.x,
			y: opos.y - refRect.y,
			width: odim.width - refRect.width,
			height: odim.height - refRect.height
		};
		*/
		var odim = EU.getElemBoundingClientRect(element, true);
		var delta = {
			x: odim.x - refRect.x,
			y: odim.y - refRect.y,
			width: odim.width - refRect.width,
			height: odim.height - refRect.height
		};
		this._delta = delta;

		this._clearDimesionConstraints(element);
	},
	/** @private */
	_clearDimesionConstraints: function(elem)
	{
		var style = elem.style;
		style.minWidth = '0';
		style.minHeight = '0';
		style.maxWidth = 'none';
		style.maxHeight = 'none';
	},

	/** @private */
	setElementProp: function(element, position, options)
	{
		var compStyles = this.getParent().getComputedCssValues();
		var delta = this._delta;
		var ratio = 1 - position;
		//var curr = {};
		var style = element.style;

		//console.log(compStyles, delta);

		var info = SU.analysisUnitsValue(compStyles.left);
		if (info.units === 'px')
			style.left = (info.value - ratio * delta.x) + 'px';

		var info = SU.analysisUnitsValue(compStyles.top);
		if (info.units === 'px')
			style.top = (info.value - ratio * delta.y) + 'px';

		var info = SU.analysisUnitsValue(compStyles.width);
		if (info.units === 'px')
			style.width = (info.value - ratio * delta.width) + 'px';

		var info = SU.analysisUnitsValue(compStyles.height);
		if (info.units === 'px')
			style.height = (info.value - ratio * delta.height) + 'px';
	},

	/** @private */
	getAffectedCssPropNames: function(transOptions)
	{
		var result = [].concat(this.getTransCssPropNames(transOptions));
		// TODO: min/max/width/height should be taken into consideration
		result = result.concat(['overflow', 'min-width', 'min-height', 'max-width', 'max-height']);
		return result;
	},

	/**
	 * Determinate the CSS properties to be changed in transition.
	 * @returns {Array} Properties to be changed.
	 * @private
	 */
	getTransCssPropNames: function(transOptions)
	{
		return ['left', 'top', 'width', 'height', 'position'];
	}
});

if (Kekule.BrowserFeature && Kekule.BrowserFeature.cssTranform)
{
	/**
 * Base transform transition runner based on CSS3 transition.
 * This is a base class, so do not use it directly.
 * @class
 * @arguments {Kekule.Widget.Css3TransitionRunner}
 */
Kekule.Widget.Css3TransformTransRunner = Class.create(Kekule.Widget.Css3TransitionRunner,
/** @lends Kekule.Widget.Css3TransformTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3TransformTransRunner',
	/** @private */
	getAffectedCssPropNames: function(transOptions)
	{
		return ['transform', 'transformOrigin'];
	},
	/** @private */
	getTransCssPropNames: function(transOptions)
	{
		return ['transform', 'transformOrigin'];
	},
	/** @ignore */
	prepare: function(/*$super, */element, caller, options)
	{
		this.tryApplySuper('prepare', [element, caller, options])  /* $super(element, caller, options) */;
		var computedTransMatrixInfo =	Kekule.StyleUtils.getTransformMatrixValues(element);
		if (computedTransMatrixInfo)
		{
			computedTransMatrixInfo.scaleX = computedTransMatrixInfo.a;
			computedTransMatrixInfo.scaleY = computedTransMatrixInfo.d;
		}
		this._computedTransMatrixInfo = computedTransMatrixInfo;
	},
	/** @private */
	setElemTransform: function(elem, tx, ty, sx, sy)
	{
		var values = [sx, 0, 0, sy, tx, ty];
		Kekule.StyleUtils.setTransformMatrixArrayValues(elem, values);
	}
});

/**
 * Grow/shrink transition executor based on CSS3 transform transition.
 * @class
 * @arguments {Kekule.Widget.Css3TransformTransRunner}
 *
 * @property {Hash} baseRect. The starting rectangle to grow or the ending rectangle to shrink.
 *   Note the x/y value is relative to top-left corner of HTML page.
 *   If this property is not set, rect calculated from caller will be used.
 * //@property {HTMLElement} baseElement The baseRect can be calculated from this element.
 */
Kekule.Widget.Css3TransformGrowTransRunner = Class.create(Kekule.Widget.Css3TransformTransRunner,
/** @lends Kekule.Widget.Css3TransformGrowTransRunner# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3TransformGrowTransRunner',
	/** @constructs */
	initialize: function(baseRectOrCaller)
	{
		this.tryApplySuper('initialize');
		if (baseRectOrCaller)
		{
			if (baseRectOrCaller.ownerDocument)  // is element
			{
				this.setBaseElement(baseRectOrCaller);
			}
			else
			{
				this.setCaller(baseRectOrCaller);
			}
		}
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('baseRect', {'dataType': DataType.HASH});
		//this.defineProp('baseElement', {'dataType': DataType.OBJECT, 'serializable': false});
	},

	/** @private */
	getRefRect: function(transOptions)
	{
		var EU = Kekule.HtmlElementUtils;
		var result = null;
		if (this.getBaseRect())
			result = this.getBaseRect();
		else if (this.getCaller())
		{
			//result = EU.getElemPageRect(this.getCaller());
			result = EU.getElemBoundingClientRect(this.getCaller(), true);
			if (Kekule.RectUtils.isZero(result))
				result = (transOptions || {}).callerPageRect || null;
		}

		if (!result)
		{
			result = {'x': 0, 'y': 0, 'width': 0, 'height': 0};
		}
		return result;
	},

	/** @private */
	prepare: function(element, caller, options)
	{
		SU.setDisplay(element, true);  // important, otherwise width/height info could not be get.

		this.tryApplySuper('prepare', [element, caller, options]);
		element.style.overflow = 'hidden';
		Kekule.HtmlElementUtils.makePositioned(element);

		var refRect = this.getRefRect(options);

		// calculate delta information
		var EU = Kekule.HtmlElementUtils;
		//var opos = EU.getElemPagePos(element);
		//var odim = EU.getElemClientDimension(element);
		var odim = EU.getElemBoundingClientRect(element, true);
		//var odim = EU.getElemPageRect(element);
		var transDelta = {
			x: odim.x - refRect.x,
			y: odim.y - refRect.y
			//width: odim.width - refRect.width,
			//height: odim.height - refRect.height
		};
		/*
		var transDelta = {
			x: odim.x + odim.width / 2 - refRect.x - refRect.width / 2,
			y: odim.y + odim.height / 2 - refRect.y - refRect.height / 2
			//width: odim.width - refRect.width,
			//height: odim.height - refRect.height
		};
		*/
		this._translateDelta = transDelta;
		this._initialScale = {
			x: refRect.width / odim.width,
			y: refRect.height / odim.height
		};
		if (this._computedTransMatrixInfo)
		{
			this._endScale = {
				x: this._computedTransMatrixInfo.scaleX,
				y: this._computedTransMatrixInfo.scaleY
			};
			this._endTranslate = {
				x: this._computedTransMatrixInfo.tx,
				y: this._computedTransMatrixInfo.ty
			}
		}
		else
		{
			this._endScale = {x: 1, y: 1};
			this._endTranslate = {x: 0, y: 0};
		}
		//console.log(this._translateDelta, refRect, odim);
	},

	/** @private */
	setElementProp: function(element, position, options)
	{
		var compStyles = this.getParent().getComputedCssValues();
		var transDelta = this._translateDelta;
		var initialScale = this._initialScale;
		var endScale = this._endScale;

		var translateInfo = {
			'x': this._endTranslate.x -(1 - position) * transDelta.x, // + 'px',
			'y': this._endTranslate.y -(1 - position) * transDelta.y // + 'px'
		};
		var scaleInfo = {
			'x': position * endScale.x + (1 - position) * initialScale.x,
			'y': position * endScale.y + (1 - position) * initialScale.y
		};

		//var curr = {};
		var style = element.style;
		style.transformOrigin = '0 0 0';
		//style.transformOrigin = '50% 50% 0';
		/*
		var sTransform = 'translate(' + translateInfo.x + ',' +translateInfo.y + ') ' + 'scaleX(' + scaleInfo.x + ') scaleY(' + scaleInfo.y + ')';
		style.transform = sTransform;
		*/
		this.setElemTransform(element, translateInfo.x, translateInfo.y, scaleInfo.x, scaleInfo.y);
		//console.log('set transform', position, sTransform);
	}
});

}

/**
 * Executor based on CSS3 transition.
 * @class
 * @arguments {Kekule.Widget.BaseTransition}
 *
 * @property {String} timingFunc CSS3 transition-timing-function.
 * @property {Array} childRunners A series of transition runner runs synchronously.
 */
Kekule.Widget.Css3Transition = Class.create(Kekule.Widget.BaseTransition,
/** @lends Kekule.Widget.Css3Transition# */
{
	/** @private */
	CLASS_NAME: 'Kekule.Widget.Css3Transition',
	/** @constructs */
	initialize: function(/*$super*/)
	{
		this.tryApplySuper('initialize')  /* $super() */;
	},
	/** @private */
	initProperties: function()
	{
		this.defineProp('timingFunc', {'dataType': DataType.STRING});
		this.defineProp('childRunners', {'dataType': DataType.ARRAY, 'serializable': false});

		this.defineProp('cssProperty', {'dataType': DataType.STRING});  // private
	},

	/** @private */
	getRunners: function()
	{
		var rs = this.getChildRunners();
		return rs? AU.toArray(rs): [];
	},
	/** @private */
	iterateRunners: function(func)
	{
		var rs = this.getRunners();
		for (var i = 0, l = rs.length; i < l; ++i)
		{
			func(rs[i], i, rs);
		}
	},
	/**
	 * Returns an array of CSS property names that may be changed during transition.
	 * Descendants may override this method.
	 * @param {Hash} transOptions
	 * @returns {Array}
	 * @private
	 */
	getAffectedCssPropNames: function(transOptions)
	{
		var result = [];
		this.iterateRunners(function(runner){
			var ps = runner.getAffectedCssPropNames() || [];
			result = result.concat(ps);
		});
		return result;
	},
	/**
	 * Determinate the direct CSS transition property names.
	 * Descendants may override this method.
	 * @param {Hash} transOptions
	 * @returns {Array} Properties to be changed.
	 * @private
	 */
	getTransCssPropNames: function(transOptions)
	{
		var result = [];
		this.iterateRunners(function(runner){
			var ps = runner.getTransCssPropNames() || [];
			result = result.concat(ps);
		});
		return result;
	},
	/** @ignore */
	setElementProp: function(element, position, options)
	{
		this.iterateRunners(function(runner){
			runner.setElementProp(element, position, options);
		});
	},

	/** @ignore */
	canExecute: function(element, options)
	{
		return !!Kekule.BrowserFeature.cssTransition;
	},
	/**
	 * Check if CSS3 transition is supported by current browser.
	 * @returns {Bool}
	 */
	isSupported: function()
	{
		return !!Kekule.BrowserFeature.cssTransition;
	},
	/**
	 * Check if option means an appear transition.
	 * @param {Hash} options
	 * @returns {Bool}
	 * @private
	 */
	isAppear: function(options)
	{
		return !!options.isAppear;
	},
	/**
	 * Check if option means an disappear transition.
	 * @param {Hash} options
	 * @returns {Bool}
	 * @private
	 */
	isDisappear: function(options)
	{
		return !!options.isDisappear;
	},
	/** @private */
	getTransitionPropValue: function(elem, propName)
	{
		var propNames = [
			propName,
			'Webkit' + propName.capitalizeFirst(),
			'Moz' + propName.capitalizeFirst()
		];
		var result = null;
		for (var i = 0, l = propNames.length; i < l; ++i)
		{
			result = Kekule.StyleUtils.getComputedStyle(elem, propNames[i]);
			if (result)
				break;
		}
		return result;
	},
	/** @private */
	setTransitionPropValue: function(styleObj, propName, value)
	{
		//console.log(propName, value);
		// help to set CSS properties with -moz- or -webkit prefix
		var propNames = [
			'Moz' + propName.capitalizeFirst(),
			'Webkit' + propName.capitalizeFirst(),
			propName
		];
		for (var i = 0, l = propNames.length; i < l; ++i)
		{
			styleObj[propNames[i]] = value;
		}
	},

	/** @private */
	getOriginCssInlineValues: function()
	{
		return this._originCssInlineValues;
	},
	/** @private */
	getComputedCssValues: function()
	{
		return this._computedCssValues;
	},

	/** @private */
	prepare: function(element, caller, options)
	{
		this.tryApplySuper('prepare', [element, caller, options]);
		//console.log('prepare', this.getTransCssPropNames());
		this.setCssProperty(this.getTransCssPropNames(options).join(','));
		var cssPropNames = this.getAffectedCssPropNames(options);
		this._affectedCssPropNames = cssPropNames;
		// store CSS values to future use
		this._originCssInlineValues = this.storeCssInlineValues(element, cssPropNames);
		this._computedCssValues = this.storeCssComputedValues(element, cssPropNames);

		var self = this;
		this.iterateRunners(function(runner){
			runner.setParent(self);
			runner.prepare(element, caller, options);
		});
	},
	/** @private */
	finish: function(element, caller, options)
	{
		if ((options.to === 1) || this.isAppear(options) || this.isDisappear(options))
		{
			//console.log('finish transition', this._affectedCssPropNames, this._originCssInlineValues);
			this.restoreCssInlineValues(element, this._affectedCssPropNames, this._originCssInlineValues);
		}
		this.tryApplySuper('finish', [element, caller, options]);
	},

	/** @private */
	doExecute: function(element, caller, callback, options)
	{
		//console.log('transition execute', options);
		var SU = Kekule.StyleUtils;

		var style = element.style;
		var isAppear = this.isAppear(options);
		var isDisappear = this.isDisappear(options);

		if (this.isSupported())
		{
			this.setElementProp(element, options.from, options);
			if (!SU.isDisplayed(element))
				SU.setDisplay(element, true);
			if (!SU.isVisible(element))
				SU.setVisibility(element, true);

			// set transition initial CSS properties
			var s = this.getCssProperty();
			/*
			var originTransProp = this.getTransitionPropValue(element, 'transitionProperty');
			if (originTransProp)  // preserve existing transition properties
				s = originTransProp + ',' + s;
			*/

			this.setTransitionPropValue(style, 'transitionProperty', s);
			//this.setTransitionPropValue(style, 'transitionProperty', 'all');

			s = this.getTimingFunc() || options.timingFunc;
			if (s)
			{
				this.setTransitionPropValue(style, 'transitionTimingFunction', s);
			}

			s = options.duration.toString() + 'ms';
			this.setTransitionPropValue(style, 'transitionDuration', s);

			/*
			// check if there is a undismissed event handler.
			// This situation may occur when a execution process is request before prev execution finished
			if (this._currEventHandler)
				Kekule.X.Event.removeListener(element, 'transitionend', this._currEventHandler);
			*/
			// TODO: Need find a better solution to avoid transition overlap on one element

			// install transitionend event handler
			var fallbackTimeout;
			var self = this;
			var done = function(e)
			{
				//console.log('transition done', callback);
				Kekule.X.Event.removeListener(element, 'transitionend', done);
				// clear transition props
				self.setTransitionPropValue(style, 'transition', '');
				// clear fallback
				if (fallbackTimeout)
					clearTimeout(fallbackTimeout);
				if (callback)
					callback();
			};
			this._currEventHandler = done;
			Kekule.X.Event.addListener(element, 'transitionend', done);
			// some times the transitionend event will not be evoked
			// (e.g., transition on element out of document in Chrome)
			// so we need a fallback
			fallbackTimeout = setTimeout(done, options.duration + 100);

			//console.log('transition execute');
			// set "to" property, need use setTimeOut to force browser update DOM
			setTimeout(function(){
				self.setElementProp(element, options.to, options);
			}, 0);
		}
		else  // not supported
		{
			try
			{
				this.setElementProp(element, options.to, options);
			}
			catch(e)  // if error occurs, anyway, we will proceed
			{

			}
			/*
			if (callback)
				callback();
			*/
			if (callback)  // delay call callback, after all routines of execute
				setTimeout(callback, 0);
		}
	},

	/** @private */
	doHalt: function(transitionInfo)
	{
		var elem = transitionInfo.element;
		if (elem)
		{
			//console.log('===================');
			//setTimeout(this.setTransitionPropValue/*.bind(this)*/, 0, elem.style, 'transitionProperty', 'none');
			this.setTransitionPropValue(elem.style, 'transitionProperty', 'none');
		}
	}
});

/**
 * A helper function to create concrete CSS3 transitions with concrete runners.
 * @param {String} className
 * @param {Array} transitionRunnerClasses
 */
Kekule.Widget.Css3Transition.createConcreteClass = function(className, transitionRunnerClasses)
{
	/** @ignore */
	var result = Class.create(Kekule.Widget.Css3Transition,
		{
			CLASS_NAME: className,
			CHILD_RUNNER_CLASSES: AU.toArray(transitionRunnerClasses),
			initialize: function()
			{
				this.tryApplySuper('initialize');
				var runners = [];
				for (var i = 0, l = this.CHILD_RUNNER_CLASSES.length; i < l; ++i)
				{
					runners.push(new this.CHILD_RUNNER_CLASSES[i]());
				}
				this.setChildRunners(runners);
			}
		});

	/*
	// automatically set the class entry
	if (className.startsWith('Kekule'))
		Object.setCascadeFieldValue(className, result, Kekule.$jsRoot);
  */
	return result;
};


/* @ignore */
/*
Kekule.Widget.Css3SlideDownTransExecutor = TCC.create('Kekule.Widget.Css3SlideDownTransExecutor', 'height', null, {
	canExecute: function($super, element, options)
	{
		return ($super(element, options) &&
			Kekule.ObjUtils.notUnset(SU.analysisUnitsValue(SU.getComputedStyle(element, 'height')).value));
	},
	prepare: function(element, options)
	{
		SU.setDisplay(element, true);  // important, otherwise width info could not be get.
		var s = SU.getComputedStyle(element, 'height');
		this._elemHeightInfo = SU.analysisUnitsValue(s);
		this._originHeight = element.style.height;
		this._originOverflow = element.style.overflow;
		element.style.overflow = 'hidden';
	},
	finish: function(element, options)
	{
		if ((options.to === 1) || this.isAppear(options) || this.isDisappear(options))
		{
			if (!this._originWidth)
				element.style.removeProperty('height');
			else
				element.style.height = this._originHeight;
			if (this._originOverflow)
				element.style.overflow = this._originOveflow;
			else
				element.style.removeProperty('overflow');
		}
	},
	setElementProp: function(element, position, options)
	{
		var s = this._elemHeightInfo.value * position + this._elemHeightInfo.units;
		element.style.height = s;
	}
});
*/
/* @ignore */
/*
Kekule.Widget.Css3SlideRightTransExecutor = TCC.create('Kekule.Widget.Css3SlideRightTransExecutor', 'width', null, {
	canExecute: function($super, element, options)
	{
		return ($super(element, options) &&
			Kekule.ObjUtils.notUnset(SU.analysisUnitsValue(SU.getComputedStyle(element, 'width')).value));
	},
	prepare: function(element, options)
	{
		SU.setDisplay(element, true);  // important, otherwise width info could not be get.
		var s = SU.getComputedStyle(element, 'width');
		this._elemWidthInfo = SU.analysisUnitsValue(s);
		this._originWidth = element.style.width;
		this._originOverflow = element.style.overflow || '';
		element.style.overflow = 'hidden';
	},
	finish: function(element, options)
	{
		if ((options.to === 1) || this.isAppear(options) || this.isDisappear(options))
		{
			if (!this._originWidth)
				element.style.removeProperty('width');
			else
				element.style.width = this._originWidth;
			if (this._originOverflow)
				element.style.overflow = this._originOveflow;
			else
				element.style.removeProperty('overflow');
		}
	},
	setElementProp: function(element, position, options)
	{
		var s = this._elemWidthInfo.value * position + this._elemWidthInfo.units;
		element.style.width = s;
	}
});
*/

Kekule.Widget.Css3OpacityTrans = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3OpacityTrans', [Kekule.Widget.Css3OpacityTransRunner]);
Kekule.Widget.Css3ClipPathSlideTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3ClipPathSlideTransition', [Kekule.Widget.Css3ClipPathSlideTransRunner]);
Kekule.Widget.Css3SlideTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3SlideTransition', [Kekule.Widget.Css3SlideTransRunner]);
Kekule.Widget.Css3GrowTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3GrowTransition', [Kekule.Widget.Css3GrowTransRunner]);

Kekule.Widget.Css3ClipPathSlideOpacityTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3ClipPathSlideOpacityTransition', [Kekule.Widget.Css3ClipPathSlideTransRunner, Kekule.Widget.Css3OpacityTransRunner]);
Kekule.Widget.Css3GrowOpacityTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3GrowOpacityTransition', [Kekule.Widget.Css3GrowTransRunner, Kekule.Widget.Css3OpacityTransRunner]);

if (Kekule.Widget.Css3TransformGrowTransRunner)
{
	Kekule.Widget.Css3TransformGrowTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3TransformGrowTransition', [Kekule.Widget.Css3TransformGrowTransRunner]);
	Kekule.Widget.Css3TransformGrowOpacityTransition = Kekule.Widget.Css3Transition.createConcreteClass('Kekule.Widget.Css3TransformGrowOpacityTransition', [Kekule.Widget.Css3TransformGrowTransRunner, Kekule.Widget.Css3OpacityTransRunner]);
}

/**
 * A helper class providing util functions for widget transitions.
 * @class
 */
Kekule.Widget.TransitionUtils = {
	/**
	 * Returns the reference rect of the transition caller element.
	 * @param {Hash} transOptions
	 * @returns {Hash}
	 * @private
	 */
	getCallerRefRect: function(callerElem, transOptions)
	{
		var result;
		var EU = Kekule.HtmlElementUtils;
		if (callerElem)
		{
			/*
			var pos = EU.getElemPagePos(this.getCaller());
			var dim = EU.getElemClientDimension(this.getCaller());
			return {
				'x': pos.x || 0,
				'y': pos.y || 0,
				'width': dim.width || 0,
				'height': dim.height || 0
			};
			*/
			result = EU.getElemPageRect(callerElem);
			//result = EU.getElemBoundingClientRect(this.getCaller(), true);
			if (Kekule.RectUtils.isZero(result))  // rect is null, maybe the caller widget is hidden, use cached one instead
			{
				result = (transOptions || {}).callerPageRect || null;
			}
		}
		else
		{
			result = null;
		}
		return result;
	},
	/**
	 * Returns the preferred direction of a slide transition.
	 * @param {HTMLElement} element
	 * @param {HTMLElement} callerElem
	 * @param {Hash} transOptions
	 * @returns {Int}
	 */
	getPreferredSlideDirection: function(element, callerElem, transOptions)
	{
		var D = Kekule.Widget.Direction;
		var EU = Kekule.HtmlElementUtils;
		var result = null;
		{
			var refRect = Kekule.Widget.TransitionUtils.getCallerRefRect(callerElem, transOptions);
			//console.log(refRect);
			if (!refRect)
				result = D.TTB;  // default
			else
			{
				var refCenter = {'x': refRect.x + refRect.width / 2, 'y': refRect.y + refRect.height / 2};
				var selfPos = EU.getElemPagePos(element);
				var selfDim = EU.getElemClientDimension(element);
				var selfCenter = {'x': selfPos.x + (selfDim.width || 0) / 2, 'y': selfPos.y + (selfDim.height || 0) / 2};
				var delta = Kekule.CoordUtils.substract(selfCenter, refCenter);

				if (refRect.width < 1)  // very slim refRect
				{
					result = (delta.x >= 0)? D.LTR: D.RTL;
				}
				else if (delta.x < 1)  // very close to horizontal line
				{
					result = (delta.y >= 0)? D.TTB: D.BTT;
				}
				else
				{
					var r1 = Math.abs(refRect.height / refRect.width);
					var r2 = Math.abs(delta.y / delta.x);
					if (r1 > r2)  // left or right side
					{
						result = (delta.x >= 0)? D.LTR: D.RTL;
					}
					else  // top or bottom side
					{
						result = (delta.y >= 0)? D.TTB: D.BTT;
					}
				}
			}
		}
		return result;
	}
};

})();