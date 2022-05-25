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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9wbGF5LmNvZmZlZSIsInNyYy9jbGllbnQvcGxheWVyLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFNBQUEsRUFBQSxtQkFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxpQkFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLGdCQUFBLEVBQUEsVUFBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLGVBQUEsRUFBQSxtQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxlQUFBLEVBQUEscUJBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxh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Q0FBSSxDQUFBLE9BQUEsR0FBVSxFQUFFLENBQUMsS0FBSCxDQUFTLGlCQUFULENBQVYsQ0FBUDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxvQkFBQSxDQUFBLENBQXVCLEVBQXZCLENBQUEsQ0FBWjtBQUNBLFdBQU8sS0FGVDs7RUFHQSxRQUFBLEdBQVcsT0FBTyxDQUFDLENBQUQ7RUFDbEIsSUFBQSxHQUFPLE9BQU8sQ0FBQyxDQUFEO0FBRWQsVUFBTyxRQUFQO0FBQUEsU0FDTyxTQURQO01BRUksR0FBQSxHQUFNLENBQUEsaUJBQUEsQ0FBQSxDQUFvQixJQUFwQixDQUFBO0FBREg7QUFEUCxTQUdPLEtBSFA7TUFJSSxHQUFBLEdBQU0sQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsSUFBQTtBQURIO0FBSFA7TUFNSSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixRQUE3QixDQUFBLENBQVo7QUFDQSxhQUFPO0FBUFg7QUFTQSxTQUFPO0lBQ0wsRUFBQSxFQUFJLEVBREM7SUFFTCxRQUFBLEVBQVUsUUFGTDtJQUdMLElBQUEsRUFBTSxJQUhEO0lBSUwsR0FBQSxFQUFLO0VBSkE7QUFoQkk7O0FBdUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWMsWUFEZDtFQUVBLFVBQUEsRUFBWTtBQUZaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyohXG4gKiBjbGlwYm9hcmQuanMgdjIuMC44XG4gKiBodHRwczovL2NsaXBib2FyZGpzLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCBNSVQgwqkgWmVubyBSb2NoYVxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJDbGlwYm9hcmRKU1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJDbGlwYm9hcmRKU1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbigpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZXNfXyA9ICh7XG5cbi8qKiovIDEzNDpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gRVhQT1JUU1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIHtcbiAgXCJkZWZhdWx0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gLyogYmluZGluZyAqLyBjbGlwYm9hcmQ7IH1cbn0pO1xuXG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL3RpbnktZW1pdHRlci9pbmRleC5qc1xudmFyIHRpbnlfZW1pdHRlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjc5KTtcbnZhciB0aW55X2VtaXR0ZXJfZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4odGlueV9lbWl0dGVyKTtcbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvZ29vZC1saXN0ZW5lci9zcmMvbGlzdGVuLmpzXG52YXIgbGlzdGVuID0gX193ZWJwYWNrX3JlcXVpcmVfXygzNzApO1xudmFyIGxpc3Rlbl9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubihsaXN0ZW4pO1xuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy9zZWxlY3Qvc3JjL3NlbGVjdC5qc1xudmFyIHNyY19zZWxlY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgxNyk7XG52YXIgc2VsZWN0X2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKHNyY19zZWxlY3QpO1xuOy8vIENPTkNBVEVOQVRFRCBNT0RVTEU6IC4vc3JjL2NsaXBib2FyZC1hY3Rpb24uanNcbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG5cbi8qKlxuICogSW5uZXIgY2xhc3Mgd2hpY2ggcGVyZm9ybXMgc2VsZWN0aW9uIGZyb20gZWl0aGVyIGB0ZXh0YCBvciBgdGFyZ2V0YFxuICogcHJvcGVydGllcyBhbmQgdGhlbiBleGVjdXRlcyBjb3B5IG9yIGN1dCBvcGVyYXRpb25zLlxuICovXG5cbnZhciBDbGlwYm9hcmRBY3Rpb24gPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIENsaXBib2FyZEFjdGlvbihvcHRpb25zKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsaXBib2FyZEFjdGlvbik7XG5cbiAgICB0aGlzLnJlc29sdmVPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuaW5pdFNlbGVjdGlvbigpO1xuICB9XG4gIC8qKlxuICAgKiBEZWZpbmVzIGJhc2UgcHJvcGVydGllcyBwYXNzZWQgZnJvbSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoQ2xpcGJvYXJkQWN0aW9uLCBbe1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlT3B0aW9ucygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuYWN0aW9uID0gb3B0aW9ucy5hY3Rpb247XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyO1xuICAgICAgdGhpcy5lbWl0dGVyID0gb3B0aW9ucy5lbWl0dGVyO1xuICAgICAgdGhpcy50YXJnZXQgPSBvcHRpb25zLnRhcmdldDtcbiAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMudGV4dDtcbiAgICAgIHRoaXMudHJpZ2dlciA9IG9wdGlvbnMudHJpZ2dlcjtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gJyc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlY2lkZXMgd2hpY2ggc2VsZWN0aW9uIHN0cmF0ZWd5IGlzIGdvaW5nIHRvIGJlIGFwcGxpZWQgYmFzZWRcbiAgICAgKiBvbiB0aGUgZXhpc3RlbmNlIG9mIGB0ZXh0YCBhbmQgYHRhcmdldGAgcHJvcGVydGllcy5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluaXRTZWxlY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdFNlbGVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRleHQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RGYWtlKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0VGFyZ2V0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmYWtlIHRleHRhcmVhIGVsZW1lbnQsIHNldHMgaXRzIHZhbHVlIGZyb20gYHRleHRgIHByb3BlcnR5LFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY3JlYXRlRmFrZUVsZW1lbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlRmFrZUVsZW1lbnQoKSB7XG4gICAgICB2YXIgaXNSVEwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXInKSA9PT0gJ3J0bCc7XG4gICAgICB0aGlzLmZha2VFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTsgLy8gUHJldmVudCB6b29taW5nIG9uIGlPU1xuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLmZvbnRTaXplID0gJzEycHQnOyAvLyBSZXNldCBib3ggbW9kZWxcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5ib3JkZXIgPSAnMCc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnBhZGRpbmcgPSAnMCc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLm1hcmdpbiA9ICcwJzsgLy8gTW92ZSBlbGVtZW50IG91dCBvZiBzY3JlZW4gaG9yaXpvbnRhbGx5XG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZVtpc1JUTCA/ICdyaWdodCcgOiAnbGVmdCddID0gJy05OTk5cHgnOyAvLyBNb3ZlIGVsZW1lbnQgdG8gdGhlIHNhbWUgcG9zaXRpb24gdmVydGljYWxseVxuXG4gICAgICB2YXIgeVBvc2l0aW9uID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnRvcCA9IFwiXCIuY29uY2F0KHlQb3NpdGlvbiwgXCJweFwiKTtcbiAgICAgIHRoaXMuZmFrZUVsZW0uc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKTtcbiAgICAgIHRoaXMuZmFrZUVsZW0udmFsdWUgPSB0aGlzLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5mYWtlRWxlbTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0J3MgdGhlIHZhbHVlIG9mIGZha2VFbGVtLFxuICAgICAqIGFuZCBtYWtlcyBhIHNlbGVjdGlvbiBvbiBpdC5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdEZha2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0RmFrZSgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBmYWtlRWxlbSA9IHRoaXMuY3JlYXRlRmFrZUVsZW1lbnQoKTtcblxuICAgICAgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlRmFrZSgpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5mYWtlSGFuZGxlciA9IHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrKSB8fCB0cnVlO1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZmFrZUVsZW0pO1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWxlY3RfZGVmYXVsdCgpKGZha2VFbGVtKTtcbiAgICAgIHRoaXMuY29weVRleHQoKTtcbiAgICAgIHRoaXMucmVtb3ZlRmFrZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbmx5IHJlbW92ZXMgdGhlIGZha2UgZWxlbWVudCBhZnRlciBhbm90aGVyIGNsaWNrIGV2ZW50LCB0aGF0IHdheVxuICAgICAqIGEgdXNlciBjYW4gaGl0IGBDdHJsK0NgIHRvIGNvcHkgYmVjYXVzZSBzZWxlY3Rpb24gc3RpbGwgZXhpc3RzLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlRmFrZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVGYWtlKCkge1xuICAgICAgaWYgKHRoaXMuZmFrZUhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLmZha2VIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZmFrZUVsZW0pIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5mYWtlRWxlbSk7XG4gICAgICAgIHRoaXMuZmFrZUVsZW0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBjb250ZW50IGZyb20gZWxlbWVudCBwYXNzZWQgb24gYHRhcmdldGAgcHJvcGVydHkuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RUYXJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0VGFyZ2V0KCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSBzZWxlY3RfZGVmYXVsdCgpKHRoaXMudGFyZ2V0KTtcbiAgICAgIHRoaXMuY29weVRleHQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIGNvcHkgb3BlcmF0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNvcHlUZXh0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHlUZXh0KCkge1xuICAgICAgdmFyIHN1Y2NlZWRlZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgc3VjY2VlZGVkID0gZG9jdW1lbnQuZXhlY0NvbW1hbmQodGhpcy5hY3Rpb24pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHN1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhhbmRsZVJlc3VsdChzdWNjZWVkZWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyBhbiBldmVudCBiYXNlZCBvbiB0aGUgY29weSBvcGVyYXRpb24gcmVzdWx0LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gc3VjY2VlZGVkXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVSZXN1bHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlUmVzdWx0KHN1Y2NlZWRlZCkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoc3VjY2VlZGVkID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJywge1xuICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICB0ZXh0OiB0aGlzLnNlbGVjdGVkVGV4dCxcbiAgICAgICAgdHJpZ2dlcjogdGhpcy50cmlnZ2VyLFxuICAgICAgICBjbGVhclNlbGVjdGlvbjogdGhpcy5jbGVhclNlbGVjdGlvbi5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgZm9jdXMgYXdheSBmcm9tIGB0YXJnZXRgIGFuZCBiYWNrIHRvIHRoZSB0cmlnZ2VyLCByZW1vdmVzIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY2xlYXJTZWxlY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50cmlnZ2VyKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlci5mb2N1cygpO1xuICAgICAgfVxuXG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYGFjdGlvbmAgdG8gYmUgcGVyZm9ybWVkIHdoaWNoIGNhbiBiZSBlaXRoZXIgJ2NvcHknIG9yICdjdXQnLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbGlmZWN5Y2xlLlxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFjdGlvblwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KCkge1xuICAgICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ2NvcHknO1xuICAgICAgdGhpcy5fYWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICBpZiAodGhpcy5fYWN0aW9uICE9PSAnY29weScgJiYgdGhpcy5fYWN0aW9uICE9PSAnY3V0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJhY3Rpb25cIiB2YWx1ZSwgdXNlIGVpdGhlciBcImNvcHlcIiBvciBcImN1dFwiJyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGBhY3Rpb25gIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWN0aW9uO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBgdGFyZ2V0YCBwcm9wZXJ0eSB1c2luZyBhbiBlbGVtZW50XG4gICAgICogdGhhdCB3aWxsIGJlIGhhdmUgaXRzIGNvbnRlbnQgY29waWVkLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ0YXJnZXRcIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIF90eXBlb2YodGFyZ2V0KSA9PT0gJ29iamVjdCcgJiYgdGFyZ2V0Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAnY29weScgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgYXR0cmlidXRlLiBQbGVhc2UgdXNlIFwicmVhZG9ubHlcIiBpbnN0ZWFkIG9mIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdjdXQnICYmICh0YXJnZXQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpIHx8IHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiBhdHRyaWJ1dGUuIFlvdSBjYW5cXCd0IGN1dCB0ZXh0IGZyb20gZWxlbWVudHMgd2l0aCBcInJlYWRvbmx5XCIgb3IgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZXMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgdmFsdWUsIHVzZSBhIHZhbGlkIEVsZW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgdGFyZ2V0YCBwcm9wZXJ0eS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd8SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2xpcGJvYXJkQWN0aW9uO1xufSgpO1xuXG4vKiBoYXJtb255IGRlZmF1bHQgZXhwb3J0ICovIHZhciBjbGlwYm9hcmRfYWN0aW9uID0gKENsaXBib2FyZEFjdGlvbik7XG47Ly8gQ09OQ0FURU5BVEVEIE1PRFVMRTogLi9zcmMvY2xpcGJvYXJkLmpzXG5mdW5jdGlvbiBjbGlwYm9hcmRfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBjbGlwYm9hcmRfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IGNsaXBib2FyZF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gY2xpcGJvYXJkX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IG8uX19wcm90b19fID0gcDsgcmV0dXJuIG87IH07IHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7IH1cblxuZnVuY3Rpb24gX2NyZWF0ZVN1cGVyKERlcml2ZWQpIHsgdmFyIGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCk7IHJldHVybiBmdW5jdGlvbiBfY3JlYXRlU3VwZXJJbnRlcm5hbCgpIHsgdmFyIFN1cGVyID0gX2dldFByb3RvdHlwZU9mKERlcml2ZWQpLCByZXN1bHQ7IGlmIChoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KSB7IHZhciBOZXdUYXJnZXQgPSBfZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3I7IHJlc3VsdCA9IFJlZmxlY3QuY29uc3RydWN0KFN1cGVyLCBhcmd1bWVudHMsIE5ld1RhcmdldCk7IH0gZWxzZSB7IHJlc3VsdCA9IFN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH0gcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIHJlc3VsdCk7IH07IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoY2xpcGJvYXJkX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTsgfVxuXG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cblxuZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHsgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlOyBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlOyBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlOyB0cnkgeyBEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFJlZmxlY3QuY29uc3RydWN0KERhdGUsIFtdLCBmdW5jdGlvbiAoKSB7fSkpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH0gfVxuXG5mdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2YobykgeyByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pOyB9OyByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pOyB9XG5cblxuXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJldHJpZXZlIGF0dHJpYnV0ZSB2YWx1ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdWZmaXhcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICovXG5cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZVZhbHVlKHN1ZmZpeCwgZWxlbWVudCkge1xuICB2YXIgYXR0cmlidXRlID0gXCJkYXRhLWNsaXBib2FyZC1cIi5jb25jYXQoc3VmZml4KTtcblxuICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyB3aGljaCB0YWtlcyBvbmUgb3IgbW9yZSBlbGVtZW50cywgYWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlbSxcbiAqIGFuZCBpbnN0YW50aWF0ZXMgYSBuZXcgYENsaXBib2FyZEFjdGlvbmAgb24gZWFjaCBjbGljay5cbiAqL1xuXG5cbnZhciBDbGlwYm9hcmQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKF9FbWl0dGVyKSB7XG4gIF9pbmhlcml0cyhDbGlwYm9hcmQsIF9FbWl0dGVyKTtcblxuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKENsaXBib2FyZCk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0cmlnZ2VyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBDbGlwYm9hcmQodHJpZ2dlciwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcztcblxuICAgIGNsaXBib2FyZF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbGlwYm9hcmQpO1xuXG4gICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKTtcblxuICAgIF90aGlzLnJlc29sdmVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgX3RoaXMubGlzdGVuQ2xpY2sodHJpZ2dlcik7XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgLyoqXG4gICAqIERlZmluZXMgaWYgYXR0cmlidXRlcyB3b3VsZCBiZSByZXNvbHZlZCB1c2luZyBpbnRlcm5hbCBzZXR0ZXIgZnVuY3Rpb25zXG4gICAqIG9yIGN1c3RvbSBmdW5jdGlvbnMgdGhhdCB3ZXJlIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG5cbiAgY2xpcGJvYXJkX2NyZWF0ZUNsYXNzKENsaXBib2FyZCwgW3tcbiAgICBrZXk6IFwicmVzb2x2ZU9wdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmFjdGlvbiA9IHR5cGVvZiBvcHRpb25zLmFjdGlvbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuYWN0aW9uIDogdGhpcy5kZWZhdWx0QWN0aW9uO1xuICAgICAgdGhpcy50YXJnZXQgPSB0eXBlb2Ygb3B0aW9ucy50YXJnZXQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRhcmdldCA6IHRoaXMuZGVmYXVsdFRhcmdldDtcbiAgICAgIHRoaXMudGV4dCA9IHR5cGVvZiBvcHRpb25zLnRleHQgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnRleHQgOiB0aGlzLmRlZmF1bHRUZXh0O1xuICAgICAgdGhpcy5jb250YWluZXIgPSBjbGlwYm9hcmRfdHlwZW9mKG9wdGlvbnMuY29udGFpbmVyKSA9PT0gJ29iamVjdCcgPyBvcHRpb25zLmNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjbGljayBldmVudCBsaXN0ZW5lciB0byB0aGUgcGFzc2VkIHRyaWdnZXIuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImxpc3RlbkNsaWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RlbkNsaWNrKHRyaWdnZXIpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB0aGlzLmxpc3RlbmVyID0gbGlzdGVuX2RlZmF1bHQoKSh0cmlnZ2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMyLm9uQ2xpY2soZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIG5ldyBgQ2xpcGJvYXJkQWN0aW9uYCBvbiBlYWNoIGNsaWNrIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm9uQ2xpY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICB2YXIgdHJpZ2dlciA9IGUuZGVsZWdhdGVUYXJnZXQgfHwgZS5jdXJyZW50VGFyZ2V0O1xuXG4gICAgICBpZiAodGhpcy5jbGlwYm9hcmRBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG5ldyBjbGlwYm9hcmRfYWN0aW9uKHtcbiAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbih0cmlnZ2VyKSxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCh0cmlnZ2VyKSxcbiAgICAgICAgdGV4dDogdGhpcy50ZXh0KHRyaWdnZXIpLFxuICAgICAgICBjb250YWluZXI6IHRoaXMuY29udGFpbmVyLFxuICAgICAgICB0cmlnZ2VyOiB0cmlnZ2VyLFxuICAgICAgICBlbWl0dGVyOiB0aGlzXG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgYWN0aW9uYCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0QWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRBY3Rpb24odHJpZ2dlcikge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZVZhbHVlKCdhY3Rpb24nLCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgdGFyZ2V0YCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0VGFyZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRUYXJnZXQodHJpZ2dlcikge1xuICAgICAgdmFyIHNlbGVjdG9yID0gZ2V0QXR0cmlidXRlVmFsdWUoJ3RhcmdldCcsIHRyaWdnZXIpO1xuXG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdXBwb3J0IG9mIHRoZSBnaXZlbiBhY3Rpb24sIG9yIGFsbCBhY3Rpb25zIGlmIG5vIGFjdGlvbiBpc1xuICAgICAqIGdpdmVuLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbYWN0aW9uXVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdFRleHRcIixcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYHRleHRgIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdFRleHQodHJpZ2dlcikge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZVZhbHVlKCd0ZXh0JywgdHJpZ2dlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbGlmZWN5Y2xlLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdGhpcy5saXN0ZW5lci5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLmNsaXBib2FyZEFjdGlvbikge1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbi5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1dLCBbe1xuICAgIGtleTogXCJpc1N1cHBvcnRlZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc1N1cHBvcnRlZCgpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFsnY29weScsICdjdXQnXTtcbiAgICAgIHZhciBhY3Rpb25zID0gdHlwZW9mIGFjdGlvbiA9PT0gJ3N0cmluZycgPyBbYWN0aW9uXSA6IGFjdGlvbjtcbiAgICAgIHZhciBzdXBwb3J0ID0gISFkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQ7XG4gICAgICBhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICBzdXBwb3J0ID0gc3VwcG9ydCAmJiAhIWRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN1cHBvcnRlZChhY3Rpb24pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2xpcGJvYXJkO1xufSgodGlueV9lbWl0dGVyX2RlZmF1bHQoKSkpO1xuXG4vKiBoYXJtb255IGRlZmF1bHQgZXhwb3J0ICovIHZhciBjbGlwYm9hcmQgPSAoQ2xpcGJvYXJkKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDgyODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxudmFyIERPQ1VNRU5UX05PREVfVFlQRSA9IDk7XG5cbi8qKlxuICogQSBwb2x5ZmlsbCBmb3IgRWxlbWVudC5tYXRjaGVzKClcbiAqL1xuaWYgKHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAhRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICAgIHZhciBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuXG4gICAgcHJvdG8ubWF0Y2hlcyA9IHByb3RvLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIGNsb3Nlc3QgcGFyZW50IHRoYXQgbWF0Y2hlcyBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY2xvc2VzdCAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICB3aGlsZSAoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlICE9PSBET0NVTUVOVF9OT0RFX1RZUEUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Lm1hdGNoZXMgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgIGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9zZXN0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA0Mzg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGNsb3Nlc3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDgyOCk7XG5cbi8qKlxuICogRGVsZWdhdGVzIGV2ZW50IHRvIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIF9kZWxlZ2F0ZShlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpIHtcbiAgICB2YXIgbGlzdGVuZXJGbiA9IGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXJGbiwgdXNlQ2FwdHVyZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lckZuLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBEZWxlZ2F0ZXMgZXZlbnQgdG8gYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8U3RyaW5nfEFycmF5fSBbZWxlbWVudHNdXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGRlbGVnYXRlKGVsZW1lbnRzLCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpIHtcbiAgICAvLyBIYW5kbGUgdGhlIHJlZ3VsYXIgRWxlbWVudCB1c2FnZVxuICAgIGlmICh0eXBlb2YgZWxlbWVudHMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIEVsZW1lbnQtbGVzcyB1c2FnZSwgaXQgZGVmYXVsdHMgdG8gZ2xvYmFsIGRlbGVnYXRpb25cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gVXNlIGBkb2N1bWVudGAgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciwgdGhlbiBhcHBseSBhcmd1bWVudHNcbiAgICAgICAgLy8gVGhpcyBpcyBhIHNob3J0IHdheSB0byAudW5zaGlmdCBgYXJndW1lbnRzYCB3aXRob3V0IHJ1bm5pbmcgaW50byBkZW9wdGltaXphdGlvbnNcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZS5iaW5kKG51bGwsIGRvY3VtZW50KS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBTZWxlY3Rvci1iYXNlZCB1c2FnZVxuICAgIGlmICh0eXBlb2YgZWxlbWVudHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbGVtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIEFycmF5LWxpa2UgYmFzZWQgdXNhZ2VcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGVsZW1lbnRzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogRmluZHMgY2xvc2VzdCBtYXRjaCBhbmQgaW52b2tlcyBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuZXIoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5kZWxlZ2F0ZVRhcmdldCA9IGNsb3Nlc3QoZS50YXJnZXQsIHNlbGVjdG9yKTtcblxuICAgICAgICBpZiAoZS5kZWxlZ2F0ZVRhcmdldCkge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChlbGVtZW50LCBlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gODc5OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBleHBvcnRzKSB7XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBIVE1MIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLm5vZGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICYmIHZhbHVlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnRcbiAgICAgICAgJiYgdmFsdWUubm9kZVR5cGUgPT09IDE7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgbGlzdCBvZiBIVE1MIGVsZW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5ub2RlTGlzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuXG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgJiYgKHR5cGUgPT09ICdbb2JqZWN0IE5vZGVMaXN0XScgfHwgdHlwZSA9PT0gJ1tvYmplY3QgSFRNTENvbGxlY3Rpb25dJylcbiAgICAgICAgJiYgKCdsZW5ndGgnIGluIHZhbHVlKVxuICAgICAgICAmJiAodmFsdWUubGVuZ3RoID09PSAwIHx8IGV4cG9ydHMubm9kZSh2YWx1ZVswXSkpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuc3RyaW5nID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuZm4gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcblxuICAgIHJldHVybiB0eXBlID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gMzcwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX191bnVzZWRfd2VicGFja19leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBpcyA9IF9fd2VicGFja19yZXF1aXJlX18oODc5KTtcbnZhciBkZWxlZ2F0ZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDM4KTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgYWxsIHBhcmFtcyBhbmQgY2FsbHMgdGhlIHJpZ2h0XG4gKiBsaXN0ZW5lciBmdW5jdGlvbiBiYXNlZCBvbiBpdHMgdGFyZ2V0IHR5cGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRhcmdldFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbih0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0YXJnZXQgJiYgIXR5cGUgJiYgIWNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyByZXF1aXJlZCBhcmd1bWVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzLnN0cmluZyh0eXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIFN0cmluZycpO1xuICAgIH1cblxuICAgIGlmICghaXMuZm4oY2FsbGJhY2spKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoaXJkIGFyZ3VtZW50IG11c3QgYmUgYSBGdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmIChpcy5ub2RlKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3Rlbk5vZGUodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzLm5vZGVMaXN0KHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3Rlbk5vZGVMaXN0KHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5zdHJpbmcodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuU2VsZWN0b3IodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nLCBIVE1MRWxlbWVudCwgSFRNTENvbGxlY3Rpb24sIG9yIE5vZGVMaXN0Jyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBIVE1MIGVsZW1lbnRcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ob2RlKG5vZGUsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBsaXN0IG9mIEhUTUwgZWxlbWVudHNcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8SFRNTENvbGxlY3Rpb259IG5vZGVMaXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTm9kZUxpc3Qobm9kZUxpc3QsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5vZGVMaXN0LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBhIHNlbGVjdG9yXG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5TZWxlY3RvcihzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZGVsZWdhdGUoZG9jdW1lbnQuYm9keSwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0ZW47XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDgxNzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxuZnVuY3Rpb24gc2VsZWN0KGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZWN0ZWRUZXh0O1xuXG4gICAgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBlbGVtZW50LnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSAnSU5QVVQnIHx8IGVsZW1lbnQubm9kZU5hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgdmFyIGlzUmVhZE9ubHkgPSBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgncmVhZG9ubHknKTtcblxuICAgICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xuXG4gICAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBlbGVtZW50LnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKSkge1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcblxuICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XG4gICAgICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcblxuICAgICAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0ZWRUZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGVjdDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gMjc5OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5mdW5jdGlvbiBFICgpIHtcbiAgLy8gS2VlcCB0aGlzIGVtcHR5IHNvIGl0J3MgZWFzaWVyIHRvIGluaGVyaXQgZnJvbVxuICAvLyAodmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9saXBzbWFjayBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvaXNzdWVzLzMpXG59XG5cbkUucHJvdG90eXBlID0ge1xuICBvbjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuXG4gICAgKGVbbmFtZV0gfHwgKGVbbmFtZV0gPSBbXSkpLnB1c2goe1xuICAgICAgZm46IGNhbGxiYWNrLFxuICAgICAgY3R4OiBjdHhcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9uY2U6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGZ1bmN0aW9uIGxpc3RlbmVyICgpIHtcbiAgICAgIHNlbGYub2ZmKG5hbWUsIGxpc3RlbmVyKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgbGlzdGVuZXIuXyA9IGNhbGxiYWNrXG4gICAgcmV0dXJuIHRoaXMub24obmFtZSwgbGlzdGVuZXIsIGN0eCk7XG4gIH0sXG5cbiAgZW1pdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgZGF0YSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZXZ0QXJyID0gKCh0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KSlbbmFtZV0gfHwgW10pLnNsaWNlKCk7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBsZW4gPSBldnRBcnIubGVuZ3RoO1xuXG4gICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGV2dEFycltpXS5mbi5hcHBseShldnRBcnJbaV0uY3R4LCBkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvZmY6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG4gICAgdmFyIGV2dHMgPSBlW25hbWVdO1xuICAgIHZhciBsaXZlRXZlbnRzID0gW107XG5cbiAgICBpZiAoZXZ0cyAmJiBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGV2dHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGV2dHNbaV0uZm4gIT09IGNhbGxiYWNrICYmIGV2dHNbaV0uZm4uXyAhPT0gY2FsbGJhY2spXG4gICAgICAgICAgbGl2ZUV2ZW50cy5wdXNoKGV2dHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBldmVudCBmcm9tIHF1ZXVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtcbiAgICAvLyBTdWdnZXN0ZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL2xhemRcbiAgICAvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvY29tbWl0L2M2ZWJmYWE5YmM5NzNiMzNkMTEwYTg0YTMwNzc0MmI3Y2Y5NGM5NTMjY29tbWl0Y29tbWVudC01MDI0OTEwXG5cbiAgICAobGl2ZUV2ZW50cy5sZW5ndGgpXG4gICAgICA/IGVbbmFtZV0gPSBsaXZlRXZlbnRzXG4gICAgICA6IGRlbGV0ZSBlW25hbWVdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRTtcbm1vZHVsZS5leHBvcnRzLlRpbnlFbWl0dGVyID0gRTtcblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyBcdH0pO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcbi8qKioqKiovIFx0XHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi8gXHRcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0ICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG4vKioqKioqLyBcdFx0XHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG4vKioqKioqLyBcdFx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuLyoqKioqKi8gXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG4vKioqKioqLyBcdFx0XHRcdH1cbi8qKioqKiovIFx0XHRcdH1cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvLyBtb2R1bGUgZXhwb3J0cyBtdXN0IGJlIHJldHVybmVkIGZyb20gcnVudGltZSBzbyBlbnRyeSBpbmxpbmluZyBpcyBkaXNhYmxlZFxuLyoqKioqKi8gXHQvLyBzdGFydHVwXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygxMzQpO1xuLyoqKioqKi8gfSkoKVxuLmRlZmF1bHQ7XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBBIG1vZHVsZSBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uc1xuICovXG5cbi8qKlxuICogVGhlIHBhdHRlcm4gdXNlZCBmb3IgcGFyc2luZyBJU084NjAxIGR1cmF0aW9uIChQblluTW5EVG5Ibk1uUykuXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIHRoZSB3ZWVrIGZvcm1hdCBQblcuXG4gKi9cblxuLy8gUG5Zbk1uRFRuSG5NblNcbnZhciBudW1iZXJzID0gJ1xcXFxkKyg/OltcXFxcLixdXFxcXGQrKT8nO1xudmFyIHdlZWtQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdXKSc7XG52YXIgZGF0ZVBhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1kpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnRCk/JztcbnZhciB0aW1lUGF0dGVybiA9ICdUKCcgKyBudW1iZXJzICsgJ0gpPygnICsgbnVtYmVycyArICdNKT8oJyArIG51bWJlcnMgKyAnUyk/JztcblxudmFyIGlzbzg2MDEgPSAnUCg/OicgKyB3ZWVrUGF0dGVybiArICd8JyArIGRhdGVQYXR0ZXJuICsgJyg/OicgKyB0aW1lUGF0dGVybiArICcpPyknO1xudmFyIG9iak1hcCA9IFsnd2Vla3MnLCAneWVhcnMnLCAnbW9udGhzJywgJ2RheXMnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbi8qKlxuICogVGhlIElTTzg2MDEgcmVnZXggZm9yIG1hdGNoaW5nIC8gdGVzdGluZyBkdXJhdGlvbnNcbiAqL1xudmFyIHBhdHRlcm4gPSBleHBvcnRzLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGlzbzg2MDEpO1xuXG4vKiogUGFyc2UgUG5Zbk1uRFRuSG5NblMgZm9ybWF0IHRvIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGR1cmF0aW9uU3RyaW5nIC0gUG5Zbk1uRFRuSG5NblMgZm9ybWF0dGVkIHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fSAtIFdpdGggYSBwcm9wZXJ0eSBmb3IgZWFjaCBwYXJ0IG9mIHRoZSBwYXR0ZXJuXG4gKi9cbnZhciBwYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiBwYXJzZShkdXJhdGlvblN0cmluZykge1xuICAvLyBTbGljZSBhd2F5IGZpcnN0IGVudHJ5IGluIG1hdGNoLWFycmF5XG4gIHJldHVybiBkdXJhdGlvblN0cmluZy5tYXRjaChwYXR0ZXJuKS5zbGljZSgxKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIG5leHQsIGlkeCkge1xuICAgIHByZXZbb2JqTWFwW2lkeF1dID0gcGFyc2VGbG9hdChuZXh0KSB8fCAwO1xuICAgIHJldHVybiBwcmV2O1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gYW4gZW5kIERhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgRGF0ZSBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtEYXRlfSAtIFRoZSByZXN1bHRpbmcgZW5kIERhdGVcbiAqL1xudmFyIGVuZCA9IGV4cG9ydHMuZW5kID0gZnVuY3Rpb24gZW5kKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgLy8gQ3JlYXRlIHR3byBlcXVhbCB0aW1lc3RhbXBzLCBhZGQgZHVyYXRpb24gdG8gJ3RoZW4nIGFuZCByZXR1cm4gdGltZSBkaWZmZXJlbmNlXG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIHRoZW4gPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXG4gIHRoZW4uc2V0RnVsbFllYXIodGhlbi5nZXRGdWxsWWVhcigpICsgZHVyYXRpb24ueWVhcnMpO1xuICB0aGVuLnNldE1vbnRoKHRoZW4uZ2V0TW9udGgoKSArIGR1cmF0aW9uLm1vbnRocyk7XG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLmRheXMpO1xuICB0aGVuLnNldEhvdXJzKHRoZW4uZ2V0SG91cnMoKSArIGR1cmF0aW9uLmhvdXJzKTtcbiAgdGhlbi5zZXRNaW51dGVzKHRoZW4uZ2V0TWludXRlcygpICsgZHVyYXRpb24ubWludXRlcyk7XG4gIC8vIFRoZW4uc2V0U2Vjb25kcyh0aGVuLmdldFNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMpO1xuICB0aGVuLnNldE1pbGxpc2Vjb25kcyh0aGVuLmdldE1pbGxpc2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyAqIDEwMDApO1xuICAvLyBTcGVjaWFsIGNhc2Ugd2Vla3NcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24ud2Vla3MgKiA3KTtcblxuICByZXR1cm4gdGhlbjtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBzZWNvbmRzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtEYXRlfSBzdGFydERhdGUgLSBUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG52YXIgdG9TZWNvbmRzID0gZXhwb3J0cy50b1NlY29uZHMgPSBmdW5jdGlvbiB0b1NlY29uZHMoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICB2YXIgdGhlbiA9IGVuZChkdXJhdGlvbiwgbm93KTtcblxuICB2YXIgc2Vjb25kcyA9ICh0aGVuLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gMTAwMDtcbiAgcmV0dXJuIHNlY29uZHM7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGVuZDogZW5kLFxuICB0b1NlY29uZHM6IHRvU2Vjb25kcyxcbiAgcGF0dGVybjogcGF0dGVybixcbiAgcGFyc2U6IHBhcnNlXG59OyIsImNvbnN0YW50cyA9IHJlcXVpcmUgJy4uL2NvbnN0YW50cydcclxuQ2xpcGJvYXJkID0gcmVxdWlyZSAnY2xpcGJvYXJkJ1xyXG5maWx0ZXJzID0gcmVxdWlyZSAnLi4vZmlsdGVycydcclxuUGxheWVyID0gcmVxdWlyZSAnLi9wbGF5ZXInXHJcblxyXG5zb2NrZXQgPSBudWxsXHJcblxyXG5wbGF5ZXIgPSBudWxsXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbnBsYXlpbmcgPSBmYWxzZVxyXG5zb2xvVW5zaHVmZmxlZCA9IFtdXHJcbnNvbG9RdWV1ZSA9IFtdXHJcbnNvbG9JbmRleCA9IDBcclxuc29sb1RpY2tUaW1lb3V0ID0gbnVsbFxyXG5zb2xvVmlkZW8gPSBudWxsXHJcbnNvbG9FcnJvciA9IG51bGxcclxuc29sb0NvdW50ID0gMFxyXG5zb2xvTGFiZWxzID0gbnVsbFxyXG5zb2xvTWlycm9yID0gZmFsc2VcclxuXHJcblRJTUVfQlVDS0VUUyA9IFtcclxuICB7IHNpbmNlOiAxMjAwLCBkZXNjcmlwdGlvbjogXCIyMCBtaW5cIiB9XHJcbiAgeyBzaW5jZTogMzYwMCwgZGVzY3JpcHRpb246IFwiMSBob3VyXCIgfVxyXG4gIHsgc2luY2U6IDEwODAwLCBkZXNjcmlwdGlvbjogXCIzIGhvdXJzXCIgfVxyXG4gIHsgc2luY2U6IDI4ODAwLCBkZXNjcmlwdGlvbjogXCI4IGhvdXJzXCIgfVxyXG4gIHsgc2luY2U6IDg2NDAwLCBkZXNjcmlwdGlvbjogXCIxIGRheVwiIH1cclxuICB7IHNpbmNlOiAyNTkyMDAsIGRlc2NyaXB0aW9uOiBcIjMgZGF5c1wiIH1cclxuICB7IHNpbmNlOiA2MDQ4MDAsIGRlc2NyaXB0aW9uOiBcIjEgd2Vla1wiIH1cclxuICB7IHNpbmNlOiAyNDE5MjAwLCBkZXNjcmlwdGlvbjogXCI0IHdlZWtzXCIgfVxyXG4gIHsgc2luY2U6IDMxNTM2MDAwLCBkZXNjcmlwdGlvbjogXCIxIHllYXJcIiB9XHJcbiAgeyBzaW5jZTogMzE1MzYwMDAwLCBkZXNjcmlwdGlvbjogXCIxMCB5ZWFyc1wiIH1cclxuICB7IHNpbmNlOiAzMTUzNjAwMDAwLCBkZXNjcmlwdGlvbjogXCIxMDAgeWVhcnNcIiB9XHJcbiAgeyBzaW5jZTogMCwgZGVzY3JpcHRpb246IFwiTmV2ZXIgd2F0Y2hlZFwiIH1cclxuXVxyXG5ORVZFUl9XQVRDSEVEX1RJTUUgPSBUSU1FX0JVQ0tFVFNbVElNRV9CVUNLRVRTLmxlbmd0aCAtIDJdLnNpbmNlICsgMVxyXG5cclxubGFzdFNob3dMaXN0VGltZSA9IG51bGxcclxuc29sb0xhc3RXYXRjaGVkID0ge31cclxudHJ5XHJcbiAgcmF3SlNPTiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsYXN0d2F0Y2hlZCcpXHJcbiAgc29sb0xhc3RXYXRjaGVkID0gSlNPTi5wYXJzZShyYXdKU09OKVxyXG4gIGlmIG5vdCBzb2xvTGFzdFdhdGNoZWQ/IG9yICh0eXBlb2Yoc29sb0xhc3RXYXRjaGVkKSAhPSAnb2JqZWN0JylcclxuICAgIGNvbnNvbGUubG9nIFwic29sb0xhc3RXYXRjaGVkIGlzIG5vdCBhbiBvYmplY3QsIHN0YXJ0aW5nIGZyZXNoLlwiXHJcbiAgICBzb2xvTGFzdFdhdGNoZWQgPSB7fVxyXG4gIGNvbnNvbGUubG9nIFwiUGFyc2VkIGxvY2FsU3RvcmFnZSdzIGxhc3R3YXRjaGVkOiBcIiwgc29sb0xhc3RXYXRjaGVkXHJcbmNhdGNoXHJcbiAgY29uc29sZS5sb2cgXCJGYWlsZWQgdG8gcGFyc2UgbG9jYWxTdG9yYWdlJ3MgbGFzdHdhdGNoZWQsIHN0YXJ0aW5nIGZyZXNoLlwiXHJcbiAgc29sb0xhc3RXYXRjaGVkID0ge31cclxuXHJcbmxhc3RQbGF5ZWRJRCA9IG51bGxcclxuXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbm92ZXJUaW1lcnMgPSBbXVxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0luZm8gPSB7fVxyXG5cclxuZGlzY29yZFRva2VuID0gbnVsbFxyXG5kaXNjb3JkVGFnID0gbnVsbFxyXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXHJcblxyXG5jYXN0QXZhaWxhYmxlID0gZmFsc2VcclxuY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5sYXVuY2hPcGVuID0gZmFsc2UgIyAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhdW5jaCcpID09IFwidHJ1ZVwiKVxyXG4jIGNvbnNvbGUubG9nIFwibGF1bmNoT3BlbjogI3tsYXVuY2hPcGVufVwiXHJcblxyXG5hZGRFbmFibGVkID0gdHJ1ZVxyXG5leHBvcnRFbmFibGVkID0gZmFsc2VcclxuXHJcbmlzVGVzbGEgPSBmYWxzZVxyXG50YXBUaW1lb3V0ID0gbnVsbFxyXG5cclxuY3VycmVudFBsYXlsaXN0TmFtZSA9IG51bGxcclxuXHJcbm9waW5pb25PcmRlciA9IFtdXHJcbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxuICBvcGluaW9uT3JkZXIucHVzaCBvXHJcbm9waW5pb25PcmRlci5wdXNoKCdub25lJylcclxuXHJcbnJhbmRvbVN0cmluZyA9IC0+XHJcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFnZUVwb2NoID0gbm93KClcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5vblRhcFNob3cgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwib25UYXBTaG93XCJcclxuXHJcbiAgb3V0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKVxyXG4gIGlmIHRhcFRpbWVvdXQ/XHJcbiAgICBjbGVhclRpbWVvdXQodGFwVGltZW91dClcclxuICAgIHRhcFRpbWVvdXQgPSBudWxsXHJcbiAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsc2VcclxuICAgIG91dGVyLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICB0YXBUaW1lb3V0ID0gc2V0VGltZW91dCAtPlxyXG4gICAgICBjb25zb2xlLmxvZyBcInRhcFRpbWVvdXQhXCJcclxuICAgICAgb3V0ZXIuc3R5bGUub3BhY2l0eSA9IDBcclxuICAgICAgdGFwVGltZW91dCA9IG51bGxcclxuICAgICwgMTAwMDBcclxuXHJcblxyXG5mYWRlSW4gPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiXHJcbiAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAwXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgKz0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5ID49IDFcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcblxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MSlcIlxyXG5cclxuZmFkZU91dCA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDFcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSAtPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPD0gMFxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDBcclxuICAgICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTApXCJcclxuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaXZlJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWNvbnRyb2xzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikuZm9jdXMoKVxyXG4gIGxhdW5jaE9wZW4gPSB0cnVlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICd0cnVlJylcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpdmUnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXljb250cm9scycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxuc2hvd1dhdGNoTGl2ZSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpdmUnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Y29udHJvbHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuY2FsY1Blcm1hID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGlmIG5vdCBkaXNjb3JkTmlja25hbWU/IG9yIChzZWxlY3RlZE5hbWUubGVuZ3RoID09IDApXHJcbiAgICByZXR1cm4gXCJcIlxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwicFwiKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIi8je2VuY29kZVVSSUNvbXBvbmVudChkaXNjb3JkTmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZE5hbWUpfVwiXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuY2FsY1NoYXJlVVJMID0gKG1pcnJvcikgLT5cclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgaWYgbWlycm9yXHJcbiAgICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9wbGF5JC8sIFwibVwiKVxyXG4gICAgcmV0dXJuIGJhc2VVUkwgKyBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudChzb2xvSUQpXHJcblxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLnNldChcInNvbG9cIiwgXCJuZXdcIilcclxuICBwYXJhbXMuc2V0KFwiZmlsdGVyc1wiLCBwYXJhbXMuZ2V0KFwiZmlsdGVyc1wiKS50cmltKCkpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNhdmVuYW1lXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBpZiBwYXJhbXMuZ2V0KFwibWlycm9yXCIpP1xyXG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3BsYXkkLywgXCJjYXN0XCIpXHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXHJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XHJcbiAgICBjYXN0U2Vzc2lvbiA9IGVcclxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCwgZm9yY2U6IHRydWUgfSlcclxuICAsIG9uRXJyb3JcclxuXHJcbmNhbGNMYWJlbCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJzb2xvTGFiZWxzKDEpOiBcIiwgc29sb0xhYmVsc1xyXG4gIGlmIG5vdCBzb2xvTGFiZWxzP1xyXG4gICAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcclxuICBjb21wYW55ID0gbnVsbFxyXG4gIGlmIHNvbG9MYWJlbHM/XHJcbiAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgaWYgbm90IGNvbXBhbnk/XHJcbiAgICBjb21wYW55ID0gcGt0Lm5pY2tuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGt0Lm5pY2tuYW1lLnNsaWNlKDEpXHJcbiAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gIHJldHVybiBjb21wYW55XHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcclxuICBvdmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBmb3IgdCBpbiBvdmVyVGltZXJzXHJcbiAgICBjbGVhclRpbWVvdXQodClcclxuICBvdmVyVGltZXJzID0gW11cclxuXHJcbiAgYXJ0aXN0ID0gcGt0LmFydGlzdFxyXG4gIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICB0aXRsZSA9IHBrdC50aXRsZVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgY29tcGFueSA9IGF3YWl0IGNhbGNMYWJlbChwa3QpXHJcbiAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5Tb2xvIE1vZGVcIlxyXG4gIGVsc2VcclxuICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICBmZWVsaW5ncyA9IFtdXHJcbiAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgIGZlZWxpbmdzLnB1c2ggb1xyXG4gICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcclxuICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgIGVsc2VcclxuICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcclxuICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgbGlzdC5zb3J0KClcclxuICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXHJcbiAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMzAwMFxyXG4gIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIHJldHVyblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH0gKCN7c3RhcnRTZWNvbmRzfSwgI3tlbmRTZWNvbmRzfSlcIlxyXG5cclxuICBsYXN0UGxheWVkSUQgPSBpZFxyXG4gIHBsYXllci5wbGF5KGlkLCBzdGFydFNlY29uZHMsIGVuZFNlY29uZHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgc2hvd0luZm8ocGt0KVxyXG5cclxuc29sb0luZm9Ccm9hZGNhc3QgPSAtPlxyXG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXHJcbiAgICBuZXh0VmlkZW8gPSBudWxsXHJcbiAgICBpZiBzb2xvSW5kZXggPCBzb2xvUXVldWUubGVuZ3RoIC0gMVxyXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4KzFdXHJcbiAgICBpbmZvID1cclxuICAgICAgY3VycmVudDogc29sb1ZpZGVvXHJcbiAgICAgIG5leHQ6IG5leHRWaWRlb1xyXG4gICAgICBpbmRleDogc29sb0luZGV4ICsgMVxyXG4gICAgICBjb3VudDogc29sb0NvdW50XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJCcm9hZGNhc3Q6IFwiLCBpbmZvXHJcbiAgICBwa3QgPSB7XHJcbiAgICAgIGlkOiBzb2xvSURcclxuICAgICAgY21kOiAnaW5mbydcclxuICAgICAgaW5mbzogaW5mb1xyXG4gICAgfVxyXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLCBwa3RcclxuICAgIHNvbG9Db21tYW5kKHBrdClcclxuXHJcbnNvbG9TYXZlTGFzdFdhdGNoZWQgPSAtPlxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXN0d2F0Y2hlZCcsIEpTT04uc3RyaW5naWZ5KHNvbG9MYXN0V2F0Y2hlZCkpXHJcblxyXG5zb2xvUmVzZXRMYXN0V2F0Y2hlZCA9IC0+XHJcbiAgc29sb0xhc3RXYXRjaGVkID0ge31cclxuICBzb2xvU2F2ZUxhc3RXYXRjaGVkKClcclxuXHJcbmFza0ZvcmdldCA9IC0+XHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnZXQgeW91ciB3YXRjaCBoaXN0b3J5P1wiKVxyXG4gICAgc29sb1Jlc2V0TGFzdFdhdGNoZWQoKVxyXG4gICAgc2hvd0xpc3QodHJ1ZSlcclxuXHJcbnNvbG9DYWxjQnVja2V0cyA9IChsaXN0KSAtPlxyXG4gIGJ1Y2tldHMgPSBbXVxyXG4gIGZvciB0YiBpbiBUSU1FX0JVQ0tFVFNcclxuICAgIGJ1Y2tldHMucHVzaCB7XHJcbiAgICAgIHNpbmNlOiB0Yi5zaW5jZVxyXG4gICAgICBkZXNjcmlwdGlvbjogdGIuZGVzY3JpcHRpb25cclxuICAgICAgbGlzdDogW11cclxuICAgIH1cclxuXHJcbiAgdCA9IG5vdygpXHJcbiAgZm9yIGUgaW4gbGlzdFxyXG4gICAgc2luY2UgPSBzb2xvTGFzdFdhdGNoZWRbZS5pZF1cclxuICAgIGlmIHNpbmNlP1xyXG4gICAgICBzaW5jZSA9IHQgLSBzaW5jZVxyXG4gICAgZWxzZVxyXG4gICAgICBzaW5jZSA9IE5FVkVSX1dBVENIRURfVElNRVxyXG4gICAgIyBjb25zb2xlLmxvZyBcImlkICN7ZS5pZH0gc2luY2UgI3tzaW5jZX1cIlxyXG4gICAgZm9yIGJ1Y2tldCBpbiBidWNrZXRzXHJcbiAgICAgIGlmIGJ1Y2tldC5zaW5jZSA9PSAwXHJcbiAgICAgICAgIyB0aGUgY2F0Y2hhbGxcclxuICAgICAgICBidWNrZXQubGlzdC5wdXNoIGVcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBzaW5jZSA8IGJ1Y2tldC5zaW5jZVxyXG4gICAgICAgIGJ1Y2tldC5saXN0LnB1c2ggZVxyXG4gICAgICAgIGJyZWFrXHJcbiAgcmV0dXJuIGJ1Y2tldHMucmV2ZXJzZSgpICMgb2xkZXN0IHRvIG5ld2VzdFxyXG5cclxuc2h1ZmZsZUFycmF5ID0gKGFycmF5KSAtPlxyXG4gIGZvciBpIGluIFthcnJheS5sZW5ndGggLSAxIC4uLiAwXSBieSAtMVxyXG4gICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpXHJcbiAgICB0ZW1wID0gYXJyYXlbaV1cclxuICAgIGFycmF5W2ldID0gYXJyYXlbal1cclxuICAgIGFycmF5W2pdID0gdGVtcFxyXG5cclxuc29sb1NodWZmbGUgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiU2h1ZmZsaW5nLi4uXCJcclxuXHJcbiAgc29sb1F1ZXVlID0gW11cclxuICBidWNrZXRzID0gc29sb0NhbGNCdWNrZXRzKHNvbG9VbnNodWZmbGVkKVxyXG4gIGZvciBidWNrZXQgaW4gYnVja2V0c1xyXG4gICAgc2h1ZmZsZUFycmF5KGJ1Y2tldC5saXN0KVxyXG4gICAgZm9yIGUgaW4gYnVja2V0Lmxpc3RcclxuICAgICAgc29sb1F1ZXVlLnB1c2ggZVxyXG4gIHNvbG9JbmRleCA9IDBcclxuXHJcbnNvbG9QbGF5ID0gKGRlbHRhID0gMSkgLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgcmV0dXJuXHJcbiAgaWYgc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBub3Qgc29sb1ZpZGVvPyBvciAoc29sb1F1ZXVlLmxlbmd0aCA9PSAwKSBvciAoKHNvbG9JbmRleCArIGRlbHRhKSA+IChzb2xvUXVldWUubGVuZ3RoIC0gMSkpXHJcbiAgICBzb2xvU2h1ZmZsZSgpXHJcbiAgZWxzZVxyXG4gICAgc29sb0luZGV4ICs9IGRlbHRhXHJcblxyXG4gIGlmIHNvbG9JbmRleCA8IDBcclxuICAgIHNvbG9JbmRleCA9IDBcclxuICBzb2xvVmlkZW8gPSBzb2xvUXVldWVbc29sb0luZGV4XVxyXG5cclxuICBjb25zb2xlLmxvZyBzb2xvVmlkZW9cclxuXHJcbiAgIyBkZWJ1Z1xyXG4gICMgc29sb1ZpZGVvLnN0YXJ0ID0gMTBcclxuICAjIHNvbG9WaWRlby5lbmQgPSA1MFxyXG4gICMgc29sb1ZpZGVvLmR1cmF0aW9uID0gNDBcclxuXHJcbiAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxyXG4gIHNvbG9JbmZvQnJvYWRjYXN0KClcclxuXHJcbiAgc29sb0xhc3RXYXRjaGVkW3NvbG9WaWRlby5pZF0gPSBub3coKVxyXG4gIHNvbG9TYXZlTGFzdFdhdGNoZWQoKVxyXG5cclxuXHJcbnNvbG9UaWNrID0gLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIFwic29sb1RpY2soKVwiXHJcblxyXG4gIGlmIHNvbG9JRD9cclxuICAgICMgU29sbyFcclxuICAgIGlmIHNvbG9FcnJvciBvciBzb2xvTWlycm9yXHJcbiAgICAgIHJldHVyblxyXG4gICAgaWYgbm90IHBsYXlpbmcgYW5kIHBsYXllcj9cclxuICAgICAgc29sb1BsYXkoKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgZWxzZVxyXG4gICAgIyBMaXZlIVxyXG5cclxuICAgIGlmIG5vdCBwbGF5aW5nXHJcbiAgICAgIHNlbmRSZWFkeSgpXHJcbiAgICAgIHJldHVyblxyXG4gICAgdXNlciA9IHFzKCd1c2VyJylcclxuICAgIHNmdyA9IGZhbHNlXHJcbiAgICBpZiBxcygnc2Z3JylcclxuICAgICAgc2Z3ID0gdHJ1ZVxyXG4gICAgc29ja2V0LmVtaXQgJ3BsYXlpbmcnLCB7IHVzZXI6IHVzZXIsIHNmdzogc2Z3IH1cclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbm1lZGlhQnV0dG9uc1JlYWR5ID0gZmFsc2VcclxubGlzdGVuRm9yTWVkaWFCdXR0b25zID0gLT5cclxuICBpZiBtZWRpYUJ1dHRvbnNSZWFkeVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCB3aW5kb3cubmF2aWdhdG9yPy5tZWRpYVNlc3Npb24/XHJcbiAgICBzZXRUaW1lb3V0KC0+XHJcbiAgICAgIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXHJcbiAgICAsIDEwMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbWVkaWFCdXR0b25zUmVhZHkgPSB0cnVlXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAncHJldmlvdXN0cmFjaycsIC0+XHJcbiAgICBzb2xvUHJldigpXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAnbmV4dHRyYWNrJywgLT5cclxuICAgIHNvbG9Ta2lwKClcclxuICBjb25zb2xlLmxvZyBcIk1lZGlhIEJ1dHRvbnMgcmVhZHkuXCJcclxuXHJcbnJlbmRlclBsYXlsaXN0TmFtZSA9IC0+XHJcbiAgaWYgbm90IGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWxpc3RuYW1lJykuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5bGlzdG5hbWUnKS5pbm5lckhUTUwgPSBjdXJyZW50UGxheWxpc3ROYW1lXHJcbiAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvOiAje2N1cnJlbnRQbGF5bGlzdE5hbWV9XCJcclxuXHJcbnNlbmRSZWFkeSA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJSZWFkeVwiXHJcbiAgdXNlciA9IHFzKCd1c2VyJylcclxuICBzZncgPSBmYWxzZVxyXG4gIGlmIHFzKCdzZncnKVxyXG4gICAgc2Z3ID0gdHJ1ZVxyXG4gIHNvY2tldC5lbWl0ICdyZWFkeScsIHsgdXNlcjogdXNlciwgc2Z3OiBzZncgfVxyXG5cclxuc3RhcnRIZXJlID0gLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvbG92aWRlb2NvbnRhaW5lcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCdjb3JuZXInKVxyXG4gICAgaWYgaXNUZXNsYVxyXG4gICAgICBvblRhcFNob3coKVxyXG4gICAgZWxzZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCdmYWRleScpXHJcblxyXG4gICAgcGxheWVyID0gbmV3IFBsYXllcignI210di1wbGF5ZXInKVxyXG4gICAgcGxheWVyLmVuZGVkID0gKGV2ZW50KSAtPlxyXG4gICAgICBwbGF5aW5nID0gZmFsc2VcclxuICAgIHBsYXllci5vblRpdGxlID0gKHRpdGxlKSAtPlxyXG4gICAgICBpZiBzb2xvVmlkZW8/IGFuZCBzb2xvVmlkZW8udW5saXN0ZWRcclxuICAgICAgICBjb25zb2xlLmxvZyBcIlVwZGF0aW5nIFRpdGxlOiAje3RpdGxlfVwiXHJcbiAgICAgICAgc29sb1ZpZGVvLnRpdGxlID0gdGl0bGVcclxuICAgICAgICBzaG93SW5mbyhzb2xvVmlkZW8pXHJcblxyXG4gICAgcGxheWVyLnBsYXkoJ0FCN3lrT2ZBZ0lBJykgIyBNVFYgTG9hZGluZy4uLlxyXG5cclxuICBpZiBzb2xvSUQ/XHJcbiAgICAjIFNvbG8gTW9kZSFcclxuXHJcbiAgICBzaG93V2F0Y2hMaW5rKClcclxuXHJcbiAgICBmaWx0ZXJTdHJpbmcgPSBxcygnZmlsdGVycycpXHJcbiAgICBzb2xvVW5zaHVmZmxlZCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZylcclxuICAgIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cclxuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHNvbG8gZGF0YWJhc2UhXCIpXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiTm8gbWF0Y2hpbmcgc29uZ3MgaW4gdGhlIGZpbHRlciFcIilcclxuICAgICAgcmV0dXJuXHJcbiAgICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcclxuXHJcbiAgICBzb2xvUXVldWUgPSBbXVxyXG4gICAgc29sb1BsYXkoKVxyXG4gICAgaWYgc29sb01pcnJvciBhbmQgc29sb0lEXHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICBlbHNlXHJcbiAgICAjIExpdmUgTW9kZSFcclxuICAgIHNob3dXYXRjaExpdmUoKVxyXG4gICAgc2VuZFJlYWR5KClcclxuXHJcbiAgaWYgc29sb1RpY2tUaW1lb3V0P1xyXG4gICAgY2xlYXJJbnRlcnZhbChzb2xvVGlja1RpbWVvdXQpXHJcbiAgc29sb1RpY2tUaW1lb3V0ID0gc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpY2ttZW51XCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXHJcblxyXG4gIGlmIGlzVGVzbGFcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YXBzaG93Jykuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxyXG5cclxuc3ByaW5rbGVGb3JtUVMgPSAocGFyYW1zKSAtPlxyXG4gIHVzZXJRUyA9IHFzKCd1c2VyJylcclxuICBpZiB1c2VyUVM/XHJcbiAgICBwYXJhbXMuc2V0KCd1c2VyJywgdXNlclFTKVxyXG4gIHNmd1FTID0gcXMoJ3NmdycpXHJcbiAgaWYgc2Z3UVM/XHJcbiAgICBwYXJhbXMuc2V0KCdzZncnLCBzZndRUylcclxuXHJcbmNhbGNQZXJtYWxpbmsgPSAtPlxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLmRlbGV0ZShcImxvYWRuYW1lXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNhdmVuYW1lXCIpXHJcbiAgaWYgbm90IHBhcmFtcy5nZXQoJ3NvbG8nKVxyXG4gICAgcGFyYW1zLmRlbGV0ZSgnc29sbycpXHJcbiAgaWYgbm90IHBhcmFtcy5nZXQoJ2ZpbHRlcnMnKVxyXG4gICAgcGFyYW1zLmRlbGV0ZSgnZmlsdGVycycpXHJcbiAgaWYgY3VycmVudFBsYXlsaXN0TmFtZT9cclxuICAgIHBhcmFtcy5zZXQoXCJuYW1lXCIsIGN1cnJlbnRQbGF5bGlzdE5hbWUpXHJcbiAgc3ByaW5rbGVGb3JtUVMocGFyYW1zKVxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgaWYgcXVlcnlzdHJpbmcubGVuZ3RoID4gMFxyXG4gICAgcXVlcnlzdHJpbmcgPSBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuZ2VuZXJhdGVQZXJtYWxpbmsgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiZ2VuZXJhdGVQZXJtYWxpbmsoKVwiXHJcbiAgd2luZG93LmxvY2F0aW9uID0gY2FsY1Blcm1hbGluaygpXHJcblxyXG5mb3JtQ2hhbmdlZCA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJGb3JtIGNoYW5nZWQhXCJcclxuICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnaGVyZScsICcnLCBjYWxjUGVybWFsaW5rKCkpXHJcbiAgcmVuZGVyUGxheWxpc3ROYW1lKClcclxuXHJcbnNvbG9Ta2lwID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3NraXAnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KClcclxuXHJcbnNvbG9QcmV2ID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3ByZXYnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KC0xKVxyXG5cclxuc29sb1Jlc3RhcnQgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAncmVzdGFydCdcclxuICB9XHJcbiAgc29sb1BsYXkoMClcclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwYXVzZSdcclxuICB9XHJcbiAgcGF1c2VJbnRlcm5hbCgpXHJcblxyXG5yZW5kZXJJbmZvID0gKGluZm8sIGlzTGl2ZSA9IGZhbHNlKSAtPlxyXG4gIGlmIG5vdCBpbmZvPyBvciBub3QgaW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGNvbnNvbGUubG9nIGluZm9cclxuXHJcbiAgaWYgaXNMaXZlXHJcbiAgICB0YWdzU3RyaW5nID0gbnVsbFxyXG4gICAgY29tcGFueSA9IGF3YWl0IGluZm8uY3VycmVudC5jb21wYW55XHJcbiAgZWxzZVxyXG4gICAgdGFnc1N0cmluZyA9IE9iamVjdC5rZXlzKGluZm8uY3VycmVudC50YWdzKS5zb3J0KCkuam9pbignLCAnKVxyXG4gICAgY29tcGFueSA9IGF3YWl0IGNhbGNMYWJlbChpbmZvLmN1cnJlbnQpXHJcblxyXG4gIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhpbmZvLmN1cnJlbnQuaWQpXHJcbiAgaWYgbm90IGlkSW5mbz9cclxuICAgIGlkSW5mbyA9XHJcbiAgICAgIHByb3ZpZGVyOiAneW91dHViZSdcclxuICAgICAgdXJsOiAnaHR0cHM6Ly9leGFtcGxlLmNvbSdcclxuXHJcbiAgaHRtbCA9IFwiXCJcclxuICBpZiBub3QgaXNMaXZlXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+VHJhY2sgI3tpbmZvLmluZGV4fSAvICN7aW5mby5jb3VudH08L2Rpdj5cIlxyXG5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aHVtYlxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIiN7aWRJbmZvLnVybH1cXFwiPjxpbWcgd2lkdGg9MzIwIGhlaWdodD0xODAgc3JjPVxcXCIje2luZm8uY3VycmVudC50aHVtYn1cXFwiPjwvYT48L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY3VycmVudCBpbmZvYXJ0aXN0XFxcIj4je2luZm8uY3VycmVudC5hcnRpc3R9PC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RpdGxlXFxcIj5cXFwiPGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGNsYXNzPVxcXCJpbmZvdGl0bGVcXFwiIGhyZWY9XFxcIiN7aWRJbmZvLnVybH1cXFwiPiN7aW5mby5jdXJyZW50LnRpdGxlfTwvYT5cXFwiPC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2xhYmVsXFxcIj4je2NvbXBhbnl9PC9kaXY+XCJcclxuICBpZiBub3QgaXNMaXZlXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RhZ3NcXFwiPiZuYnNwOyN7dGFnc1N0cmluZ30mbmJzcDs8L2Rpdj5cIlxyXG4gICAgaWYgaW5mby5uZXh0P1xyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7aW5mby5uZXh0LmFydGlzdH08L3NwYW4+XCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxyXG4gICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2luZm8ubmV4dC50aXRsZX1cXFwiPC9zcGFuPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2hlYWRpbmcgbmV4dHZpZGVvXFxcIj5OZXh0Ojwvc3Bhbj4gXCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvcmVzaHVmZmxlIG5leHR2aWRlb1xcXCI+KC4uLlJlc2h1ZmZsZS4uLik8L3NwYW4+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mbycpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbmNsaXBib2FyZEVkaXQgPSAtPlxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG8gY29waWVkXFxcIiBvbmNsaWNrPVxcXCJyZXR1cm4gZmFsc2VcXFwiPkNvcGllZCE8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcGJvYXJkJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHNldFRpbWVvdXQgLT5cclxuICAgIHJlbmRlckNsaXBib2FyZCgpXHJcbiAgLCAyMDAwXHJcblxyXG5yZW5kZXJDbGlwYm9hcmQgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0b1xcXCIgZGF0YS1jbGlwYm9hcmQtdGV4dD1cXFwiI210diBlZGl0ICN7c29sb0luZm8uY3VycmVudC5pZH0gXFxcIiBvbmNsaWNrPVxcXCJjbGlwYm9hcmRFZGl0KCk7IHJldHVybiBmYWxzZVxcXCI+RWRpdDwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgbmV3IENsaXBib2FyZCgnLmNidXR0bycpXHJcblxyXG5vbkFkZCA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPy5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZpZCA9IHNvbG9JbmZvLmN1cnJlbnRcclxuICBmaWx0ZXJTdHJpbmcgPSBTdHJpbmcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMnKS52YWx1ZSkudHJpbSgpXHJcbiAgaWYgZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDBcclxuICAgIGZpbHRlclN0cmluZyArPSBcIlxcblwiXHJcbiAgZmlsdGVyU3RyaW5nICs9IFwiaWQgI3t2aWQuaWR9ICMgI3t2aWQuYXJ0aXN0fSAtICN7dmlkLnRpdGxlfVxcblwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gZmlsdGVyU3RyaW5nXHJcbiAgZm9ybUNoYW5nZWQoKVxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5BZGRlZCE8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHNldFRpbWVvdXQgLT5cclxuICAgIHJlbmRlckFkZCgpXHJcbiAgLCAyMDAwXHJcblxyXG5yZW5kZXJBZGQgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/IG9yIG5vdCBhZGRFbmFibGVkXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0b1xcXCIgb25jbGljaz1cXFwib25BZGQoKTsgcmV0dXJuIGZhbHNlXFxcIj5BZGQ8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuY2xpcGJvYXJkTWlycm9yID0gLT5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwibWJ1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5Db3BpZWQhPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIHNldFRpbWVvdXQgLT5cclxuICAgIHJlbmRlckNsaXBib2FyZE1pcnJvcigpXHJcbiAgLCAyMDAwXHJcblxyXG5yZW5kZXJDbGlwYm9hcmRNaXJyb3IgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcIm1idXR0b1xcXCJvbmNsaWNrPVxcXCJjbGlwYm9hcmRNaXJyb3IoKTsgcmV0dXJuIGZhbHNlXFxcIj5NaXJyb3I8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2JtaXJyb3InKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgbmV3IENsaXBib2FyZCAnLm1idXR0bycsIHtcclxuICAgIHRleHQ6IC0+XHJcbiAgICAgIHJldHVybiBjYWxjU2hhcmVVUkwodHJ1ZSlcclxuICB9XHJcblxyXG5zaGFyZUNsaXBib2FyZCA9IChtaXJyb3IpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJlY29waWVkXFxcIj5Db3BpZWQgdG8gY2xpcGJvYXJkOjwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmV1cmxcXFwiPiN7Y2FsY1NoYXJlVVJMKG1pcnJvcil9PC9kaXY+XHJcbiAgXCJcIlwiXHJcblxyXG5zaGFyZVBlcm1hID0gKG1pcnJvcikgLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmVjb3BpZWRcXFwiPkNvcGllZCB0byBjbGlwYm9hcmQ6PC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZXVybFxcXCI+I3tjYWxjUGVybWEoKX08L2Rpdj5cclxuICBcIlwiXCJcclxuXHJcbnNob3dMaXN0ID0gKHNob3dCdWNrZXRzID0gZmFsc2UpIC0+XHJcbiAgdCA9IG5vdygpXHJcbiAgaWYgbGFzdFNob3dMaXN0VGltZT8gYW5kICgodCAtIGxhc3RTaG93TGlzdFRpbWUpIDwgMylcclxuICAgIHNob3dCdWNrZXRzID0gdHJ1ZVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVycycpLnZhbHVlXHJcbiAgbGlzdCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZywgdHJ1ZSlcclxuICBpZiBub3QgbGlzdD9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJFcnJvci4gU29ycnkuXCJcclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJsaXN0Y29udGFpbmVyXFxcIj5cIlxyXG5cclxuICBpZiBzaG93QnVja2V0cyAmJiAobGlzdC5sZW5ndGggPiAxKVxyXG4gICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jb3VudHNcXFwiPiN7bGlzdC5sZW5ndGh9IHZpZGVvczogPGEgY2xhc3M9XFxcImZvcmdldGxpbmtcXFwiIG9uY2xpY2s9XFxcImFza0ZvcmdldCgpOyByZXR1cm4gZmFsc2U7XFxcIj5bRm9yZ2V0XTwvYT48L2Rpdj5cIlxyXG4gICAgYnVja2V0cyA9IHNvbG9DYWxjQnVja2V0cyhsaXN0KVxyXG4gICAgZm9yIGJ1Y2tldCBpbiBidWNrZXRzXHJcbiAgICAgIGlmIGJ1Y2tldC5saXN0Lmxlbmd0aCA8IDFcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2J1Y2tldFxcXCI+QnVja2V0IFsje2J1Y2tldC5kZXNjcmlwdGlvbn1dICgje2J1Y2tldC5saXN0Lmxlbmd0aH0gdmlkZW9zKTo8L2Rpdj5cIlxyXG4gICAgICBmb3IgZSBpbiBidWNrZXQubGlzdFxyXG4gICAgICAgIGh0bWwgKz0gXCI8ZGl2PlwiXHJcbiAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvYXJ0aXN0IG5leHR2aWRlb1xcXCI+I3tlLmFydGlzdH08L3NwYW4+XCJcclxuICAgICAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tlLnRpdGxlfVxcXCI8L3NwYW4+XCJcclxuICAgICAgICBodG1sICs9IFwiPC9kaXY+XFxuXCJcclxuICBlbHNlXHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOjwvZGl2PlwiXHJcbiAgICBmb3IgZSBpbiBsaXN0XHJcbiAgICAgIGh0bWwgKz0gXCI8ZGl2PlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcclxuICAgICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tlLnRpdGxlfVxcXCI8L3NwYW4+XCJcclxuICAgICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXHJcblxyXG4gIGh0bWwgKz0gXCI8L2Rpdj5cIlxyXG5cclxuICBsYXN0U2hvd0xpc3RUaW1lID0gdFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuc2hvd0V4cG9ydCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlBsZWFzZSB3YWl0Li4uXCJcclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMnKS52YWx1ZVxyXG4gIGxpc3QgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcsIHRydWUpXHJcbiAgaWYgbm90IGxpc3Q/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiRXJyb3IuIFNvcnJ5LlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZXhwb3J0ZWRQbGF5bGlzdHMgPSBcIlwiXHJcbiAgaWRzID0gW11cclxuICBwbGF5bGlzdEluZGV4ID0gMVxyXG4gIGZvciBlIGluIGxpc3RcclxuICAgIGlmIGlkcy5sZW5ndGggPj0gNTBcclxuICAgICAgZXhwb3J0ZWRQbGF5bGlzdHMgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoX3ZpZGVvcz92aWRlb19pZHM9I3tpZHMuam9pbignLCcpfVwiPkV4cG9ydGVkIFBsYXlsaXN0ICN7cGxheWxpc3RJbmRleH0gKCN7aWRzLmxlbmd0aH0pPC9hPjxicj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIHBsYXlsaXN0SW5kZXggKz0gMVxyXG4gICAgICBpZHMgPSBbXVxyXG4gICAgaWRzLnB1c2ggZS5pZFxyXG4gIGlmIGlkcy5sZW5ndGggPiAwXHJcbiAgICBleHBvcnRlZFBsYXlsaXN0cyArPSBcIlwiXCJcclxuICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoX3ZpZGVvcz92aWRlb19pZHM9I3tpZHMuam9pbignLCcpfVwiPkV4cG9ydGVkIFBsYXlsaXN0ICN7cGxheWxpc3RJbmRleH0gKCN7aWRzLmxlbmd0aH0pPC9hPjxicj5cclxuICAgIFwiXCJcIlxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgPGRpdiBjbGFzcz1cXFwibGlzdGNvbnRhaW5lclxcXCI+XHJcbiAgICAgICN7ZXhwb3J0ZWRQbGF5bGlzdHN9XHJcbiAgICA8L2Rpdj5cclxuICBcIlwiXCJcclxuXHJcbmNsZWFyT3BpbmlvbiA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XHJcbiAgaHRtbCA9IFwiXCJcclxuICBmb3IgbyBpbiBvcGluaW9uT3JkZXIgYnkgLTFcclxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxyXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcclxuICAgIGlmIG8gPT0gcGt0Lm9waW5pb25cclxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XCIje2NsYXNzZXN9XCIgb25jbGljaz1cInNldE9waW5pb24oJyN7b30nKTsgcmV0dXJuIGZhbHNlO1wiPiN7Y2Fwb308L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5zZXRPcGluaW9uID0gKG9waW5pb24pIC0+XHJcbiAgaWYgbm90IGRpc2NvcmRUb2tlbj8gb3Igbm90IGxhc3RQbGF5ZWRJRD9cclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IGxhc3RQbGF5ZWRJRCwgc2V0OiBvcGluaW9uIH1cclxuXHJcbnBhdXNlSW50ZXJuYWwgPSAtPlxyXG4gIGlmIHBsYXllcj9cclxuICAgIHBsYXllci50b2dnbGVQYXVzZSgpXHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxyXG4gICAgcmV0dXJuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxyXG4gIHN3aXRjaCBwa3QuY21kXHJcbiAgICB3aGVuICdwcmV2J1xyXG4gICAgICBzb2xvUGxheSgtMSlcclxuICAgIHdoZW4gJ3NraXAnXHJcbiAgICAgIHNvbG9QbGF5KDEpXHJcbiAgICB3aGVuICdyZXN0YXJ0J1xyXG4gICAgICBzb2xvUGxheSgwKVxyXG4gICAgd2hlbiAncGF1c2UnXHJcbiAgICAgIHBhdXNlSW50ZXJuYWwoKVxyXG4gICAgd2hlbiAnaW5mbydcclxuICAgICAgaWYgcGt0LmluZm8/XHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJORVcgSU5GTyE6IFwiLCBwa3QuaW5mb1xyXG4gICAgICAgIHNvbG9JbmZvID0gcGt0LmluZm9cclxuICAgICAgICBhd2FpdCByZW5kZXJJbmZvKHNvbG9JbmZvLCBmYWxzZSlcclxuICAgICAgICByZW5kZXJBZGQoKVxyXG4gICAgICAgIHJlbmRlckNsaXBib2FyZCgpXHJcbiAgICAgICAgcmVuZGVyQ2xpcGJvYXJkTWlycm9yKClcclxuICAgICAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgICAgICBzb2xvVmlkZW8gPSBwa3QuaW5mby5jdXJyZW50XHJcbiAgICAgICAgICBpZiBzb2xvVmlkZW8/XHJcbiAgICAgICAgICAgIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJubyBwbGF5ZXIgeWV0XCJcclxuICAgICAgICAgICAgZXh0cmFPZmZzZXQgPSAwXHJcbiAgICAgICAgICAgIGlmIHBrdC5pbmZvLnR1PyBhbmQgcGt0LmluZm8udGI/XHJcbiAgICAgICAgICAgICAgZXh0cmFPZmZzZXQgPSAxICsgcGt0LmluZm8udGIgLSBwa3QuaW5mby50dVxyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRXh0cmEgb2Zmc2V0OiAje2V4dHJhT2Zmc2V0fVwiXHJcbiAgICAgICAgICAgIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCArIGV4dHJhT2Zmc2V0LCBzb2xvVmlkZW8uZW5kKVxyXG4gICAgICAgIGNsZWFyT3BpbmlvbigpXHJcbiAgICAgICAgaWYgZGlzY29yZFRva2VuPyBhbmQgc29sb0luZm8uY3VycmVudD8gYW5kIHNvbG9JbmZvLmN1cnJlbnQuaWQ/XHJcbiAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHNvbG9JbmZvLmN1cnJlbnQuaWQgfVxyXG5cclxudXBkYXRlU29sb0lEID0gKG5ld1NvbG9JRCkgLT5cclxuICBzb2xvSUQgPSBuZXdTb2xvSURcclxuICBpZiBub3Qgc29sb0lEP1xyXG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIkVSUk9SOiBubyBzb2xvIHF1ZXJ5IHBhcmFtZXRlclwiXHJcbiAgICByZXR1cm5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNvbG9pZFwiKS52YWx1ZSA9IHNvbG9JRFxyXG4gIGlmIHNvY2tldD9cclxuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuXHJcbmxvYWRQbGF5bGlzdCA9IC0+XHJcbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcclxuICBjdXJyZW50RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZVxyXG4gIGlmIG5vdCBzZWxlY3RlZE5hbWU/XHJcbiAgICByZXR1cm5cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZE5hbWUudHJpbSgpXHJcbiAgaWYgc2VsZWN0ZWROYW1lLmxlbmd0aCA8IDFcclxuICAgIHJldHVyblxyXG4gIGlmIGN1cnJlbnRGaWx0ZXJzLmxlbmd0aCA+IDBcclxuICAgIGlmIG5vdCBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxvYWQgJyN7c2VsZWN0ZWROYW1lfSc/XCIpXHJcbiAgICAgIHJldHVyblxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcImxvYWRcIlxyXG4gICAgbG9hZG5hbWU6IHNlbGVjdGVkTmFtZVxyXG4gIH1cclxuICBjdXJyZW50UGxheWxpc3ROYW1lID0gc2VsZWN0ZWROYW1lXHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxuZGVsZXRlUGxheWxpc3QgPSAtPlxyXG4gIGNvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkbmFtZVwiKVxyXG4gIHNlbGVjdGVkID0gY29tYm8ub3B0aW9uc1tjb21iby5zZWxlY3RlZEluZGV4XVxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkLnZhbHVlXHJcbiAgaWYgbm90IHNlbGVjdGVkTmFtZT9cclxuICAgIHJldHVyblxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkTmFtZS50cmltKClcclxuICBpZiBzZWxlY3RlZE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9hZCAnI3tzZWxlY3RlZE5hbWV9Jz9cIilcclxuICAgIHJldHVyblxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcImRlbFwiXHJcbiAgICBkZWxuYW1lOiBzZWxlY3RlZE5hbWVcclxuICB9XHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxuc2F2ZVBsYXlsaXN0ID0gLT5cclxuICBvdXRwdXROYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlbmFtZVwiKS52YWx1ZVxyXG4gIG91dHB1dE5hbWUgPSBvdXRwdXROYW1lLnRyaW0oKVxyXG4gIG91dHB1dEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWVcclxuICBpZiBvdXRwdXROYW1lLmxlbmd0aCA8IDFcclxuICAgIHJldHVyblxyXG4gIGlmIG5vdCBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNhdmUgJyN7b3V0cHV0TmFtZX0nP1wiKVxyXG4gICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwic2F2ZVwiXHJcbiAgICBzYXZlbmFtZTogb3V0cHV0TmFtZVxyXG4gICAgZmlsdGVyczogb3V0cHV0RmlsdGVyc1xyXG4gIH1cclxuICBjdXJyZW50UGxheWxpc3ROYW1lID0gb3V0cHV0TmFtZVxyXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcclxuXHJcbnJlcXVlc3RVc2VyUGxheWxpc3RzID0gLT5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJsaXN0XCJcclxuICB9XHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxucmVjZWl2ZVVzZXJQbGF5bGlzdCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJyZWNlaXZlVXNlclBsYXlsaXN0XCIsIHBrdFxyXG4gIGlmIHBrdC5saXN0P1xyXG4gICAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgICBjb21iby5vcHRpb25zLmxlbmd0aCA9IDBcclxuICAgIHBrdC5saXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIGEudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIudG9Mb3dlckNhc2UoKSlcclxuICAgIGZvciBuYW1lIGluIHBrdC5saXN0XHJcbiAgICAgIGlzU2VsZWN0ZWQgPSAobmFtZSA9PSBwa3Quc2VsZWN0ZWQpXHJcbiAgICAgIGNvbWJvLm9wdGlvbnNbY29tYm8ub3B0aW9ucy5sZW5ndGhdID0gbmV3IE9wdGlvbihuYW1lLCBuYW1lLCBmYWxzZSwgaXNTZWxlY3RlZClcclxuICAgIGlmIHBrdC5saXN0Lmxlbmd0aCA9PSAwXHJcbiAgICAgIGNvbWJvLm9wdGlvbnNbY29tYm8ub3B0aW9ucy5sZW5ndGhdID0gbmV3IE9wdGlvbihcIk5vbmVcIiwgXCJcIilcclxuICBpZiBwa3QubG9hZG5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlID0gcGt0LmxvYWRuYW1lXHJcbiAgaWYgcGt0LmZpbHRlcnM/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBwa3QuZmlsdGVyc1xyXG4gIGZvcm1DaGFuZ2VkKClcclxuXHJcbmxvZ291dCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIkxvZ2dpbmcgb3V0Li4uXCJcclxuICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKVxyXG4gIGRpc2NvcmRUb2tlbiA9IG51bGxcclxuICBzZW5kSWRlbnRpdHkoKVxyXG5cclxuc2VuZElkZW50aXR5ID0gLT5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIGlkZW50aXR5UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICB9XHJcbiAgY29uc29sZS5sb2cgXCJTZW5kaW5nIGlkZW50aWZ5OiBcIiwgaWRlbnRpdHlQYXlsb2FkXHJcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXHJcblxyXG5yZWNlaXZlSWRlbnRpdHkgPSAocGt0KSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxyXG4gIGlmIHBrdC5kaXNhYmxlZFxyXG4gICAgY29uc29sZS5sb2cgXCJEaXNjb3JkIGF1dGggZGlzYWJsZWQuXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxyXG4gICAgZGlzY29yZFRhZyA9IHBrdC50YWdcclxuICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiXCJcclxuICAgIGlmIHBrdC5uaWNrbmFtZT9cclxuICAgICAgZGlzY29yZE5pY2tuYW1lID0gcGt0Lm5pY2tuYW1lXHJcbiAgICAgIGRpc2NvcmROaWNrbmFtZVN0cmluZyA9IFwiICgje2Rpc2NvcmROaWNrbmFtZX0pXCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgI3tkaXNjb3JkVGFnfSN7ZGlzY29yZE5pY2tuYW1lU3RyaW5nfSAtIFs8YSBvbmNsaWNrPVwibG9nb3V0KClcIj5Mb2dvdXQ8L2E+XVxyXG4gICAgXCJcIlwiXHJcbiAgICByZXF1ZXN0VXNlclBsYXlsaXN0cygpXHJcbiAgZWxzZVxyXG4gICAgZGlzY29yZFRhZyA9IG51bGxcclxuICAgIGRpc2NvcmROaWNrbmFtZSA9IG51bGxcclxuICAgIGRpc2NvcmRUb2tlbiA9IG51bGxcclxuXHJcbiAgICByZWRpcmVjdFVSTCA9IFN0cmluZyh3aW5kb3cubG9jYXRpb24pLnJlcGxhY2UoLyMuKiQvLCBcIlwiKSArIFwib2F1dGhcIlxyXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXHJcbiAgICBodG1sID0gXCJcIlwiXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJsb2dpbmhpbnRcIj4oTG9naW4gb24gPGEgaHJlZj1cIi9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5EYXNoYm9hcmQ8L2E+KTwvZGl2PlxyXG4gICAgXCJcIlwiXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRhcmVhXCIpPy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZWFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxyXG4gIGlmIGxhc3RDbGlja2VkP1xyXG4gICAgbGFzdENsaWNrZWQoKVxyXG5cclxuZ29MaXZlID0gLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzb2xvXCIpXHJcbiAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcclxuICBwYXJhbXMuZGVsZXRlKFwic2F2ZW5hbWVcIilcclxuICBwYXJhbXMuZGVsZXRlKFwibG9hZG5hbWVcIilcclxuICBzcHJpbmtsZUZvcm1RUyhwYXJhbXMpXHJcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCI/XCIgKyBxdWVyeXN0cmluZ1xyXG4gIGNvbnNvbGUubG9nIFwiZ29MaXZlOiAje210dlVSTH1cIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IG10dlVSTFxyXG5cclxuZ29Tb2xvID0gLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHBhcmFtcy5zZXQoXCJzb2xvXCIsIFwibmV3XCIpXHJcbiAgc3ByaW5rbGVGb3JtUVMocGFyYW1zKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcImdvU29sbzogI3ttdHZVUkx9XCJcclxuICB3aW5kb3cubG9jYXRpb24gPSBtdHZVUkxcclxuXHJcbndpbmRvdy5vbmxvYWQgPSAtPlxyXG4gIHdpbmRvdy5hc2tGb3JnZXQgPSBhc2tGb3JnZXRcclxuICB3aW5kb3cuY2xpcGJvYXJkRWRpdCA9IGNsaXBib2FyZEVkaXRcclxuICB3aW5kb3cuY2xpcGJvYXJkTWlycm9yID0gY2xpcGJvYXJkTWlycm9yXHJcbiAgd2luZG93LmRlbGV0ZVBsYXlsaXN0ID0gZGVsZXRlUGxheWxpc3RcclxuICB3aW5kb3cuZm9ybUNoYW5nZWQgPSBmb3JtQ2hhbmdlZFxyXG4gIHdpbmRvdy5nb0xpdmUgPSBnb0xpdmVcclxuICB3aW5kb3cuZ29Tb2xvID0gZ29Tb2xvXHJcbiAgd2luZG93LmxvYWRQbGF5bGlzdCA9IGxvYWRQbGF5bGlzdFxyXG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcclxuICB3aW5kb3cub25BZGQgPSBvbkFkZFxyXG4gIHdpbmRvdy5vblRhcFNob3cgPSBvblRhcFNob3dcclxuICB3aW5kb3cuc2F2ZVBsYXlsaXN0ID0gc2F2ZVBsYXlsaXN0XHJcbiAgd2luZG93LnNldE9waW5pb24gPSBzZXRPcGluaW9uXHJcbiAgd2luZG93LnNoYXJlQ2xpcGJvYXJkID0gc2hhcmVDbGlwYm9hcmRcclxuICB3aW5kb3cuc2hhcmVQZXJtYSA9IHNoYXJlUGVybWFcclxuICB3aW5kb3cuc2hvd0V4cG9ydCA9IHNob3dFeHBvcnRcclxuICB3aW5kb3cuc2hvd0xpc3QgPSBzaG93TGlzdFxyXG4gIHdpbmRvdy5zaG93V2F0Y2hGb3JtID0gc2hvd1dhdGNoRm9ybVxyXG4gIHdpbmRvdy5zaG93V2F0Y2hMaW5rID0gc2hvd1dhdGNoTGlua1xyXG4gIHdpbmRvdy5zaG93V2F0Y2hMaXZlID0gc2hvd1dhdGNoTGl2ZVxyXG4gIHdpbmRvdy5zb2xvUGF1c2UgPSBzb2xvUGF1c2VcclxuICB3aW5kb3cuc29sb1ByZXYgPSBzb2xvUHJldlxyXG4gIHdpbmRvdy5zb2xvUmVzdGFydCA9IHNvbG9SZXN0YXJ0XHJcbiAgd2luZG93LnNvbG9Ta2lwID0gc29sb1NraXBcclxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XHJcbiAgd2luZG93LnN0YXJ0SGVyZSA9IHN0YXJ0SGVyZVxyXG5cclxuICBhdXRvc3RhcnQgPSBxcygnc3RhcnQnKT9cclxuXHJcbiAgIyBhZGRFbmFibGVkID0gcXMoJ2FkZCcpP1xyXG4gICMgY29uc29sZS5sb2cgXCJBZGQgRW5hYmxlZDogI3thZGRFbmFibGVkfVwiXHJcblxyXG4gIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnRcclxuICBpZiB1c2VyQWdlbnQ/IGFuZCBTdHJpbmcodXNlckFnZW50KS5tYXRjaCgvVGVzbGFcXC8yMC8pXHJcbiAgICBpc1Rlc2xhID0gdHJ1ZVxyXG5cclxuICBpZiBpc1Rlc2xhXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCd0ZXNsYScpXHJcblxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBxcygnbmFtZScpXHJcbiAgaWYgY3VycmVudFBsYXlsaXN0TmFtZT9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZW5hbWVcIikudmFsdWUgPSBjdXJyZW50UGxheWxpc3ROYW1lXHJcblxyXG4gIGV4cG9ydEVuYWJsZWQgPSBxcygnZXhwb3J0Jyk/XHJcbiAgY29uc29sZS5sb2cgXCJFeHBvcnQgRW5hYmxlZDogI3tleHBvcnRFbmFibGVkfVwiXHJcbiAgaWYgZXhwb3J0RW5hYmxlZFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cG9ydCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgICA8aW5wdXQgY2xhc3M9XCJmc3ViXCIgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiRXhwb3J0XCIgb25jbGljaz1cImV2ZW50LnByZXZlbnREZWZhdWx0KCk7IHNob3dFeHBvcnQoKTtcIiB0aXRsZT1cIkV4cG9ydCBsaXN0cyBpbnRvIGNsaWNrYWJsZSBwbGF5bGlzdHNcIj5cclxuICAgIFwiXCJcIlxyXG5cclxuICBzb2xvSURRUyA9IHFzKCdzb2xvJylcclxuICBpZiBzb2xvSURRUz9cclxuICAgICMgaW5pdGlhbGl6ZSBzb2xvIG1vZGVcclxuICAgIHVwZGF0ZVNvbG9JRChzb2xvSURRUylcclxuXHJcbiAgICBpZiBsYXVuY2hPcGVuXHJcbiAgICAgIHNob3dXYXRjaEZvcm0oKVxyXG4gICAgZWxzZVxyXG4gICAgICBzaG93V2F0Y2hMaW5rKClcclxuICBlbHNlXHJcbiAgICAjIGxpdmUgbW9kZVxyXG4gICAgc2hvd1dhdGNoTGl2ZSgpXHJcblxyXG4gIHFzRmlsdGVycyA9IHFzKCdmaWx0ZXJzJylcclxuICBpZiBxc0ZpbHRlcnM/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBxc0ZpbHRlcnNcclxuXHJcbiAgc29sb01pcnJvciA9IHFzKCdtaXJyb3InKT9cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pcnJvclwiKS5jaGVja2VkID0gc29sb01pcnJvclxyXG4gIGlmIHNvbG9NaXJyb3JcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzZWN0aW9uJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pcnJvcm5vdGUnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XHJcbiAgICBpZiBzb2xvSUQ/XHJcbiAgICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuICAgIHNlbmRJZGVudGl0eSgpXHJcblxyXG4gIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XHJcbiAgICBzb2xvQ29tbWFuZChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxyXG4gICAgcmVjZWl2ZUlkZW50aXR5KHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICdvcGluaW9uJywgKHBrdCkgLT5cclxuICAgIHVwZGF0ZU9waW5pb24ocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ3VzZXJwbGF5bGlzdCcsIChwa3QpIC0+XHJcbiAgICByZWNlaXZlVXNlclBsYXlsaXN0KHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICdwbGF5JywgKHBrdCkgLT5cclxuICAgIGlmIHBsYXllcj8gYW5kIG5vdCBzb2xvSUQ/XHJcbiAgICAgIHBsYXkocGt0LCBwa3QuaWQsIHBrdC5zdGFydCwgcGt0LmVuZClcclxuICAgICAgY2xlYXJPcGluaW9uKClcclxuICAgICAgaWYgZGlzY29yZFRva2VuPyBhbmQgcGt0LmlkP1xyXG4gICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogcGt0LmlkIH1cclxuICAgICAgcmVuZGVySW5mbyh7XHJcbiAgICAgICAgY3VycmVudDogcGt0XHJcbiAgICAgIH0sIHRydWUpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbiAgaWYgYXV0b3N0YXJ0XHJcbiAgICBjb25zb2xlLmxvZyBcIkFVVE8gU1RBUlRcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8nKS5pbm5lckhUTUwgPSBcIkFVVE8gU1RBUlRcIlxyXG4gICAgc3RhcnRIZXJlKClcclxuXHJcbiAgbmV3IENsaXBib2FyZCAnLnNoYXJlJywge1xyXG4gICAgdGV4dDogKHRyaWdnZXIpIC0+XHJcbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL1Blcm1hL2kpXHJcbiAgICAgICAgcmV0dXJuIGNhbGNQZXJtYSgpXHJcbiAgICAgIG1pcnJvciA9IGZhbHNlXHJcbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL01pcnJvci9pKVxyXG4gICAgICAgIG1pcnJvciA9IHRydWVcclxuICAgICAgcmV0dXJuIGNhbGNTaGFyZVVSTChtaXJyb3IpXHJcbiAgfVxyXG4iLCJmaWx0ZXJzID0gcmVxdWlyZSAnLi4vZmlsdGVycydcclxuXHJcbmNsYXNzIFBsYXllclxyXG4gIGNvbnN0cnVjdG9yOiAoZG9tSUQsIHNob3dDb250cm9scyA9IHRydWUpIC0+XHJcbiAgICBAZW5kZWQgPSBudWxsXHJcbiAgICBvcHRpb25zID0gdW5kZWZpbmVkXHJcbiAgICBpZiBub3Qgc2hvd0NvbnRyb2xzXHJcbiAgICAgIG9wdGlvbnMgPSB7IGNvbnRyb2xzOiBbXSB9XHJcbiAgICBAcGx5ciA9IG5ldyBQbHlyKGRvbUlELCBvcHRpb25zKVxyXG4gICAgQHBseXIub24gJ3JlYWR5JywgKGV2ZW50KSA9PlxyXG4gICAgICBAcGx5ci5wbGF5KClcclxuICAgIEBwbHlyLm9uICdlbmRlZCcsIChldmVudCkgPT5cclxuICAgICAgaWYgQGVuZGVkP1xyXG4gICAgICAgIEBlbmRlZCgpXHJcblxyXG4gICAgQHBseXIub24gJ3BsYXlpbmcnLCAoZXZlbnQpID0+XHJcbiAgICAgIGlmIEBvblRpdGxlP1xyXG4gICAgICAgIEBvblRpdGxlKEBwbHlyLm10dlRpdGxlKVxyXG5cclxuICBwbGF5OiAoaWQsIHN0YXJ0U2Vjb25kcyA9IHVuZGVmaW5lZCwgZW5kU2Vjb25kcyA9IHVuZGVmaW5lZCkgLT5cclxuICAgIGlkSW5mbyA9IGZpbHRlcnMuY2FsY0lkSW5mbyhpZClcclxuICAgIGlmIG5vdCBpZEluZm8/XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHN3aXRjaCBpZEluZm8ucHJvdmlkZXJcclxuICAgICAgd2hlbiAneW91dHViZSdcclxuICAgICAgICBzb3VyY2UgPSB7XHJcbiAgICAgICAgICBzcmM6IGlkSW5mby5yZWFsXHJcbiAgICAgICAgICBwcm92aWRlcjogJ3lvdXR1YmUnXHJcbiAgICAgICAgfVxyXG4gICAgICB3aGVuICdtdHYnXHJcbiAgICAgICAgc291cmNlID0ge1xyXG4gICAgICAgICAgc3JjOiBcIi92aWRlb3MvI3tpZEluZm8ucmVhbH0ubXA0XCJcclxuICAgICAgICAgIHR5cGU6ICd2aWRlby9tcDQnXHJcbiAgICAgICAgfVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgaWYoc3RhcnRTZWNvbmRzPyBhbmQgKHN0YXJ0U2Vjb25kcyA+IDApKVxyXG4gICAgICBAcGx5ci5tdHZTdGFydCA9IHN0YXJ0U2Vjb25kc1xyXG4gICAgZWxzZVxyXG4gICAgICBAcGx5ci5tdHZTdGFydCA9IHVuZGVmaW5lZFxyXG4gICAgaWYoZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID4gMCkpXHJcbiAgICAgIEBwbHlyLm10dkVuZCA9IGVuZFNlY29uZHNcclxuICAgIGVsc2VcclxuICAgICAgQHBseXIubXR2RW5kID0gdW5kZWZpbmVkXHJcbiAgICBAcGx5ci5zb3VyY2UgPVxyXG4gICAgICB0eXBlOiAndmlkZW8nLFxyXG4gICAgICB0aXRsZTogJ01UVicsXHJcbiAgICAgIHNvdXJjZXM6IFtzb3VyY2VdXHJcblxyXG4gIHRvZ2dsZVBhdXNlOiAtPlxyXG4gICAgaWYgQHBseXIucGF1c2VkXHJcbiAgICAgIEBwbHlyLnBsYXkoKVxyXG4gICAgZWxzZVxyXG4gICAgICBAcGx5ci5wYXVzZSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgb3BpbmlvbnM6XHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcbiAgICBtZWg6IHRydWVcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgZ29vZE9waW5pb25zOiAjIGRvbid0IHNraXAgdGhlc2VcclxuICAgIGxvdmU6IHRydWVcclxuICAgIGxpa2U6IHRydWVcclxuXHJcbiAgd2Vha09waW5pb25zOiAjIHNraXAgdGhlc2UgaWYgd2UgYWxsIGFncmVlXHJcbiAgICBtZWg6IHRydWVcclxuXHJcbiAgYmFkT3BpbmlvbnM6ICMgc2tpcCB0aGVzZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBvcGluaW9uT3JkZXI6IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcbiIsImZpbHRlckRhdGFiYXNlID0gbnVsbFxyXG5maWx0ZXJPcGluaW9ucyA9IHt9XHJcblxyXG5maWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG51bGxcclxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcclxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxyXG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxyXG5cclxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cclxuICBmaWx0ZXJEYXRhYmFzZSA9IGRiXHJcbiAgZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBvcGluaW9uc1xyXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXHJcblxyXG5nZXREYXRhID0gKHVybCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XHJcbiAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcclxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHVzZXIgb3BpbmlvbnMgZm9yICN7ZmlsdGVyVXNlcn1cIilcclxuXHJcbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxyXG4gIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcclxuICAgIHNvbG9GaWx0ZXJzID0gW11cclxuICAgIHJhd0ZpbHRlcnMgPSBmaWx0ZXJTdHJpbmcuc3BsaXQoL1xccj9cXG4vKVxyXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXHJcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcclxuICAgICAgaWYgZmlsdGVyLmxlbmd0aCA+IDBcclxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcclxuICAgICAgIyBObyBmaWx0ZXJzXHJcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcclxuICBpZiBmaWx0ZXJEYXRhYmFzZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXHJcbiAgZWxzZVxyXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZyBkYXRhYmFzZS4uLlwiXHJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxyXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG5cclxuICBzb2xvVW5saXN0ZWQgPSB7fVxyXG4gIHNvbG9VbnNodWZmbGVkID0gW11cclxuICBpZiBzb2xvRmlsdGVycz9cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBlLmFsbG93ZWQgPSBmYWxzZVxyXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxyXG5cclxuICAgIGFsbEFsbG93ZWQgPSB0cnVlXHJcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXHJcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvICsvKVxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJwcml2YXRlXCJcclxuICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgbmVnYXRlZCA9IGZhbHNlXHJcbiAgICAgIHByb3BlcnR5ID0gXCJhbGxvd2VkXCJcclxuICAgICAgaWYgcGllY2VzWzBdID09IFwic2tpcFwiXHJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxyXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXHJcbiAgICAgIGVsc2UgaWYgcGllY2VzWzBdID09IFwiYW5kXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcHJvcGVydHkgPT0gXCJhbGxvd2VkXCJcclxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcclxuXHJcbiAgICAgIHN1YnN0cmluZyA9IHBpZWNlcy5zbGljZSgxKS5qb2luKFwiIFwiKVxyXG4gICAgICBpZExvb2t1cCA9IG51bGxcclxuXHJcbiAgICAgIGlmIG1hdGNoZXMgPSBwaWVjZXNbMF0ubWF0Y2goL14hKC4rKSQvKVxyXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxyXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cclxuXHJcbiAgICAgIGNvbW1hbmQgPSBwaWVjZXNbMF0udG9Mb3dlckNhc2UoKVxyXG4gICAgICBzd2l0Y2ggY29tbWFuZFxyXG4gICAgICAgIHdoZW4gJ2FydGlzdCcsICdiYW5kJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAndGl0bGUnLCAnc29uZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnYWRkZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUubmlja25hbWUgPT0gc1xyXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBPYmplY3Qua2V5cyhlLnRhZ3MpLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgd2hlbiAndGFnJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50YWdzW3NdID09IHRydWVcclxuICAgICAgICB3aGVuICdyZWNlbnQnLCAnc2luY2UnXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxyXG4gICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIGR1cmF0aW9uSW5TZWNvbmRzID0gcGFyc2VEdXJhdGlvbihzdWJzdHJpbmcpXHJcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXHJcbiAgICAgICAgICAgICMgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgcGFyc2UgZHVyYXRpb246ICN7c3Vic3RyaW5nfVwiKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIHBhcnNpbmcgZXhjZXB0aW9uOiAje3NvbWVFeGNlcHRpb259XCJcclxuICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIFsje3N1YnN0cmluZ31dIC0gI3tkdXJhdGlvbkluU2Vjb25kc31cIlxyXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYWRkZWQgPiBzaW5jZVxyXG4gICAgICAgIHdoZW4gJ2xvdmUnLCAnbGlrZScsICdibGVoJywgJ2hhdGUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxyXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xyXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcclxuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1tlLmlkXT9bZmlsdGVyVXNlcl0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICB3aGVuICdub25lJ1xyXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xyXG4gICAgICAgICAgaWYgZmlsdGVyU2VydmVyT3BpbmlvbnNcclxuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1tlLmlkXT9bZmlsdGVyVXNlcl0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/W2UuaWRdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICB3aGVuICdmdWxsJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT5cclxuICAgICAgICAgICAgZnVsbCA9IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgKyBcIiAtIFwiICsgZS50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2lkJywgJ2lkcydcclxuICAgICAgICAgIGlkTG9va3VwID0ge31cclxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcclxuICAgICAgICAgICAgaWYgaWQubWF0Y2goL14jLylcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXHJcbiAgICAgICAgd2hlbiAndW4nLCAndWwnLCAndW5saXN0ZWQnXHJcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XHJcbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXHJcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgaWYgbm90IGlkLm1hdGNoKC9eeW91dHViZV8vKSBhbmQgbm90IGlkLm1hdGNoKC9ebXR2Xy8pXHJcbiAgICAgICAgICAgICAgaWQgPSBcInlvdXR1YmVfI3tpZH1cIlxyXG4gICAgICAgICAgICBwaXBlU3BsaXQgPSBpZC5zcGxpdCgvXFx8LylcclxuICAgICAgICAgICAgaWQgPSBwaXBlU3BsaXQuc2hpZnQoKVxyXG4gICAgICAgICAgICBzdGFydCA9IC0xXHJcbiAgICAgICAgICAgIGVuZCA9IC0xXHJcbiAgICAgICAgICAgIGlmIHBpcGVTcGxpdC5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgICAgc3RhcnQgPSBwYXJzZUludChwaXBlU3BsaXQuc2hpZnQoKSlcclxuICAgICAgICAgICAgaWYgcGlwZVNwbGl0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICBlbmQgPSBwYXJzZUludChwaXBlU3BsaXQuc2hpZnQoKSlcclxuICAgICAgICAgICAgdGl0bGUgPSBpZFxyXG4gICAgICAgICAgICBpZiBtYXRjaGVzID0gdGl0bGUubWF0Y2goL155b3V0dWJlXyguKykvKVxyXG4gICAgICAgICAgICAgIHRpdGxlID0gbWF0Y2hlc1sxXVxyXG4gICAgICAgICAgICBlbHNlIGlmIG1hdGNoZXMgPSB0aXRsZS5tYXRjaCgvXm10dl8oLispLylcclxuICAgICAgICAgICAgICB0aXRsZSA9IG1hdGNoZXNbMV1cclxuICAgICAgICAgICAgc29sb1VubGlzdGVkW2lkXSA9XHJcbiAgICAgICAgICAgICAgaWQ6IGlkXHJcbiAgICAgICAgICAgICAgYXJ0aXN0OiAnVW5saXN0ZWQgVmlkZW9zJ1xyXG4gICAgICAgICAgICAgIHRpdGxlOiB0aXRsZVxyXG4gICAgICAgICAgICAgIHRhZ3M6IHt9XHJcbiAgICAgICAgICAgICAgbmlja25hbWU6ICdVbmxpc3RlZCdcclxuICAgICAgICAgICAgICBjb21wYW55OiAnVW5saXN0ZWQnXHJcbiAgICAgICAgICAgICAgdGh1bWI6ICd1bmxpc3RlZC5wbmcnXHJcbiAgICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0XHJcbiAgICAgICAgICAgICAgZW5kOiBlbmRcclxuICAgICAgICAgICAgICB1bmxpc3RlZDogdHJ1ZVxyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGlmIGlkTG9va3VwP1xyXG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxyXG4gICAgICAgICAgZSA9IGZpbHRlckRhdGFiYXNlW2lkXVxyXG4gICAgICAgICAgaWYgbm90IGU/XHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICBpc01hdGNoID0gdHJ1ZVxyXG4gICAgICAgICAgaWYgbmVnYXRlZFxyXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgZm9yIGssIHVubGlzdGVkIG9mIHNvbG9Vbmxpc3RlZFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQucHVzaCB1bmxpc3RlZFxyXG5cclxuICBpZiBzb3J0QnlBcnRpc3RcclxuICAgIHNvbG9VbnNodWZmbGVkLnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPCBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEuYXJ0aXN0LnRvTG93ZXJDYXNlKCkgPiBiLmFydGlzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIC0xXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA+IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIHJldHVybiAwXHJcbiAgcmV0dXJuIHNvbG9VbnNodWZmbGVkXHJcblxyXG5jYWxjSWRJbmZvID0gKGlkKSAtPlxyXG4gIGlmIG5vdCBtYXRjaGVzID0gaWQubWF0Y2goL14oW2Etel0rKV8oXFxTKykvKVxyXG4gICAgY29uc29sZS5sb2cgXCJjYWxjSWRJbmZvOiBCYWQgSUQ6ICN7aWR9XCJcclxuICAgIHJldHVybiBudWxsXHJcbiAgcHJvdmlkZXIgPSBtYXRjaGVzWzFdXHJcbiAgcmVhbCA9IG1hdGNoZXNbMl1cclxuXHJcbiAgc3dpdGNoIHByb3ZpZGVyXHJcbiAgICB3aGVuICd5b3V0dWJlJ1xyXG4gICAgICB1cmwgPSBcImh0dHBzOi8veW91dHUuYmUvI3tyZWFsfVwiXHJcbiAgICB3aGVuICdtdHYnXHJcbiAgICAgIHVybCA9IFwiL3ZpZGVvcy8je3JlYWx9Lm1wNFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiY2FsY0lkSW5mbzogQmFkIFByb3ZpZGVyOiAje3Byb3ZpZGVyfVwiXHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpZDogaWRcclxuICAgIHByb3ZpZGVyOiBwcm92aWRlclxyXG4gICAgcmVhbDogcmVhbFxyXG4gICAgdXJsOiB1cmxcclxuICB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2V0U2VydmVyRGF0YWJhc2VzOiBzZXRTZXJ2ZXJEYXRhYmFzZXNcclxuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxyXG4gIGNhbGNJZEluZm86IGNhbGNJZEluZm9cclxuIl19
