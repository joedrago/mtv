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
var Clipboard, DASHCAST_NAMESPACE, calcLabel, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, clipboardMirror, constants, deletePlaylist, discordNickname, discordTag, discordToken, endedTimer, fadeIn, fadeOut, filters, finishInit, formChanged, generatePermalink, getData, k, launchOpen, len, loadPlaylist, logout, newSoloID, now, o, onError, onInitSuccess, onPlayerReady, onPlayerStateChange, opinionOrder, overTimers, pageEpoch, pauseInternal, play, player, playing, prepareCast, qs, randomString, receiveIdentity, receiveUserPlaylist, ref, renderClipboard, renderClipboardMirror, renderInfo, requestUserPlaylists, savePlaylist, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, showInfo, showList, showWatchForm, showWatchLink, socket, soloCommand, soloCount, soloError, soloID, soloInfo, soloInfoBroadcast, soloLabels, soloMirror, soloPause, soloPlay, soloQueue, soloRestart, soloSkip, soloTick, soloTickTimeout, soloUnshuffled, soloVideo, startCast, startHere, updateOpinion, updateSoloID, youtubeReady;

constants = require('../constants');

Clipboard = require('clipboard');

filters = require('../filters');

socket = null;

player = null;

endedTimer = null;

playing = false;

soloUnshuffled = [];

soloQueue = [];

soloTickTimeout = null;

soloVideo = null;

soloError = null;

soloCount = 0;

soloLabels = null;

soloMirror = false;

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

launchOpen = localStorage.getItem('launch') === "true";

console.log(`launchOpen: ${launchOpen}`);

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
  document.getElementById('aslink').style.display = 'none';
  document.getElementById('asform').style.display = 'block';
  document.getElementById('castbutton').style.display = 'inline-block';
  document.getElementById("filters").focus();
  launchOpen = true;
  return localStorage.setItem('launch', 'true');
};

showWatchLink = function() {
  document.getElementById('aslink').style.display = 'inline-block';
  document.getElementById('asform').style.display = 'none';
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

calcShareURL = function(mirror) {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  if (mirror) {
    params.set("mirror", 1);
    params.delete("filters");
  } else {
    params.delete("solo");
    params.set("filters", params.get("filters").trim());
  }
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
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
  baseURL = baseURL.replace(/solo$/, "");
  mtvURL = baseURL + "watch?" + querystring;
  console.log(`We're going here: ${mtvURL}`);
  return chrome.cast.requestSession(function(e) {
    castSession = e;
    return castSession.sendMessage(DASHCAST_NAMESPACE, {
      url: mtvURL,
      force: true
    });
  }, onError);
};

// autoplay video
onPlayerReady = function(event) {
  event.target.playVideo();
  return startHere();
};

// when video ends
onPlayerStateChange = function(event) {
  if (endedTimer != null) {
    clearTimeout(endedTimer);
    endedTimer = null;
  }
  if (event.data === 0) {
    console.log("ENDED");
    return endedTimer = setTimeout(function() {
      return playing = false;
    }, 2000);
  }
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
      html += "\nHere Mode";
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
  var opts;
  if (player == null) {
    return;
  }
  console.log(`Playing: ${id}`);
  opts = {
    videoId: id
  };
  if ((startSeconds != null) && (startSeconds >= 0)) {
    opts.startSeconds = startSeconds;
  }
  if ((endSeconds != null) && (endSeconds >= 1)) {
    opts.endSeconds = endSeconds;
  }
  player.loadVideoById(opts);
  playing = true;
  return showInfo(pkt);
};

soloInfoBroadcast = function() {
  var info, nextVideo, pkt;
  if ((socket != null) && (soloID != null) && (soloVideo != null) && !soloMirror) {
    nextVideo = null;
    if (soloQueue.length > 0) {
      nextVideo = soloQueue[0];
    }
    info = {
      current: soloVideo,
      next: nextVideo,
      index: soloCount - soloQueue.length,
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

soloPlay = function(restart = false) {
  var i, index, j, l, len1;
  if (player == null) {
    return;
  }
  if (soloError || soloMirror) {
    return;
  }
  if (!restart || (soloVideo == null)) {
    if (soloQueue.length === 0) {
      console.log("Reshuffling...");
      soloQueue = [soloUnshuffled[0]];
      for (index = l = 0, len1 = soloUnshuffled.length; l < len1; index = ++l) {
        i = soloUnshuffled[index];
        if (index === 0) {
          continue;
        }
        j = Math.floor(Math.random() * (index + 1));
        soloQueue.push(soloQueue[j]);
        soloQueue[j] = i;
      }
    }
    soloVideo = soloQueue.shift();
  }
  console.log(soloVideo);
  // debug
  // soloVideo.start = 10
  // soloVideo.end = 50
  // soloVideo.duration = 40
  play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
  return soloInfoBroadcast();
};

soloTick = function() {
  if (player == null) {
    return;
  }
  if ((soloID == null) || soloError || soloMirror) {
    return;
  }
  console.log("soloTick()");
  if (!playing && (player != null)) {
    soloPlay();
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

startHere = async function() {
  var filterString;
  showWatchLink();
  if (player == null) {
    document.getElementById('solovideocontainer').style.display = 'block';
    document.getElementById('outer').classList.add('fadey');
    player = new YT.Player('mtv-player', {
      width: '100%',
      height: '100%',
      videoId: 'AB7ykOfAgIA', // MTV loading screen, this will be replaced almost immediately
      playerVars: {
        'autoplay': 1,
        'enablejsapi': 1,
        'controls': 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    return;
  }
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
  if (soloTickTimeout != null) {
    clearInterval(soloTickTimeout);
  }
  soloTickTimeout = setInterval(soloTick, 5000);
  soloQueue = [];
  soloPlay();
  if (soloMirror && soloVideo) {
    return play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
  }
};

calcPermalink = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "?" + querystring;
  return mtvURL;
};

generatePermalink = function() {
  console.log("generatePermalink()");
  return window.location = calcPermalink();
};

formChanged = function() {
  console.log("Form changed!");
  return history.replaceState('here', '', calcPermalink());
};

soloSkip = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'skip'
  });
  return soloPlay();
};

soloRestart = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'restart'
  });
  return soloPlay(true);
};

soloPause = function() {
  socket.emit('solo', {
    id: soloID,
    cmd: 'pause'
  });
  return pauseInternal();
};

renderInfo = async function() {
  var company, html, tagsString;
  if ((soloInfo == null) || (soloInfo.current == null)) {
    return;
  }
  tagsString = Object.keys(soloInfo.current.tags).sort().join(', ');
  company = (await calcLabel(soloInfo.current));
  html = `<div class=\"infocounts\">Track ${soloInfo.index} / ${soloInfo.count}</div>`;
  // html += "<div class=\"infoheading\">Current: [<span class=\"youtubeid\">#{soloInfo.current.id}</span>]</div>"
  if (player == null) {
    html += `<div class=\"infothumb\"><a href=\"https://youtu.be/${encodeURIComponent(soloInfo.current.id)}\"><img width=320 height=180 src=\"${soloInfo.current.thumb}\"></a></div>`;
  }
  html += `<div class=\"infocurrent infoartist\">${soloInfo.current.artist}</div>`;
  html += `<div class=\"infotitle\">\"${soloInfo.current.title}\"</div>`;
  html += `<div class=\"infolabel\">${company}</div>`;
  html += `<div class=\"infotags\">&nbsp;${tagsString}&nbsp;</div>`;
  if (soloInfo.next != null) {
    html += "<span class=\"infoheading nextvideo\">Next:</span> ";
    html += `<span class=\"infoartist nextvideo\">${soloInfo.next.artist}</span>`;
    html += "<span class=\"nextvideo\"> - </span>";
    html += `<span class=\"infotitle nextvideo\">\"${soloInfo.next.title}\"</span>`;
  } else {
    html += "<span class=\"infoheading nextvideo\">Next:</span> ";
    html += "<span class=\"inforeshuffle nextvideo\">(...Reshuffle...)</span>";
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

showList = async function() {
  var e, filterString, html, l, len1, list;
  document.getElementById('list').innerHTML = "Please wait...";
  filterString = document.getElementById('filters').value;
  list = (await filters.generateList(filterString, true));
  if (list == null) {
    document.getElementById('list').innerHTML = "Error. Sorry.";
    return;
  }
  html = "<div class=\"listcontainer\">";
  html += `<div class=\"infocounts\">${list.length} videos:</div>`;
  for (l = 0, len1 = list.length; l < len1; l++) {
    e = list[l];
    html += "<div>";
    html += `<span class=\"infoartist nextvideo\">${e.artist}</span>`;
    html += "<span class=\"nextvideo\"> - </span>";
    html += `<span class=\"infotitle nextvideo\">\"${e.title}\"</span>`;
    html += "</div>\n";
  }
  html += "</div>";
  return document.getElementById('list').innerHTML = html;
};

clearOpinion = function() {
  return document.getElementById('opinions').innerHTML = "";
};

updateOpinion = function(pkt) {
  var capo, classes, html, l;
  if ((soloInfo == null) || (soloInfo.current == null) || !(pkt.id === soloInfo.current.id)) {
    return;
  }
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
  if ((discordToken == null) || (soloInfo == null) || (soloInfo.current == null) || (soloInfo.current.id == null)) {
    return;
  }
  return socket.emit('opinion', {
    token: discordToken,
    id: soloInfo.current.id,
    set: opinion
  });
};

pauseInternal = function() {
  if (player != null) {
    if (player.getPlayerState() === 2) {
      return player.playVideo();
    } else {
      return player.pauseVideo();
    }
  }
};

soloCommand = async function(pkt) {
  if (pkt.id !== soloID) {
    return;
  }
  console.log("soloCommand: ", pkt);
  switch (pkt.cmd) {
    case 'skip':
      return soloPlay();
    case 'restart':
      return soloPlay(true);
    case 'pause':
      return pauseInternal();
    case 'info':
      if (pkt.info != null) {
        console.log("NEW INFO!: ", pkt.info);
        soloInfo = pkt.info;
        await renderInfo();
        renderClipboard();
        renderClipboardMirror();
        if (soloMirror) {
          soloVideo = pkt.info.current;
          if (soloVideo != null) {
            if (player == null) {
              console.log("no player yet");
            }
            play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
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

newSoloID = function() {
  updateSoloID(randomString());
  document.getElementById("mirror").checked = false;
  document.getElementById('filtersection').style.display = 'block';
  document.getElementById('mirrornote').style.display = 'none';
  return generatePermalink();
};

loadPlaylist = function() {
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
    action: "load",
    loadname: selectedName
  };
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
    return document.getElementById("filters").value = pkt.filters;
  }
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

youtubeReady = false;

window.onYouTubePlayerAPIReady = function() {
  if (youtubeReady) {
    return;
  }
  youtubeReady = true;
  console.log("onYouTubePlayerAPIReady");
  return setTimeout(function() {
    return finishInit();
  }, 0);
};

finishInit = function() {
  var qsFilters;
  window.clipboardEdit = clipboardEdit;
  window.clipboardMirror = clipboardMirror;
  window.deletePlaylist = deletePlaylist;
  window.formChanged = formChanged;
  window.loadPlaylist = loadPlaylist;
  window.logout = logout;
  window.newSoloID = newSoloID;
  window.savePlaylist = savePlaylist;
  window.setOpinion = setOpinion;
  window.shareClipboard = shareClipboard;
  window.showList = showList;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.soloPause = soloPause;
  window.soloRestart = soloRestart;
  window.soloSkip = soloSkip;
  window.startCast = startCast;
  window.startHere = startHere;
  updateSoloID(qs('solo'));
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
      return sendIdentity();
    }
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
  prepareCast();
  new Clipboard('.share', {
    text: function(trigger) {
      var mirror;
      mirror = false;
      if (trigger.value.match(/Mirror/i)) {
        mirror = true;
      }
      return calcShareURL(mirror);
    }
  });
  if (launchOpen) {
    return showWatchForm();
  } else {
    return showWatchLink();
  }
};

setTimeout(function() {
  // somehow we missed this event, just kick it manually
  if (!youtubeReady) {
    console.log("kicking Youtube...");
    return window.onYouTubePlayerAPIReady();
  }
}, 3000);


},{"../constants":4,"../filters":5,"clipboard":1}],4:[function(require,module,exports){
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


},{}],5:[function(require,module,exports){
var cacheOpinions, filterDatabase, filterGetUserFromNickname, filterOpinions, filterServerOpinions, generateList, getData, iso8601, now, parseDuration, setServerDatabases;

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

module.exports = {
  setServerDatabases: setServerDatabases,
  generateList: generateList
};


},{"iso8601-duration":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9zb2xvLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0UsZUFBTyxFQURUOztNQUVBLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUEzQjtBQUNFLGVBQU8sQ0FBQyxFQURWOztNQUVBLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFSLENBQUEsQ0FBQSxHQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUEzQjtBQUNFLGVBQU8sRUFEVDs7QUFFQSxhQUFPO0lBVFcsQ0FBcEIsRUFERjs7QUFXQSxTQUFPO0FBdEpNOztBQXdKZixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsa0JBQUEsRUFBb0Isa0JBQXBCO0VBQ0EsWUFBQSxFQUFjO0FBRGQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiFcbiAqIGNsaXBib2FyZC5qcyB2Mi4wLjhcbiAqIGh0dHBzOi8vY2xpcGJvYXJkanMuY29tL1xuICpcbiAqIExpY2Vuc2VkIE1JVCDCqSBaZW5vIFJvY2hhXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKCkgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlc19fID0gKHtcblxuLyoqKi8gMTM0OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBFWFBPUlRTXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywge1xuICBcImRlZmF1bHRcIjogZnVuY3Rpb24oKSB7IHJldHVybiAvKiBiaW5kaW5nICovIGNsaXBib2FyZDsgfVxufSk7XG5cbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzXG52YXIgdGlueV9lbWl0dGVyID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNzkpO1xudmFyIHRpbnlfZW1pdHRlcl9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubih0aW55X2VtaXR0ZXIpO1xuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy9nb29kLWxpc3RlbmVyL3NyYy9saXN0ZW4uanNcbnZhciBsaXN0ZW4gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM3MCk7XG52YXIgbGlzdGVuX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKGxpc3Rlbik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL3NlbGVjdC9zcmMvc2VsZWN0LmpzXG52YXIgc3JjX3NlbGVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oODE3KTtcbnZhciBzZWxlY3RfZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4oc3JjX3NlbGVjdCk7XG47Ly8gQ09OQ0FURU5BVEVEIE1PRFVMRTogLi9zcmMvY2xpcGJvYXJkLWFjdGlvbi5qc1xuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cblxuLyoqXG4gKiBJbm5lciBjbGFzcyB3aGljaCBwZXJmb3JtcyBzZWxlY3Rpb24gZnJvbSBlaXRoZXIgYHRleHRgIG9yIGB0YXJnZXRgXG4gKiBwcm9wZXJ0aWVzIGFuZCB0aGVuIGV4ZWN1dGVzIGNvcHkgb3IgY3V0IG9wZXJhdGlvbnMuXG4gKi9cblxudmFyIENsaXBib2FyZEFjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkQWN0aW9uKG9wdGlvbnMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkQWN0aW9uKTtcblxuICAgIHRoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5pbml0U2VsZWN0aW9uKCk7XG4gIH1cbiAgLyoqXG4gICAqIERlZmluZXMgYmFzZSBwcm9wZXJ0aWVzIHBhc3NlZCBmcm9tIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhDbGlwYm9hcmRBY3Rpb24sIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSBvcHRpb25zLmFjdGlvbjtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG4gICAgICB0aGlzLmVtaXR0ZXIgPSBvcHRpb25zLmVtaXR0ZXI7XG4gICAgICB0aGlzLnRhcmdldCA9IG9wdGlvbnMudGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy50ZXh0O1xuICAgICAgdGhpcy50cmlnZ2VyID0gb3B0aW9ucy50cmlnZ2VyO1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVjaWRlcyB3aGljaCBzZWxlY3Rpb24gc3RyYXRlZ3kgaXMgZ29pbmcgdG8gYmUgYXBwbGllZCBiYXNlZFxuICAgICAqIG9uIHRoZSBleGlzdGVuY2Ugb2YgYHRleHRgIGFuZCBgdGFyZ2V0YCBwcm9wZXJ0aWVzLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaW5pdFNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0U2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudGV4dCkge1xuICAgICAgICB0aGlzLnNlbGVjdEZha2UoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RUYXJnZXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZha2UgdGV4dGFyZWEgZWxlbWVudCwgc2V0cyBpdHMgdmFsdWUgZnJvbSBgdGV4dGAgcHJvcGVydHksXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjcmVhdGVGYWtlRWxlbWVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVGYWtlRWxlbWVudCgpIHtcbiAgICAgIHZhciBpc1JUTCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RpcicpID09PSAncnRsJztcbiAgICAgIHRoaXMuZmFrZUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpOyAvLyBQcmV2ZW50IHpvb21pbmcgb24gaU9TXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuZm9udFNpemUgPSAnMTJwdCc7IC8vIFJlc2V0IGJveCBtb2RlbFxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLmJvcmRlciA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUucGFkZGluZyA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUubWFyZ2luID0gJzAnOyAvLyBNb3ZlIGVsZW1lbnQgb3V0IG9mIHNjcmVlbiBob3Jpem9udGFsbHlcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlW2lzUlRMID8gJ3JpZ2h0JyA6ICdsZWZ0J10gPSAnLTk5OTlweCc7IC8vIE1vdmUgZWxlbWVudCB0byB0aGUgc2FtZSBwb3NpdGlvbiB2ZXJ0aWNhbGx5XG5cbiAgICAgIHZhciB5UG9zaXRpb24gPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUudG9wID0gXCJcIi5jb25jYXQoeVBvc2l0aW9uLCBcInB4XCIpO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgdGhpcy5mYWtlRWxlbS52YWx1ZSA9IHRoaXMudGV4dDtcbiAgICAgIHJldHVybiB0aGlzLmZha2VFbGVtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQncyB0aGUgdmFsdWUgb2YgZmFrZUVsZW0sXG4gICAgICogYW5kIG1ha2VzIGEgc2VsZWN0aW9uIG9uIGl0LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0RmFrZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RGYWtlKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGZha2VFbGVtID0gdGhpcy5jcmVhdGVGYWtlRWxlbWVudCgpO1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyID0gdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2spIHx8IHRydWU7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChmYWtlRWxlbSk7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkoZmFrZUVsZW0pO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgICAgdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9ubHkgcmVtb3ZlcyB0aGUgZmFrZSBlbGVtZW50IGFmdGVyIGFub3RoZXIgY2xpY2sgZXZlbnQsIHRoYXQgd2F5XG4gICAgICogYSB1c2VyIGNhbiBoaXQgYEN0cmwrQ2AgdG8gY29weSBiZWNhdXNlIHNlbGVjdGlvbiBzdGlsbCBleGlzdHMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUZha2UoKSB7XG4gICAgICBpZiAodGhpcy5mYWtlSGFuZGxlcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5mYWtlRWxlbSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmZha2VFbGVtKTtcbiAgICAgICAgdGhpcy5mYWtlRWxlbSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgdGhlIGNvbnRlbnQgZnJvbSBlbGVtZW50IHBhc3NlZCBvbiBgdGFyZ2V0YCBwcm9wZXJ0eS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RUYXJnZXQoKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkodGhpcy50YXJnZXQpO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgY29weSBvcGVyYXRpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY29weVRleHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weVRleHQoKSB7XG4gICAgICB2YXIgc3VjY2VlZGVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBzdWNjZWVkZWQgPSBkb2N1bWVudC5leGVjQ29tbWFuZCh0aGlzLmFjdGlvbik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0KHN1Y2NlZWRlZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIGFuIGV2ZW50IGJhc2VkIG9uIHRoZSBjb3B5IG9wZXJhdGlvbiByZXN1bHQuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBzdWNjZWVkZWRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVJlc3VsdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXN1bHQoc3VjY2VlZGVkKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdChzdWNjZWVkZWQgPyAnc3VjY2VzcycgOiAnZXJyb3InLCB7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgIHRleHQ6IHRoaXMuc2VsZWN0ZWRUZXh0LFxuICAgICAgICB0cmlnZ2VyOiB0aGlzLnRyaWdnZXIsXG4gICAgICAgIGNsZWFyU2VsZWN0aW9uOiB0aGlzLmNsZWFyU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBmb2N1cyBhd2F5IGZyb20gYHRhcmdldGAgYW5kIGJhY2sgdG8gdGhlIHRyaWdnZXIsIHJlbW92ZXMgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjbGVhclNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBgYWN0aW9uYCB0byBiZSBwZXJmb3JtZWQgd2hpY2ggY2FuIGJlIGVpdGhlciAnY29weScgb3IgJ2N1dCcuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvblxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWN0aW9uXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnY29weSc7XG4gICAgICB0aGlzLl9hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgIGlmICh0aGlzLl9hY3Rpb24gIT09ICdjb3B5JyAmJiB0aGlzLl9hY3Rpb24gIT09ICdjdXQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcImFjdGlvblwiIHZhbHVlLCB1c2UgZWl0aGVyIFwiY29weVwiIG9yIFwiY3V0XCInKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYGFjdGlvbmAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hY3Rpb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5IHVzaW5nIGFuIGVsZW1lbnRcbiAgICAgKiB0aGF0IHdpbGwgYmUgaGF2ZSBpdHMgY29udGVudCBjb3BpZWQuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInRhcmdldFwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgX3R5cGVvZih0YXJnZXQpID09PSAnb2JqZWN0JyAmJiB0YXJnZXQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdjb3B5JyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiBhdHRyaWJ1dGUuIFBsZWFzZSB1c2UgXCJyZWFkb25seVwiIGluc3RlYWQgb2YgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2N1dCcgJiYgKHRhcmdldC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5JykgfHwgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gWW91IGNhblxcJ3QgY3V0IHRleHQgZnJvbSBlbGVtZW50cyB3aXRoIFwicmVhZG9ubHlcIiBvciBcImRpc2FibGVkXCIgYXR0cmlidXRlcycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3RhcmdldCA9IHRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiB2YWx1ZSwgdXNlIGEgdmFsaWQgRWxlbWVudCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ3xIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmRBY3Rpb247XG59KCk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZF9hY3Rpb24gPSAoQ2xpcGJvYXJkQWN0aW9uKTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQuanNcbmZ1bmN0aW9uIGNsaXBib2FyZF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IGNsaXBib2FyZF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBjbGlwYm9hcmRfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTsgfVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuXG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmIChjYWxsICYmIChjbGlwYm9hcmRfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7IHJldHVybiBjYWxsOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkgeyBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7IGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7IGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7IHRyeSB7IERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoRGF0ZSwgW10sIGZ1bmN0aW9uICgpIHt9KSk7IHJldHVybiB0cnVlOyB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfSB9XG5cbmZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cblxuXG5cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmV0cmlldmUgYXR0cmlidXRlIHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd9IHN1ZmZpeFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKi9cblxuZnVuY3Rpb24gZ2V0QXR0cmlidXRlVmFsdWUoc3VmZml4LCBlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJ1dGUgPSBcImRhdGEtY2xpcGJvYXJkLVwiLmNvbmNhdChzdWZmaXgpO1xuXG4gIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xufVxuLyoqXG4gKiBCYXNlIGNsYXNzIHdoaWNoIHRha2VzIG9uZSBvciBtb3JlIGVsZW1lbnRzLCBhZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGVtLFxuICogYW5kIGluc3RhbnRpYXRlcyBhIG5ldyBgQ2xpcGJvYXJkQWN0aW9uYCBvbiBlYWNoIGNsaWNrLlxuICovXG5cblxudmFyIENsaXBib2FyZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0VtaXR0ZXIpIHtcbiAgX2luaGVyaXRzKENsaXBib2FyZCwgX0VtaXR0ZXIpO1xuXG4gIHZhciBfc3VwZXIgPSBfY3JlYXRlU3VwZXIoQ2xpcGJvYXJkKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRyaWdnZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIENsaXBib2FyZCh0cmlnZ2VyLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsaXBib2FyZCk7XG5cbiAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpO1xuXG4gICAgX3RoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBfdGhpcy5saXN0ZW5DbGljayh0cmlnZ2VyKTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBpZiBhdHRyaWJ1dGVzIHdvdWxkIGJlIHJlc29sdmVkIHVzaW5nIGludGVybmFsIHNldHRlciBmdW5jdGlvbnNcbiAgICogb3IgY3VzdG9tIGZ1bmN0aW9ucyB0aGF0IHdlcmUgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG5cblxuICBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ2xpcGJvYXJkLCBbe1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlT3B0aW9ucygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuYWN0aW9uID0gdHlwZW9mIG9wdGlvbnMuYWN0aW9uID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5hY3Rpb24gOiB0aGlzLmRlZmF1bHRBY3Rpb247XG4gICAgICB0aGlzLnRhcmdldCA9IHR5cGVvZiBvcHRpb25zLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGFyZ2V0IDogdGhpcy5kZWZhdWx0VGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gdHlwZW9mIG9wdGlvbnMudGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGV4dCA6IHRoaXMuZGVmYXVsdFRleHQ7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNsaXBib2FyZF90eXBlb2Yob3B0aW9ucy5jb250YWluZXIpID09PSAnb2JqZWN0JyA/IG9wdGlvbnMuY29udGFpbmVyIDogZG9jdW1lbnQuYm9keTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGNsaWNrIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwYXNzZWQgdHJpZ2dlci5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibGlzdGVuQ2xpY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGlzdGVuQ2xpY2sodHJpZ2dlcikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5fZGVmYXVsdCgpKHRyaWdnZXIsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIub25DbGljayhlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2sgZXZlbnQuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwib25DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNsaWNrKGUpIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gZS5kZWxlZ2F0ZVRhcmdldCB8fCBlLmN1cnJlbnRUYXJnZXQ7XG5cbiAgICAgIGlmICh0aGlzLmNsaXBib2FyZEFjdGlvbikge1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbmV3IGNsaXBib2FyZF9hY3Rpb24oe1xuICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uKHRyaWdnZXIpLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0KHRyaWdnZXIpLFxuICAgICAgICB0ZXh0OiB0aGlzLnRleHQodHJpZ2dlciksXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcy5jb250YWluZXIsXG4gICAgICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgICAgIGVtaXR0ZXI6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGBhY3Rpb25gIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRBY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdEFjdGlvbih0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ2FjdGlvbicsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0YXJnZXRgIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUYXJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdFRhcmdldCh0cmlnZ2VyKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBnZXRBdHRyaWJ1dGVWYWx1ZSgndGFyZ2V0JywgdHJpZ2dlcik7XG5cbiAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1cHBvcnQgb2YgdGhlIGdpdmVuIGFjdGlvbiwgb3IgYWxsIGFjdGlvbnMgaWYgbm8gYWN0aW9uIGlzXG4gICAgICogZ2l2ZW4uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFthY3Rpb25dXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0VGV4dFwiLFxuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgdGV4dGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGV4dCh0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ3RleHQnLCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyLmRlc3Ryb3koKTtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfV0sIFt7XG4gICAga2V5OiBcImlzU3VwcG9ydGVkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzU3VwcG9ydGVkKCkge1xuICAgICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogWydjb3B5JywgJ2N1dCddO1xuICAgICAgdmFyIGFjdGlvbnMgPSB0eXBlb2YgYWN0aW9uID09PSAnc3RyaW5nJyA/IFthY3Rpb25dIDogYWN0aW9uO1xuICAgICAgdmFyIHN1cHBvcnQgPSAhIWRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN1cHBvcnRlZDtcbiAgICAgIGFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHN1cHBvcnQgPSBzdXBwb3J0ICYmICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkKGFjdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmQ7XG59KCh0aW55X2VtaXR0ZXJfZGVmYXVsdCgpKSk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZCA9IChDbGlwYm9hcmQpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gODI4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG52YXIgRE9DVU1FTlRfTk9ERV9UWVBFID0gOTtcblxuLyoqXG4gKiBBIHBvbHlmaWxsIGZvciBFbGVtZW50Lm1hdGNoZXMoKVxuICovXG5pZiAodHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgdmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbiAgICBwcm90by5tYXRjaGVzID0gcHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCBtYXRjaGVzIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgIT09IERPQ1VNRU5UX05PREVfVFlQRSkge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQubWF0Y2hlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb3Nlc3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDQzODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgY2xvc2VzdCA9IF9fd2VicGFja19yZXF1aXJlX18oODI4KTtcblxuLyoqXG4gKiBEZWxlZ2F0ZXMgZXZlbnQgdG8gYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX2RlbGVnYXRlKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIHZhciBsaXN0ZW5lckZuID0gbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lckZuLCB1c2VDYXB0dXJlKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd8QXJyYXl9IFtlbGVtZW50c11cbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gZGVsZWdhdGUoZWxlbWVudHMsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIC8vIEhhbmRsZSB0aGUgcmVndWxhciBFbGVtZW50IHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cy5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgRWxlbWVudC1sZXNzIHVzYWdlLCBpdCBkZWZhdWx0cyB0byBnbG9iYWwgZGVsZWdhdGlvblxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBVc2UgYGRvY3VtZW50YCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLCB0aGVuIGFwcGx5IGFyZ3VtZW50c1xuICAgICAgICAvLyBUaGlzIGlzIGEgc2hvcnQgd2F5IHRvIC51bnNoaWZ0IGBhcmd1bWVudHNgIHdpdGhvdXQgcnVubmluZyBpbnRvIGRlb3B0aW1pemF0aW9uc1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlLmJpbmQobnVsbCwgZG9jdW1lbnQpLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIFNlbGVjdG9yLWJhc2VkIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgQXJyYXktbGlrZSBiYXNlZCB1c2FnZVxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kcyBjbG9zZXN0IG1hdGNoIGFuZCBpbnZva2VzIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBsaXN0ZW5lcihlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gY2xvc2VzdChlLnRhcmdldCwgc2VsZWN0b3IpO1xuXG4gICAgICAgIGlmIChlLmRlbGVnYXRlVGFyZ2V0KSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGVsZW1lbnQsIGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Nzk6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIGV4cG9ydHMpIHtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgJiYgdmFsdWUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudFxuICAgICAgICAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gMTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBsaXN0IG9mIEhUTUwgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLm5vZGVMaXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiAodHlwZSA9PT0gJ1tvYmplY3QgTm9kZUxpc3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nKVxuICAgICAgICAmJiAoJ2xlbmd0aCcgaW4gdmFsdWUpXG4gICAgICAgICYmICh2YWx1ZS5sZW5ndGggPT09IDAgfHwgZXhwb3J0cy5ub2RlKHZhbHVlWzBdKSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5zdHJpbmcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5mbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuXG4gICAgcmV0dXJuIHR5cGUgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzNzA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGlzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4NzkpO1xudmFyIGRlbGVnYXRlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MzgpO1xuXG4vKipcbiAqIFZhbGlkYXRlcyBhbGwgcGFyYW1zIGFuZCBjYWxscyB0aGUgcmlnaHRcbiAqIGxpc3RlbmVyIGZ1bmN0aW9uIGJhc2VkIG9uIGl0cyB0YXJnZXQgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRhcmdldCAmJiAhdHlwZSAmJiAhY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHJlcXVpcmVkIGFyZ3VtZW50cycpO1xuICAgIH1cblxuICAgIGlmICghaXMuc3RyaW5nKHR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5mbihjYWxsYmFjaykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhpcmQgYXJndW1lbnQgbXVzdCBiZSBhIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzLm5vZGUodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZSh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMubm9kZUxpc3QodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZUxpc3QodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzLnN0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5TZWxlY3Rvcih0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcsIEhUTUxFbGVtZW50LCBIVE1MQ29sbGVjdGlvbiwgb3IgTm9kZUxpc3QnKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byBhIEhUTUwgZWxlbWVudFxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGUobm9kZSwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50c1xuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxIVE1MQ29sbGVjdGlvbn0gbm9kZUxpc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ob2RlTGlzdChub2RlTGlzdCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5vZGVMaXN0LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgc2VsZWN0b3JcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3RlblNlbGVjdG9yKHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBkZWxlZ2F0ZShkb2N1bWVudC5ib2R5LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RlbjtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gODE3OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5mdW5jdGlvbiBzZWxlY3QoZWxlbWVudCkge1xuICAgIHZhciBzZWxlY3RlZFRleHQ7XG5cbiAgICBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdJTlBVVCcgfHwgZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICB2YXIgaXNSZWFkT25seSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpO1xuXG4gICAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5zZWxlY3QoKTtcbiAgICAgICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSgwLCBlbGVtZW50LnZhbHVlLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgncmVhZG9ubHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RlZFRleHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZWN0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAyNzk6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIEUgKCkge1xuICAvLyBLZWVwIHRoaXMgZW1wdHkgc28gaXQncyBlYXNpZXIgdG8gaW5oZXJpdCBmcm9tXG4gIC8vICh2aWEgaHR0cHM6Ly9naXRodWIuY29tL2xpcHNtYWNrIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9pc3N1ZXMvMylcbn1cblxuRS5wcm90b3R5cGUgPSB7XG4gIG9uOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG5cbiAgICAoZVtuYW1lXSB8fCAoZVtuYW1lXSA9IFtdKSkucHVzaCh7XG4gICAgICBmbjogY2FsbGJhY2ssXG4gICAgICBjdHg6IGN0eFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgc2VsZi5vZmYobmFtZSwgbGlzdGVuZXIpO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBsaXN0ZW5lci5fID0gY2FsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBsaXN0ZW5lciwgY3R4KTtcbiAgfSxcblxuICBlbWl0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBkYXRhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBldnRBcnIgPSAoKHRoaXMuZSB8fCAodGhpcy5lID0ge30pKVtuYW1lXSB8fCBbXSkuc2xpY2UoKTtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbiA9IGV2dEFyci5sZW5ndGg7XG5cbiAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgZXZ0QXJyW2ldLmZuLmFwcGx5KGV2dEFycltpXS5jdHgsIGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcbiAgICB2YXIgZXZ0cyA9IGVbbmFtZV07XG4gICAgdmFyIGxpdmVFdmVudHMgPSBbXTtcblxuICAgIGlmIChldnRzICYmIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZXZ0c1tpXS5mbiAhPT0gY2FsbGJhY2sgJiYgZXZ0c1tpXS5mbi5fICE9PSBjYWxsYmFjaylcbiAgICAgICAgICBsaXZlRXZlbnRzLnB1c2goZXZ0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGV2ZW50IGZyb20gcXVldWUgdG8gcHJldmVudCBtZW1vcnkgbGVha1xuICAgIC8vIFN1Z2dlc3RlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbGF6ZFxuICAgIC8vIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9jb21taXQvYzZlYmZhYTliYzk3M2IzM2QxMTBhODRhMzA3NzQyYjdjZjk0Yzk1MyNjb21taXRjb21tZW50LTUwMjQ5MTBcblxuICAgIChsaXZlRXZlbnRzLmxlbmd0aClcbiAgICAgID8gZVtuYW1lXSA9IGxpdmVFdmVudHNcbiAgICAgIDogZGVsZXRlIGVbbmFtZV07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFO1xubW9kdWxlLmV4cG9ydHMuVGlueUVtaXR0ZXIgPSBFO1xuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIFx0fSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG4vKioqKioqLyBcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcbi8qKioqKiovIFx0XHRcdFx0fVxuLyoqKioqKi8gXHRcdFx0fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH1cbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBydW50aW1lIHNvIGVudHJ5IGlubGluaW5nIGlzIGRpc2FibGVkXG4vKioqKioqLyBcdC8vIHN0YXJ0dXBcbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzNCk7XG4vKioqKioqLyB9KSgpXG4uZGVmYXVsdDtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEEgbW9kdWxlIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb25zXG4gKi9cblxuLyoqXG4gKiBUaGUgcGF0dGVybiB1c2VkIGZvciBwYXJzaW5nIElTTzg2MDEgZHVyYXRpb24gKFBuWW5NbkRUbkhuTW5TKS5cbiAqIFRoaXMgZG9lcyBub3QgY292ZXIgdGhlIHdlZWsgZm9ybWF0IFBuVy5cbiAqL1xuXG4vLyBQblluTW5EVG5Ibk1uU1xudmFyIG51bWJlcnMgPSAnXFxcXGQrKD86W1xcXFwuLF1cXFxcZCspPyc7XG52YXIgd2Vla1BhdHRlcm4gPSAnKCcgKyBudW1iZXJzICsgJ1cpJztcbnZhciBkYXRlUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnWSk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdEKT8nO1xudmFyIHRpbWVQYXR0ZXJuID0gJ1QoJyArIG51bWJlcnMgKyAnSCk/KCcgKyBudW1iZXJzICsgJ00pPygnICsgbnVtYmVycyArICdTKT8nO1xuXG52YXIgaXNvODYwMSA9ICdQKD86JyArIHdlZWtQYXR0ZXJuICsgJ3wnICsgZGF0ZVBhdHRlcm4gKyAnKD86JyArIHRpbWVQYXR0ZXJuICsgJyk/KSc7XG52YXIgb2JqTWFwID0gWyd3ZWVrcycsICd5ZWFycycsICdtb250aHMnLCAnZGF5cycsICdob3VycycsICdtaW51dGVzJywgJ3NlY29uZHMnXTtcblxuLyoqXG4gKiBUaGUgSVNPODYwMSByZWdleCBmb3IgbWF0Y2hpbmcgLyB0ZXN0aW5nIGR1cmF0aW9uc1xuICovXG52YXIgcGF0dGVybiA9IGV4cG9ydHMucGF0dGVybiA9IG5ldyBSZWdFeHAoaXNvODYwMSk7XG5cbi8qKiBQYXJzZSBQblluTW5EVG5Ibk1uUyBmb3JtYXQgdG8gb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZHVyYXRpb25TdHJpbmcgLSBQblluTW5EVG5Ibk1uUyBmb3JtYXR0ZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gV2l0aCBhIHByb3BlcnR5IGZvciBlYWNoIHBhcnQgb2YgdGhlIHBhdHRlcm5cbiAqL1xudmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGR1cmF0aW9uU3RyaW5nKSB7XG4gIC8vIFNsaWNlIGF3YXkgZmlyc3QgZW50cnkgaW4gbWF0Y2gtYXJyYXlcbiAgcmV0dXJuIGR1cmF0aW9uU3RyaW5nLm1hdGNoKHBhdHRlcm4pLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHJldiwgbmV4dCwgaWR4KSB7XG4gICAgcHJldltvYmpNYXBbaWR4XV0gPSBwYXJzZUZsb2F0KG5leHQpIHx8IDA7XG4gICAgcmV0dXJuIHByZXY7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogQ29udmVydCBJU084NjAxIGR1cmF0aW9uIG9iamVjdCB0byBhbiBlbmQgRGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBEYXRlIGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge0RhdGV9IC0gVGhlIHJlc3VsdGluZyBlbmQgRGF0ZVxuICovXG52YXIgZW5kID0gZXhwb3J0cy5lbmQgPSBmdW5jdGlvbiBlbmQoZHVyYXRpb24sIHN0YXJ0RGF0ZSkge1xuICAvLyBDcmVhdGUgdHdvIGVxdWFsIHRpbWVzdGFtcHMsIGFkZCBkdXJhdGlvbiB0byAndGhlbicgYW5kIHJldHVybiB0aW1lIGRpZmZlcmVuY2VcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgdGhlbiA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhlbi5zZXRGdWxsWWVhcih0aGVuLmdldEZ1bGxZZWFyKCkgKyBkdXJhdGlvbi55ZWFycyk7XG4gIHRoZW4uc2V0TW9udGgodGhlbi5nZXRNb250aCgpICsgZHVyYXRpb24ubW9udGhzKTtcbiAgdGhlbi5zZXREYXRlKHRoZW4uZ2V0RGF0ZSgpICsgZHVyYXRpb24uZGF5cyk7XG4gIHRoZW4uc2V0SG91cnModGhlbi5nZXRIb3VycygpICsgZHVyYXRpb24uaG91cnMpO1xuICB0aGVuLnNldE1pbnV0ZXModGhlbi5nZXRNaW51dGVzKCkgKyBkdXJhdGlvbi5taW51dGVzKTtcbiAgLy8gVGhlbi5zZXRTZWNvbmRzKHRoZW4uZ2V0U2Vjb25kcygpICsgZHVyYXRpb24uc2Vjb25kcyk7XG4gIHRoZW4uc2V0TWlsbGlzZWNvbmRzKHRoZW4uZ2V0TWlsbGlzZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzICogMTAwMCk7XG4gIC8vIFNwZWNpYWwgY2FzZSB3ZWVrc1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi53ZWVrcyAqIDcpO1xuXG4gIHJldHVybiB0aGVuO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIHNlY29uZHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0RhdGV9IHN0YXJ0RGF0ZSAtIFRoZSBzdGFydGluZyBwb2ludCBmb3IgY2FsY3VsYXRpbmcgdGhlIGR1cmF0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbnZhciB0b1NlY29uZHMgPSBleHBvcnRzLnRvU2Vjb25kcyA9IGZ1bmN0aW9uIHRvU2Vjb25kcyhkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBzdGFydERhdGUgPyBzdGFydERhdGUuZ2V0VGltZSgpIDogRGF0ZS5ub3coKTtcbiAgdmFyIG5vdyA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gIHZhciB0aGVuID0gZW5kKGR1cmF0aW9uLCBub3cpO1xuXG4gIHZhciBzZWNvbmRzID0gKHRoZW4uZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKSkgLyAxMDAwO1xuICByZXR1cm4gc2Vjb25kcztcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgZW5kOiBlbmQsXG4gIHRvU2Vjb25kczogdG9TZWNvbmRzLFxuICBwYXR0ZXJuOiBwYXR0ZXJuLFxuICBwYXJzZTogcGFyc2Vcbn07IiwiY29uc3RhbnRzID0gcmVxdWlyZSAnLi4vY29uc3RhbnRzJ1xyXG5DbGlwYm9hcmQgPSByZXF1aXJlICdjbGlwYm9hcmQnXHJcbmZpbHRlcnMgPSByZXF1aXJlICcuLi9maWx0ZXJzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxucGxheWVyID0gbnVsbFxyXG5lbmRlZFRpbWVyID0gbnVsbFxyXG5wbGF5aW5nID0gZmFsc2Vcclxuc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG5zb2xvUXVldWUgPSBbXVxyXG5zb2xvVGlja1RpbWVvdXQgPSBudWxsXHJcbnNvbG9WaWRlbyA9IG51bGxcclxuc29sb0Vycm9yID0gbnVsbFxyXG5zb2xvQ291bnQgPSAwXHJcbnNvbG9MYWJlbHMgPSBudWxsXHJcbnNvbG9NaXJyb3IgPSBmYWxzZVxyXG5cclxuZW5kZWRUaW1lciA9IG51bGxcclxub3ZlclRpbWVycyA9IFtdXHJcblxyXG5EQVNIQ0FTVF9OQU1FU1BBQ0UgPSAndXJuOngtY2FzdDplcy5vZmZkLmRhc2hjYXN0J1xyXG5cclxuc29sb0lEID0gbnVsbFxyXG5zb2xvSW5mbyA9IHt9XHJcblxyXG5kaXNjb3JkVG9rZW4gPSBudWxsXHJcbmRpc2NvcmRUYWcgPSBudWxsXHJcbmRpc2NvcmROaWNrbmFtZSA9IG51bGxcclxuXHJcbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxyXG5jYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbmxhdW5jaE9wZW4gPSAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhdW5jaCcpID09IFwidHJ1ZVwiKVxyXG5jb25zb2xlLmxvZyBcImxhdW5jaE9wZW46ICN7bGF1bmNoT3Blbn1cIlxyXG5cclxub3Bpbmlvbk9yZGVyID0gW11cclxuZm9yIG8gaW4gY29uc3RhbnRzLm9waW5pb25PcmRlclxyXG4gIG9waW5pb25PcmRlci5wdXNoIG9cclxub3Bpbmlvbk9yZGVyLnB1c2goJ25vbmUnKVxyXG5cclxucmFuZG9tU3RyaW5nID0gLT5cclxuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSlcclxuXHJcbm5vdyA9IC0+XHJcbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXHJcblxyXG5wYWdlRXBvY2ggPSBub3coKVxyXG5cclxucXMgPSAobmFtZSkgLT5cclxuICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxyXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxyXG4gIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJylcclxuICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xyXG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcclxuXHJcbmZhZGVJbiA9IChlbGVtLCBtcykgLT5cclxuICBpZiBub3QgZWxlbT9cclxuICAgIHJldHVyblxyXG5cclxuICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCJcclxuICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIlxyXG5cclxuICBpZiBtcz8gYW5kIG1zID4gMFxyXG4gICAgb3BhY2l0eSA9IDBcclxuICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwgLT5cclxuICAgICAgb3BhY2l0eSArPSA1MCAvIG1zXHJcbiAgICAgIGlmIG9wYWNpdHkgPj0gMVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXHJcbiAgICAgICAgb3BhY2l0eSA9IDFcclxuXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAxXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0xKVwiXHJcblxyXG5mYWRlT3V0ID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMVxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5IC09IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA8PSAwXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMFxyXG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG4gICAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5XHJcbiAgICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PVwiICsgb3BhY2l0eSAqIDEwMCArIFwiKVwiXHJcbiAgICAsIDUwXHJcbiAgZWxzZVxyXG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gMFxyXG4gICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9MClcIlxyXG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHJcbnNob3dXYXRjaEZvcm0gPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nhc3RidXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikuZm9jdXMoKVxyXG4gIGxhdW5jaE9wZW4gPSB0cnVlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICd0cnVlJylcclxuXHJcbnNob3dXYXRjaExpbmsgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2xpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGxhdW5jaE9wZW4gPSBmYWxzZVxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAnZmFsc2UnKVxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbm9uSW5pdFN1Y2Nlc3MgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcclxuICBjYXN0QXZhaWxhYmxlID0gdHJ1ZVxyXG5cclxub25FcnJvciA9IChtZXNzYWdlKSAtPlxyXG5cclxuc2Vzc2lvbkxpc3RlbmVyID0gKGUpIC0+XHJcbiAgY2FzdFNlc3Npb24gPSBlXHJcblxyXG5zZXNzaW9uVXBkYXRlTGlzdGVuZXIgPSAoaXNBbGl2ZSkgLT5cclxuICBpZiBub3QgaXNBbGl2ZVxyXG4gICAgY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5wcmVwYXJlQ2FzdCA9IC0+XHJcbiAgaWYgbm90IGNocm9tZS5jYXN0IG9yIG5vdCBjaHJvbWUuY2FzdC5pc0F2YWlsYWJsZVxyXG4gICAgaWYgbm93KCkgPCAocGFnZUVwb2NoICsgMTApICMgZ2l2ZSB1cCBhZnRlciAxMCBzZWNvbmRzXHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxyXG4gIGFwaUNvbmZpZyA9IG5ldyBjaHJvbWUuY2FzdC5BcGlDb25maWcgc2Vzc2lvblJlcXVlc3QsIHNlc3Npb25MaXN0ZW5lciwgLT5cclxuICBjaHJvbWUuY2FzdC5pbml0aWFsaXplKGFwaUNvbmZpZywgb25Jbml0U3VjY2Vzcywgb25FcnJvcilcclxuXHJcbmNhbGNTaGFyZVVSTCA9IChtaXJyb3IpIC0+XHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBpZiBtaXJyb3JcclxuICAgIHBhcmFtcy5zZXQoXCJtaXJyb3JcIiwgMSlcclxuICAgIHBhcmFtcy5kZWxldGUoXCJmaWx0ZXJzXCIpXHJcbiAgZWxzZVxyXG4gICAgcGFyYW1zLmRlbGV0ZShcInNvbG9cIilcclxuICAgIHBhcmFtcy5zZXQoXCJmaWx0ZXJzXCIsIHBhcmFtcy5nZXQoXCJmaWx0ZXJzXCIpLnRyaW0oKSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBpZiBwYXJhbXMuZ2V0KFwibWlycm9yXCIpP1xyXG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3NvbG8kLywgXCJcIilcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJ3YXRjaD9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxyXG4gICAgY2FzdFNlc3Npb24gPSBlXHJcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXHJcbiAgLCBvbkVycm9yXHJcblxyXG4jIGF1dG9wbGF5IHZpZGVvXHJcbm9uUGxheWVyUmVhZHkgPSAoZXZlbnQpIC0+XHJcbiAgZXZlbnQudGFyZ2V0LnBsYXlWaWRlbygpXHJcbiAgc3RhcnRIZXJlKClcclxuXHJcbiMgd2hlbiB2aWRlbyBlbmRzXHJcbm9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpIC0+XHJcbiAgaWYgZW5kZWRUaW1lcj9cclxuICAgIGNsZWFyVGltZW91dChlbmRlZFRpbWVyKVxyXG4gICAgZW5kZWRUaW1lciA9IG51bGxcclxuXHJcbiAgaWYgZXZlbnQuZGF0YSA9PSAwXHJcbiAgICBjb25zb2xlLmxvZyBcIkVOREVEXCJcclxuICAgIGVuZGVkVGltZXIgPSBzZXRUaW1lb3V0KCAtPlxyXG4gICAgICBwbGF5aW5nID0gZmFsc2VcclxuICAgICwgMjAwMClcclxuXHJcbmNhbGNMYWJlbCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJzb2xvTGFiZWxzKDEpOiBcIiwgc29sb0xhYmVsc1xyXG4gIGlmIG5vdCBzb2xvTGFiZWxzP1xyXG4gICAgc29sb0xhYmVscyA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9sYWJlbHNcIilcclxuICBjb21wYW55ID0gbnVsbFxyXG4gIGlmIHNvbG9MYWJlbHM/XHJcbiAgICBjb21wYW55ID0gc29sb0xhYmVsc1twa3Qubmlja25hbWVdXHJcbiAgaWYgbm90IGNvbXBhbnk/XHJcbiAgICBjb21wYW55ID0gcGt0Lm5pY2tuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcGt0Lm5pY2tuYW1lLnNsaWNlKDEpXHJcbiAgICBjb21wYW55ICs9IFwiIFJlY29yZHNcIlxyXG4gIHJldHVybiBjb21wYW55XHJcblxyXG5zaG93SW5mbyA9IChwa3QpIC0+XHJcbiAgb3ZlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJcIilcclxuICBvdmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICBmb3IgdCBpbiBvdmVyVGltZXJzXHJcbiAgICBjbGVhclRpbWVvdXQodClcclxuICBvdmVyVGltZXJzID0gW11cclxuXHJcbiAgYXJ0aXN0ID0gcGt0LmFydGlzdFxyXG4gIGFydGlzdCA9IGFydGlzdC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL1xccyskLywgXCJcIilcclxuICB0aXRsZSA9IHBrdC50aXRsZVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXlxccysvLCBcIlwiKVxyXG4gIHRpdGxlID0gdGl0bGUucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gIGh0bWwgPSBcIiN7YXJ0aXN0fVxcbiYjeDIwMUM7I3t0aXRsZX0mI3gyMDFEO1wiXHJcbiAgaWYgc29sb0lEP1xyXG4gICAgY29tcGFueSA9IGF3YWl0IGNhbGNMYWJlbChwa3QpXHJcbiAgICBodG1sICs9IFwiXFxuI3tjb21wYW55fVwiXHJcbiAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5NaXJyb3IgTW9kZVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGh0bWwgKz0gXCJcXG5IZXJlIE1vZGVcIlxyXG4gIGVsc2VcclxuICAgIGh0bWwgKz0gXCJcXG4je3BrdC5jb21wYW55fVwiXHJcbiAgICBmZWVsaW5ncyA9IFtdXHJcbiAgICBmb3IgbyBpbiBvcGluaW9uT3JkZXJcclxuICAgICAgaWYgcGt0Lm9waW5pb25zW29dP1xyXG4gICAgICAgIGZlZWxpbmdzLnB1c2ggb1xyXG4gICAgaWYgZmVlbGluZ3MubGVuZ3RoID09IDBcclxuICAgICAgaHRtbCArPSBcIlxcbk5vIE9waW5pb25zXCJcclxuICAgIGVsc2VcclxuICAgICAgZm9yIGZlZWxpbmcgaW4gZmVlbGluZ3NcclxuICAgICAgICBsaXN0ID0gcGt0Lm9waW5pb25zW2ZlZWxpbmddXHJcbiAgICAgICAgbGlzdC5zb3J0KClcclxuICAgICAgICBodG1sICs9IFwiXFxuI3tmZWVsaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZmVlbGluZy5zbGljZSgxKX06ICN7bGlzdC5qb2luKCcsICcpfVwiXHJcbiAgb3ZlckVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuICBvdmVyVGltZXJzLnB1c2ggc2V0VGltZW91dCAtPlxyXG4gICAgZmFkZUluKG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMzAwMFxyXG4gIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICBmYWRlT3V0KG92ZXJFbGVtZW50LCAxMDAwKVxyXG4gICwgMTUwMDBcclxuXHJcbnBsYXkgPSAocGt0LCBpZCwgc3RhcnRTZWNvbmRzID0gbnVsbCwgZW5kU2Vjb25kcyA9IG51bGwpIC0+XHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIHJldHVyblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWluZzogI3tpZH1cIlxyXG4gIG9wdHMgPSB7XHJcbiAgICB2aWRlb0lkOiBpZFxyXG4gIH1cclxuICBpZiBzdGFydFNlY29uZHM/IGFuZCAoc3RhcnRTZWNvbmRzID49IDApXHJcbiAgICBvcHRzLnN0YXJ0U2Vjb25kcyA9IHN0YXJ0U2Vjb25kc1xyXG4gIGlmIGVuZFNlY29uZHM/IGFuZCAoZW5kU2Vjb25kcyA+PSAxKVxyXG4gICAgb3B0cy5lbmRTZWNvbmRzID0gZW5kU2Vjb25kc1xyXG4gIHBsYXllci5sb2FkVmlkZW9CeUlkKG9wdHMpXHJcbiAgcGxheWluZyA9IHRydWVcclxuXHJcbiAgc2hvd0luZm8ocGt0KVxyXG5cclxuc29sb0luZm9Ccm9hZGNhc3QgPSAtPlxyXG4gIGlmIHNvY2tldD8gYW5kIHNvbG9JRD8gYW5kIHNvbG9WaWRlbz8gYW5kIG5vdCBzb2xvTWlycm9yXHJcbiAgICBuZXh0VmlkZW8gPSBudWxsXHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID4gMFxyXG4gICAgICBuZXh0VmlkZW8gPSBzb2xvUXVldWVbMF1cclxuICAgIGluZm8gPVxyXG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cclxuICAgICAgbmV4dDogbmV4dFZpZGVvXHJcbiAgICAgIGluZGV4OiBzb2xvQ291bnQgLSBzb2xvUXVldWUubGVuZ3RoXHJcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cclxuICAgIHBrdCA9IHtcclxuICAgICAgaWQ6IHNvbG9JRFxyXG4gICAgICBjbWQ6ICdpbmZvJ1xyXG4gICAgICBpbmZvOiBpbmZvXHJcbiAgICB9XHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycsIHBrdFxyXG4gICAgc29sb0NvbW1hbmQocGt0KVxyXG5cclxuc29sb1BsYXkgPSAocmVzdGFydCA9IGZhbHNlKSAtPlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICByZXR1cm5cclxuICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCByZXN0YXJ0IG9yIG5vdCBzb2xvVmlkZW8/XHJcbiAgICBpZiBzb2xvUXVldWUubGVuZ3RoID09IDBcclxuICAgICAgY29uc29sZS5sb2cgXCJSZXNodWZmbGluZy4uLlwiXHJcbiAgICAgIHNvbG9RdWV1ZSA9IFsgc29sb1Vuc2h1ZmZsZWRbMF0gXVxyXG4gICAgICBmb3IgaSwgaW5kZXggaW4gc29sb1Vuc2h1ZmZsZWRcclxuICAgICAgICBjb250aW51ZSBpZiBpbmRleCA9PSAwXHJcbiAgICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpbmRleCArIDEpKVxyXG4gICAgICAgIHNvbG9RdWV1ZS5wdXNoKHNvbG9RdWV1ZVtqXSlcclxuICAgICAgICBzb2xvUXVldWVbal0gPSBpXHJcblxyXG4gICAgc29sb1ZpZGVvID0gc29sb1F1ZXVlLnNoaWZ0KClcclxuXHJcbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXHJcblxyXG4gICMgZGVidWdcclxuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXHJcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcclxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXHJcblxyXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuXHJcbiAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuc29sb1RpY2sgPSAtPlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzb2xvUGxheSgpXHJcbiAgICByZXR1cm5cclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbnN0YXJ0SGVyZSA9IC0+XHJcbiAgc2hvd1dhdGNoTGluaygpXHJcblxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29sb3ZpZGVvY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRlcicpLmNsYXNzTGlzdC5hZGQoJ2ZhZGV5JylcclxuICAgIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XHJcbiAgICAgIHdpZHRoOiAnMTAwJSdcclxuICAgICAgaGVpZ2h0OiAnMTAwJSdcclxuICAgICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgICBwbGF5ZXJWYXJzOiB7ICdhdXRvcGxheSc6IDEsICdlbmFibGVqc2FwaSc6IDEsICdjb250cm9scyc6IDEgfVxyXG4gICAgICBldmVudHM6IHtcclxuICAgICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XHJcbiAgICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxyXG4gIHNvbG9VbnNodWZmbGVkID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nKVxyXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cclxuICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXHJcbiAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXHJcbiAgICByZXR1cm5cclxuICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcclxuXHJcbiAgaWYgc29sb1RpY2tUaW1lb3V0P1xyXG4gICAgY2xlYXJJbnRlcnZhbChzb2xvVGlja1RpbWVvdXQpXHJcbiAgc29sb1RpY2tUaW1lb3V0ID0gc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXHJcbiAgc29sb1F1ZXVlID0gW11cclxuICBzb2xvUGxheSgpXHJcbiAgaWYgc29sb01pcnJvciBhbmQgc29sb1ZpZGVvXHJcbiAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG5jYWxjUGVybWFsaW5rID0gLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICByZXR1cm4gbXR2VVJMXHJcblxyXG5nZW5lcmF0ZVBlcm1hbGluayA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJnZW5lcmF0ZVBlcm1hbGluaygpXCJcclxuICB3aW5kb3cubG9jYXRpb24gPSBjYWxjUGVybWFsaW5rKClcclxuXHJcbmZvcm1DaGFuZ2VkID0gLT5cclxuICBjb25zb2xlLmxvZyBcIkZvcm0gY2hhbmdlZCFcIlxyXG4gIGhpc3RvcnkucmVwbGFjZVN0YXRlKCdoZXJlJywgJycsIGNhbGNQZXJtYWxpbmsoKSlcclxuXHJcbnNvbG9Ta2lwID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3NraXAnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KClcclxuXHJcbnNvbG9SZXN0YXJ0ID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3Jlc3RhcnQnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KHRydWUpXHJcblxyXG5zb2xvUGF1c2UgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAncGF1c2UnXHJcbiAgfVxyXG4gIHBhdXNlSW50ZXJuYWwoKVxyXG5cclxucmVuZGVySW5mbyA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICB0YWdzU3RyaW5nID0gT2JqZWN0LmtleXMoc29sb0luZm8uY3VycmVudC50YWdzKS5zb3J0KCkuam9pbignLCAnKVxyXG4gIGNvbXBhbnkgPSBhd2FpdCBjYWxjTGFiZWwoc29sb0luZm8uY3VycmVudClcclxuXHJcbiAgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+VHJhY2sgI3tzb2xvSW5mby5pbmRleH0gLyAje3NvbG9JbmZvLmNvdW50fTwvZGl2PlwiXHJcbiAgIyBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2hlYWRpbmdcXFwiPkN1cnJlbnQ6IFs8c3BhbiBjbGFzcz1cXFwieW91dHViZWlkXFxcIj4je3NvbG9JbmZvLmN1cnJlbnQuaWR9PC9zcGFuPl08L2Rpdj5cIlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RodW1iXFxcIj48YSBocmVmPVxcXCJodHRwczovL3lvdXR1LmJlLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHNvbG9JbmZvLmN1cnJlbnQuaWQpfVxcXCI+PGltZyB3aWR0aD0zMjAgaGVpZ2h0PTE4MCBzcmM9XFxcIiN7c29sb0luZm8uY3VycmVudC50aHVtYn1cXFwiPjwvYT48L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY3VycmVudCBpbmZvYXJ0aXN0XFxcIj4je3NvbG9JbmZvLmN1cnJlbnQuYXJ0aXN0fTwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIiN7c29sb0luZm8uY3VycmVudC50aXRsZX1cXFwiPC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2xhYmVsXFxcIj4je2NvbXBhbnl9PC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RhZ3NcXFwiPiZuYnNwOyN7dGFnc1N0cmluZ30mbmJzcDs8L2Rpdj5cIlxyXG4gIGlmIHNvbG9JbmZvLm5leHQ/XHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je3NvbG9JbmZvLm5leHQuYXJ0aXN0fTwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tzb2xvSW5mby5uZXh0LnRpdGxlfVxcXCI8L3NwYW4+XCJcclxuICBlbHNlXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9yZXNodWZmbGUgbmV4dHZpZGVvXFxcIj4oLi4uUmVzaHVmZmxlLi4uKTwvc3Bhbj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuY2xpcGJvYXJkRWRpdCA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgc2V0VGltZW91dCAtPlxyXG4gICAgcmVuZGVyQ2xpcGJvYXJkKClcclxuICAsIDIwMDBcclxuXHJcbnJlbmRlckNsaXBib2FyZCA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvXFxcIiBkYXRhLWNsaXBib2FyZC10ZXh0PVxcXCIjbXR2IGVkaXQgI3tzb2xvSW5mby5jdXJyZW50LmlkfSBcXFwiIG9uY2xpY2s9XFxcImNsaXBib2FyZEVkaXQoKTsgcmV0dXJuIGZhbHNlXFxcIj5FZGl0PC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBib2FyZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBuZXcgQ2xpcGJvYXJkKCcuY2J1dHRvJylcclxuXHJcbmNsaXBib2FyZE1pcnJvciA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcIm1idXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYm1pcnJvcicpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJDbGlwYm9hcmRNaXJyb3IoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQ2xpcGJvYXJkTWlycm9yID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJtYnV0dG9cXFwib25jbGljaz1cXFwiY2xpcGJvYXJkTWlycm9yKCk7IHJldHVybiBmYWxzZVxcXCI+TWlycm9yPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIG5ldyBDbGlwYm9hcmQgJy5tYnV0dG8nLCB7XHJcbiAgICB0ZXh0OiAtPlxyXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKHRydWUpXHJcbiAgfVxyXG5cclxuc2hhcmVDbGlwYm9hcmQgPSAobWlycm9yKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZWNvcGllZFxcXCI+Q29waWVkIHRvIGNsaXBib2FyZDo8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNTaGFyZVVSTChtaXJyb3IpfTwvZGl2PlxyXG4gIFwiXCJcIlxyXG5cclxuc2hvd0xpc3QgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJQbGVhc2Ugd2FpdC4uLlwiXHJcblxyXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWU7XHJcbiAgbGlzdCA9IGF3YWl0IGZpbHRlcnMuZ2VuZXJhdGVMaXN0KGZpbHRlclN0cmluZywgdHJ1ZSlcclxuICBpZiBub3QgbGlzdD9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJFcnJvci4gU29ycnkuXCJcclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJsaXN0Y29udGFpbmVyXFxcIj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj4je2xpc3QubGVuZ3RofSB2aWRlb3M6PC9kaXY+XCJcclxuICBmb3IgZSBpbiBsaXN0XHJcbiAgICBodG1sICs9IFwiPGRpdj5cIlxyXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvYXJ0aXN0IG5leHR2aWRlb1xcXCI+I3tlLmFydGlzdH08L3NwYW4+XCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3RpdGxlIG5leHR2aWRlb1xcXCI+XFxcIiN7ZS50aXRsZX1cXFwiPC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPC9kaXY+XFxuXCJcclxuXHJcbiAgaHRtbCArPSBcIjwvZGl2PlwiXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuY2xlYXJPcGluaW9uID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBcIlwiXHJcblxyXG51cGRhdGVPcGluaW9uID0gKHBrdCkgLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50PyBvciBub3QgKHBrdC5pZCA9PSBzb2xvSW5mby5jdXJyZW50LmlkKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIlwiXHJcbiAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyIGJ5IC0xXHJcbiAgICBjYXBvID0gby5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG8uc2xpY2UoMSlcclxuICAgIGNsYXNzZXMgPSBcIm9idXR0b1wiXHJcbiAgICBpZiBvID09IHBrdC5vcGluaW9uXHJcbiAgICAgIGNsYXNzZXMgKz0gXCIgY2hvc2VuXCJcclxuICAgIGh0bWwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVwiI3tjbGFzc2VzfVwiIG9uY2xpY2s9XCJzZXRPcGluaW9uKCcje299Jyk7IHJldHVybiBmYWxzZTtcIj4je2NhcG99PC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuc2V0T3BpbmlvbiA9IChvcGluaW9uKSAtPlxyXG4gIGlmIG5vdCBkaXNjb3JkVG9rZW4/IG9yIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50LmlkP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogc29sb0luZm8uY3VycmVudC5pZCwgc2V0OiBvcGluaW9uIH1cclxuXHJcbnBhdXNlSW50ZXJuYWwgPSAtPlxyXG4gIGlmIHBsYXllcj9cclxuICAgIGlmIHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09IDJcclxuICAgICAgcGxheWVyLnBsYXlWaWRlbygpXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllci5wYXVzZVZpZGVvKClcclxuXHJcbnNvbG9Db21tYW5kID0gKHBrdCkgLT5cclxuICBpZiBwa3QuaWQgIT0gc29sb0lEXHJcbiAgICByZXR1cm5cclxuICBjb25zb2xlLmxvZyBcInNvbG9Db21tYW5kOiBcIiwgcGt0XHJcbiAgc3dpdGNoIHBrdC5jbWRcclxuICAgIHdoZW4gJ3NraXAnXHJcbiAgICAgIHNvbG9QbGF5KClcclxuICAgIHdoZW4gJ3Jlc3RhcnQnXHJcbiAgICAgIHNvbG9QbGF5KHRydWUpXHJcbiAgICB3aGVuICdwYXVzZSdcclxuICAgICAgcGF1c2VJbnRlcm5hbCgpXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBwa3QuaW5mbz9cclxuICAgICAgICBjb25zb2xlLmxvZyBcIk5FVyBJTkZPITogXCIsIHBrdC5pbmZvXHJcbiAgICAgICAgc29sb0luZm8gPSBwa3QuaW5mb1xyXG4gICAgICAgIGF3YWl0IHJlbmRlckluZm8oKVxyXG4gICAgICAgIHJlbmRlckNsaXBib2FyZCgpXHJcbiAgICAgICAgcmVuZGVyQ2xpcGJvYXJkTWlycm9yKClcclxuICAgICAgICBpZiBzb2xvTWlycm9yXHJcbiAgICAgICAgICBzb2xvVmlkZW8gPSBwa3QuaW5mby5jdXJyZW50XHJcbiAgICAgICAgICBpZiBzb2xvVmlkZW8/XHJcbiAgICAgICAgICAgIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJubyBwbGF5ZXIgeWV0XCJcclxuICAgICAgICAgICAgcGxheShzb2xvVmlkZW8sIHNvbG9WaWRlby5pZCwgc29sb1ZpZGVvLnN0YXJ0LCBzb2xvVmlkZW8uZW5kKVxyXG4gICAgICAgIGNsZWFyT3BpbmlvbigpXHJcbiAgICAgICAgaWYgZGlzY29yZFRva2VuPyBhbmQgc29sb0luZm8uY3VycmVudD8gYW5kIHNvbG9JbmZvLmN1cnJlbnQuaWQ/XHJcbiAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHNvbG9JbmZvLmN1cnJlbnQuaWQgfVxyXG5cclxudXBkYXRlU29sb0lEID0gKG5ld1NvbG9JRCkgLT5cclxuICBzb2xvSUQgPSBuZXdTb2xvSURcclxuICBpZiBub3Qgc29sb0lEP1xyXG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBcIkVSUk9SOiBubyBzb2xvIHF1ZXJ5IHBhcmFtZXRlclwiXHJcbiAgICByZXR1cm5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNvbG9pZFwiKS52YWx1ZSA9IHNvbG9JRFxyXG4gIGlmIHNvY2tldD9cclxuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cclxuXHJcbm5ld1NvbG9JRCA9IC0+XHJcbiAgdXBkYXRlU29sb0lEKHJhbmRvbVN0cmluZygpKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlycm9yXCIpLmNoZWNrZWQgPSBmYWxzZVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzZWN0aW9uJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlycm9ybm90ZScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBnZW5lcmF0ZVBlcm1hbGluaygpXHJcblxyXG5sb2FkUGxheWxpc3QgPSAtPlxyXG4gIGNvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkbmFtZVwiKVxyXG4gIHNlbGVjdGVkID0gY29tYm8ub3B0aW9uc1tjb21iby5zZWxlY3RlZEluZGV4XVxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkLnZhbHVlXHJcbiAgaWYgbm90IHNlbGVjdGVkTmFtZT9cclxuICAgIHJldHVyblxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkTmFtZS50cmltKClcclxuICBpZiBzZWxlY3RlZE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9hZCAnI3tzZWxlY3RlZE5hbWV9Jz9cIilcclxuICAgIHJldHVyblxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcImxvYWRcIlxyXG4gICAgbG9hZG5hbWU6IHNlbGVjdGVkTmFtZVxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5kZWxldGVQbGF5bGlzdCA9IC0+XHJcbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcclxuICBpZiBub3Qgc2VsZWN0ZWROYW1lP1xyXG4gICAgcmV0dXJuXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWROYW1lLnRyaW0oKVxyXG4gIGlmIHNlbGVjdGVkTmFtZS5sZW5ndGggPCAxXHJcbiAgICByZXR1cm5cclxuICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2FkICcje3NlbGVjdGVkTmFtZX0nP1wiKVxyXG4gICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwiZGVsXCJcclxuICAgIGRlbG5hbWU6IHNlbGVjdGVkTmFtZVxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5zYXZlUGxheWxpc3QgPSAtPlxyXG4gIG91dHB1dE5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlXHJcbiAgb3V0cHV0TmFtZSA9IG91dHB1dE5hbWUudHJpbSgpXHJcbiAgb3V0cHV0RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZVxyXG4gIGlmIG91dHB1dE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2F2ZSAnI3tvdXRwdXROYW1lfSc/XCIpXHJcbiAgICByZXR1cm5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJzYXZlXCJcclxuICAgIHNhdmVuYW1lOiBvdXRwdXROYW1lXHJcbiAgICBmaWx0ZXJzOiBvdXRwdXRGaWx0ZXJzXHJcbiAgfVxyXG4gIHNvY2tldC5lbWl0ICd1c2VycGxheWxpc3QnLCBwbGF5bGlzdFBheWxvYWRcclxuXHJcbnJlcXVlc3RVc2VyUGxheWxpc3RzID0gLT5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJsaXN0XCJcclxuICB9XHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxucmVjZWl2ZVVzZXJQbGF5bGlzdCA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJyZWNlaXZlVXNlclBsYXlsaXN0XCIsIHBrdFxyXG4gIGlmIHBrdC5saXN0P1xyXG4gICAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgICBjb21iby5vcHRpb25zLmxlbmd0aCA9IDBcclxuICAgIHBrdC5saXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIGEudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIudG9Mb3dlckNhc2UoKSlcclxuICAgIGZvciBuYW1lIGluIHBrdC5saXN0XHJcbiAgICAgIGlzU2VsZWN0ZWQgPSAobmFtZSA9PSBwa3Quc2VsZWN0ZWQpXHJcbiAgICAgIGNvbWJvLm9wdGlvbnNbY29tYm8ub3B0aW9ucy5sZW5ndGhdID0gbmV3IE9wdGlvbihuYW1lLCBuYW1lLCBmYWxzZSwgaXNTZWxlY3RlZClcclxuICAgIGlmIHBrdC5saXN0Lmxlbmd0aCA9PSAwXHJcbiAgICAgIGNvbWJvLm9wdGlvbnNbY29tYm8ub3B0aW9ucy5sZW5ndGhdID0gbmV3IE9wdGlvbihcIk5vbmVcIiwgXCJcIilcclxuICBpZiBwa3QubG9hZG5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlID0gcGt0LmxvYWRuYW1lXHJcbiAgaWYgcGt0LmZpbHRlcnM/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcnNcIikudmFsdWUgPSBwa3QuZmlsdGVyc1xyXG5cclxubG9nb3V0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiTG9nZ2luZyBvdXQuLi5cIlxyXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXHJcbiAgZGlzY29yZFRva2VuID0gbnVsbFxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICAgIHJlcXVlc3RVc2VyUGxheWxpc3RzKClcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luaGludFwiPihMb2dpbiBvbiA8YSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiPkRhc2hib2FyZDwvYT4pPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlYXJlYVwiKT8uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGlmIHlvdXR1YmVSZWFkeVxyXG4gICAgcmV0dXJuXHJcbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICBmaW5pc2hJbml0KClcclxuICAsIDBcclxuXHJcbmZpbmlzaEluaXQgPSAtPlxyXG4gIHdpbmRvdy5jbGlwYm9hcmRFZGl0ID0gY2xpcGJvYXJkRWRpdFxyXG4gIHdpbmRvdy5jbGlwYm9hcmRNaXJyb3IgPSBjbGlwYm9hcmRNaXJyb3JcclxuICB3aW5kb3cuZGVsZXRlUGxheWxpc3QgPSBkZWxldGVQbGF5bGlzdFxyXG4gIHdpbmRvdy5mb3JtQ2hhbmdlZCA9IGZvcm1DaGFuZ2VkXHJcbiAgd2luZG93LmxvYWRQbGF5bGlzdCA9IGxvYWRQbGF5bGlzdFxyXG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcclxuICB3aW5kb3cubmV3U29sb0lEID0gbmV3U29sb0lEXHJcbiAgd2luZG93LnNhdmVQbGF5bGlzdCA9IHNhdmVQbGF5bGlzdFxyXG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxyXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXHJcbiAgd2luZG93LnNob3dMaXN0ID0gc2hvd0xpc3RcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc29sb1BhdXNlID0gc29sb1BhdXNlXHJcbiAgd2luZG93LnNvbG9SZXN0YXJ0ID0gc29sb1Jlc3RhcnRcclxuICB3aW5kb3cuc29sb1NraXAgPSBzb2xvU2tpcFxyXG4gIHdpbmRvdy5zdGFydENhc3QgPSBzdGFydENhc3RcclxuICB3aW5kb3cuc3RhcnRIZXJlID0gc3RhcnRIZXJlXHJcblxyXG4gIHVwZGF0ZVNvbG9JRChxcygnc29sbycpKVxyXG5cclxuICBxc0ZpbHRlcnMgPSBxcygnZmlsdGVycycpXHJcbiAgaWYgcXNGaWx0ZXJzP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gcXNGaWx0ZXJzXHJcblxyXG4gIHNvbG9NaXJyb3IgPSBxcygnbWlycm9yJyk/XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaXJyb3JcIikuY2hlY2tlZCA9IHNvbG9NaXJyb3JcclxuICBpZiBzb2xvTWlycm9yXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyc2VjdGlvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXJyb3Jub3RlJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgICAgIHNlbmRJZGVudGl0eSgpXHJcblxyXG4gIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XHJcbiAgICBzb2xvQ29tbWFuZChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxyXG4gICAgcmVjZWl2ZUlkZW50aXR5KHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICdvcGluaW9uJywgKHBrdCkgLT5cclxuICAgIHVwZGF0ZU9waW5pb24ocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ3VzZXJwbGF5bGlzdCcsIChwa3QpIC0+XHJcbiAgICByZWNlaXZlVXNlclBsYXlsaXN0KHBrdClcclxuXHJcbiAgcHJlcGFyZUNhc3QoKVxyXG5cclxuICBuZXcgQ2xpcGJvYXJkICcuc2hhcmUnLCB7XHJcbiAgICB0ZXh0OiAodHJpZ2dlcikgLT5cclxuICAgICAgbWlycm9yID0gZmFsc2VcclxuICAgICAgaWYgdHJpZ2dlci52YWx1ZS5tYXRjaCgvTWlycm9yL2kpXHJcbiAgICAgICAgbWlycm9yID0gdHJ1ZVxyXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKG1pcnJvcilcclxuICB9XHJcblxyXG4gIGlmIGxhdW5jaE9wZW5cclxuICAgIHNob3dXYXRjaEZvcm0oKVxyXG4gIGVsc2VcclxuICAgIHNob3dXYXRjaExpbmsoKVxyXG5cclxuXHJcbnNldFRpbWVvdXQgLT5cclxuICAjIHNvbWVob3cgd2UgbWlzc2VkIHRoaXMgZXZlbnQsIGp1c3Qga2ljayBpdCBtYW51YWxseVxyXG4gIGlmIG5vdCB5b3V0dWJlUmVhZHlcclxuICAgIGNvbnNvbGUubG9nIFwia2lja2luZyBZb3V0dWJlLi4uXCJcclxuICAgIHdpbmRvdy5vbllvdVR1YmVQbGF5ZXJBUElSZWFkeSgpXHJcbiwgMzAwMFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgb3BpbmlvbnM6XHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcbiAgICBtZWg6IHRydWVcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgZ29vZE9waW5pb25zOiAjIGRvbid0IHNraXAgdGhlc2VcclxuICAgIGxvdmU6IHRydWVcclxuICAgIGxpa2U6IHRydWVcclxuXHJcbiAgd2Vha09waW5pb25zOiAjIHNraXAgdGhlc2UgaWYgd2UgYWxsIGFncmVlXHJcbiAgICBtZWg6IHRydWVcclxuXHJcbiAgYmFkT3BpbmlvbnM6ICMgc2tpcCB0aGVzZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBvcGluaW9uT3JkZXI6IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcbiIsImZpbHRlckRhdGFiYXNlID0gbnVsbFxyXG5maWx0ZXJPcGluaW9ucyA9IHt9XHJcblxyXG5maWx0ZXJTZXJ2ZXJPcGluaW9ucyA9IG51bGxcclxuZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IG51bGxcclxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFyc2VEdXJhdGlvbiA9IChzKSAtPlxyXG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxyXG5cclxuc2V0U2VydmVyRGF0YWJhc2VzID0gKGRiLCBvcGluaW9ucywgZ2V0VXNlckZyb21OaWNrbmFtZSkgLT5cclxuICBmaWx0ZXJEYXRhYmFzZSA9IGRiXHJcbiAgZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBvcGluaW9uc1xyXG4gIGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBnZXRVc2VyRnJvbU5pY2tuYW1lXHJcblxyXG5nZXREYXRhID0gKHVybCkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcclxuICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XHJcbiAgICAgICAgaWYgKEByZWFkeVN0YXRlID09IDQpIGFuZCAoQHN0YXR1cyA9PSAyMDApXHJcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XHJcbiAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICBlbnRyaWVzID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICAgIHJlc29sdmUobnVsbClcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxyXG4gICAgeGh0dHAuc2VuZCgpXHJcblxyXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XHJcbiAgaWYgbm90IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1xyXG4gICAgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0gPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vb3BpbmlvbnM/dXNlcj0je2VuY29kZVVSSUNvbXBvbmVudChmaWx0ZXJVc2VyKX1cIilcclxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgZ2V0IHVzZXIgb3BpbmlvbnMgZm9yICN7ZmlsdGVyVXNlcn1cIilcclxuXHJcbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxyXG4gIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGlmIGZpbHRlclN0cmluZz8gYW5kIChmaWx0ZXJTdHJpbmcubGVuZ3RoID4gMClcclxuICAgIHNvbG9GaWx0ZXJzID0gW11cclxuICAgIHJhd0ZpbHRlcnMgPSBmaWx0ZXJTdHJpbmcuc3BsaXQoL1xccj9cXG4vKVxyXG4gICAgZm9yIGZpbHRlciBpbiByYXdGaWx0ZXJzXHJcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcclxuICAgICAgaWYgZmlsdGVyLmxlbmd0aCA+IDBcclxuICAgICAgICBzb2xvRmlsdGVycy5wdXNoIGZpbHRlclxyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcclxuICAgICAgIyBObyBmaWx0ZXJzXHJcbiAgICAgIHNvbG9GaWx0ZXJzID0gbnVsbFxyXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcclxuICBpZiBmaWx0ZXJEYXRhYmFzZT9cclxuICAgIGNvbnNvbGUubG9nIFwiVXNpbmcgY2FjaGVkIGRhdGFiYXNlLlwiXHJcbiAgZWxzZVxyXG4gICAgY29uc29sZS5sb2cgXCJEb3dubG9hZGluZyBkYXRhYmFzZS4uLlwiXHJcbiAgICBmaWx0ZXJEYXRhYmFzZSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9wbGF5bGlzdFwiKVxyXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG5cclxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXHJcbiAgaWYgc29sb0ZpbHRlcnM/XHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcclxuICAgICAgZS5za2lwcGVkID0gZmFsc2VcclxuXHJcbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxyXG4gICAgZm9yIGZpbHRlciBpbiBzb2xvRmlsdGVyc1xyXG4gICAgICBwaWVjZXMgPSBmaWx0ZXIuc3BsaXQoLyArLylcclxuXHJcbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxyXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBlbHNlIGlmIHBpZWNlc1swXSA9PSBcImFuZFwiXHJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxyXG4gICAgICAgIG5lZ2F0ZWQgPSAhbmVnYXRlZFxyXG4gICAgICAgIHBpZWNlcy5zaGlmdCgpXHJcbiAgICAgIGlmIHBpZWNlcy5sZW5ndGggPT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHByb3BlcnR5ID09IFwiYWxsb3dlZFwiXHJcbiAgICAgICAgYWxsQWxsb3dlZCA9IGZhbHNlXHJcblxyXG4gICAgICBzdWJzdHJpbmcgPSBwaWVjZXMuc2xpY2UoMSkuam9pbihcIiBcIilcclxuICAgICAgaWRMb29rdXAgPSBudWxsXHJcblxyXG4gICAgICBpZiBtYXRjaGVzID0gcGllY2VzWzBdLm1hdGNoKC9eISguKykkLylcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXHJcblxyXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdLnRvTG93ZXJDYXNlKClcclxuICAgICAgc3dpdGNoIGNvbW1hbmRcclxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYXJ0aXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzKSAhPSAtMVxyXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLm5pY2tuYW1lID09IHNcclxuICAgICAgICB3aGVuICd1bnRhZ2dlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxyXG4gICAgICAgIHdoZW4gJ3RhZydcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXHJcbiAgICAgICAgd2hlbiAncmVjZW50JywgJ3NpbmNlJ1xyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwYXJzaW5nICcje3N1YnN0cmluZ30nXCJcclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICBkdXJhdGlvbkluU2Vjb25kcyA9IHBhcnNlRHVyYXRpb24oc3Vic3RyaW5nKVxyXG4gICAgICAgICAgY2F0Y2ggc29tZUV4Y2VwdGlvblxyXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcclxuICAgICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBwYXJzaW5nIGV4Y2VwdGlvbjogI3tzb21lRXhjZXB0aW9ufVwiXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJEdXJhdGlvbiBbI3tzdWJzdHJpbmd9XSAtICN7ZHVyYXRpb25JblNlY29uZHN9XCJcclxuICAgICAgICAgIHNpbmNlID0gbm93KCkgLSBkdXJhdGlvbkluU2Vjb25kc1xyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcclxuICAgICAgICB3aGVuICdsb3ZlJywgJ2xpa2UnLCAnYmxlaCcsICdoYXRlJ1xyXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IGNvbW1hbmRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnbm9uZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGlmIGZpbHRlclNlcnZlck9waW5pb25zXHJcbiAgICAgICAgICAgIGZpbHRlclVzZXIgPSBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lKGZpbHRlclVzZXIpXHJcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnZnVsbCdcclxuICAgICAgICAgIHN1YnN0cmluZyA9IHN1YnN0cmluZy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XHJcbiAgICAgICAgICAgIGZ1bGwgPSBlLmFydGlzdC50b0xvd2VyQ2FzZSgpICsgXCIgLSBcIiArIGUudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICBmdWxsLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXHJcbiAgICAgICAgICBpZExvb2t1cCA9IHt9XHJcbiAgICAgICAgICBmb3IgaWQgaW4gcGllY2VzLnNsaWNlKDEpXHJcbiAgICAgICAgICAgIGlmIGlkLm1hdGNoKC9eIy8pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgaWRMb29rdXBbaWRdID0gdHJ1ZVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBpZExvb2t1cFtlLmlkXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgc2tpcCB0aGlzIGZpbHRlclxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgIGlmIGlkTG9va3VwP1xyXG4gICAgICAgIGZvciBpZCBvZiBpZExvb2t1cFxyXG4gICAgICAgICAgZSA9IGZpbHRlckRhdGFiYXNlW2lkXVxyXG4gICAgICAgICAgaWYgbm90IGU/XHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICBpc01hdGNoID0gdHJ1ZVxyXG4gICAgICAgICAgaWYgbmVnYXRlZFxyXG4gICAgICAgICAgICBpc01hdGNoID0gIWlzTWF0Y2hcclxuICAgICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgICAgZVtwcm9wZXJ0eV0gPSB0cnVlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgICAgIGlzTWF0Y2ggPSBmaWx0ZXJGdW5jKGUsIHN1YnN0cmluZylcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgaWYgc29ydEJ5QXJ0aXN0XHJcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICByZXR1cm4gMFxyXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIHNldFNlcnZlckRhdGFiYXNlczogc2V0U2VydmVyRGF0YWJhc2VzXHJcbiAgZ2VuZXJhdGVMaXN0OiBnZW5lcmF0ZUxpc3RcclxuIl19
