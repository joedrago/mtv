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
var filterDatabase, generateList, getData;

filterDatabase = null;

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
      pieces = filter.split(/\s+/);
      property = "allowed";
      if (pieces[0] === "skip") {
        property = "skipped";
        pieces.shift();
      }
      if (pieces.length === 0) {
        continue;
      }
      if (property === "allowed") {
        allAllowed = false;
      }
      substring = pieces.slice(1).join(" ");
      negated = false;
      if (matches = pieces[0].match(/^!(.+)$/)) {
        negated = true;
        pieces[0] = matches[1];
      }
      command = pieces[0];
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
            soloFatalError(`Cannot parse duration: ${substring}`);
            return;
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
          await cacheOpinions(filterUser);
          // console.log soloOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = soloOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
          };
          break;
        case 'none':
          filterOpinion = void 0;
          filterUser = substring;
          await cacheOpinions(filterUser);
          // console.log soloOpinions
          filterFunc = function(e, s) {
            var ref;
            return ((ref = soloOpinions[filterUser]) != null ? ref[e.id] : void 0) === filterOpinion;
          };
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
  generateList: generateList
};


},{}],3:[function(require,module,exports){
var Clipboard, DASHCAST_NAMESPACE, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, constants, discordNickname, discordTag, discordToken, filters, generatePermalink, i, init, launchOpen, len, logout, newSoloID, now, o, onError, onInitSuccess, opinionOrder, pageEpoch, prepareCast, qs, randomString, receiveIdentity, ref, renderClipboard, renderInfo, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, showList, showWatchForm, showWatchLink, socket, soloCommand, soloID, soloInfo, soloPause, soloRestart, soloSkip, startCast, updateOpinion, updateSoloID;

constants = require('../constants');

Clipboard = require('clipboard');

filters = require('./filters');

socket = null;

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
for (i = 0, len = ref.length; i < len; i++) {
  o = ref[i];
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

calcShareURL = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.delete("solo");
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

generatePermalink = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  console.log("generatePermalink()");
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  querystring = params.toString();
  baseURL = window.location.href.split('#')[0].split('?')[0];
  mtvURL = baseURL + "?" + querystring;
  console.log(`We're going here: ${mtvURL}`);
  return window.location = mtvURL;
};

soloSkip = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'skip'
  });
};

soloRestart = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'restart'
  });
};

soloPause = function() {
  return socket.emit('solo', {
    id: soloID,
    cmd: 'pause'
  });
};

renderInfo = function() {
  var html, tagsString;
  if ((soloInfo == null) || (soloInfo.current == null)) {
    return;
  }
  tagsString = Object.keys(soloInfo.current.tags).sort().join(', ');
  html = `<div class=\"infocounts\">Track ${soloInfo.index} / ${soloInfo.count}</div>`;
  // html += "<div class=\"infoheading\">Current: [<span class=\"youtubeid\">#{soloInfo.current.id}</span>]</div>"
  html += `<div class=\"infothumb\"><a href=\"https://youtu.be/${encodeURIComponent(soloInfo.current.id)}\"><img width=320 height=180 src=\"${soloInfo.current.thumb}\"></a></div>`;
  html += `<div class=\"infocurrent infoartist\">${soloInfo.current.artist}</div>`;
  html += `<div class=\"infotitle\">\"${soloInfo.current.title}\"</div>`;
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

shareClipboard = function() {
  return document.getElementById('list').innerHTML = `<div class=\"sharecopied\">Copied to clipboard:</div>
<div class=\"shareurl\">${calcShareURL()}</div>`;
};

showList = async function() {
  var e, filterString, html, j, len1, list;
  document.getElementById('list').innerHTML = "Please wait...";
  filterString = document.getElementById('filters').value;
  list = (await filters.generateList(filterString, true));
  if (list == null) {
    document.getElementById('list').innerHTML = "Error. Sorry.";
    return;
  }
  html = "<div class=\"listcontainer\">";
  html += `<div class=\"infocounts\">${list.length} videos:</div>`;
  for (j = 0, len1 = list.length; j < len1; j++) {
    e = list[j];
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
  var capo, classes, html, j;
  if ((soloInfo == null) || (soloInfo.current == null) || !(pkt.id === soloInfo.current.id)) {
    return;
  }
  html = "";
  for (j = opinionOrder.length - 1; j >= 0; j += -1) {
    o = opinionOrder[j];
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

soloCommand = function(pkt) {
  if (pkt.id !== soloID) {
    return;
  }
  console.log("soloCommand: ", pkt);
  switch (pkt.cmd) {
    case 'info':
      if (pkt.info != null) {
        console.log("NEW INFO!: ", pkt.info);
        soloInfo = pkt.info;
        renderInfo();
        renderClipboard();
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
  return generatePermalink();
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
  var discordNicknameString, html, loginLink, redirectURL;
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
  } else {
    discordTag = null;
    discordNickname = null;
    discordToken = null;
    redirectURL = String(window.location).replace(/#.*$/, "") + "oauth";
    loginLink = `https://discord.com/api/oauth2/authorize?client_id=${window.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`;
    html = `<div class="loginhint">(Login on <a href="/" target="_blank">Dashboard</a>)</div>`;
  }
  document.getElementById("identity").innerHTML = html;
  if (typeof lastClicked !== "undefined" && lastClicked !== null) {
    return lastClicked();
  }
};

init = function() {
  var qsFilters;
  window.clipboardEdit = clipboardEdit;
  window.generatePermalink = generatePermalink;
  window.logout = logout;
  window.newSoloID = newSoloID;
  window.setOpinion = setOpinion;
  window.showList = showList;
  window.showWatchForm = showWatchForm;
  window.showWatchLink = showWatchLink;
  window.shareClipboard = shareClipboard;
  window.soloPause = soloPause;
  window.soloRestart = soloRestart;
  window.soloSkip = soloSkip;
  window.startCast = startCast;
  updateSoloID(qs('solo'));
  qsFilters = qs('filters');
  if (qsFilters != null) {
    document.getElementById("filters").value = qsFilters;
  }
  document.getElementById("controls").checked = qs('controls') != null;
  document.getElementById("hidetitles").checked = qs('hidetitles') != null;
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
  prepareCast();
  new Clipboard('.share', {
    text: function() {
      return calcShareURL();
    }
  });
  if (launchOpen) {
    return showWatchForm();
  } else {
    return showWatchLink();
  }
};

window.onload = init;


},{"../constants":4,"./filters":2,"clipboard":1}],4:[function(require,module,exports){
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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwic3JjL2NsaWVudC9maWx0ZXJzLmNvZmZlZSIsInNyYy9jbGllbnQvc29sby5jb2ZmZWUiLCJzcmMvY29uc3RhbnRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QVAsQ0FBVSxTQUFWLEVBQXFCLFFBQUEsQ0FBQyxHQUFELENBQUE7V0FDbkIsYUFBQSxDQUFjLEdBQWQ7RUFEbUIsQ0FBckI7RUFHQSxXQUFBLENBQUE7RUFFQSxJQUFJLFNBQUosQ0FBYyxRQUFkLEVBQXdCO0lBQ3RCLElBQUEsRUFBTSxRQUFBLENBQUEsQ0FBQTtBQUNKLGFBQU8sWUFBQSxDQUFBO0lBREg7RUFEZ0IsQ0FBeEI7RUFLQSxJQUFHLFVBQUg7V0FDRSxhQUFBLENBQUEsRUFERjtHQUFBLE1BQUE7V0FHRSxhQUFBLENBQUEsRUFIRjs7QUEvQ0s7O0FBb0RQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCOzs7O0FDL1ZoQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsUUFBQSxFQUNFO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxJQUFBLEVBQU0sSUFETjtJQUVBLEdBQUEsRUFBSyxJQUZMO0lBR0EsSUFBQSxFQUFNLElBSE47SUFJQSxJQUFBLEVBQU07RUFKTixDQURGO0VBT0EsWUFBQSxFQUNFLENBQUE7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLElBQUEsRUFBTTtFQUROLENBUkY7RUFXQSxZQUFBLEVBQ0UsQ0FBQTtJQUFBLEdBQUEsRUFBSztFQUFMLENBWkY7RUFjQSxXQUFBLEVBQ0UsQ0FBQTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsSUFBQSxFQUFNO0VBRE4sQ0FmRjtFQWtCQSxZQUFBLEVBQWM7SUFBQyxNQUFEO0lBQVMsTUFBVDtJQUFpQixLQUFqQjtJQUF3QixNQUF4QjtJQUFnQyxNQUFoQzs7QUFsQmQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiFcbiAqIGNsaXBib2FyZC5qcyB2Mi4wLjhcbiAqIGh0dHBzOi8vY2xpcGJvYXJkanMuY29tL1xuICpcbiAqIExpY2Vuc2VkIE1JVCDCqSBaZW5vIFJvY2hhXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkNsaXBib2FyZEpTXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKCkgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlc19fID0gKHtcblxuLyoqKi8gMTM0OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBFWFBPUlRTXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywge1xuICBcImRlZmF1bHRcIjogZnVuY3Rpb24oKSB7IHJldHVybiAvKiBiaW5kaW5nICovIGNsaXBib2FyZDsgfVxufSk7XG5cbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzXG52YXIgdGlueV9lbWl0dGVyID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNzkpO1xudmFyIHRpbnlfZW1pdHRlcl9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubih0aW55X2VtaXR0ZXIpO1xuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy9nb29kLWxpc3RlbmVyL3NyYy9saXN0ZW4uanNcbnZhciBsaXN0ZW4gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM3MCk7XG52YXIgbGlzdGVuX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKGxpc3Rlbik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL3NlbGVjdC9zcmMvc2VsZWN0LmpzXG52YXIgc3JjX3NlbGVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oODE3KTtcbnZhciBzZWxlY3RfZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4oc3JjX3NlbGVjdCk7XG47Ly8gQ09OQ0FURU5BVEVEIE1PRFVMRTogLi9zcmMvY2xpcGJvYXJkLWFjdGlvbi5qc1xuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cblxuLyoqXG4gKiBJbm5lciBjbGFzcyB3aGljaCBwZXJmb3JtcyBzZWxlY3Rpb24gZnJvbSBlaXRoZXIgYHRleHRgIG9yIGB0YXJnZXRgXG4gKiBwcm9wZXJ0aWVzIGFuZCB0aGVuIGV4ZWN1dGVzIGNvcHkgb3IgY3V0IG9wZXJhdGlvbnMuXG4gKi9cblxudmFyIENsaXBib2FyZEFjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkQWN0aW9uKG9wdGlvbnMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkQWN0aW9uKTtcblxuICAgIHRoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgdGhpcy5pbml0U2VsZWN0aW9uKCk7XG4gIH1cbiAgLyoqXG4gICAqIERlZmluZXMgYmFzZSBwcm9wZXJ0aWVzIHBhc3NlZCBmcm9tIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhDbGlwYm9hcmRBY3Rpb24sIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSBvcHRpb25zLmFjdGlvbjtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG4gICAgICB0aGlzLmVtaXR0ZXIgPSBvcHRpb25zLmVtaXR0ZXI7XG4gICAgICB0aGlzLnRhcmdldCA9IG9wdGlvbnMudGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy50ZXh0O1xuICAgICAgdGhpcy50cmlnZ2VyID0gb3B0aW9ucy50cmlnZ2VyO1xuICAgICAgdGhpcy5zZWxlY3RlZFRleHQgPSAnJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVjaWRlcyB3aGljaCBzZWxlY3Rpb24gc3RyYXRlZ3kgaXMgZ29pbmcgdG8gYmUgYXBwbGllZCBiYXNlZFxuICAgICAqIG9uIHRoZSBleGlzdGVuY2Ugb2YgYHRleHRgIGFuZCBgdGFyZ2V0YCBwcm9wZXJ0aWVzLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaW5pdFNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0U2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudGV4dCkge1xuICAgICAgICB0aGlzLnNlbGVjdEZha2UoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RUYXJnZXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZha2UgdGV4dGFyZWEgZWxlbWVudCwgc2V0cyBpdHMgdmFsdWUgZnJvbSBgdGV4dGAgcHJvcGVydHksXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjcmVhdGVGYWtlRWxlbWVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVGYWtlRWxlbWVudCgpIHtcbiAgICAgIHZhciBpc1JUTCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RpcicpID09PSAncnRsJztcbiAgICAgIHRoaXMuZmFrZUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpOyAvLyBQcmV2ZW50IHpvb21pbmcgb24gaU9TXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuZm9udFNpemUgPSAnMTJwdCc7IC8vIFJlc2V0IGJveCBtb2RlbFxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLmJvcmRlciA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUucGFkZGluZyA9ICcwJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUubWFyZ2luID0gJzAnOyAvLyBNb3ZlIGVsZW1lbnQgb3V0IG9mIHNjcmVlbiBob3Jpem9udGFsbHlcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlW2lzUlRMID8gJ3JpZ2h0JyA6ICdsZWZ0J10gPSAnLTk5OTlweCc7IC8vIE1vdmUgZWxlbWVudCB0byB0aGUgc2FtZSBwb3NpdGlvbiB2ZXJ0aWNhbGx5XG5cbiAgICAgIHZhciB5UG9zaXRpb24gPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUudG9wID0gXCJcIi5jb25jYXQoeVBvc2l0aW9uLCBcInB4XCIpO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgdGhpcy5mYWtlRWxlbS52YWx1ZSA9IHRoaXMudGV4dDtcbiAgICAgIHJldHVybiB0aGlzLmZha2VFbGVtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQncyB0aGUgdmFsdWUgb2YgZmFrZUVsZW0sXG4gICAgICogYW5kIG1ha2VzIGEgc2VsZWN0aW9uIG9uIGl0LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0RmFrZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RGYWtlKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGZha2VFbGVtID0gdGhpcy5jcmVhdGVGYWtlRWxlbWVudCgpO1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmZha2VIYW5kbGVyID0gdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2spIHx8IHRydWU7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChmYWtlRWxlbSk7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkoZmFrZUVsZW0pO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgICAgdGhpcy5yZW1vdmVGYWtlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9ubHkgcmVtb3ZlcyB0aGUgZmFrZSBlbGVtZW50IGFmdGVyIGFub3RoZXIgY2xpY2sgZXZlbnQsIHRoYXQgd2F5XG4gICAgICogYSB1c2VyIGNhbiBoaXQgYEN0cmwrQ2AgdG8gY29weSBiZWNhdXNlIHNlbGVjdGlvbiBzdGlsbCBleGlzdHMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUZha2UoKSB7XG4gICAgICBpZiAodGhpcy5mYWtlSGFuZGxlcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmZha2VIYW5kbGVyQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5mYWtlRWxlbSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmZha2VFbGVtKTtcbiAgICAgICAgdGhpcy5mYWtlRWxlbSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgdGhlIGNvbnRlbnQgZnJvbSBlbGVtZW50IHBhc3NlZCBvbiBgdGFyZ2V0YCBwcm9wZXJ0eS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3RUYXJnZXQoKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9IHNlbGVjdF9kZWZhdWx0KCkodGhpcy50YXJnZXQpO1xuICAgICAgdGhpcy5jb3B5VGV4dCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgY29weSBvcGVyYXRpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiY29weVRleHRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weVRleHQoKSB7XG4gICAgICB2YXIgc3VjY2VlZGVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBzdWNjZWVkZWQgPSBkb2N1bWVudC5leGVjQ29tbWFuZCh0aGlzLmFjdGlvbik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0KHN1Y2NlZWRlZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIGFuIGV2ZW50IGJhc2VkIG9uIHRoZSBjb3B5IG9wZXJhdGlvbiByZXN1bHQuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBzdWNjZWVkZWRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVJlc3VsdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXN1bHQoc3VjY2VlZGVkKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdChzdWNjZWVkZWQgPyAnc3VjY2VzcycgOiAnZXJyb3InLCB7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgIHRleHQ6IHRoaXMuc2VsZWN0ZWRUZXh0LFxuICAgICAgICB0cmlnZ2VyOiB0aGlzLnRyaWdnZXIsXG4gICAgICAgIGNsZWFyU2VsZWN0aW9uOiB0aGlzLmNsZWFyU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyBmb2N1cyBhd2F5IGZyb20gYHRhcmdldGAgYW5kIGJhY2sgdG8gdGhlIHRyaWdnZXIsIHJlbW92ZXMgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjbGVhclNlbGVjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBgYWN0aW9uYCB0byBiZSBwZXJmb3JtZWQgd2hpY2ggY2FuIGJlIGVpdGhlciAnY29weScgb3IgJ2N1dCcuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvblxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWN0aW9uXCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnY29weSc7XG4gICAgICB0aGlzLl9hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgIGlmICh0aGlzLl9hY3Rpb24gIT09ICdjb3B5JyAmJiB0aGlzLl9hY3Rpb24gIT09ICdjdXQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcImFjdGlvblwiIHZhbHVlLCB1c2UgZWl0aGVyIFwiY29weVwiIG9yIFwiY3V0XCInKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYGFjdGlvbmAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hY3Rpb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5IHVzaW5nIGFuIGVsZW1lbnRcbiAgICAgKiB0aGF0IHdpbGwgYmUgaGF2ZSBpdHMgY29udGVudCBjb3BpZWQuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInRhcmdldFwiLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgX3R5cGVvZih0YXJnZXQpID09PSAnb2JqZWN0JyAmJiB0YXJnZXQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdjb3B5JyAmJiB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiBhdHRyaWJ1dGUuIFBsZWFzZSB1c2UgXCJyZWFkb25seVwiIGluc3RlYWQgb2YgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2N1dCcgJiYgKHRhcmdldC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5JykgfHwgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gWW91IGNhblxcJ3QgY3V0IHRleHQgZnJvbSBlbGVtZW50cyB3aXRoIFwicmVhZG9ubHlcIiBvciBcImRpc2FibGVkXCIgYXR0cmlidXRlcycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3RhcmdldCA9IHRhcmdldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgXCJ0YXJnZXRcIiB2YWx1ZSwgdXNlIGEgdmFsaWQgRWxlbWVudCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqIEByZXR1cm4ge1N0cmluZ3xIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICAsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmRBY3Rpb247XG59KCk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZF9hY3Rpb24gPSAoQ2xpcGJvYXJkQWN0aW9uKTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQuanNcbmZ1bmN0aW9uIGNsaXBib2FyZF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IGNsaXBib2FyZF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBjbGlwYm9hcmRfdHlwZW9mKG9iaik7IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTsgfVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuXG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmIChjYWxsICYmIChjbGlwYm9hcmRfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7IHJldHVybiBjYWxsOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikgeyBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkgeyBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7IGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7IGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7IHRyeSB7IERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoRGF0ZSwgW10sIGZ1bmN0aW9uICgpIHt9KSk7IHJldHVybiB0cnVlOyB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfSB9XG5cbmZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cblxuXG5cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmV0cmlldmUgYXR0cmlidXRlIHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd9IHN1ZmZpeFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKi9cblxuZnVuY3Rpb24gZ2V0QXR0cmlidXRlVmFsdWUoc3VmZml4LCBlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJ1dGUgPSBcImRhdGEtY2xpcGJvYXJkLVwiLmNvbmNhdChzdWZmaXgpO1xuXG4gIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xufVxuLyoqXG4gKiBCYXNlIGNsYXNzIHdoaWNoIHRha2VzIG9uZSBvciBtb3JlIGVsZW1lbnRzLCBhZGRzIGV2ZW50IGxpc3RlbmVycyB0byB0aGVtLFxuICogYW5kIGluc3RhbnRpYXRlcyBhIG5ldyBgQ2xpcGJvYXJkQWN0aW9uYCBvbiBlYWNoIGNsaWNrLlxuICovXG5cblxudmFyIENsaXBib2FyZCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0VtaXR0ZXIpIHtcbiAgX2luaGVyaXRzKENsaXBib2FyZCwgX0VtaXR0ZXIpO1xuXG4gIHZhciBfc3VwZXIgPSBfY3JlYXRlU3VwZXIoQ2xpcGJvYXJkKTtcblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR8SFRNTENvbGxlY3Rpb258Tm9kZUxpc3R9IHRyaWdnZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG4gIGZ1bmN0aW9uIENsaXBib2FyZCh0cmlnZ2VyLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgY2xpcGJvYXJkX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsaXBib2FyZCk7XG5cbiAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpO1xuXG4gICAgX3RoaXMucmVzb2x2ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBfdGhpcy5saXN0ZW5DbGljayh0cmlnZ2VyKTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBpZiBhdHRyaWJ1dGVzIHdvdWxkIGJlIHJlc29sdmVkIHVzaW5nIGludGVybmFsIHNldHRlciBmdW5jdGlvbnNcbiAgICogb3IgY3VzdG9tIGZ1bmN0aW9ucyB0aGF0IHdlcmUgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICovXG5cblxuICBjbGlwYm9hcmRfY3JlYXRlQ2xhc3MoQ2xpcGJvYXJkLCBbe1xuICAgIGtleTogXCJyZXNvbHZlT3B0aW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNvbHZlT3B0aW9ucygpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuYWN0aW9uID0gdHlwZW9mIG9wdGlvbnMuYWN0aW9uID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5hY3Rpb24gOiB0aGlzLmRlZmF1bHRBY3Rpb247XG4gICAgICB0aGlzLnRhcmdldCA9IHR5cGVvZiBvcHRpb25zLnRhcmdldCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGFyZ2V0IDogdGhpcy5kZWZhdWx0VGFyZ2V0O1xuICAgICAgdGhpcy50ZXh0ID0gdHlwZW9mIG9wdGlvbnMudGV4dCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMudGV4dCA6IHRoaXMuZGVmYXVsdFRleHQ7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGNsaXBib2FyZF90eXBlb2Yob3B0aW9ucy5jb250YWluZXIpID09PSAnb2JqZWN0JyA/IG9wdGlvbnMuY29udGFpbmVyIDogZG9jdW1lbnQuYm9keTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIGNsaWNrIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwYXNzZWQgdHJpZ2dlci5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibGlzdGVuQ2xpY2tcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGlzdGVuQ2xpY2sodHJpZ2dlcikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5fZGVmYXVsdCgpKHRyaWdnZXIsICdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIub25DbGljayhlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2sgZXZlbnQuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwib25DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNsaWNrKGUpIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gZS5kZWxlZ2F0ZVRhcmdldCB8fCBlLmN1cnJlbnRUYXJnZXQ7XG5cbiAgICAgIGlmICh0aGlzLmNsaXBib2FyZEFjdGlvbikge1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbmV3IGNsaXBib2FyZF9hY3Rpb24oe1xuICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uKHRyaWdnZXIpLFxuICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0KHRyaWdnZXIpLFxuICAgICAgICB0ZXh0OiB0aGlzLnRleHQodHJpZ2dlciksXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcy5jb250YWluZXIsXG4gICAgICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgICAgIGVtaXR0ZXI6IHRoaXNcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGBhY3Rpb25gIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRBY3Rpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdEFjdGlvbih0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ2FjdGlvbicsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0YXJnZXRgIGxvb2t1cCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRyaWdnZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUYXJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVmYXVsdFRhcmdldCh0cmlnZ2VyKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBnZXRBdHRyaWJ1dGVWYWx1ZSgndGFyZ2V0JywgdHJpZ2dlcik7XG5cbiAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1cHBvcnQgb2YgdGhlIGdpdmVuIGFjdGlvbiwgb3IgYWxsIGFjdGlvbnMgaWYgbm8gYWN0aW9uIGlzXG4gICAgICogZ2l2ZW4uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFthY3Rpb25dXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWZhdWx0VGV4dFwiLFxuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBgdGV4dGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGV4dCh0cmlnZ2VyKSB7XG4gICAgICByZXR1cm4gZ2V0QXR0cmlidXRlVmFsdWUoJ3RleHQnLCB0cmlnZ2VyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVzdHJveSBsaWZlY3ljbGUuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyLmRlc3Ryb3koKTtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfV0sIFt7XG4gICAga2V5OiBcImlzU3VwcG9ydGVkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzU3VwcG9ydGVkKCkge1xuICAgICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogWydjb3B5JywgJ2N1dCddO1xuICAgICAgdmFyIGFjdGlvbnMgPSB0eXBlb2YgYWN0aW9uID09PSAnc3RyaW5nJyA/IFthY3Rpb25dIDogYWN0aW9uO1xuICAgICAgdmFyIHN1cHBvcnQgPSAhIWRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN1cHBvcnRlZDtcbiAgICAgIGFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHN1cHBvcnQgPSBzdXBwb3J0ICYmICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkKGFjdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDbGlwYm9hcmQ7XG59KCh0aW55X2VtaXR0ZXJfZGVmYXVsdCgpKSk7XG5cbi8qIGhhcm1vbnkgZGVmYXVsdCBleHBvcnQgKi8gdmFyIGNsaXBib2FyZCA9IChDbGlwYm9hcmQpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gODI4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG52YXIgRE9DVU1FTlRfTk9ERV9UWVBFID0gOTtcblxuLyoqXG4gKiBBIHBvbHlmaWxsIGZvciBFbGVtZW50Lm1hdGNoZXMoKVxuICovXG5pZiAodHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgdmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbiAgICBwcm90by5tYXRjaGVzID0gcHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICBwcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY2xvc2VzdCBwYXJlbnQgdGhhdCBtYXRjaGVzIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHdoaWxlIChlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgIT09IERPQ1VNRU5UX05PREVfVFlQRSkge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQubWF0Y2hlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb3Nlc3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDQzODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgY2xvc2VzdCA9IF9fd2VicGFja19yZXF1aXJlX18oODI4KTtcblxuLyoqXG4gKiBEZWxlZ2F0ZXMgZXZlbnQgdG8gYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gX2RlbGVnYXRlKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIHZhciBsaXN0ZW5lckZuID0gbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lckZuLCB1c2VDYXB0dXJlKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd8QXJyYXl9IFtlbGVtZW50c11cbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gZGVsZWdhdGUoZWxlbWVudHMsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIC8vIEhhbmRsZSB0aGUgcmVndWxhciBFbGVtZW50IHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cy5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgRWxlbWVudC1sZXNzIHVzYWdlLCBpdCBkZWZhdWx0cyB0byBnbG9iYWwgZGVsZWdhdGlvblxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBVc2UgYGRvY3VtZW50YCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLCB0aGVuIGFwcGx5IGFyZ3VtZW50c1xuICAgICAgICAvLyBUaGlzIGlzIGEgc2hvcnQgd2F5IHRvIC51bnNoaWZ0IGBhcmd1bWVudHNgIHdpdGhvdXQgcnVubmluZyBpbnRvIGRlb3B0aW1pemF0aW9uc1xuICAgICAgICByZXR1cm4gX2RlbGVnYXRlLmJpbmQobnVsbCwgZG9jdW1lbnQpLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIFNlbGVjdG9yLWJhc2VkIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50cyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgQXJyYXktbGlrZSBiYXNlZCB1c2FnZVxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBGaW5kcyBjbG9zZXN0IG1hdGNoIGFuZCBpbnZva2VzIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5mdW5jdGlvbiBsaXN0ZW5lcihlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gY2xvc2VzdChlLnRhcmdldCwgc2VsZWN0b3IpO1xuXG4gICAgICAgIGlmIChlLmRlbGVnYXRlVGFyZ2V0KSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGVsZW1lbnQsIGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Nzk6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIGV4cG9ydHMpIHtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIEhUTUwgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgJiYgdmFsdWUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudFxuICAgICAgICAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gMTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBsaXN0IG9mIEhUTUwgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLm5vZGVMaXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiAodHlwZSA9PT0gJ1tvYmplY3QgTm9kZUxpc3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nKVxuICAgICAgICAmJiAoJ2xlbmd0aCcgaW4gdmFsdWUpXG4gICAgICAgICYmICh2YWx1ZS5sZW5ndGggPT09IDAgfHwgZXhwb3J0cy5ub2RlKHZhbHVlWzBdKSk7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5zdHJpbmcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5mbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuXG4gICAgcmV0dXJuIHR5cGUgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzNzA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3VudXNlZF93ZWJwYWNrX2V4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxudmFyIGlzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4NzkpO1xudmFyIGRlbGVnYXRlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MzgpO1xuXG4vKipcbiAqIFZhbGlkYXRlcyBhbGwgcGFyYW1zIGFuZCBjYWxscyB0aGUgcmlnaHRcbiAqIGxpc3RlbmVyIGZ1bmN0aW9uIGJhc2VkIG9uIGl0cyB0YXJnZXQgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXRhcmdldCAmJiAhdHlwZSAmJiAhY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHJlcXVpcmVkIGFyZ3VtZW50cycpO1xuICAgIH1cblxuICAgIGlmICghaXMuc3RyaW5nKHR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5mbihjYWxsYmFjaykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhpcmQgYXJndW1lbnQgbXVzdCBiZSBhIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzLm5vZGUodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZSh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMubm9kZUxpc3QodGFyZ2V0KSkge1xuICAgICAgICByZXR1cm4gbGlzdGVuTm9kZUxpc3QodGFyZ2V0LCB0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzLnN0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5TZWxlY3Rvcih0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcsIEhUTUxFbGVtZW50LCBIVE1MQ29sbGVjdGlvbiwgb3IgTm9kZUxpc3QnKTtcbiAgICB9XG59XG5cbi8qKlxuICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byBhIEhUTUwgZWxlbWVudFxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGUobm9kZSwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50c1xuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxIVE1MQ29sbGVjdGlvbn0gbm9kZUxpc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ob2RlTGlzdChub2RlTGlzdCwgdHlwZSwgY2FsbGJhY2spIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5vZGVMaXN0LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgc2VsZWN0b3JcbiAqIGFuZCByZXR1cm5zIGEgcmVtb3ZlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3RlblNlbGVjdG9yKHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBkZWxlZ2F0ZShkb2N1bWVudC5ib2R5LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RlbjtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gODE3OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSkge1xuXG5mdW5jdGlvbiBzZWxlY3QoZWxlbWVudCkge1xuICAgIHZhciBzZWxlY3RlZFRleHQ7XG5cbiAgICBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdJTlBVVCcgfHwgZWxlbWVudC5ub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICB2YXIgaXNSZWFkT25seSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWFkb25seScpO1xuXG4gICAgICAgIGlmICghaXNSZWFkT25seSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5zZWxlY3QoKTtcbiAgICAgICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSgwLCBlbGVtZW50LnZhbHVlLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgncmVhZG9ubHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IGVsZW1lbnQudmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuXG4gICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RlZFRleHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZWN0O1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAyNzk6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIEUgKCkge1xuICAvLyBLZWVwIHRoaXMgZW1wdHkgc28gaXQncyBlYXNpZXIgdG8gaW5oZXJpdCBmcm9tXG4gIC8vICh2aWEgaHR0cHM6Ly9naXRodWIuY29tL2xpcHNtYWNrIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9pc3N1ZXMvMylcbn1cblxuRS5wcm90b3R5cGUgPSB7XG4gIG9uOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG5cbiAgICAoZVtuYW1lXSB8fCAoZVtuYW1lXSA9IFtdKSkucHVzaCh7XG4gICAgICBmbjogY2FsbGJhY2ssXG4gICAgICBjdHg6IGN0eFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgc2VsZi5vZmYobmFtZSwgbGlzdGVuZXIpO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBsaXN0ZW5lci5fID0gY2FsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBsaXN0ZW5lciwgY3R4KTtcbiAgfSxcblxuICBlbWl0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBkYXRhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBldnRBcnIgPSAoKHRoaXMuZSB8fCAodGhpcy5lID0ge30pKVtuYW1lXSB8fCBbXSkuc2xpY2UoKTtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbiA9IGV2dEFyci5sZW5ndGg7XG5cbiAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgZXZ0QXJyW2ldLmZuLmFwcGx5KGV2dEFycltpXS5jdHgsIGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcbiAgICB2YXIgZXZ0cyA9IGVbbmFtZV07XG4gICAgdmFyIGxpdmVFdmVudHMgPSBbXTtcblxuICAgIGlmIChldnRzICYmIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZXZ0c1tpXS5mbiAhPT0gY2FsbGJhY2sgJiYgZXZ0c1tpXS5mbi5fICE9PSBjYWxsYmFjaylcbiAgICAgICAgICBsaXZlRXZlbnRzLnB1c2goZXZ0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGV2ZW50IGZyb20gcXVldWUgdG8gcHJldmVudCBtZW1vcnkgbGVha1xuICAgIC8vIFN1Z2dlc3RlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbGF6ZFxuICAgIC8vIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9jb21taXQvYzZlYmZhYTliYzk3M2IzM2QxMTBhODRhMzA3NzQyYjdjZjk0Yzk1MyNjb21taXRjb21tZW50LTUwMjQ5MTBcblxuICAgIChsaXZlRXZlbnRzLmxlbmd0aClcbiAgICAgID8gZVtuYW1lXSA9IGxpdmVFdmVudHNcbiAgICAgIDogZGVsZXRlIGVbbmFtZV07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFO1xubW9kdWxlLmV4cG9ydHMuVGlueUVtaXR0ZXIgPSBFO1xuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIFx0fSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcbi8qKioqKiovIFx0XHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG4vKioqKioqLyBcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcbi8qKioqKiovIFx0XHRcdFx0fVxuLyoqKioqKi8gXHRcdFx0fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqLyBcdH0oKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdC8qIHdlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQgKi9cbi8qKioqKiovIFx0IWZ1bmN0aW9uKCkge1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH1cbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBydW50aW1lIHNvIGVudHJ5IGlubGluaW5nIGlzIGRpc2FibGVkXG4vKioqKioqLyBcdC8vIHN0YXJ0dXBcbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzNCk7XG4vKioqKioqLyB9KSgpXG4uZGVmYXVsdDtcbn0pOyIsImZpbHRlckRhdGFiYXNlID0gbnVsbFxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuZ2VuZXJhdGVMaXN0ID0gKGZpbHRlclN0cmluZywgc29ydEJ5QXJ0aXN0ID0gZmFsc2UpIC0+XHJcbiAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxyXG4gICAgc29sb0ZpbHRlcnMgPSBbXVxyXG4gICAgcmF3RmlsdGVycyA9IGZpbHRlclN0cmluZy5zcGxpdCgvXFxyP1xcbi8pXHJcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcclxuICAgICAgZmlsdGVyID0gZmlsdGVyLnRyaW0oKVxyXG4gICAgICBpZiBmaWx0ZXIubGVuZ3RoID4gMFxyXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXHJcbiAgICBpZiBzb2xvRmlsdGVycy5sZW5ndGggPT0gMFxyXG4gICAgICAjIE5vIGZpbHRlcnNcclxuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXHJcbiAgY29uc29sZS5sb2cgXCJGaWx0ZXJzOlwiLCBzb2xvRmlsdGVyc1xyXG4gIGlmIGZpbHRlckRhdGFiYXNlP1xyXG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcclxuICBlbHNlXHJcbiAgICBjb25zb2xlLmxvZyBcIkRvd25sb2FkaW5nIGRhdGFiYXNlLi4uXCJcclxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gIHNvbG9VbnNodWZmbGVkID0gW11cclxuICBpZiBzb2xvRmlsdGVycz9cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBlLmFsbG93ZWQgPSBmYWxzZVxyXG4gICAgICBlLnNraXBwZWQgPSBmYWxzZVxyXG5cclxuICAgIGFsbEFsbG93ZWQgPSB0cnVlXHJcbiAgICBmb3IgZmlsdGVyIGluIHNvbG9GaWx0ZXJzXHJcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvXFxzKy8pXHJcblxyXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInNraXBcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxyXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxyXG5cclxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXHJcblxyXG4gICAgICBuZWdhdGVkID0gZmFsc2VcclxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXHJcbiAgICAgICAgbmVnYXRlZCA9IHRydWVcclxuICAgICAgICBwaWVjZXNbMF0gPSBtYXRjaGVzWzFdXHJcblxyXG4gICAgICBjb21tYW5kID0gcGllY2VzWzBdXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdhZGRlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXHJcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcclxuICAgICAgICB3aGVuICd0YWcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcclxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cclxuICAgICAgICAgICAgc29sb0ZhdGFsRXJyb3IoXCJDYW5ub3QgcGFyc2UgZHVyYXRpb246ICN7c3Vic3RyaW5nfVwiKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIkR1cmF0aW9uIFsje3N1YnN0cmluZ31dIC0gI3tkdXJhdGlvbkluU2Vjb25kc31cIlxyXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUuYWRkZWQgPiBzaW5jZVxyXG4gICAgICAgIHdoZW4gJ2xvdmUnLCAnbGlrZScsICdibGVoJywgJ2hhdGUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxyXG4gICAgICAgICAgZmlsdGVyVXNlciA9IHN1YnN0cmluZ1xyXG4gICAgICAgICAgYXdhaXQgY2FjaGVPcGluaW9ucyhmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBzb2xvT3BpbmlvbnNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gc29sb09waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgd2hlbiAnbm9uZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcclxuICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICMgY29uc29sZS5sb2cgc29sb09waW5pb25zXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IHNvbG9PcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ2Z1bGwnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxyXG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZExvb2t1cFtpZF0gPSB0cnVlXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBza2lwIHRoaXMgZmlsdGVyXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxyXG4gICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxyXG4gICAgICAgIGlmIGlzTWF0Y2hcclxuICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG5cclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBpZiAoZS5hbGxvd2VkIG9yIGFsbEFsbG93ZWQpIGFuZCBub3QgZS5za2lwcGVkXHJcbiAgICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcbiAgZWxzZVxyXG4gICAgIyBRdWV1ZSBpdCBhbGwgdXBcclxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxyXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcclxuXHJcbiAgaWYgc29ydEJ5QXJ0aXN0XHJcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpIDwgYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAxXHJcbiAgICAgIGlmIGEudGl0bGUudG9Mb3dlckNhc2UoKSA8IGIudGl0bGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHJldHVybiAtMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPiBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICByZXR1cm4gMFxyXG4gIHJldHVybiBzb2xvVW5zaHVmZmxlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlTGlzdDogZ2VuZXJhdGVMaXN0XHJcbiIsImNvbnN0YW50cyA9IHJlcXVpcmUgJy4uL2NvbnN0YW50cydcclxuQ2xpcGJvYXJkID0gcmVxdWlyZSAnY2xpcGJvYXJkJ1xyXG5maWx0ZXJzID0gcmVxdWlyZSAnLi9maWx0ZXJzJ1xyXG5cclxuc29ja2V0ID0gbnVsbFxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0luZm8gPSB7fVxyXG5cclxuZGlzY29yZFRva2VuID0gbnVsbFxyXG5kaXNjb3JkVGFnID0gbnVsbFxyXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXHJcblxyXG5jYXN0QXZhaWxhYmxlID0gZmFsc2VcclxuY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5sYXVuY2hPcGVuID0gKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdsYXVuY2gnKSA9PSBcInRydWVcIilcclxuY29uc29sZS5sb2cgXCJsYXVuY2hPcGVuOiAje2xhdW5jaE9wZW59XCJcclxuXHJcbm9waW5pb25PcmRlciA9IFtdXHJcbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcclxuICBvcGluaW9uT3JkZXIucHVzaCBvXHJcbm9waW5pb25PcmRlci5wdXNoKCdub25lJylcclxuXHJcbnJhbmRvbVN0cmluZyA9IC0+XHJcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSkgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpXHJcblxyXG5ub3cgPSAtPlxyXG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxyXG5cclxucGFnZUVwb2NoID0gbm93KClcclxuXHJcbnFzID0gKG5hbWUpIC0+XHJcbiAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcclxuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJylcclxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXHJcbiAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcclxuICBpZiBub3QgcmVzdWx0cyBvciBub3QgcmVzdWx0c1syXVxyXG4gICAgcmV0dXJuIG51bGxcclxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpXHJcblxyXG5zaG93V2F0Y2hGb3JtID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLmZvY3VzKClcclxuICBsYXVuY2hPcGVuID0gdHJ1ZVxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAndHJ1ZScpXHJcblxyXG5zaG93V2F0Y2hMaW5rID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBsYXVuY2hPcGVuID0gZmFsc2VcclxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGF1bmNoJywgJ2ZhbHNlJylcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXHJcblxyXG5vbkluaXRTdWNjZXNzID0gLT5cclxuICBjb25zb2xlLmxvZyBcIkNhc3QgYXZhaWxhYmxlIVwiXHJcbiAgY2FzdEF2YWlsYWJsZSA9IHRydWVcclxuXHJcbm9uRXJyb3IgPSAobWVzc2FnZSkgLT5cclxuXHJcbnNlc3Npb25MaXN0ZW5lciA9IChlKSAtPlxyXG4gIGNhc3RTZXNzaW9uID0gZVxyXG5cclxuc2Vzc2lvblVwZGF0ZUxpc3RlbmVyID0gKGlzQWxpdmUpIC0+XHJcbiAgaWYgbm90IGlzQWxpdmVcclxuICAgIGNhc3RTZXNzaW9uID0gbnVsbFxyXG5cclxucHJlcGFyZUNhc3QgPSAtPlxyXG4gIGlmIG5vdCBjaHJvbWUuY2FzdCBvciBub3QgY2hyb21lLmNhc3QuaXNBdmFpbGFibGVcclxuICAgIGlmIG5vdygpIDwgKHBhZ2VFcG9jaCArIDEwKSAjIGdpdmUgdXAgYWZ0ZXIgMTAgc2Vjb25kc1xyXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChwcmVwYXJlQ2FzdCwgMTAwKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNlc3Npb25SZXF1ZXN0ID0gbmV3IGNocm9tZS5jYXN0LlNlc3Npb25SZXF1ZXN0KCc1QzNGMEEzQycpICMgRGFzaGNhc3RcclxuICBhcGlDb25maWcgPSBuZXcgY2hyb21lLmNhc3QuQXBpQ29uZmlnIHNlc3Npb25SZXF1ZXN0LCBzZXNzaW9uTGlzdGVuZXIsIC0+XHJcbiAgY2hyb21lLmNhc3QuaW5pdGlhbGl6ZShhcGlDb25maWcsIG9uSW5pdFN1Y2Nlc3MsIG9uRXJyb3IpXHJcblxyXG5jYWxjU2hhcmVVUkwgPSAtPlxyXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcclxuICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKVxyXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXHJcbiAgcGFyYW1zLmRlbGV0ZShcInNvbG9cIilcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuc3RhcnRDYXN0ID0gLT5cclxuICBjb25zb2xlLmxvZyBcInN0YXJ0IGNhc3QhXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIGJhc2VVUkwgPSBiYXNlVVJMLnJlcGxhY2UoL3NvbG8kLywgXCJcIilcclxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJ3YXRjaD9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIGNocm9tZS5jYXN0LnJlcXVlc3RTZXNzaW9uIChlKSAtPlxyXG4gICAgY2FzdFNlc3Npb24gPSBlXHJcbiAgICBjYXN0U2Vzc2lvbi5zZW5kTWVzc2FnZShEQVNIQ0FTVF9OQU1FU1BBQ0UsIHsgdXJsOiBtdHZVUkwsIGZvcmNlOiB0cnVlIH0pXHJcbiAgLCBvbkVycm9yXHJcblxyXG5nZW5lcmF0ZVBlcm1hbGluayA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJnZW5lcmF0ZVBlcm1hbGluaygpXCJcclxuXHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgY29uc29sZS5sb2cgXCJXZSdyZSBnb2luZyBoZXJlOiAje210dlVSTH1cIlxyXG4gIHdpbmRvdy5sb2NhdGlvbiA9IG10dlVSTFxyXG5cclxuc29sb1NraXAgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAnc2tpcCdcclxuICB9XHJcblxyXG5zb2xvUmVzdGFydCA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdyZXN0YXJ0J1xyXG4gIH1cclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwYXVzZSdcclxuICB9XHJcblxyXG5yZW5kZXJJbmZvID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHRhZ3NTdHJpbmcgPSBPYmplY3Qua2V5cyhzb2xvSW5mby5jdXJyZW50LnRhZ3MpLnNvcnQoKS5qb2luKCcsICcpXHJcblxyXG4gIGh0bWwgPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jb3VudHNcXFwiPlRyYWNrICN7c29sb0luZm8uaW5kZXh9IC8gI3tzb2xvSW5mby5jb3VudH08L2Rpdj5cIlxyXG4gICMgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9oZWFkaW5nXFxcIj5DdXJyZW50OiBbPHNwYW4gY2xhc3M9XFxcInlvdXR1YmVpZFxcXCI+I3tzb2xvSW5mby5jdXJyZW50LmlkfTwvc3Bhbj5dPC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RodW1iXFxcIj48YSBocmVmPVxcXCJodHRwczovL3lvdXR1LmJlLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHNvbG9JbmZvLmN1cnJlbnQuaWQpfVxcXCI+PGltZyB3aWR0aD0zMjAgaGVpZ2h0PTE4MCBzcmM9XFxcIiN7c29sb0luZm8uY3VycmVudC50aHVtYn1cXFwiPjwvYT48L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY3VycmVudCBpbmZvYXJ0aXN0XFxcIj4je3NvbG9JbmZvLmN1cnJlbnQuYXJ0aXN0fTwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm90aXRsZVxcXCI+XFxcIiN7c29sb0luZm8uY3VycmVudC50aXRsZX1cXFwiPC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RhZ3NcXFwiPiZuYnNwOyN7dGFnc1N0cmluZ30mbmJzcDs8L2Rpdj5cIlxyXG4gIGlmIHNvbG9JbmZvLm5leHQ/XHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je3NvbG9JbmZvLm5leHQuYXJ0aXN0fTwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvdGl0bGUgbmV4dHZpZGVvXFxcIj5cXFwiI3tzb2xvSW5mby5uZXh0LnRpdGxlfVxcXCI8L3NwYW4+XCJcclxuICBlbHNlXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9oZWFkaW5nIG5leHR2aWRlb1xcXCI+TmV4dDo8L3NwYW4+IFwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9yZXNodWZmbGUgbmV4dHZpZGVvXFxcIj4oLi4uUmVzaHVmZmxlLi4uKTwvc3Bhbj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gaHRtbFxyXG5cclxuY2xpcGJvYXJkRWRpdCA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwYm9hcmQnKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgc2V0VGltZW91dCAtPlxyXG4gICAgcmVuZGVyQ2xpcGJvYXJkKClcclxuICAsIDIwMDBcclxuXHJcbnJlbmRlckNsaXBib2FyZCA9IC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvXFxcIiBkYXRhLWNsaXBib2FyZC10ZXh0PVxcXCIjbXR2IGVkaXQgI3tzb2xvSW5mby5jdXJyZW50LmlkfSBcXFwiIG9uY2xpY2s9XFxcImNsaXBib2FyZEVkaXQoKTsgcmV0dXJuIGZhbHNlXFxcIj5FZGl0PC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBib2FyZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBuZXcgQ2xpcGJvYXJkKCcuY2J1dHRvJylcclxuXHJcbnNoYXJlQ2xpcGJvYXJkID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmVjb3BpZWRcXFwiPkNvcGllZCB0byBjbGlwYm9hcmQ6PC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZXVybFxcXCI+I3tjYWxjU2hhcmVVUkwoKX08L2Rpdj5cclxuICBcIlwiXCJcclxuXHJcbnNob3dMaXN0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxyXG5cclxuICBmaWx0ZXJTdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVycycpLnZhbHVlO1xyXG4gIGxpc3QgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcsIHRydWUpXHJcbiAgaWYgbm90IGxpc3Q/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiRXJyb3IuIFNvcnJ5LlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwibGlzdGNvbnRhaW5lclxcXCI+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOjwvZGl2PlwiXHJcbiAgZm9yIGUgaW4gbGlzdFxyXG4gICAgaHRtbCArPSBcIjxkaXY+XCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2UudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXHJcblxyXG4gIGh0bWwgKz0gXCI8L2Rpdj5cIlxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbmNsZWFyT3BpbmlvbiA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29waW5pb25zJykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XHJcbiAgaWYgbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD8gb3Igbm90IChwa3QuaWQgPT0gc29sb0luZm8uY3VycmVudC5pZClcclxuICAgIHJldHVyblxyXG5cclxuICBodG1sID0gXCJcIlxyXG4gIGZvciBvIGluIG9waW5pb25PcmRlciBieSAtMVxyXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXHJcbiAgICBjbGFzc2VzID0gXCJvYnV0dG9cIlxyXG4gICAgaWYgbyA9PSBwa3Qub3BpbmlvblxyXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXHJcbiAgICBodG1sICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cIiN7Y2xhc3Nlc31cIiBvbmNsaWNrPVwic2V0T3BpbmlvbignI3tvfScpOyByZXR1cm4gZmFsc2U7XCI+I3tjYXBvfTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cclxuICBpZiBub3QgZGlzY29yZFRva2VuPyBvciBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50PyBvciBub3Qgc29sb0luZm8uY3VycmVudC5pZD9cclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHNvbG9JbmZvLmN1cnJlbnQuaWQsIHNldDogb3BpbmlvbiB9XHJcblxyXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XHJcbiAgaWYgcGt0LmlkICE9IHNvbG9JRFxyXG4gICAgcmV0dXJuXHJcbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxyXG4gIHN3aXRjaCBwa3QuY21kXHJcbiAgICB3aGVuICdpbmZvJ1xyXG4gICAgICBpZiBwa3QuaW5mbz9cclxuICAgICAgICBjb25zb2xlLmxvZyBcIk5FVyBJTkZPITogXCIsIHBrdC5pbmZvXHJcbiAgICAgICAgc29sb0luZm8gPSBwa3QuaW5mb1xyXG4gICAgICAgIHJlbmRlckluZm8oKVxyXG4gICAgICAgIHJlbmRlckNsaXBib2FyZCgpXHJcbiAgICAgICAgY2xlYXJPcGluaW9uKClcclxuICAgICAgICBpZiBkaXNjb3JkVG9rZW4/IGFuZCBzb2xvSW5mby5jdXJyZW50PyBhbmQgc29sb0luZm8uY3VycmVudC5pZD9cclxuICAgICAgICAgIHNvY2tldC5lbWl0ICdvcGluaW9uJywgeyB0b2tlbjogZGlzY29yZFRva2VuLCBpZDogc29sb0luZm8uY3VycmVudC5pZCB9XHJcblxyXG51cGRhdGVTb2xvSUQgPSAobmV3U29sb0lEKSAtPlxyXG4gIHNvbG9JRCA9IG5ld1NvbG9JRFxyXG4gIGlmIG5vdCBzb2xvSUQ/XHJcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6IG5vIHNvbG8gcXVlcnkgcGFyYW1ldGVyXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic29sb2lkXCIpLnZhbHVlID0gc29sb0lEXHJcbiAgaWYgc29ja2V0P1xyXG4gICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxyXG5cclxubmV3U29sb0lEID0gLT5cclxuICB1cGRhdGVTb2xvSUQocmFuZG9tU3RyaW5nKCkpXHJcbiAgZ2VuZXJhdGVQZXJtYWxpbmsoKVxyXG5cclxubG9nb3V0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiTG9nZ2luZyBvdXQuLi5cIlxyXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXHJcbiAgZGlzY29yZFRva2VuID0gbnVsbFxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luaGludFwiPihMb2dpbiBvbiA8YSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiPkRhc2hib2FyZDwvYT4pPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IGh0bWxcclxuICBpZiBsYXN0Q2xpY2tlZD9cclxuICAgIGxhc3RDbGlja2VkKClcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5jbGlwYm9hcmRFZGl0ID0gY2xpcGJvYXJkRWRpdFxyXG4gIHdpbmRvdy5nZW5lcmF0ZVBlcm1hbGluayA9IGdlbmVyYXRlUGVybWFsaW5rXHJcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxyXG4gIHdpbmRvdy5uZXdTb2xvSUQgPSBuZXdTb2xvSURcclxuICB3aW5kb3cuc2V0T3BpbmlvbiA9IHNldE9waW5pb25cclxuICB3aW5kb3cuc2hvd0xpc3QgPSBzaG93TGlzdFxyXG4gIHdpbmRvdy5zaG93V2F0Y2hGb3JtID0gc2hvd1dhdGNoRm9ybVxyXG4gIHdpbmRvdy5zaG93V2F0Y2hMaW5rID0gc2hvd1dhdGNoTGlua1xyXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXHJcbiAgd2luZG93LnNvbG9QYXVzZSA9IHNvbG9QYXVzZVxyXG4gIHdpbmRvdy5zb2xvUmVzdGFydCA9IHNvbG9SZXN0YXJ0XHJcbiAgd2luZG93LnNvbG9Ta2lwID0gc29sb1NraXBcclxuICB3aW5kb3cuc3RhcnRDYXN0ID0gc3RhcnRDYXN0XHJcblxyXG4gIHVwZGF0ZVNvbG9JRChxcygnc29sbycpKVxyXG5cclxuICBxc0ZpbHRlcnMgPSBxcygnZmlsdGVycycpXHJcbiAgaWYgcXNGaWx0ZXJzP1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlID0gcXNGaWx0ZXJzXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbHNcIikuY2hlY2tlZCA9IHFzKCdjb250cm9scycpP1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGlkZXRpdGxlc1wiKS5jaGVja2VkID0gcXMoJ2hpZGV0aXRsZXMnKT9cclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAtPlxyXG4gICAgaWYgc29sb0lEP1xyXG4gICAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcbiAgICAgIHNlbmRJZGVudGl0eSgpXHJcblxyXG4gIHNvY2tldC5vbiAnc29sbycsIChwa3QpIC0+XHJcbiAgICBzb2xvQ29tbWFuZChwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnaWRlbnRpZnknLCAocGt0KSAtPlxyXG4gICAgcmVjZWl2ZUlkZW50aXR5KHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICdvcGluaW9uJywgKHBrdCkgLT5cclxuICAgIHVwZGF0ZU9waW5pb24ocGt0KVxyXG5cclxuICBwcmVwYXJlQ2FzdCgpXHJcblxyXG4gIG5ldyBDbGlwYm9hcmQgJy5zaGFyZScsIHtcclxuICAgIHRleHQ6IC0+XHJcbiAgICAgIHJldHVybiBjYWxjU2hhcmVVUkwoKVxyXG4gIH1cclxuXHJcbiAgaWYgbGF1bmNoT3BlblxyXG4gICAgc2hvd1dhdGNoRm9ybSgpXHJcbiAgZWxzZVxyXG4gICAgc2hvd1dhdGNoTGluaygpXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgb3BpbmlvbnM6XHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcbiAgICBtZWg6IHRydWVcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgZ29vZE9waW5pb25zOiAjIGRvbid0IHNraXAgdGhlc2VcclxuICAgIGxvdmU6IHRydWVcclxuICAgIGxpa2U6IHRydWVcclxuXHJcbiAgd2Vha09waW5pb25zOiAjIHNraXAgdGhlc2UgaWYgd2UgYWxsIGFncmVlXHJcbiAgICBtZWg6IHRydWVcclxuXHJcbiAgYmFkT3BpbmlvbnM6ICMgc2tpcCB0aGVzZVxyXG4gICAgYmxlaDogdHJ1ZVxyXG4gICAgaGF0ZTogdHJ1ZVxyXG5cclxuICBvcGluaW9uT3JkZXI6IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXHJcbiJdfQ==
