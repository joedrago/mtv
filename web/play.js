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
var Clipboard, DASHCAST_NAMESPACE, NEVER_WATCHED_TIME, Player, TIME_BUCKETS, addEnabled, askForget, calcLabel, calcPerma, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, clipboardMirror, constants, currentPlaylistName, deletePlaylist, discordNickname, discordTag, discordToken, endedTimer, exportEnabled, fadeIn, fadeOut, filters, formChanged, generatePermalink, getData, goLive, goSolo, isTesla, k, lastPlayedID, lastShowListTime, launchOpen, len, listenForMediaButtons, loadPlaylist, logout, mediaButtonsReady, now, o, onAdd, onError, onInitSuccess, onTapShow, opinionOrder, overTimers, pageEpoch, pauseInternal, play, player, playing, prepareCast, qs, randomString, rawJSON, receiveIdentity, receiveUserPlaylist, ref, renderAdd, renderClipboard, renderClipboardMirror, renderInfo, renderPlaylistName, requestUserPlaylists, savePlaylist, sendIdentity, sendReady, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, sharePerma, showExport, showInfo, showList, showWatchForm, showWatchLink, showWatchLive, shuffleArray, socket, soloCalcBuckets, soloCommand, soloCount, soloError, soloFatalError, soloID, soloIndex, soloInfo, soloInfoBroadcast, soloLabels, soloLastWatched, soloMirror, soloPause, soloPlay, soloPrev, soloQueue, soloResetLastWatched, soloRestart, soloSaveLastWatched, soloShuffle, soloSkip, soloTick, soloTickTimeout, soloUnshuffled, soloVideo, splitArtist, sprinkleFormQS, startCast, startHere, tapTimeout, trimAllWhitespace, updateOpinion, updateSoloID;

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

soloFatalError = function(reason) {
  console.log(`soloFatalError: ${reason}`);
  document.body.innerHTML = `ERROR: ${reason}`;
  return soloError = true;
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
  var bucket, buckets, e, l, len1, len2, len3, m, n, ref1, s;
  console.log("Shuffling...");
  soloQueue = [];
  if (filters.isOrdered()) {
    for (l = 0, len1 = soloUnshuffled.length; l < len1; l++) {
      s = soloUnshuffled[l];
      soloQueue.push(s);
    }
  } else {
    buckets = soloCalcBuckets(soloUnshuffled);
    for (m = 0, len2 = buckets.length; m < len2; m++) {
      bucket = buckets[m];
      shuffleArray(bucket.list);
      ref1 = bucket.list;
      for (n = 0, len3 = ref1.length; n < len3; n++) {
        e = ref1[n];
        soloQueue.push(e);
      }
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
var cacheOpinions, calcIdInfo, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, isOrdered, iso8601, lastOrdered, now, parseDuration, setServerDatabases;

filterDatabase = null;

filterOpinions = {};

filterServerOpinions = null;

filterGetUserFromNickname = null;

iso8601 = require('iso8601-duration');

lastOrdered = false;

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

isOrdered = function() {
  return lastOrdered;
};

generateList = async function(filterString, sortByArtist = false) {
  var allAllowed, command, durationInSeconds, e, end, filter, filterFunc, filterOpinion, filterUser, i, id, idLookup, isMatch, j, k, l, len, len1, len2, len3, m, matches, negated, pieces, pipeSplit, property, rawFilters, ref, ref1, since, soloFilters, soloUnlisted, soloUnshuffled, someException, start, substring, title, unlisted;
  lastOrdered = false;
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
      if (pieces[0] === "ordered") {
        lastOrdered = true;
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
  if (sortByArtist && !lastOrdered) {
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
  isOrdered: isOrdered,
  generateList: generateList,
  calcIdInfo: calcIdInfo
};


},{"iso8601-duration":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9wbGF5LmNvZmZlZSIsInNyYy9jbGllbnQvcGxheWVyLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFNBQUEsRUFBQSxtQkFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxpQkFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLGdCQUFBLEVBQUEsVUFBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLGVBQUEsRUFBQSxtQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxh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UCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxTQUFBLEVBQVcsU0FEWDtFQUVBLFlBQUEsRUFBYyxZQUZkO0VBR0EsVUFBQSxFQUFZO0FBSFoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiFcbiAqIGNsaXBib2FyZC5qcyB2Mi4wLjhcbiAqIGh0dHBzOi8vY2xpcGJvYXJkanMuY29tL1xuICpcbiAqIExpY2Vuc2VkIE1JVCDCqSBaZW5vIFJvY2hhXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKCkgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlc19fID0gKHtcblxuLyoqKi8gMTM0OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBFWFBPUlRTXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywge1xuICBcImRlZmF1bHRcIjogZnVuY3Rpb24oKSB7IHJldHVybiAvKiBiaW5kaW5nICovIGNsaXBib2FyZDsgfVxufSk7XG5cbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzXG52YXIgdGlueV9lbWl0dGVyID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNzkpO1xudmFyIHRpbnlfZW1pdHRlcl9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubih0aW55X2VtaXR0ZXIpO1xuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy9nb29kLWxpc3RlbmVyL3NyYy9saXN0ZW4uanNcbnZhciBsaXN0ZW4gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM3MCk7XG52YXIgbGlzdGVuX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKGxpc3Rlbik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL3NlbGVjdC9zcmMvc2VsZWN0LmpzXG52YXIgc3JjX3NlbGVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oODE3KTtcbnZhciBzZWxlY3RfZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4oc3JjX3NlbGVjdCk7XG47Ly8gQ09OQ0FURU5BVEVEIE1PRFVMRTogLi9zcmMvY2xpcGJvYXJkLWFjdGlvbi5qc1xuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cblxuLyoqXG4gKiBJbm5lciBjbGFzcyB3aGljaCBwZXJmb3JtcyBzZWxlY3Rpb24gZnJvbSBlaXRoZXIgYHRleHRgIG9yIGB0YXJnZXRgXG4gKiBwcm9wZXJ0aWVzIGFuZCB0aGVuIGV4ZWN1dGVzIGNvcHkgb3IgY3V0IG9wZXJhdGlvbnMuXG4gKi9cblxudmFyIENsaXBib2FyZEFjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkQWN0aW9uKG9wdGlvbnMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkQWN0aW9uKTtcblxuICAgIHRoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5pbml0U2VsZWN0aW9uKCk7XG4gIH1cbiAgLyoqXG4gICAqIERlZmluZXMgYmFzZSBwcm9wZXJ0aWVzIHBhc3NlZCBmcm9tIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhDbGlwYm9hcmRBY3Rpb24sIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSBvcHRpb25zLmFjdGlvbjtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG4gICAgICB0aGlzLmVtaXR0ZXIgPSBvcHRpb25zLmVtaXR0ZXI7XG4gICAgICB0aGlzLnRhcmdldCA9IG9wdGlvbnMudGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy50ZXh0O1xuICAgICAgdGhpcy50cmlnZ2VyID0gb3B0aW9ucy50cmlnZ2VyO1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVjaWRlcyB3aGljaCBzZWxlY3Rpb24gc3RyYXRlZ3kgaXMgZ29pbmcgdG8gYmUgYXBwbGllZCBiYXNlZFxuICAgICAqIG9uIHRoZSBleGlzdGVuY2Ugb2YgYHRleHRgIGFuZCBgdGFyZ2V0YCBwcm9wZXJ0aWVzLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaW5pdFNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0U2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudGV4dCkge1xuICAgICAgICB0aGlzLnNlbGVjdEZha2UoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RUYXJnZXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZha2UgdGV4dGFyZWEgZWxlbWVudCwgc2V0cyBpdHMgdmFsdWUgZnJvbSBgdGV4dGAgcHJvcGVydHksXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjcmVhdGVGYWtlRWxlbWVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVGYWtlRWxlbWVudCgpIHtcbiAgICAgIHZhciBpc1JUTCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RpcicpID09PSAncnRsJztcbiAgICAgIHRoaXMuZmFrZUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpOyAvLyBQcmV2ZW50IHpvb21pbmcgb24gaU9TXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuZm9udFNpemUgPSAnMTJwdCc7IC8vIFJlc2V0IGJveCBtb2RlbFxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLmJvcmRlciA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUucGFkZGluZyA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUubWFyZ2luID0gJzAnOyAvLyBNb3ZlIGVsZW1lbnQgb3V0IG9mIHNjcmVlbiBob3Jpem9udGFsbHlcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlW2lzUlRMID8gJ3JpZ2h0JyA6ICdsZWZ0J10gPSAnLTk5OTlweCc7IC8vIE1vdmUgZWxlbWVudCB0byB0aGUgc2FtZSBwb3NpdGlvbiB2ZXJ0aWNhbGx5XG5cbiAgICAgIHZhciB5UG9zaXRpb24gPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUudG9wID0gXCJcIi5jb25jYXQoeVBvc2l0aW9uLCBcInB4XCIpO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgdGhpcy5mYWtlRWxlbS52YWx1ZSA9IHRoaXMudGV4dDtcbiAgICAgIHJldHVybiB0aGlzLmZha2VFbGVtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQncyB0aGUgdmFsdWUgb2YgZmFrZUVsZW0sXG4gICAgICogYW5kIG1ha2VzIGEgc2VsZWN0aW9uIG9uIGl0LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0RmFrZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RGYWtlKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGZha2VFbGVtID0gdGhpcy5jcmVhdGVGYWtlRWxlbWVudCgpO1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyID0gdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2spIHx8IHRydWU7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChmYWtlRWxlbSk7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkoZmFrZUVsZW0pO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgICAgdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9ubHkgcmVtb3ZlcyB0aGUgZmFrZSBlbGVtZW50IGFmdGVyIGFub3RoZXIgY2xpY2sgZXZlbnQsIHRoYXQgd2F5XG4gICAgICogYSB1c2VyIGNhbiBoaXQgYEN0cmwrQ2AgdG8gY29weSBiZWNhdXNlIHNlbGVjdGlvbiBzdGlsbCBleGlzdHMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUZha2UoKSB7XG4gICAgICBpZiAodGhpcy5mYWtlSGFuZGxlcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5mYWtlRWxlbSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmZha2VFbGVtKTtcbiAgICAgICAgdGhpcy5mYWtlRWxlbSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgdGhlIGNvbnRlbnQgZnJvbSBlbGVtZW50IHBhc3NlZCBvbiBgdGFyZ2V0YCBwcm9wZXJ0eS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RUYXJnZXQoKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkodGhpcy50YXJnZXQpO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgY29weSBvcGVyYXRpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY29weVRleHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weVRleHQoKSB7XG4gICAgICB2YXIgc3VjY2VlZGVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBzdWNjZWVkZWQgPSBkb2N1bWVudC5leGVjQ29tbWFuZCh0aGlzLmFjdGlvbik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0KHN1Y2NlZWRlZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIGFuIGV2ZW50IGJhc2VkIG9uIHRoZSBjb3B5IG9wZXJhdGlvbiByZXN1bHQuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBzdWNjZWVkZWRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVJlc3VsdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXN1bHQoc3VjY2VlZGVkKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdChzdWNjZWVkZWQgPyAnc3VjY2VzcycgOiAnZXJyb3InLCB7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgIHRleHQ6IHRoaXMuc2VsZWN0ZWRUZXh0LFxuICAgICAgICB0cmlnZ2VyOiB0aGlzLnRyaWdnZXIsXG4gICAgICAgIGNsZWFyU2VsZWN0aW9uOiB0aGlzLmNsZWFyU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBmb2N1cyBhd2F5IGZyb20gYHRhcmdldGAgYW5kIGJhY2sgdG8gdGhlIHRyaWdnZXIsIHJlbW92ZXMgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjbGVhclNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBgYWN0aW9uYCB0byBiZSBwZXJmb3JtZWQgd2hpY2ggY2FuIGJlIGVpdGhlciAnY29weScgb3IgJ2N1dCcuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvblxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWN0aW9uXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnY29weSc7XG4gICAgICB0aGlzLl9hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgIGlmICh0aGlzLl9hY3Rpb24gIT09ICdjb3B5JyAmJiB0aGlzLl9hY3Rpb24gIT09ICdjdXQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcImFjdGlvblwiIHZhbHVlLCB1c2UgZWl0aGVyIFwiY29weVwiIG9yIFwiY3V0XCInKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYGFjdGlvbmAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hY3Rpb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5IHVzaW5nIGFuIGVsZW1lbnRcbiAgICAgKiB0aGF0IHdpbGwgYmUgaGF2ZSBpdHMgY29udGVudCBjb3BpZWQuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInRhcmdldFwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgX3R5cGVvZih0YXJnZXQpID09PSAnb2JqZWN0JyAmJiB0YXJnZXQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdjb3B5JyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiBhdHRyaWJ1dGUuIFBsZWFzZSB1c2UgXCJyZWFkb25seVwiIGluc3RlYWQgb2YgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2N1dCcgJiYgKHRhcmdldC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5JykgfHwgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gWW91IGNhblxcJ3QgY3V0IHRleHQgZnJvbSBlbGVtZW50cyB3aXRoIFwicmVhZG9ubHlcIiBvciBcImRpc2FibGVkXCIgYXR0cmlidXRlcycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3RhcmdldCA9IHRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiB2YWx1ZSwgdXNlIGEgdmFsaWQgRWxlbWVudCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ3xIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmRBY3Rpb247XG59KCk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZF9hY3Rpb24gPSAoQ2xpcGJvYXJkQWN0aW9uKTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQuanNcbmZ1bmN0aW9uIGNsaXBib2FyZF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IGNsaXBib2FyZF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBjbGlwYm9hcmRfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTsgfVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuXG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmIChjYWxsICYmIChjbGlwYm9hcmRfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7IHJldHVybiBjYWxsOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkgeyBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7IGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7IGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7IHRyeSB7IERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoRGF0ZSwgW10sIGZ1bmN0aW9uICgpIHt9KSk7IHJldHVybiB0cnVlOyB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfSB9XG5cbmZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cblxuXG5cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmV0cmlldmUgYXR0cmlidXRlIHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd9IHN1ZmZpeFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKi9cblxuZnVuY3Rpb24gZ2V0QXR0cmlidXRlVmFsdWUoc3VmZml4LCBlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJ1dGUgPSBcImRhdGEtY2xpcGJvYXJkLVwiLmNvbmNhdChzdWZmaXgpO1xuXG4gIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xufVxuLyoqXG4gKiBCYXNlIGNsYXNzIHdoaWNoIHRha2VzIG9uZSBvciBtb3JlIGVsZW1lbnRzLCBhZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGVtLFxuICogYW5kIGluc3RhbnRpYXRlcyBhIG5ldyBgQ2xpcGJvYXJkQWN0aW9uYCBvbiBlYWNoIGNsaWNrLlxuICovXG5cblxudmFyIENsaXBib2FyZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0VtaXR0ZXIpIHtcbiAgX2luaGVyaXRzKENsaXBib2FyZCwgX0VtaXR0ZXIpO1xuXG4gIHZhciBfc3VwZXIgPSBfY3JlYXRlU3VwZXIoQ2xpcGJvYXJkKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRyaWdnZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIENsaXBib2FyZCh0cmlnZ2VyLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsaXBib2FyZCk7XG5cbiAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpO1xuXG4gICAgX3RoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBfdGhpcy5saXN0ZW5DbGljayh0cmlnZ2VyKTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBpZiBhdHRyaWJ1dGVzIHdvdWxkIGJlIHJlc29sdmVkIHVzaW5nIGludGVybmFsIHNldHRlciBmdW5jdGlvbnNcbiAgICogb3IgY3VzdG9tIGZ1bmN0aW9ucyB0aGF0IHdlcmUgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG5cblxuICBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ2xpcGJvYXJkLCBbe1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlT3B0aW9ucygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuYWN0aW9uID0gdHlwZW9mIG9wdGlvbnMuYWN0aW9uID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5hY3Rpb24gOiB0aGlzLmRlZmF1bHRBY3Rpb247XG4gICAgICB0aGlzLnRhcmdldCA9IHR5cGVvZiBvcHRpb25zLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGFyZ2V0IDogdGhpcy5kZWZhdWx0VGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gdHlwZW9mIG9wdGlvbnMudGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGV4dCA6IHRoaXMuZGVmYXVsdFRleHQ7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNsaXBib2FyZF90eXBlb2Yob3B0aW9ucy5jb250YWluZXIpID09PSAnb2JqZWN0JyA/IG9wdGlvbnMuY29udGFpbmVyIDogZG9jdW1lbnQuYm9keTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGNsaWNrIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwYXNzZWQgdHJpZ2dlci5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibGlzdGVuQ2xpY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGlzdGVuQ2xpY2sodHJpZ2dlcikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5fZGVmYXVsdCgpKHRyaWdnZXIsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIub25DbGljayhlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2sgZXZlbnQuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwib25DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNsaWNrKGUpIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gZS5kZWxlZ2F0ZVRhcmdldCB8fCBlLmN1cnJlbnRUYXJnZXQ7XG5cbiAgICAgIGlmICh0aGlzLmNsaXBib2FyZEFjdGlvbikge1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbmV3IGNsaXBib2FyZF9hY3Rpb24oe1xuICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uKHRyaWdnZXIpLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0KHRyaWdnZXIpLFxuICAgICAgICB0ZXh0OiB0aGlzLnRleHQodHJpZ2dlciksXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcy5jb250YWluZXIsXG4gICAgICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgICAgIGVtaXR0ZXI6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGBhY3Rpb25gIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRBY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdEFjdGlvbih0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ2FjdGlvbicsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0YXJnZXRgIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUYXJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdFRhcmdldCh0cmlnZ2VyKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBnZXRBdHRyaWJ1dGVWYWx1ZSgndGFyZ2V0JywgdHJpZ2dlcik7XG5cbiAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1cHBvcnQgb2YgdGhlIGdpdmVuIGFjdGlvbiwgb3IgYWxsIGFjdGlvbnMgaWYgbm8gYWN0aW9uIGlzXG4gICAgICogZ2l2ZW4uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFthY3Rpb25dXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0VGV4dFwiLFxuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgdGV4dGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGV4dCh0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ3RleHQnLCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyLmRlc3Ryb3koKTtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfV0sIFt7XG4gICAga2V5OiBcImlzU3VwcG9ydGVkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzU3VwcG9ydGVkKCkge1xuICAgICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogWydjb3B5JywgJ2N1dCddO1xuICAgICAgdmFyIGFjdGlvbnMgPSB0eXBlb2YgYWN0aW9uID09PSAnc3RyaW5nJyA/IFthY3Rpb25dIDogYWN0aW9uO1xuICAgICAgdmFyIHN1cHBvcnQgPSAhIWRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN1cHBvcnRlZDtcbiAgICAgIGFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHN1cHBvcnQgPSBzdXBwb3J0ICYmICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkKGFjdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmQ7XG59KCh0aW55X2VtaXR0ZXJfZGVmYXVsdCgpKSk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZCA9IChDbGlwYm9hcmQpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gODI4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG52YXIgRE9DVU1FTlRfTk9ERV9UWVBFID0gOTtcblxuLyoqXG4gKiBBIHBvbHlmaWxsIGZvciBFbGVtZW50Lm1hdGNoZXMoKVxuICovXG5pZiAodHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgdmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbiAgICBwcm90by5tYXRjaGVzID0gcHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCBtYXRjaGVzIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgIT09IERPQ1VNRU5UX05PREVfVFlQRSkge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQubWF0Y2hlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb3Nlc3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDQzODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgY2xvc2VzdCA9IF9fd2VicGFja19yZXF1aXJlX18oODI4KTtcblxuLyoqXG4gKiBEZWxlZ2F0ZXMgZXZlbnQgdG8gYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX2RlbGVnYXRlKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIHZhciBsaXN0ZW5lckZuID0gbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lckZuLCB1c2VDYXB0dXJlKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd8QXJyYXl9IFtlbGVtZW50c11cbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gZGVsZWdhdGUoZWxlbWVudHMsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIC8vIEhhbmRsZSB0aGUgcmVndWxhciBFbGVtZW50IHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cy5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgRWxlbWVudC1sZXNzIHVzYWdlLCBpdCBkZWZhdWx0cyB0byBnbG9iYWwgZGVsZWdhdGlvblxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBVc2UgYGRvY3VtZW50YCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLCB0aGVuIGFwcGx5IGFyZ3VtZW50c1xuICAgICAgICAvLyBUaGlzIGlzIGEgc2hvcnQgd2F5IHRvIC51bnNoaWZ0IGBhcmd1bWVudHNgIHdpdGhvdXQgcnVubmluZyBpbnRvIGRlb3B0aW1pemF0aW9uc1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlLmJpbmQobnVsbCwgZG9jdW1lbnQpLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIFNlbGVjdG9yLWJhc2VkIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgQXJyYXktbGlrZSBiYXNlZCB1c2FnZVxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kcyBjbG9zZXN0IG1hdGNoIGFuZCBpbnZva2VzIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBsaXN0ZW5lcihlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gY2xvc2VzdChlLnRhcmdldCwgc2VsZWN0b3IpO1xuXG4gICAgICAgIGlmIChlLmRlbGVnYXRlVGFyZ2V0KSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGVsZW1lbnQsIGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Nzk6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIGV4cG9ydHMpIHtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgJiYgdmFsdWUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudFxuICAgICAgICAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gMTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBsaXN0IG9mIEhUTUwgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLm5vZGVMaXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiAodHlwZSA9PT0gJ1tvYmplY3QgTm9kZUxpc3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nKVxuICAgICAgICAmJiAoJ2xlbmd0aCcgaW4gdmFsdWUpXG4gICAgICAgICYmICh2YWx1ZS5sZW5ndGggPT09IDAgfHwgZXhwb3J0cy5ub2RlKHZhbHVlWzBdKSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5zdHJpbmcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5mbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuXG4gICAgcmV0dXJuIHR5cGUgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzNzA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGlzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4NzkpO1xudmFyIGRlbGVnYXRlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MzgpO1xuXG4vKipcbiAqIFZhbGlkYXRlcyBhbGwgcGFyYW1zIGFuZCBjYWxscyB0aGUgcmlnaHRcbiAqIGxpc3RlbmVyIGZ1bmN0aW9uIGJhc2VkIG9uIGl0cyB0YXJnZXQgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRhcmdldCAmJiAhdHlwZSAmJiAhY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHJlcXVpcmVkIGFyZ3VtZW50cycpO1xuICAgIH1cblxuICAgIGlmICghaXMuc3RyaW5nKHR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5mbihjYWxsYmFjaykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhpcmQgYXJndW1lbnQgbXVzdCBiZSBhIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzLm5vZGUodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZSh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMubm9kZUxpc3QodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZUxpc3QodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzLnN0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5TZWxlY3Rvcih0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcsIEhUTUxFbGVtZW50LCBIVE1MQ29sbGVjdGlvbiwgb3IgTm9kZUxpc3QnKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byBhIEhUTUwgZWxlbWVudFxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGUobm9kZSwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50c1xuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxIVE1MQ29sbGVjdGlvbn0gbm9kZUxpc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ob2RlTGlzdChub2RlTGlzdCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5vZGVMaXN0LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgc2VsZWN0b3JcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3RlblNlbGVjdG9yKHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBkZWxlZ2F0ZShkb2N1bWVudC5ib2R5LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RlbjtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gODE3OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5mdW5jdGlvbiBzZWxlY3QoZWxlbWVudCkge1xuICAgIHZhciBzZWxlY3RlZFRleHQ7XG5cbiAgICBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdJTlBVVCcgfHwgZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICB2YXIgaXNSZWFkT25seSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpO1xuXG4gICAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5zZWxlY3QoKTtcbiAgICAgICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSgwLCBlbGVtZW50LnZhbHVlLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgncmVhZG9ubHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RlZFRleHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZWN0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAyNzk6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIEUgKCkge1xuICAvLyBLZWVwIHRoaXMgZW1wdHkgc28gaXQncyBlYXNpZXIgdG8gaW5oZXJpdCBmcm9tXG4gIC8vICh2aWEgaHR0cHM6Ly9naXRodWIuY29tL2xpcHNtYWNrIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9pc3N1ZXMvMylcbn1cblxuRS5wcm90b3R5cGUgPSB7XG4gIG9uOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG5cbiAgICAoZVtuYW1lXSB8fCAoZVtuYW1lXSA9IFtdKSkucHVzaCh7XG4gICAgICBmbjogY2FsbGJhY2ssXG4gICAgICBjdHg6IGN0eFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgc2VsZi5vZmYobmFtZSwgbGlzdGVuZXIpO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBsaXN0ZW5lci5fID0gY2FsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBsaXN0ZW5lciwgY3R4KTtcbiAgfSxcblxuICBlbWl0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBkYXRhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBldnRBcnIgPSAoKHRoaXMuZSB8fCAodGhpcy5lID0ge30pKVtuYW1lXSB8fCBbXSkuc2xpY2UoKTtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbiA9IGV2dEFyci5sZW5ndGg7XG5cbiAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgZXZ0QXJyW2ldLmZuLmFwcGx5KGV2dEFycltpXS5jdHgsIGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcbiAgICB2YXIgZXZ0cyA9IGVbbmFtZV07XG4gICAgdmFyIGxpdmVFdmVudHMgPSBbXTtcblxuICAgIGlmIChldnRzICYmIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZXZ0c1tpXS5mbiAhPT0gY2FsbGJhY2sgJiYgZXZ0c1tpXS5mbi5fICE9PSBjYWxsYmFjaylcbiAgICAgICAgICBsaXZlRXZlbnRzLnB1c2goZXZ0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGV2ZW50IGZyb20gcXVldWUgdG8gcHJldmVudCBtZW1vcnkgbGVha1xuICAgIC8vIFN1Z2dlc3RlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbGF6ZFxuICAgIC8vIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9jb21taXQvYzZlYmZhYTliYzk3M2IzM2QxMTBhODRhMzA3NzQyYjdjZjk0Yzk1MyNjb21taXRjb21tZW50LTUwMjQ5MTBcblxuICAgIChsaXZlRXZlbnRzLmxlbmd0aClcbiAgICAgID8gZVtuYW1lXSA9IGxpdmVFdmVudHNcbiAgICAgIDogZGVsZXRlIGVbbmFtZV07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFO1xubW9kdWxlLmV4cG9ydHMuVGlueUVtaXR0ZXIgPSBFO1xuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIFx0fSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG4vKioqKioqLyBcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcbi8qKioqKiovIFx0XHRcdFx0fVxuLyoqKioqKi8gXHRcdFx0fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH1cbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBydW50aW1lIHNvIGVudHJ5IGlubGluaW5nIGlzIGRpc2FibGVkXG4vKioqKioqLyBcdC8vIHN0YXJ0dXBcbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzNCk7XG4vKioqKioqLyB9KSgpXG4uZGVmYXVsdDtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xuQ2xpcGJvYXJkID0gcmVxdWlyZSAnY2xpcGJvYXJkJ1xuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5QbGF5ZXIgPSByZXF1aXJlICcuL3BsYXllcidcblxuc29ja2V0ID0gbnVsbFxuXG5wbGF5ZXIgPSBudWxsXG5lbmRlZFRpbWVyID0gbnVsbFxucGxheWluZyA9IGZhbHNlXG5zb2xvVW5zaHVmZmxlZCA9IFtdXG5zb2xvUXVldWUgPSBbXVxuc29sb0luZGV4ID0gMFxuc29sb1RpY2tUaW1lb3V0ID0gbnVsbFxuc29sb1ZpZGVvID0gbnVsbFxuc29sb0Vycm9yID0gbnVsbFxuc29sb0NvdW50ID0gMFxuc29sb0xhYmVscyA9IG51bGxcbnNvbG9NaXJyb3IgPSBmYWxzZVxuXG5USU1FX0JVQ0tFVFMgPSBbXG4gIHsgc2luY2U6IDEyMDAsIGRlc2NyaXB0aW9uOiBcIjIwIG1pblwiIH1cbiAgeyBzaW5jZTogMzYwMCwgZGVzY3JpcHRpb246IFwiMSBob3VyXCIgfVxuICB7IHNpbmNlOiAxMDgwMCwgZGVzY3JpcHRpb246IFwiMyBob3Vyc1wiIH1cbiAgeyBzaW5jZTogMjg4MDAsIGRlc2NyaXB0aW9uOiBcIjggaG91cnNcIiB9XG4gIHsgc2luY2U6IDg2NDAwLCBkZXNjcmlwdGlvbjogXCIxIGRheVwiIH1cbiAgeyBzaW5jZTogMjU5MjAwLCBkZXNjcmlwdGlvbjogXCIzIGRheXNcIiB9XG4gIHsgc2luY2U6IDYwNDgwMCwgZGVzY3JpcHRpb246IFwiMSB3ZWVrXCIgfVxuICB7IHNpbmNlOiAyNDE5MjAwLCBkZXNjcmlwdGlvbjogXCI0IHdlZWtzXCIgfVxuICB7IHNpbmNlOiAzMTUzNjAwMCwgZGVzY3JpcHRpb246IFwiMSB5ZWFyXCIgfVxuICB7IHNpbmNlOiAzMTUzNjAwMDAsIGRlc2NyaXB0aW9uOiBcIjEwIHllYXJzXCIgfVxuICB7IHNpbmNlOiAzMTUzNjAwMDAwLCBkZXNjcmlwdGlvbjogXCIxMDAgeWVhcnNcIiB9XG4gIHsgc2luY2U6IDAsIGRlc2NyaXB0aW9uOiBcIk5ldmVyIHdhdGNoZWRcIiB9XG5dXG5ORVZFUl9XQVRDSEVEX1RJTUUgPSBUSU1FX0JVQ0tFVFNbVElNRV9CVUNLRVRTLmxlbmd0aCAtIDJdLnNpbmNlICsgMVxuXG5sYXN0U2hvd0xpc3RUaW1lID0gbnVsbFxuc29sb0xhc3RXYXRjaGVkID0ge31cbnRyeVxuICByYXdKU09OID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhc3R3YXRjaGVkJylcbiAgc29sb0xhc3RXYXRjaGVkID0gSlNPTi5wYXJzZShyYXdKU09OKVxuICBpZiBub3Qgc29sb0xhc3RXYXRjaGVkPyBvciAodHlwZW9mKHNvbG9MYXN0V2F0Y2hlZCkgIT0gJ29iamVjdCcpXG4gICAgY29uc29sZS5sb2cgXCJzb2xvTGFzdFdhdGNoZWQgaXMgbm90IGFuIG9iamVjdCwgc3RhcnRpbmcgZnJlc2guXCJcbiAgICBzb2xvTGFzdFdhdGNoZWQgPSB7fVxuICBjb25zb2xlLmxvZyBcIlBhcnNlZCBsb2NhbFN0b3JhZ2UncyBsYXN0d2F0Y2hlZDogXCIsIHNvbG9MYXN0V2F0Y2hlZFxuY2F0Y2hcbiAgY29uc29sZS5sb2cgXCJGYWlsZWQgdG8gcGFyc2UgbG9jYWxTdG9yYWdlJ3MgbGFzdHdhdGNoZWQsIHN0YXJ0aW5nIGZyZXNoLlwiXG4gIHNvbG9MYXN0V2F0Y2hlZCA9IHt9XG5cbmxhc3RQbGF5ZWRJRCA9IG51bGxcblxuZW5kZWRUaW1lciA9IG51bGxcbm92ZXJUaW1lcnMgPSBbXVxuXG5EQVNIQ0FTVF9OQU1FU1BBQ0UgPSAndXJuOngtY2FzdDplcy5vZmZkLmRhc2hjYXN0J1xuXG5zb2xvSUQgPSBudWxsXG5zb2xvSW5mbyA9IHt9XG5cbmRpc2NvcmRUb2tlbiA9IG51bGxcbmRpc2NvcmRUYWcgPSBudWxsXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXG5cbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxuY2FzdFNlc3Npb24gPSBudWxsXG5cbmxhdW5jaE9wZW4gPSBmYWxzZSAjIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbGF1bmNoJykgPT0gXCJ0cnVlXCIpXG4jIGNvbnNvbGUubG9nIFwibGF1bmNoT3BlbjogI3tsYXVuY2hPcGVufVwiXG5cbmFkZEVuYWJsZWQgPSB0cnVlXG5leHBvcnRFbmFibGVkID0gZmFsc2VcblxuaXNUZXNsYSA9IGZhbHNlXG50YXBUaW1lb3V0ID0gbnVsbFxuXG5jdXJyZW50UGxheWxpc3ROYW1lID0gbnVsbFxuXG5vcGluaW9uT3JkZXIgPSBbXVxuZm9yIG8gaW4gY29uc3RhbnRzLm9waW5pb25PcmRlclxuICBvcGluaW9uT3JkZXIucHVzaCBvXG5vcGluaW9uT3JkZXIucHVzaCgnbm9uZScpXG5cbnJhbmRvbVN0cmluZyA9IC0+XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KVxuXG5ub3cgPSAtPlxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcblxuc29sb0ZhdGFsRXJyb3IgPSAocmVhc29uKSAtPlxuICBjb25zb2xlLmxvZyBcInNvbG9GYXRhbEVycm9yOiAje3JlYXNvbn1cIlxuICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6ICN7cmVhc29ufVwiXG4gIHNvbG9FcnJvciA9IHRydWVcblxucGFnZUVwb2NoID0gbm93KClcblxucXMgPSAobmFtZSkgLT5cbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cbiAgICByZXR1cm4gbnVsbFxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXG5cbm9uVGFwU2hvdyA9IC0+XG4gIGNvbnNvbGUubG9nIFwib25UYXBTaG93XCJcblxuICBvdXRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRlcicpXG4gIGlmIHRhcFRpbWVvdXQ/XG4gICAgY2xlYXJUaW1lb3V0KHRhcFRpbWVvdXQpXG4gICAgdGFwVGltZW91dCA9IG51bGxcbiAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMFxuICBlbHNlXG4gICAgb3V0ZXIuc3R5bGUub3BhY2l0eSA9IDFcbiAgICB0YXBUaW1lb3V0ID0gc2V0VGltZW91dCAtPlxuICAgICAgY29uc29sZS5sb2cgXCJ0YXBUaW1lb3V0IVwiXG4gICAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMFxuICAgICAgdGFwVGltZW91dCA9IG51bGxcbiAgICAsIDEwMDAwXG5cblxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxuICBpZiBub3QgZWxlbT9cbiAgICByZXR1cm5cblxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDBcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMVxuXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXG5cbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XG4gIGlmIG5vdCBlbGVtP1xuICAgIHJldHVyblxuXG4gIGlmIG1zPyBhbmQgbXMgPiAwXG4gICAgb3BhY2l0eSA9IDFcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxuICAgICAgICBvcGFjaXR5ID0gMFxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxuICAgICwgNTBcbiAgZWxzZVxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG5cbnNob3dXYXRjaEZvcm0gPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXljb250cm9scycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS5mb2N1cygpXG4gIGxhdW5jaE9wZW4gPSB0cnVlXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAndHJ1ZScpXG5cbnNob3dXYXRjaExpbmsgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpdmUnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Y29udHJvbHMnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICBsYXVuY2hPcGVuID0gZmFsc2VcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXG5cbnNob3dXYXRjaExpdmUgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXljb250cm9scycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAnZmFsc2UnKVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxuXG5vbkluaXRTdWNjZXNzID0gLT5cbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxuICBjYXN0QXZhaWxhYmxlID0gdHJ1ZVxuXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XG5cbnNlc3Npb25MaXN0ZW5lciA9IChlKSAtPlxuICBjYXN0U2Vzc2lvbiA9IGVcblxuc2Vzc2lvblVwZGF0ZUxpc3RlbmVyID0gKGlzQWxpdmUpIC0+XG4gIGlmIG5vdCBpc0FsaXZlXG4gICAgY2FzdFNlc3Npb24gPSBudWxsXG5cbnByZXBhcmVDYXN0ID0gLT5cbiAgaWYgbm90IGNocm9tZS5jYXN0IG9yIG5vdCBjaHJvbWUuY2FzdC5pc0F2YWlsYWJsZVxuICAgIGlmIG5vdygpIDwgKHBhZ2VFcG9jaCArIDEwKSAjIGdpdmUgdXAgYWZ0ZXIgMTAgc2Vjb25kc1xuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcbiAgICByZXR1cm5cblxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XG4gIGFwaUNvbmZpZyA9IG5ldyBjaHJvbWUuY2FzdC5BcGlDb25maWcgc2Vzc2lvblJlcXVlc3QsIHNlc3Npb25MaXN0ZW5lciwgLT5cbiAgY2hyb21lLmNhc3QuaW5pdGlhbGl6ZShhcGlDb25maWcsIG9uSW5pdFN1Y2Nlc3MsIG9uRXJyb3IpXG5cbmNhbGNQZXJtYSA9IC0+XG4gIGNvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkbmFtZVwiKVxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcbiAgaWYgbm90IGRpc2NvcmROaWNrbmFtZT8gb3IgKHNlbGVjdGVkTmFtZS5sZW5ndGggPT0gMClcbiAgICByZXR1cm4gXCJcIlxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3BsYXkkLywgXCJwXCIpXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIi8je2VuY29kZVVSSUNvbXBvbmVudChkaXNjb3JkTmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZE5hbWUpfVwiXG4gIHJldHVybiBtdHZVUkxcblxuY2FsY1NoYXJlVVJMID0gKG1pcnJvcikgLT5cbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxuICBpZiBtaXJyb3JcbiAgICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwibVwiKVxuICAgIHJldHVybiBiYXNlVVJMICsgXCIvXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc29sb0lEKVxuXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcbiAgcGFyYW1zLnNldChcInNvbG9cIiwgXCJuZXdcIilcbiAgcGFyYW1zLnNldChcImZpbHRlcnNcIiwgcGFyYW1zLmdldChcImZpbHRlcnNcIikudHJpbSgpKVxuICBwYXJhbXMuZGVsZXRlKFwic2F2ZW5hbWVcIilcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcbiAgcmV0dXJuIG10dlVSTFxuXG5zdGFydENhc3QgPSAtPlxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcblxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIGlmIHBhcmFtcy5nZXQoXCJtaXJyb3JcIik/XG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3BsYXkkLywgXCJjYXN0XCIpXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXG4gIGNvbnNvbGUubG9nIFwiV2UncmUgZ29pbmcgaGVyZTogI3ttdHZVUkx9XCJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XG4gICAgY2FzdFNlc3Npb24gPSBlXG4gICAgY2FzdFNlc3Npb24uc2VuZE1lc3NhZ2UoREFTSENBU1RfTkFNRVNQQUNFLCB7IHVybDogbXR2VVJMLCBmb3JjZTogdHJ1ZSB9KVxuICAsIG9uRXJyb3JcblxuY2FsY0xhYmVsID0gKHBrdCkgLT5cbiAgY29uc29sZS5sb2cgXCJzb2xvTGFiZWxzKDEpOiBcIiwgc29sb0xhYmVsc1xuICBpZiBub3Qgc29sb0xhYmVscz9cbiAgICBzb2xvTGFiZWxzID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL2xhYmVsc1wiKVxuICBjb21wYW55ID0gbnVsbFxuICBpZiBzb2xvTGFiZWxzP1xuICAgIGNvbXBhbnkgPSBzb2xvTGFiZWxzW3BrdC5uaWNrbmFtZV1cbiAgaWYgbm90IGNvbXBhbnk/XG4gICAgY29tcGFueSA9IHBrdC5uaWNrbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBrdC5uaWNrbmFtZS5zbGljZSgxKVxuICAgIGNvbXBhbnkgKz0gXCIgUmVjb3Jkc1wiXG4gIHJldHVybiBjb21wYW55XG5cbnNob3dJbmZvID0gKHBrdCkgLT5cbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcbiAgb3ZlckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gIGZvciB0IGluIG92ZXJUaW1lcnNcbiAgICBjbGVhclRpbWVvdXQodClcbiAgb3ZlclRpbWVycyA9IFtdXG5cbiAgYXJ0aXN0ID0gcGt0LmFydGlzdFxuICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXlxccysvLCBcIlwiKVxuICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxuICB0aXRsZSA9IHBrdC50aXRsZVxuICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXG4gIGlmIHNvbG9JRD9cbiAgICBjb21wYW55ID0gYXdhaXQgY2FsY0xhYmVsKHBrdClcbiAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXG4gICAgaWYgc29sb01pcnJvclxuICAgICAgaHRtbCArPSBcIlxcbk1pcnJvciBNb2RlXCJcbiAgICBlbHNlXG4gICAgICBodG1sICs9IFwiXFxuU29sbyBNb2RlXCJcbiAgZWxzZVxuICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXG4gICAgZmVlbGluZ3MgPSBbXVxuICAgIGZvciBvIGluIG9waW5pb25PcmRlclxuICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xuICAgICAgICBmZWVsaW5ncy5wdXNoIG9cbiAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxuICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcbiAgICBlbHNlXG4gICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xuICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXG4gICAgICAgIGxpc3Quc29ydCgpXG4gICAgICAgIGh0bWwgKz0gXCJcXG4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTogI3tsaXN0LmpvaW4oJywgJyl9XCJcbiAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxuXG4gIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XG4gICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxuICAsIDMwMDBcbiAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cbiAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxuICAsIDE1MDAwXG5cbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XG4gIGlmIG5vdCBwbGF5ZXI/XG4gICAgcmV0dXJuXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH0gKCN7c3RhcnRTZWNvbmRzfSwgI3tlbmRTZWNvbmRzfSlcIlxuXG4gIGxhc3RQbGF5ZWRJRCA9IGlkXG4gIHBsYXllci5wbGF5KGlkLCBzdGFydFNlY29uZHMsIGVuZFNlY29uZHMpXG4gIHBsYXlpbmcgPSB0cnVlXG5cbiAgc2hvd0luZm8ocGt0KVxuXG5zb2xvSW5mb0Jyb2FkY2FzdCA9IC0+XG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXG4gICAgbmV4dFZpZGVvID0gbnVsbFxuICAgIGlmIHNvbG9JbmRleCA8IHNvbG9RdWV1ZS5sZW5ndGggLSAxXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4KzFdXG4gICAgaW5mbyA9XG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cbiAgICAgIG5leHQ6IG5leHRWaWRlb1xuICAgICAgaW5kZXg6IHNvbG9JbmRleCArIDFcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcblxuICAgIGNvbnNvbGUubG9nIFwiQnJvYWRjYXN0OiBcIiwgaW5mb1xuICAgIHBrdCA9IHtcbiAgICAgIGlkOiBzb2xvSURcbiAgICAgIGNtZDogJ2luZm8nXG4gICAgICBpbmZvOiBpbmZvXG4gICAgfVxuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgcGt0XG4gICAgc29sb0NvbW1hbmQocGt0KVxuXG5zb2xvU2F2ZUxhc3RXYXRjaGVkID0gLT5cbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhc3R3YXRjaGVkJywgSlNPTi5zdHJpbmdpZnkoc29sb0xhc3RXYXRjaGVkKSlcblxuc29sb1Jlc2V0TGFzdFdhdGNoZWQgPSAtPlxuICBzb2xvTGFzdFdhdGNoZWQgPSB7fVxuICBzb2xvU2F2ZUxhc3RXYXRjaGVkKClcblxuYXNrRm9yZ2V0ID0gLT5cbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnZXQgeW91ciB3YXRjaCBoaXN0b3J5P1wiKVxuICAgIHNvbG9SZXNldExhc3RXYXRjaGVkKClcbiAgICBzaG93TGlzdCh0cnVlKVxuXG5zb2xvQ2FsY0J1Y2tldHMgPSAobGlzdCkgLT5cbiAgYnVja2V0cyA9IFtdXG4gIGZvciB0YiBpbiBUSU1FX0JVQ0tFVFNcbiAgICBidWNrZXRzLnB1c2gge1xuICAgICAgc2luY2U6IHRiLnNpbmNlXG4gICAgICBkZXNjcmlwdGlvbjogdGIuZGVzY3JpcHRpb25cbiAgICAgIGxpc3Q6IFtdXG4gICAgfVxuXG4gIHQgPSBub3coKVxuICBmb3IgZSBpbiBsaXN0XG4gICAgc2luY2UgPSBzb2xvTGFzdFdhdGNoZWRbZS5pZF1cbiAgICBpZiBzaW5jZT9cbiAgICAgIHNpbmNlID0gdCAtIHNpbmNlXG4gICAgZWxzZVxuICAgICAgc2luY2UgPSBORVZFUl9XQVRDSEVEX1RJTUVcbiAgICAjIGNvbnNvbGUubG9nIFwiaWQgI3tlLmlkfSBzaW5jZSAje3NpbmNlfVwiXG4gICAgZm9yIGJ1Y2tldCBpbiBidWNrZXRzXG4gICAgICBpZiBidWNrZXQuc2luY2UgPT0gMFxuICAgICAgICAjIHRoZSBjYXRjaGFsbFxuICAgICAgICBidWNrZXQubGlzdC5wdXNoIGVcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHNpbmNlIDwgYnVja2V0LnNpbmNlXG4gICAgICAgIGJ1Y2tldC5saXN0LnB1c2ggZVxuICAgICAgICBicmVha1xuICByZXR1cm4gYnVja2V0cy5yZXZlcnNlKCkgIyBvbGRlc3QgdG8gbmV3ZXN0XG5cbnNodWZmbGVBcnJheSA9IChhcnJheSkgLT5cbiAgZm9yIGkgaW4gW2FycmF5Lmxlbmd0aCAtIDEgLi4uIDBdIGJ5IC0xXG4gICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpXG4gICAgdGVtcCA9IGFycmF5W2ldXG4gICAgYXJyYXlbaV0gPSBhcnJheVtqXVxuICAgIGFycmF5W2pdID0gdGVtcFxuXG5zb2xvU2h1ZmZsZSA9IC0+XG4gIGNvbnNvbGUubG9nIFwiU2h1ZmZsaW5nLi4uXCJcblxuICBzb2xvUXVldWUgPSBbXVxuICBpZiBmaWx0ZXJzLmlzT3JkZXJlZCgpXG4gICAgZm9yIHMgaW4gc29sb1Vuc2h1ZmZsZWRcbiAgICAgIHNvbG9RdWV1ZS5wdXNoIHNcbiAgZWxzZVxuICAgIGJ1Y2tldHMgPSBzb2xvQ2FsY0J1Y2tldHMoc29sb1Vuc2h1ZmZsZWQpXG4gICAgZm9yIGJ1Y2tldCBpbiBidWNrZXRzXG4gICAgICBzaHVmZmxlQXJyYXkoYnVja2V0Lmxpc3QpXG4gICAgICBmb3IgZSBpbiBidWNrZXQubGlzdFxuICAgICAgICBzb2xvUXVldWUucHVzaCBlXG4gIHNvbG9JbmRleCA9IDBcblxuc29sb1BsYXkgPSAoZGVsdGEgPSAxKSAtPlxuICBpZiBub3QgcGxheWVyP1xuICAgIHJldHVyblxuICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxuICAgIHJldHVyblxuXG4gIGlmIG5vdCBzb2xvVmlkZW8/IG9yIChzb2xvUXVldWUubGVuZ3RoID09IDApIG9yICgoc29sb0luZGV4ICsgZGVsdGEpID4gKHNvbG9RdWV1ZS5sZW5ndGggLSAxKSlcbiAgICBzb2xvU2h1ZmZsZSgpXG4gIGVsc2VcbiAgICBzb2xvSW5kZXggKz0gZGVsdGFcblxuICBpZiBzb2xvSW5kZXggPCAwXG4gICAgc29sb0luZGV4ID0gMFxuICBzb2xvVmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4XVxuXG4gIGNvbnNvbGUubG9nIHNvbG9WaWRlb1xuXG4gICMgZGVidWdcbiAgIyBzb2xvVmlkZW8uc3RhcnQgPSAxMFxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXG5cbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxuICBzb2xvSW5mb0Jyb2FkY2FzdCgpXG5cbiAgc29sb0xhc3RXYXRjaGVkW3NvbG9WaWRlby5pZF0gPSBub3coKVxuICBzb2xvU2F2ZUxhc3RXYXRjaGVkKClcblxuXG5zb2xvVGljayA9IC0+XG4gIGlmIG5vdCBwbGF5ZXI/XG4gICAgcmV0dXJuXG5cbiAgY29uc29sZS5sb2cgXCJzb2xvVGljaygpXCJcblxuICBpZiBzb2xvSUQ/XG4gICAgIyBTb2xvIVxuICAgIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXG4gICAgICByZXR1cm5cbiAgICBpZiBub3QgcGxheWluZyBhbmQgcGxheWVyP1xuICAgICAgc29sb1BsYXkoKVxuICAgICAgcmV0dXJuXG5cbiAgZWxzZVxuICAgICMgTGl2ZSFcblxuICAgIGlmIG5vdCBwbGF5aW5nXG4gICAgICBzZW5kUmVhZHkoKVxuICAgICAgcmV0dXJuXG4gICAgdXNlciA9IHFzKCd1c2VyJylcbiAgICBzZncgPSBmYWxzZVxuICAgIGlmIHFzKCdzZncnKVxuICAgICAgc2Z3ID0gdHJ1ZVxuICAgIHNvY2tldC5lbWl0ICdwbGF5aW5nJywgeyB1c2VyOiB1c2VyLCBzZnc6IHNmdyB9XG5cbmdldERhdGEgPSAodXJsKSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxuICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxuICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcbiAgICB4aHR0cC5zZW5kKClcblxubWVkaWFCdXR0b25zUmVhZHkgPSBmYWxzZVxubGlzdGVuRm9yTWVkaWFCdXR0b25zID0gLT5cbiAgaWYgbWVkaWFCdXR0b25zUmVhZHlcbiAgICByZXR1cm5cblxuICBpZiBub3Qgd2luZG93Lm5hdmlnYXRvcj8ubWVkaWFTZXNzaW9uP1xuICAgIHNldFRpbWVvdXQoLT5cbiAgICAgIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXG4gICAgLCAxMDAwKVxuICAgIHJldHVyblxuXG4gIG1lZGlhQnV0dG9uc1JlYWR5ID0gdHJ1ZVxuICB3aW5kb3cubmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyICdwcmV2aW91c3RyYWNrJywgLT5cbiAgICBzb2xvUHJldigpXG4gIHdpbmRvdy5uYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIgJ25leHR0cmFjaycsIC0+XG4gICAgc29sb1NraXAoKVxuICBjb25zb2xlLmxvZyBcIk1lZGlhIEJ1dHRvbnMgcmVhZHkuXCJcblxucmVuZGVyUGxheWxpc3ROYW1lID0gLT5cbiAgaWYgbm90IGN1cnJlbnRQbGF5bGlzdE5hbWU/XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlsaXN0bmFtZScpLmlubmVySFRNTCA9IFwiXCJcbiAgICBkb2N1bWVudC50aXRsZSA9IFwiTVRWIFNvbG9cIlxuICAgIHJldHVyblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWxpc3RuYW1lJykuaW5uZXJIVE1MID0gY3VycmVudFBsYXlsaXN0TmFtZVxuICBkb2N1bWVudC50aXRsZSA9IFwiTVRWIFNvbG86ICN7Y3VycmVudFBsYXlsaXN0TmFtZX1cIlxuXG5zZW5kUmVhZHkgPSAtPlxuICBjb25zb2xlLmxvZyBcIlJlYWR5XCJcbiAgdXNlciA9IHFzKCd1c2VyJylcbiAgc2Z3ID0gZmFsc2VcbiAgaWYgcXMoJ3NmdycpXG4gICAgc2Z3ID0gdHJ1ZVxuICBzb2NrZXQuZW1pdCAncmVhZHknLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cblxudHJpbUFsbFdoaXRlc3BhY2UgPSAoZSkgLT5cbiAgcmV0ID0gZmFsc2VcbiAgaWYgZS5hcnRpc3Q/XG4gICAgbmV3QXJ0aXN0ID0gZS5hcnRpc3QucmVwbGFjZSgvXlxccyovLCBcIlwiKVxuICAgIG5ld0FydGlzdCA9IGUuYXJ0aXN0LnJlcGxhY2UoL1xccyokLywgXCJcIilcbiAgICBpZiBlLmFydGlzdCAhPSBuZXdBcnRpc3RcbiAgICAgIGUuYXJ0aXN0ID0gbmV3QXJ0aXN0XG4gICAgICByZXQgPSB0cnVlXG4gIGlmIGUudGl0bGU/XG4gICAgbmV3VGl0bGUgPSBlLnRpdGxlLnJlcGxhY2UoL15cXHMqLywgXCJcIilcbiAgICBuZXdUaXRsZSA9IGUudGl0bGUucmVwbGFjZSgvXFxzKiQvLCBcIlwiKVxuICAgIGlmIGUudGl0bGUgIT0gbmV3VGl0bGVcbiAgICAgIGUudGl0bGUgPSBuZXdUaXRsZVxuICAgICAgcmV0ID0gdHJ1ZVxuICByZXR1cm4gcmV0XG5cbnNwbGl0QXJ0aXN0ID0gKGUpIC0+XG4gIGFydGlzdCA9IFwiVW5saXN0ZWQgVmlkZW9zXCJcbiAgdGl0bGUgPSBlLnRpdGxlXG4gIGlmIG1hdGNoZXMgPSBlLnRpdGxlLm1hdGNoKC9eKC4rKVxcc1vigJMtXVxccyguKykkLylcbiAgICBhcnRpc3QgPSBtYXRjaGVzWzFdXG4gICAgdGl0bGUgPSBtYXRjaGVzWzJdXG4gIGVsc2UgaWYgbWF0Y2hlcyA9IGUudGl0bGUubWF0Y2goL14oW15cIl0rKVxcc1wiKFteXCJdKylcIi8pXG4gICAgYXJ0aXN0ID0gbWF0Y2hlc1sxXVxuICAgIHRpdGxlID0gbWF0Y2hlc1syXVxuXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvW1xcKFxcW10oT2ZmaWNpYWwpP1xccz8oSEQpP1xccz8oTXVzaWMpP1xccyhBdWRpb3xWaWRlbylbXFwpXFxdXS9pLCBcIlwiKVxuICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL15cXHMrLywgXCJcIilcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXG4gIGlmIHRpdGxlLm1hdGNoKC9eXCIuK1wiJC8pXG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXCIvLCBcIlwiKVxuICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXCIkLywgXCJcIilcblxuICBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL14oLispXFxzK1xcKGYoZWEpP3QuICguKylcXCkkL2kpXG4gICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgYXJ0aXN0ICs9IFwiIGZ0LiAje21hdGNoZXNbM119XCJcbiAgZWxzZSBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL14oLispXFxzK2YoZWEpP3QuICguKykkL2kpXG4gICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgYXJ0aXN0ICs9IFwiIGZ0LiAje21hdGNoZXNbM119XCJcblxuICBpZiBtYXRjaGVzID0gYXJ0aXN0Lm1hdGNoKC9eKC4rKVxccytcXCh3aXRoIChbXildKylcXCkkLylcbiAgICBhcnRpc3QgPSBcIiN7bWF0Y2hlc1sxXX0gZnQuICN7bWF0Y2hlc1syXX1cIlxuXG4gIGUuYXJ0aXN0ID0gYXJ0aXN0XG4gIGUudGl0bGUgPSB0aXRsZVxuICB0cmltQWxsV2hpdGVzcGFjZShlKVxuICByZXR1cm5cblxuc3RhcnRIZXJlID0gLT5cbiAgaWYgbm90IHBsYXllcj9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29sb3ZpZGVvY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCdjb3JuZXInKVxuICAgIGlmIGlzVGVzbGFcbiAgICAgIG9uVGFwU2hvdygpXG4gICAgZWxzZVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJykuY2xhc3NMaXN0LmFkZCgnZmFkZXknKVxuXG4gICAgcGxheWVyID0gbmV3IFBsYXllcignI210di1wbGF5ZXInKVxuICAgIHBsYXllci5lbmRlZCA9IChldmVudCkgLT5cbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxuICAgIHBsYXllci5vblRpdGxlID0gKHRpdGxlKSAtPlxuICAgICAgaWYgc29sb1ZpZGVvPyBhbmQgc29sb1ZpZGVvLnVubGlzdGVkXG4gICAgICAgIGNvbnNvbGUubG9nIFwiVXBkYXRpbmcgVGl0bGU6ICN7dGl0bGV9XCJcbiAgICAgICAgc29sb1ZpZGVvLnRpdGxlID0gdGl0bGVcbiAgICAgICAgc3BsaXRBcnRpc3Qoc29sb1ZpZGVvKVxuICAgICAgICByZW5kZXJJbmZvKHNvbG9JbmZvKVxuICAgICAgICBzaG93SW5mbyhzb2xvVmlkZW8pXG5cbiAgICBwbGF5ZXIucGxheSgnQUI3eWtPZkFnSUEnKSAjIE1UViBMb2FkaW5nLi4uXG5cbiAgaWYgc29sb0lEP1xuICAgICMgU29sbyBNb2RlIVxuXG4gICAgc2hvd1dhdGNoTGluaygpXG5cbiAgICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXG4gICAgc29sb1Vuc2h1ZmZsZWQgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcpXG4gICAgaWYgbm90IHNvbG9VbnNodWZmbGVkP1xuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXG4gICAgICByZXR1cm5cblxuICAgIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXG4gICAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXG4gICAgICByZXR1cm5cbiAgICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcblxuICAgIHNvbG9RdWV1ZSA9IFtdXG4gICAgc29sb1BsYXkoKVxuICAgIGlmIHNvbG9NaXJyb3IgYW5kIHNvbG9JRFxuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxuICBlbHNlXG4gICAgIyBMaXZlIE1vZGUhXG4gICAgc2hvd1dhdGNoTGl2ZSgpXG4gICAgc2VuZFJlYWR5KClcblxuICBpZiBzb2xvVGlja1RpbWVvdXQ/XG4gICAgY2xlYXJJbnRlcnZhbChzb2xvVGlja1RpbWVvdXQpXG4gIHNvbG9UaWNrVGltZW91dCA9IHNldEludGVydmFsKHNvbG9UaWNrLCA1MDAwKVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpY2ttZW51XCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICBsaXN0ZW5Gb3JNZWRpYUJ1dHRvbnMoKVxuXG4gIGlmIGlzVGVzbGFcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFwc2hvdycpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcblxuc3ByaW5rbGVGb3JtUVMgPSAocGFyYW1zKSAtPlxuICB1c2VyUVMgPSBxcygndXNlcicpXG4gIGlmIHVzZXJRUz9cbiAgICBwYXJhbXMuc2V0KCd1c2VyJywgdXNlclFTKVxuICBzZndRUyA9IHFzKCdzZncnKVxuICBpZiBzZndRUz9cbiAgICBwYXJhbXMuc2V0KCdzZncnLCBzZndRUylcblxuY2FsY1Blcm1hbGluayA9IC0+XG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxuICBpZiBub3QgcGFyYW1zLmdldCgnc29sbycpXG4gICAgcGFyYW1zLmRlbGV0ZSgnc29sbycpXG4gIGlmIG5vdCBwYXJhbXMuZ2V0KCdmaWx0ZXJzJylcbiAgICBwYXJhbXMuZGVsZXRlKCdmaWx0ZXJzJylcbiAgaWYgY3VycmVudFBsYXlsaXN0TmFtZT9cbiAgICBwYXJhbXMuc2V0KFwibmFtZVwiLCBjdXJyZW50UGxheWxpc3ROYW1lKVxuICBzcHJpbmtsZUZvcm1RUyhwYXJhbXMpXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxuICBpZiBxdWVyeXN0cmluZy5sZW5ndGggPiAwXG4gICAgcXVlcnlzdHJpbmcgPSBcIj9cIiArIHF1ZXJ5c3RyaW5nXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBxdWVyeXN0cmluZ1xuICByZXR1cm4gbXR2VVJMXG5cbmdlbmVyYXRlUGVybWFsaW5rID0gLT5cbiAgY29uc29sZS5sb2cgXCJnZW5lcmF0ZVBlcm1hbGluaygpXCJcbiAgd2luZG93LmxvY2F0aW9uID0gY2FsY1Blcm1hbGluaygpXG5cbmZvcm1DaGFuZ2VkID0gLT5cbiAgY29uc29sZS5sb2cgXCJGb3JtIGNoYW5nZWQhXCJcbiAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoJ2hlcmUnLCAnJywgY2FsY1Blcm1hbGluaygpKVxuICByZW5kZXJQbGF5bGlzdE5hbWUoKVxuXG5zb2xvU2tpcCA9IC0+XG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xuICAgIGlkOiBzb2xvSURcbiAgICBjbWQ6ICdza2lwJ1xuICB9XG4gIHNvbG9QbGF5KClcblxuc29sb1ByZXYgPSAtPlxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcbiAgICBpZDogc29sb0lEXG4gICAgY21kOiAncHJldidcbiAgfVxuICBzb2xvUGxheSgtMSlcblxuc29sb1Jlc3RhcnQgPSAtPlxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcbiAgICBpZDogc29sb0lEXG4gICAgY21kOiAncmVzdGFydCdcbiAgfVxuICBzb2xvUGxheSgwKVxuXG5zb2xvUGF1c2UgPSAtPlxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcbiAgICBpZDogc29sb0lEXG4gICAgY21kOiAncGF1c2UnXG4gIH1cbiAgcGF1c2VJbnRlcm5hbCgpXG5cbnJlbmRlckluZm8gPSAoaW5mbywgaXNMaXZlID0gZmFsc2UpIC0+XG4gIGlmIG5vdCBpbmZvPyBvciBub3QgaW5mby5jdXJyZW50P1xuICAgIHJldHVyblxuXG4gIGNvbnNvbGUubG9nIGluZm9cblxuICBpZiBpc0xpdmVcbiAgICB0YWdzU3RyaW5nID0gbnVsbFxuICAgIGNvbXBhbnkgPSBhd2FpdCBpbmZvLmN1cnJlbnQuY29tcGFueVxuICBlbHNlXG4gICAgdGFnc1N0cmluZyA9IE9iamVjdC5rZXlzKGluZm8uY3VycmVudC50YWdzKS5zb3J0KCkuam9pbignLCAnKVxuICAgIGNvbXBhbnkgPSBhd2FpdCBjYWxjTGFiZWwoaW5mby5jdXJyZW50KVxuXG4gIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhpbmZvLmN1cnJlbnQuaWQpXG4gIGlmIG5vdCBpZEluZm8/XG4gICAgaWRJbmZvID1cbiAgICAgIHByb3ZpZGVyOiAneW91dHViZSdcbiAgICAgIHVybDogJ2h0dHBzOi8vZXhhbXBsZS5jb20nXG5cbiAgaHRtbCA9IFwiXCJcbiAgaWYgbm90IGlzTGl2ZVxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj5UcmFjayAje2luZm8uaW5kZXh9IC8gI3tpbmZvLmNvdW50fTwvZGl2PlwiXG5cbiAgaWYgbm90IHBsYXllcj9cbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RodW1iXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiI3tpZEluZm8udXJsfVxcXCI+PGltZyB3aWR0aD0zMjAgaGVpZ2h0PTE4MCBzcmM9XFxcIiN7aW5mby5jdXJyZW50LnRodW1ifVxcXCI+PC9hPjwvZGl2PlwiXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY3VycmVudCBpbmZvYXJ0aXN0XFxcIj4je2luZm8uY3VycmVudC5hcnRpc3R9PC9kaXY+XCJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBjbGFzcz1cXFwiaW5mb3RpdGxlXFxcIiBocmVmPVxcXCIje2lkSW5mby51cmx9XFxcIj4je2luZm8uY3VycmVudC50aXRsZX08L2E+XFxcIjwvZGl2PlwiXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvbGFiZWxcXFwiPiN7Y29tcGFueX08L2Rpdj5cIlxuICBpZiBub3QgaXNMaXZlXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90YWdzXFxcIj4mbmJzcDsje3RhZ3NTdHJpbmd9Jm5ic3A7PC9kaXY+XCJcbiAgICBpZiBpbmZvLm5leHQ/XG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je2luZm8ubmV4dC5hcnRpc3R9PC9zcGFuPlwiXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2luZm8ubmV4dC50aXRsZX1cXFwiPC9zcGFuPlwiXG4gICAgZWxzZVxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvaGVhZGluZyBuZXh0dmlkZW9cXFwiPk5leHQ6PC9zcGFuPiBcIlxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvcmVzaHVmZmxlIG5leHR2aWRlb1xcXCI+KC4uLlJlc2h1ZmZsZS4uLik8L3NwYW4+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8nKS5pbm5lckhUTUwgPSBodG1sXG5cbmNsaXBib2FyZEVkaXQgPSAtPlxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5Db3BpZWQhPC9hPlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXG4gIHNldFRpbWVvdXQgLT5cbiAgICByZW5kZXJDbGlwYm9hcmQoKVxuICAsIDIwMDBcblxucmVuZGVyQ2xpcGJvYXJkID0gLT5cbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cbiAgICByZXR1cm5cblxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvXFxcIiBkYXRhLWNsaXBib2FyZC10ZXh0PVxcXCIjbXR2IGVkaXQgI3tzb2xvSW5mby5jdXJyZW50LmlkfSBcXFwiIG9uY2xpY2s9XFxcImNsaXBib2FyZEVkaXQoKTsgcmV0dXJuIGZhbHNlXFxcIj5FZGl0PC9hPlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXG4gIG5ldyBDbGlwYm9hcmQoJy5jYnV0dG8nKVxuXG5vbkFkZCA9IC0+XG4gIGlmIG5vdCBzb2xvSW5mbz8uY3VycmVudD9cbiAgICByZXR1cm5cblxuICB2aWQgPSBzb2xvSW5mby5jdXJyZW50XG4gIGZpbHRlclN0cmluZyA9IFN0cmluZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVycycpLnZhbHVlKS50cmltKClcbiAgaWYgZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDBcbiAgICBmaWx0ZXJTdHJpbmcgKz0gXCJcXG5cIlxuICBmaWx0ZXJTdHJpbmcgKz0gXCJpZCAje3ZpZC5pZH0gIyAje3ZpZC5hcnRpc3R9IC0gI3t2aWQudGl0bGV9XFxuXCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gZmlsdGVyU3RyaW5nXG4gIGZvcm1DaGFuZ2VkKClcblxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5BZGRlZCE8L2E+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZCcpLmlubmVySFRNTCA9IGh0bWxcbiAgc2V0VGltZW91dCAtPlxuICAgIHJlbmRlckFkZCgpXG4gICwgMjAwMFxuXG5yZW5kZXJBZGQgPSAtPlxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50PyBvciBub3QgYWRkRW5hYmxlZFxuICAgIHJldHVyblxuXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG9cXFwiIG9uY2xpY2s9XFxcIm9uQWRkKCk7IHJldHVybiBmYWxzZVxcXCI+QWRkPC9hPlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQnKS5pbm5lckhUTUwgPSBodG1sXG5cbmNsaXBib2FyZE1pcnJvciA9IC0+XG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJtYnV0dG8gY29waWVkXFxcIiBvbmNsaWNrPVxcXCJyZXR1cm4gZmFsc2VcXFwiPkNvcGllZCE8L2E+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxuICBzZXRUaW1lb3V0IC0+XG4gICAgcmVuZGVyQ2xpcGJvYXJkTWlycm9yKClcbiAgLCAyMDAwXG5cbnJlbmRlckNsaXBib2FyZE1pcnJvciA9IC0+XG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/XG4gICAgcmV0dXJuXG5cbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcIm1idXR0b1xcXCJvbmNsaWNrPVxcXCJjbGlwYm9hcmRNaXJyb3IoKTsgcmV0dXJuIGZhbHNlXFxcIj5NaXJyb3I8L2E+XCJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxuICBuZXcgQ2xpcGJvYXJkICcubWJ1dHRvJywge1xuICAgIHRleHQ6IC0+XG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKHRydWUpXG4gIH1cblxuc2hhcmVDbGlwYm9hcmQgPSAobWlycm9yKSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJlY29waWVkXFxcIj5Db3BpZWQgdG8gY2xpcGJvYXJkOjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNTaGFyZVVSTChtaXJyb3IpfTwvZGl2PlxuICBcIlwiXCJcblxuc2hhcmVQZXJtYSA9IChtaXJyb3IpIC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmVjb3BpZWRcXFwiPkNvcGllZCB0byBjbGlwYm9hcmQ6PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmV1cmxcXFwiPiN7Y2FsY1Blcm1hKCl9PC9kaXY+XG4gIFwiXCJcIlxuXG5zaG93TGlzdCA9IChzaG93QnVja2V0cyA9IGZhbHNlKSAtPlxuICB0ID0gbm93KClcbiAgaWYgbGFzdFNob3dMaXN0VGltZT8gYW5kICgodCAtIGxhc3RTaG93TGlzdFRpbWUpIDwgMylcbiAgICBzaG93QnVja2V0cyA9IHRydWVcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxuXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWVcbiAgbGlzdCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZywgdHJ1ZSlcbiAgaWYgbm90IGxpc3Q/XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIkVycm9yLiBTb3JyeS5cIlxuICAgIHJldHVyblxuXG4gIGh0bWwgPSBcIjxkaXYgY2xhc3M9XFxcImxpc3Rjb250YWluZXJcXFwiPlwiXG5cbiAgaWYgc2hvd0J1Y2tldHMgJiYgKGxpc3QubGVuZ3RoID4gMSlcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOiA8YSBjbGFzcz1cXFwiZm9yZ2V0bGlua1xcXCIgb25jbGljaz1cXFwiYXNrRm9yZ2V0KCk7IHJldHVybiBmYWxzZTtcXFwiPltGb3JnZXRdPC9hPjwvZGl2PlwiXG4gICAgYnVja2V0cyA9IHNvbG9DYWxjQnVja2V0cyhsaXN0KVxuICAgIGZvciBidWNrZXQgaW4gYnVja2V0c1xuICAgICAgaWYgYnVja2V0Lmxpc3QubGVuZ3RoIDwgMVxuICAgICAgICBjb250aW51ZVxuICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9idWNrZXRcXFwiPkJ1Y2tldCBbI3tidWNrZXQuZGVzY3JpcHRpb259XSAoI3tidWNrZXQubGlzdC5sZW5ndGh9IHZpZGVvcyk6PC9kaXY+XCJcbiAgICAgIGZvciBlIGluIGJ1Y2tldC5saXN0XG4gICAgICAgIGh0bWwgKz0gXCI8ZGl2PlwiXG4gICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXG4gICAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcbiAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tlLnRpdGxlfVxcXCI8L3NwYW4+XCJcbiAgICAgICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXG4gIGVsc2VcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOjwvZGl2PlwiXG4gICAgZm9yIGUgaW4gbGlzdFxuICAgICAgaHRtbCArPSBcIjxkaXY+XCJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2UudGl0bGV9XFxcIjwvc3Bhbj5cIlxuICAgICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXG5cbiAgaHRtbCArPSBcIjwvZGl2PlwiXG5cbiAgbGFzdFNob3dMaXN0VGltZSA9IHRcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBodG1sXG5cbnNob3dFeHBvcnQgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxuXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWVcbiAgbGlzdCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZywgdHJ1ZSlcbiAgaWYgbm90IGxpc3Q/XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIkVycm9yLiBTb3JyeS5cIlxuICAgIHJldHVyblxuXG4gIGV4cG9ydGVkUGxheWxpc3RzID0gXCJcIlxuICBpZHMgPSBbXVxuICBwbGF5bGlzdEluZGV4ID0gMVxuICBmb3IgZSBpbiBsaXN0XG4gICAgaWYgaWRzLmxlbmd0aCA+PSA1MFxuICAgICAgZXhwb3J0ZWRQbGF5bGlzdHMgKz0gXCJcIlwiXG4gICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaF92aWRlb3M/dmlkZW9faWRzPSN7aWRzLmpvaW4oJywnKX1cIj5FeHBvcnRlZCBQbGF5bGlzdCAje3BsYXlsaXN0SW5kZXh9ICgje2lkcy5sZW5ndGh9KTwvYT48YnI+XG4gICAgICBcIlwiXCJcbiAgICAgIHBsYXlsaXN0SW5kZXggKz0gMVxuICAgICAgaWRzID0gW11cbiAgICBpZHMucHVzaCBlLmlkXG4gIGlmIGlkcy5sZW5ndGggPiAwXG4gICAgZXhwb3J0ZWRQbGF5bGlzdHMgKz0gXCJcIlwiXG4gICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2hfdmlkZW9zP3ZpZGVvX2lkcz0je2lkcy5qb2luKCcsJyl9XCI+RXhwb3J0ZWQgUGxheWxpc3QgI3twbGF5bGlzdEluZGV4fSAoI3tpZHMubGVuZ3RofSk8L2E+PGJyPlxuICAgIFwiXCJcIlxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cXFwibGlzdGNvbnRhaW5lclxcXCI+XG4gICAgICAje2V4cG9ydGVkUGxheWxpc3RzfVxuICAgIDwvZGl2PlxuICBcIlwiXCJcblxuY2xlYXJPcGluaW9uID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gXCJcIlxuXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cbiAgaHRtbCA9IFwiXCJcbiAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyIGJ5IC0xXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcbiAgICBpZiBvID09IHBrdC5vcGluaW9uXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxhIGNsYXNzPVwiI3tjbGFzc2VzfVwiIG9uY2xpY2s9XCJzZXRPcGluaW9uKCcje299Jyk7IHJldHVybiBmYWxzZTtcIj4je2NhcG99PC9hPlxuICAgIFwiXCJcIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBodG1sXG5cbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cbiAgaWYgbm90IGRpc2NvcmRUb2tlbj8gb3Igbm90IGxhc3RQbGF5ZWRJRD9cbiAgICByZXR1cm5cblxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWRJRCwgc2V0OiBvcGluaW9uIH1cblxucGF1c2VJbnRlcm5hbCA9IC0+XG4gIGlmIHBsYXllcj9cbiAgICBwbGF5ZXIudG9nZ2xlUGF1c2UoKVxuXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XG4gIGlmIHBrdC5pZCAhPSBzb2xvSURcbiAgICByZXR1cm5cbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxuICBzd2l0Y2ggcGt0LmNtZFxuICAgIHdoZW4gJ3ByZXYnXG4gICAgICBzb2xvUGxheSgtMSlcbiAgICB3aGVuICdza2lwJ1xuICAgICAgc29sb1BsYXkoMSlcbiAgICB3aGVuICdyZXN0YXJ0J1xuICAgICAgc29sb1BsYXkoMClcbiAgICB3aGVuICdwYXVzZSdcbiAgICAgIHBhdXNlSW50ZXJuYWwoKVxuICAgIHdoZW4gJ2luZm8nXG4gICAgICBpZiBwa3QuaW5mbz9cbiAgICAgICAgY29uc29sZS5sb2cgXCJORVcgSU5GTyE6IFwiLCBwa3QuaW5mb1xuICAgICAgICBzb2xvSW5mbyA9IHBrdC5pbmZvXG4gICAgICAgIGF3YWl0IHJlbmRlckluZm8oc29sb0luZm8sIGZhbHNlKVxuICAgICAgICByZW5kZXJBZGQoKVxuICAgICAgICByZW5kZXJDbGlwYm9hcmQoKVxuICAgICAgICByZW5kZXJDbGlwYm9hcmRNaXJyb3IoKVxuICAgICAgICBpZiBzb2xvTWlycm9yXG4gICAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxuICAgICAgICAgIGlmIHNvbG9WaWRlbz9cbiAgICAgICAgICAgIGlmIG5vdCBwbGF5ZXI/XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXG4gICAgICAgICAgICBleHRyYU9mZnNldCA9IDBcbiAgICAgICAgICAgIGlmIHBrdC5pbmZvLnR1PyBhbmQgcGt0LmluZm8udGI/XG4gICAgICAgICAgICAgIGV4dHJhT2Zmc2V0ID0gMSArIHBrdC5pbmZvLnRiIC0gcGt0LmluZm8udHVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJFeHRyYSBvZmZzZXQ6ICN7ZXh0cmFPZmZzZXR9XCJcbiAgICAgICAgICAgIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCArIGV4dHJhT2Zmc2V0LCBzb2xvVmlkZW8uZW5kKVxuICAgICAgICBjbGVhck9waW5pb24oKVxuICAgICAgICBpZiBkaXNjb3JkVG9rZW4/IGFuZCBzb2xvSW5mby5jdXJyZW50PyBhbmQgc29sb0luZm8uY3VycmVudC5pZD9cbiAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHNvbG9JbmZvLmN1cnJlbnQuaWQgfVxuXG51cGRhdGVTb2xvSUQgPSAobmV3U29sb0lEKSAtPlxuICBzb2xvSUQgPSBuZXdTb2xvSURcbiAgaWYgbm90IHNvbG9JRD9cbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6IG5vIHNvbG8gcXVlcnkgcGFyYW1ldGVyXCJcbiAgICByZXR1cm5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzb2xvaWRcIikudmFsdWUgPSBzb2xvSURcbiAgaWYgc29ja2V0P1xuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cblxubG9hZFBsYXlsaXN0ID0gLT5cbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXG4gIHNlbGVjdGVkID0gY29tYm8ub3B0aW9uc1tjb21iby5zZWxlY3RlZEluZGV4XVxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxuICBjdXJyZW50RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZVxuICBpZiBub3Qgc2VsZWN0ZWROYW1lP1xuICAgIHJldHVyblxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZE5hbWUudHJpbSgpXG4gIGlmIHNlbGVjdGVkTmFtZS5sZW5ndGggPCAxXG4gICAgcmV0dXJuXG4gIGlmIGN1cnJlbnRGaWx0ZXJzLmxlbmd0aCA+IDBcbiAgICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2FkICcje3NlbGVjdGVkTmFtZX0nP1wiKVxuICAgICAgcmV0dXJuXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXG4gICAgYWN0aW9uOiBcImxvYWRcIlxuICAgIGxvYWRuYW1lOiBzZWxlY3RlZE5hbWVcbiAgfVxuICBjdXJyZW50UGxheWxpc3ROYW1lID0gc2VsZWN0ZWROYW1lXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcblxuZGVsZXRlUGxheWxpc3QgPSAtPlxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkLnZhbHVlXG4gIGlmIG5vdCBzZWxlY3RlZE5hbWU/XG4gICAgcmV0dXJuXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkTmFtZS50cmltKClcbiAgaWYgc2VsZWN0ZWROYW1lLmxlbmd0aCA8IDFcbiAgICByZXR1cm5cbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9hZCAnI3tzZWxlY3RlZE5hbWV9Jz9cIilcbiAgICByZXR1cm5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgICBhY3Rpb246IFwiZGVsXCJcbiAgICBkZWxuYW1lOiBzZWxlY3RlZE5hbWVcbiAgfVxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXG5cbnNhdmVQbGF5bGlzdCA9IC0+XG4gIG91dHB1dE5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlXG4gIG91dHB1dE5hbWUgPSBvdXRwdXROYW1lLnRyaW0oKVxuICBvdXRwdXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlXG4gIGlmIG91dHB1dE5hbWUubGVuZ3RoIDwgMVxuICAgIHJldHVyblxuICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzYXZlICcje291dHB1dE5hbWV9Jz9cIilcbiAgICByZXR1cm5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgICBhY3Rpb246IFwic2F2ZVwiXG4gICAgc2F2ZW5hbWU6IG91dHB1dE5hbWVcbiAgICBmaWx0ZXJzOiBvdXRwdXRGaWx0ZXJzXG4gIH1cbiAgY3VycmVudFBsYXlsaXN0TmFtZSA9IG91dHB1dE5hbWVcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxuXG5yZXF1ZXN0VXNlclBsYXlsaXN0cyA9IC0+XG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXG4gICAgYWN0aW9uOiBcImxpc3RcIlxuICB9XG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcblxucmVjZWl2ZVVzZXJQbGF5bGlzdCA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIFwicmVjZWl2ZVVzZXJQbGF5bGlzdFwiLCBwa3RcbiAgaWYgcGt0Lmxpc3Q/XG4gICAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXG4gICAgY29tYm8ub3B0aW9ucy5sZW5ndGggPSAwXG4gICAgcGt0Lmxpc3Quc29ydCAoYSwgYikgLT5cbiAgICAgIGEudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIudG9Mb3dlckNhc2UoKSlcbiAgICBmb3IgbmFtZSBpbiBwa3QubGlzdFxuICAgICAgaXNTZWxlY3RlZCA9IChuYW1lID09IHBrdC5zZWxlY3RlZClcbiAgICAgIGNvbWJvLm9wdGlvbnNbY29tYm8ub3B0aW9ucy5sZW5ndGhdID0gbmV3IE9wdGlvbihuYW1lLCBuYW1lLCBmYWxzZSwgaXNTZWxlY3RlZClcbiAgICBpZiBwa3QubGlzdC5sZW5ndGggPT0gMFxuICAgICAgY29tYm8ub3B0aW9uc1tjb21iby5vcHRpb25zLmxlbmd0aF0gPSBuZXcgT3B0aW9uKFwiTm9uZVwiLCBcIlwiKVxuICBpZiBwa3QubG9hZG5hbWU/XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlbmFtZVwiKS52YWx1ZSA9IHBrdC5sb2FkbmFtZVxuICBpZiBwa3QuZmlsdGVycz9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBwa3QuZmlsdGVyc1xuICBmb3JtQ2hhbmdlZCgpXG5cbmxvZ291dCA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXG4gIGRpc2NvcmRUb2tlbiA9IG51bGxcbiAgc2VuZElkZW50aXR5KClcblxuc2VuZElkZW50aXR5ID0gLT5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgfVxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXG5cbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxuICBpZiBwa3QuZGlzYWJsZWRcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxuICAgIGlmIHBrdC5uaWNrbmFtZT9cbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cbiAgICBcIlwiXCJcbiAgICByZXF1ZXN0VXNlclBsYXlsaXN0cygpXG4gIGVsc2VcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcbiAgICBkaXNjb3JkVG9rZW4gPSBudWxsXG5cbiAgICByZWRpcmVjdFVSTCA9IFN0cmluZyh3aW5kb3cubG9jYXRpb24pLnJlcGxhY2UoLyMuKiQvLCBcIlwiKSArIFwib2F1dGhcIlxuICAgIGxvZ2luTGluayA9IFwiaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL2F1dGhvcml6ZT9jbGllbnRfaWQ9I3t3aW5kb3cuQ0xJRU5UX0lEfSZyZWRpcmVjdF91cmk9I3tlbmNvZGVVUklDb21wb25lbnQocmVkaXJlY3RVUkwpfSZyZXNwb25zZV90eXBlPWNvZGUmc2NvcGU9aWRlbnRpZnlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9XCJsb2dpbmhpbnRcIj4oTG9naW4gb24gPGEgaHJlZj1cIi9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5EYXNoYm9hcmQ8L2E+KTwvZGl2PlxuICAgIFwiXCJcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZWFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcbiAgaWYgbGFzdENsaWNrZWQ/XG4gICAgbGFzdENsaWNrZWQoKVxuXG5nb0xpdmUgPSAtPlxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIHBhcmFtcy5kZWxldGUoXCJzb2xvXCIpXG4gIHBhcmFtcy5kZWxldGUoXCJmaWx0ZXJzXCIpXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxuICBwYXJhbXMuZGVsZXRlKFwibG9hZG5hbWVcIilcbiAgc3ByaW5rbGVGb3JtUVMocGFyYW1zKVxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcbiAgY29uc29sZS5sb2cgXCJnb0xpdmU6ICN7bXR2VVJMfVwiXG4gIHdpbmRvdy5sb2NhdGlvbiA9IG10dlVSTFxuXG5nb1NvbG8gPSAtPlxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIHBhcmFtcy5zZXQoXCJzb2xvXCIsIFwibmV3XCIpXG4gIHNwcmlua2xlRm9ybVFTKHBhcmFtcylcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXG4gIGNvbnNvbGUubG9nIFwiZ29Tb2xvOiAje210dlVSTH1cIlxuICB3aW5kb3cubG9jYXRpb24gPSBtdHZVUkxcblxud2luZG93Lm9ubG9hZCA9IC0+XG4gIHdpbmRvdy5hc2tGb3JnZXQgPSBhc2tGb3JnZXRcbiAgd2luZG93LmNsaXBib2FyZEVkaXQgPSBjbGlwYm9hcmRFZGl0XG4gIHdpbmRvdy5jbGlwYm9hcmRNaXJyb3IgPSBjbGlwYm9hcmRNaXJyb3JcbiAgd2luZG93LmRlbGV0ZVBsYXlsaXN0ID0gZGVsZXRlUGxheWxpc3RcbiAgd2luZG93LmZvcm1DaGFuZ2VkID0gZm9ybUNoYW5nZWRcbiAgd2luZG93LmdvTGl2ZSA9IGdvTGl2ZVxuICB3aW5kb3cuZ29Tb2xvID0gZ29Tb2xvXG4gIHdpbmRvdy5sb2FkUGxheWxpc3QgPSBsb2FkUGxheWxpc3RcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxuICB3aW5kb3cub25BZGQgPSBvbkFkZFxuICB3aW5kb3cub25UYXBTaG93ID0gb25UYXBTaG93XG4gIHdpbmRvdy5zYXZlUGxheWxpc3QgPSBzYXZlUGxheWxpc3RcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXG4gIHdpbmRvdy5zaGFyZVBlcm1hID0gc2hhcmVQZXJtYVxuICB3aW5kb3cuc2hvd0V4cG9ydCA9IHNob3dFeHBvcnRcbiAgd2luZG93LnNob3dMaXN0ID0gc2hvd0xpc3RcbiAgd2luZG93LnNob3dXYXRjaEZvcm0gPSBzaG93V2F0Y2hGb3JtXG4gIHdpbmRvdy5zaG93V2F0Y2hMaW5rID0gc2hvd1dhdGNoTGlua1xuICB3aW5kb3cuc2hvd1dhdGNoTGl2ZSA9IHNob3dXYXRjaExpdmVcbiAgd2luZG93LnNvbG9QYXVzZSA9IHNvbG9QYXVzZVxuICB3aW5kb3cuc29sb1ByZXYgPSBzb2xvUHJldlxuICB3aW5kb3cuc29sb1Jlc3RhcnQgPSBzb2xvUmVzdGFydFxuICB3aW5kb3cuc29sb1NraXAgPSBzb2xvU2tpcFxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XG4gIHdpbmRvdy5zdGFydEhlcmUgPSBzdGFydEhlcmVcblxuICBhdXRvc3RhcnQgPSBxcygnc3RhcnQnKT9cblxuICAjIGFkZEVuYWJsZWQgPSBxcygnYWRkJyk/XG4gICMgY29uc29sZS5sb2cgXCJBZGQgRW5hYmxlZDogI3thZGRFbmFibGVkfVwiXG5cbiAgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudFxuICBpZiB1c2VyQWdlbnQ/IGFuZCBTdHJpbmcodXNlckFnZW50KS5tYXRjaCgvVGVzbGFcXC8yMC8pXG4gICAgaXNUZXNsYSA9IHRydWVcblxuICBpZiBpc1Rlc2xhXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJykuY2xhc3NMaXN0LmFkZCgndGVzbGEnKVxuXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBxcygnbmFtZScpXG4gIGlmIGN1cnJlbnRQbGF5bGlzdE5hbWU/XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlbmFtZVwiKS52YWx1ZSA9IGN1cnJlbnRQbGF5bGlzdE5hbWVcblxuICBleHBvcnRFbmFibGVkID0gcXMoJ2V4cG9ydCcpP1xuICBjb25zb2xlLmxvZyBcIkV4cG9ydCBFbmFibGVkOiAje2V4cG9ydEVuYWJsZWR9XCJcbiAgaWYgZXhwb3J0RW5hYmxlZFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBvcnQnKS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIDxpbnB1dCBjbGFzcz1cImZzdWJcIiB0eXBlPVwic3VibWl0XCIgdmFsdWU9XCJFeHBvcnRcIiBvbmNsaWNrPVwiZXZlbnQucHJldmVudERlZmF1bHQoKTsgc2hvd0V4cG9ydCgpO1wiIHRpdGxlPVwiRXhwb3J0IGxpc3RzIGludG8gY2xpY2thYmxlIHBsYXlsaXN0c1wiPlxuICAgIFwiXCJcIlxuXG4gIHNvbG9JRFFTID0gcXMoJ3NvbG8nKVxuICBpZiBzb2xvSURRUz9cbiAgICAjIGluaXRpYWxpemUgc29sbyBtb2RlXG4gICAgdXBkYXRlU29sb0lEKHNvbG9JRFFTKVxuXG4gICAgaWYgbGF1bmNoT3BlblxuICAgICAgc2hvd1dhdGNoRm9ybSgpXG4gICAgZWxzZVxuICAgICAgc2hvd1dhdGNoTGluaygpXG4gIGVsc2VcbiAgICAjIGxpdmUgbW9kZVxuICAgIHNob3dXYXRjaExpdmUoKVxuXG4gIHFzRmlsdGVycyA9IHFzKCdmaWx0ZXJzJylcbiAgaWYgcXNGaWx0ZXJzP1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHFzRmlsdGVyc1xuXG4gIHNvbG9NaXJyb3IgPSBxcygnbWlycm9yJyk/XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlycm9yXCIpLmNoZWNrZWQgPSBzb2xvTWlycm9yXG4gIGlmIHNvbG9NaXJyb3JcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyc2VjdGlvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlycm9ybm90ZScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG5cbiAgc29ja2V0ID0gaW8oKVxuXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XG4gICAgaWYgc29sb0lEP1xuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxuICAgIHNlbmRJZGVudGl0eSgpXG5cbiAgc29ja2V0Lm9uICdzb2xvJywgKHBrdCkgLT5cbiAgICBzb2xvQ29tbWFuZChwa3QpXG5cbiAgc29ja2V0Lm9uICdpZGVudGlmeScsIChwa3QpIC0+XG4gICAgcmVjZWl2ZUlkZW50aXR5KHBrdClcblxuICBzb2NrZXQub24gJ29waW5pb24nLCAocGt0KSAtPlxuICAgIHVwZGF0ZU9waW5pb24ocGt0KVxuXG4gIHNvY2tldC5vbiAndXNlcnBsYXlsaXN0JywgKHBrdCkgLT5cbiAgICByZWNlaXZlVXNlclBsYXlsaXN0KHBrdClcblxuICBzb2NrZXQub24gJ3BsYXknLCAocGt0KSAtPlxuICAgIGlmIHBsYXllcj8gYW5kIG5vdCBzb2xvSUQ/XG4gICAgICBwbGF5KHBrdCwgcGt0LmlkLCBwa3Quc3RhcnQsIHBrdC5lbmQpXG4gICAgICBjbGVhck9waW5pb24oKVxuICAgICAgaWYgZGlzY29yZFRva2VuPyBhbmQgcGt0LmlkP1xuICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHBrdC5pZCB9XG4gICAgICByZW5kZXJJbmZvKHtcbiAgICAgICAgY3VycmVudDogcGt0XG4gICAgICB9LCB0cnVlKVxuXG4gIHByZXBhcmVDYXN0KClcblxuICBpZiBhdXRvc3RhcnRcbiAgICBjb25zb2xlLmxvZyBcIkFVVE8gU1RBUlRcIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gXCJBVVRPIFNUQVJUXCJcbiAgICBzdGFydEhlcmUoKVxuXG4gIG5ldyBDbGlwYm9hcmQgJy5zaGFyZScsIHtcbiAgICB0ZXh0OiAodHJpZ2dlcikgLT5cbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL1Blcm1hL2kpXG4gICAgICAgIHJldHVybiBjYWxjUGVybWEoKVxuICAgICAgbWlycm9yID0gZmFsc2VcbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL01pcnJvci9pKVxuICAgICAgICBtaXJyb3IgPSB0cnVlXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKG1pcnJvcilcbiAgfVxuIiwiZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXG5cbmNsYXNzIFBsYXllclxuICBjb25zdHJ1Y3RvcjogKGRvbUlELCBzaG93Q29udHJvbHMgPSB0cnVlKSAtPlxuICAgIEBlbmRlZCA9IG51bGxcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkXG4gICAgaWYgbm90IHNob3dDb250cm9sc1xuICAgICAgb3B0aW9ucyA9IHsgY29udHJvbHM6IFtdIH1cbiAgICBAcGx5ciA9IG5ldyBQbHlyKGRvbUlELCBvcHRpb25zKVxuICAgIEBwbHlyLm9uICdyZWFkeScsIChldmVudCkgPT5cbiAgICAgIEBwbHlyLnBsYXkoKVxuICAgIEBwbHlyLm9uICdlbmRlZCcsIChldmVudCkgPT5cbiAgICAgIGlmIEBlbmRlZD9cbiAgICAgICAgQGVuZGVkKClcblxuICAgIEBwbHlyLm9uICdwbGF5aW5nJywgKGV2ZW50KSA9PlxuICAgICAgaWYgQG9uVGl0bGU/XG4gICAgICAgIEBvblRpdGxlKEBwbHlyLm10dlRpdGxlKVxuXG4gIHBsYXk6IChpZCwgc3RhcnRTZWNvbmRzID0gdW5kZWZpbmVkLCBlbmRTZWNvbmRzID0gdW5kZWZpbmVkKSAtPlxuICAgIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhpZClcbiAgICBpZiBub3QgaWRJbmZvP1xuICAgICAgcmV0dXJuXG5cbiAgICBzd2l0Y2ggaWRJbmZvLnByb3ZpZGVyXG4gICAgICB3aGVuICd5b3V0dWJlJ1xuICAgICAgICBzb3VyY2UgPSB7XG4gICAgICAgICAgc3JjOiBpZEluZm8ucmVhbFxuICAgICAgICAgIHByb3ZpZGVyOiAneW91dHViZSdcbiAgICAgICAgfVxuICAgICAgd2hlbiAnbXR2J1xuICAgICAgICBzb3VyY2UgPSB7XG4gICAgICAgICAgc3JjOiBcIi92aWRlb3MvI3tpZEluZm8ucmVhbH0ubXA0XCJcbiAgICAgICAgICB0eXBlOiAndmlkZW8vbXA0J1xuICAgICAgICB9XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVyblxuXG4gICAgaWYoc3RhcnRTZWNvbmRzPyBhbmQgKHN0YXJ0U2Vjb25kcyA+IDApKVxuICAgICAgQHBseXIubXR2U3RhcnQgPSBzdGFydFNlY29uZHNcbiAgICBlbHNlXG4gICAgICBAcGx5ci5tdHZTdGFydCA9IHVuZGVmaW5lZFxuICAgIGlmKGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+IDApKVxuICAgICAgQHBseXIubXR2RW5kID0gZW5kU2Vjb25kc1xuICAgIGVsc2VcbiAgICAgIEBwbHlyLm10dkVuZCA9IHVuZGVmaW5lZFxuICAgIEBwbHlyLnNvdXJjZSA9XG4gICAgICB0eXBlOiAndmlkZW8nLFxuICAgICAgdGl0bGU6ICdNVFYnLFxuICAgICAgc291cmNlczogW3NvdXJjZV1cblxuICB0b2dnbGVQYXVzZTogLT5cbiAgICBpZiBAcGx5ci5wYXVzZWRcbiAgICAgIEBwbHlyLnBsYXkoKVxuICAgIGVsc2VcbiAgICAgIEBwbHlyLnBhdXNlKClcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgb3BpbmlvbnM6XG4gICAgbG92ZTogdHJ1ZVxuICAgIGxpa2U6IHRydWVcbiAgICBtZWg6IHRydWVcbiAgICBibGVoOiB0cnVlXG4gICAgaGF0ZTogdHJ1ZVxuXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXG4gICAgbG92ZTogdHJ1ZVxuICAgIGxpa2U6IHRydWVcblxuICB3ZWFrT3BpbmlvbnM6ICMgc2tpcCB0aGVzZSBpZiB3ZSBhbGwgYWdyZWVcbiAgICBtZWg6IHRydWVcblxuICBiYWRPcGluaW9uczogIyBza2lwIHRoZXNlXG4gICAgYmxlaDogdHJ1ZVxuICAgIGhhdGU6IHRydWVcblxuICBvcGluaW9uT3JkZXI6IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcbmZpbHRlck9waW5pb25zID0ge31cblxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbmxhc3RPcmRlcmVkID0gZmFsc2Vcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnBhcnNlRHVyYXRpb24gPSAocykgLT5cbiAgcmV0dXJuIGlzbzg2MDEudG9TZWNvbmRzKGlzbzg2MDEucGFyc2UocykpXG5cbnNldFNlcnZlckRhdGFiYXNlcyA9IChkYiwgb3BpbmlvbnMsIGdldFVzZXJGcm9tTmlja25hbWUpIC0+XG4gIGZpbHRlckRhdGFiYXNlID0gZGJcbiAgZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBvcGluaW9uc1xuICBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gZ2V0VXNlckZyb21OaWNrbmFtZVxuXG5nZXREYXRhID0gKHVybCkgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcbiAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcbiAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXG4gICAgeGh0dHAuc2VuZCgpXG5cbmNhY2hlT3BpbmlvbnMgPSAoZmlsdGVyVXNlcikgLT5cbiAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXG4gICAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHVzZXIgb3BpbmlvbnMgZm9yICN7ZmlsdGVyVXNlcn1cIilcblxuaXNPcmRlcmVkID0gLT5cbiAgcmV0dXJuIGxhc3RPcmRlcmVkXG5cbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxuICBsYXN0T3JkZXJlZCA9IGZhbHNlXG4gIHNvbG9GaWx0ZXJzID0gbnVsbFxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXG4gICAgc29sb0ZpbHRlcnMgPSBbXVxuICAgIHJhd0ZpbHRlcnMgPSBmaWx0ZXJTdHJpbmcuc3BsaXQoL1xccj9cXG4vKVxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xuICAgICAgZmlsdGVyID0gZmlsdGVyLnRyaW0oKVxuICAgICAgaWYgZmlsdGVyLmxlbmd0aCA+IDBcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcbiAgICBpZiBzb2xvRmlsdGVycy5sZW5ndGggPT0gMFxuICAgICAgIyBObyBmaWx0ZXJzXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcbiAgY29uc29sZS5sb2cgXCJGaWx0ZXJzOlwiLCBzb2xvRmlsdGVyc1xuICBpZiBmaWx0ZXJEYXRhYmFzZT9cbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxuICBlbHNlXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZyBkYXRhYmFzZS4uLlwiXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcbiAgICBpZiBub3QgZmlsdGVyRGF0YWJhc2U/XG4gICAgICByZXR1cm4gbnVsbFxuXG4gIHNvbG9Vbmxpc3RlZCA9IHt9XG4gIHNvbG9VbnNodWZmbGVkID0gW11cbiAgaWYgc29sb0ZpbHRlcnM/XG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBlLmFsbG93ZWQgPSBmYWxzZVxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcblxuICAgIGFsbEFsbG93ZWQgPSB0cnVlXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC8gKy8pXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJwcml2YXRlXCJcbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcIm9yZGVyZWRcIlxuICAgICAgICBsYXN0T3JkZXJlZCA9IHRydWVcbiAgICAgICAgY29udGludWVcblxuICAgICAgbmVnYXRlZCA9IGZhbHNlXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcblxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXG4gICAgICBpZExvb2t1cCA9IG51bGxcblxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXG5cbiAgICAgIGNvbW1hbmQgPSBwaWVjZXNbMF0udG9Mb3dlckNhc2UoKVxuICAgICAgc3dpdGNoIGNvbW1hbmRcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdhZGRlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUubmlja25hbWUgPT0gc1xuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcbiAgICAgICAgd2hlbiAndGFnJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxuICAgICAgICB3aGVuICdyZWNlbnQnLCAnc2luY2UnXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIGR1cmF0aW9uSW5TZWNvbmRzID0gcGFyc2VEdXJhdGlvbihzdWJzdHJpbmcpXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIHBhcnNpbmcgZXhjZXB0aW9uOiAje3NvbWVFeGNlcHRpb259XCJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIFsje3N1YnN0cmluZ31dIC0gI3tkdXJhdGlvbkluU2Vjb25kc31cIlxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXG4gICAgICAgIHdoZW4gJ2xvdmUnLCAnbGlrZScsICdibGVoJywgJ2hhdGUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdub25lJ1xuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxuICAgICAgICB3aGVuICdmdWxsJ1xuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xuICAgICAgICAgIGlkTG9va3VwID0ge31cbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cbiAgICAgICAgd2hlbiAndW4nLCAndWwnLCAndW5saXN0ZWQnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiBub3QgaWQubWF0Y2goL155b3V0dWJlXy8pIGFuZCBub3QgaWQubWF0Y2goL15tdHZfLylcbiAgICAgICAgICAgICAgaWQgPSBcInlvdXR1YmVfI3tpZH1cIlxuICAgICAgICAgICAgcGlwZVNwbGl0ID0gaWQuc3BsaXQoL1xcfC8pXG4gICAgICAgICAgICBpZCA9IHBpcGVTcGxpdC5zaGlmdCgpXG4gICAgICAgICAgICBzdGFydCA9IC0xXG4gICAgICAgICAgICBlbmQgPSAtMVxuICAgICAgICAgICAgaWYgcGlwZVNwbGl0Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChwaXBlU3BsaXQuc2hpZnQoKSlcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgIGVuZCA9IHBhcnNlSW50KHBpcGVTcGxpdC5zaGlmdCgpKVxuICAgICAgICAgICAgdGl0bGUgPSBpZFxuICAgICAgICAgICAgaWYgbWF0Y2hlcyA9IHRpdGxlLm1hdGNoKC9eeW91dHViZV8oLispLylcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgICBlbHNlIGlmIG1hdGNoZXMgPSB0aXRsZS5tYXRjaCgvXm10dl8oLispLylcbiAgICAgICAgICAgICAgdGl0bGUgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgICBzb2xvVW5saXN0ZWRbaWRdID1cbiAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICAgIGFydGlzdDogJ1VubGlzdGVkIFZpZGVvcydcbiAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlXG4gICAgICAgICAgICAgIHRhZ3M6IHt9XG4gICAgICAgICAgICAgIG5pY2tuYW1lOiAnVW5saXN0ZWQnXG4gICAgICAgICAgICAgIGNvbXBhbnk6ICdVbmxpc3RlZCdcbiAgICAgICAgICAgICAgdGh1bWI6ICd1bmxpc3RlZC5wbmcnXG4gICAgICAgICAgICAgIHN0YXJ0OiBzdGFydFxuICAgICAgICAgICAgICBlbmQ6IGVuZFxuICAgICAgICAgICAgICB1bmxpc3RlZDogdHJ1ZVxuXG4gICAgICAgICAgICAjIGZvcmNlLXNraXAgYW55IHByZS1leGlzdGluZyBEQiB2ZXJzaW9ucyBvZiB0aGlzIElEXG4gICAgICAgICAgICBpZiBmaWx0ZXJEYXRhYmFzZVtpZF0/XG4gICAgICAgICAgICAgIGZpbHRlckRhdGFiYXNlW2lkXS5za2lwcGVkID0gdHJ1ZVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGlmIGlkTG9va3VwP1xuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcbiAgICAgICAgICBlID0gZmlsdGVyRGF0YWJhc2VbaWRdXG4gICAgICAgICAgaWYgbm90IGU/XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIGlzTWF0Y2ggPSB0cnVlXG4gICAgICAgICAgaWYgbmVnYXRlZFxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgICAgaWYgaXNNYXRjaFxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcbiAgICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcbiAgICAgICAgICBpZiBpc01hdGNoXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcblxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcbiAgZWxzZVxuICAgICMgUXVldWUgaXQgYWxsIHVwXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcblxuICBmb3IgaywgdW5saXN0ZWQgb2Ygc29sb1VubGlzdGVkXG4gICAgc29sb1Vuc2h1ZmZsZWQucHVzaCB1bmxpc3RlZFxuXG4gIGlmIHNvcnRCeUFydGlzdCBhbmQgbm90IGxhc3RPcmRlcmVkXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gLTFcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgcmV0dXJuIHNvbG9VbnNodWZmbGVkXG5cbmNhbGNJZEluZm8gPSAoaWQpIC0+XG4gIGlmIG5vdCBtYXRjaGVzID0gaWQubWF0Y2goL14oW2Etel0rKV8oXFxTKykvKVxuICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIElEOiAje2lkfVwiXG4gICAgcmV0dXJuIG51bGxcbiAgcHJvdmlkZXIgPSBtYXRjaGVzWzFdXG4gIHJlYWwgPSBtYXRjaGVzWzJdXG5cbiAgc3dpdGNoIHByb3ZpZGVyXG4gICAgd2hlbiAneW91dHViZSdcbiAgICAgIHVybCA9IFwiaHR0cHM6Ly95b3V0dS5iZS8je3JlYWx9XCJcbiAgICB3aGVuICdtdHYnXG4gICAgICB1cmwgPSBcIi92aWRlb3MvI3tyZWFsfS5tcDRcIlxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIFByb3ZpZGVyOiAje3Byb3ZpZGVyfVwiXG4gICAgICByZXR1cm4gbnVsbFxuXG4gIHJldHVybiB7XG4gICAgaWQ6IGlkXG4gICAgcHJvdmlkZXI6IHByb3ZpZGVyXG4gICAgcmVhbDogcmVhbFxuICAgIHVybDogdXJsXG4gIH1cblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xuICBpc09yZGVyZWQ6IGlzT3JkZXJlZFxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxuICBjYWxjSWRJbmZvOiBjYWxjSWRJbmZvXG4iXX0=
