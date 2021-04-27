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
var Clipboard, DASHCAST_NAMESPACE, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, constants, discordNickname, discordTag, discordToken, filters, formChanged, generatePermalink, i, init, launchOpen, len, logout, newSoloID, now, o, onError, onInitSuccess, opinionOrder, pageEpoch, prepareCast, qs, randomString, receiveIdentity, ref, renderClipboard, renderInfo, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, showList, showWatchForm, showWatchLink, socket, soloCommand, soloID, soloInfo, soloPause, soloRestart, soloSkip, startCast, updateOpinion, updateSoloID;

constants = require('../constants');

Clipboard = require('clipboard');

filters = require('../filters');

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
  if (params.get("mirror") != null) {
    params.delete("filters");
  } else {
    params.delete("solo");
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
  window.formChanged = formChanged;
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
  document.getElementById("mirror").checked = qs('mirror') != null;
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
  setServerDatabases: setServerDatabases,
  generateList: generateList
};


},{"iso8601-duration":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9zb2xvLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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RkEsS0FBQSxvQkFBQTs7TUFDRSxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQUYsSUFBYSxVQUFkLENBQUEsSUFBOEIsQ0FBSSxDQUFDLENBQUMsT0FBdkM7UUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQixFQURGOztJQURGLENBM0ZGO0dBQUEsTUFBQTs7SUFnR0UsS0FBQSxvQkFBQTs7TUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQjtJQURGLENBaEdGOztFQW1HQSxJQUFHLFlBQUg7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNsQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLEVBRFQ7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxFQURUOztBQUVBLGFBQU87SUFUVyxDQUFwQixFQURGOztBQVdBLFNBQU87QUFwSU07O0FBc0lmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWM7QUFEZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIVxuICogY2xpcGJvYXJkLmpzIHYyLjAuOFxuICogaHR0cHM6Ly9jbGlwYm9hcmRqcy5jb20vXG4gKlxuICogTGljZW5zZWQgTUlUIMKpIFplbm8gUm9jaGFcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24oKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVzX18gPSAoe1xuXG4vKioqLyAxMzQ6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIEVYUE9SVFNcbl9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCB7XG4gIFwiZGVmYXVsdFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIC8qIGJpbmRpbmcgKi8gY2xpcGJvYXJkOyB9XG59KTtcblxuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy90aW55LWVtaXR0ZXIvaW5kZXguanNcbnZhciB0aW55X2VtaXR0ZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI3OSk7XG52YXIgdGlueV9lbWl0dGVyX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKHRpbnlfZW1pdHRlcik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL2dvb2QtbGlzdGVuZXIvc3JjL2xpc3Rlbi5qc1xudmFyIGxpc3RlbiA9IF9fd2VicGFja19yZXF1aXJlX18oMzcwKTtcbnZhciBsaXN0ZW5fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4obGlzdGVuKTtcbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvc2VsZWN0L3NyYy9zZWxlY3QuanNcbnZhciBzcmNfc2VsZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MTcpO1xudmFyIHNlbGVjdF9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubihzcmNfc2VsZWN0KTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQtYWN0aW9uLmpzXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuXG4vKipcbiAqIElubmVyIGNsYXNzIHdoaWNoIHBlcmZvcm1zIHNlbGVjdGlvbiBmcm9tIGVpdGhlciBgdGV4dGAgb3IgYHRhcmdldGBcbiAqIHByb3BlcnRpZXMgYW5kIHRoZW4gZXhlY3V0ZXMgY29weSBvciBjdXQgb3BlcmF0aW9ucy5cbiAqL1xuXG52YXIgQ2xpcGJvYXJkQWN0aW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBDbGlwYm9hcmRBY3Rpb24ob3B0aW9ucykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbGlwYm9hcmRBY3Rpb24pO1xuXG4gICAgdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLmluaXRTZWxlY3Rpb24oKTtcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBiYXNlIHByb3BlcnRpZXMgcGFzc2VkIGZyb20gY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKENsaXBib2FyZEFjdGlvbiwgW3tcbiAgICBrZXk6IFwicmVzb2x2ZU9wdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmFjdGlvbiA9IG9wdGlvbnMuYWN0aW9uO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICAgIHRoaXMuZW1pdHRlciA9IG9wdGlvbnMuZW1pdHRlcjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSBvcHRpb25zLnRleHQ7XG4gICAgICB0aGlzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXI7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWNpZGVzIHdoaWNoIHNlbGVjdGlvbiBzdHJhdGVneSBpcyBnb2luZyB0byBiZSBhcHBsaWVkIGJhc2VkXG4gICAgICogb24gdGhlIGV4aXN0ZW5jZSBvZiBgdGV4dGAgYW5kIGB0YXJnZXRgIHByb3BlcnRpZXMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpbml0U2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRTZWxlY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50ZXh0KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0RmFrZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCkge1xuICAgICAgICB0aGlzLnNlbGVjdFRhcmdldCgpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZmFrZSB0ZXh0YXJlYSBlbGVtZW50LCBzZXRzIGl0cyB2YWx1ZSBmcm9tIGB0ZXh0YCBwcm9wZXJ0eSxcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNyZWF0ZUZha2VFbGVtZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUZha2VFbGVtZW50KCkge1xuICAgICAgdmFyIGlzUlRMID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGlyJykgPT09ICdydGwnO1xuICAgICAgdGhpcy5mYWtlRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7IC8vIFByZXZlbnQgem9vbWluZyBvbiBpT1NcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5mb250U2l6ZSA9ICcxMnB0JzsgLy8gUmVzZXQgYm94IG1vZGVsXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuYm9yZGVyID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wYWRkaW5nID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5tYXJnaW4gPSAnMCc7IC8vIE1vdmUgZWxlbWVudCBvdXQgb2Ygc2NyZWVuIGhvcml6b250YWxseVxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGVbaXNSVEwgPyAncmlnaHQnIDogJ2xlZnQnXSA9ICctOTk5OXB4JzsgLy8gTW92ZSBlbGVtZW50IHRvIHRoZSBzYW1lIHBvc2l0aW9uIHZlcnRpY2FsbHlcblxuICAgICAgdmFyIHlQb3NpdGlvbiA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS50b3AgPSBcIlwiLmNvbmNhdCh5UG9zaXRpb24sIFwicHhcIik7XG4gICAgICB0aGlzLmZha2VFbGVtLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICB0aGlzLmZha2VFbGVtLnZhbHVlID0gdGhpcy50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMuZmFrZUVsZW07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCdzIHRoZSB2YWx1ZSBvZiBmYWtlRWxlbSxcbiAgICAgKiBhbmQgbWFrZXMgYSBzZWxlY3Rpb24gb24gaXQuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdEZha2UoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZmFrZUVsZW0gPSB0aGlzLmNyZWF0ZUZha2VFbGVtZW50KCk7XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZha2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjaykgfHwgdHJ1ZTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGZha2VFbGVtKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKShmYWtlRWxlbSk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT25seSByZW1vdmVzIHRoZSBmYWtlIGVsZW1lbnQgYWZ0ZXIgYW5vdGhlciBjbGljayBldmVudCwgdGhhdCB3YXlcbiAgICAgKiBhIHVzZXIgY2FuIGhpdCBgQ3RybCtDYCB0byBjb3B5IGJlY2F1c2Ugc2VsZWN0aW9uIHN0aWxsIGV4aXN0cy5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlbW92ZUZha2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRmFrZSgpIHtcbiAgICAgIGlmICh0aGlzLmZha2VIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5mYWtlSGFuZGxlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmZha2VFbGVtKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuZmFrZUVsZW0pO1xuICAgICAgICB0aGlzLmZha2VFbGVtID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgY29udGVudCBmcm9tIGVsZW1lbnQgcGFzc2VkIG9uIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0VGFyZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdFRhcmdldCgpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKSh0aGlzLnRhcmdldCk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBjb3B5IG9wZXJhdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjb3B5VGV4dFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5VGV4dCgpIHtcbiAgICAgIHZhciBzdWNjZWVkZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN1Y2NlZWRlZCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuYWN0aW9uKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oYW5kbGVSZXN1bHQoc3VjY2VlZGVkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlyZXMgYW4gZXZlbnQgYmFzZWQgb24gdGhlIGNvcHkgb3BlcmF0aW9uIHJlc3VsdC5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHN1Y2NlZWRlZFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlUmVzdWx0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlc3VsdChzdWNjZWVkZWQpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KHN1Y2NlZWRlZCA/ICdzdWNjZXNzJyA6ICdlcnJvcicsIHtcbiAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgdGV4dDogdGhpcy5zZWxlY3RlZFRleHQsXG4gICAgICAgIHRyaWdnZXI6IHRoaXMudHJpZ2dlcixcbiAgICAgICAgY2xlYXJTZWxlY3Rpb246IHRoaXMuY2xlYXJTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIGZvY3VzIGF3YXkgZnJvbSBgdGFyZ2V0YCBhbmQgYmFjayB0byB0aGUgdHJpZ2dlciwgcmVtb3ZlcyBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNsZWFyU2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudHJpZ2dlcikge1xuICAgICAgICB0aGlzLnRyaWdnZXIuZm9jdXMoKTtcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGBhY3Rpb25gIHRvIGJlIHBlcmZvcm1lZCB3aGljaCBjYW4gYmUgZWl0aGVyICdjb3B5JyBvciAnY3V0Jy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMucmVtb3ZlRmFrZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhY3Rpb25cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCgpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICdjb3B5JztcbiAgICAgIHRoaXMuX2FjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgaWYgKHRoaXMuX2FjdGlvbiAhPT0gJ2NvcHknICYmIHRoaXMuX2FjdGlvbiAhPT0gJ2N1dCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwiYWN0aW9uXCIgdmFsdWUsIHVzZSBlaXRoZXIgXCJjb3B5XCIgb3IgXCJjdXRcIicpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgYWN0aW9uYCBwcm9wZXJ0eS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkgdXNpbmcgYW4gZWxlbWVudFxuICAgICAqIHRoYXQgd2lsbCBiZSBoYXZlIGl0cyBjb250ZW50IGNvcGllZC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwidGFyZ2V0XCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiBfdHlwZW9mKHRhcmdldCkgPT09ICdvYmplY3QnICYmIHRhcmdldC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2NvcHknICYmIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gUGxlYXNlIHVzZSBcInJlYWRvbmx5XCIgaW5zdGVhZCBvZiBcImRpc2FibGVkXCIgYXR0cmlidXRlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAnY3V0JyAmJiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgncmVhZG9ubHknKSB8fCB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgYXR0cmlidXRlLiBZb3UgY2FuXFwndCBjdXQgdGV4dCBmcm9tIGVsZW1lbnRzIHdpdGggXCJyZWFkb25seVwiIG9yIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGVzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIHZhbHVlLCB1c2UgYSB2YWxpZCBFbGVtZW50Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfEhUTUxFbGVtZW50fVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZEFjdGlvbjtcbn0oKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkX2FjdGlvbiA9IChDbGlwYm9hcmRBY3Rpb24pO1xuOy8vIENPTkNBVEVOQVRFRCBNT0RVTEU6IC4vc3JjL2NsaXBib2FyZC5qc1xuZnVuY3Rpb24gY2xpcGJvYXJkX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBjbGlwYm9hcmRfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIGNsaXBib2FyZF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVTdXBlcihEZXJpdmVkKSB7IHZhciBoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpOyByZXR1cm4gZnVuY3Rpb24gX2NyZWF0ZVN1cGVySW50ZXJuYWwoKSB7IHZhciBTdXBlciA9IF9nZXRQcm90b3R5cGVPZihEZXJpdmVkKSwgcmVzdWx0OyBpZiAoaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCkgeyB2YXIgTmV3VGFyZ2V0ID0gX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yOyByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChTdXBlciwgYXJndW1lbnRzLCBOZXdUYXJnZXQpOyB9IGVsc2UgeyByZXN1bHQgPSBTdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9IHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCByZXN1bHQpOyB9OyB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKGNhbGwgJiYgKGNsaXBib2FyZF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHsgcmV0dXJuIGNhbGw7IH0gcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChEYXRlLCBbXSwgZnVuY3Rpb24gKCkge30pKTsgcmV0dXJuIHRydWU7IH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9IH1cblxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTsgfTsgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTsgfVxuXG5cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byByZXRyaWV2ZSBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3VmZml4XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqL1xuXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVWYWx1ZShzdWZmaXgsIGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZSA9IFwiZGF0YS1jbGlwYm9hcmQtXCIuY29uY2F0KHN1ZmZpeCk7XG5cbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG59XG4vKipcbiAqIEJhc2UgY2xhc3Mgd2hpY2ggdGFrZXMgb25lIG9yIG1vcmUgZWxlbWVudHMsIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZW0sXG4gKiBhbmQgaW5zdGFudGlhdGVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2suXG4gKi9cblxuXG52YXIgQ2xpcGJvYXJkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfRW1pdHRlcikge1xuICBfaW5oZXJpdHMoQ2xpcGJvYXJkLCBfRW1pdHRlcik7XG5cbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihDbGlwYm9hcmQpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkKHRyaWdnZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkKTtcblxuICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcyk7XG5cbiAgICBfdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIF90aGlzLmxpc3RlbkNsaWNrKHRyaWdnZXIpO1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIC8qKlxuICAgKiBEZWZpbmVzIGlmIGF0dHJpYnV0ZXMgd291bGQgYmUgcmVzb2x2ZWQgdXNpbmcgaW50ZXJuYWwgc2V0dGVyIGZ1bmN0aW9uc1xuICAgKiBvciBjdXN0b20gZnVuY3Rpb25zIHRoYXQgd2VyZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDbGlwYm9hcmQsIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSB0eXBlb2Ygb3B0aW9ucy5hY3Rpb24gPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLmFjdGlvbiA6IHRoaXMuZGVmYXVsdEFjdGlvbjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdHlwZW9mIG9wdGlvbnMudGFyZ2V0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50YXJnZXQgOiB0aGlzLmRlZmF1bHRUYXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSB0eXBlb2Ygb3B0aW9ucy50ZXh0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50ZXh0IDogdGhpcy5kZWZhdWx0VGV4dDtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gY2xpcGJvYXJkX3R5cGVvZihvcHRpb25zLmNvbnRhaW5lcikgPT09ICdvYmplY3QnID8gb3B0aW9ucy5jb250YWluZXIgOiBkb2N1bWVudC5ib2R5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHBhc3NlZCB0cmlnZ2VyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsaXN0ZW5DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0ZW5DbGljayh0cmlnZ2VyKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdGhpcy5saXN0ZW5lciA9IGxpc3Rlbl9kZWZhdWx0KCkodHJpZ2dlciwgJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMi5vbkNsaWNrKGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBuZXcgYENsaXBib2FyZEFjdGlvbmAgb24gZWFjaCBjbGljayBldmVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJvbkNsaWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgdmFyIHRyaWdnZXIgPSBlLmRlbGVnYXRlVGFyZ2V0IHx8IGUuY3VycmVudFRhcmdldDtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBuZXcgY2xpcGJvYXJkX2FjdGlvbih7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24odHJpZ2dlciksXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQodHJpZ2dlciksXG4gICAgICAgIHRleHQ6IHRoaXMudGV4dCh0cmlnZ2VyKSxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgdHJpZ2dlcjogdHJpZ2dlcixcbiAgICAgICAgZW1pdHRlcjogdGhpc1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYGFjdGlvbmAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdEFjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0QWN0aW9uKHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgnYWN0aW9uJywgdHJpZ2dlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYHRhcmdldGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGFyZ2V0KHRyaWdnZXIpIHtcbiAgICAgIHZhciBzZWxlY3RvciA9IGdldEF0dHJpYnV0ZVZhbHVlKCd0YXJnZXQnLCB0cmlnZ2VyKTtcblxuICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc3VwcG9ydCBvZiB0aGUgZ2l2ZW4gYWN0aW9uLCBvciBhbGwgYWN0aW9ucyBpZiBubyBhY3Rpb24gaXNcbiAgICAgKiBnaXZlbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2FjdGlvbl1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUZXh0XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0ZXh0YCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRUZXh0KHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgndGV4dCcsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5jbGlwYm9hcmRBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XSwgW3tcbiAgICBrZXk6IFwiaXNTdXBwb3J0ZWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNTdXBwb3J0ZWQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbJ2NvcHknLCAnY3V0J107XG4gICAgICB2YXIgYWN0aW9ucyA9IHR5cGVvZiBhY3Rpb24gPT09ICdzdHJpbmcnID8gW2FjdGlvbl0gOiBhY3Rpb247XG4gICAgICB2YXIgc3VwcG9ydCA9ICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkO1xuICAgICAgYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgc3VwcG9ydCA9IHN1cHBvcnQgJiYgISFkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQoYWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN1cHBvcnQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZDtcbn0oKHRpbnlfZW1pdHRlcl9kZWZhdWx0KCkpKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkID0gKENsaXBib2FyZCk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Mjg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbnZhciBET0NVTUVOVF9OT0RFX1RZUEUgPSA5O1xuXG4vKipcbiAqIEEgcG9seWZpbGwgZm9yIEVsZW1lbnQubWF0Y2hlcygpXG4gKi9cbmlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICB2YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuICAgIHByb3RvLm1hdGNoZXMgPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IG1hdGNoZXMgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNsb3Nlc3QgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgd2hpbGUgKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSAhPT0gRE9DVU1FTlRfTk9ERV9UWVBFKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5tYXRjaGVzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvc2VzdDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNDM4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX191bnVzZWRfd2VicGFja19leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBjbG9zZXN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MjgpO1xuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgdmFyIGxpc3RlbmVyRm4gPSBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXJGbiwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRGVsZWdhdGVzIGV2ZW50IHRvIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fFN0cmluZ3xBcnJheX0gW2VsZW1lbnRzXVxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBkZWxlZ2F0ZShlbGVtZW50cywgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgLy8gSGFuZGxlIHRoZSByZWd1bGFyIEVsZW1lbnQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBFbGVtZW50LWxlc3MgdXNhZ2UsIGl0IGRlZmF1bHRzIHRvIGdsb2JhbCBkZWxlZ2F0aW9uXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIFVzZSBgZG9jdW1lbnRgIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIHRoZW4gYXBwbHkgYXJndW1lbnRzXG4gICAgICAgIC8vIFRoaXMgaXMgYSBzaG9ydCB3YXkgdG8gLnVuc2hpZnQgYGFyZ3VtZW50c2Agd2l0aG91dCBydW5uaW5nIGludG8gZGVvcHRpbWl6YXRpb25zXG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYmluZChudWxsLCBkb2N1bWVudCkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgU2VsZWN0b3ItYmFzZWQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzID09PSAnc3RyaW5nJykge1xuICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBBcnJheS1saWtlIGJhc2VkIHVzYWdlXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChlbGVtZW50cywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZShlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEZpbmRzIGNsb3Nlc3QgbWF0Y2ggYW5kIGludm9rZXMgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUuZGVsZWdhdGVUYXJnZXQgPSBjbG9zZXN0KGUudGFyZ2V0LCBzZWxlY3Rvcik7XG5cbiAgICAgICAgaWYgKGUuZGVsZWdhdGVUYXJnZXQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoZWxlbWVudCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVsZWdhdGU7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDg3OTpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgZXhwb3J0cykge1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgSFRNTCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5ub2RlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiB2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XG4gICAgICAgICYmIHZhbHVlLm5vZGVUeXBlID09PSAxO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZUxpc3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcblxuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICYmICh0eXBlID09PSAnW29iamVjdCBOb2RlTGlzdF0nIHx8IHR5cGUgPT09ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXScpXG4gICAgICAgICYmICgnbGVuZ3RoJyBpbiB2YWx1ZSlcbiAgICAgICAgJiYgKHZhbHVlLmxlbmd0aCA9PT0gMCB8fCBleHBvcnRzLm5vZGUodmFsdWVbMF0pKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLnN0cmluZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmc7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLmZuID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdHlwZSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDM3MDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgaXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDg3OSk7XG52YXIgZGVsZWdhdGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzOCk7XG5cbi8qKlxuICogVmFsaWRhdGVzIGFsbCBwYXJhbXMgYW5kIGNhbGxzIHRoZSByaWdodFxuICogbGlzdGVuZXIgZnVuY3Rpb24gYmFzZWQgb24gaXRzIHRhcmdldCB0eXBlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW4odGFyZ2V0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIGlmICghdGFyZ2V0ICYmICF0eXBlICYmICFjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5zdHJpbmcodHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzLmZuKGNhbGxiYWNrKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlyZCBhcmd1bWVudCBtdXN0IGJlIGEgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAoaXMubm9kZSh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5ub2RlTGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlTGlzdCh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMuc3RyaW5nKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlblNlbGVjdG9yKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIFN0cmluZywgSFRNTEVsZW1lbnQsIEhUTUxDb2xsZWN0aW9uLCBvciBOb2RlTGlzdCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgSFRNTCBlbGVtZW50XG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTm9kZShub2RlLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgbGlzdCBvZiBIVE1MIGVsZW1lbnRzXG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fEhUTUxDb2xsZWN0aW9ufSBub2RlTGlzdFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGVMaXN0KG5vZGVMaXN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBzZWxlY3RvclxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuU2VsZWN0b3Ioc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGRlbGVnYXRlKGRvY3VtZW50LmJvZHksIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdGVuO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4MTc6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIHNlbGVjdChlbGVtZW50KSB7XG4gICAgdmFyIHNlbGVjdGVkVGV4dDtcblxuICAgIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbGVtZW50Lm5vZGVOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgIHZhciBpc1JlYWRPbmx5ID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDAsIGVsZW1lbnQudmFsdWUubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyZWFkb25seScpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkVGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxlY3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDI3OTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxuZnVuY3Rpb24gRSAoKSB7XG4gIC8vIEtlZXAgdGhpcyBlbXB0eSBzbyBpdCdzIGVhc2llciB0byBpbmhlcml0IGZyb21cbiAgLy8gKHZpYSBodHRwczovL2dpdGh1Yi5jb20vbGlwc21hY2sgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2lzc3Vlcy8zKVxufVxuXG5FLnByb3RvdHlwZSA9IHtcbiAgb246IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcblxuICAgIChlW25hbWVdIHx8IChlW25hbWVdID0gW10pKS5wdXNoKHtcbiAgICAgIGZuOiBjYWxsYmFjayxcbiAgICAgIGN0eDogY3R4XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvbmNlOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICBzZWxmLm9mZihuYW1lLCBsaXN0ZW5lcik7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxpc3RlbmVyLl8gPSBjYWxsYmFja1xuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGxpc3RlbmVyLCBjdHgpO1xuICB9LFxuXG4gIGVtaXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGRhdGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGV2dEFyciA9ICgodGhpcy5lIHx8ICh0aGlzLmUgPSB7fSkpW25hbWVdIHx8IFtdKS5zbGljZSgpO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuID0gZXZ0QXJyLmxlbmd0aDtcblxuICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBldnRBcnJbaV0uZm4uYXBwbHkoZXZ0QXJyW2ldLmN0eCwgZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb2ZmOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgIHZhciBldnRzID0gZVtuYW1lXTtcbiAgICB2YXIgbGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgaWYgKGV2dHMgJiYgY2FsbGJhY2spIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChldnRzW2ldLmZuICE9PSBjYWxsYmFjayAmJiBldnRzW2ldLmZuLl8gIT09IGNhbGxiYWNrKVxuICAgICAgICAgIGxpdmVFdmVudHMucHVzaChldnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZXZlbnQgZnJvbSBxdWV1ZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrXG4gICAgLy8gU3VnZ2VzdGVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9sYXpkXG4gICAgLy8gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2NvbW1pdC9jNmViZmFhOWJjOTczYjMzZDExMGE4NGEzMDc3NDJiN2NmOTRjOTUzI2NvbW1pdGNvbW1lbnQtNTAyNDkxMFxuXG4gICAgKGxpdmVFdmVudHMubGVuZ3RoKVxuICAgICAgPyBlW25hbWVdID0gbGl2ZUV2ZW50c1xuICAgICAgOiBkZWxldGUgZVtuYW1lXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEU7XG5tb2R1bGUuZXhwb3J0cy5UaW55RW1pdHRlciA9IEU7XG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gXHR9KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcbi8qKioqKiovIFx0XHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcbi8qKioqKiovIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuLyoqKioqKi8gXHRcdFx0XHR9XG4vKioqKioqLyBcdFx0XHR9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfVxuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSByZXR1cm5lZCBmcm9tIHJ1bnRpbWUgc28gZW50cnkgaW5saW5pbmcgaXMgZGlzYWJsZWRcbi8qKioqKiovIFx0Ly8gc3RhcnR1cFxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMTM0KTtcbi8qKioqKiovIH0pKClcbi5kZWZhdWx0O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXG5DbGlwYm9hcmQgPSByZXF1aXJlICdjbGlwYm9hcmQnXG5maWx0ZXJzID0gcmVxdWlyZSAnLi4vZmlsdGVycydcblxuc29ja2V0ID0gbnVsbFxuXG5EQVNIQ0FTVF9OQU1FU1BBQ0UgPSAndXJuOngtY2FzdDplcy5vZmZkLmRhc2hjYXN0J1xuXG5zb2xvSUQgPSBudWxsXG5zb2xvSW5mbyA9IHt9XG5cbmRpc2NvcmRUb2tlbiA9IG51bGxcbmRpc2NvcmRUYWcgPSBudWxsXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXG5cbmNhc3RBdmFpbGFibGUgPSBmYWxzZVxuY2FzdFNlc3Npb24gPSBudWxsXG5cbmxhdW5jaE9wZW4gPSAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhdW5jaCcpID09IFwidHJ1ZVwiKVxuY29uc29sZS5sb2cgXCJsYXVuY2hPcGVuOiAje2xhdW5jaE9wZW59XCJcblxub3Bpbmlvbk9yZGVyID0gW11cbmZvciBvIGluIGNvbnN0YW50cy5vcGluaW9uT3JkZXJcbiAgb3Bpbmlvbk9yZGVyLnB1c2ggb1xub3Bpbmlvbk9yZGVyLnB1c2goJ25vbmUnKVxuXG5yYW5kb21TdHJpbmcgPSAtPlxuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSlcblxubm93ID0gLT5cbiAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG5cbnBhZ2VFcG9jaCA9IG5vdygpXG5cbnFzID0gKG5hbWUpIC0+XG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKVxuICByZWdleCA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICcoPShbXiYjXSopfCZ8I3wkKScpXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gIGlmIG5vdCByZXN1bHRzIG9yIG5vdCByZXN1bHRzWzJdXG4gICAgcmV0dXJuIG51bGxcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxuXG5zaG93V2F0Y2hGb3JtID0gLT5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXN0YnV0dG9uJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS5mb2N1cygpXG4gIGxhdW5jaE9wZW4gPSB0cnVlXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsYXVuY2gnLCAndHJ1ZScpXG5cbnNob3dXYXRjaExpbmsgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNsaW5rJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gIGxhdW5jaE9wZW4gPSBmYWxzZVxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGF1bmNoJywgJ2ZhbHNlJylcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcblxub25Jbml0U3VjY2VzcyA9IC0+XG4gIGNvbnNvbGUubG9nIFwiQ2FzdCBhdmFpbGFibGUhXCJcbiAgY2FzdEF2YWlsYWJsZSA9IHRydWVcblxub25FcnJvciA9IChtZXNzYWdlKSAtPlxuXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cbiAgY2FzdFNlc3Npb24gPSBlXG5cbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxuICBpZiBub3QgaXNBbGl2ZVxuICAgIGNhc3RTZXNzaW9uID0gbnVsbFxuXG5wcmVwYXJlQ2FzdCA9IC0+XG4gIGlmIG5vdCBjaHJvbWUuY2FzdCBvciBub3QgY2hyb21lLmNhc3QuaXNBdmFpbGFibGVcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHByZXBhcmVDYXN0LCAxMDApXG4gICAgcmV0dXJuXG5cbiAgc2Vzc2lvblJlcXVlc3QgPSBuZXcgY2hyb21lLmNhc3QuU2Vzc2lvblJlcXVlc3QoJzVDM0YwQTNDJykgIyBEYXNoY2FzdFxuICBhcGlDb25maWcgPSBuZXcgY2hyb21lLmNhc3QuQXBpQ29uZmlnIHNlc3Npb25SZXF1ZXN0LCBzZXNzaW9uTGlzdGVuZXIsIC0+XG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxuXG5jYWxjU2hhcmVVUkwgPSAtPlxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXG4gIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoZm9ybURhdGEpXG4gIGlmIHBhcmFtcy5nZXQoXCJtaXJyb3JcIik/XG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcbiAgZWxzZVxuICAgIHBhcmFtcy5kZWxldGUoXCJzb2xvXCIpXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCI/XCIgKyBxdWVyeXN0cmluZ1xuICByZXR1cm4gbXR2VVJMXG5cbnN0YXJ0Q2FzdCA9IC0+XG4gIGNvbnNvbGUubG9nIFwic3RhcnQgY2FzdCFcIlxuXG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcbiAgaWYgcGFyYW1zLmdldChcIm1pcnJvclwiKT9cbiAgICBwYXJhbXMuZGVsZXRlKFwiZmlsdGVyc1wiKVxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcbiAgYmFzZVVSTCA9IGJhc2VVUkwucmVwbGFjZSgvc29sbyQvLCBcIlwiKVxuICBtdHZVUkwgPSBiYXNlVVJMICsgXCJ3YXRjaD9cIiArIHF1ZXJ5c3RyaW5nXG4gIGNvbnNvbGUubG9nIFwiV2UncmUgZ29pbmcgaGVyZTogI3ttdHZVUkx9XCJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XG4gICAgY2FzdFNlc3Npb24gPSBlXG4gICAgY2FzdFNlc3Npb24uc2VuZE1lc3NhZ2UoREFTSENBU1RfTkFNRVNQQUNFLCB7IHVybDogbXR2VVJMLCBmb3JjZTogdHJ1ZSB9KVxuICAsIG9uRXJyb3JcblxuY2FsY1Blcm1hbGluayA9IC0+XG4gIGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJylcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcbiAgcXVlcnlzdHJpbmcgPSBwYXJhbXMudG9TdHJpbmcoKVxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXG4gIHJldHVybiBtdHZVUkxcblxuZ2VuZXJhdGVQZXJtYWxpbmsgPSAtPlxuICBjb25zb2xlLmxvZyBcImdlbmVyYXRlUGVybWFsaW5rKClcIlxuICB3aW5kb3cubG9jYXRpb24gPSBjYWxjUGVybWFsaW5rKClcblxuZm9ybUNoYW5nZWQgPSAtPlxuICBjb25zb2xlLmxvZyBcIkZvcm0gY2hhbmdlZCFcIlxuICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnaGVyZScsICcnLCBjYWxjUGVybWFsaW5rKCkpXG5cbnNvbG9Ta2lwID0gLT5cbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XG4gICAgaWQ6IHNvbG9JRFxuICAgIGNtZDogJ3NraXAnXG4gIH1cblxuc29sb1Jlc3RhcnQgPSAtPlxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcbiAgICBpZDogc29sb0lEXG4gICAgY21kOiAncmVzdGFydCdcbiAgfVxuXG5zb2xvUGF1c2UgPSAtPlxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcbiAgICBpZDogc29sb0lEXG4gICAgY21kOiAncGF1c2UnXG4gIH1cblxucmVuZGVySW5mbyA9IC0+XG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/XG4gICAgcmV0dXJuXG5cbiAgdGFnc1N0cmluZyA9IE9iamVjdC5rZXlzKHNvbG9JbmZvLmN1cnJlbnQudGFncykuc29ydCgpLmpvaW4oJywgJylcblxuICBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj5UcmFjayAje3NvbG9JbmZvLmluZGV4fSAvICN7c29sb0luZm8uY291bnR9PC9kaXY+XCJcbiAgIyBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2hlYWRpbmdcXFwiPkN1cnJlbnQ6IFs8c3BhbiBjbGFzcz1cXFwieW91dHViZWlkXFxcIj4je3NvbG9JbmZvLmN1cnJlbnQuaWR9PC9zcGFuPl08L2Rpdj5cIlxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RodW1iXFxcIj48YSBocmVmPVxcXCJodHRwczovL3lvdXR1LmJlLyN7ZW5jb2RlVVJJQ29tcG9uZW50KHNvbG9JbmZvLmN1cnJlbnQuaWQpfVxcXCI+PGltZyB3aWR0aD0zMjAgaGVpZ2h0PTE4MCBzcmM9XFxcIiN7c29sb0luZm8uY3VycmVudC50aHVtYn1cXFwiPjwvYT48L2Rpdj5cIlxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2N1cnJlbnQgaW5mb2FydGlzdFxcXCI+I3tzb2xvSW5mby5jdXJyZW50LmFydGlzdH08L2Rpdj5cIlxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RpdGxlXFxcIj5cXFwiI3tzb2xvSW5mby5jdXJyZW50LnRpdGxlfVxcXCI8L2Rpdj5cIlxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RhZ3NcXFwiPiZuYnNwOyN7dGFnc1N0cmluZ30mbmJzcDs8L2Rpdj5cIlxuICBpZiBzb2xvSW5mby5uZXh0P1xuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2hlYWRpbmcgbmV4dHZpZGVvXFxcIj5OZXh0Ojwvc3Bhbj4gXCJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm9hcnRpc3QgbmV4dHZpZGVvXFxcIj4je3NvbG9JbmZvLm5leHQuYXJ0aXN0fTwvc3Bhbj5cIlxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwibmV4dHZpZGVvXFxcIj4gLSA8L3NwYW4+XCJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje3NvbG9JbmZvLm5leHQudGl0bGV9XFxcIjwvc3Bhbj5cIlxuICBlbHNlXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJpbmZvaGVhZGluZyBuZXh0dmlkZW9cXFwiPk5leHQ6PC9zcGFuPiBcIlxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3Jlc2h1ZmZsZSBuZXh0dmlkZW9cXFwiPiguLi5SZXNodWZmbGUuLi4pPC9zcGFuPlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmZvJykuaW5uZXJIVE1MID0gaHRtbFxuXG5jbGlwYm9hcmRFZGl0ID0gLT5cbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcGJvYXJkJykuaW5uZXJIVE1MID0gaHRtbFxuICBzZXRUaW1lb3V0IC0+XG4gICAgcmVuZGVyQ2xpcGJvYXJkKClcbiAgLCAyMDAwXG5cbnJlbmRlckNsaXBib2FyZCA9IC0+XG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/XG4gICAgcmV0dXJuXG5cbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0b1xcXCIgZGF0YS1jbGlwYm9hcmQtdGV4dD1cXFwiI210diBlZGl0ICN7c29sb0luZm8uY3VycmVudC5pZH0gXFxcIiBvbmNsaWNrPVxcXCJjbGlwYm9hcmRFZGl0KCk7IHJldHVybiBmYWxzZVxcXCI+RWRpdDwvYT5cIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcGJvYXJkJykuaW5uZXJIVE1MID0gaHRtbFxuICBuZXcgQ2xpcGJvYXJkKCcuY2J1dHRvJylcblxuc2hhcmVDbGlwYm9hcmQgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJlY29waWVkXFxcIj5Db3BpZWQgdG8gY2xpcGJvYXJkOjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNTaGFyZVVSTCgpfTwvZGl2PlxuICBcIlwiXCJcblxuc2hvd0xpc3QgPSAtPlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiUGxlYXNlIHdhaXQuLi5cIlxuXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWU7XG4gIGxpc3QgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcsIHRydWUpXG4gIGlmIG5vdCBsaXN0P1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJFcnJvci4gU29ycnkuXCJcbiAgICByZXR1cm5cblxuICBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJsaXN0Y29udGFpbmVyXFxcIj5cIlxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOjwvZGl2PlwiXG4gIGZvciBlIGluIGxpc3RcbiAgICBodG1sICs9IFwiPGRpdj5cIlxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXG4gICAgaHRtbCArPSBcIjxzcGFuIGNsYXNzPVxcXCJuZXh0dmlkZW9cXFwiPiAtIDwvc3Bhbj5cIlxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3RpdGxlIG5leHR2aWRlb1xcXCI+XFxcIiN7ZS50aXRsZX1cXFwiPC9zcGFuPlwiXG4gICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXG5cbiAgaHRtbCArPSBcIjwvZGl2PlwiXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBodG1sXG5cbmNsZWFyT3BpbmlvbiA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IFwiXCJcblxudXBkYXRlT3BpbmlvbiA9IChwa3QpIC0+XG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/IG9yIG5vdCAocGt0LmlkID09IHNvbG9JbmZvLmN1cnJlbnQuaWQpXG4gICAgcmV0dXJuXG5cbiAgaHRtbCA9IFwiXCJcbiAgZm9yIG8gaW4gb3Bpbmlvbk9yZGVyIGJ5IC0xXG4gICAgY2FwbyA9IG8uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBvLnNsaWNlKDEpXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcbiAgICBpZiBvID09IHBrdC5vcGluaW9uXG4gICAgICBjbGFzc2VzICs9IFwiIGNob3NlblwiXG4gICAgaHRtbCArPSBcIlwiXCJcbiAgICAgIDxhIGNsYXNzPVwiI3tjbGFzc2VzfVwiIG9uY2xpY2s9XCJzZXRPcGluaW9uKCcje299Jyk7IHJldHVybiBmYWxzZTtcIj4je2NhcG99PC9hPlxuICAgIFwiXCJcIlxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBodG1sXG5cbnNldE9waW5pb24gPSAob3BpbmlvbikgLT5cbiAgaWYgbm90IGRpc2NvcmRUb2tlbj8gb3Igbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQuaWQ/XG4gICAgcmV0dXJuXG5cbiAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBzb2xvSW5mby5jdXJyZW50LmlkLCBzZXQ6IG9waW5pb24gfVxuXG5zb2xvQ29tbWFuZCA9IChwa3QpIC0+XG4gIGlmIHBrdC5pZCAhPSBzb2xvSURcbiAgICByZXR1cm5cbiAgY29uc29sZS5sb2cgXCJzb2xvQ29tbWFuZDogXCIsIHBrdFxuICBzd2l0Y2ggcGt0LmNtZFxuICAgIHdoZW4gJ2luZm8nXG4gICAgICBpZiBwa3QuaW5mbz9cbiAgICAgICAgY29uc29sZS5sb2cgXCJORVcgSU5GTyE6IFwiLCBwa3QuaW5mb1xuICAgICAgICBzb2xvSW5mbyA9IHBrdC5pbmZvXG4gICAgICAgIHJlbmRlckluZm8oKVxuICAgICAgICByZW5kZXJDbGlwYm9hcmQoKVxuICAgICAgICBjbGVhck9waW5pb24oKVxuICAgICAgICBpZiBkaXNjb3JkVG9rZW4/IGFuZCBzb2xvSW5mby5jdXJyZW50PyBhbmQgc29sb0luZm8uY3VycmVudC5pZD9cbiAgICAgICAgICBzb2NrZXQuZW1pdCAnb3BpbmlvbicsIHsgdG9rZW46IGRpc2NvcmRUb2tlbiwgaWQ6IHNvbG9JbmZvLmN1cnJlbnQuaWQgfVxuXG51cGRhdGVTb2xvSUQgPSAobmV3U29sb0lEKSAtPlxuICBzb2xvSUQgPSBuZXdTb2xvSURcbiAgaWYgbm90IHNvbG9JRD9cbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IFwiRVJST1I6IG5vIHNvbG8gcXVlcnkgcGFyYW1ldGVyXCJcbiAgICByZXR1cm5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzb2xvaWRcIikudmFsdWUgPSBzb2xvSURcbiAgaWYgc29ja2V0P1xuICAgIHNvY2tldC5lbWl0ICdzb2xvJywgeyBpZDogc29sb0lEIH1cblxubmV3U29sb0lEID0gLT5cbiAgdXBkYXRlU29sb0lEKHJhbmRvbVN0cmluZygpKVxuICBnZW5lcmF0ZVBlcm1hbGluaygpXG5cbmxvZ291dCA9IC0+XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJMb2dnaW5nIG91dC4uLlwiXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXG4gIGRpc2NvcmRUb2tlbiA9IG51bGxcbiAgc2VuZElkZW50aXR5KClcblxuc2VuZElkZW50aXR5ID0gLT5cbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cbiAgfVxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcbiAgc29ja2V0LmVtaXQgJ2lkZW50aWZ5JywgaWRlbnRpdHlQYXlsb2FkXG5cbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XG4gIGNvbnNvbGUubG9nIFwiaWRlbnRpZnkgcmVzcG9uc2U6XCIsIHBrdFxuICBpZiBwa3QuZGlzYWJsZWRcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gXCJcIlxuICAgIHJldHVyblxuXG4gIGlmIHBrdC50YWc/IGFuZCAocGt0LnRhZy5sZW5ndGggPiAwKVxuICAgIGRpc2NvcmRUYWcgPSBwa3QudGFnXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxuICAgIGlmIHBrdC5uaWNrbmFtZT9cbiAgICAgIGRpc2NvcmROaWNrbmFtZSA9IHBrdC5uaWNrbmFtZVxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICN7ZGlzY29yZFRhZ30je2Rpc2NvcmROaWNrbmFtZVN0cmluZ30gLSBbPGEgb25jbGljaz1cImxvZ291dCgpXCI+TG9nb3V0PC9hPl1cbiAgICBcIlwiXCJcbiAgZWxzZVxuICAgIGRpc2NvcmRUYWcgPSBudWxsXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxuICAgIGRpc2NvcmRUb2tlbiA9IG51bGxcblxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXG4gICAgbG9naW5MaW5rID0gXCJodHRwczovL2Rpc2NvcmQuY29tL2FwaS9vYXV0aDIvYXV0aG9yaXplP2NsaWVudF9pZD0je3dpbmRvdy5DTElFTlRfSUR9JnJlZGlyZWN0X3VyaT0je2VuY29kZVVSSUNvbXBvbmVudChyZWRpcmVjdFVSTCl9JnJlc3BvbnNlX3R5cGU9Y29kZSZzY29wZT1pZGVudGlmeVwiXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luaGludFwiPihMb2dpbiBvbiA8YSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiPkRhc2hib2FyZDwvYT4pPC9kaXY+XG4gICAgXCJcIlwiXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaWRlbnRpdHlcIikuaW5uZXJIVE1MID0gaHRtbFxuICBpZiBsYXN0Q2xpY2tlZD9cbiAgICBsYXN0Q2xpY2tlZCgpXG5cbmluaXQgPSAtPlxuICB3aW5kb3cuY2xpcGJvYXJkRWRpdCA9IGNsaXBib2FyZEVkaXRcbiAgd2luZG93LmZvcm1DaGFuZ2VkID0gZm9ybUNoYW5nZWRcbiAgd2luZG93LmxvZ291dCA9IGxvZ291dFxuICB3aW5kb3cubmV3U29sb0lEID0gbmV3U29sb0lEXG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxuICB3aW5kb3cuc2hvd0xpc3QgPSBzaG93TGlzdFxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cbiAgd2luZG93LnNob3dXYXRjaExpbmsgPSBzaG93V2F0Y2hMaW5rXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXG4gIHdpbmRvdy5zb2xvUGF1c2UgPSBzb2xvUGF1c2VcbiAgd2luZG93LnNvbG9SZXN0YXJ0ID0gc29sb1Jlc3RhcnRcbiAgd2luZG93LnNvbG9Ta2lwID0gc29sb1NraXBcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxuXG4gIHVwZGF0ZVNvbG9JRChxcygnc29sbycpKVxuXG4gIHFzRmlsdGVycyA9IHFzKCdmaWx0ZXJzJylcbiAgaWYgcXNGaWx0ZXJzP1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHFzRmlsdGVyc1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbHNcIikuY2hlY2tlZCA9IHFzKCdjb250cm9scycpP1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhpZGV0aXRsZXNcIikuY2hlY2tlZCA9IHFzKCdoaWRldGl0bGVzJyk/XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlycm9yXCIpLmNoZWNrZWQgPSBxcygnbWlycm9yJyk/XG5cbiAgc29ja2V0ID0gaW8oKVxuXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIC0+XG4gICAgaWYgc29sb0lEP1xuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxuICAgICAgc2VuZElkZW50aXR5KClcblxuICBzb2NrZXQub24gJ3NvbG8nLCAocGt0KSAtPlxuICAgIHNvbG9Db21tYW5kKHBrdClcblxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cbiAgICByZWNlaXZlSWRlbnRpdHkocGt0KVxuXG4gIHNvY2tldC5vbiAnb3BpbmlvbicsIChwa3QpIC0+XG4gICAgdXBkYXRlT3Bpbmlvbihwa3QpXG5cbiAgcHJlcGFyZUNhc3QoKVxuXG4gIG5ldyBDbGlwYm9hcmQgJy5zaGFyZScsIHtcbiAgICB0ZXh0OiAtPlxuICAgICAgcmV0dXJuIGNhbGNTaGFyZVVSTCgpXG4gIH1cblxuICBpZiBsYXVuY2hPcGVuXG4gICAgc2hvd1dhdGNoRm9ybSgpXG4gIGVsc2VcbiAgICBzaG93V2F0Y2hMaW5rKClcblxud2luZG93Lm9ubG9hZCA9IGluaXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgb3BpbmlvbnM6XG4gICAgbG92ZTogdHJ1ZVxuICAgIGxpa2U6IHRydWVcbiAgICBtZWg6IHRydWVcbiAgICBibGVoOiB0cnVlXG4gICAgaGF0ZTogdHJ1ZVxuXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXG4gICAgbG92ZTogdHJ1ZVxuICAgIGxpa2U6IHRydWVcblxuICB3ZWFrT3BpbmlvbnM6ICMgc2tpcCB0aGVzZSBpZiB3ZSBhbGwgYWdyZWVcbiAgICBtZWg6IHRydWVcblxuICBiYWRPcGluaW9uczogIyBza2lwIHRoZXNlXG4gICAgYmxlaDogdHJ1ZVxuICAgIGhhdGU6IHRydWVcblxuICBvcGluaW9uT3JkZXI6IFsnbG92ZScsICdsaWtlJywgJ21laCcsICdibGVoJywgJ2hhdGUnXSAjIGFsd2F5cyBpbiB0aGlzIHNwZWNpZmljIG9yZGVyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcbmZpbHRlck9waW5pb25zID0ge31cblxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXG5maWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gbnVsbFxuaXNvODYwMSA9IHJlcXVpcmUgJ2lzbzg2MDEtZHVyYXRpb24nXG5cbm5vdyA9IC0+XG4gIHJldHVybiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuXG5wYXJzZUR1cmF0aW9uID0gKHMpIC0+XG4gIHJldHVybiBpc284NjAxLnRvU2Vjb25kcyhpc284NjAxLnBhcnNlKHMpKVxuXG5zZXRTZXJ2ZXJEYXRhYmFzZXMgPSAoZGIsIG9waW5pb25zLCBnZXRVc2VyRnJvbU5pY2tuYW1lKSAtPlxuICBmaWx0ZXJEYXRhYmFzZSA9IGRiXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcbiAgZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZSA9IGdldFVzZXJGcm9tTmlja25hbWVcblxuZ2V0RGF0YSA9ICh1cmwpIC0+XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcbiAgICAgICAgICAgIyBUeXBpY2FsIGFjdGlvbiB0byBiZSBwZXJmb3JtZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgcmVhZHk6XG4gICAgICAgICAgIHRyeVxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKVxuICAgIHhodHRwLnNlbmQoKVxuXG5jYWNoZU9waW5pb25zID0gKGZpbHRlclVzZXIpIC0+XG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXSA9IGF3YWl0IGdldERhdGEoXCIvaW5mby9vcGluaW9ucz91c2VyPSN7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbHRlclVzZXIpfVwiKVxuICAgIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXG5cbmdlbmVyYXRlTGlzdCA9IChmaWx0ZXJTdHJpbmcsIHNvcnRCeUFydGlzdCA9IGZhbHNlKSAtPlxuICBzb2xvRmlsdGVycyA9IG51bGxcbiAgaWYgZmlsdGVyU3RyaW5nPyBhbmQgKGZpbHRlclN0cmluZy5sZW5ndGggPiAwKVxuICAgIHNvbG9GaWx0ZXJzID0gW11cbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcbiAgICBmb3IgZmlsdGVyIGluIHJhd0ZpbHRlcnNcbiAgICAgIGZpbHRlciA9IGZpbHRlci50cmltKClcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXG4gICAgICAgIHNvbG9GaWx0ZXJzLnB1c2ggZmlsdGVyXG4gICAgaWYgc29sb0ZpbHRlcnMubGVuZ3RoID09IDBcbiAgICAgICMgTm8gZmlsdGVyc1xuICAgICAgc29sb0ZpbHRlcnMgPSBudWxsXG4gIGNvbnNvbGUubG9nIFwiRmlsdGVyczpcIiwgc29sb0ZpbHRlcnNcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XG4gICAgY29uc29sZS5sb2cgXCJVc2luZyBjYWNoZWQgZGF0YWJhc2UuXCJcbiAgZWxzZVxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxuICAgIGZpbHRlckRhdGFiYXNlID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL3BsYXlsaXN0XCIpXG4gICAgaWYgbm90IGZpbHRlckRhdGFiYXNlP1xuICAgICAgcmV0dXJuIG51bGxcblxuICBzb2xvVW5zaHVmZmxlZCA9IFtdXG4gIGlmIHNvbG9GaWx0ZXJzP1xuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgZS5hbGxvd2VkID0gZmFsc2VcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXG5cbiAgICBhbGxBbGxvd2VkID0gdHJ1ZVxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcbiAgICAgIHBpZWNlcyA9IGZpbHRlci5zcGxpdCgvICsvKVxuXG4gICAgICBwcm9wZXJ0eSA9IFwiYWxsb3dlZFwiXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcbiAgICAgICAgcHJvcGVydHkgPSBcInNraXBwZWRcIlxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxuICAgICAgaWYgcGllY2VzLmxlbmd0aCA9PSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxuICAgICAgICBhbGxBbGxvd2VkID0gZmFsc2VcblxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXG5cbiAgICAgIG5lZ2F0ZWQgPSBmYWxzZVxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXG4gICAgICAgIG5lZ2F0ZWQgPSB0cnVlXG4gICAgICAgIHBpZWNlc1swXSA9IG1hdGNoZXNbMV1cblxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXG4gICAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgICB3aGVuICdhcnRpc3QnLCAnYmFuZCdcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hcnRpc3QudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ3RpdGxlJywgJ3NvbmcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHMpICE9IC0xXG4gICAgICAgIHdoZW4gJ2FkZGVkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXG4gICAgICAgIHdoZW4gJ3VudGFnZ2VkJ1xuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gT2JqZWN0LmtleXMoZS50YWdzKS5sZW5ndGggPT0gMFxuICAgICAgICB3aGVuICd0YWcnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGUudGFnc1tzXSA9PSB0cnVlXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBhcnNpbmcgJyN7c3Vic3RyaW5nfSdcIlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcbiAgICAgICAgICBjYXRjaCBzb21lRXhjZXB0aW9uXG4gICAgICAgICAgICAjIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IHBhcnNlIGR1cmF0aW9uOiAje3N1YnN0cmluZ31cIilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXG4gICAgICAgICAgc2luY2UgPSBub3coKSAtIGR1cmF0aW9uSW5TZWNvbmRzXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFkZGVkID4gc2luY2VcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gY29tbWFuZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ25vbmUnXG4gICAgICAgICAgZmlsdGVyT3BpbmlvbiA9IHVuZGVmaW5lZFxuICAgICAgICAgIGZpbHRlclVzZXIgPSBzdWJzdHJpbmdcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xuICAgICAgICAgICAgZmlsdGVyVXNlciA9IGZpbHRlckdldFVzZXJGcm9tTmlja25hbWUoZmlsdGVyVXNlcilcbiAgICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZmlsdGVyU2VydmVyT3BpbmlvbnNbZS5pZF0/W2ZpbHRlclVzZXJdID09IGZpbHRlck9waW5pb25cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCBjYWNoZU9waW5pb25zKGZpbHRlclVzZXIpXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdP1tlLmlkXSA9PSBmaWx0ZXJPcGluaW9uXG4gICAgICAgIHdoZW4gJ2Z1bGwnXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+XG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGZ1bGwuaW5kZXhPZihzKSAhPSAtMVxuICAgICAgICB3aGVuICdpZCcsICdpZHMnXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxuICAgICAgICAgIGZvciBpZCBpbiBwaWVjZXMuc2xpY2UoMSlcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGlkTG9va3VwW2UuaWRdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcbiAgICAgICAgaXNNYXRjaCA9IGZpbHRlckZ1bmMoZSwgc3Vic3RyaW5nKVxuICAgICAgICBpZiBuZWdhdGVkXG4gICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXG4gICAgICAgIGlmIGlzTWF0Y2hcbiAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcblxuICAgIGZvciBpZCwgZSBvZiBmaWx0ZXJEYXRhYmFzZVxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxuICAgICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcbiAgZWxzZVxuICAgICMgUXVldWUgaXQgYWxsIHVwXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXG4gICAgICBzb2xvVW5zaHVmZmxlZC5wdXNoIGVcblxuICBpZiBzb3J0QnlBcnRpc3RcbiAgICBzb2xvVW5zaHVmZmxlZC5zb3J0IChhLCBiKSAtPlxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICBpZiBhLmFydGlzdC50b0xvd2VyQ2FzZSgpID4gYi5hcnRpc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICByZXR1cm4gMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpIDwgYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xuICBnZW5lcmF0ZUxpc3Q6IGdlbmVyYXRlTGlzdFxuIl19
