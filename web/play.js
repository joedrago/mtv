(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*!
 * clipboard.js v2.0.8
 * https://clipboardjs.com/
 *
 * Licensed MIT © Zeno Rocha
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ClipboardJS"] = factory();
	else
		root["ClipboardJS"] = factory();
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 134:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ clipboard; }
});

// EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
var tiny_emitter = __webpack_require__(279);
var tiny_emitter_default = /*#__PURE__*/__webpack_require__.n(tiny_emitter);
// EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
var listen = __webpack_require__(370);
var listen_default = /*#__PURE__*/__webpack_require__.n(listen);
// EXTERNAL MODULE: ./node_modules/select/src/select.js
var src_select = __webpack_require__(817);
var select_default = /*#__PURE__*/__webpack_require__.n(src_select);
;// CONCATENATED MODULE: ./src/clipboard-action.js
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


/**
 * Inner class which performs selection from either `text` or `target`
 * properties and then executes copy or cut operations.
 */

var ClipboardAction = /*#__PURE__*/function () {
  /**
   * @param {Object} options
   */
  function ClipboardAction(options) {
    _classCallCheck(this, ClipboardAction);

    this.resolveOptions(options);
    this.initSelection();
  }
  /**
   * Defines base properties passed from constructor.
   * @param {Object} options
   */


  _createClass(ClipboardAction, [{
    key: "resolveOptions",
    value: function resolveOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.action = options.action;
      this.container = options.container;
      this.emitter = options.emitter;
      this.target = options.target;
      this.text = options.text;
      this.trigger = options.trigger;
      this.selectedText = '';
    }
    /**
     * Decides which selection strategy is going to be applied based
     * on the existence of `text` and `target` properties.
     */

  }, {
    key: "initSelection",
    value: function initSelection() {
      if (this.text) {
        this.selectFake();
      } else if (this.target) {
        this.selectTarget();
      }
    }
    /**
     * Creates a fake textarea element, sets its value from `text` property,
     */

  }, {
    key: "createFakeElement",
    value: function createFakeElement() {
      var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      this.fakeElem = document.createElement('textarea'); // Prevent zooming on iOS

      this.fakeElem.style.fontSize = '12pt'; // Reset box model

      this.fakeElem.style.border = '0';
      this.fakeElem.style.padding = '0';
      this.fakeElem.style.margin = '0'; // Move element out of screen horizontally

      this.fakeElem.style.position = 'absolute';
      this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px'; // Move element to the same position vertically

      var yPosition = window.pageYOffset || document.documentElement.scrollTop;
      this.fakeElem.style.top = "".concat(yPosition, "px");
      this.fakeElem.setAttribute('readonly', '');
      this.fakeElem.value = this.text;
      return this.fakeElem;
    }
    /**
     * Get's the value of fakeElem,
     * and makes a selection on it.
     */

  }, {
    key: "selectFake",
    value: function selectFake() {
      var _this = this;

      var fakeElem = this.createFakeElement();

      this.fakeHandlerCallback = function () {
        return _this.removeFake();
      };

      this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;
      this.container.appendChild(fakeElem);
      this.selectedText = select_default()(fakeElem);
      this.copyText();
      this.removeFake();
    }
    /**
     * Only removes the fake element after another click event, that way
     * a user can hit `Ctrl+C` to copy because selection still exists.
     */

  }, {
    key: "removeFake",
    value: function removeFake() {
      if (this.fakeHandler) {
        this.container.removeEventListener('click', this.fakeHandlerCallback);
        this.fakeHandler = null;
        this.fakeHandlerCallback = null;
      }

      if (this.fakeElem) {
        this.container.removeChild(this.fakeElem);
        this.fakeElem = null;
      }
    }
    /**
     * Selects the content from element passed on `target` property.
     */

  }, {
    key: "selectTarget",
    value: function selectTarget() {
      this.selectedText = select_default()(this.target);
      this.copyText();
    }
    /**
     * Executes the copy operation based on the current selection.
     */

  }, {
    key: "copyText",
    value: function copyText() {
      var succeeded;

      try {
        succeeded = document.execCommand(this.action);
      } catch (err) {
        succeeded = false;
      }

      this.handleResult(succeeded);
    }
    /**
     * Fires an event based on the copy operation result.
     * @param {Boolean} succeeded
     */

  }, {
    key: "handleResult",
    value: function handleResult(succeeded) {
      this.emitter.emit(succeeded ? 'success' : 'error', {
        action: this.action,
        text: this.selectedText,
        trigger: this.trigger,
        clearSelection: this.clearSelection.bind(this)
      });
    }
    /**
     * Moves focus away from `target` and back to the trigger, removes current selection.
     */

  }, {
    key: "clearSelection",
    value: function clearSelection() {
      if (this.trigger) {
        this.trigger.focus();
      }

      document.activeElement.blur();
      window.getSelection().removeAllRanges();
    }
    /**
     * Sets the `action` to be performed which can be either 'copy' or 'cut'.
     * @param {String} action
     */

  }, {
    key: "destroy",

    /**
     * Destroy lifecycle.
     */
    value: function destroy() {
      this.removeFake();
    }
  }, {
    key: "action",
    set: function set() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';
      this._action = action;

      if (this._action !== 'copy' && this._action !== 'cut') {
        throw new Error('Invalid "action" value, use either "copy" or "cut"');
      }
    }
    /**
     * Gets the `action` property.
     * @return {String}
     */
    ,
    get: function get() {
      return this._action;
    }
    /**
     * Sets the `target` property using an element
     * that will be have its content copied.
     * @param {Element} target
     */

  }, {
    key: "target",
    set: function set(target) {
      if (target !== undefined) {
        if (target && _typeof(target) === 'object' && target.nodeType === 1) {
          if (this.action === 'copy' && target.hasAttribute('disabled')) {
            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
          }

          if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
          }

          this._target = target;
        } else {
          throw new Error('Invalid "target" value, use a valid Element');
        }
      }
    }
    /**
     * Gets the `target` property.
     * @return {String|HTMLElement}
     */
    ,
    get: function get() {
      return this._target;
    }
  }]);

  return ClipboardAction;
}();

/* harmony default export */ var clipboard_action = (ClipboardAction);
;// CONCATENATED MODULE: ./src/clipboard.js
function clipboard_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { clipboard_typeof = function _typeof(obj) { return typeof obj; }; } else { clipboard_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return clipboard_typeof(obj); }

function clipboard_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function clipboard_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function clipboard_createClass(Constructor, protoProps, staticProps) { if (protoProps) clipboard_defineProperties(Constructor.prototype, protoProps); if (staticProps) clipboard_defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (clipboard_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }




/**
 * Helper function to retrieve attribute value.
 * @param {String} suffix
 * @param {Element} element
 */

function getAttributeValue(suffix, element) {
  var attribute = "data-clipboard-".concat(suffix);

  if (!element.hasAttribute(attribute)) {
    return;
  }

  return element.getAttribute(attribute);
}
/**
 * Base class which takes one or more elements, adds event listeners to them,
 * and instantiates a new `ClipboardAction` on each click.
 */


var Clipboard = /*#__PURE__*/function (_Emitter) {
  _inherits(Clipboard, _Emitter);

  var _super = _createSuper(Clipboard);

  /**
   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
   * @param {Object} options
   */
  function Clipboard(trigger, options) {
    var _this;

    clipboard_classCallCheck(this, Clipboard);

    _this = _super.call(this);

    _this.resolveOptions(options);

    _this.listenClick(trigger);

    return _this;
  }
  /**
   * Defines if attributes would be resolved using internal setter functions
   * or custom functions that were passed in the constructor.
   * @param {Object} options
   */


  clipboard_createClass(Clipboard, [{
    key: "resolveOptions",
    value: function resolveOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
      this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
      this.text = typeof options.text === 'function' ? options.text : this.defaultText;
      this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
    }
    /**
     * Adds a click event listener to the passed trigger.
     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
     */

  }, {
    key: "listenClick",
    value: function listenClick(trigger) {
      var _this2 = this;

      this.listener = listen_default()(trigger, 'click', function (e) {
        return _this2.onClick(e);
      });
    }
    /**
     * Defines a new `ClipboardAction` on each click event.
     * @param {Event} e
     */

  }, {
    key: "onClick",
    value: function onClick(e) {
      var trigger = e.delegateTarget || e.currentTarget;

      if (this.clipboardAction) {
        this.clipboardAction = null;
      }

      this.clipboardAction = new clipboard_action({
        action: this.action(trigger),
        target: this.target(trigger),
        text: this.text(trigger),
        container: this.container,
        trigger: trigger,
        emitter: this
      });
    }
    /**
     * Default `action` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultAction",
    value: function defaultAction(trigger) {
      return getAttributeValue('action', trigger);
    }
    /**
     * Default `target` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultTarget",
    value: function defaultTarget(trigger) {
      var selector = getAttributeValue('target', trigger);

      if (selector) {
        return document.querySelector(selector);
      }
    }
    /**
     * Returns the support of the given action, or all actions if no action is
     * given.
     * @param {String} [action]
     */

  }, {
    key: "defaultText",

    /**
     * Default `text` lookup function.
     * @param {Element} trigger
     */
    value: function defaultText(trigger) {
      return getAttributeValue('text', trigger);
    }
    /**
     * Destroy lifecycle.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.listener.destroy();

      if (this.clipboardAction) {
        this.clipboardAction.destroy();
        this.clipboardAction = null;
      }
    }
  }], [{
    key: "isSupported",
    value: function isSupported() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];
      var actions = typeof action === 'string' ? [action] : action;
      var support = !!document.queryCommandSupported;
      actions.forEach(function (action) {
        support = support && !!document.queryCommandSupported(action);
      });
      return support;
    }
  }]);

  return Clipboard;
}((tiny_emitter_default()));

/* harmony default export */ var clipboard = (Clipboard);

/***/ }),

/***/ 828:
/***/ (function(module) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),

/***/ 438:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var closest = __webpack_require__(828);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(elements, selector, type, callback, useCapture) {
    // Handle the regular Element usage
    if (typeof elements.addEventListener === 'function') {
        return _delegate.apply(null, arguments);
    }

    // Handle Element-less usage, it defaults to global delegation
    if (typeof type === 'function') {
        // Use `document` as the first parameter, then apply arguments
        // This is a short way to .unshift `arguments` without running into deoptimizations
        return _delegate.bind(null, document).apply(null, arguments);
    }

    // Handle Selector-based usage
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }

    // Handle Array-like based usage
    return Array.prototype.map.call(elements, function (element) {
        return _delegate(element, selector, type, callback, useCapture);
    });
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),

/***/ 879:
/***/ (function(__unused_webpack_module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),

/***/ 370:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var is = __webpack_require__(879);
var delegate = __webpack_require__(438);

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),

/***/ 817:
/***/ (function(module) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ }),

/***/ 279:
/***/ (function(module) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(134);
/******/ })()
.default;
});
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @description A module for parsing ISO8601 durations
 */

/**
 * The pattern used for parsing ISO8601 duration (PnYnMnDTnHnMnS).
 * This does not cover the week format PnW.
 */

// PnYnMnDTnHnMnS
var numbers = '\\d+(?:[\\.,]\\d+)?';
var weekPattern = '(' + numbers + 'W)';
var datePattern = '(' + numbers + 'Y)?(' + numbers + 'M)?(' + numbers + 'D)?';
var timePattern = 'T(' + numbers + 'H)?(' + numbers + 'M)?(' + numbers + 'S)?';

var iso8601 = 'P(?:' + weekPattern + '|' + datePattern + '(?:' + timePattern + ')?)';
var objMap = ['weeks', 'years', 'months', 'days', 'hours', 'minutes', 'seconds'];

/**
 * The ISO8601 regex for matching / testing durations
 */
var pattern = exports.pattern = new RegExp(iso8601);

/** Parse PnYnMnDTnHnMnS format to object
 * @param {string} durationString - PnYnMnDTnHnMnS formatted string
 * @return {Object} - With a property for each part of the pattern
 */
var parse = exports.parse = function parse(durationString) {
  // Slice away first entry in match-array
  return durationString.match(pattern).slice(1).reduce(function (prev, next, idx) {
    prev[objMap[idx]] = parseFloat(next) || 0;
    return prev;
  }, {});
};

/**
 * Convert ISO8601 duration object to an end Date.
 *
 * @param {Object} duration - The duration object
 * @param {Date} startDate - The starting Date for calculating the duration
 * @return {Date} - The resulting end Date
 */
var end = exports.end = function end(duration, startDate) {
  // Create two equal timestamps, add duration to 'then' and return time difference
  var timestamp = startDate ? startDate.getTime() : Date.now();
  var then = new Date(timestamp);

  then.setFullYear(then.getFullYear() + duration.years);
  then.setMonth(then.getMonth() + duration.months);
  then.setDate(then.getDate() + duration.days);
  then.setHours(then.getHours() + duration.hours);
  then.setMinutes(then.getMinutes() + duration.minutes);
  // Then.setSeconds(then.getSeconds() + duration.seconds);
  then.setMilliseconds(then.getMilliseconds() + duration.seconds * 1000);
  // Special case weeks
  then.setDate(then.getDate() + duration.weeks * 7);

  return then;
};

/**
 * Convert ISO8601 duration object to seconds
 *
 * @param {Object} duration - The duration object
 * @param {Date} startDate - The starting point for calculating the duration
 * @return {Number}
 */
var toSeconds = exports.toSeconds = function toSeconds(duration, startDate) {
  var timestamp = startDate ? startDate.getTime() : Date.now();
  var now = new Date(timestamp);
  var then = end(duration, now);

  var seconds = (then.getTime() - now.getTime()) / 1000;
  return seconds;
};

exports.default = {
  end: end,
  toSeconds: toSeconds,
  pattern: pattern,
  parse: parse
};
},{}],3:[function(require,module,exports){
var Clipboard, DASHCAST_NAMESPACE, NEVER_WATCHED_TIME, Player, TIME_BUCKETS, addEnabled, askForget, calcLabel, calcPerma, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, clipboardMirror, constants, currentPlaylistName, deletePlaylist, discordNickname, discordTag, discordToken, endedTimer, exportEnabled, fadeIn, fadeOut, filters, formChanged, generatePermalink, getData, goLive, goSolo, isTesla, k, lastPlayedID, lastShowListTime, launchOpen, len, listenForMediaButtons, loadPlaylist, logout, mediaButtonsReady, now, o, onAdd, onError, onInitSuccess, onTapShow, opinionOrder, overTimers, pageEpoch, pauseInternal, play, player, playing, prepareCast, qs, randomString, rawJSON, receiveIdentity, receiveUserPlaylist, ref, renderAdd, renderClipboard, renderClipboardMirror, renderInfo, renderPlaylistName, requestUserPlaylists, savePlaylist, sendIdentity, sendReady, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, sharePerma, showExport, showInfo, showList, showWatchForm, showWatchLink, showWatchLive, shuffleArray, socket, soloCalcBuckets, soloCommand, soloCount, soloError, soloID, soloIndex, soloInfo, soloInfoBroadcast, soloLabels, soloLastWatched, soloMirror, soloPause, soloPlay, soloPrev, soloQueue, soloResetLastWatched, soloRestart, soloSaveLastWatched, soloShuffle, soloSkip, soloTick, soloTickTimeout, soloUnshuffled, soloVideo, splitArtist, sprinkleFormQS, startCast, startHere, tapTimeout, trimAllWhitespace, updateOpinion, updateSoloID;

constants = require('../constants');

Clipboard = require('clipboard');

filters = require('../filters');

Player = require('./player');

socket = null;

player = null;

endedTimer = null;

playing = false;

soloUnshuffled = [];

soloQueue = [];

soloIndex = 0;

soloTickTimeout = null;

soloVideo = null;

soloError = null;

soloCount = 0;

soloLabels = null;

soloMirror = false;

TIME_BUCKETS = [
  {
    since: 1200,
    description: "20 min"
  },
  {
    since: 3600,
    description: "1 hour"
  },
  {
    since: 10800,
    description: "3 hours"
  },
  {
    since: 28800,
    description: "8 hours"
  },
  {
    since: 86400,
    description: "1 day"
  },
  {
    since: 259200,
    description: "3 days"
  },
  {
    since: 604800,
    description: "1 week"
  },
  {
    since: 2419200,
    description: "4 weeks"
  },
  {
    since: 31536000,
    description: "1 year"
  },
  {
    since: 315360000,
    description: "10 years"
  },
  {
    since: 3153600000,
    description: "100 years"
  },
  {
    since: 0,
    description: "Never watched"
  }
];

NEVER_WATCHED_TIME = TIME_BUCKETS[TIME_BUCKETS.length - 2].since + 1;

lastShowListTime = null;

soloLastWatched = {};

try {
  rawJSON = localStorage.getItem('lastwatched');
  soloLastWatched = JSON.parse(rawJSON);
  if ((soloLastWatched == null) || (typeof soloLastWatched !== 'object')) {
    console.log("soloLastWatched is not an object, starting fresh.");
    soloLastWatched = {};
  }
  console.log("Parsed localStorage's lastwatched: ", soloLastWatched);
} catch (error) {
  console.log("Failed to parse localStorage's lastwatched, starting fresh.");
  soloLastWatched = {};
}

lastPlayedID = null;

endedTimer = null;

overTimers = [];

DASHCAST_NAMESPACE = 'urn:x-cast:es.offd.dashcast';

soloID = null;

soloInfo = {};

discordToken = null;

discordTag = null;

discordNickname = null;

castAvailable = false;

castSession = null;

launchOpen = false; // (localStorage.getItem('launch') == "true")

// console.log "launchOpen: #{launchOpen}"
addEnabled = true;

exportEnabled = false;

isTesla = false;

tapTimeout = null;

currentPlaylistName = null;

opinionOrder = [];

ref = constants.opinionOrder;
for (k = 0, len = ref.length; k < len; k++) {
  o = ref[k];
  opinionOrder.push(o);
}

opinionOrder.push('none');

randomString = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

now = function() {
  return Math.floor(Date.now() / 1000);
};

pageEpoch = now();

qs = function(name) {
  var regex, results, url;
  url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  results = regex.exec(url);
  if (!results || !results[2]) {
    return null;
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

onTapShow = function() {
  var outer;
  console.log("onTapShow");
  outer = document.getElementById('outer');
  if (tapTimeout != null) {
    clearTimeout(tapTimeout);
    tapTimeout = null;
    return outer.style.opacity = 0;
  } else {
    outer.style.opacity = 1;
    return tapTimeout = setTimeout(function() {
      console.log("tapTimeout!");
      outer.style.opacity = 0;
      return tapTimeout = null;
    }, 10000);
  }
};

fadeIn = function(elem, ms) {
  var opacity, timer;
  if (elem == null) {
    return;
  }
  elem.style.opacity = 0;
  elem.style.filter = "alpha(opacity=0)";
  elem.style.display = "inline-block";
  elem.style.visibility = "visible";
  if ((ms != null) && ms > 0) {
    opacity = 0;
    return timer = setInterval(function() {
      opacity += 50 / ms;
      if (opacity >= 1) {
        clearInterval(timer);
        opacity = 1;
      }
      elem.style.opacity = opacity;
      return elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
    }, 50);
  } else {
    elem.style.opacity = 1;
    return elem.style.filter = "alpha(opacity=1)";
  }
};

fadeOut = function(elem, ms) {
  var opacity, timer;
  if (elem == null) {
    return;
  }
  if ((ms != null) && ms > 0) {
    opacity = 1;
    return timer = setInterval(function() {
      opacity -= 50 / ms;
      if (opacity <= 0) {
        clearInterval(timer);
        opacity = 0;
        elem.style.display = "none";
        elem.style.visibility = "hidden";
      }
      elem.style.opacity = opacity;
      return elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
    }, 50);
  } else {
    elem.style.opacity = 0;
    elem.style.filter = "alpha(opacity=0)";
    elem.style.display = "none";
    return elem.style.visibility = "hidden";
  }
};

showWatchForm = function() {
  document.getElementById('aslive').style.display = 'none';
  document.getElementById('aslink').style.display = 'none';
  document.getElementById('asform').style.display = 'block';
  document.getElementById('castbutton').style.display = 'inline-block';
  document.getElementById('playcontrols').style.display = 'block';
  document.getElementById("filters").focus();
  launchOpen = true;
  return localStorage.setItem('launch', 'true');
};

showWatchLink = function() {
  document.getElementById('aslink').style.display = 'inline-block';
  document.getElementById('asform').style.display = 'none';
  document.getElementById('aslive').style.display = 'none';
  document.getElementById('playcontrols').style.display = 'block';
  launchOpen = false;
  localStorage.setItem('launch', 'false');
  return document.getElementById('list').innerHTML = "";
};

showWatchLive = function() {
  document.getElementById('aslink').style.display = 'none';
  document.getElementById('asform').style.display = 'none';
  document.getElementById('aslive').style.display = 'block';
  document.getElementById('playcontrols').style.display = 'none';
  launchOpen = false;
  localStorage.setItem('launch', 'false');
  return document.getElementById('list').innerHTML = "";
};

onInitSuccess = function() {
  console.log("Cast available!");
  return castAvailable = true;
};

onError = function(message) {};

sessionListener = function(e) {
  return castSession = e;
};

sessionUpdateListener = function(isAlive) {
  if (!isAlive) {
    return castSession = null;
  }
};

prepareCast = function() {
  var apiConfig, sessionRequest;
  if (!chrome.cast || !chrome.cast.isAvailable) {
    if (now() < (pageEpoch + 10)) { // give up after 10 seconds
      window.setTimeout(prepareCast, 100);
    }
    return;
  }
  sessionRequest = new chrome.cast.SessionRequest('5C3F0A3C'); // Dashcast
  apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, function() {});
  return chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

calcPerma = function() {
  var baseURL, combo, mtvURL, selected, selectedName;
  combo = document.getElementById("loadname");
  selected = combo.options[combo.selectedIndex];
  selectedName = selected.value;
  if ((discordNickname == null) || (selectedName.length === 0)) {
    return "";
  }
  baseURL = window.location.href.split('#')[0].split('?')[0];
  baseURL = baseURL.replace(/play$/, "p");
  mtvURL = baseURL + `/${encodeURIComponent(discordNickname)}/${encodeURIComponent(selectedName)}`;
  return mtvURL;
};

calcShareURL = function(mirror) {
  var baseURL, form, formData, mtvURL, params, querystring;
  baseURL = window.location.href.split('#')[0].split('?')[0];
  if (mirror) {
    baseURL = baseURL.replace(/play$/, "m");
    return baseURL + "/" + encodeURIComponent(soloID);
  }
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.set("solo", "new");
  params.set("filters", params.get("filters").trim());
  params.delete("savename");
  params.delete("loadname");
  querystring = params.toString();
  mtvURL = baseURL + "?" + querystring;
  return mtvURL;
};

startCast = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  console.log("start cast!");
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  if (params.get("mirror") != null) {
    params.delete("filters");
  }
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  baseURL = baseURL.replace(/play$/, "cast");
  mtvURL = baseURL + "?" + querystring;
  console.log(`We're going here: ${mtvURL}`);
  return chrome.cast.requestSession(function(e) {
    castSession = e;
    return castSession.sendMessage(DASHCAST_NAMESPACE, {
      url: mtvURL,
      force: true
    });
  }, onError);
};

calcLabel = async function(pkt) {
  var company;
  console.log("soloLabels(1): ", soloLabels);
  if (soloLabels == null) {
    soloLabels = (await getData("/info/labels"));
  }
  company = null;
  if (soloLabels != null) {
    company = soloLabels[pkt.nickname];
  }
  if (company == null) {
    company = pkt.nickname.charAt(0).toUpperCase() + pkt.nickname.slice(1);
    company += " Records";
  }
  return company;
};

showInfo = async function(pkt) {
  var artist, company, feeling, feelings, html, l, len1, len2, len3, list, m, n, overElement, t, title;
  overElement = document.getElementById("over");
  overElement.style.display = "none";
  for (l = 0, len1 = overTimers.length; l < len1; l++) {
    t = overTimers[l];
    clearTimeout(t);
  }
  overTimers = [];
  artist = pkt.artist;
  artist = artist.replace(/^\s+/, "");
  artist = artist.replace(/\s+$/, "");
  title = pkt.title;
  title = title.replace(/^\s+/, "");
  title = title.replace(/\s+$/, "");
  html = `${artist}\n&#x201C;${title}&#x201D;`;
  if (soloID != null) {
    company = (await calcLabel(pkt));
    html += `\n${company}`;
    if (soloMirror) {
      html += "\nMirror Mode";
    } else {
      html += "\nSolo Mode";
    }
  } else {
    html += `\n${pkt.company}`;
    feelings = [];
    for (m = 0, len2 = opinionOrder.length; m < len2; m++) {
      o = opinionOrder[m];
      if (pkt.opinions[o] != null) {
        feelings.push(o);
      }
    }
    if (feelings.length === 0) {
      html += "\nNo Opinions";
    } else {
      for (n = 0, len3 = feelings.length; n < len3; n++) {
        feeling = feelings[n];
        list = pkt.opinions[feeling];
        list.sort();
        html += `\n${feeling.charAt(0).toUpperCase() + feeling.slice(1)}: ${list.join(', ')}`;
      }
    }
  }
  overElement.innerHTML = html;
  overTimers.push(setTimeout(function() {
    return fadeIn(overElement, 1000);
  }, 3000));
  return overTimers.push(setTimeout(function() {
    return fadeOut(overElement, 1000);
  }, 15000));
};

play = function(pkt, id, startSeconds = null, endSeconds = null) {
  if (player == null) {
    return;
  }
  console.log(`Playing: ${id} (${startSeconds}, ${endSeconds})`);
  lastPlayedID = id;
  player.play(id, startSeconds, endSeconds);
  playing = true;
  return showInfo(pkt);
};

soloInfoBroadcast = function() {
  var info, nextVideo, pkt;
  if ((socket != null) && (soloID != null) && (soloVideo != null) && !soloMirror) {
    nextVideo = null;
    if (soloIndex < soloQueue.length - 1) {
      nextVideo = soloQueue[soloIndex + 1];
    }
    info = {
      current: soloVideo,
      next: nextVideo,
      index: soloIndex + 1,
      count: soloCount
    };
    console.log("Broadcast: ", info);
    pkt = {
      id: soloID,
      cmd: 'info',
      info: info
    };
    socket.emit('solo', pkt);
    return soloCommand(pkt);
  }
};

soloSaveLastWatched = function() {
  return localStorage.setItem('lastwatched', JSON.stringify(soloLastWatched));
};

soloResetLastWatched = function() {
  soloLastWatched = {};
  return soloSaveLastWatched();
};

askForget = function() {
  if (confirm("Are you sure you want to forget your watch history?")) {
    soloResetLastWatched();
    return showList(true);
  }
};

soloCalcBuckets = function(list) {
  var bucket, buckets, e, l, len1, len2, len3, m, n, since, t, tb;
  buckets = [];
  for (l = 0, len1 = TIME_BUCKETS.length; l < len1; l++) {
    tb = TIME_BUCKETS[l];
    buckets.push({
      since: tb.since,
      description: tb.description,
      list: []
    });
  }
  t = now();
  for (m = 0, len2 = list.length; m < len2; m++) {
    e = list[m];
    since = soloLastWatched[e.id];
    if (since != null) {
      since = t - since;
    } else {
      since = NEVER_WATCHED_TIME;
    }
// console.log "id #{e.id} since #{since}"
    for (n = 0, len3 = buckets.length; n < len3; n++) {
      bucket = buckets[n];
      if (bucket.since === 0) {
        // the catchall
        bucket.list.push(e);
        continue;
      }
      if (since < bucket.since) {
        bucket.list.push(e);
        break;
      }
    }
  }
  return buckets.reverse(); // oldest to newest
};

shuffleArray = function(array) {
  var i, j, l, ref1, results1, temp;
  results1 = [];
  for (i = l = ref1 = array.length - 1; l > 0; i = l += -1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    results1.push(array[j] = temp);
  }
  return results1;
};

soloShuffle = function() {
  var bucket, buckets, e, l, len1, len2, m, ref1;
  console.log("Shuffling...");
  soloQueue = [];
  buckets = soloCalcBuckets(soloUnshuffled);
  for (l = 0, len1 = buckets.length; l < len1; l++) {
    bucket = buckets[l];
    shuffleArray(bucket.list);
    ref1 = bucket.list;
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      e = ref1[m];
      soloQueue.push(e);
    }
  }
  return soloIndex = 0;
};

soloPlay = function(delta = 1) {
  if (player == null) {
    return;
  }
  if (soloError || soloMirror) {
    return;
  }
  if ((soloVideo == null) || (soloQueue.length === 0) || ((soloIndex + delta) > (soloQueue.length - 1))) {
    soloShuffle();
  } else {
    soloIndex += delta;
  }
  if (soloIndex < 0) {
    soloIndex = 0;
  }
  soloVideo = soloQueue[soloIndex];
  console.log(soloVideo);
  // debug
  // soloVideo.start = 10
  // soloVideo.end = 50
  // soloVideo.duration = 40
  play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
  soloInfoBroadcast();
  soloLastWatched[soloVideo.id] = now();
  return soloSaveLastWatched();
};

soloTick = function() {
  var sfw, user;
  if (player == null) {
    return;
  }
  console.log("soloTick()");
  if (soloID != null) {
    // Solo!
    if (soloError || soloMirror) {
      return;
    }
    if (!playing && (player != null)) {
      soloPlay();
    }
  } else {
    // Live!
    if (!playing) {
      sendReady();
      return;
    }
    user = qs('user');
    sfw = false;
    if (qs('sfw')) {
      sfw = true;
    }
    return socket.emit('playing', {
      user: user,
      sfw: sfw
    });
  }
};

getData = function(url) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          return resolve(entries);
        } catch (error) {
          return resolve(null);
        }
      }
    };
    xhttp.open("GET", url, true);
    return xhttp.send();
  });
};

mediaButtonsReady = false;

listenForMediaButtons = function() {
  var ref1;
  if (mediaButtonsReady) {
    return;
  }
  if (((ref1 = window.navigator) != null ? ref1.mediaSession : void 0) == null) {
    setTimeout(function() {
      return listenForMediaButtons();
    }, 1000);
    return;
  }
  mediaButtonsReady = true;
  window.navigator.mediaSession.setActionHandler('previoustrack', function() {
    return soloPrev();
  });
  window.navigator.mediaSession.setActionHandler('nexttrack', function() {
    return soloSkip();
  });
  return console.log("Media Buttons ready.");
};

renderPlaylistName = function() {
  if (currentPlaylistName == null) {
    document.getElementById('playlistname').innerHTML = "";
    document.title = "MTV Solo";
    return;
  }
  document.getElementById('playlistname').innerHTML = currentPlaylistName;
  return document.title = `MTV Solo: ${currentPlaylistName}`;
};

sendReady = function() {
  var sfw, user;
  console.log("Ready");
  user = qs('user');
  sfw = false;
  if (qs('sfw')) {
    sfw = true;
  }
  return socket.emit('ready', {
    user: user,
    sfw: sfw
  });
};

trimAllWhitespace = function(e) {
  var newArtist, newTitle, ret;
  ret = false;
  if (e.artist != null) {
    newArtist = e.artist.replace(/^\s*/, "");
    newArtist = e.artist.replace(/\s*$/, "");
    if (e.artist !== newArtist) {
      e.artist = newArtist;
      ret = true;
    }
  }
  if (e.title != null) {
    newTitle = e.title.replace(/^\s*/, "");
    newTitle = e.title.replace(/\s*$/, "");
    if (e.title !== newTitle) {
      e.title = newTitle;
      ret = true;
    }
  }
  return ret;
};

splitArtist = function(e) {
  var artist, matches, title;
  artist = "Unlisted Videos";
  title = e.title;
  if (matches = e.title.match(/^(.+)\s[–-]\s(.+)$/)) {
    artist = matches[1];
    title = matches[2];
  } else if (matches = e.title.match(/^([^"]+)\s"([^"]+)"/)) {
    artist = matches[1];
    title = matches[2];
  }
  title = title.replace(/[\(\[](Official)?\s?(HD)?\s?(Music)?\s(Audio|Video)[\)\]]/i, "");
  title = title.replace(/^\s+/, "");
  title = title.replace(/\s+$/, "");
  if (title.match(/^".+"$/)) {
    title = title.replace(/^"/, "");
    title = title.replace(/"$/, "");
  }
  if (matches = title.match(/^(.+)\s+\(f(ea)?t. (.+)\)$/i)) {
    title = matches[1];
    artist += ` ft. ${matches[3]}`;
  } else if (matches = title.match(/^(.+)\s+f(ea)?t. (.+)$/i)) {
    title = matches[1];
    artist += ` ft. ${matches[3]}`;
  }
  if (matches = artist.match(/^(.+)\s+\(with ([^)]+)\)$/)) {
    artist = `${matches[1]} ft. ${matches[2]}`;
  }
  e.artist = artist;
  e.title = title;
  trimAllWhitespace(e);
};

startHere = async function() {
  var filterString;
  if (player == null) {
    document.getElementById('solovideocontainer').style.display = 'block';
    document.getElementById('outer').classList.add('corner');
    if (isTesla) {
      onTapShow();
    } else {
      document.getElementById('outer').classList.add('fadey');
    }
    player = new Player('#mtv-player');
    player.ended = function(event) {
      return playing = false;
    };
    player.onTitle = function(title) {
      if ((soloVideo != null) && soloVideo.unlisted) {
        console.log(`Updating Title: ${title}`);
        soloVideo.title = title;
        splitArtist(soloVideo);
        renderInfo(soloInfo);
        return showInfo(soloVideo);
      }
    };
    player.play('AB7ykOfAgIA'); // MTV Loading...
  }
  if (soloID != null) {
    // Solo Mode!
    showWatchLink();
    filterString = qs('filters');
    soloUnshuffled = (await filters.generateList(filterString));
    if (soloUnshuffled == null) {
      soloFatalError("Cannot get solo database!");
      return;
    }
    if (soloUnshuffled.length === 0) {
      soloFatalError("No matching songs in the filter!");
      return;
    }
    soloCount = soloUnshuffled.length;
    soloQueue = [];
    soloPlay();
    if (soloMirror && soloID) {
      socket.emit('solo', {
        id: soloID
      });
    }
  } else {
    // Live Mode!
    showWatchLive();
    sendReady();
  }
  if (soloTickTimeout != null) {
    clearInterval(soloTickTimeout);
  }
  soloTickTimeout = setInterval(soloTick, 5000);
  document.getElementById("quickmenu").style.display = "none";
  listenForMediaButtons();
  if (isTesla) {
    return document.getElementById('tapshow').style.display = "block";
  }
};

sprinkleFormQS = function(params) {
  var sfwQS, userQS;
  userQS = qs('user');
  if (userQS != null) {
    params.set('user', userQS);
  }
  sfwQS = qs('sfw');
  if (sfwQS != null) {
    return params.set('sfw', sfwQS);
  }
};

calcPermalink = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.delete("loadname");
  params.delete("savename");
  if (!params.get('solo')) {
    params.delete('solo');
  }
  if (!params.get('filters')) {
    params.delete('filters');
  }
  if (currentPlaylistName != null) {
    params.set("name", currentPlaylistName);
  }
  sprinkleFormQS(params);
  baseURL = window.location.href.split('#')[0].split('?')[0];
  querystring = params.toString();
  if (querystring.length > 0) {
    querystring = "?" + querystring;
  }
  mtvURL = baseURL + querystring;
  return mtvURL;
};

generatePermalink = function() {
  console.log("generatePermalink()");
  return window.location = calcPermalink();
};

formChanged = function() {
  console.log("Form changed!");
  history.replaceState('here', '', calcPermalink());
  return renderPlaylistName();
};

soloSkip = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'skip'
  });
  return soloPlay();
};

soloPrev = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'prev'
  });
  return soloPlay(-1);
};

soloRestart = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'restart'
  });
  return soloPlay(0);
};

soloPause = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'pause'
  });
  return pauseInternal();
};

renderInfo = async function(info, isLive = false) {
  var company, html, idInfo, tagsString;
  if ((info == null) || (info.current == null)) {
    return;
  }
  console.log(info);
  if (isLive) {
    tagsString = null;
    company = (await info.current.company);
  } else {
    tagsString = Object.keys(info.current.tags).sort().join(', ');
    company = (await calcLabel(info.current));
  }
  idInfo = filters.calcIdInfo(info.current.id);
  if (idInfo == null) {
    idInfo = {
      provider: 'youtube',
      url: 'https://example.com'
    };
  }
  html = "";
  if (!isLive) {
    html += `<div class=\"infocounts\">Track ${info.index} / ${info.count}</div>`;
  }
  if (player == null) {
    html += `<div class=\"infothumb\"><a target=\"_blank\" href=\"${idInfo.url}\"><img width=320 height=180 src=\"${info.current.thumb}\"></a></div>`;
  }
  html += `<div class=\"infocurrent infoartist\">${info.current.artist}</div>`;
  html += `<div class=\"infotitle\">\"<a target=\"_blank\" class=\"infotitle\" href=\"${idInfo.url}\">${info.current.title}</a>\"</div>`;
  html += `<div class=\"infolabel\">${company}</div>`;
  if (!isLive) {
    html += `<div class=\"infotags\">&nbsp;${tagsString}&nbsp;</div>`;
    if (info.next != null) {
      html += "<span class=\"infoheading nextvideo\">Next:</span> ";
      html += `<span class=\"infoartist nextvideo\">${info.next.artist}</span>`;
      html += "<span class=\"nextvideo\"> - </span>";
      html += `<span class=\"infotitle nextvideo\">\"${info.next.title}\"</span>`;
    } else {
      html += "<span class=\"infoheading nextvideo\">Next:</span> ";
      html += "<span class=\"inforeshuffle nextvideo\">(...Reshuffle...)</span>";
    }
  }
  return document.getElementById('info').innerHTML = html;
};

clipboardEdit = function() {
  var html;
  html = "<a class=\"cbutto copied\" onclick=\"return false\">Copied!</a>";
  document.getElementById('clipboard').innerHTML = html;
  return setTimeout(function() {
    return renderClipboard();
  }, 2000);
};

renderClipboard = function() {
  var html;
  if ((soloInfo == null) || (soloInfo.current == null)) {
    return;
  }
  html = `<a class=\"cbutto\" data-clipboard-text=\"#mtv edit ${soloInfo.current.id} \" onclick=\"clipboardEdit(); return false\">Edit</a>`;
  document.getElementById('clipboard').innerHTML = html;
  return new Clipboard('.cbutto');
};

onAdd = function() {
  var filterString, html, vid;
  if ((soloInfo != null ? soloInfo.current : void 0) == null) {
    return;
  }
  vid = soloInfo.current;
  filterString = String(document.getElementById('filters').value).trim();
  if (filterString.length > 0) {
    filterString += "\n";
  }
  filterString += `id ${vid.id} # ${vid.artist} - ${vid.title}\n`;
  document.getElementById("filters").value = filterString;
  formChanged();
  html = "<a class=\"cbutto copied\" onclick=\"return false\">Added!</a>";
  document.getElementById('add').innerHTML = html;
  return setTimeout(function() {
    return renderAdd();
  }, 2000);
};

renderAdd = function() {
  var html;
  if ((soloInfo == null) || (soloInfo.current == null) || !addEnabled) {
    return;
  }
  html = "<a class=\"cbutto\" onclick=\"onAdd(); return false\">Add</a>";
  return document.getElementById('add').innerHTML = html;
};

clipboardMirror = function() {
  var html;
  html = "<a class=\"mbutto copied\" onclick=\"return false\">Copied!</a>";
  document.getElementById('cbmirror').innerHTML = html;
  return setTimeout(function() {
    return renderClipboardMirror();
  }, 2000);
};

renderClipboardMirror = function() {
  var html;
  if ((soloInfo == null) || (soloInfo.current == null)) {
    return;
  }
  html = "<a class=\"mbutto\"onclick=\"clipboardMirror(); return false\">Mirror</a>";
  document.getElementById('cbmirror').innerHTML = html;
  return new Clipboard('.mbutto', {
    text: function() {
      return calcShareURL(true);
    }
  });
};

shareClipboard = function(mirror) {
  return document.getElementById('list').innerHTML = `<div class=\"sharecopied\">Copied to clipboard:</div>
<div class=\"shareurl\">${calcShareURL(mirror)}</div>`;
};

sharePerma = function(mirror) {
  return document.getElementById('list').innerHTML = `<div class=\"sharecopied\">Copied to clipboard:</div>
<div class=\"shareurl\">${calcPerma()}</div>`;
};

showList = async function(showBuckets = false) {
  var bucket, buckets, e, filterString, html, l, len1, len2, len3, list, m, n, ref1, t;
  t = now();
  if ((lastShowListTime != null) && ((t - lastShowListTime) < 3)) {
    showBuckets = true;
  }
  document.getElementById('list').innerHTML = "Please wait...";
  filterString = document.getElementById('filters').value;
  list = (await filters.generateList(filterString, true));
  if (list == null) {
    document.getElementById('list').innerHTML = "Error. Sorry.";
    return;
  }
  html = "<div class=\"listcontainer\">";
  if (showBuckets && (list.length > 1)) {
    html += `<div class=\"infocounts\">${list.length} videos: <a class=\"forgetlink\" onclick=\"askForget(); return false;\">[Forget]</a></div>`;
    buckets = soloCalcBuckets(list);
    for (l = 0, len1 = buckets.length; l < len1; l++) {
      bucket = buckets[l];
      if (bucket.list.length < 1) {
        continue;
      }
      html += `<div class=\"infobucket\">Bucket [${bucket.description}] (${bucket.list.length} videos):</div>`;
      ref1 = bucket.list;
      for (m = 0, len2 = ref1.length; m < len2; m++) {
        e = ref1[m];
        html += "<div>";
        html += `<span class=\"infoartist nextvideo\">${e.artist}</span>`;
        html += "<span class=\"nextvideo\"> - </span>";
        html += `<span class=\"infotitle nextvideo\">\"${e.title}\"</span>`;
        html += "</div>\n";
      }
    }
  } else {
    html += `<div class=\"infocounts\">${list.length} videos:</div>`;
    for (n = 0, len3 = list.length; n < len3; n++) {
      e = list[n];
      html += "<div>";
      html += `<span class=\"infoartist nextvideo\">${e.artist}</span>`;
      html += "<span class=\"nextvideo\"> - </span>";
      html += `<span class=\"infotitle nextvideo\">\"${e.title}\"</span>`;
      html += "</div>\n";
    }
  }
  html += "</div>";
  lastShowListTime = t;
  return document.getElementById('list').innerHTML = html;
};

showExport = async function() {
  var e, exportedPlaylists, filterString, ids, l, len1, list, playlistIndex;
  document.getElementById('list').innerHTML = "Please wait...";
  filterString = document.getElementById('filters').value;
  list = (await filters.generateList(filterString, true));
  if (list == null) {
    document.getElementById('list').innerHTML = "Error. Sorry.";
    return;
  }
  exportedPlaylists = "";
  ids = [];
  playlistIndex = 1;
  for (l = 0, len1 = list.length; l < len1; l++) {
    e = list[l];
    if (ids.length >= 50) {
      exportedPlaylists += `<a target="_blank" href="https://www.youtube.com/watch_videos?video_ids=${ids.join(',')}">Exported Playlist ${playlistIndex} (${ids.length})</a><br>`;
      playlistIndex += 1;
      ids = [];
    }
    ids.push(e.id);
  }
  if (ids.length > 0) {
    exportedPlaylists += `<a target="_blank" href="https://www.youtube.com/watch_videos?video_ids=${ids.join(',')}">Exported Playlist ${playlistIndex} (${ids.length})</a><br>`;
  }
  return document.getElementById('list').innerHTML = `<div class=\"listcontainer\">
  ${exportedPlaylists}
</div>`;
};

clearOpinion = function() {
  return document.getElementById('opinions').innerHTML = "";
};

updateOpinion = function(pkt) {
  var capo, classes, html, l;
  html = "";
  for (l = opinionOrder.length - 1; l >= 0; l += -1) {
    o = opinionOrder[l];
    capo = o.charAt(0).toUpperCase() + o.slice(1);
    classes = "obutto";
    if (o === pkt.opinion) {
      classes += " chosen";
    }
    html += `<a class="${classes}" onclick="setOpinion('${o}'); return false;">${capo}</a>`;
  }
  return document.getElementById('opinions').innerHTML = html;
};

setOpinion = function(opinion) {
  if ((discordToken == null) || (lastPlayedID == null)) {
    return;
  }
  return socket.emit('opinion', {
    token: discordToken,
    id: lastPlayedID,
    set: opinion
  });
};

pauseInternal = function() {
  if (player != null) {
    return player.togglePause();
  }
};

soloCommand = async function(pkt) {
  var extraOffset;
  if (pkt.id !== soloID) {
    return;
  }
  console.log("soloCommand: ", pkt);
  switch (pkt.cmd) {
    case 'prev':
      return soloPlay(-1);
    case 'skip':
      return soloPlay(1);
    case 'restart':
      return soloPlay(0);
    case 'pause':
      return pauseInternal();
    case 'info':
      if (pkt.info != null) {
        console.log("NEW INFO!: ", pkt.info);
        soloInfo = pkt.info;
        await renderInfo(soloInfo, false);
        renderAdd();
        renderClipboard();
        renderClipboardMirror();
        if (soloMirror) {
          soloVideo = pkt.info.current;
          if (soloVideo != null) {
            if (player == null) {
              console.log("no player yet");
            }
            extraOffset = 0;
            if ((pkt.info.tu != null) && (pkt.info.tb != null)) {
              extraOffset = 1 + pkt.info.tb - pkt.info.tu;
              console.log(`Extra offset: ${extraOffset}`);
            }
            play(soloVideo, soloVideo.id, soloVideo.start + extraOffset, soloVideo.end);
          }
        }
        clearOpinion();
        if ((discordToken != null) && (soloInfo.current != null) && (soloInfo.current.id != null)) {
          return socket.emit('opinion', {
            token: discordToken,
            id: soloInfo.current.id
          });
        }
      }
  }
};

updateSoloID = function(newSoloID) {
  soloID = newSoloID;
  if (soloID == null) {
    document.body.innerHTML = "ERROR: no solo query parameter";
    return;
  }
  document.getElementById("soloid").value = soloID;
  if (socket != null) {
    return socket.emit('solo', {
      id: soloID
    });
  }
};

loadPlaylist = function() {
  var combo, currentFilters, playlistPayload, selected, selectedName;
  combo = document.getElementById("loadname");
  selected = combo.options[combo.selectedIndex];
  selectedName = selected.value;
  currentFilters = document.getElementById("filters").value;
  if (selectedName == null) {
    return;
  }
  selectedName = selectedName.trim();
  if (selectedName.length < 1) {
    return;
  }
  if (currentFilters.length > 0) {
    if (!confirm(`Are you sure you want to load '${selectedName}'?`)) {
      return;
    }
  }
  discordToken = localStorage.getItem('token');
  playlistPayload = {
    token: discordToken,
    action: "load",
    loadname: selectedName
  };
  currentPlaylistName = selectedName;
  return socket.emit('userplaylist', playlistPayload);
};

deletePlaylist = function() {
  var combo, playlistPayload, selected, selectedName;
  combo = document.getElementById("loadname");
  selected = combo.options[combo.selectedIndex];
  selectedName = selected.value;
  if (selectedName == null) {
    return;
  }
  selectedName = selectedName.trim();
  if (selectedName.length < 1) {
    return;
  }
  if (!confirm(`Are you sure you want to load '${selectedName}'?`)) {
    return;
  }
  discordToken = localStorage.getItem('token');
  playlistPayload = {
    token: discordToken,
    action: "del",
    delname: selectedName
  };
  return socket.emit('userplaylist', playlistPayload);
};

savePlaylist = function() {
  var outputFilters, outputName, playlistPayload;
  outputName = document.getElementById("savename").value;
  outputName = outputName.trim();
  outputFilters = document.getElementById("filters").value;
  if (outputName.length < 1) {
    return;
  }
  if (!confirm(`Are you sure you want to save '${outputName}'?`)) {
    return;
  }
  discordToken = localStorage.getItem('token');
  playlistPayload = {
    token: discordToken,
    action: "save",
    savename: outputName,
    filters: outputFilters
  };
  currentPlaylistName = outputName;
  return socket.emit('userplaylist', playlistPayload);
};

requestUserPlaylists = function() {
  var playlistPayload;
  discordToken = localStorage.getItem('token');
  playlistPayload = {
    token: discordToken,
    action: "list"
  };
  return socket.emit('userplaylist', playlistPayload);
};

receiveUserPlaylist = function(pkt) {
  var combo, isSelected, l, len1, name, ref1;
  console.log("receiveUserPlaylist", pkt);
  if (pkt.list != null) {
    combo = document.getElementById("loadname");
    combo.options.length = 0;
    pkt.list.sort(function(a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    ref1 = pkt.list;
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      name = ref1[l];
      isSelected = name === pkt.selected;
      combo.options[combo.options.length] = new Option(name, name, false, isSelected);
    }
    if (pkt.list.length === 0) {
      combo.options[combo.options.length] = new Option("None", "");
    }
  }
  if (pkt.loadname != null) {
    document.getElementById("savename").value = pkt.loadname;
  }
  if (pkt.filters != null) {
    document.getElementById("filters").value = pkt.filters;
  }
  return formChanged();
};

logout = function() {
  document.getElementById("identity").innerHTML = "Logging out...";
  localStorage.removeItem('token');
  discordToken = null;
  return sendIdentity();
};

sendIdentity = function() {
  var identityPayload;
  discordToken = localStorage.getItem('token');
  identityPayload = {
    token: discordToken
  };
  console.log("Sending identify: ", identityPayload);
  return socket.emit('identify', identityPayload);
};

receiveIdentity = function(pkt) {
  var discordNicknameString, html, loginLink, redirectURL, ref1, ref2;
  console.log("identify response:", pkt);
  if (pkt.disabled) {
    console.log("Discord auth disabled.");
    document.getElementById("identity").innerHTML = "";
    return;
  }
  if ((pkt.tag != null) && (pkt.tag.length > 0)) {
    discordTag = pkt.tag;
    discordNicknameString = "";
    if (pkt.nickname != null) {
      discordNickname = pkt.nickname;
      discordNicknameString = ` (${discordNickname})`;
    }
    html = `${discordTag}${discordNicknameString} - [<a onclick="logout()">Logout</a>]`;
    requestUserPlaylists();
  } else {
    discordTag = null;
    discordNickname = null;
    discordToken = null;
    redirectURL = String(window.location).replace(/#.*$/, "") + "oauth";
    loginLink = `https://discord.com/api/oauth2/authorize?client_id=${window.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`;
    html = `<div class="loginhint">(Login on <a href="/" target="_blank">Dashboard</a>)</div>`;
    if ((ref1 = document.getElementById("loadarea")) != null) {
      ref1.style.display = "none";
    }
    if ((ref2 = document.getElementById("savearea")) != null) {
      ref2.style.display = "none";
    }
  }
  document.getElementById("identity").innerHTML = html;
  if (typeof lastClicked !== "undefined" && lastClicked !== null) {
    return lastClicked();
  }
};

goLive = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.delete("solo");
  params.delete("filters");
  params.delete("savename");
  params.delete("loadname");
  sprinkleFormQS(params);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "?" + querystring;
  console.log(`goLive: ${mtvURL}`);
  return window.location = mtvURL;
};

goSolo = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.set("solo", "new");
  sprinkleFormQS(params);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "?" + querystring;
  console.log(`goSolo: ${mtvURL}`);
  return window.location = mtvURL;
};

window.onload = function() {
  var autostart, qsFilters, soloIDQS, userAgent;
  window.askForget = askForget;
  window.clipboardEdit = clipboardEdit;
  window.clipboardMirror = clipboardMirror;
  window.deletePlaylist = deletePlaylist;
  window.formChanged = formChanged;
  window.goLive = goLive;
  window.goSolo = goSolo;
  window.loadPlaylist = loadPlaylist;
  window.logout = logout;
  window.onAdd = onAdd;
  window.onTapShow = onTapShow;
  window.savePlaylist = savePlaylist;
  window.setOpinion = setOpinion;
  window.shareClipboard = shareClipboard;
  window.sharePerma = sharePerma;
  window.showExport = showExport;
  window.showList = showList;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.showWatchLive = showWatchLive;
  window.soloPause = soloPause;
  window.soloPrev = soloPrev;
  window.soloRestart = soloRestart;
  window.soloSkip = soloSkip;
  window.startCast = startCast;
  window.startHere = startHere;
  autostart = qs('start') != null;
  // addEnabled = qs('add')?
  // console.log "Add Enabled: #{addEnabled}"
  userAgent = navigator.userAgent;
  if ((userAgent != null) && String(userAgent).match(/Tesla\/20/)) {
    isTesla = true;
  }
  if (isTesla) {
    document.getElementById('outer').classList.add('tesla');
  }
  currentPlaylistName = qs('name');
  if (currentPlaylistName != null) {
    document.getElementById("savename").value = currentPlaylistName;
  }
  exportEnabled = qs('export') != null;
  console.log(`Export Enabled: ${exportEnabled}`);
  if (exportEnabled) {
    document.getElementById('export').innerHTML = `<input class="fsub" type="submit" value="Export" onclick="event.preventDefault(); showExport();" title="Export lists into clickable playlists">`;
  }
  soloIDQS = qs('solo');
  if (soloIDQS != null) {
    // initialize solo mode
    updateSoloID(soloIDQS);
    if (launchOpen) {
      showWatchForm();
    } else {
      showWatchLink();
    }
  } else {
    // live mode
    showWatchLive();
  }
  qsFilters = qs('filters');
  if (qsFilters != null) {
    document.getElementById("filters").value = qsFilters;
  }
  soloMirror = qs('mirror') != null;
  document.getElementById("mirror").checked = soloMirror;
  if (soloMirror) {
    document.getElementById('filtersection').style.display = 'none';
    document.getElementById('mirrornote').style.display = 'block';
  }
  socket = io();
  socket.on('connect', function() {
    if (soloID != null) {
      socket.emit('solo', {
        id: soloID
      });
    }
    return sendIdentity();
  });
  socket.on('solo', function(pkt) {
    return soloCommand(pkt);
  });
  socket.on('identify', function(pkt) {
    return receiveIdentity(pkt);
  });
  socket.on('opinion', function(pkt) {
    return updateOpinion(pkt);
  });
  socket.on('userplaylist', function(pkt) {
    return receiveUserPlaylist(pkt);
  });
  socket.on('play', function(pkt) {
    if ((player != null) && (soloID == null)) {
      play(pkt, pkt.id, pkt.start, pkt.end);
      clearOpinion();
      if ((discordToken != null) && (pkt.id != null)) {
        socket.emit('opinion', {
          token: discordToken,
          id: pkt.id
        });
      }
      return renderInfo({
        current: pkt
      }, true);
    }
  });
  prepareCast();
  if (autostart) {
    console.log("AUTO START");
    document.getElementById('info').innerHTML = "AUTO START";
    startHere();
  }
  return new Clipboard('.share', {
    text: function(trigger) {
      var mirror;
      if (trigger.value.match(/Perma/i)) {
        return calcPerma();
      }
      mirror = false;
      if (trigger.value.match(/Mirror/i)) {
        mirror = true;
      }
      return calcShareURL(mirror);
    }
  });
};


},{"../constants":5,"../filters":6,"./player":4,"clipboard":1}],4:[function(require,module,exports){
var Player, filters;

filters = require('../filters');

Player = class Player {
  constructor(domID, showControls = true) {
    var options;
    this.ended = null;
    options = void 0;
    if (!showControls) {
      options = {
        controls: []
      };
    }
    this.plyr = new Plyr(domID, options);
    this.plyr.on('ready', (event) => {
      return this.plyr.play();
    });
    this.plyr.on('ended', (event) => {
      if (this.ended != null) {
        return this.ended();
      }
    });
    this.plyr.on('playing', (event) => {
      if (this.onTitle != null) {
        return this.onTitle(this.plyr.mtvTitle);
      }
    });
  }

  play(id, startSeconds = void 0, endSeconds = void 0) {
    var idInfo, source;
    idInfo = filters.calcIdInfo(id);
    if (idInfo == null) {
      return;
    }
    switch (idInfo.provider) {
      case 'youtube':
        source = {
          src: idInfo.real,
          provider: 'youtube'
        };
        break;
      case 'mtv':
        source = {
          src: `/videos/${idInfo.real}.mp4`,
          type: 'video/mp4'
        };
        break;
      default:
        return;
    }
    if ((startSeconds != null) && (startSeconds > 0)) {
      this.plyr.mtvStart = startSeconds;
    } else {
      this.plyr.mtvStart = void 0;
    }
    if ((endSeconds != null) && (endSeconds > 0)) {
      this.plyr.mtvEnd = endSeconds;
    } else {
      this.plyr.mtvEnd = void 0;
    }
    return this.plyr.source = {
      type: 'video',
      title: 'MTV',
      sources: [source]
    };
  }

  togglePause() {
    if (this.plyr.paused) {
      return this.plyr.play();
    } else {
      return this.plyr.pause();
    }
  }

};

module.exports = Player;


},{"../filters":6}],5:[function(require,module,exports){
module.exports = {
  opinions: {
    love: true,
    like: true,
    meh: true,
    bleh: true,
    hate: true
  },
  goodOpinions: { // don't skip these
    love: true,
    like: true
  },
  weakOpinions: { // skip these if we all agree
    meh: true
  },
  badOpinions: { // skip these
    bleh: true,
    hate: true
  },
  opinionOrder: [
    'love',
    'like',
    'meh',
    'bleh',
    'hate' // always in this specific order
  ]
};


},{}],6:[function(require,module,exports){
var cacheOpinions, calcIdInfo, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, iso8601, now, parseDuration, setServerDatabases;

filterDatabase = null;

filterOpinions = {};

filterServerOpinions = null;

filterGetUserFromNickname = null;

iso8601 = require('iso8601-duration');

now = function() {
  return Math.floor(Date.now() / 1000);
};

parseDuration = function(s) {
  return iso8601.toSeconds(iso8601.parse(s));
};

setServerDatabases = function(db, opinions, getUserFromNickname) {
  filterDatabase = db;
  filterServerOpinions = opinions;
  return filterGetUserFromNickname = getUserFromNickname;
};

getData = function(url) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      var entries;
      if ((this.readyState === 4) && (this.status === 200)) {
        try {
          // Typical action to be performed when the document is ready:
          entries = JSON.parse(xhttp.responseText);
          return resolve(entries);
        } catch (error) {
          return resolve(null);
        }
      }
    };
    xhttp.open("GET", url, true);
    return xhttp.send();
  });
};

cacheOpinions = async function(filterUser) {
  if (filterOpinions[filterUser] == null) {
    filterOpinions[filterUser] = (await getData(`/info/opinions?user=${encodeURIComponent(filterUser)}`));
    if (filterOpinions[filterUser] == null) {
      return soloFatalError(`Cannot get user opinions for ${filterUser}`);
    }
  }
};

generateList = async function(filterString, sortByArtist = false) {
  var allAllowed, command, durationInSeconds, e, end, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, l, len, len1, len2, len3, m, matches, negated, pieces, pipeSplit, property, rawFilters, ref, ref1, since, soloFilters, soloUnlisted, soloUnshuffled, someException, start, substring, title, unlisted;
  soloFilters = null;
  if ((filterString != null) && (filterString.length > 0)) {
    soloFilters = [];
    rawFilters = filterString.split(/\r?\n/);
    for (i = 0, len = rawFilters.length; i < len; i++) {
      filter = rawFilters[i];
      filter = filter.trim();
      if (filter.length > 0) {
        soloFilters.push(filter);
      }
    }
    if (soloFilters.length === 0) {
      // No filters
      soloFilters = null;
    }
  }
  console.log("Filters:", soloFilters);
  if (filterDatabase != null) {
    console.log("Using cached database.");
  } else {
    console.log("Downloading database...");
    filterDatabase = (await getData("/info/playlist"));
    if (filterDatabase == null) {
      return null;
    }
  }
  soloUnlisted = {};
  soloUnshuffled = [];
  if (soloFilters != null) {
    for (id in filterDatabase) {
      e = filterDatabase[id];
      e.allowed = false;
      e.skipped = false;
    }
    allAllowed = true;
    for (j = 0, len1 = soloFilters.length; j < len1; j++) {
      filter = soloFilters[j];
      pieces = filter.split(/ +/);
      if (pieces[0] === "private") {
        continue;
      }
      negated = false;
      property = "allowed";
      if (pieces[0] === "skip") {
        property = "skipped";
        pieces.shift();
      } else if (pieces[0] === "and") {
        property = "skipped";
        negated = !negated;
        pieces.shift();
      }
      if (pieces.length === 0) {
        continue;
      }
      if (property === "allowed") {
        allAllowed = false;
      }
      substring = pieces.slice(1).join(" ");
      idLookup = null;
      if (matches = pieces[0].match(/^!(.+)$/)) {
        negated = !negated;
        pieces[0] = matches[1];
      }
      command = pieces[0].toLowerCase();
      switch (command) {
        case 'artist':
        case 'band':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.artist.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'title':
        case 'song':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.title.toLowerCase().indexOf(s) !== -1;
          };
          break;
        case 'added':
          filterFunc = function(e, s) {
            return e.nickname === s;
          };
          break;
        case 'untagged':
          filterFunc = function(e, s) {
            return Object.keys(e.tags).length === 0;
          };
          break;
        case 'tag':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            return e.tags[s] === true;
          };
          break;
        case 'recent':
        case 'since':
          console.log(`parsing '${substring}'`);
          try {
            durationInSeconds = parseDuration(substring);
          } catch (error) {
            someException = error;
            // soloFatalError("Cannot parse duration: #{substring}")
            console.log(`Duration parsing exception: ${someException}`);
            return null;
          }
          console.log(`Duration [${substring}] - ${durationInSeconds}`);
          since = now() - durationInSeconds;
          filterFunc = function(e, s) {
            return e.added > since;
          };
          break;
        case 'love':
        case 'like':
        case 'bleh':
        case 'hate':
          filterOpinion = command;
          filterUser = substring;
          if (filterServerOpinions) {
            filterUser = filterGetUserFromNickname(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
            };
          } else {
            await cacheOpinions(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
            };
          }
          break;
        case 'none':
          filterOpinion = void 0;
          filterUser = substring;
          if (filterServerOpinions) {
            filterUser = filterGetUserFromNickname(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterServerOpinions[e.id]) != null ? ref[filterUser] : void 0) === filterOpinion;
            };
          } else {
            await cacheOpinions(filterUser);
            filterFunc = function(e, s) {
              var ref;
              return ((ref = filterOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
            };
          }
          break;
        case 'full':
          substring = substring.toLowerCase();
          filterFunc = function(e, s) {
            var full;
            full = e.artist.toLowerCase() + " - " + e.title.toLowerCase();
            return full.indexOf(s) !== -1;
          };
          break;
        case 'id':
        case 'ids':
          idLookup = {};
          ref = pieces.slice(1);
          for (l = 0, len2 = ref.length; l < len2; l++) {
            id = ref[l];
            if (id.match(/^#/)) {
              break;
            }
            idLookup[id] = true;
          }
          filterFunc = function(e, s) {
            return idLookup[e.id];
          };
          break;
        case 'un':
        case 'ul':
        case 'unlisted':
          idLookup = {};
          ref1 = pieces.slice(1);
          for (m = 0, len3 = ref1.length; m < len3; m++) {
            id = ref1[m];
            if (id.match(/^#/)) {
              break;
            }
            if (!id.match(/^youtube_/) && !id.match(/^mtv_/)) {
              id = `youtube_${id}`;
            }
            pipeSplit = id.split(/\|/);
            id = pipeSplit.shift();
            start = -1;
            end = -1;
            if (pipeSplit.length > 0) {
              start = parseInt(pipeSplit.shift());
            }
            if (pipeSplit.length > 0) {
              end = parseInt(pipeSplit.shift());
            }
            title = id;
            if (matches = title.match(/^youtube_(.+)/)) {
              title = matches[1];
            } else if (matches = title.match(/^mtv_(.+)/)) {
              title = matches[1];
            }
            soloUnlisted[id] = {
              id: id,
              artist: 'Unlisted Videos',
              title: title,
              tags: {},
              nickname: 'Unlisted',
              company: 'Unlisted',
              thumb: 'unlisted.png',
              start: start,
              end: end,
              unlisted: true
            };
            // force-skip any pre-existing DB versions of this ID
            if (filterDatabase[id] != null) {
              filterDatabase[id].skipped = true;
            }
            continue;
          }
          break;
        default:
          // skip this filter
          continue;
      }
      if (idLookup != null) {
        for (id in idLookup) {
          e = filterDatabase[id];
          if (e == null) {
            continue;
          }
          isMatch = true;
          if (negated) {
            isMatch = !isMatch;
          }
          if (isMatch) {
            e[property] = true;
          }
        }
      } else {
        for (id in filterDatabase) {
          e = filterDatabase[id];
          isMatch = filterFunc(e, substring);
          if (negated) {
            isMatch = !isMatch;
          }
          if (isMatch) {
            e[property] = true;
          }
        }
      }
    }
    for (id in filterDatabase) {
      e = filterDatabase[id];
      if ((e.allowed || allAllowed) && !e.skipped) {
        soloUnshuffled.push(e);
      }
    }
  } else {
// Queue it all up
    for (id in filterDatabase) {
      e = filterDatabase[id];
      soloUnshuffled.push(e);
    }
  }
  for (k in soloUnlisted) {
    unlisted = soloUnlisted[k];
    soloUnshuffled.push(unlisted);
  }
  if (sortByArtist) {
    soloUnshuffled.sort(function(a, b) {
      if (a.artist.toLowerCase() < b.artist.toLowerCase()) {
        return -1;
      }
      if (a.artist.toLowerCase() > b.artist.toLowerCase()) {
        return 1;
      }
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      }
      if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }
  return soloUnshuffled;
};

calcIdInfo = function(id) {
  var matches, provider, real, url;
  if (!(matches = id.match(/^([a-z]+)_(\S+)/))) {
    console.log(`calcIdInfo: Bad ID: ${id}`);
    return null;
  }
  provider = matches[1];
  real = matches[2];
  switch (provider) {
    case 'youtube':
      url = `https://youtu.be/${real}`;
      break;
    case 'mtv':
      url = `/videos/${real}.mp4`;
      break;
    default:
      console.log(`calcIdInfo: Bad Provider: ${provider}`);
      return null;
  }
  return {
    id: id,
    provider: provider,
    real: real,
    url: url
  };
};

module.exports = {
  setServerDatabases: setServerDatabases,
  generateList: generateList,
  calcIdInfo: calcIdInfo
};


},{"iso8601-duration":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9wbGF5LmNvZmZlZSIsInNyYy9jbGllbnQvcGxheWVyLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFNBQUEsRUFBQSxtQkFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxpQkFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLGdCQUFBLEVBQUEsVUFBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLGVBQUEsRUFBQSxtQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxh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QSxTQUFPO0FBaE1NOztBQWtNZixVQUFBLEdBQWEsUUFBQSxDQUFDLEVBQUQsQ0FBQTtBQUNiLE1BQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxJQUFHLENBQUksQ0FBQSxPQUFBLEdBQVUsRUFBRSxDQUFDLEtBQUgsQ0FBUyxpQkFBVCxDQUFWLENBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsb0JBQUEsQ0FBQSxDQUF1QixFQUF2QixDQUFBLENBQVo7QUFDQSxXQUFPLEtBRlQ7O0VBR0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxDQUFEO0VBQ2xCLElBQUEsR0FBTyxPQUFPLENBQUMsQ0FBRDtBQUVkLFVBQU8sUUFBUDtBQUFBLFNBQ08sU0FEUDtNQUVJLEdBQUEsR0FBTSxDQUFBLGlCQUFBLENBQUEsQ0FBb0IsSUFBcEIsQ0FBQTtBQURIO0FBRFAsU0FHTyxLQUhQO01BSUksR0FBQSxHQUFNLENBQUEsUUFBQSxDQUFBLENBQVcsSUFBWCxDQUFBLElBQUE7QUFESDtBQUhQO01BTUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLDBCQUFBLENBQUEsQ0FBNkIsUUFBN0IsQ0FBQSxDQUFaO0FBQ0EsYUFBTztBQVBYO0FBU0EsU0FBTztJQUNMLEVBQUEsRUFBSSxFQURDO0lBRUwsUUFBQSxFQUFVLFFBRkw7SUFHTCxJQUFBLEVBQU0sSUFIRDtJQUlMLEdBQUEsRUFBSztFQUpBO0FBaEJJOztBQXVCYixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsa0JBQUEsRUFBb0Isa0JBQXBCO0VBQ0EsWUFBQSxFQUFjLFlBRGQ7RUFFQSxVQUFBLEVBQVk7QUFGWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIVxuICogY2xpcGJvYXJkLmpzIHYyLjAuOFxuICogaHR0cHM6Ly9jbGlwYm9hcmRqcy5jb20vXG4gKlxuICogTGljZW5zZWQgTUlUIMKpIFplbm8gUm9jaGFcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24oKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVzX18gPSAoe1xuXG4vKioqLyAxMzQ6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIEVYUE9SVFNcbl9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCB7XG4gIFwiZGVmYXVsdFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIC8qIGJpbmRpbmcgKi8gY2xpcGJvYXJkOyB9XG59KTtcblxuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy90aW55LWVtaXR0ZXIvaW5kZXguanNcbnZhciB0aW55X2VtaXR0ZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI3OSk7XG52YXIgdGlueV9lbWl0dGVyX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKHRpbnlfZW1pdHRlcik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL2dvb2QtbGlzdGVuZXIvc3JjL2xpc3Rlbi5qc1xudmFyIGxpc3RlbiA9IF9fd2VicGFja19yZXF1aXJlX18oMzcwKTtcbnZhciBsaXN0ZW5fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4obGlzdGVuKTtcbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvc2VsZWN0L3NyYy9zZWxlY3QuanNcbnZhciBzcmNfc2VsZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MTcpO1xudmFyIHNlbGVjdF9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubihzcmNfc2VsZWN0KTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQtYWN0aW9uLmpzXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuXG4vKipcbiAqIElubmVyIGNsYXNzIHdoaWNoIHBlcmZvcm1zIHNlbGVjdGlvbiBmcm9tIGVpdGhlciBgdGV4dGAgb3IgYHRhcmdldGBcbiAqIHByb3BlcnRpZXMgYW5kIHRoZW4gZXhlY3V0ZXMgY29weSBvciBjdXQgb3BlcmF0aW9ucy5cbiAqL1xuXG52YXIgQ2xpcGJvYXJkQWN0aW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBDbGlwYm9hcmRBY3Rpb24ob3B0aW9ucykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbGlwYm9hcmRBY3Rpb24pO1xuXG4gICAgdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLmluaXRTZWxlY3Rpb24oKTtcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBiYXNlIHByb3BlcnRpZXMgcGFzc2VkIGZyb20gY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKENsaXBib2FyZEFjdGlvbiwgW3tcbiAgICBrZXk6IFwicmVzb2x2ZU9wdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmFjdGlvbiA9IG9wdGlvbnMuYWN0aW9uO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICAgIHRoaXMuZW1pdHRlciA9IG9wdGlvbnMuZW1pdHRlcjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSBvcHRpb25zLnRleHQ7XG4gICAgICB0aGlzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXI7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWNpZGVzIHdoaWNoIHNlbGVjdGlvbiBzdHJhdGVneSBpcyBnb2luZyB0byBiZSBhcHBsaWVkIGJhc2VkXG4gICAgICogb24gdGhlIGV4aXN0ZW5jZSBvZiBgdGV4dGAgYW5kIGB0YXJnZXRgIHByb3BlcnRpZXMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpbml0U2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRTZWxlY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50ZXh0KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0RmFrZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCkge1xuICAgICAgICB0aGlzLnNlbGVjdFRhcmdldCgpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZmFrZSB0ZXh0YXJlYSBlbGVtZW50LCBzZXRzIGl0cyB2YWx1ZSBmcm9tIGB0ZXh0YCBwcm9wZXJ0eSxcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNyZWF0ZUZha2VFbGVtZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUZha2VFbGVtZW50KCkge1xuICAgICAgdmFyIGlzUlRMID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGlyJykgPT09ICdydGwnO1xuICAgICAgdGhpcy5mYWtlRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7IC8vIFByZXZlbnQgem9vbWluZyBvbiBpT1NcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5mb250U2l6ZSA9ICcxMnB0JzsgLy8gUmVzZXQgYm94IG1vZGVsXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuYm9yZGVyID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wYWRkaW5nID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5tYXJnaW4gPSAnMCc7IC8vIE1vdmUgZWxlbWVudCBvdXQgb2Ygc2NyZWVuIGhvcml6b250YWxseVxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGVbaXNSVEwgPyAncmlnaHQnIDogJ2xlZnQnXSA9ICctOTk5OXB4JzsgLy8gTW92ZSBlbGVtZW50IHRvIHRoZSBzYW1lIHBvc2l0aW9uIHZlcnRpY2FsbHlcblxuICAgICAgdmFyIHlQb3NpdGlvbiA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS50b3AgPSBcIlwiLmNvbmNhdCh5UG9zaXRpb24sIFwicHhcIik7XG4gICAgICB0aGlzLmZha2VFbGVtLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICB0aGlzLmZha2VFbGVtLnZhbHVlID0gdGhpcy50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMuZmFrZUVsZW07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCdzIHRoZSB2YWx1ZSBvZiBmYWtlRWxlbSxcbiAgICAgKiBhbmQgbWFrZXMgYSBzZWxlY3Rpb24gb24gaXQuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdEZha2UoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZmFrZUVsZW0gPSB0aGlzLmNyZWF0ZUZha2VFbGVtZW50KCk7XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZha2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjaykgfHwgdHJ1ZTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGZha2VFbGVtKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKShmYWtlRWxlbSk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT25seSByZW1vdmVzIHRoZSBmYWtlIGVsZW1lbnQgYWZ0ZXIgYW5vdGhlciBjbGljayBldmVudCwgdGhhdCB3YXlcbiAgICAgKiBhIHVzZXIgY2FuIGhpdCBgQ3RybCtDYCB0byBjb3B5IGJlY2F1c2Ugc2VsZWN0aW9uIHN0aWxsIGV4aXN0cy5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlbW92ZUZha2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRmFrZSgpIHtcbiAgICAgIGlmICh0aGlzLmZha2VIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5mYWtlSGFuZGxlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmZha2VFbGVtKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuZmFrZUVsZW0pO1xuICAgICAgICB0aGlzLmZha2VFbGVtID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgY29udGVudCBmcm9tIGVsZW1lbnQgcGFzc2VkIG9uIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0VGFyZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdFRhcmdldCgpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKSh0aGlzLnRhcmdldCk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBjb3B5IG9wZXJhdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjb3B5VGV4dFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5VGV4dCgpIHtcbiAgICAgIHZhciBzdWNjZWVkZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN1Y2NlZWRlZCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuYWN0aW9uKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oYW5kbGVSZXN1bHQoc3VjY2VlZGVkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlyZXMgYW4gZXZlbnQgYmFzZWQgb24gdGhlIGNvcHkgb3BlcmF0aW9uIHJlc3VsdC5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHN1Y2NlZWRlZFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlUmVzdWx0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlc3VsdChzdWNjZWVkZWQpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KHN1Y2NlZWRlZCA/ICdzdWNjZXNzJyA6ICdlcnJvcicsIHtcbiAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgdGV4dDogdGhpcy5zZWxlY3RlZFRleHQsXG4gICAgICAgIHRyaWdnZXI6IHRoaXMudHJpZ2dlcixcbiAgICAgICAgY2xlYXJTZWxlY3Rpb246IHRoaXMuY2xlYXJTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIGZvY3VzIGF3YXkgZnJvbSBgdGFyZ2V0YCBhbmQgYmFjayB0byB0aGUgdHJpZ2dlciwgcmVtb3ZlcyBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNsZWFyU2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudHJpZ2dlcikge1xuICAgICAgICB0aGlzLnRyaWdnZXIuZm9jdXMoKTtcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGBhY3Rpb25gIHRvIGJlIHBlcmZvcm1lZCB3aGljaCBjYW4gYmUgZWl0aGVyICdjb3B5JyBvciAnY3V0Jy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMucmVtb3ZlRmFrZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhY3Rpb25cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCgpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICdjb3B5JztcbiAgICAgIHRoaXMuX2FjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgaWYgKHRoaXMuX2FjdGlvbiAhPT0gJ2NvcHknICYmIHRoaXMuX2FjdGlvbiAhPT0gJ2N1dCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwiYWN0aW9uXCIgdmFsdWUsIHVzZSBlaXRoZXIgXCJjb3B5XCIgb3IgXCJjdXRcIicpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgYWN0aW9uYCBwcm9wZXJ0eS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkgdXNpbmcgYW4gZWxlbWVudFxuICAgICAqIHRoYXQgd2lsbCBiZSBoYXZlIGl0cyBjb250ZW50IGNvcGllZC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwidGFyZ2V0XCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiBfdHlwZW9mKHRhcmdldCkgPT09ICdvYmplY3QnICYmIHRhcmdldC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2NvcHknICYmIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gUGxlYXNlIHVzZSBcInJlYWRvbmx5XCIgaW5zdGVhZCBvZiBcImRpc2FibGVkXCIgYXR0cmlidXRlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAnY3V0JyAmJiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgncmVhZG9ubHknKSB8fCB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgYXR0cmlidXRlLiBZb3UgY2FuXFwndCBjdXQgdGV4dCBmcm9tIGVsZW1lbnRzIHdpdGggXCJyZWFkb25seVwiIG9yIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGVzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIHZhbHVlLCB1c2UgYSB2YWxpZCBFbGVtZW50Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfEhUTUxFbGVtZW50fVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZEFjdGlvbjtcbn0oKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkX2FjdGlvbiA9IChDbGlwYm9hcmRBY3Rpb24pO1xuOy8vIENPTkNBVEVOQVRFRCBNT0RVTEU6IC4vc3JjL2NsaXBib2FyZC5qc1xuZnVuY3Rpb24gY2xpcGJvYXJkX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBjbGlwYm9hcmRfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIGNsaXBib2FyZF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVTdXBlcihEZXJpdmVkKSB7IHZhciBoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpOyByZXR1cm4gZnVuY3Rpb24gX2NyZWF0ZVN1cGVySW50ZXJuYWwoKSB7IHZhciBTdXBlciA9IF9nZXRQcm90b3R5cGVPZihEZXJpdmVkKSwgcmVzdWx0OyBpZiAoaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCkgeyB2YXIgTmV3VGFyZ2V0ID0gX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yOyByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChTdXBlciwgYXJndW1lbnRzLCBOZXdUYXJnZXQpOyB9IGVsc2UgeyByZXN1bHQgPSBTdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9IHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCByZXN1bHQpOyB9OyB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKGNhbGwgJiYgKGNsaXBib2FyZF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHsgcmV0dXJuIGNhbGw7IH0gcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChEYXRlLCBbXSwgZnVuY3Rpb24gKCkge30pKTsgcmV0dXJuIHRydWU7IH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9IH1cblxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTsgfTsgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTsgfVxuXG5cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byByZXRyaWV2ZSBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3VmZml4XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqL1xuXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVWYWx1ZShzdWZmaXgsIGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZSA9IFwiZGF0YS1jbGlwYm9hcmQtXCIuY29uY2F0KHN1ZmZpeCk7XG5cbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG59XG4vKipcbiAqIEJhc2UgY2xhc3Mgd2hpY2ggdGFrZXMgb25lIG9yIG1vcmUgZWxlbWVudHMsIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZW0sXG4gKiBhbmQgaW5zdGFudGlhdGVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2suXG4gKi9cblxuXG52YXIgQ2xpcGJvYXJkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfRW1pdHRlcikge1xuICBfaW5oZXJpdHMoQ2xpcGJvYXJkLCBfRW1pdHRlcik7XG5cbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihDbGlwYm9hcmQpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkKHRyaWdnZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkKTtcblxuICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcyk7XG5cbiAgICBfdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIF90aGlzLmxpc3RlbkNsaWNrKHRyaWdnZXIpO1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIC8qKlxuICAgKiBEZWZpbmVzIGlmIGF0dHJpYnV0ZXMgd291bGQgYmUgcmVzb2x2ZWQgdXNpbmcgaW50ZXJuYWwgc2V0dGVyIGZ1bmN0aW9uc1xuICAgKiBvciBjdXN0b20gZnVuY3Rpb25zIHRoYXQgd2VyZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDbGlwYm9hcmQsIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSB0eXBlb2Ygb3B0aW9ucy5hY3Rpb24gPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLmFjdGlvbiA6IHRoaXMuZGVmYXVsdEFjdGlvbjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdHlwZW9mIG9wdGlvbnMudGFyZ2V0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50YXJnZXQgOiB0aGlzLmRlZmF1bHRUYXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSB0eXBlb2Ygb3B0aW9ucy50ZXh0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50ZXh0IDogdGhpcy5kZWZhdWx0VGV4dDtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gY2xpcGJvYXJkX3R5cGVvZihvcHRpb25zLmNvbnRhaW5lcikgPT09ICdvYmplY3QnID8gb3B0aW9ucy5jb250YWluZXIgOiBkb2N1bWVudC5ib2R5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHBhc3NlZCB0cmlnZ2VyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsaXN0ZW5DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0ZW5DbGljayh0cmlnZ2VyKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdGhpcy5saXN0ZW5lciA9IGxpc3Rlbl9kZWZhdWx0KCkodHJpZ2dlciwgJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMi5vbkNsaWNrKGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBuZXcgYENsaXBib2FyZEFjdGlvbmAgb24gZWFjaCBjbGljayBldmVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJvbkNsaWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgdmFyIHRyaWdnZXIgPSBlLmRlbGVnYXRlVGFyZ2V0IHx8IGUuY3VycmVudFRhcmdldDtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBuZXcgY2xpcGJvYXJkX2FjdGlvbih7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24odHJpZ2dlciksXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQodHJpZ2dlciksXG4gICAgICAgIHRleHQ6IHRoaXMudGV4dCh0cmlnZ2VyKSxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgdHJpZ2dlcjogdHJpZ2dlcixcbiAgICAgICAgZW1pdHRlcjogdGhpc1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYGFjdGlvbmAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdEFjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0QWN0aW9uKHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgnYWN0aW9uJywgdHJpZ2dlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYHRhcmdldGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGFyZ2V0KHRyaWdnZXIpIHtcbiAgICAgIHZhciBzZWxlY3RvciA9IGdldEF0dHJpYnV0ZVZhbHVlKCd0YXJnZXQnLCB0cmlnZ2VyKTtcblxuICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc3VwcG9ydCBvZiB0aGUgZ2l2ZW4gYWN0aW9uLCBvciBhbGwgYWN0aW9ucyBpZiBubyBhY3Rpb24gaXNcbiAgICAgKiBnaXZlbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2FjdGlvbl1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUZXh0XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0ZXh0YCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRUZXh0KHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgndGV4dCcsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5jbGlwYm9hcmRBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XSwgW3tcbiAgICBrZXk6IFwiaXNTdXBwb3J0ZWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNTdXBwb3J0ZWQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbJ2NvcHknLCAnY3V0J107XG4gICAgICB2YXIgYWN0aW9ucyA9IHR5cGVvZiBhY3Rpb24gPT09ICdzdHJpbmcnID8gW2FjdGlvbl0gOiBhY3Rpb247XG4gICAgICB2YXIgc3VwcG9ydCA9ICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkO1xuICAgICAgYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgc3VwcG9ydCA9IHN1cHBvcnQgJiYgISFkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQoYWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN1cHBvcnQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZDtcbn0oKHRpbnlfZW1pdHRlcl9kZWZhdWx0KCkpKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkID0gKENsaXBib2FyZCk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Mjg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbnZhciBET0NVTUVOVF9OT0RFX1RZUEUgPSA5O1xuXG4vKipcbiAqIEEgcG9seWZpbGwgZm9yIEVsZW1lbnQubWF0Y2hlcygpXG4gKi9cbmlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICB2YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuICAgIHByb3RvLm1hdGNoZXMgPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IG1hdGNoZXMgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNsb3Nlc3QgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgd2hpbGUgKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSAhPT0gRE9DVU1FTlRfTk9ERV9UWVBFKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5tYXRjaGVzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvc2VzdDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNDM4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX191bnVzZWRfd2VicGFja19leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBjbG9zZXN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MjgpO1xuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgdmFyIGxpc3RlbmVyRm4gPSBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXJGbiwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRGVsZWdhdGVzIGV2ZW50IHRvIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fFN0cmluZ3xBcnJheX0gW2VsZW1lbnRzXVxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBkZWxlZ2F0ZShlbGVtZW50cywgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgLy8gSGFuZGxlIHRoZSByZWd1bGFyIEVsZW1lbnQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBFbGVtZW50LWxlc3MgdXNhZ2UsIGl0IGRlZmF1bHRzIHRvIGdsb2JhbCBkZWxlZ2F0aW9uXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIFVzZSBgZG9jdW1lbnRgIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIHRoZW4gYXBwbHkgYXJndW1lbnRzXG4gICAgICAgIC8vIFRoaXMgaXMgYSBzaG9ydCB3YXkgdG8gLnVuc2hpZnQgYGFyZ3VtZW50c2Agd2l0aG91dCBydW5uaW5nIGludG8gZGVvcHRpbWl6YXRpb25zXG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYmluZChudWxsLCBkb2N1bWVudCkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgU2VsZWN0b3ItYmFzZWQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzID09PSAnc3RyaW5nJykge1xuICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBBcnJheS1saWtlIGJhc2VkIHVzYWdlXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChlbGVtZW50cywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZShlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEZpbmRzIGNsb3Nlc3QgbWF0Y2ggYW5kIGludm9rZXMgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUuZGVsZWdhdGVUYXJnZXQgPSBjbG9zZXN0KGUudGFyZ2V0LCBzZWxlY3Rvcik7XG5cbiAgICAgICAgaWYgKGUuZGVsZWdhdGVUYXJnZXQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoZWxlbWVudCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVsZWdhdGU7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDg3OTpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgZXhwb3J0cykge1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgSFRNTCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5ub2RlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiB2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XG4gICAgICAgICYmIHZhbHVlLm5vZGVUeXBlID09PSAxO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZUxpc3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcblxuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICYmICh0eXBlID09PSAnW29iamVjdCBOb2RlTGlzdF0nIHx8IHR5cGUgPT09ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXScpXG4gICAgICAgICYmICgnbGVuZ3RoJyBpbiB2YWx1ZSlcbiAgICAgICAgJiYgKHZhbHVlLmxlbmd0aCA9PT0gMCB8fCBleHBvcnRzLm5vZGUodmFsdWVbMF0pKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLnN0cmluZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmc7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLmZuID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdHlwZSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDM3MDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgaXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDg3OSk7XG52YXIgZGVsZWdhdGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzOCk7XG5cbi8qKlxuICogVmFsaWRhdGVzIGFsbCBwYXJhbXMgYW5kIGNhbGxzIHRoZSByaWdodFxuICogbGlzdGVuZXIgZnVuY3Rpb24gYmFzZWQgb24gaXRzIHRhcmdldCB0eXBlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW4odGFyZ2V0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIGlmICghdGFyZ2V0ICYmICF0eXBlICYmICFjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5zdHJpbmcodHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzLmZuKGNhbGxiYWNrKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlyZCBhcmd1bWVudCBtdXN0IGJlIGEgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAoaXMubm9kZSh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5ub2RlTGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlTGlzdCh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMuc3RyaW5nKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlblNlbGVjdG9yKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIFN0cmluZywgSFRNTEVsZW1lbnQsIEhUTUxDb2xsZWN0aW9uLCBvciBOb2RlTGlzdCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgSFRNTCBlbGVtZW50XG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTm9kZShub2RlLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgbGlzdCBvZiBIVE1MIGVsZW1lbnRzXG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fEhUTUxDb2xsZWN0aW9ufSBub2RlTGlzdFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGVMaXN0KG5vZGVMaXN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBzZWxlY3RvclxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuU2VsZWN0b3Ioc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGRlbGVnYXRlKGRvY3VtZW50LmJvZHksIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdGVuO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4MTc6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIHNlbGVjdChlbGVtZW50KSB7XG4gICAgdmFyIHNlbGVjdGVkVGV4dDtcblxuICAgIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbGVtZW50Lm5vZGVOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgIHZhciBpc1JlYWRPbmx5ID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDAsIGVsZW1lbnQudmFsdWUubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyZWFkb25seScpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkVGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxlY3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDI3OTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxuZnVuY3Rpb24gRSAoKSB7XG4gIC8vIEtlZXAgdGhpcyBlbXB0eSBzbyBpdCdzIGVhc2llciB0byBpbmhlcml0IGZyb21cbiAgLy8gKHZpYSBodHRwczovL2dpdGh1Yi5jb20vbGlwc21hY2sgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2lzc3Vlcy8zKVxufVxuXG5FLnByb3RvdHlwZSA9IHtcbiAgb246IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcblxuICAgIChlW25hbWVdIHx8IChlW25hbWVdID0gW10pKS5wdXNoKHtcbiAgICAgIGZuOiBjYWxsYmFjayxcbiAgICAgIGN0eDogY3R4XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvbmNlOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICBzZWxmLm9mZihuYW1lLCBsaXN0ZW5lcik7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxpc3RlbmVyLl8gPSBjYWxsYmFja1xuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGxpc3RlbmVyLCBjdHgpO1xuICB9LFxuXG4gIGVtaXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGRhdGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGV2dEFyciA9ICgodGhpcy5lIHx8ICh0aGlzLmUgPSB7fSkpW25hbWVdIHx8IFtdKS5zbGljZSgpO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuID0gZXZ0QXJyLmxlbmd0aDtcblxuICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBldnRBcnJbaV0uZm4uYXBwbHkoZXZ0QXJyW2ldLmN0eCwgZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb2ZmOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgIHZhciBldnRzID0gZVtuYW1lXTtcbiAgICB2YXIgbGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgaWYgKGV2dHMgJiYgY2FsbGJhY2spIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChldnRzW2ldLmZuICE9PSBjYWxsYmFjayAmJiBldnRzW2ldLmZuLl8gIT09IGNhbGxiYWNrKVxuICAgICAgICAgIGxpdmVFdmVudHMucHVzaChldnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZXZlbnQgZnJvbSBxdWV1ZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrXG4gICAgLy8gU3VnZ2VzdGVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9sYXpkXG4gICAgLy8gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2NvbW1pdC9jNmViZmFhOWJjOTczYjMzZDExMGE4NGEzMDc3NDJiN2NmOTRjOTUzI2NvbW1pdGNvbW1lbnQtNTAyNDkxMFxuXG4gICAgKGxpdmVFdmVudHMubGVuZ3RoKVxuICAgICAgPyBlW25hbWVdID0gbGl2ZUV2ZW50c1xuICAgICAgOiBkZWxldGUgZVtuYW1lXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEU7XG5tb2R1bGUuZXhwb3J0cy5UaW55RW1pdHRlciA9IEU7XG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gXHR9KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcbi8qKioqKiovIFx0XHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcbi8qKioqKiovIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuLyoqKioqKi8gXHRcdFx0XHR9XG4vKioqKioqLyBcdFx0XHR9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfVxuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSByZXR1cm5lZCBmcm9tIHJ1bnRpbWUgc28gZW50cnkgaW5saW5pbmcgaXMgZGlzYWJsZWRcbi8qKioqKiovIFx0Ly8gc3RhcnR1cFxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMTM0KTtcbi8qKioqKiovIH0pKClcbi5kZWZhdWx0O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXHJcbkNsaXBib2FyZCA9IHJlcXVpcmUgJ2NsaXBib2FyZCdcclxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXHJcblBsYXllciA9IHJlcXVpcmUgJy4vcGxheWVyJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxucGxheWVyID0gbnVsbFxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5wbGF5aW5nID0gZmFsc2Vcclxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG5zb2xvUXVldWUgPSBbXVxyXG5zb2xvSW5kZXggPSAwXHJcbnNvbG9UaWNrVGltZW91dCA9IG51bGxcclxuc29sb1ZpZGVvID0gbnVsbFxyXG5zb2xvRXJyb3IgPSBudWxsXHJcbnNvbG9Db3VudCA9IDBcclxuc29sb0xhYmVscyA9IG51bGxcclxuc29sb01pcnJvciA9IGZhbHNlXHJcblxyXG5USU1FX0JVQ0tFVFMgPSBbXHJcbiAgeyBzaW5jZTogMTIwMCwgZGVzY3JpcHRpb246IFwiMjAgbWluXCIgfVxyXG4gIHsgc2luY2U6IDM2MDAsIGRlc2NyaXB0aW9uOiBcIjEgaG91clwiIH1cclxuICB7IHNpbmNlOiAxMDgwMCwgZGVzY3JpcHRpb246IFwiMyBob3Vyc1wiIH1cclxuICB7IHNpbmNlOiAyODgwMCwgZGVzY3JpcHRpb246IFwiOCBob3Vyc1wiIH1cclxuICB7IHNpbmNlOiA4NjQwMCwgZGVzY3JpcHRpb246IFwiMSBkYXlcIiB9XHJcbiAgeyBzaW5jZTogMjU5MjAwLCBkZXNjcmlwdGlvbjogXCIzIGRheXNcIiB9XHJcbiAgeyBzaW5jZTogNjA0ODAwLCBkZXNjcmlwdGlvbjogXCIxIHdlZWtcIiB9XHJcbiAgeyBzaW5jZTogMjQxOTIwMCwgZGVzY3JpcHRpb246IFwiNCB3ZWVrc1wiIH1cclxuICB7IHNpbmNlOiAzMTUzNjAwMCwgZGVzY3JpcHRpb246IFwiMSB5ZWFyXCIgfVxyXG4gIHsgc2luY2U6IDMxNTM2MDAwMCwgZGVzY3JpcHRpb246IFwiMTAgeWVhcnNcIiB9XHJcbiAgeyBzaW5jZTogMzE1MzYwMDAwMCwgZGVzY3JpcHRpb246IFwiMTAwIHllYXJzXCIgfVxyXG4gIHsgc2luY2U6IDAsIGRlc2NyaXB0aW9uOiBcIk5ldmVyIHdhdGNoZWRcIiB9XHJcbl1cclxuTkVWRVJfV0FUQ0hFRF9USU1FID0gVElNRV9CVUNLRVRTW1RJTUVfQlVDS0VUUy5sZW5ndGggLSAyXS5zaW5jZSArIDFcclxuXHJcbmxhc3RTaG93TGlzdFRpbWUgPSBudWxsXHJcbnNvbG9MYXN0V2F0Y2hlZCA9IHt9XHJcbnRyeVxyXG4gIHJhd0pTT04gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbGFzdHdhdGNoZWQnKVxyXG4gIHNvbG9MYXN0V2F0Y2hlZCA9IEpTT04ucGFyc2UocmF3SlNPTilcclxuICBpZiBub3Qgc29sb0xhc3RXYXRjaGVkPyBvciAodHlwZW9mKHNvbG9MYXN0V2F0Y2hlZCkgIT0gJ29iamVjdCcpXHJcbiAgICBjb25zb2xlLmxvZyBcInNvbG9MYXN0V2F0Y2hlZCBpcyBub3QgYW4gb2JqZWN0LCBzdGFydGluZyBmcmVzaC5cIlxyXG4gICAgc29sb0xhc3RXYXRjaGVkID0ge31cclxuICBjb25zb2xlLmxvZyBcIlBhcnNlZCBsb2NhbFN0b3JhZ2UncyBsYXN0d2F0Y2hlZDogXCIsIHNvbG9MYXN0V2F0Y2hlZFxyXG5jYXRjaFxyXG4gIGNvbnNvbGUubG9nIFwiRmFpbGVkIHRvIHBhcnNlIGxvY2FsU3RvcmFnZSdzIGxhc3R3YXRjaGVkLCBzdGFydGluZyBmcmVzaC5cIlxyXG4gIHNvbG9MYXN0V2F0Y2hlZCA9IHt9XHJcblxyXG5sYXN0UGxheWVkSUQgPSBudWxsXHJcblxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5vdmVyVGltZXJzID0gW11cclxuXHJcbkRBU0hDQVNUX05BTUVTUEFDRSA9ICd1cm46eC1jYXN0OmVzLm9mZmQuZGFzaGNhc3QnXHJcblxyXG5zb2xvSUQgPSBudWxsXHJcbnNvbG9JbmZvID0ge31cclxuXHJcbmRpc2NvcmRUb2tlbiA9IG51bGxcclxuZGlzY29yZFRhZyA9IG51bGxcclxuZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG5cclxuY2FzdEF2YWlsYWJsZSA9IGZhbHNlXHJcbmNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxubGF1bmNoT3BlbiA9IGZhbHNlICMgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsYXVuY2gnKSA9PSBcInRydWVcIilcclxuIyBjb25zb2xlLmxvZyBcImxhdW5jaE9wZW46ICN7bGF1bmNoT3Blbn1cIlxyXG5cclxuYWRkRW5hYmxlZCA9IHRydWVcclxuZXhwb3J0RW5hYmxlZCA9IGZhbHNlXHJcblxyXG5pc1Rlc2xhID0gZmFsc2VcclxudGFwVGltZW91dCA9IG51bGxcclxuXHJcbmN1cnJlbnRQbGF5bGlzdE5hbWUgPSBudWxsXHJcblxyXG5vcGluaW9uT3JkZXIgPSBbXVxyXG5mb3IgbyBpbiBjb25zdGFudHMub3Bpbmlvbk9yZGVyXHJcbiAgb3Bpbmlvbk9yZGVyLnB1c2ggb1xyXG5vcGluaW9uT3JkZXIucHVzaCgnbm9uZScpXHJcblxyXG5yYW5kb21TdHJpbmcgPSAtPlxyXG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KVxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhZ2VFcG9jaCA9IG5vdygpXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxub25UYXBTaG93ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIm9uVGFwU2hvd1wiXHJcblxyXG4gIG91dGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJylcclxuICBpZiB0YXBUaW1lb3V0P1xyXG4gICAgY2xlYXJUaW1lb3V0KHRhcFRpbWVvdXQpXHJcbiAgICB0YXBUaW1lb3V0ID0gbnVsbFxyXG4gICAgb3V0ZXIuc3R5bGUub3BhY2l0eSA9IDBcclxuICBlbHNlXHJcbiAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgdGFwVGltZW91dCA9IHNldFRpbWVvdXQgLT5cclxuICAgICAgY29uc29sZS5sb2cgXCJ0YXBUaW1lb3V0IVwiXHJcbiAgICAgIG91dGVyLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgICAgIHRhcFRpbWVvdXQgPSBudWxsXHJcbiAgICAsIDEwMDAwXHJcblxyXG5cclxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxyXG4gIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMFxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA+PSAxXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMVxyXG5cclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTEpXCJcclxuXHJcbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAxXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgLT0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5IDw9IDBcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAwXHJcbiAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGl2ZScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXljb250cm9scycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLmZvY3VzKClcclxuICBsYXVuY2hPcGVuID0gdHJ1ZVxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAndHJ1ZScpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Y29udHJvbHMnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGxhdW5jaE9wZW4gPSBmYWxzZVxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAnZmFsc2UnKVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbnNob3dXYXRjaExpdmUgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWNvbnRyb2xzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGxhdW5jaE9wZW4gPSBmYWxzZVxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAnZmFsc2UnKVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbm9uSW5pdFN1Y2Nlc3MgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcclxuICBjYXN0QXZhaWxhYmxlID0gdHJ1ZVxyXG5cclxub25FcnJvciA9IChtZXNzYWdlKSAtPlxyXG5cclxuc2Vzc2lvbkxpc3RlbmVyID0gKGUpIC0+XHJcbiAgY2FzdFNlc3Npb24gPSBlXHJcblxyXG5zZXNzaW9uVXBkYXRlTGlzdGVuZXIgPSAoaXNBbGl2ZSkgLT5cclxuICBpZiBub3QgaXNBbGl2ZVxyXG4gICAgY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5wcmVwYXJlQ2FzdCA9IC0+XHJcbiAgaWYgbm90IGNocm9tZS5jYXN0IG9yIG5vdCBjaHJvbWUuY2FzdC5pc0F2YWlsYWJsZVxyXG4gICAgaWYgbm93KCkgPCAocGFnZUVwb2NoICsgMTApICMgZ2l2ZSB1cCBhZnRlciAxMCBzZWNvbmRzXHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxyXG4gIGFwaUNvbmZpZyA9IG5ldyBjaHJvbWUuY2FzdC5BcGlDb25maWcgc2Vzc2lvblJlcXVlc3QsIHNlc3Npb25MaXN0ZW5lciwgLT5cclxuICBjaHJvbWUuY2FzdC5pbml0aWFsaXplKGFwaUNvbmZpZywgb25Jbml0U3VjY2Vzcywgb25FcnJvcilcclxuXHJcbmNhbGNQZXJtYSA9IC0+XHJcbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcclxuICBpZiBub3QgZGlzY29yZE5pY2tuYW1lPyBvciAoc2VsZWN0ZWROYW1lLmxlbmd0aCA9PSAwKVxyXG4gICAgcmV0dXJuIFwiXCJcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgYmFzZVVSTCA9IGJhc2VVUkwucmVwbGFjZSgvcGxheSQvLCBcInBcIilcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCIvI3tlbmNvZGVVUklDb21wb25lbnQoZGlzY29yZE5pY2tuYW1lKX0vI3tlbmNvZGVVUklDb21wb25lbnQoc2VsZWN0ZWROYW1lKX1cIlxyXG4gIHJldHVybiBtdHZVUkxcclxuXHJcbmNhbGNTaGFyZVVSTCA9IChtaXJyb3IpIC0+XHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGlmIG1pcnJvclxyXG4gICAgYmFzZVVSTCA9IGJhc2VVUkwucmVwbGFjZSgvcGxheSQvLCBcIm1cIilcclxuICAgIHJldHVybiBiYXNlVVJMICsgXCIvXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc29sb0lEKVxyXG5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHBhcmFtcy5zZXQoXCJzb2xvXCIsIFwibmV3XCIpXHJcbiAgcGFyYW1zLnNldChcImZpbHRlcnNcIiwgcGFyYW1zLmdldChcImZpbHRlcnNcIikudHJpbSgpKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJsb2FkbmFtZVwiKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCI/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIHJldHVybiBtdHZVUkxcclxuXHJcbnN0YXJ0Q2FzdCA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJzdGFydCBjYXN0IVwiXHJcblxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgaWYgcGFyYW1zLmdldChcIm1pcnJvclwiKT9cclxuICAgIHBhcmFtcy5kZWxldGUoXCJmaWx0ZXJzXCIpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwiY2FzdFwiKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxyXG4gICAgY2FzdFNlc3Npb24gPSBlXHJcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXHJcbiAgLCBvbkVycm9yXHJcblxyXG5jYWxjTGFiZWwgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwic29sb0xhYmVscygxKTogXCIsIHNvbG9MYWJlbHNcclxuICBpZiBub3Qgc29sb0xhYmVscz9cclxuICAgIHNvbG9MYWJlbHMgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vbGFiZWxzXCIpXHJcbiAgY29tcGFueSA9IG51bGxcclxuICBpZiBzb2xvTGFiZWxzP1xyXG4gICAgY29tcGFueSA9IHNvbG9MYWJlbHNbcGt0Lm5pY2tuYW1lXVxyXG4gIGlmIG5vdCBjb21wYW55P1xyXG4gICAgY29tcGFueSA9IHBrdC5uaWNrbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBrdC5uaWNrbmFtZS5zbGljZSgxKVxyXG4gICAgY29tcGFueSArPSBcIiBSZWNvcmRzXCJcclxuICByZXR1cm4gY29tcGFueVxyXG5cclxuc2hvd0luZm8gPSAocGt0KSAtPlxyXG4gIG92ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdmVyXCIpXHJcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZm9yIHQgaW4gb3ZlclRpbWVyc1xyXG4gICAgY2xlYXJUaW1lb3V0KHQpXHJcbiAgb3ZlclRpbWVycyA9IFtdXHJcblxyXG4gIGFydGlzdCA9IHBrdC5hcnRpc3RcclxuICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgdGl0bGUgPSBwa3QudGl0bGVcclxuICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcclxuICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICBodG1sID0gXCIje2FydGlzdH1cXG4mI3gyMDFDOyN7dGl0bGV9JiN4MjAxRDtcIlxyXG4gIGlmIHNvbG9JRD9cclxuICAgIGNvbXBhbnkgPSBhd2FpdCBjYWxjTGFiZWwocGt0KVxyXG4gICAgaHRtbCArPSBcIlxcbiN7Y29tcGFueX1cIlxyXG4gICAgaWYgc29sb01pcnJvclxyXG4gICAgICBodG1sICs9IFwiXFxuTWlycm9yIE1vZGVcIlxyXG4gICAgZWxzZVxyXG4gICAgICBodG1sICs9IFwiXFxuU29sbyBNb2RlXCJcclxuICBlbHNlXHJcbiAgICBodG1sICs9IFwiXFxuI3twa3QuY29tcGFueX1cIlxyXG4gICAgZmVlbGluZ3MgPSBbXVxyXG4gICAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyXHJcbiAgICAgIGlmIHBrdC5vcGluaW9uc1tvXT9cclxuICAgICAgICBmZWVsaW5ncy5wdXNoIG9cclxuICAgIGlmIGZlZWxpbmdzLmxlbmd0aCA9PSAwXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5ObyBPcGluaW9uc1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGZvciBmZWVsaW5nIGluIGZlZWxpbmdzXHJcbiAgICAgICAgbGlzdCA9IHBrdC5vcGluaW9uc1tmZWVsaW5nXVxyXG4gICAgICAgIGxpc3Quc29ydCgpXHJcbiAgICAgICAgaHRtbCArPSBcIlxcbiN7ZmVlbGluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZlZWxpbmcuc2xpY2UoMSl9OiAje2xpc3Quam9pbignLCAnKX1cIlxyXG4gIG92ZXJFbGVtZW50LmlubmVySFRNTCA9IGh0bWxcclxuXHJcbiAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgIGZhZGVJbihvdmVyRWxlbWVudCwgMTAwMClcclxuICAsIDMwMDBcclxuICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgZmFkZU91dChvdmVyRWxlbWVudCwgMTAwMClcclxuICAsIDE1MDAwXHJcblxyXG5wbGF5ID0gKHBrdCwgaWQsIHN0YXJ0U2Vjb25kcyA9IG51bGwsIGVuZFNlY29uZHMgPSBudWxsKSAtPlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICByZXR1cm5cclxuICBjb25zb2xlLmxvZyBcIlBsYXlpbmc6ICN7aWR9ICgje3N0YXJ0U2Vjb25kc30sICN7ZW5kU2Vjb25kc30pXCJcclxuXHJcbiAgbGFzdFBsYXllZElEID0gaWRcclxuICBwbGF5ZXIucGxheShpZCwgc3RhcnRTZWNvbmRzLCBlbmRTZWNvbmRzKVxyXG4gIHBsYXlpbmcgPSB0cnVlXHJcblxyXG4gIHNob3dJbmZvKHBrdClcclxuXHJcbnNvbG9JbmZvQnJvYWRjYXN0ID0gLT5cclxuICBpZiBzb2NrZXQ/IGFuZCBzb2xvSUQ/IGFuZCBzb2xvVmlkZW8/IGFuZCBub3Qgc29sb01pcnJvclxyXG4gICAgbmV4dFZpZGVvID0gbnVsbFxyXG4gICAgaWYgc29sb0luZGV4IDwgc29sb1F1ZXVlLmxlbmd0aCAtIDFcclxuICAgICAgbmV4dFZpZGVvID0gc29sb1F1ZXVlW3NvbG9JbmRleCsxXVxyXG4gICAgaW5mbyA9XHJcbiAgICAgIGN1cnJlbnQ6IHNvbG9WaWRlb1xyXG4gICAgICBuZXh0OiBuZXh0VmlkZW9cclxuICAgICAgaW5kZXg6IHNvbG9JbmRleCArIDFcclxuICAgICAgY291bnQ6IHNvbG9Db3VudFxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwiQnJvYWRjYXN0OiBcIiwgaW5mb1xyXG4gICAgcGt0ID0ge1xyXG4gICAgICBpZDogc29sb0lEXHJcbiAgICAgIGNtZDogJ2luZm8nXHJcbiAgICAgIGluZm86IGluZm9cclxuICAgIH1cclxuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgcGt0XHJcbiAgICBzb2xvQ29tbWFuZChwa3QpXHJcblxyXG5zb2xvU2F2ZUxhc3RXYXRjaGVkID0gLT5cclxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGFzdHdhdGNoZWQnLCBKU09OLnN0cmluZ2lmeShzb2xvTGFzdFdhdGNoZWQpKVxyXG5cclxuc29sb1Jlc2V0TGFzdFdhdGNoZWQgPSAtPlxyXG4gIHNvbG9MYXN0V2F0Y2hlZCA9IHt9XHJcbiAgc29sb1NhdmVMYXN0V2F0Y2hlZCgpXHJcblxyXG5hc2tGb3JnZXQgPSAtPlxyXG4gIGlmIGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZm9yZ2V0IHlvdXIgd2F0Y2ggaGlzdG9yeT9cIilcclxuICAgIHNvbG9SZXNldExhc3RXYXRjaGVkKClcclxuICAgIHNob3dMaXN0KHRydWUpXHJcblxyXG5zb2xvQ2FsY0J1Y2tldHMgPSAobGlzdCkgLT5cclxuICBidWNrZXRzID0gW11cclxuICBmb3IgdGIgaW4gVElNRV9CVUNLRVRTXHJcbiAgICBidWNrZXRzLnB1c2gge1xyXG4gICAgICBzaW5jZTogdGIuc2luY2VcclxuICAgICAgZGVzY3JpcHRpb246IHRiLmRlc2NyaXB0aW9uXHJcbiAgICAgIGxpc3Q6IFtdXHJcbiAgICB9XHJcblxyXG4gIHQgPSBub3coKVxyXG4gIGZvciBlIGluIGxpc3RcclxuICAgIHNpbmNlID0gc29sb0xhc3RXYXRjaGVkW2UuaWRdXHJcbiAgICBpZiBzaW5jZT9cclxuICAgICAgc2luY2UgPSB0IC0gc2luY2VcclxuICAgIGVsc2VcclxuICAgICAgc2luY2UgPSBORVZFUl9XQVRDSEVEX1RJTUVcclxuICAgICMgY29uc29sZS5sb2cgXCJpZCAje2UuaWR9IHNpbmNlICN7c2luY2V9XCJcclxuICAgIGZvciBidWNrZXQgaW4gYnVja2V0c1xyXG4gICAgICBpZiBidWNrZXQuc2luY2UgPT0gMFxyXG4gICAgICAgICMgdGhlIGNhdGNoYWxsXHJcbiAgICAgICAgYnVja2V0Lmxpc3QucHVzaCBlXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgc2luY2UgPCBidWNrZXQuc2luY2VcclxuICAgICAgICBidWNrZXQubGlzdC5wdXNoIGVcclxuICAgICAgICBicmVha1xyXG4gIHJldHVybiBidWNrZXRzLnJldmVyc2UoKSAjIG9sZGVzdCB0byBuZXdlc3RcclxuXHJcbnNodWZmbGVBcnJheSA9IChhcnJheSkgLT5cclxuICBmb3IgaSBpbiBbYXJyYXkubGVuZ3RoIC0gMSAuLi4gMF0gYnkgLTFcclxuICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKVxyXG4gICAgdGVtcCA9IGFycmF5W2ldXHJcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdXHJcbiAgICBhcnJheVtqXSA9IHRlbXBcclxuXHJcbnNvbG9TaHVmZmxlID0gLT5cclxuICBjb25zb2xlLmxvZyBcIlNodWZmbGluZy4uLlwiXHJcblxyXG4gIHNvbG9RdWV1ZSA9IFtdXHJcbiAgYnVja2V0cyA9IHNvbG9DYWxjQnVja2V0cyhzb2xvVW5zaHVmZmxlZClcclxuICBmb3IgYnVja2V0IGluIGJ1Y2tldHNcclxuICAgIHNodWZmbGVBcnJheShidWNrZXQubGlzdClcclxuICAgIGZvciBlIGluIGJ1Y2tldC5saXN0XHJcbiAgICAgIHNvbG9RdWV1ZS5wdXNoIGVcclxuICBzb2xvSW5kZXggPSAwXHJcblxyXG5zb2xvUGxheSA9IChkZWx0YSA9IDEpIC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIHJldHVyblxyXG4gIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHNvbG9WaWRlbz8gb3IgKHNvbG9RdWV1ZS5sZW5ndGggPT0gMCkgb3IgKChzb2xvSW5kZXggKyBkZWx0YSkgPiAoc29sb1F1ZXVlLmxlbmd0aCAtIDEpKVxyXG4gICAgc29sb1NodWZmbGUoKVxyXG4gIGVsc2VcclxuICAgIHNvbG9JbmRleCArPSBkZWx0YVxyXG5cclxuICBpZiBzb2xvSW5kZXggPCAwXHJcbiAgICBzb2xvSW5kZXggPSAwXHJcbiAgc29sb1ZpZGVvID0gc29sb1F1ZXVlW3NvbG9JbmRleF1cclxuXHJcbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXHJcblxyXG4gICMgZGVidWdcclxuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXHJcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcclxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXHJcblxyXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuICBzb2xvSW5mb0Jyb2FkY2FzdCgpXHJcblxyXG4gIHNvbG9MYXN0V2F0Y2hlZFtzb2xvVmlkZW8uaWRdID0gbm93KClcclxuICBzb2xvU2F2ZUxhc3RXYXRjaGVkKClcclxuXHJcblxyXG5zb2xvVGljayA9IC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8hXHJcbiAgICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxyXG4gICAgICByZXR1cm5cclxuICAgIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICAgIHNvbG9QbGF5KClcclxuICAgICAgcmV0dXJuXHJcblxyXG4gIGVsc2VcclxuICAgICMgTGl2ZSFcclxuXHJcbiAgICBpZiBub3QgcGxheWluZ1xyXG4gICAgICBzZW5kUmVhZHkoKVxyXG4gICAgICByZXR1cm5cclxuICAgIHVzZXIgPSBxcygndXNlcicpXHJcbiAgICBzZncgPSBmYWxzZVxyXG4gICAgaWYgcXMoJ3NmdycpXHJcbiAgICAgIHNmdyA9IHRydWVcclxuICAgIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XHJcblxyXG5nZXREYXRhID0gKHVybCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG5tZWRpYUJ1dHRvbnNSZWFkeSA9IGZhbHNlXHJcbmxpc3RlbkZvck1lZGlhQnV0dG9ucyA9IC0+XHJcbiAgaWYgbWVkaWFCdXR0b25zUmVhZHlcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3Qgd2luZG93Lm5hdmlnYXRvcj8ubWVkaWFTZXNzaW9uP1xyXG4gICAgc2V0VGltZW91dCgtPlxyXG4gICAgICBsaXN0ZW5Gb3JNZWRpYUJ1dHRvbnMoKVxyXG4gICAgLCAxMDAwKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIG1lZGlhQnV0dG9uc1JlYWR5ID0gdHJ1ZVxyXG4gIHdpbmRvdy5uYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIgJ3ByZXZpb3VzdHJhY2snLCAtPlxyXG4gICAgc29sb1ByZXYoKVxyXG4gIHdpbmRvdy5uYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIgJ25leHR0cmFjaycsIC0+XHJcbiAgICBzb2xvU2tpcCgpXHJcbiAgY29uc29sZS5sb2cgXCJNZWRpYSBCdXR0b25zIHJlYWR5LlwiXHJcblxyXG5yZW5kZXJQbGF5bGlzdE5hbWUgPSAtPlxyXG4gIGlmIG5vdCBjdXJyZW50UGxheWxpc3ROYW1lP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlsaXN0bmFtZScpLmlubmVySFRNTCA9IFwiXCJcclxuICAgIGRvY3VtZW50LnRpdGxlID0gXCJNVFYgU29sb1wiXHJcbiAgICByZXR1cm5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWxpc3RuYW1lJykuaW5uZXJIVE1MID0gY3VycmVudFBsYXlsaXN0TmFtZVxyXG4gIGRvY3VtZW50LnRpdGxlID0gXCJNVFYgU29sbzogI3tjdXJyZW50UGxheWxpc3ROYW1lfVwiXHJcblxyXG5zZW5kUmVhZHkgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiUmVhZHlcIlxyXG4gIHVzZXIgPSBxcygndXNlcicpXHJcbiAgc2Z3ID0gZmFsc2VcclxuICBpZiBxcygnc2Z3JylcclxuICAgIHNmdyA9IHRydWVcclxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbnRyaW1BbGxXaGl0ZXNwYWNlID0gKGUpIC0+XHJcbiAgcmV0ID0gZmFsc2VcclxuICBpZiBlLmFydGlzdD9cclxuICAgIG5ld0FydGlzdCA9IGUuYXJ0aXN0LnJlcGxhY2UoL15cXHMqLywgXCJcIilcclxuICAgIG5ld0FydGlzdCA9IGUuYXJ0aXN0LnJlcGxhY2UoL1xccyokLywgXCJcIilcclxuICAgIGlmIGUuYXJ0aXN0ICE9IG5ld0FydGlzdFxyXG4gICAgICBlLmFydGlzdCA9IG5ld0FydGlzdFxyXG4gICAgICByZXQgPSB0cnVlXHJcbiAgaWYgZS50aXRsZT9cclxuICAgIG5ld1RpdGxlID0gZS50aXRsZS5yZXBsYWNlKC9eXFxzKi8sIFwiXCIpXHJcbiAgICBuZXdUaXRsZSA9IGUudGl0bGUucmVwbGFjZSgvXFxzKiQvLCBcIlwiKVxyXG4gICAgaWYgZS50aXRsZSAhPSBuZXdUaXRsZVxyXG4gICAgICBlLnRpdGxlID0gbmV3VGl0bGVcclxuICAgICAgcmV0ID0gdHJ1ZVxyXG4gIHJldHVybiByZXRcclxuXHJcbnNwbGl0QXJ0aXN0ID0gKGUpIC0+XHJcbiAgYXJ0aXN0ID0gXCJVbmxpc3RlZCBWaWRlb3NcIlxyXG4gIHRpdGxlID0gZS50aXRsZVxyXG4gIGlmIG1hdGNoZXMgPSBlLnRpdGxlLm1hdGNoKC9eKC4rKVxcc1vigJMtXVxccyguKykkLylcclxuICAgIGFydGlzdCA9IG1hdGNoZXNbMV1cclxuICAgIHRpdGxlID0gbWF0Y2hlc1syXVxyXG4gIGVsc2UgaWYgbWF0Y2hlcyA9IGUudGl0bGUubWF0Y2goL14oW15cIl0rKVxcc1wiKFteXCJdKylcIi8pXHJcbiAgICBhcnRpc3QgPSBtYXRjaGVzWzFdXHJcbiAgICB0aXRsZSA9IG1hdGNoZXNbMl1cclxuXHJcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9bXFwoXFxbXShPZmZpY2lhbCk/XFxzPyhIRCk/XFxzPyhNdXNpYyk/XFxzKEF1ZGlvfFZpZGVvKVtcXClcXF1dL2ksIFwiXCIpXHJcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgaWYgdGl0bGUubWF0Y2goL15cIi4rXCIkLylcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlwiLywgXCJcIilcclxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXCIkLywgXCJcIilcclxuXHJcbiAgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eKC4rKVxccytcXChmKGVhKT90LiAoLispXFwpJC9pKVxyXG4gICAgdGl0bGUgPSBtYXRjaGVzWzFdXHJcbiAgICBhcnRpc3QgKz0gXCIgZnQuICN7bWF0Y2hlc1szXX1cIlxyXG4gIGVsc2UgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eKC4rKVxccytmKGVhKT90LiAoLispJC9pKVxyXG4gICAgdGl0bGUgPSBtYXRjaGVzWzFdXHJcbiAgICBhcnRpc3QgKz0gXCIgZnQuICN7bWF0Y2hlc1szXX1cIlxyXG5cclxuICBpZiBtYXRjaGVzID0gYXJ0aXN0Lm1hdGNoKC9eKC4rKVxccytcXCh3aXRoIChbXildKylcXCkkLylcclxuICAgIGFydGlzdCA9IFwiI3ttYXRjaGVzWzFdfSBmdC4gI3ttYXRjaGVzWzJdfVwiXHJcblxyXG4gIGUuYXJ0aXN0ID0gYXJ0aXN0XHJcbiAgZS50aXRsZSA9IHRpdGxlXHJcbiAgdHJpbUFsbFdoaXRlc3BhY2UoZSlcclxuICByZXR1cm5cclxuXHJcbnN0YXJ0SGVyZSA9IC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb2xvdmlkZW9jb250YWluZXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJykuY2xhc3NMaXN0LmFkZCgnY29ybmVyJylcclxuICAgIGlmIGlzVGVzbGFcclxuICAgICAgb25UYXBTaG93KClcclxuICAgIGVsc2VcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJykuY2xhc3NMaXN0LmFkZCgnZmFkZXknKVxyXG5cclxuICAgIHBsYXllciA9IG5ldyBQbGF5ZXIoJyNtdHYtcGxheWVyJylcclxuICAgIHBsYXllci5lbmRlZCA9IChldmVudCkgLT5cclxuICAgICAgcGxheWluZyA9IGZhbHNlXHJcbiAgICBwbGF5ZXIub25UaXRsZSA9ICh0aXRsZSkgLT5cclxuICAgICAgaWYgc29sb1ZpZGVvPyBhbmQgc29sb1ZpZGVvLnVubGlzdGVkXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJVcGRhdGluZyBUaXRsZTogI3t0aXRsZX1cIlxyXG4gICAgICAgIHNvbG9WaWRlby50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgc3BsaXRBcnRpc3Qoc29sb1ZpZGVvKVxyXG4gICAgICAgIHJlbmRlckluZm8oc29sb0luZm8pXHJcbiAgICAgICAgc2hvd0luZm8oc29sb1ZpZGVvKVxyXG5cclxuICAgIHBsYXllci5wbGF5KCdBQjd5a09mQWdJQScpICMgTVRWIExvYWRpbmcuLi5cclxuXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgIyBTb2xvIE1vZGUhXHJcblxyXG4gICAgc2hvd1dhdGNoTGluaygpXHJcblxyXG4gICAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxyXG4gICAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXHJcbiAgICBpZiBub3Qgc29sb1Vuc2h1ZmZsZWQ/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBpZiBzb2xvVW5zaHVmZmxlZC5sZW5ndGggPT0gMFxyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXHJcbiAgICAgIHJldHVyblxyXG4gICAgc29sb0NvdW50ID0gc29sb1Vuc2h1ZmZsZWQubGVuZ3RoXHJcblxyXG4gICAgc29sb1F1ZXVlID0gW11cclxuICAgIHNvbG9QbGF5KClcclxuICAgIGlmIHNvbG9NaXJyb3IgYW5kIHNvbG9JRFxyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgZWxzZVxyXG4gICAgIyBMaXZlIE1vZGUhXHJcbiAgICBzaG93V2F0Y2hMaXZlKClcclxuICAgIHNlbmRSZWFkeSgpXHJcblxyXG4gIGlmIHNvbG9UaWNrVGltZW91dD9cclxuICAgIGNsZWFySW50ZXJ2YWwoc29sb1RpY2tUaW1lb3V0KVxyXG4gIHNvbG9UaWNrVGltZW91dCA9IHNldEludGVydmFsKHNvbG9UaWNrLCA1MDAwKVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1aWNrbWVudVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBsaXN0ZW5Gb3JNZWRpYUJ1dHRvbnMoKVxyXG5cclxuICBpZiBpc1Rlc2xhXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFwc2hvdycpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcclxuXHJcbnNwcmlua2xlRm9ybVFTID0gKHBhcmFtcykgLT5cclxuICB1c2VyUVMgPSBxcygndXNlcicpXHJcbiAgaWYgdXNlclFTP1xyXG4gICAgcGFyYW1zLnNldCgndXNlcicsIHVzZXJRUylcclxuICBzZndRUyA9IHFzKCdzZncnKVxyXG4gIGlmIHNmd1FTP1xyXG4gICAgcGFyYW1zLnNldCgnc2Z3Jywgc2Z3UVMpXHJcblxyXG5jYWxjUGVybWFsaW5rID0gLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJsb2FkbmFtZVwiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxyXG4gIGlmIG5vdCBwYXJhbXMuZ2V0KCdzb2xvJylcclxuICAgIHBhcmFtcy5kZWxldGUoJ3NvbG8nKVxyXG4gIGlmIG5vdCBwYXJhbXMuZ2V0KCdmaWx0ZXJzJylcclxuICAgIHBhcmFtcy5kZWxldGUoJ2ZpbHRlcnMnKVxyXG4gIGlmIGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBwYXJhbXMuc2V0KFwibmFtZVwiLCBjdXJyZW50UGxheWxpc3ROYW1lKVxyXG4gIHNwcmlua2xlRm9ybVFTKHBhcmFtcylcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGlmIHF1ZXJ5c3RyaW5nLmxlbmd0aCA+IDBcclxuICAgIHF1ZXJ5c3RyaW5nID0gXCI/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBxdWVyeXN0cmluZ1xyXG4gIHJldHVybiBtdHZVUkxcclxuXHJcbmdlbmVyYXRlUGVybWFsaW5rID0gLT5cclxuICBjb25zb2xlLmxvZyBcImdlbmVyYXRlUGVybWFsaW5rKClcIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IGNhbGNQZXJtYWxpbmsoKVxyXG5cclxuZm9ybUNoYW5nZWQgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiRm9ybSBjaGFuZ2VkIVwiXHJcbiAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoJ2hlcmUnLCAnJywgY2FsY1Blcm1hbGluaygpKVxyXG4gIHJlbmRlclBsYXlsaXN0TmFtZSgpXHJcblxyXG5zb2xvU2tpcCA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdza2lwJ1xyXG4gIH1cclxuICBzb2xvUGxheSgpXHJcblxyXG5zb2xvUHJldiA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwcmV2J1xyXG4gIH1cclxuICBzb2xvUGxheSgtMSlcclxuXHJcbnNvbG9SZXN0YXJ0ID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3Jlc3RhcnQnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KDApXHJcblxyXG5zb2xvUGF1c2UgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAncGF1c2UnXHJcbiAgfVxyXG4gIHBhdXNlSW50ZXJuYWwoKVxyXG5cclxucmVuZGVySW5mbyA9IChpbmZvLCBpc0xpdmUgPSBmYWxzZSkgLT5cclxuICBpZiBub3QgaW5mbz8gb3Igbm90IGluZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBpbmZvXHJcblxyXG4gIGlmIGlzTGl2ZVxyXG4gICAgdGFnc1N0cmluZyA9IG51bGxcclxuICAgIGNvbXBhbnkgPSBhd2FpdCBpbmZvLmN1cnJlbnQuY29tcGFueVxyXG4gIGVsc2VcclxuICAgIHRhZ3NTdHJpbmcgPSBPYmplY3Qua2V5cyhpbmZvLmN1cnJlbnQudGFncykuc29ydCgpLmpvaW4oJywgJylcclxuICAgIGNvbXBhbnkgPSBhd2FpdCBjYWxjTGFiZWwoaW5mby5jdXJyZW50KVxyXG5cclxuICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oaW5mby5jdXJyZW50LmlkKVxyXG4gIGlmIG5vdCBpZEluZm8/XHJcbiAgICBpZEluZm8gPVxyXG4gICAgICBwcm92aWRlcjogJ3lvdXR1YmUnXHJcbiAgICAgIHVybDogJ2h0dHBzOi8vZXhhbXBsZS5jb20nXHJcblxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgaWYgbm90IGlzTGl2ZVxyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jb3VudHNcXFwiPlRyYWNrICN7aW5mby5pbmRleH0gLyAje2luZm8uY291bnR9PC9kaXY+XCJcclxuXHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvdGh1bWJcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCIje2lkSW5mby51cmx9XFxcIj48aW1nIHdpZHRoPTMyMCBoZWlnaHQ9MTgwIHNyYz1cXFwiI3tpbmZvLmN1cnJlbnQudGh1bWJ9XFxcIj48L2E+PC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2N1cnJlbnQgaW5mb2FydGlzdFxcXCI+I3tpbmZvLmN1cnJlbnQuYXJ0aXN0fTwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBjbGFzcz1cXFwiaW5mb3RpdGxlXFxcIiBocmVmPVxcXCIje2lkSW5mby51cmx9XFxcIj4je2luZm8uY3VycmVudC50aXRsZX08L2E+XFxcIjwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9sYWJlbFxcXCI+I3tjb21wYW55fTwvZGl2PlwiXHJcbiAgaWYgbm90IGlzTGl2ZVxyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90YWdzXFxcIj4mbmJzcDsje3RhZ3NTdHJpbmd9Jm5ic3A7PC9kaXY+XCJcclxuICAgIGlmIGluZm8ubmV4dD9cclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvaGVhZGluZyBuZXh0dmlkZW9cXFwiPk5leHQ6PC9zcGFuPiBcIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je2luZm8ubmV4dC5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tpbmZvLm5leHQudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gICAgZWxzZVxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3Jlc2h1ZmZsZSBuZXh0dmlkZW9cXFwiPiguLi5SZXNodWZmbGUuLi4pPC9zcGFuPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8nKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5jbGlwYm9hcmRFZGl0ID0gLT5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5Db3BpZWQhPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBib2FyZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJDbGlwYm9hcmQoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQ2xpcGJvYXJkID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG9cXFwiIGRhdGEtY2xpcGJvYXJkLXRleHQ9XFxcIiNtdHYgZWRpdCAje3NvbG9JbmZvLmN1cnJlbnQuaWR9IFxcXCIgb25jbGljaz1cXFwiY2xpcGJvYXJkRWRpdCgpOyByZXR1cm4gZmFsc2VcXFwiPkVkaXQ8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcGJvYXJkJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIG5ldyBDbGlwYm9hcmQoJy5jYnV0dG8nKVxyXG5cclxub25BZGQgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICB2aWQgPSBzb2xvSW5mby5jdXJyZW50XHJcbiAgZmlsdGVyU3RyaW5nID0gU3RyaW5nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWUpLnRyaW0oKVxyXG4gIGlmIGZpbHRlclN0cmluZy5sZW5ndGggPiAwXHJcbiAgICBmaWx0ZXJTdHJpbmcgKz0gXCJcXG5cIlxyXG4gIGZpbHRlclN0cmluZyArPSBcImlkICN7dmlkLmlkfSAjICN7dmlkLmFydGlzdH0gLSAje3ZpZC50aXRsZX1cXG5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IGZpbHRlclN0cmluZ1xyXG4gIGZvcm1DaGFuZ2VkKClcclxuXHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+QWRkZWQhPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJBZGQoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQWRkID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50PyBvciBub3QgYWRkRW5hYmxlZFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG9cXFwiIG9uY2xpY2s9XFxcIm9uQWRkKCk7IHJldHVybiBmYWxzZVxcXCI+QWRkPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZCcpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbmNsaXBib2FyZE1pcnJvciA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcIm1idXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYm1pcnJvcicpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJDbGlwYm9hcmRNaXJyb3IoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQ2xpcGJvYXJkTWlycm9yID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJtYnV0dG9cXFwib25jbGljaz1cXFwiY2xpcGJvYXJkTWlycm9yKCk7IHJldHVybiBmYWxzZVxcXCI+TWlycm9yPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIG5ldyBDbGlwYm9hcmQgJy5tYnV0dG8nLCB7XHJcbiAgICB0ZXh0OiAtPlxyXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKHRydWUpXHJcbiAgfVxyXG5cclxuc2hhcmVDbGlwYm9hcmQgPSAobWlycm9yKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZWNvcGllZFxcXCI+Q29waWVkIHRvIGNsaXBib2FyZDo8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNTaGFyZVVSTChtaXJyb3IpfTwvZGl2PlxyXG4gIFwiXCJcIlxyXG5cclxuc2hhcmVQZXJtYSA9IChtaXJyb3IpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJlY29waWVkXFxcIj5Db3BpZWQgdG8gY2xpcGJvYXJkOjwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmV1cmxcXFwiPiN7Y2FsY1Blcm1hKCl9PC9kaXY+XHJcbiAgXCJcIlwiXHJcblxyXG5zaG93TGlzdCA9IChzaG93QnVja2V0cyA9IGZhbHNlKSAtPlxyXG4gIHQgPSBub3coKVxyXG4gIGlmIGxhc3RTaG93TGlzdFRpbWU/IGFuZCAoKHQgLSBsYXN0U2hvd0xpc3RUaW1lKSA8IDMpXHJcbiAgICBzaG93QnVja2V0cyA9IHRydWVcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlBsZWFzZSB3YWl0Li4uXCJcclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMnKS52YWx1ZVxyXG4gIGxpc3QgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcsIHRydWUpXHJcbiAgaWYgbm90IGxpc3Q/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiRXJyb3IuIFNvcnJ5LlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwibGlzdGNvbnRhaW5lclxcXCI+XCJcclxuXHJcbiAgaWYgc2hvd0J1Y2tldHMgJiYgKGxpc3QubGVuZ3RoID4gMSlcclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj4je2xpc3QubGVuZ3RofSB2aWRlb3M6IDxhIGNsYXNzPVxcXCJmb3JnZXRsaW5rXFxcIiBvbmNsaWNrPVxcXCJhc2tGb3JnZXQoKTsgcmV0dXJuIGZhbHNlO1xcXCI+W0ZvcmdldF08L2E+PC9kaXY+XCJcclxuICAgIGJ1Y2tldHMgPSBzb2xvQ2FsY0J1Y2tldHMobGlzdClcclxuICAgIGZvciBidWNrZXQgaW4gYnVja2V0c1xyXG4gICAgICBpZiBidWNrZXQubGlzdC5sZW5ndGggPCAxXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9idWNrZXRcXFwiPkJ1Y2tldCBbI3tidWNrZXQuZGVzY3JpcHRpb259XSAoI3tidWNrZXQubGlzdC5sZW5ndGh9IHZpZGVvcyk6PC9kaXY+XCJcclxuICAgICAgZm9yIGUgaW4gYnVja2V0Lmxpc3RcclxuICAgICAgICBodG1sICs9IFwiPGRpdj5cIlxyXG4gICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxyXG4gICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3RpdGxlIG5leHR2aWRlb1xcXCI+XFxcIiN7ZS50aXRsZX1cXFwiPC9zcGFuPlwiXHJcbiAgICAgICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXHJcbiAgZWxzZVxyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jb3VudHNcXFwiPiN7bGlzdC5sZW5ndGh9IHZpZGVvczo8L2Rpdj5cIlxyXG4gICAgZm9yIGUgaW4gbGlzdFxyXG4gICAgICBodG1sICs9IFwiPGRpdj5cIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je2UuYXJ0aXN0fTwvc3Bhbj5cIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3RpdGxlIG5leHR2aWRlb1xcXCI+XFxcIiN7ZS50aXRsZX1cXFwiPC9zcGFuPlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8L2Rpdj5cXG5cIlxyXG5cclxuICBodG1sICs9IFwiPC9kaXY+XCJcclxuXHJcbiAgbGFzdFNob3dMaXN0VGltZSA9IHRcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbnNob3dFeHBvcnQgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJQbGVhc2Ugd2FpdC4uLlwiXHJcblxyXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWVcclxuICBsaXN0ID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nLCB0cnVlKVxyXG4gIGlmIG5vdCBsaXN0P1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIkVycm9yLiBTb3JyeS5cIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGV4cG9ydGVkUGxheWxpc3RzID0gXCJcIlxyXG4gIGlkcyA9IFtdXHJcbiAgcGxheWxpc3RJbmRleCA9IDFcclxuICBmb3IgZSBpbiBsaXN0XHJcbiAgICBpZiBpZHMubGVuZ3RoID49IDUwXHJcbiAgICAgIGV4cG9ydGVkUGxheWxpc3RzICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaF92aWRlb3M/dmlkZW9faWRzPSN7aWRzLmpvaW4oJywnKX1cIj5FeHBvcnRlZCBQbGF5bGlzdCAje3BsYXlsaXN0SW5kZXh9ICgje2lkcy5sZW5ndGh9KTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgICBwbGF5bGlzdEluZGV4ICs9IDFcclxuICAgICAgaWRzID0gW11cclxuICAgIGlkcy5wdXNoIGUuaWRcclxuICBpZiBpZHMubGVuZ3RoID4gMFxyXG4gICAgZXhwb3J0ZWRQbGF5bGlzdHMgKz0gXCJcIlwiXHJcbiAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaF92aWRlb3M/dmlkZW9faWRzPSN7aWRzLmpvaW4oJywnKX1cIj5FeHBvcnRlZCBQbGF5bGlzdCAje3BsYXlsaXN0SW5kZXh9ICgje2lkcy5sZW5ndGh9KTwvYT48YnI+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XFxcImxpc3Rjb250YWluZXJcXFwiPlxyXG4gICAgICAje2V4cG9ydGVkUGxheWxpc3RzfVxyXG4gICAgPC9kaXY+XHJcbiAgXCJcIlwiXHJcblxyXG5jbGVhck9waW5pb24gPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbnVwZGF0ZU9waW5pb24gPSAocGt0KSAtPlxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyIGJ5IC0xXHJcbiAgICBjYXBvID0gby5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG8uc2xpY2UoMSlcclxuICAgIGNsYXNzZXMgPSBcIm9idXR0b1wiXHJcbiAgICBpZiBvID09IHBrdC5vcGluaW9uXHJcbiAgICAgIGNsYXNzZXMgKz0gXCIgY2hvc2VuXCJcclxuICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVwiI3tjbGFzc2VzfVwiIG9uY2xpY2s9XCJzZXRPcGluaW9uKCcje299Jyk7IHJldHVybiBmYWxzZTtcIj4je2NhcG99PC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuc2V0T3BpbmlvbiA9IChvcGluaW9uKSAtPlxyXG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBsYXN0UGxheWVkSUQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBsYXN0UGxheWVkSUQsIHNldDogb3BpbmlvbiB9XHJcblxyXG5wYXVzZUludGVybmFsID0gLT5cclxuICBpZiBwbGF5ZXI/XHJcbiAgICBwbGF5ZXIudG9nZ2xlUGF1c2UoKVxyXG5cclxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxyXG4gIGlmIHBrdC5pZCAhPSBzb2xvSURcclxuICAgIHJldHVyblxyXG4gIGNvbnNvbGUubG9nIFwic29sb0NvbW1hbmQ6IFwiLCBwa3RcclxuICBzd2l0Y2ggcGt0LmNtZFxyXG4gICAgd2hlbiAncHJldidcclxuICAgICAgc29sb1BsYXkoLTEpXHJcbiAgICB3aGVuICdza2lwJ1xyXG4gICAgICBzb2xvUGxheSgxKVxyXG4gICAgd2hlbiAncmVzdGFydCdcclxuICAgICAgc29sb1BsYXkoMClcclxuICAgIHdoZW4gJ3BhdXNlJ1xyXG4gICAgICBwYXVzZUludGVybmFsKClcclxuICAgIHdoZW4gJ2luZm8nXHJcbiAgICAgIGlmIHBrdC5pbmZvP1xyXG4gICAgICAgIGNvbnNvbGUubG9nIFwiTkVXIElORk8hOiBcIiwgcGt0LmluZm9cclxuICAgICAgICBzb2xvSW5mbyA9IHBrdC5pbmZvXHJcbiAgICAgICAgYXdhaXQgcmVuZGVySW5mbyhzb2xvSW5mbywgZmFsc2UpXHJcbiAgICAgICAgcmVuZGVyQWRkKClcclxuICAgICAgICByZW5kZXJDbGlwYm9hcmQoKVxyXG4gICAgICAgIHJlbmRlckNsaXBib2FyZE1pcnJvcigpXHJcbiAgICAgICAgaWYgc29sb01pcnJvclxyXG4gICAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxyXG4gICAgICAgICAgaWYgc29sb1ZpZGVvP1xyXG4gICAgICAgICAgICBpZiBub3QgcGxheWVyP1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXHJcbiAgICAgICAgICAgIGV4dHJhT2Zmc2V0ID0gMFxyXG4gICAgICAgICAgICBpZiBwa3QuaW5mby50dT8gYW5kIHBrdC5pbmZvLnRiP1xyXG4gICAgICAgICAgICAgIGV4dHJhT2Zmc2V0ID0gMSArIHBrdC5pbmZvLnRiIC0gcGt0LmluZm8udHVcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIkV4dHJhIG9mZnNldDogI3tleHRyYU9mZnNldH1cIlxyXG4gICAgICAgICAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQgKyBleHRyYU9mZnNldCwgc29sb1ZpZGVvLmVuZClcclxuICAgICAgICBjbGVhck9waW5pb24oKVxyXG4gICAgICAgIGlmIGRpc2NvcmRUb2tlbj8gYW5kIHNvbG9JbmZvLmN1cnJlbnQ/IGFuZCBzb2xvSW5mby5jdXJyZW50LmlkP1xyXG4gICAgICAgICAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBzb2xvSW5mby5jdXJyZW50LmlkIH1cclxuXHJcbnVwZGF0ZVNvbG9JRCA9IChuZXdTb2xvSUQpIC0+XHJcbiAgc29sb0lEID0gbmV3U29sb0lEXHJcbiAgaWYgbm90IHNvbG9JRD9cclxuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogbm8gc29sbyBxdWVyeSBwYXJhbWV0ZXJcIlxyXG4gICAgcmV0dXJuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzb2xvaWRcIikudmFsdWUgPSBzb2xvSURcclxuICBpZiBzb2NrZXQ/XHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcblxyXG5sb2FkUGxheWxpc3QgPSAtPlxyXG4gIGNvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkbmFtZVwiKVxyXG4gIHNlbGVjdGVkID0gY29tYm8ub3B0aW9uc1tjb21iby5zZWxlY3RlZEluZGV4XVxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkLnZhbHVlXHJcbiAgY3VycmVudEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWVcclxuICBpZiBub3Qgc2VsZWN0ZWROYW1lP1xyXG4gICAgcmV0dXJuXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWROYW1lLnRyaW0oKVxyXG4gIGlmIHNlbGVjdGVkTmFtZS5sZW5ndGggPCAxXHJcbiAgICByZXR1cm5cclxuICBpZiBjdXJyZW50RmlsdGVycy5sZW5ndGggPiAwXHJcbiAgICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2FkICcje3NlbGVjdGVkTmFtZX0nP1wiKVxyXG4gICAgICByZXR1cm5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJsb2FkXCJcclxuICAgIGxvYWRuYW1lOiBzZWxlY3RlZE5hbWVcclxuICB9XHJcbiAgY3VycmVudFBsYXlsaXN0TmFtZSA9IHNlbGVjdGVkTmFtZVxyXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcclxuXHJcbmRlbGV0ZVBsYXlsaXN0ID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGlmIG5vdCBzZWxlY3RlZE5hbWU/XHJcbiAgICByZXR1cm5cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZE5hbWUudHJpbSgpXHJcbiAgaWYgc2VsZWN0ZWROYW1lLmxlbmd0aCA8IDFcclxuICAgIHJldHVyblxyXG4gIGlmIG5vdCBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxvYWQgJyN7c2VsZWN0ZWROYW1lfSc/XCIpXHJcbiAgICByZXR1cm5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJkZWxcIlxyXG4gICAgZGVsbmFtZTogc2VsZWN0ZWROYW1lXHJcbiAgfVxyXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcclxuXHJcbnNhdmVQbGF5bGlzdCA9IC0+XHJcbiAgb3V0cHV0TmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZW5hbWVcIikudmFsdWVcclxuICBvdXRwdXROYW1lID0gb3V0cHV0TmFtZS50cmltKClcclxuICBvdXRwdXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlXHJcbiAgaWYgb3V0cHV0TmFtZS5sZW5ndGggPCAxXHJcbiAgICByZXR1cm5cclxuICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzYXZlICcje291dHB1dE5hbWV9Jz9cIilcclxuICAgIHJldHVyblxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcInNhdmVcIlxyXG4gICAgc2F2ZW5hbWU6IG91dHB1dE5hbWVcclxuICAgIGZpbHRlcnM6IG91dHB1dEZpbHRlcnNcclxuICB9XHJcbiAgY3VycmVudFBsYXlsaXN0TmFtZSA9IG91dHB1dE5hbWVcclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5yZXF1ZXN0VXNlclBsYXlsaXN0cyA9IC0+XHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwibGlzdFwiXHJcbiAgfVxyXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcclxuXHJcbnJlY2VpdmVVc2VyUGxheWxpc3QgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwicmVjZWl2ZVVzZXJQbGF5bGlzdFwiLCBwa3RcclxuICBpZiBwa3QubGlzdD9cclxuICAgIGNvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkbmFtZVwiKVxyXG4gICAgY29tYm8ub3B0aW9ucy5sZW5ndGggPSAwXHJcbiAgICBwa3QubGlzdC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBhLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLnRvTG93ZXJDYXNlKCkpXHJcbiAgICBmb3IgbmFtZSBpbiBwa3QubGlzdFxyXG4gICAgICBpc1NlbGVjdGVkID0gKG5hbWUgPT0gcGt0LnNlbGVjdGVkKVxyXG4gICAgICBjb21iby5vcHRpb25zW2NvbWJvLm9wdGlvbnMubGVuZ3RoXSA9IG5ldyBPcHRpb24obmFtZSwgbmFtZSwgZmFsc2UsIGlzU2VsZWN0ZWQpXHJcbiAgICBpZiBwa3QubGlzdC5sZW5ndGggPT0gMFxyXG4gICAgICBjb21iby5vcHRpb25zW2NvbWJvLm9wdGlvbnMubGVuZ3RoXSA9IG5ldyBPcHRpb24oXCJOb25lXCIsIFwiXCIpXHJcbiAgaWYgcGt0LmxvYWRuYW1lP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlbmFtZVwiKS52YWx1ZSA9IHBrdC5sb2FkbmFtZVxyXG4gIGlmIHBrdC5maWx0ZXJzP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gcGt0LmZpbHRlcnNcclxuICBmb3JtQ2hhbmdlZCgpXHJcblxyXG5sb2dvdXQgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXHJcbiAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJylcclxuICBkaXNjb3JkVG9rZW4gPSBudWxsXHJcbiAgc2VuZElkZW50aXR5KClcclxuXHJcbnNlbmRJZGVudGl0eSA9IC0+XHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBpZGVudGl0eVBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nIFwiU2VuZGluZyBpZGVudGlmeTogXCIsIGlkZW50aXR5UGF5bG9hZFxyXG4gIHNvY2tldC5lbWl0ICdpZGVudGlmeScsIGlkZW50aXR5UGF5bG9hZFxyXG5cclxucmVjZWl2ZUlkZW50aXR5ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcImlkZW50aWZ5IHJlc3BvbnNlOlwiLCBwa3RcclxuICBpZiBwa3QuZGlzYWJsZWRcclxuICAgIGNvbnNvbGUubG9nIFwiRGlzY29yZCBhdXRoIGRpc2FibGVkLlwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBwa3QudGFnPyBhbmQgKHBrdC50YWcubGVuZ3RoID4gMClcclxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXHJcbiAgICBkaXNjb3JkTmlja25hbWVTdHJpbmcgPSBcIlwiXHJcbiAgICBpZiBwa3Qubmlja25hbWU/XHJcbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxyXG4gICAgICBkaXNjb3JkTmlja25hbWVTdHJpbmcgPSBcIiAoI3tkaXNjb3JkTmlja25hbWV9KVwiXHJcbiAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cclxuICAgIFwiXCJcIlxyXG4gICAgcmVxdWVzdFVzZXJQbGF5bGlzdHMoKVxyXG4gIGVsc2VcclxuICAgIGRpc2NvcmRUYWcgPSBudWxsXHJcbiAgICBkaXNjb3JkTmlja25hbWUgPSBudWxsXHJcbiAgICBkaXNjb3JkVG9rZW4gPSBudWxsXHJcblxyXG4gICAgcmVkaXJlY3RVUkwgPSBTdHJpbmcod2luZG93LmxvY2F0aW9uKS5yZXBsYWNlKC8jLiokLywgXCJcIikgKyBcIm9hdXRoXCJcclxuICAgIGxvZ2luTGluayA9IFwiaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL2F1dGhvcml6ZT9jbGllbnRfaWQ9I3t3aW5kb3cuQ0xJRU5UX0lEfSZyZWRpcmVjdF91cmk9I3tlbmNvZGVVUklDb21wb25lbnQocmVkaXJlY3RVUkwpfSZyZXNwb25zZV90eXBlPWNvZGUmc2NvcGU9aWRlbnRpZnlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICA8ZGl2IGNsYXNzPVwibG9naW5oaW50XCI+KExvZ2luIG9uIDxhIGhyZWY9XCIvXCIgdGFyZ2V0PVwiX2JsYW5rXCI+RGFzaGJvYXJkPC9hPik8L2Rpdj5cclxuICAgIFwiXCJcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkYXJlYVwiKT8uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVhcmVhXCIpPy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcclxuICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgIGxhc3RDbGlja2VkKClcclxuXHJcbmdvTGl2ZSA9IC0+XHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBwYXJhbXMuZGVsZXRlKFwic29sb1wiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJmaWx0ZXJzXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNhdmVuYW1lXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXHJcbiAgc3ByaW5rbGVGb3JtUVMocGFyYW1zKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcImdvTGl2ZTogI3ttdHZVUkx9XCJcclxuICB3aW5kb3cubG9jYXRpb24gPSBtdHZVUkxcclxuXHJcbmdvU29sbyA9IC0+XHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBwYXJhbXMuc2V0KFwic29sb1wiLCBcIm5ld1wiKVxyXG4gIHNwcmlua2xlRm9ybVFTKHBhcmFtcylcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJnb1NvbG86ICN7bXR2VVJMfVwiXHJcbiAgd2luZG93LmxvY2F0aW9uID0gbXR2VVJMXHJcblxyXG53aW5kb3cub25sb2FkID0gLT5cclxuICB3aW5kb3cuYXNrRm9yZ2V0ID0gYXNrRm9yZ2V0XHJcbiAgd2luZG93LmNsaXBib2FyZEVkaXQgPSBjbGlwYm9hcmRFZGl0XHJcbiAgd2luZG93LmNsaXBib2FyZE1pcnJvciA9IGNsaXBib2FyZE1pcnJvclxyXG4gIHdpbmRvdy5kZWxldGVQbGF5bGlzdCA9IGRlbGV0ZVBsYXlsaXN0XHJcbiAgd2luZG93LmZvcm1DaGFuZ2VkID0gZm9ybUNoYW5nZWRcclxuICB3aW5kb3cuZ29MaXZlID0gZ29MaXZlXHJcbiAgd2luZG93LmdvU29sbyA9IGdvU29sb1xyXG4gIHdpbmRvdy5sb2FkUGxheWxpc3QgPSBsb2FkUGxheWxpc3RcclxuICB3aW5kb3cubG9nb3V0ID0gbG9nb3V0XHJcbiAgd2luZG93Lm9uQWRkID0gb25BZGRcclxuICB3aW5kb3cub25UYXBTaG93ID0gb25UYXBTaG93XHJcbiAgd2luZG93LnNhdmVQbGF5bGlzdCA9IHNhdmVQbGF5bGlzdFxyXG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxyXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXHJcbiAgd2luZG93LnNoYXJlUGVybWEgPSBzaGFyZVBlcm1hXHJcbiAgd2luZG93LnNob3dFeHBvcnQgPSBzaG93RXhwb3J0XHJcbiAgd2luZG93LnNob3dMaXN0ID0gc2hvd0xpc3RcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc2hvd1dhdGNoTGl2ZSA9IHNob3dXYXRjaExpdmVcclxuICB3aW5kb3cuc29sb1BhdXNlID0gc29sb1BhdXNlXHJcbiAgd2luZG93LnNvbG9QcmV2ID0gc29sb1ByZXZcclxuICB3aW5kb3cuc29sb1Jlc3RhcnQgPSBzb2xvUmVzdGFydFxyXG4gIHdpbmRvdy5zb2xvU2tpcCA9IHNvbG9Ta2lwXHJcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxyXG4gIHdpbmRvdy5zdGFydEhlcmUgPSBzdGFydEhlcmVcclxuXHJcbiAgYXV0b3N0YXJ0ID0gcXMoJ3N0YXJ0Jyk/XHJcblxyXG4gICMgYWRkRW5hYmxlZCA9IHFzKCdhZGQnKT9cclxuICAjIGNvbnNvbGUubG9nIFwiQWRkIEVuYWJsZWQ6ICN7YWRkRW5hYmxlZH1cIlxyXG5cclxuICB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50XHJcbiAgaWYgdXNlckFnZW50PyBhbmQgU3RyaW5nKHVzZXJBZ2VudCkubWF0Y2goL1Rlc2xhXFwvMjAvKVxyXG4gICAgaXNUZXNsYSA9IHRydWVcclxuXHJcbiAgaWYgaXNUZXNsYVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJykuY2xhc3NMaXN0LmFkZCgndGVzbGEnKVxyXG5cclxuICBjdXJyZW50UGxheWxpc3ROYW1lID0gcXMoJ25hbWUnKVxyXG4gIGlmIGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlID0gY3VycmVudFBsYXlsaXN0TmFtZVxyXG5cclxuICBleHBvcnRFbmFibGVkID0gcXMoJ2V4cG9ydCcpP1xyXG4gIGNvbnNvbGUubG9nIFwiRXhwb3J0IEVuYWJsZWQ6ICN7ZXhwb3J0RW5hYmxlZH1cIlxyXG4gIGlmIGV4cG9ydEVuYWJsZWRcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBvcnQnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgICAgPGlucHV0IGNsYXNzPVwiZnN1YlwiIHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIkV4cG9ydFwiIG9uY2xpY2s9XCJldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBzaG93RXhwb3J0KCk7XCIgdGl0bGU9XCJFeHBvcnQgbGlzdHMgaW50byBjbGlja2FibGUgcGxheWxpc3RzXCI+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgc29sb0lEUVMgPSBxcygnc29sbycpXHJcbiAgaWYgc29sb0lEUVM/XHJcbiAgICAjIGluaXRpYWxpemUgc29sbyBtb2RlXHJcbiAgICB1cGRhdGVTb2xvSUQoc29sb0lEUVMpXHJcblxyXG4gICAgaWYgbGF1bmNoT3BlblxyXG4gICAgICBzaG93V2F0Y2hGb3JtKClcclxuICAgIGVsc2VcclxuICAgICAgc2hvd1dhdGNoTGluaygpXHJcbiAgZWxzZVxyXG4gICAgIyBsaXZlIG1vZGVcclxuICAgIHNob3dXYXRjaExpdmUoKVxyXG5cclxuICBxc0ZpbHRlcnMgPSBxcygnZmlsdGVycycpXHJcbiAgaWYgcXNGaWx0ZXJzP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gcXNGaWx0ZXJzXHJcblxyXG4gIHNvbG9NaXJyb3IgPSBxcygnbWlycm9yJyk/XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaXJyb3JcIikuY2hlY2tlZCA9IHNvbG9NaXJyb3JcclxuICBpZiBzb2xvTWlycm9yXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyc2VjdGlvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXJyb3Jub3RlJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgICBzZW5kSWRlbnRpdHkoKVxyXG5cclxuICBzb2NrZXQub24gJ3NvbG8nLCAocGt0KSAtPlxyXG4gICAgc29sb0NvbW1hbmQocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnb3BpbmlvbicsIChwa3QpIC0+XHJcbiAgICB1cGRhdGVPcGluaW9uKHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICd1c2VycGxheWxpc3QnLCAocGt0KSAtPlxyXG4gICAgcmVjZWl2ZVVzZXJQbGF5bGlzdChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAncGxheScsIChwa3QpIC0+XHJcbiAgICBpZiBwbGF5ZXI/IGFuZCBub3Qgc29sb0lEP1xyXG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXHJcbiAgICAgIGNsZWFyT3BpbmlvbigpXHJcbiAgICAgIGlmIGRpc2NvcmRUb2tlbj8gYW5kIHBrdC5pZD9cclxuICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHBrdC5pZCB9XHJcbiAgICAgIHJlbmRlckluZm8oe1xyXG4gICAgICAgIGN1cnJlbnQ6IHBrdFxyXG4gICAgICB9LCB0cnVlKVxyXG5cclxuICBwcmVwYXJlQ2FzdCgpXHJcblxyXG4gIGlmIGF1dG9zdGFydFxyXG4gICAgY29uc29sZS5sb2cgXCJBVVRPIFNUQVJUXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gXCJBVVRPIFNUQVJUXCJcclxuICAgIHN0YXJ0SGVyZSgpXHJcblxyXG4gIG5ldyBDbGlwYm9hcmQgJy5zaGFyZScsIHtcclxuICAgIHRleHQ6ICh0cmlnZ2VyKSAtPlxyXG4gICAgICBpZiB0cmlnZ2VyLnZhbHVlLm1hdGNoKC9QZXJtYS9pKVxyXG4gICAgICAgIHJldHVybiBjYWxjUGVybWEoKVxyXG4gICAgICBtaXJyb3IgPSBmYWxzZVxyXG4gICAgICBpZiB0cmlnZ2VyLnZhbHVlLm1hdGNoKC9NaXJyb3IvaSlcclxuICAgICAgICBtaXJyb3IgPSB0cnVlXHJcbiAgICAgIHJldHVybiBjYWxjU2hhcmVVUkwobWlycm9yKVxyXG4gIH1cclxuIiwiZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXHJcblxyXG5jbGFzcyBQbGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogKGRvbUlELCBzaG93Q29udHJvbHMgPSB0cnVlKSAtPlxyXG4gICAgQGVuZGVkID0gbnVsbFxyXG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZFxyXG4gICAgaWYgbm90IHNob3dDb250cm9sc1xyXG4gICAgICBvcHRpb25zID0geyBjb250cm9sczogW10gfVxyXG4gICAgQHBseXIgPSBuZXcgUGx5cihkb21JRCwgb3B0aW9ucylcclxuICAgIEBwbHlyLm9uICdyZWFkeScsIChldmVudCkgPT5cclxuICAgICAgQHBseXIucGxheSgpXHJcbiAgICBAcGx5ci5vbiAnZW5kZWQnLCAoZXZlbnQpID0+XHJcbiAgICAgIGlmIEBlbmRlZD9cclxuICAgICAgICBAZW5kZWQoKVxyXG5cclxuICAgIEBwbHlyLm9uICdwbGF5aW5nJywgKGV2ZW50KSA9PlxyXG4gICAgICBpZiBAb25UaXRsZT9cclxuICAgICAgICBAb25UaXRsZShAcGx5ci5tdHZUaXRsZSlcclxuXHJcbiAgcGxheTogKGlkLCBzdGFydFNlY29uZHMgPSB1bmRlZmluZWQsIGVuZFNlY29uZHMgPSB1bmRlZmluZWQpIC0+XHJcbiAgICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oaWQpXHJcbiAgICBpZiBub3QgaWRJbmZvP1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBzd2l0Y2ggaWRJbmZvLnByb3ZpZGVyXHJcbiAgICAgIHdoZW4gJ3lvdXR1YmUnXHJcbiAgICAgICAgc291cmNlID0ge1xyXG4gICAgICAgICAgc3JjOiBpZEluZm8ucmVhbFxyXG4gICAgICAgICAgcHJvdmlkZXI6ICd5b3V0dWJlJ1xyXG4gICAgICAgIH1cclxuICAgICAgd2hlbiAnbXR2J1xyXG4gICAgICAgIHNvdXJjZSA9IHtcclxuICAgICAgICAgIHNyYzogXCIvdmlkZW9zLyN7aWRJbmZvLnJlYWx9Lm1wNFwiXHJcbiAgICAgICAgICB0eXBlOiAndmlkZW8vbXA0J1xyXG4gICAgICAgIH1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgIGlmKHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPiAwKSlcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSBzdGFydFNlY29uZHNcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSB1bmRlZmluZWRcclxuICAgIGlmKGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+IDApKVxyXG4gICAgICBAcGx5ci5tdHZFbmQgPSBlbmRTZWNvbmRzXHJcbiAgICBlbHNlXHJcbiAgICAgIEBwbHlyLm10dkVuZCA9IHVuZGVmaW5lZFxyXG4gICAgQHBseXIuc291cmNlID1cclxuICAgICAgdHlwZTogJ3ZpZGVvJyxcclxuICAgICAgdGl0bGU6ICdNVFYnLFxyXG4gICAgICBzb3VyY2VzOiBbc291cmNlXVxyXG5cclxuICB0b2dnbGVQYXVzZTogLT5cclxuICAgIGlmIEBwbHlyLnBhdXNlZFxyXG4gICAgICBAcGx5ci5wbGF5KClcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIucGF1c2UoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIG9waW5pb25zOlxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcblxyXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcclxuZmlsdGVyT3BpbmlvbnMgPSB7fVxyXG5cclxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXHJcbmZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBudWxsXHJcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhcnNlRHVyYXRpb24gPSAocykgLT5cclxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcclxuXHJcbnNldFNlcnZlckRhdGFiYXNlcyA9IChkYiwgb3BpbmlvbnMsIGdldFVzZXJGcm9tTmlja25hbWUpIC0+XHJcbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxyXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcclxuICBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gZ2V0VXNlckZyb21OaWNrbmFtZVxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxyXG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXHJcblxyXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cclxuICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxyXG4gIGVsc2VcclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxyXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcclxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgc29sb1VubGlzdGVkID0ge31cclxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXHJcbiAgaWYgc29sb0ZpbHRlcnM/XHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcclxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcclxuXHJcbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxyXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xyXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcclxuICAgICAgaWYgcGllY2VzWzBdID09IFwicHJpdmF0ZVwiXHJcbiAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxyXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXHJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxyXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxyXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXHJcbiAgICAgIGlmIHBpZWNlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXHJcbiAgICAgICAgYWxsQWxsb3dlZCA9IGZhbHNlXHJcblxyXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcclxuICAgICAgaWRMb29rdXAgPSBudWxsXHJcblxyXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXHJcblxyXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdLnRvTG93ZXJDYXNlKClcclxuICAgICAgc3dpdGNoIGNvbW1hbmRcclxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLm5pY2tuYW1lID09IHNcclxuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxyXG4gICAgICAgIHdoZW4gJ3RhZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXHJcbiAgICAgICAgd2hlbiAncmVjZW50JywgJ3NpbmNlJ1xyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICBkdXJhdGlvbkluU2Vjb25kcyA9IHBhcnNlRHVyYXRpb24oc3Vic3RyaW5nKVxyXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxyXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcclxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBwYXJzaW5nIGV4Y2VwdGlvbjogI3tzb21lRXhjZXB0aW9ufVwiXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBbI3tzdWJzdHJpbmd9XSAtICN7ZHVyYXRpb25JblNlY29uZHN9XCJcclxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcclxuICAgICAgICB3aGVuICdsb3ZlJywgJ2xpa2UnLCAnYmxlaCcsICdoYXRlJ1xyXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnbm9uZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnZnVsbCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XHJcbiAgICAgICAgICAgIGZ1bGwgPSBlLmFydGlzdC50b0xvd2VyQ2FzZSgpICsgXCIgLSBcIiArIGUudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXHJcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XHJcbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXHJcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIHdoZW4gJ3VuJywgJ3VsJywgJ3VubGlzdGVkJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGlmIG5vdCBpZC5tYXRjaCgvXnlvdXR1YmVfLykgYW5kIG5vdCBpZC5tYXRjaCgvXm10dl8vKVxyXG4gICAgICAgICAgICAgIGlkID0gXCJ5b3V0dWJlXyN7aWR9XCJcclxuICAgICAgICAgICAgcGlwZVNwbGl0ID0gaWQuc3BsaXQoL1xcfC8pXHJcbiAgICAgICAgICAgIGlkID0gcGlwZVNwbGl0LnNoaWZ0KClcclxuICAgICAgICAgICAgc3RhcnQgPSAtMVxyXG4gICAgICAgICAgICBlbmQgPSAtMVxyXG4gICAgICAgICAgICBpZiBwaXBlU3BsaXQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXHJcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgZW5kID0gcGFyc2VJbnQocGlwZVNwbGl0LnNoaWZ0KCkpXHJcbiAgICAgICAgICAgIHRpdGxlID0gaWRcclxuICAgICAgICAgICAgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eeW91dHViZV8oLispLylcclxuICAgICAgICAgICAgICB0aXRsZSA9IG1hdGNoZXNbMV1cclxuICAgICAgICAgICAgZWxzZSBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL15tdHZfKC4rKS8pXHJcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXHJcbiAgICAgICAgICAgIHNvbG9Vbmxpc3RlZFtpZF0gPVxyXG4gICAgICAgICAgICAgIGlkOiBpZFxyXG4gICAgICAgICAgICAgIGFydGlzdDogJ1VubGlzdGVkIFZpZGVvcydcclxuICAgICAgICAgICAgICB0aXRsZTogdGl0bGVcclxuICAgICAgICAgICAgICB0YWdzOiB7fVxyXG4gICAgICAgICAgICAgIG5pY2tuYW1lOiAnVW5saXN0ZWQnXHJcbiAgICAgICAgICAgICAgY29tcGFueTogJ1VubGlzdGVkJ1xyXG4gICAgICAgICAgICAgIHRodW1iOiAndW5saXN0ZWQucG5nJ1xyXG4gICAgICAgICAgICAgIHN0YXJ0OiBzdGFydFxyXG4gICAgICAgICAgICAgIGVuZDogZW5kXHJcbiAgICAgICAgICAgICAgdW5saXN0ZWQ6IHRydWVcclxuXHJcbiAgICAgICAgICAgICMgZm9yY2Utc2tpcCBhbnkgcHJlLWV4aXN0aW5nIERCIHZlcnNpb25zIG9mIHRoaXMgSURcclxuICAgICAgICAgICAgaWYgZmlsdGVyRGF0YWJhc2VbaWRdP1xyXG4gICAgICAgICAgICAgIGZpbHRlckRhdGFiYXNlW2lkXS5za2lwcGVkID0gdHJ1ZVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGlmIGlkTG9va3VwP1xyXG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxyXG4gICAgICAgICAgZSA9IGZpbHRlckRhdGFiYXNlW2lkXVxyXG4gICAgICAgICAgaWYgbm90IGU/XHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICBpc01hdGNoID0gdHJ1ZVxyXG4gICAgICAgICAgaWYgbmVnYXRlZFxyXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgZm9yIGssIHVubGlzdGVkIG9mIHNvbG9Vbmxpc3RlZFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQucHVzaCB1bmxpc3RlZFxyXG5cclxuICBpZiBzb3J0QnlBcnRpc3RcclxuICAgIHNvbG9VbnNodWZmbGVkLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcbiAgcmV0dXJuIHNvbG9VbnNodWZmbGVkXHJcblxyXG5jYWxjSWRJbmZvID0gKGlkKSAtPlxyXG4gIGlmIG5vdCBtYXRjaGVzID0gaWQubWF0Y2goL14oW2Etel0rKV8oXFxTKykvKVxyXG4gICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgSUQ6ICN7aWR9XCJcclxuICAgIHJldHVybiBudWxsXHJcbiAgcHJvdmlkZXIgPSBtYXRjaGVzWzFdXHJcbiAgcmVhbCA9IG1hdGNoZXNbMl1cclxuXHJcbiAgc3dpdGNoIHByb3ZpZGVyXHJcbiAgICB3aGVuICd5b3V0dWJlJ1xyXG4gICAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tyZWFsfVwiXHJcbiAgICB3aGVuICdtdHYnXHJcbiAgICAgIHVybCA9IFwiL3ZpZGVvcy8je3JlYWx9Lm1wNFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIFByb3ZpZGVyOiAje3Byb3ZpZGVyfVwiXHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpZDogaWRcclxuICAgIHByb3ZpZGVyOiBwcm92aWRlclxyXG4gICAgcmVhbDogcmVhbFxyXG4gICAgdXJsOiB1cmxcclxuICB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2V0U2VydmVyRGF0YWJhc2VzOiBzZXRTZXJ2ZXJEYXRhYmFzZXNcclxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxyXG4gIGNhbGNJZEluZm86IGNhbGNJZEluZm9cclxuIl19
