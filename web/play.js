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
var Clipboard, DASHCAST_NAMESPACE, NEVER_WATCHED_TIME, Player, TIME_BUCKETS, addEnabled, askForget, calcLabel, calcPerma, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, clipboardMirror, constants, currentPlaylistName, deletePlaylist, discordNickname, discordTag, discordToken, endedTimer, exportEnabled, fadeIn, fadeOut, filters, formChanged, generatePermalink, getData, goLive, goSolo, isTesla, k, lastPlayedID, lastShowListTime, launchOpen, len, listenForMediaButtons, loadPlaylist, logout, mediaButtonsReady, now, o, onAdd, onError, onInitSuccess, onTapShow, opinionOrder, overTimers, pageEpoch, pauseInternal, play, player, playing, prepareCast, qs, randomString, rawJSON, receiveIdentity, receiveUserPlaylist, ref, renderAdd, renderClipboard, renderClipboardMirror, renderInfo, renderPlaylistName, requestUserPlaylists, savePlaylist, sendIdentity, sendReady, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, sharePerma, showExport, showInfo, showList, showWatchForm, showWatchLink, showWatchLive, shuffleArray, socket, soloCalcBuckets, soloCommand, soloCount, soloError, soloID, soloIndex, soloInfo, soloInfoBroadcast, soloLabels, soloLastWatched, soloMirror, soloPause, soloPlay, soloPrev, soloQueue, soloResetLastWatched, soloRestart, soloSaveLastWatched, soloShuffle, soloSkip, soloTick, soloTickTimeout, soloUnshuffled, soloVideo, sprinkleFormQS, startCast, startHere, tapTimeout, updateOpinion, updateSoloID;

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
  console.log(`Playing: ${id}`);
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
  var company, html, tagsString;
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
  html = "";
  if (!isLive) {
    html += `<div class=\"infocounts\">Track ${info.index} / ${info.count}</div>`;
  }
  if (player == null) {
    html += `<div class=\"infothumb\"><a href=\"https://youtu.be/${encodeURIComponent(info.current.id)}\"><img width=320 height=180 src=\"${info.current.thumb}\"></a></div>`;
  }
  html += `<div class=\"infocurrent infoartist\">${info.current.artist}</div>`;
  html += `<div class=\"infotitle\">\"${info.current.title}\"</div>`;
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
  var allAllowed, command, durationInSeconds, e, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, len, len1, len2, matches, negated, pieces, property, rawFilters, ref, since, soloFilters, soloUnshuffled, someException, substring;
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
          for (k = 0, len2 = ref.length; k < len2; k++) {
            id = ref[k];
            if (id.match(/^#/)) {
              break;
            }
            idLookup[id] = true;
          }
          filterFunc = function(e, s) {
            return idLookup[e.id];
          };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9wbGF5LmNvZmZlZSIsInNyYy9jbGllbnQvcGxheWVyLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFNBQUEsRUFBQSxtQkFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxpQkFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLGdCQUFBLEVBQUEsVUFBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLGVBQUEsRUFBQSxtQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxh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QUEsRUFBQTtFQUFFLElBQUcsQ0FBSSxDQUFBLE9BQUEsR0FBVSxFQUFFLENBQUMsS0FBSCxDQUFTLGlCQUFULENBQVYsQ0FBUDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxvQkFBQSxDQUFBLENBQXVCLEVBQXZCLENBQUEsQ0FBWjtBQUNBLFdBQU8sS0FGVDs7RUFHQSxRQUFBLEdBQVcsT0FBTyxDQUFDLENBQUQ7RUFDbEIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxDQUFEO0FBRWQsVUFBTyxRQUFQO0FBQUEsU0FDTyxTQURQO01BRUksR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixJQUFwQixDQUFBO0FBREg7QUFEUCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWMsWUFEZDtFQUVBLFVBQUEsRUFBWTtBQUZaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyohXG4gKiBjbGlwYm9hcmQuanMgdjIuMC44XG4gKiBodHRwczovL2NsaXBib2FyZGpzLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCBNSVQgwqkgWmVubyBSb2NoYVxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJDbGlwYm9hcmRKU1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJDbGlwYm9hcmRKU1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbigpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZXNfXyA9ICh7XG5cbi8qKiovIDEzNDpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gRVhQT1JUU1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIHtcbiAgXCJkZWZhdWx0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gLyogYmluZGluZyAqLyBjbGlwYm9hcmQ7IH1cbn0pO1xuXG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL3RpbnktZW1pdHRlci9pbmRleC5qc1xudmFyIHRpbnlfZW1pdHRlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjc5KTtcbnZhciB0aW55X2VtaXR0ZXJfZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4odGlueV9lbWl0dGVyKTtcbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvZ29vZC1saXN0ZW5lci9zcmMvbGlzdGVuLmpzXG52YXIgbGlzdGVuID0gX193ZWJwYWNrX3JlcXVpcmVfXygzNzApO1xudmFyIGxpc3Rlbl9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubihsaXN0ZW4pO1xuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy9zZWxlY3Qvc3JjL3NlbGVjdC5qc1xudmFyIHNyY19zZWxlY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgxNyk7XG52YXIgc2VsZWN0X2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKHNyY19zZWxlY3QpO1xuOy8vIENPTkNBVEVOQVRFRCBNT0RVTEU6IC4vc3JjL2NsaXBib2FyZC1hY3Rpb24uanNcbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG5cbi8qKlxuICogSW5uZXIgY2xhc3Mgd2hpY2ggcGVyZm9ybXMgc2VsZWN0aW9uIGZyb20gZWl0aGVyIGB0ZXh0YCBvciBgdGFyZ2V0YFxuICogcHJvcGVydGllcyBhbmQgdGhlbiBleGVjdXRlcyBjb3B5IG9yIGN1dCBvcGVyYXRpb25zLlxuICovXG5cbnZhciBDbGlwYm9hcmRBY3Rpb24gPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIENsaXBib2FyZEFjdGlvbihvcHRpb25zKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsaXBib2FyZEFjdGlvbik7XG5cbiAgICB0aGlzLnJlc29sdmVPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuICB9XG4gIC8qKlxuICAgKiBEZWZpbmVzIGJhc2UgcHJvcGVydGllcyBwYXNzZWQgZnJvbSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoQ2xpcGJvYXJkQWN0aW9uLCBbe1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlT3B0aW9ucygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuYWN0aW9uID0gb3B0aW9ucy5hY3Rpb247XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyO1xuICAgICAgdGhpcy5lbWl0dGVyID0gb3B0aW9ucy5lbWl0dGVyO1xuICAgICAgdGhpcy50YXJnZXQgPSBvcHRpb25zLnRhcmdldDtcbiAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMudGV4dDtcbiAgICAgIHRoaXMudHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlcjtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gJyc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlY2lkZXMgd2hpY2ggc2VsZWN0aW9uIHN0cmF0ZWd5IGlzIGdvaW5nIHRvIGJlIGFwcGxpZWQgYmFzZWRcbiAgICAgKiBvbiB0aGUgZXhpc3RlbmNlIG9mIGB0ZXh0YCBhbmQgYHRhcmdldGAgcHJvcGVydGllcy5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluaXRTZWxlY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdFNlbGVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRleHQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RGYWtlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0VGFyZ2V0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmYWtlIHRleHRhcmVhIGVsZW1lbnQsIHNldHMgaXRzIHZhbHVlIGZyb20gYHRleHRgIHByb3BlcnR5LFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY3JlYXRlRmFrZUVsZW1lbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlRmFrZUVsZW1lbnQoKSB7XG4gICAgICB2YXIgaXNSVEwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXInKSA9PT0gJ3J0bCc7XG4gICAgICB0aGlzLmZha2VFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTsgLy8gUHJldmVudCB6b29taW5nIG9uIGlPU1xuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLmZvbnRTaXplID0gJzEycHQnOyAvLyBSZXNldCBib3ggbW9kZWxcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5ib3JkZXIgPSAnMCc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnBhZGRpbmcgPSAnMCc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLm1hcmdpbiA9ICcwJzsgLy8gTW92ZSBlbGVtZW50IG91dCBvZiBzY3JlZW4gaG9yaXpvbnRhbGx5XG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZVtpc1JUTCA/ICdyaWdodCcgOiAnbGVmdCddID0gJy05OTk5cHgnOyAvLyBNb3ZlIGVsZW1lbnQgdG8gdGhlIHNhbWUgcG9zaXRpb24gdmVydGljYWxseVxuXG4gICAgICB2YXIgeVBvc2l0aW9uID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnRvcCA9IFwiXCIuY29uY2F0KHlQb3NpdGlvbiwgXCJweFwiKTtcbiAgICAgIHRoaXMuZmFrZUVsZW0uc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKTtcbiAgICAgIHRoaXMuZmFrZUVsZW0udmFsdWUgPSB0aGlzLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5mYWtlRWxlbTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0J3MgdGhlIHZhbHVlIG9mIGZha2VFbGVtLFxuICAgICAqIGFuZCBtYWtlcyBhIHNlbGVjdGlvbiBvbiBpdC5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdEZha2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0RmFrZSgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBmYWtlRWxlbSA9IHRoaXMuY3JlYXRlRmFrZUVsZW1lbnQoKTtcblxuICAgICAgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlRmFrZSgpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5mYWtlSGFuZGxlciA9IHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrKSB8fCB0cnVlO1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZmFrZUVsZW0pO1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWxlY3RfZGVmYXVsdCgpKGZha2VFbGVtKTtcbiAgICAgIHRoaXMuY29weVRleHQoKTtcbiAgICAgIHRoaXMucmVtb3ZlRmFrZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbmx5IHJlbW92ZXMgdGhlIGZha2UgZWxlbWVudCBhZnRlciBhbm90aGVyIGNsaWNrIGV2ZW50LCB0aGF0IHdheVxuICAgICAqIGEgdXNlciBjYW4gaGl0IGBDdHJsK0NgIHRvIGNvcHkgYmVjYXVzZSBzZWxlY3Rpb24gc3RpbGwgZXhpc3RzLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlRmFrZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVGYWtlKCkge1xuICAgICAgaWYgKHRoaXMuZmFrZUhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLmZha2VIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZmFrZUVsZW0pIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5mYWtlRWxlbSk7XG4gICAgICAgIHRoaXMuZmFrZUVsZW0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBjb250ZW50IGZyb20gZWxlbWVudCBwYXNzZWQgb24gYHRhcmdldGAgcHJvcGVydHkuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RUYXJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0VGFyZ2V0KCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWxlY3RfZGVmYXVsdCgpKHRoaXMudGFyZ2V0KTtcbiAgICAgIHRoaXMuY29weVRleHQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIGNvcHkgb3BlcmF0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNvcHlUZXh0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHlUZXh0KCkge1xuICAgICAgdmFyIHN1Y2NlZWRlZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgc3VjY2VlZGVkID0gZG9jdW1lbnQuZXhlY0NvbW1hbmQodGhpcy5hY3Rpb24pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHN1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhhbmRsZVJlc3VsdChzdWNjZWVkZWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyBhbiBldmVudCBiYXNlZCBvbiB0aGUgY29weSBvcGVyYXRpb24gcmVzdWx0LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gc3VjY2VlZGVkXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVSZXN1bHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlUmVzdWx0KHN1Y2NlZWRlZCkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoc3VjY2VlZGVkID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJywge1xuICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICB0ZXh0OiB0aGlzLnNlbGVjdGVkVGV4dCxcbiAgICAgICAgdHJpZ2dlcjogdGhpcy50cmlnZ2VyLFxuICAgICAgICBjbGVhclNlbGVjdGlvbjogdGhpcy5jbGVhclNlbGVjdGlvbi5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgZm9jdXMgYXdheSBmcm9tIGB0YXJnZXRgIGFuZCBiYWNrIHRvIHRoZSB0cmlnZ2VyLCByZW1vdmVzIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY2xlYXJTZWxlY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50cmlnZ2VyKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlci5mb2N1cygpO1xuICAgICAgfVxuXG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYGFjdGlvbmAgdG8gYmUgcGVyZm9ybWVkIHdoaWNoIGNhbiBiZSBlaXRoZXIgJ2NvcHknIG9yICdjdXQnLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbGlmZWN5Y2xlLlxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFjdGlvblwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KCkge1xuICAgICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ2NvcHknO1xuICAgICAgdGhpcy5fYWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICBpZiAodGhpcy5fYWN0aW9uICE9PSAnY29weScgJiYgdGhpcy5fYWN0aW9uICE9PSAnY3V0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJhY3Rpb25cIiB2YWx1ZSwgdXNlIGVpdGhlciBcImNvcHlcIiBvciBcImN1dFwiJyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGBhY3Rpb25gIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWN0aW9uO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBgdGFyZ2V0YCBwcm9wZXJ0eSB1c2luZyBhbiBlbGVtZW50XG4gICAgICogdGhhdCB3aWxsIGJlIGhhdmUgaXRzIGNvbnRlbnQgY29waWVkLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ0YXJnZXRcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIF90eXBlb2YodGFyZ2V0KSA9PT0gJ29iamVjdCcgJiYgdGFyZ2V0Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAnY29weScgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgYXR0cmlidXRlLiBQbGVhc2UgdXNlIFwicmVhZG9ubHlcIiBpbnN0ZWFkIG9mIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdjdXQnICYmICh0YXJnZXQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpIHx8IHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiBhdHRyaWJ1dGUuIFlvdSBjYW5cXCd0IGN1dCB0ZXh0IGZyb20gZWxlbWVudHMgd2l0aCBcInJlYWRvbmx5XCIgb3IgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZXMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgdmFsdWUsIHVzZSBhIHZhbGlkIEVsZW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgdGFyZ2V0YCBwcm9wZXJ0eS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd8SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2xpcGJvYXJkQWN0aW9uO1xufSgpO1xuXG4vKiBoYXJtb255IGRlZmF1bHQgZXhwb3J0ICovIHZhciBjbGlwYm9hcmRfYWN0aW9uID0gKENsaXBib2FyZEFjdGlvbik7XG47Ly8gQ09OQ0FURU5BVEVEIE1PRFVMRTogLi9zcmMvY2xpcGJvYXJkLmpzXG5mdW5jdGlvbiBjbGlwYm9hcmRfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBjbGlwYm9hcmRfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IGNsaXBib2FyZF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gY2xpcGJvYXJkX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IG8uX19wcm90b19fID0gcDsgcmV0dXJuIG87IH07IHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7IH1cblxuZnVuY3Rpb24gX2NyZWF0ZVN1cGVyKERlcml2ZWQpIHsgdmFyIGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCk7IHJldHVybiBmdW5jdGlvbiBfY3JlYXRlU3VwZXJJbnRlcm5hbCgpIHsgdmFyIFN1cGVyID0gX2dldFByb3RvdHlwZU9mKERlcml2ZWQpLCByZXN1bHQ7IGlmIChoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KSB7IHZhciBOZXdUYXJnZXQgPSBfZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3I7IHJlc3VsdCA9IFJlZmxlY3QuY29uc3RydWN0KFN1cGVyLCBhcmd1bWVudHMsIE5ld1RhcmdldCk7IH0gZWxzZSB7IHJlc3VsdCA9IFN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH0gcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIHJlc3VsdCk7IH07IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoY2xpcGJvYXJkX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTsgfVxuXG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cblxuZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHsgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlOyBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlOyBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlOyB0cnkgeyBEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFJlZmxlY3QuY29uc3RydWN0KERhdGUsIFtdLCBmdW5jdGlvbiAoKSB7fSkpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH0gfVxuXG5mdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pOyB9OyByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pOyB9XG5cblxuXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJldHJpZXZlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdWZmaXhcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICovXG5cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZVZhbHVlKHN1ZmZpeCwgZWxlbWVudCkge1xuICB2YXIgYXR0cmlidXRlID0gXCJkYXRhLWNsaXBib2FyZC1cIi5jb25jYXQoc3VmZml4KTtcblxuICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyB3aGljaCB0YWtlcyBvbmUgb3IgbW9yZSBlbGVtZW50cywgYWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlbSxcbiAqIGFuZCBpbnN0YW50aWF0ZXMgYSBuZXcgYENsaXBib2FyZEFjdGlvbmAgb24gZWFjaCBjbGljay5cbiAqL1xuXG5cbnZhciBDbGlwYm9hcmQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKF9FbWl0dGVyKSB7XG4gIF9pbmhlcml0cyhDbGlwYm9hcmQsIF9FbWl0dGVyKTtcblxuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKENsaXBib2FyZCk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0cmlnZ2VyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBDbGlwYm9hcmQodHJpZ2dlciwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcztcblxuICAgIGNsaXBib2FyZF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbGlwYm9hcmQpO1xuXG4gICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKTtcblxuICAgIF90aGlzLnJlc29sdmVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgX3RoaXMubGlzdGVuQ2xpY2sodHJpZ2dlcik7XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqXG4gICAqIERlZmluZXMgaWYgYXR0cmlidXRlcyB3b3VsZCBiZSByZXNvbHZlZCB1c2luZyBpbnRlcm5hbCBzZXR0ZXIgZnVuY3Rpb25zXG4gICAqIG9yIGN1c3RvbSBmdW5jdGlvbnMgdGhhdCB3ZXJlIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG5cbiAgY2xpcGJvYXJkX2NyZWF0ZUNsYXNzKENsaXBib2FyZCwgW3tcbiAgICBrZXk6IFwicmVzb2x2ZU9wdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmFjdGlvbiA9IHR5cGVvZiBvcHRpb25zLmFjdGlvbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuYWN0aW9uIDogdGhpcy5kZWZhdWx0QWN0aW9uO1xuICAgICAgdGhpcy50YXJnZXQgPSB0eXBlb2Ygb3B0aW9ucy50YXJnZXQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRhcmdldCA6IHRoaXMuZGVmYXVsdFRhcmdldDtcbiAgICAgIHRoaXMudGV4dCA9IHR5cGVvZiBvcHRpb25zLnRleHQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRleHQgOiB0aGlzLmRlZmF1bHRUZXh0O1xuICAgICAgdGhpcy5jb250YWluZXIgPSBjbGlwYm9hcmRfdHlwZW9mKG9wdGlvbnMuY29udGFpbmVyKSA9PT0gJ29iamVjdCcgPyBvcHRpb25zLmNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjbGljayBldmVudCBsaXN0ZW5lciB0byB0aGUgcGFzc2VkIHRyaWdnZXIuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImxpc3RlbkNsaWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RlbkNsaWNrKHRyaWdnZXIpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB0aGlzLmxpc3RlbmVyID0gbGlzdGVuX2RlZmF1bHQoKSh0cmlnZ2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMyLm9uQ2xpY2soZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIG5ldyBgQ2xpcGJvYXJkQWN0aW9uYCBvbiBlYWNoIGNsaWNrIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm9uQ2xpY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICB2YXIgdHJpZ2dlciA9IGUuZGVsZWdhdGVUYXJnZXQgfHwgZS5jdXJyZW50VGFyZ2V0O1xuXG4gICAgICBpZiAodGhpcy5jbGlwYm9hcmRBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG5ldyBjbGlwYm9hcmRfYWN0aW9uKHtcbiAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbih0cmlnZ2VyKSxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCh0cmlnZ2VyKSxcbiAgICAgICAgdGV4dDogdGhpcy50ZXh0KHRyaWdnZXIpLFxuICAgICAgICBjb250YWluZXI6IHRoaXMuY29udGFpbmVyLFxuICAgICAgICB0cmlnZ2VyOiB0cmlnZ2VyLFxuICAgICAgICBlbWl0dGVyOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgYWN0aW9uYCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0QWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRBY3Rpb24odHJpZ2dlcikge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZVZhbHVlKCdhY3Rpb24nLCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgdGFyZ2V0YCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0VGFyZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRUYXJnZXQodHJpZ2dlcikge1xuICAgICAgdmFyIHNlbGVjdG9yID0gZ2V0QXR0cmlidXRlVmFsdWUoJ3RhcmdldCcsIHRyaWdnZXIpO1xuXG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdXBwb3J0IG9mIHRoZSBnaXZlbiBhY3Rpb24sIG9yIGFsbCBhY3Rpb25zIGlmIG5vIGFjdGlvbiBpc1xuICAgICAqIGdpdmVuLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbYWN0aW9uXVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdFRleHRcIixcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYHRleHRgIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdFRleHQodHJpZ2dlcikge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZVZhbHVlKCd0ZXh0JywgdHJpZ2dlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbGlmZWN5Y2xlLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdGhpcy5saXN0ZW5lci5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLmNsaXBib2FyZEFjdGlvbikge1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbi5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1dLCBbe1xuICAgIGtleTogXCJpc1N1cHBvcnRlZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc1N1cHBvcnRlZCgpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFsnY29weScsICdjdXQnXTtcbiAgICAgIHZhciBhY3Rpb25zID0gdHlwZW9mIGFjdGlvbiA9PT0gJ3N0cmluZycgPyBbYWN0aW9uXSA6IGFjdGlvbjtcbiAgICAgIHZhciBzdXBwb3J0ID0gISFkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQ7XG4gICAgICBhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICBzdXBwb3J0ID0gc3VwcG9ydCAmJiAhIWRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN1cHBvcnRlZChhY3Rpb24pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2xpcGJvYXJkO1xufSgodGlueV9lbWl0dGVyX2RlZmF1bHQoKSkpO1xuXG4vKiBoYXJtb255IGRlZmF1bHQgZXhwb3J0ICovIHZhciBjbGlwYm9hcmQgPSAoQ2xpcGJvYXJkKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDgyODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxudmFyIERPQ1VNRU5UX05PREVfVFlQRSA9IDk7XG5cbi8qKlxuICogQSBwb2x5ZmlsbCBmb3IgRWxlbWVudC5tYXRjaGVzKClcbiAqL1xuaWYgKHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAhRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIHZhciBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuXG4gICAgcHJvdG8ubWF0Y2hlcyA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIGNsb3Nlc3QgcGFyZW50IHRoYXQgbWF0Y2hlcyBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY2xvc2VzdCAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICB3aGlsZSAoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlICE9PSBET0NVTUVOVF9OT0RFX1RZUEUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Lm1hdGNoZXMgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgIGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9zZXN0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA0Mzg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGNsb3Nlc3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgyOCk7XG5cbi8qKlxuICogRGVsZWdhdGVzIGV2ZW50IHRvIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIF9kZWxlZ2F0ZShlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpIHtcbiAgICB2YXIgbGlzdGVuZXJGbiA9IGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXJGbiwgdXNlQ2FwdHVyZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lckZuLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBEZWxlZ2F0ZXMgZXZlbnQgdG8gYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8U3RyaW5nfEFycmF5fSBbZWxlbWVudHNdXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGRlbGVnYXRlKGVsZW1lbnRzLCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpIHtcbiAgICAvLyBIYW5kbGUgdGhlIHJlZ3VsYXIgRWxlbWVudCB1c2FnZVxuICAgIGlmICh0eXBlb2YgZWxlbWVudHMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIEVsZW1lbnQtbGVzcyB1c2FnZSwgaXQgZGVmYXVsdHMgdG8gZ2xvYmFsIGRlbGVnYXRpb25cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gVXNlIGBkb2N1bWVudGAgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciwgdGhlbiBhcHBseSBhcmd1bWVudHNcbiAgICAgICAgLy8gVGhpcyBpcyBhIHNob3J0IHdheSB0byAudW5zaGlmdCBgYXJndW1lbnRzYCB3aXRob3V0IHJ1bm5pbmcgaW50byBkZW9wdGltaXphdGlvbnNcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZS5iaW5kKG51bGwsIGRvY3VtZW50KS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBTZWxlY3Rvci1iYXNlZCB1c2FnZVxuICAgIGlmICh0eXBlb2YgZWxlbWVudHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbGVtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIEFycmF5LWxpa2UgYmFzZWQgdXNhZ2VcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGVsZW1lbnRzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogRmluZHMgY2xvc2VzdCBtYXRjaCBhbmQgaW52b2tlcyBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuZXIoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5kZWxlZ2F0ZVRhcmdldCA9IGNsb3Nlc3QoZS50YXJnZXQsIHNlbGVjdG9yKTtcblxuICAgICAgICBpZiAoZS5kZWxlZ2F0ZVRhcmdldCkge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChlbGVtZW50LCBlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gODc5OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBleHBvcnRzKSB7XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBIVE1MIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLm5vZGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICYmIHZhbHVlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnRcbiAgICAgICAgJiYgdmFsdWUubm9kZVR5cGUgPT09IDE7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgbGlzdCBvZiBIVE1MIGVsZW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5ub2RlTGlzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuXG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgJiYgKHR5cGUgPT09ICdbb2JqZWN0IE5vZGVMaXN0XScgfHwgdHlwZSA9PT0gJ1tvYmplY3QgSFRNTENvbGxlY3Rpb25dJylcbiAgICAgICAgJiYgKCdsZW5ndGgnIGluIHZhbHVlKVxuICAgICAgICAmJiAodmFsdWUubGVuZ3RoID09PSAwIHx8IGV4cG9ydHMubm9kZSh2YWx1ZVswXSkpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuc3RyaW5nID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuZm4gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcblxuICAgIHJldHVybiB0eXBlID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gMzcwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX191bnVzZWRfd2VicGFja19leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBpcyA9IF9fd2VicGFja19yZXF1aXJlX18oODc5KTtcbnZhciBkZWxlZ2F0ZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDM4KTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgYWxsIHBhcmFtcyBhbmQgY2FsbHMgdGhlIHJpZ2h0XG4gKiBsaXN0ZW5lciBmdW5jdGlvbiBiYXNlZCBvbiBpdHMgdGFyZ2V0IHR5cGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRhcmdldFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbih0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0YXJnZXQgJiYgIXR5cGUgJiYgIWNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyByZXF1aXJlZCBhcmd1bWVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzLnN0cmluZyh0eXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIFN0cmluZycpO1xuICAgIH1cblxuICAgIGlmICghaXMuZm4oY2FsbGJhY2spKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoaXJkIGFyZ3VtZW50IG11c3QgYmUgYSBGdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChpcy5ub2RlKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3Rlbk5vZGUodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzLm5vZGVMaXN0KHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3Rlbk5vZGVMaXN0KHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5zdHJpbmcodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuU2VsZWN0b3IodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nLCBIVE1MRWxlbWVudCwgSFRNTENvbGxlY3Rpb24sIG9yIE5vZGVMaXN0Jyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBIVE1MIGVsZW1lbnRcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ob2RlKG5vZGUsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBsaXN0IG9mIEhUTUwgZWxlbWVudHNcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8SFRNTENvbGxlY3Rpb259IG5vZGVMaXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTm9kZUxpc3Qobm9kZUxpc3QsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5vZGVMaXN0LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBhIHNlbGVjdG9yXG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5TZWxlY3RvcihzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZGVsZWdhdGUoZG9jdW1lbnQuYm9keSwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0ZW47XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDgxNzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxuZnVuY3Rpb24gc2VsZWN0KGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZWN0ZWRUZXh0O1xuXG4gICAgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBlbGVtZW50LnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSAnSU5QVVQnIHx8IGVsZW1lbnQubm9kZU5hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgdmFyIGlzUmVhZE9ubHkgPSBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgncmVhZG9ubHknKTtcblxuICAgICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xuXG4gICAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBlbGVtZW50LnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKSkge1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcblxuICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0ZWRUZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGVjdDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gMjc5OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5mdW5jdGlvbiBFICgpIHtcbiAgLy8gS2VlcCB0aGlzIGVtcHR5IHNvIGl0J3MgZWFzaWVyIHRvIGluaGVyaXQgZnJvbVxuICAvLyAodmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9saXBzbWFjayBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvaXNzdWVzLzMpXG59XG5cbkUucHJvdG90eXBlID0ge1xuICBvbjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuXG4gICAgKGVbbmFtZV0gfHwgKGVbbmFtZV0gPSBbXSkpLnB1c2goe1xuICAgICAgZm46IGNhbGxiYWNrLFxuICAgICAgY3R4OiBjdHhcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9uY2U6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcbiAgICAgIHNlbGYub2ZmKG5hbWUsIGxpc3RlbmVyKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgbGlzdGVuZXIuXyA9IGNhbGxiYWNrXG4gICAgcmV0dXJuIHRoaXMub24obmFtZSwgbGlzdGVuZXIsIGN0eCk7XG4gIH0sXG5cbiAgZW1pdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgZGF0YSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZXZ0QXJyID0gKCh0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KSlbbmFtZV0gfHwgW10pLnNsaWNlKCk7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBsZW4gPSBldnRBcnIubGVuZ3RoO1xuXG4gICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGV2dEFycltpXS5mbi5hcHBseShldnRBcnJbaV0uY3R4LCBkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvZmY6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG4gICAgdmFyIGV2dHMgPSBlW25hbWVdO1xuICAgIHZhciBsaXZlRXZlbnRzID0gW107XG5cbiAgICBpZiAoZXZ0cyAmJiBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGV2dHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGV2dHNbaV0uZm4gIT09IGNhbGxiYWNrICYmIGV2dHNbaV0uZm4uXyAhPT0gY2FsbGJhY2spXG4gICAgICAgICAgbGl2ZUV2ZW50cy5wdXNoKGV2dHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBldmVudCBmcm9tIHF1ZXVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtcbiAgICAvLyBTdWdnZXN0ZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL2xhemRcbiAgICAvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvY29tbWl0L2M2ZWJmYWE5YmM5NzNiMzNkMTEwYTg0YTMwNzc0MmI3Y2Y5NGM5NTMjY29tbWl0Y29tbWVudC01MDI0OTEwXG5cbiAgICAobGl2ZUV2ZW50cy5sZW5ndGgpXG4gICAgICA/IGVbbmFtZV0gPSBsaXZlRXZlbnRzXG4gICAgICA6IGRlbGV0ZSBlW25hbWVdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRTtcbm1vZHVsZS5leHBvcnRzLlRpbnlFbWl0dGVyID0gRTtcblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyBcdH0pO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcbi8qKioqKiovIFx0XHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi8gXHRcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0ICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG4vKioqKioqLyBcdFx0XHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG4vKioqKioqLyBcdFx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuLyoqKioqKi8gXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG4vKioqKioqLyBcdFx0XHRcdH1cbi8qKioqKiovIFx0XHRcdH1cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvLyBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIHJldHVybmVkIGZyb20gcnVudGltZSBzbyBlbnRyeSBpbmxpbmluZyBpcyBkaXNhYmxlZFxuLyoqKioqKi8gXHQvLyBzdGFydHVwXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygxMzQpO1xuLyoqKioqKi8gfSkoKVxuLmRlZmF1bHQ7XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBIG1vZHVsZSBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uc1xuICovXG5cbi8qKlxuICogVGhlIHBhdHRlcm4gdXNlZCBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uIChQblluTW5EVG5Ibk1uUykuXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIHRoZSB3ZWVrIGZvcm1hdCBQblcuXG4gKi9cblxuLy8gUG5Zbk1uRFRuSG5NblNcbnZhciBudW1iZXJzID0gJ1xcXFxkKyg/OltcXFxcLixdXFxcXGQrKT8nO1xudmFyIHdlZWtQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdXKSc7XG52YXIgZGF0ZVBhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1kpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnRCk/JztcbnZhciB0aW1lUGF0dGVybiA9ICdUKCcgKyBudW1iZXJzICsgJ0gpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnUyk/JztcblxudmFyIGlzbzg2MDEgPSAnUCg/OicgKyB3ZWVrUGF0dGVybiArICd8JyArIGRhdGVQYXR0ZXJuICsgJyg/OicgKyB0aW1lUGF0dGVybiArICcpPyknO1xudmFyIG9iak1hcCA9IFsnd2Vla3MnLCAneWVhcnMnLCAnbW9udGhzJywgJ2RheXMnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbi8qKlxuICogVGhlIElTTzg2MDEgcmVnZXggZm9yIG1hdGNoaW5nIC8gdGVzdGluZyBkdXJhdGlvbnNcbiAqL1xudmFyIHBhdHRlcm4gPSBleHBvcnRzLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGlzbzg2MDEpO1xuXG4vKiogUGFyc2UgUG5Zbk1uRFRuSG5NblMgZm9ybWF0IHRvIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGR1cmF0aW9uU3RyaW5nIC0gUG5Zbk1uRFRuSG5NblMgZm9ybWF0dGVkIHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fSAtIFdpdGggYSBwcm9wZXJ0eSBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBwYXR0ZXJuXG4gKi9cbnZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShkdXJhdGlvblN0cmluZykge1xuICAvLyBTbGljZSBhd2F5IGZpcnN0IGVudHJ5IGluIG1hdGNoLWFycmF5XG4gIHJldHVybiBkdXJhdGlvblN0cmluZy5tYXRjaChwYXR0ZXJuKS5zbGljZSgxKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIG5leHQsIGlkeCkge1xuICAgIHByZXZbb2JqTWFwW2lkeF1dID0gcGFyc2VGbG9hdChuZXh0KSB8fCAwO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gYW4gZW5kIERhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgRGF0ZSBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtEYXRlfSAtIFRoZSByZXN1bHRpbmcgZW5kIERhdGVcbiAqL1xudmFyIGVuZCA9IGV4cG9ydHMuZW5kID0gZnVuY3Rpb24gZW5kKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgLy8gQ3JlYXRlIHR3byBlcXVhbCB0aW1lc3RhbXBzLCBhZGQgZHVyYXRpb24gdG8gJ3RoZW4nIGFuZCByZXR1cm4gdGltZSBkaWZmZXJlbmNlXG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIHRoZW4gPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXG4gIHRoZW4uc2V0RnVsbFllYXIodGhlbi5nZXRGdWxsWWVhcigpICsgZHVyYXRpb24ueWVhcnMpO1xuICB0aGVuLnNldE1vbnRoKHRoZW4uZ2V0TW9udGgoKSArIGR1cmF0aW9uLm1vbnRocyk7XG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLmRheXMpO1xuICB0aGVuLnNldEhvdXJzKHRoZW4uZ2V0SG91cnMoKSArIGR1cmF0aW9uLmhvdXJzKTtcbiAgdGhlbi5zZXRNaW51dGVzKHRoZW4uZ2V0TWludXRlcygpICsgZHVyYXRpb24ubWludXRlcyk7XG4gIC8vIFRoZW4uc2V0U2Vjb25kcyh0aGVuLmdldFNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMpO1xuICB0aGVuLnNldE1pbGxpc2Vjb25kcyh0aGVuLmdldE1pbGxpc2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyAqIDEwMDApO1xuICAvLyBTcGVjaWFsIGNhc2Ugd2Vla3NcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24ud2Vla3MgKiA3KTtcblxuICByZXR1cm4gdGhlbjtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBzZWNvbmRzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG52YXIgdG9TZWNvbmRzID0gZXhwb3J0cy50b1NlY29uZHMgPSBmdW5jdGlvbiB0b1NlY29uZHMoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICB2YXIgdGhlbiA9IGVuZChkdXJhdGlvbiwgbm93KTtcblxuICB2YXIgc2Vjb25kcyA9ICh0aGVuLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgcmV0dXJuIHNlY29uZHM7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGVuZDogZW5kLFxuICB0b1NlY29uZHM6IHRvU2Vjb25kcyxcbiAgcGF0dGVybjogcGF0dGVybixcbiAgcGFyc2U6IHBhcnNlXG59OyIsImNvbnN0YW50cyA9IHJlcXVpcmUgJy4uL2NvbnN0YW50cydcclxuQ2xpcGJvYXJkID0gcmVxdWlyZSAnY2xpcGJvYXJkJ1xyXG5maWx0ZXJzID0gcmVxdWlyZSAnLi4vZmlsdGVycydcclxuUGxheWVyID0gcmVxdWlyZSAnLi9wbGF5ZXInXHJcblxyXG5zb2NrZXQgPSBudWxsXHJcblxyXG5wbGF5ZXIgPSBudWxsXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbnBsYXlpbmcgPSBmYWxzZVxyXG5zb2xvVW5zaHVmZmxlZCA9IFtdXHJcbnNvbG9RdWV1ZSA9IFtdXHJcbnNvbG9JbmRleCA9IDBcclxuc29sb1RpY2tUaW1lb3V0ID0gbnVsbFxyXG5zb2xvVmlkZW8gPSBudWxsXHJcbnNvbG9FcnJvciA9IG51bGxcclxuc29sb0NvdW50ID0gMFxyXG5zb2xvTGFiZWxzID0gbnVsbFxyXG5zb2xvTWlycm9yID0gZmFsc2VcclxuXHJcblRJTUVfQlVDS0VUUyA9IFtcclxuICB7IHNpbmNlOiAxMjAwLCBkZXNjcmlwdGlvbjogXCIyMCBtaW5cIiB9XHJcbiAgeyBzaW5jZTogMzYwMCwgZGVzY3JpcHRpb246IFwiMSBob3VyXCIgfVxyXG4gIHsgc2luY2U6IDEwODAwLCBkZXNjcmlwdGlvbjogXCIzIGhvdXJzXCIgfVxyXG4gIHsgc2luY2U6IDI4ODAwLCBkZXNjcmlwdGlvbjogXCI4IGhvdXJzXCIgfVxyXG4gIHsgc2luY2U6IDg2NDAwLCBkZXNjcmlwdGlvbjogXCIxIGRheVwiIH1cclxuICB7IHNpbmNlOiAyNTkyMDAsIGRlc2NyaXB0aW9uOiBcIjMgZGF5c1wiIH1cclxuICB7IHNpbmNlOiA2MDQ4MDAsIGRlc2NyaXB0aW9uOiBcIjEgd2Vla1wiIH1cclxuICB7IHNpbmNlOiAyNDE5MjAwLCBkZXNjcmlwdGlvbjogXCI0IHdlZWtzXCIgfVxyXG4gIHsgc2luY2U6IDMxNTM2MDAwLCBkZXNjcmlwdGlvbjogXCIxIHllYXJcIiB9XHJcbiAgeyBzaW5jZTogMzE1MzYwMDAwLCBkZXNjcmlwdGlvbjogXCIxMCB5ZWFyc1wiIH1cclxuICB7IHNpbmNlOiAzMTUzNjAwMDAwLCBkZXNjcmlwdGlvbjogXCIxMDAgeWVhcnNcIiB9XHJcbiAgeyBzaW5jZTogMCwgZGVzY3JpcHRpb246IFwiTmV2ZXIgd2F0Y2hlZFwiIH1cclxuXVxyXG5ORVZFUl9XQVRDSEVEX1RJTUUgPSBUSU1FX0JVQ0tFVFNbVElNRV9CVUNLRVRTLmxlbmd0aCAtIDJdLnNpbmNlICsgMVxyXG5cclxubGFzdFNob3dMaXN0VGltZSA9IG51bGxcclxuc29sb0xhc3RXYXRjaGVkID0ge31cclxudHJ5XHJcbiAgcmF3SlNPTiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsYXN0d2F0Y2hlZCcpXHJcbiAgc29sb0xhc3RXYXRjaGVkID0gSlNPTi5wYXJzZShyYXdKU09OKVxyXG4gIGlmIG5vdCBzb2xvTGFzdFdhdGNoZWQ/IG9yICh0eXBlb2Yoc29sb0xhc3RXYXRjaGVkKSAhPSAnb2JqZWN0JylcclxuICAgIGNvbnNvbGUubG9nIFwic29sb0xhc3RXYXRjaGVkIGlzIG5vdCBhbiBvYmplY3QsIHN0YXJ0aW5nIGZyZXNoLlwiXHJcbiAgICBzb2xvTGFzdFdhdGNoZWQgPSB7fVxyXG4gIGNvbnNvbGUubG9nIFwiUGFyc2VkIGxvY2FsU3RvcmFnZSdzIGxhc3R3YXRjaGVkOiBcIiwgc29sb0xhc3RXYXRjaGVkXHJcbmNhdGNoXHJcbiAgY29uc29sZS5sb2cgXCJGYWlsZWQgdG8gcGFyc2UgbG9jYWxTdG9yYWdlJ3MgbGFzdHdhdGNoZWQsIHN0YXJ0aW5nIGZyZXNoLlwiXHJcbiAgc29sb0xhc3RXYXRjaGVkID0ge31cclxuXHJcbmxhc3RQbGF5ZWRJRCA9IG51bGxcclxuXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbm92ZXJUaW1lcnMgPSBbXVxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0luZm8gPSB7fVxyXG5cclxuZGlzY29yZFRva2VuID0gbnVsbFxyXG5kaXNjb3JkVGFnID0gbnVsbFxyXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXHJcblxyXG5jYXN0QXZhaWxhYmxlID0gZmFsc2VcclxuY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5sYXVuY2hPcGVuID0gZmFsc2UgIyAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhdW5jaCcpID09IFwidHJ1ZVwiKVxyXG4jIGNvbnNvbGUubG9nIFwibGF1bmNoT3BlbjogI3tsYXVuY2hPcGVufVwiXHJcblxyXG5hZGRFbmFibGVkID0gdHJ1ZVxyXG5leHBvcnRFbmFibGVkID0gZmFsc2VcclxuXHJcbmlzVGVzbGEgPSBmYWxzZVxyXG50YXBUaW1lb3V0ID0gbnVsbFxyXG5cclxuY3VycmVudFBsYXlsaXN0TmFtZSA9IG51bGxcclxuXHJcbm9waW5pb25PcmRlciA9IFtdXHJcbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxuICBvcGluaW9uT3JkZXIucHVzaCBvXHJcbm9waW5pb25PcmRlci5wdXNoKCdub25lJylcclxuXHJcbnJhbmRvbVN0cmluZyA9IC0+XHJcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFnZUVwb2NoID0gbm93KClcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5vblRhcFNob3cgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwib25UYXBTaG93XCJcclxuXHJcbiAgb3V0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKVxyXG4gIGlmIHRhcFRpbWVvdXQ/XHJcbiAgICBjbGVhclRpbWVvdXQodGFwVGltZW91dClcclxuICAgIHRhcFRpbWVvdXQgPSBudWxsXHJcbiAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsc2VcclxuICAgIG91dGVyLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICB0YXBUaW1lb3V0ID0gc2V0VGltZW91dCAtPlxyXG4gICAgICBjb25zb2xlLmxvZyBcInRhcFRpbWVvdXQhXCJcclxuICAgICAgb3V0ZXIuc3R5bGUub3BhY2l0eSA9IDBcclxuICAgICAgdGFwVGltZW91dCA9IG51bGxcclxuICAgICwgMTAwMDBcclxuXHJcblxyXG5mYWRlSW4gPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiXHJcbiAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAwXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgKz0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5ID49IDFcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcblxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MSlcIlxyXG5cclxuZmFkZU91dCA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDFcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSAtPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDBcclxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWNvbnRyb2xzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikuZm9jdXMoKVxyXG4gIGxhdW5jaE9wZW4gPSB0cnVlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICd0cnVlJylcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpdmUnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXljb250cm9scycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxuc2hvd1dhdGNoTGl2ZSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpdmUnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Y29udHJvbHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuY2FsY1Blcm1hID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGlmIG5vdCBkaXNjb3JkTmlja25hbWU/IG9yIChzZWxlY3RlZE5hbWUubGVuZ3RoID09IDApXHJcbiAgICByZXR1cm4gXCJcIlxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwicFwiKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIi8je2VuY29kZVVSSUNvbXBvbmVudChkaXNjb3JkTmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZE5hbWUpfVwiXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuY2FsY1NoYXJlVVJMID0gKG1pcnJvcikgLT5cclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgaWYgbWlycm9yXHJcbiAgICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwibVwiKVxyXG4gICAgcmV0dXJuIGJhc2VVUkwgKyBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudChzb2xvSUQpXHJcblxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLnNldChcInNvbG9cIiwgXCJuZXdcIilcclxuICBwYXJhbXMuc2V0KFwiZmlsdGVyc1wiLCBwYXJhbXMuZ2V0KFwiZmlsdGVyc1wiKS50cmltKCkpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNhdmVuYW1lXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBpZiBwYXJhbXMuZ2V0KFwibWlycm9yXCIpP1xyXG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3BsYXkkLywgXCJjYXN0XCIpXHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXHJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XHJcbiAgICBjYXN0U2Vzc2lvbiA9IGVcclxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCwgZm9yY2U6IHRydWUgfSlcclxuICAsIG9uRXJyb3JcclxuXHJcbmNhbGNMYWJlbCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJzb2xvTGFiZWxzKDEpOiBcIiwgc29sb0xhYmVsc1xyXG4gIGlmIG5vdCBzb2xvTGFiZWxzP1xyXG4gICAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcclxuICBjb21wYW55ID0gbnVsbFxyXG4gIGlmIHNvbG9MYWJlbHM/XHJcbiAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgaWYgbm90IGNvbXBhbnk/XHJcbiAgICBjb21wYW55ID0gcGt0Lm5pY2tuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGt0Lm5pY2tuYW1lLnNsaWNlKDEpXHJcbiAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gIHJldHVybiBjb21wYW55XHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcclxuICBvdmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBmb3IgdCBpbiBvdmVyVGltZXJzXHJcbiAgICBjbGVhclRpbWVvdXQodClcclxuICBvdmVyVGltZXJzID0gW11cclxuXHJcbiAgYXJ0aXN0ID0gcGt0LmFydGlzdFxyXG4gIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICB0aXRsZSA9IHBrdC50aXRsZVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgY29tcGFueSA9IGF3YWl0IGNhbGNMYWJlbChwa3QpXHJcbiAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5Tb2xvIE1vZGVcIlxyXG4gIGVsc2VcclxuICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICBmZWVsaW5ncyA9IFtdXHJcbiAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgIGZlZWxpbmdzLnB1c2ggb1xyXG4gICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcclxuICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgIGVsc2VcclxuICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcclxuICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgbGlzdC5zb3J0KClcclxuICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXHJcbiAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMzAwMFxyXG4gIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIHJldHVyblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxyXG5cclxuICBsYXN0UGxheWVkSUQgPSBpZFxyXG4gIHBsYXllci5wbGF5KGlkLCBzdGFydFNlY29uZHMsIGVuZFNlY29uZHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgc2hvd0luZm8ocGt0KVxyXG5cclxuc29sb0luZm9Ccm9hZGNhc3QgPSAtPlxyXG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXHJcbiAgICBuZXh0VmlkZW8gPSBudWxsXHJcbiAgICBpZiBzb2xvSW5kZXggPCBzb2xvUXVldWUubGVuZ3RoIC0gMVxyXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4KzFdXHJcbiAgICBpbmZvID1cclxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXHJcbiAgICAgIG5leHQ6IG5leHRWaWRlb1xyXG4gICAgICBpbmRleDogc29sb0luZGV4ICsgMVxyXG4gICAgICBjb3VudDogc29sb0NvdW50XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJCcm9hZGNhc3Q6IFwiLCBpbmZvXHJcbiAgICBwa3QgPSB7XHJcbiAgICAgIGlkOiBzb2xvSURcclxuICAgICAgY21kOiAnaW5mbydcclxuICAgICAgaW5mbzogaW5mb1xyXG4gICAgfVxyXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLCBwa3RcclxuICAgIHNvbG9Db21tYW5kKHBrdClcclxuXHJcbnNvbG9TYXZlTGFzdFdhdGNoZWQgPSAtPlxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXN0d2F0Y2hlZCcsIEpTT04uc3RyaW5naWZ5KHNvbG9MYXN0V2F0Y2hlZCkpXHJcblxyXG5zb2xvUmVzZXRMYXN0V2F0Y2hlZCA9IC0+XHJcbiAgc29sb0xhc3RXYXRjaGVkID0ge31cclxuICBzb2xvU2F2ZUxhc3RXYXRjaGVkKClcclxuXHJcbmFza0ZvcmdldCA9IC0+XHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnZXQgeW91ciB3YXRjaCBoaXN0b3J5P1wiKVxyXG4gICAgc29sb1Jlc2V0TGFzdFdhdGNoZWQoKVxyXG4gICAgc2hvd0xpc3QodHJ1ZSlcclxuXHJcbnNvbG9DYWxjQnVja2V0cyA9IChsaXN0KSAtPlxyXG4gIGJ1Y2tldHMgPSBbXVxyXG4gIGZvciB0YiBpbiBUSU1FX0JVQ0tFVFNcclxuICAgIGJ1Y2tldHMucHVzaCB7XHJcbiAgICAgIHNpbmNlOiB0Yi5zaW5jZVxyXG4gICAgICBkZXNjcmlwdGlvbjogdGIuZGVzY3JpcHRpb25cclxuICAgICAgbGlzdDogW11cclxuICAgIH1cclxuXHJcbiAgdCA9IG5vdygpXHJcbiAgZm9yIGUgaW4gbGlzdFxyXG4gICAgc2luY2UgPSBzb2xvTGFzdFdhdGNoZWRbZS5pZF1cclxuICAgIGlmIHNpbmNlP1xyXG4gICAgICBzaW5jZSA9IHQgLSBzaW5jZVxyXG4gICAgZWxzZVxyXG4gICAgICBzaW5jZSA9IE5FVkVSX1dBVENIRURfVElNRVxyXG4gICAgIyBjb25zb2xlLmxvZyBcImlkICN7ZS5pZH0gc2luY2UgI3tzaW5jZX1cIlxyXG4gICAgZm9yIGJ1Y2tldCBpbiBidWNrZXRzXHJcbiAgICAgIGlmIGJ1Y2tldC5zaW5jZSA9PSAwXHJcbiAgICAgICAgIyB0aGUgY2F0Y2hhbGxcclxuICAgICAgICBidWNrZXQubGlzdC5wdXNoIGVcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBzaW5jZSA8IGJ1Y2tldC5zaW5jZVxyXG4gICAgICAgIGJ1Y2tldC5saXN0LnB1c2ggZVxyXG4gICAgICAgIGJyZWFrXHJcbiAgcmV0dXJuIGJ1Y2tldHMucmV2ZXJzZSgpICMgb2xkZXN0IHRvIG5ld2VzdFxyXG5cclxuc2h1ZmZsZUFycmF5ID0gKGFycmF5KSAtPlxyXG4gIGZvciBpIGluIFthcnJheS5sZW5ndGggLSAxIC4uLiAwXSBieSAtMVxyXG4gICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpXHJcbiAgICB0ZW1wID0gYXJyYXlbaV1cclxuICAgIGFycmF5W2ldID0gYXJyYXlbal1cclxuICAgIGFycmF5W2pdID0gdGVtcFxyXG5cclxuc29sb1NodWZmbGUgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiU2h1ZmZsaW5nLi4uXCJcclxuXHJcbiAgc29sb1F1ZXVlID0gW11cclxuICBidWNrZXRzID0gc29sb0NhbGNCdWNrZXRzKHNvbG9VbnNodWZmbGVkKVxyXG4gIGZvciBidWNrZXQgaW4gYnVja2V0c1xyXG4gICAgc2h1ZmZsZUFycmF5KGJ1Y2tldC5saXN0KVxyXG4gICAgZm9yIGUgaW4gYnVja2V0Lmxpc3RcclxuICAgICAgc29sb1F1ZXVlLnB1c2ggZVxyXG4gIHNvbG9JbmRleCA9IDBcclxuXHJcbnNvbG9QbGF5ID0gKGRlbHRhID0gMSkgLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgcmV0dXJuXHJcbiAgaWYgc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3Qgc29sb1ZpZGVvPyBvciAoc29sb1F1ZXVlLmxlbmd0aCA9PSAwKSBvciAoKHNvbG9JbmRleCArIGRlbHRhKSA+IChzb2xvUXVldWUubGVuZ3RoIC0gMSkpXHJcbiAgICBzb2xvU2h1ZmZsZSgpXHJcbiAgZWxzZVxyXG4gICAgc29sb0luZGV4ICs9IGRlbHRhXHJcblxyXG4gIGlmIHNvbG9JbmRleCA8IDBcclxuICAgIHNvbG9JbmRleCA9IDBcclxuICBzb2xvVmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4XVxyXG5cclxuICBjb25zb2xlLmxvZyBzb2xvVmlkZW9cclxuXHJcbiAgIyBkZWJ1Z1xyXG4gICMgc29sb1ZpZGVvLnN0YXJ0ID0gMTBcclxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxyXG4gICMgc29sb1ZpZGVvLmR1cmF0aW9uID0gNDBcclxuXHJcbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxyXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcclxuXHJcbiAgc29sb0xhc3RXYXRjaGVkW3NvbG9WaWRlby5pZF0gPSBub3coKVxyXG4gIHNvbG9TYXZlTGFzdFdhdGNoZWQoKVxyXG5cclxuXHJcbnNvbG9UaWNrID0gLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwic29sb1RpY2soKVwiXHJcblxyXG4gIGlmIHNvbG9JRD9cclxuICAgICMgU29sbyFcclxuICAgIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXHJcbiAgICAgIHJldHVyblxyXG4gICAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgICAgc29sb1BsYXkoKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgZWxzZVxyXG4gICAgIyBMaXZlIVxyXG5cclxuICAgIGlmIG5vdCBwbGF5aW5nXHJcbiAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHJldHVyblxyXG4gICAgdXNlciA9IHFzKCd1c2VyJylcclxuICAgIHNmdyA9IGZhbHNlXHJcbiAgICBpZiBxcygnc2Z3JylcclxuICAgICAgc2Z3ID0gdHJ1ZVxyXG4gICAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbm1lZGlhQnV0dG9uc1JlYWR5ID0gZmFsc2VcclxubGlzdGVuRm9yTWVkaWFCdXR0b25zID0gLT5cclxuICBpZiBtZWRpYUJ1dHRvbnNSZWFkeVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCB3aW5kb3cubmF2aWdhdG9yPy5tZWRpYVNlc3Npb24/XHJcbiAgICBzZXRUaW1lb3V0KC0+XHJcbiAgICAgIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXHJcbiAgICAsIDEwMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbWVkaWFCdXR0b25zUmVhZHkgPSB0cnVlXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAncHJldmlvdXN0cmFjaycsIC0+XHJcbiAgICBzb2xvUHJldigpXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAnbmV4dHRyYWNrJywgLT5cclxuICAgIHNvbG9Ta2lwKClcclxuICBjb25zb2xlLmxvZyBcIk1lZGlhIEJ1dHRvbnMgcmVhZHkuXCJcclxuXHJcbnJlbmRlclBsYXlsaXN0TmFtZSA9IC0+XHJcbiAgaWYgbm90IGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWxpc3RuYW1lJykuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5bGlzdG5hbWUnKS5pbm5lckhUTUwgPSBjdXJyZW50UGxheWxpc3ROYW1lXHJcbiAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvOiAje2N1cnJlbnRQbGF5bGlzdE5hbWV9XCJcclxuXHJcbnNlbmRSZWFkeSA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXHJcbiAgdXNlciA9IHFzKCd1c2VyJylcclxuICBzZncgPSBmYWxzZVxyXG4gIGlmIHFzKCdzZncnKVxyXG4gICAgc2Z3ID0gdHJ1ZVxyXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxyXG5cclxuc3RhcnRIZXJlID0gLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvbG92aWRlb2NvbnRhaW5lcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCdjb3JuZXInKVxyXG4gICAgaWYgaXNUZXNsYVxyXG4gICAgICBvblRhcFNob3coKVxyXG4gICAgZWxzZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCdmYWRleScpXHJcblxyXG4gICAgcGxheWVyID0gbmV3IFBsYXllcignI210di1wbGF5ZXInKVxyXG4gICAgcGxheWVyLmVuZGVkID0gKGV2ZW50KSAtPlxyXG4gICAgICBwbGF5aW5nID0gZmFsc2VcclxuICAgIHBsYXllci5wbGF5KCdBQjd5a09mQWdJQScpICMgTVRWIExvYWRpbmcuLi5cclxuXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgIyBTb2xvIE1vZGUhXHJcblxyXG4gICAgc2hvd1dhdGNoTGluaygpXHJcblxyXG4gICAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxyXG4gICAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXHJcbiAgICBpZiBub3Qgc29sb1Vuc2h1ZmZsZWQ/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBpZiBzb2xvVW5zaHVmZmxlZC5sZW5ndGggPT0gMFxyXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXHJcbiAgICAgIHJldHVyblxyXG4gICAgc29sb0NvdW50ID0gc29sb1Vuc2h1ZmZsZWQubGVuZ3RoXHJcblxyXG4gICAgc29sb1F1ZXVlID0gW11cclxuICAgIHNvbG9QbGF5KClcclxuICAgIGlmIHNvbG9NaXJyb3IgYW5kIHNvbG9JRFxyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgZWxzZVxyXG4gICAgIyBMaXZlIE1vZGUhXHJcbiAgICBzaG93V2F0Y2hMaXZlKClcclxuICAgIHNlbmRSZWFkeSgpXHJcblxyXG4gIGlmIHNvbG9UaWNrVGltZW91dD9cclxuICAgIGNsZWFySW50ZXJ2YWwoc29sb1RpY2tUaW1lb3V0KVxyXG4gIHNvbG9UaWNrVGltZW91dCA9IHNldEludGVydmFsKHNvbG9UaWNrLCA1MDAwKVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1aWNrbWVudVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBsaXN0ZW5Gb3JNZWRpYUJ1dHRvbnMoKVxyXG5cclxuICBpZiBpc1Rlc2xhXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFwc2hvdycpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcclxuXHJcbnNwcmlua2xlRm9ybVFTID0gKHBhcmFtcykgLT5cclxuICB1c2VyUVMgPSBxcygndXNlcicpXHJcbiAgaWYgdXNlclFTP1xyXG4gICAgcGFyYW1zLnNldCgndXNlcicsIHVzZXJRUylcclxuICBzZndRUyA9IHFzKCdzZncnKVxyXG4gIGlmIHNmd1FTP1xyXG4gICAgcGFyYW1zLnNldCgnc2Z3Jywgc2Z3UVMpXHJcblxyXG5jYWxjUGVybWFsaW5rID0gLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJsb2FkbmFtZVwiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxyXG4gIGlmIG5vdCBwYXJhbXMuZ2V0KCdzb2xvJylcclxuICAgIHBhcmFtcy5kZWxldGUoJ3NvbG8nKVxyXG4gIGlmIG5vdCBwYXJhbXMuZ2V0KCdmaWx0ZXJzJylcclxuICAgIHBhcmFtcy5kZWxldGUoJ2ZpbHRlcnMnKVxyXG4gIGlmIGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBwYXJhbXMuc2V0KFwibmFtZVwiLCBjdXJyZW50UGxheWxpc3ROYW1lKVxyXG4gIHNwcmlua2xlRm9ybVFTKHBhcmFtcylcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGlmIHF1ZXJ5c3RyaW5nLmxlbmd0aCA+IDBcclxuICAgIHF1ZXJ5c3RyaW5nID0gXCI/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBxdWVyeXN0cmluZ1xyXG4gIHJldHVybiBtdHZVUkxcclxuXHJcbmdlbmVyYXRlUGVybWFsaW5rID0gLT5cclxuICBjb25zb2xlLmxvZyBcImdlbmVyYXRlUGVybWFsaW5rKClcIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IGNhbGNQZXJtYWxpbmsoKVxyXG5cclxuZm9ybUNoYW5nZWQgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiRm9ybSBjaGFuZ2VkIVwiXHJcbiAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoJ2hlcmUnLCAnJywgY2FsY1Blcm1hbGluaygpKVxyXG4gIHJlbmRlclBsYXlsaXN0TmFtZSgpXHJcblxyXG5zb2xvU2tpcCA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdza2lwJ1xyXG4gIH1cclxuICBzb2xvUGxheSgpXHJcblxyXG5zb2xvUHJldiA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwcmV2J1xyXG4gIH1cclxuICBzb2xvUGxheSgtMSlcclxuXHJcbnNvbG9SZXN0YXJ0ID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3Jlc3RhcnQnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KDApXHJcblxyXG5zb2xvUGF1c2UgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAncGF1c2UnXHJcbiAgfVxyXG4gIHBhdXNlSW50ZXJuYWwoKVxyXG5cclxucmVuZGVySW5mbyA9IChpbmZvLCBpc0xpdmUgPSBmYWxzZSkgLT5cclxuICBpZiBub3QgaW5mbz8gb3Igbm90IGluZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBpbmZvXHJcblxyXG4gIGlmIGlzTGl2ZVxyXG4gICAgdGFnc1N0cmluZyA9IG51bGxcclxuICAgIGNvbXBhbnkgPSBhd2FpdCBpbmZvLmN1cnJlbnQuY29tcGFueVxyXG4gIGVsc2VcclxuICAgIHRhZ3NTdHJpbmcgPSBPYmplY3Qua2V5cyhpbmZvLmN1cnJlbnQudGFncykuc29ydCgpLmpvaW4oJywgJylcclxuICAgIGNvbXBhbnkgPSBhd2FpdCBjYWxjTGFiZWwoaW5mby5jdXJyZW50KVxyXG5cclxuICBodG1sID0gXCJcIlxyXG4gIGlmIG5vdCBpc0xpdmVcclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj5UcmFjayAje2luZm8uaW5kZXh9IC8gI3tpbmZvLmNvdW50fTwvZGl2PlwiXHJcblxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RodW1iXFxcIj48YSBocmVmPVxcXCJodHRwczovL3lvdXR1LmJlLyN7ZW5jb2RlVVJJQ29tcG9uZW50KGluZm8uY3VycmVudC5pZCl9XFxcIj48aW1nIHdpZHRoPTMyMCBoZWlnaHQ9MTgwIHNyYz1cXFwiI3tpbmZvLmN1cnJlbnQudGh1bWJ9XFxcIj48L2E+PC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2N1cnJlbnQgaW5mb2FydGlzdFxcXCI+I3tpbmZvLmN1cnJlbnQuYXJ0aXN0fTwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIiN7aW5mby5jdXJyZW50LnRpdGxlfVxcXCI8L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvbGFiZWxcXFwiPiN7Y29tcGFueX08L2Rpdj5cIlxyXG4gIGlmIG5vdCBpc0xpdmVcclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvdGFnc1xcXCI+Jm5ic3A7I3t0YWdzU3RyaW5nfSZuYnNwOzwvZGl2PlwiXHJcbiAgICBpZiBpbmZvLm5leHQ/XHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2hlYWRpbmcgbmV4dHZpZGVvXFxcIj5OZXh0Ojwvc3Bhbj4gXCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvYXJ0aXN0IG5leHR2aWRlb1xcXCI+I3tpbmZvLm5leHQuYXJ0aXN0fTwvc3Bhbj5cIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3RpdGxlIG5leHR2aWRlb1xcXCI+XFxcIiN7aW5mby5uZXh0LnRpdGxlfVxcXCI8L3NwYW4+XCJcclxuICAgIGVsc2VcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvaGVhZGluZyBuZXh0dmlkZW9cXFwiPk5leHQ6PC9zcGFuPiBcIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9yZXNodWZmbGUgbmV4dHZpZGVvXFxcIj4oLi4uUmVzaHVmZmxlLi4uKTwvc3Bhbj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuY2xpcGJvYXJkRWRpdCA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgc2V0VGltZW91dCAtPlxyXG4gICAgcmVuZGVyQ2xpcGJvYXJkKClcclxuICAsIDIwMDBcclxuXHJcbnJlbmRlckNsaXBib2FyZCA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvXFxcIiBkYXRhLWNsaXBib2FyZC10ZXh0PVxcXCIjbXR2IGVkaXQgI3tzb2xvSW5mby5jdXJyZW50LmlkfSBcXFwiIG9uY2xpY2s9XFxcImNsaXBib2FyZEVkaXQoKTsgcmV0dXJuIGZhbHNlXFxcIj5FZGl0PC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBib2FyZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBuZXcgQ2xpcGJvYXJkKCcuY2J1dHRvJylcclxuXHJcbm9uQWRkID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/LmN1cnJlbnQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmlkID0gc29sb0luZm8uY3VycmVudFxyXG4gIGZpbHRlclN0cmluZyA9IFN0cmluZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVycycpLnZhbHVlKS50cmltKClcclxuICBpZiBmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMFxyXG4gICAgZmlsdGVyU3RyaW5nICs9IFwiXFxuXCJcclxuICBmaWx0ZXJTdHJpbmcgKz0gXCJpZCAje3ZpZC5pZH0gIyAje3ZpZC5hcnRpc3R9IC0gI3t2aWQudGl0bGV9XFxuXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBmaWx0ZXJTdHJpbmdcclxuICBmb3JtQ2hhbmdlZCgpXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG8gY29waWVkXFxcIiBvbmNsaWNrPVxcXCJyZXR1cm4gZmFsc2VcXFwiPkFkZGVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQnKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgc2V0VGltZW91dCAtPlxyXG4gICAgcmVuZGVyQWRkKClcclxuICAsIDIwMDBcclxuXHJcbnJlbmRlckFkZCA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD8gb3Igbm90IGFkZEVuYWJsZWRcclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvXFxcIiBvbmNsaWNrPVxcXCJvbkFkZCgpOyByZXR1cm4gZmFsc2VcXFwiPkFkZDwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQnKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5jbGlwYm9hcmRNaXJyb3IgPSAtPlxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJtYnV0dG8gY29waWVkXFxcIiBvbmNsaWNrPVxcXCJyZXR1cm4gZmFsc2VcXFwiPkNvcGllZCE8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2JtaXJyb3InKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgc2V0VGltZW91dCAtPlxyXG4gICAgcmVuZGVyQ2xpcGJvYXJkTWlycm9yKClcclxuICAsIDIwMDBcclxuXHJcbnJlbmRlckNsaXBib2FyZE1pcnJvciA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwibWJ1dHRvXFxcIm9uY2xpY2s9XFxcImNsaXBib2FyZE1pcnJvcigpOyByZXR1cm4gZmFsc2VcXFwiPk1pcnJvcjwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYm1pcnJvcicpLmlubmVySFRNTCA9IGh0bWxcclxuICBuZXcgQ2xpcGJvYXJkICcubWJ1dHRvJywge1xyXG4gICAgdGV4dDogLT5cclxuICAgICAgcmV0dXJuIGNhbGNTaGFyZVVSTCh0cnVlKVxyXG4gIH1cclxuXHJcbnNoYXJlQ2xpcGJvYXJkID0gKG1pcnJvcikgLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmVjb3BpZWRcXFwiPkNvcGllZCB0byBjbGlwYm9hcmQ6PC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZXVybFxcXCI+I3tjYWxjU2hhcmVVUkwobWlycm9yKX08L2Rpdj5cclxuICBcIlwiXCJcclxuXHJcbnNoYXJlUGVybWEgPSAobWlycm9yKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZWNvcGllZFxcXCI+Q29waWVkIHRvIGNsaXBib2FyZDo8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNQZXJtYSgpfTwvZGl2PlxyXG4gIFwiXCJcIlxyXG5cclxuc2hvd0xpc3QgPSAoc2hvd0J1Y2tldHMgPSBmYWxzZSkgLT5cclxuICB0ID0gbm93KClcclxuICBpZiBsYXN0U2hvd0xpc3RUaW1lPyBhbmQgKCh0IC0gbGFzdFNob3dMaXN0VGltZSkgPCAzKVxyXG4gICAgc2hvd0J1Y2tldHMgPSB0cnVlXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJQbGVhc2Ugd2FpdC4uLlwiXHJcblxyXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWVcclxuICBsaXN0ID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nLCB0cnVlKVxyXG4gIGlmIG5vdCBsaXN0P1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIkVycm9yLiBTb3JyeS5cIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxkaXYgY2xhc3M9XFxcImxpc3Rjb250YWluZXJcXFwiPlwiXHJcblxyXG4gIGlmIHNob3dCdWNrZXRzICYmIChsaXN0Lmxlbmd0aCA+IDEpXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOiA8YSBjbGFzcz1cXFwiZm9yZ2V0bGlua1xcXCIgb25jbGljaz1cXFwiYXNrRm9yZ2V0KCk7IHJldHVybiBmYWxzZTtcXFwiPltGb3JnZXRdPC9hPjwvZGl2PlwiXHJcbiAgICBidWNrZXRzID0gc29sb0NhbGNCdWNrZXRzKGxpc3QpXHJcbiAgICBmb3IgYnVja2V0IGluIGJ1Y2tldHNcclxuICAgICAgaWYgYnVja2V0Lmxpc3QubGVuZ3RoIDwgMVxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvYnVja2V0XFxcIj5CdWNrZXQgWyN7YnVja2V0LmRlc2NyaXB0aW9ufV0gKCN7YnVja2V0Lmxpc3QubGVuZ3RofSB2aWRlb3MpOjwvZGl2PlwiXHJcbiAgICAgIGZvciBlIGluIGJ1Y2tldC5saXN0XHJcbiAgICAgICAgaHRtbCArPSBcIjxkaXY+XCJcclxuICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je2UuYXJ0aXN0fTwvc3Bhbj5cIlxyXG4gICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcclxuICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2UudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gICAgICAgIGh0bWwgKz0gXCI8L2Rpdj5cXG5cIlxyXG4gIGVsc2VcclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj4je2xpc3QubGVuZ3RofSB2aWRlb3M6PC9kaXY+XCJcclxuICAgIGZvciBlIGluIGxpc3RcclxuICAgICAgaHRtbCArPSBcIjxkaXY+XCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvYXJ0aXN0IG5leHR2aWRlb1xcXCI+I3tlLmFydGlzdH08L3NwYW4+XCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2UudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gICAgICBodG1sICs9IFwiPC9kaXY+XFxuXCJcclxuXHJcbiAgaHRtbCArPSBcIjwvZGl2PlwiXHJcblxyXG4gIGxhc3RTaG93TGlzdFRpbWUgPSB0XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5zaG93RXhwb3J0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVycycpLnZhbHVlXHJcbiAgbGlzdCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZywgdHJ1ZSlcclxuICBpZiBub3QgbGlzdD9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJFcnJvci4gU29ycnkuXCJcclxuICAgIHJldHVyblxyXG5cclxuICBleHBvcnRlZFBsYXlsaXN0cyA9IFwiXCJcclxuICBpZHMgPSBbXVxyXG4gIHBsYXlsaXN0SW5kZXggPSAxXHJcbiAgZm9yIGUgaW4gbGlzdFxyXG4gICAgaWYgaWRzLmxlbmd0aCA+PSA1MFxyXG4gICAgICBleHBvcnRlZFBsYXlsaXN0cyArPSBcIlwiXCJcclxuICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2hfdmlkZW9zP3ZpZGVvX2lkcz0je2lkcy5qb2luKCcsJyl9XCI+RXhwb3J0ZWQgUGxheWxpc3QgI3twbGF5bGlzdEluZGV4fSAoI3tpZHMubGVuZ3RofSk8L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgICAgcGxheWxpc3RJbmRleCArPSAxXHJcbiAgICAgIGlkcyA9IFtdXHJcbiAgICBpZHMucHVzaCBlLmlkXHJcbiAgaWYgaWRzLmxlbmd0aCA+IDBcclxuICAgIGV4cG9ydGVkUGxheWxpc3RzICs9IFwiXCJcIlxyXG4gICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2hfdmlkZW9zP3ZpZGVvX2lkcz0je2lkcy5qb2luKCcsJyl9XCI+RXhwb3J0ZWQgUGxheWxpc3QgI3twbGF5bGlzdEluZGV4fSAoI3tpZHMubGVuZ3RofSk8L2E+PGJyPlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJsaXN0Y29udGFpbmVyXFxcIj5cclxuICAgICAgI3tleHBvcnRlZFBsYXlsaXN0c31cclxuICAgIDwvZGl2PlxyXG4gIFwiXCJcIlxyXG5cclxuY2xlYXJPcGluaW9uID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBcIlwiXHJcblxyXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cclxuICBodG1sID0gXCJcIlxyXG4gIGZvciBvIGluIG9waW5pb25PcmRlciBieSAtMVxyXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXHJcbiAgICBjbGFzc2VzID0gXCJvYnV0dG9cIlxyXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxyXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cclxuICBpZiBub3QgZGlzY29yZFRva2VuPyBvciBub3QgbGFzdFBsYXllZElEP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogbGFzdFBsYXllZElELCBzZXQ6IG9waW5pb24gfVxyXG5cclxucGF1c2VJbnRlcm5hbCA9IC0+XHJcbiAgaWYgcGxheWVyP1xyXG4gICAgcGxheWVyLnRvZ2dsZVBhdXNlKClcclxuXHJcbnNvbG9Db21tYW5kID0gKHBrdCkgLT5cclxuICBpZiBwa3QuaWQgIT0gc29sb0lEXHJcbiAgICByZXR1cm5cclxuICBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XHJcbiAgc3dpdGNoIHBrdC5jbWRcclxuICAgIHdoZW4gJ3ByZXYnXHJcbiAgICAgIHNvbG9QbGF5KC0xKVxyXG4gICAgd2hlbiAnc2tpcCdcclxuICAgICAgc29sb1BsYXkoMSlcclxuICAgIHdoZW4gJ3Jlc3RhcnQnXHJcbiAgICAgIHNvbG9QbGF5KDApXHJcbiAgICB3aGVuICdwYXVzZSdcclxuICAgICAgcGF1c2VJbnRlcm5hbCgpXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBwa3QuaW5mbz9cclxuICAgICAgICBjb25zb2xlLmxvZyBcIk5FVyBJTkZPITogXCIsIHBrdC5pbmZvXHJcbiAgICAgICAgc29sb0luZm8gPSBwa3QuaW5mb1xyXG4gICAgICAgIGF3YWl0IHJlbmRlckluZm8oc29sb0luZm8sIGZhbHNlKVxyXG4gICAgICAgIHJlbmRlckFkZCgpXHJcbiAgICAgICAgcmVuZGVyQ2xpcGJvYXJkKClcclxuICAgICAgICByZW5kZXJDbGlwYm9hcmRNaXJyb3IoKVxyXG4gICAgICAgIGlmIHNvbG9NaXJyb3JcclxuICAgICAgICAgIHNvbG9WaWRlbyA9IHBrdC5pbmZvLmN1cnJlbnRcclxuICAgICAgICAgIGlmIHNvbG9WaWRlbz9cclxuICAgICAgICAgICAgaWYgbm90IHBsYXllcj9cclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIm5vIHBsYXllciB5ZXRcIlxyXG4gICAgICAgICAgICBleHRyYU9mZnNldCA9IDBcclxuICAgICAgICAgICAgaWYgcGt0LmluZm8udHU/IGFuZCBwa3QuaW5mby50Yj9cclxuICAgICAgICAgICAgICBleHRyYU9mZnNldCA9IDEgKyBwa3QuaW5mby50YiAtIHBrdC5pbmZvLnR1XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJFeHRyYSBvZmZzZXQ6ICN7ZXh0cmFPZmZzZXR9XCJcclxuICAgICAgICAgICAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0ICsgZXh0cmFPZmZzZXQsIHNvbG9WaWRlby5lbmQpXHJcbiAgICAgICAgY2xlYXJPcGluaW9uKClcclxuICAgICAgICBpZiBkaXNjb3JkVG9rZW4/IGFuZCBzb2xvSW5mby5jdXJyZW50PyBhbmQgc29sb0luZm8uY3VycmVudC5pZD9cclxuICAgICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogc29sb0luZm8uY3VycmVudC5pZCB9XHJcblxyXG51cGRhdGVTb2xvSUQgPSAobmV3U29sb0lEKSAtPlxyXG4gIHNvbG9JRCA9IG5ld1NvbG9JRFxyXG4gIGlmIG5vdCBzb2xvSUQ/XHJcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6IG5vIHNvbG8gcXVlcnkgcGFyYW1ldGVyXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic29sb2lkXCIpLnZhbHVlID0gc29sb0lEXHJcbiAgaWYgc29ja2V0P1xyXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxyXG5cclxubG9hZFBsYXlsaXN0ID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGN1cnJlbnRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlXHJcbiAgaWYgbm90IHNlbGVjdGVkTmFtZT9cclxuICAgIHJldHVyblxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkTmFtZS50cmltKClcclxuICBpZiBzZWxlY3RlZE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgY3VycmVudEZpbHRlcnMubGVuZ3RoID4gMFxyXG4gICAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9hZCAnI3tzZWxlY3RlZE5hbWV9Jz9cIilcclxuICAgICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwibG9hZFwiXHJcbiAgICBsb2FkbmFtZTogc2VsZWN0ZWROYW1lXHJcbiAgfVxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBzZWxlY3RlZE5hbWVcclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5kZWxldGVQbGF5bGlzdCA9IC0+XHJcbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcclxuICBpZiBub3Qgc2VsZWN0ZWROYW1lP1xyXG4gICAgcmV0dXJuXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWROYW1lLnRyaW0oKVxyXG4gIGlmIHNlbGVjdGVkTmFtZS5sZW5ndGggPCAxXHJcbiAgICByZXR1cm5cclxuICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2FkICcje3NlbGVjdGVkTmFtZX0nP1wiKVxyXG4gICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwiZGVsXCJcclxuICAgIGRlbG5hbWU6IHNlbGVjdGVkTmFtZVxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5zYXZlUGxheWxpc3QgPSAtPlxyXG4gIG91dHB1dE5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlXHJcbiAgb3V0cHV0TmFtZSA9IG91dHB1dE5hbWUudHJpbSgpXHJcbiAgb3V0cHV0RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZVxyXG4gIGlmIG91dHB1dE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2F2ZSAnI3tvdXRwdXROYW1lfSc/XCIpXHJcbiAgICByZXR1cm5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJzYXZlXCJcclxuICAgIHNhdmVuYW1lOiBvdXRwdXROYW1lXHJcbiAgICBmaWx0ZXJzOiBvdXRwdXRGaWx0ZXJzXHJcbiAgfVxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBvdXRwdXROYW1lXHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxucmVxdWVzdFVzZXJQbGF5bGlzdHMgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcImxpc3RcIlxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5yZWNlaXZlVXNlclBsYXlsaXN0ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcInJlY2VpdmVVc2VyUGxheWxpc3RcIiwgcGt0XHJcbiAgaWYgcGt0Lmxpc3Q/XHJcbiAgICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICAgIGNvbWJvLm9wdGlvbnMubGVuZ3RoID0gMFxyXG4gICAgcGt0Lmxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgYS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi50b0xvd2VyQ2FzZSgpKVxyXG4gICAgZm9yIG5hbWUgaW4gcGt0Lmxpc3RcclxuICAgICAgaXNTZWxlY3RlZCA9IChuYW1lID09IHBrdC5zZWxlY3RlZClcclxuICAgICAgY29tYm8ub3B0aW9uc1tjb21iby5vcHRpb25zLmxlbmd0aF0gPSBuZXcgT3B0aW9uKG5hbWUsIG5hbWUsIGZhbHNlLCBpc1NlbGVjdGVkKVxyXG4gICAgaWYgcGt0Lmxpc3QubGVuZ3RoID09IDBcclxuICAgICAgY29tYm8ub3B0aW9uc1tjb21iby5vcHRpb25zLmxlbmd0aF0gPSBuZXcgT3B0aW9uKFwiTm9uZVwiLCBcIlwiKVxyXG4gIGlmIHBrdC5sb2FkbmFtZT9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZW5hbWVcIikudmFsdWUgPSBwa3QubG9hZG5hbWVcclxuICBpZiBwa3QuZmlsdGVycz9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHBrdC5maWx0ZXJzXHJcbiAgZm9ybUNoYW5nZWQoKVxyXG5cclxubG9nb3V0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiTG9nZ2luZyBvdXQuLi5cIlxyXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXHJcbiAgZGlzY29yZFRva2VuID0gbnVsbFxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICAgIHJlcXVlc3RVc2VyUGxheWxpc3RzKClcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luaGludFwiPihMb2dpbiBvbiA8YSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiPkRhc2hib2FyZDwvYT4pPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlYXJlYVwiKT8uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG5nb0xpdmUgPSAtPlxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNvbG9cIilcclxuICBwYXJhbXMuZGVsZXRlKFwiZmlsdGVyc1wiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJsb2FkbmFtZVwiKVxyXG4gIHNwcmlua2xlRm9ybVFTKHBhcmFtcylcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJnb0xpdmU6ICN7bXR2VVJMfVwiXHJcbiAgd2luZG93LmxvY2F0aW9uID0gbXR2VVJMXHJcblxyXG5nb1NvbG8gPSAtPlxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLnNldChcInNvbG9cIiwgXCJuZXdcIilcclxuICBzcHJpbmtsZUZvcm1RUyhwYXJhbXMpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCI/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIGNvbnNvbGUubG9nIFwiZ29Tb2xvOiAje210dlVSTH1cIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IG10dlVSTFxyXG5cclxud2luZG93Lm9ubG9hZCA9IC0+XHJcbiAgd2luZG93LmFza0ZvcmdldCA9IGFza0ZvcmdldFxyXG4gIHdpbmRvdy5jbGlwYm9hcmRFZGl0ID0gY2xpcGJvYXJkRWRpdFxyXG4gIHdpbmRvdy5jbGlwYm9hcmRNaXJyb3IgPSBjbGlwYm9hcmRNaXJyb3JcclxuICB3aW5kb3cuZGVsZXRlUGxheWxpc3QgPSBkZWxldGVQbGF5bGlzdFxyXG4gIHdpbmRvdy5mb3JtQ2hhbmdlZCA9IGZvcm1DaGFuZ2VkXHJcbiAgd2luZG93LmdvTGl2ZSA9IGdvTGl2ZVxyXG4gIHdpbmRvdy5nb1NvbG8gPSBnb1NvbG9cclxuICB3aW5kb3cubG9hZFBsYXlsaXN0ID0gbG9hZFBsYXlsaXN0XHJcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxyXG4gIHdpbmRvdy5vbkFkZCA9IG9uQWRkXHJcbiAgd2luZG93Lm9uVGFwU2hvdyA9IG9uVGFwU2hvd1xyXG4gIHdpbmRvdy5zYXZlUGxheWxpc3QgPSBzYXZlUGxheWxpc3RcclxuICB3aW5kb3cuc2V0T3BpbmlvbiA9IHNldE9waW5pb25cclxuICB3aW5kb3cuc2hhcmVDbGlwYm9hcmQgPSBzaGFyZUNsaXBib2FyZFxyXG4gIHdpbmRvdy5zaGFyZVBlcm1hID0gc2hhcmVQZXJtYVxyXG4gIHdpbmRvdy5zaG93RXhwb3J0ID0gc2hvd0V4cG9ydFxyXG4gIHdpbmRvdy5zaG93TGlzdCA9IHNob3dMaXN0XHJcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXHJcbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXHJcbiAgd2luZG93LnNob3dXYXRjaExpdmUgPSBzaG93V2F0Y2hMaXZlXHJcbiAgd2luZG93LnNvbG9QYXVzZSA9IHNvbG9QYXVzZVxyXG4gIHdpbmRvdy5zb2xvUHJldiA9IHNvbG9QcmV2XHJcbiAgd2luZG93LnNvbG9SZXN0YXJ0ID0gc29sb1Jlc3RhcnRcclxuICB3aW5kb3cuc29sb1NraXAgPSBzb2xvU2tpcFxyXG4gIHdpbmRvdy5zdGFydENhc3QgPSBzdGFydENhc3RcclxuICB3aW5kb3cuc3RhcnRIZXJlID0gc3RhcnRIZXJlXHJcblxyXG4gIGF1dG9zdGFydCA9IHFzKCdzdGFydCcpP1xyXG5cclxuICAjIGFkZEVuYWJsZWQgPSBxcygnYWRkJyk/XHJcbiAgIyBjb25zb2xlLmxvZyBcIkFkZCBFbmFibGVkOiAje2FkZEVuYWJsZWR9XCJcclxuXHJcbiAgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudFxyXG4gIGlmIHVzZXJBZ2VudD8gYW5kIFN0cmluZyh1c2VyQWdlbnQpLm1hdGNoKC9UZXNsYVxcLzIwLylcclxuICAgIGlzVGVzbGEgPSB0cnVlXHJcblxyXG4gIGlmIGlzVGVzbGFcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRlcicpLmNsYXNzTGlzdC5hZGQoJ3Rlc2xhJylcclxuXHJcbiAgY3VycmVudFBsYXlsaXN0TmFtZSA9IHFzKCduYW1lJylcclxuICBpZiBjdXJyZW50UGxheWxpc3ROYW1lP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlbmFtZVwiKS52YWx1ZSA9IGN1cnJlbnRQbGF5bGlzdE5hbWVcclxuXHJcbiAgZXhwb3J0RW5hYmxlZCA9IHFzKCdleHBvcnQnKT9cclxuICBjb25zb2xlLmxvZyBcIkV4cG9ydCBFbmFibGVkOiAje2V4cG9ydEVuYWJsZWR9XCJcclxuICBpZiBleHBvcnRFbmFibGVkXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwb3J0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICAgIDxpbnB1dCBjbGFzcz1cImZzdWJcIiB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJFeHBvcnRcIiBvbmNsaWNrPVwiZXZlbnQucHJldmVudERlZmF1bHQoKTsgc2hvd0V4cG9ydCgpO1wiIHRpdGxlPVwiRXhwb3J0IGxpc3RzIGludG8gY2xpY2thYmxlIHBsYXlsaXN0c1wiPlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIHNvbG9JRFFTID0gcXMoJ3NvbG8nKVxyXG4gIGlmIHNvbG9JRFFTP1xyXG4gICAgIyBpbml0aWFsaXplIHNvbG8gbW9kZVxyXG4gICAgdXBkYXRlU29sb0lEKHNvbG9JRFFTKVxyXG5cclxuICAgIGlmIGxhdW5jaE9wZW5cclxuICAgICAgc2hvd1dhdGNoRm9ybSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHNob3dXYXRjaExpbmsoKVxyXG4gIGVsc2VcclxuICAgICMgbGl2ZSBtb2RlXHJcbiAgICBzaG93V2F0Y2hMaXZlKClcclxuXHJcbiAgcXNGaWx0ZXJzID0gcXMoJ2ZpbHRlcnMnKVxyXG4gIGlmIHFzRmlsdGVycz9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHFzRmlsdGVyc1xyXG5cclxuICBzb2xvTWlycm9yID0gcXMoJ21pcnJvcicpP1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlycm9yXCIpLmNoZWNrZWQgPSBzb2xvTWlycm9yXHJcbiAgaWYgc29sb01pcnJvclxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnNlY3Rpb24nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlycm9ybm90ZScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuXHJcbiAgc29ja2V0Lm9uICdjb25uZWN0JywgLT5cclxuICAgIGlmIHNvbG9JRD9cclxuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxyXG4gICAgc2VuZElkZW50aXR5KClcclxuXHJcbiAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cclxuICAgIHNvbG9Db21tYW5kKHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICdpZGVudGlmeScsIChwa3QpIC0+XHJcbiAgICByZWNlaXZlSWRlbnRpdHkocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ29waW5pb24nLCAocGt0KSAtPlxyXG4gICAgdXBkYXRlT3Bpbmlvbihwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAndXNlcnBsYXlsaXN0JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVVc2VyUGxheWxpc3QocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxyXG4gICAgaWYgcGxheWVyPyBhbmQgbm90IHNvbG9JRD9cclxuICAgICAgcGxheShwa3QsIHBrdC5pZCwgcGt0LnN0YXJ0LCBwa3QuZW5kKVxyXG4gICAgICBjbGVhck9waW5pb24oKVxyXG4gICAgICBpZiBkaXNjb3JkVG9rZW4/IGFuZCBwa3QuaWQ/XHJcbiAgICAgICAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBwa3QuaWQgfVxyXG4gICAgICByZW5kZXJJbmZvKHtcclxuICAgICAgICBjdXJyZW50OiBwa3RcclxuICAgICAgfSwgdHJ1ZSlcclxuXHJcbiAgcHJlcGFyZUNhc3QoKVxyXG5cclxuICBpZiBhdXRvc3RhcnRcclxuICAgIGNvbnNvbGUubG9nIFwiQVVUTyBTVEFSVFwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mbycpLmlubmVySFRNTCA9IFwiQVVUTyBTVEFSVFwiXHJcbiAgICBzdGFydEhlcmUoKVxyXG5cclxuICBuZXcgQ2xpcGJvYXJkICcuc2hhcmUnLCB7XHJcbiAgICB0ZXh0OiAodHJpZ2dlcikgLT5cclxuICAgICAgaWYgdHJpZ2dlci52YWx1ZS5tYXRjaCgvUGVybWEvaSlcclxuICAgICAgICByZXR1cm4gY2FsY1Blcm1hKClcclxuICAgICAgbWlycm9yID0gZmFsc2VcclxuICAgICAgaWYgdHJpZ2dlci52YWx1ZS5tYXRjaCgvTWlycm9yL2kpXHJcbiAgICAgICAgbWlycm9yID0gdHJ1ZVxyXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKG1pcnJvcilcclxuICB9XHJcbiIsImZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xyXG5cclxuY2xhc3MgUGxheWVyXHJcbiAgY29uc3RydWN0b3I6IChkb21JRCwgc2hvd0NvbnRyb2xzID0gdHJ1ZSkgLT5cclxuICAgIEBlbmRlZCA9IG51bGxcclxuICAgIG9wdGlvbnMgPSB1bmRlZmluZWRcclxuICAgIGlmIG5vdCBzaG93Q29udHJvbHNcclxuICAgICAgb3B0aW9ucyA9IHsgY29udHJvbHM6IFtdIH1cclxuICAgIEBwbHlyID0gbmV3IFBseXIoZG9tSUQsIG9wdGlvbnMpXHJcbiAgICBAcGx5ci5vbiAncmVhZHknLCAoZXZlbnQpID0+XHJcbiAgICAgIEBwbHlyLnBsYXkoKVxyXG4gICAgQHBseXIub24gJ2VuZGVkJywgKGV2ZW50KSA9PlxyXG4gICAgICBpZiBAZW5kZWQ/XHJcbiAgICAgICAgQGVuZGVkKClcclxuXHJcbiAgcGxheTogKGlkLCBzdGFydFNlY29uZHMgPSB1bmRlZmluZWQsIGVuZFNlY29uZHMgPSB1bmRlZmluZWQpIC0+XHJcbiAgICBpZEluZm8gPSBmaWx0ZXJzLmNhbGNJZEluZm8oaWQpXHJcbiAgICBpZiBub3QgaWRJbmZvP1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBzd2l0Y2ggaWRJbmZvLnByb3ZpZGVyXHJcbiAgICAgIHdoZW4gJ3lvdXR1YmUnXHJcbiAgICAgICAgc291cmNlID0ge1xyXG4gICAgICAgICAgc3JjOiBpZEluZm8ucmVhbFxyXG4gICAgICAgICAgcHJvdmlkZXI6ICd5b3V0dWJlJ1xyXG4gICAgICAgIH1cclxuICAgICAgd2hlbiAnbXR2J1xyXG4gICAgICAgIHNvdXJjZSA9IHtcclxuICAgICAgICAgIHNyYzogXCIvdmlkZW9zLyN7aWRJbmZvLnJlYWx9Lm1wNFwiXHJcbiAgICAgICAgICB0eXBlOiAndmlkZW8vbXA0J1xyXG4gICAgICAgIH1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgIGlmKHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPiAwKSlcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSBzdGFydFNlY29uZHNcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIubXR2U3RhcnQgPSB1bmRlZmluZWRcclxuICAgIGlmKGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+IDApKVxyXG4gICAgICBAcGx5ci5tdHZFbmQgPSBlbmRTZWNvbmRzXHJcbiAgICBlbHNlXHJcbiAgICAgIEBwbHlyLm10dkVuZCA9IHVuZGVmaW5lZFxyXG4gICAgQHBseXIuc291cmNlID1cclxuICAgICAgdHlwZTogJ3ZpZGVvJyxcclxuICAgICAgdGl0bGU6ICdNVFYnLFxyXG4gICAgICBzb3VyY2VzOiBbc291cmNlXVxyXG5cclxuICB0b2dnbGVQYXVzZTogLT5cclxuICAgIGlmIEBwbHlyLnBhdXNlZFxyXG4gICAgICBAcGx5ci5wbGF5KClcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIucGF1c2UoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIG9waW5pb25zOlxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcblxyXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcclxuZmlsdGVyT3BpbmlvbnMgPSB7fVxyXG5cclxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXHJcbmZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBudWxsXHJcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhcnNlRHVyYXRpb24gPSAocykgLT5cclxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcclxuXHJcbnNldFNlcnZlckRhdGFiYXNlcyA9IChkYiwgb3BpbmlvbnMsIGdldFVzZXJGcm9tTmlja25hbWUpIC0+XHJcbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxyXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcclxuICBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gZ2V0VXNlckZyb21OaWNrbmFtZVxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxyXG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXHJcblxyXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cclxuICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxyXG4gIGVsc2VcclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxyXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcclxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG4gIGlmIHNvbG9GaWx0ZXJzP1xyXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXHJcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXHJcblxyXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcclxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcclxuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC8gKy8pXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxyXG4gICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBuZWdhdGVkID0gZmFsc2VcclxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxyXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxyXG5cclxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXHJcbiAgICAgIGlkTG9va3VwID0gbnVsbFxyXG5cclxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXHJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXHJcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxyXG5cclxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdhZGRlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXHJcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcclxuICAgICAgICB3aGVuICd0YWcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcclxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cclxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXHJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXHJcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ25vbmUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ2Z1bGwnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxyXG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBpZiBpZExvb2t1cD9cclxuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcclxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cclxuICAgICAgICAgIGlmIG5vdCBlP1xyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgICAgICBpc01hdGNoID0gZmlsdGVyRnVuYyhlLCBzdWJzdHJpbmcpXHJcbiAgICAgICAgICBpZiBuZWdhdGVkXHJcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxyXG4gICAgICAgICAgaWYgaXNNYXRjaFxyXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcclxuXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxyXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxyXG4gIGVsc2VcclxuICAgICMgUXVldWUgaXQgYWxsIHVwXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcblxyXG4gIGlmIHNvcnRCeUFydGlzdFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcclxuXHJcbmNhbGNJZEluZm8gPSAoaWQpIC0+XHJcbiAgaWYgbm90IG1hdGNoZXMgPSBpZC5tYXRjaCgvXihbYS16XSspXyhcXFMrKS8pXHJcbiAgICBjb25zb2xlLmxvZyBcImNhbGNJZEluZm86IEJhZCBJRDogI3tpZH1cIlxyXG4gICAgcmV0dXJuIG51bGxcclxuICBwcm92aWRlciA9IG1hdGNoZXNbMV1cclxuICByZWFsID0gbWF0Y2hlc1syXVxyXG5cclxuICBzd2l0Y2ggcHJvdmlkZXJcclxuICAgIHdoZW4gJ3lvdXR1YmUnXHJcbiAgICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je3JlYWx9XCJcclxuICAgIHdoZW4gJ210didcclxuICAgICAgdXJsID0gXCIvdmlkZW9zLyN7cmVhbH0ubXA0XCJcclxuICAgIGVsc2VcclxuICAgICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgUHJvdmlkZXI6ICN7cHJvdmlkZXJ9XCJcclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGlkOiBpZFxyXG4gICAgcHJvdmlkZXI6IHByb3ZpZGVyXHJcbiAgICByZWFsOiByZWFsXHJcbiAgICB1cmw6IHVybFxyXG4gIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xyXG4gIGdlbmVyYXRlTGlzdDogZ2VuZXJhdGVMaXN0XHJcbiAgY2FsY0lkSW5mbzogY2FsY0lkSW5mb1xyXG4iXX0=
