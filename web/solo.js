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
var Clipboard, DASHCAST_NAMESPACE, addEnabled, calcLabel, calcPerma, calcPermalink, calcShareURL, castAvailable, castSession, clearOpinion, clipboardEdit, clipboardMirror, constants, currentPlaylistName, deletePlaylist, discordNickname, discordTag, discordToken, endedTimer, exportEnabled, fadeIn, fadeOut, filters, finishInit, formChanged, generatePermalink, getData, isTesla, k, launchOpen, len, listenForMediaButtons, loadPlaylist, logout, mediaButtonsReady, newSoloID, now, o, onAdd, onError, onInitSuccess, onPlayerReady, onPlayerStateChange, onTapShow, opinionOrder, overTimers, pageEpoch, pauseInternal, play, player, playing, prepareCast, qs, randomString, receiveIdentity, receiveUserPlaylist, ref, renderAdd, renderClipboard, renderClipboardMirror, renderInfo, renderPlaylistName, requestUserPlaylists, savePlaylist, sendIdentity, sessionListener, sessionUpdateListener, setOpinion, shareClipboard, sharePerma, showExport, showInfo, showList, showWatchForm, showWatchLink, socket, soloCommand, soloCount, soloError, soloID, soloIndex, soloInfo, soloInfoBroadcast, soloLabels, soloMirror, soloPause, soloPlay, soloPrev, soloQueue, soloRestart, soloSkip, soloTick, soloTickTimeout, soloUnshuffled, soloVideo, startCast, startHere, tapTimeout, updateOpinion, updateSoloID, youtubeReady;

constants = require('../constants');

Clipboard = require('clipboard');

filters = require('../filters');

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

console.log(`launchOpen: ${launchOpen}`);

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

calcPerma = function() {
  var baseURL, combo, mtvURL, selected, selectedName;
  combo = document.getElementById("loadname");
  selected = combo.options[combo.selectedIndex];
  selectedName = selected.value;
  if ((discordNickname == null) || (selectedName.length === 0)) {
    return "";
  }
  baseURL = window.location.href.split('#')[0].split('?')[0];
  baseURL = baseURL.replace(/solo$/, "p");
  mtvURL = baseURL + `/${encodeURIComponent(discordNickname)}/${encodeURIComponent(selectedName)}`;
  return mtvURL;
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
  params.delete("savename");
  params.delete("loadname");
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

soloPlay = function(delta = 1) {
  var i, index, j, l, len1;
  if (player == null) {
    return;
  }
  if (soloError || soloMirror) {
    return;
  }
  if ((soloVideo == null) || (soloQueue.length === 0) || ((soloIndex + delta) > (soloQueue.length - 1))) {
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
    soloIndex = 0;
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

startHere = async function() {
  var filterString;
  showWatchLink();
  if (player == null) {
    document.getElementById('solovideocontainer').style.display = 'block';
    document.getElementById('outer').classList.add('corner');
    if (isTesla) {
      onTapShow();
    } else {
      document.getElementById('outer').classList.add('fadey');
    }
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
    play(soloVideo, soloVideo.id, soloVideo.start, soloVideo.end);
  }
  document.getElementById("quickmenu").style.display = "none";
  listenForMediaButtons();
  if (isTesla) {
    return document.getElementById('tapshow').style.display = "block";
  }
};

calcPermalink = function() {
  var baseURL, form, formData, mtvURL, params, querystring;
  form = document.getElementById('asform');
  formData = new FormData(form);
  params = new URLSearchParams(formData);
  params.delete("loadname");
  params.delete("savename");
  if (currentPlaylistName != null) {
    params.set("name", currentPlaylistName);
  }
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
        await renderInfo();
        renderAdd();
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
  var qsFilters, userAgent;
  window.clipboardEdit = clipboardEdit;
  window.clipboardMirror = clipboardMirror;
  window.deletePlaylist = deletePlaylist;
  window.formChanged = formChanged;
  window.loadPlaylist = loadPlaylist;
  window.logout = logout;
  window.newSoloID = newSoloID;
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
  window.soloPause = soloPause;
  window.soloPrev = soloPrev;
  window.soloRestart = soloRestart;
  window.soloSkip = soloSkip;
  window.startCast = startCast;
  window.startHere = startHere;
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

module.exports = {
  setServerDatabases: setServerDatabases,
  generateList: generateList
};


},{"iso8601-duration":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xpcGJvYXJkL2Rpc3QvY2xpcGJvYXJkLmpzIiwibm9kZV9tb2R1bGVzL2lzbzg2MDEtZHVyYXRpb24vbGliL2luZGV4LmpzIiwic3JjL2NsaWVudC9zb2xvLmNvZmZlZSIsInNyYy9jb25zdGFudHMuY29mZmVlIiwic3JjL2ZpbHRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3o3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxJQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxTQUFBLEVBQUEsbUJBQUEsRUFBQSxjQUFBLEVBQUEsZUFBQSxFQUFBLFVBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLGlCQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsVUFBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsbUJBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQSxtQkFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsZUFBQSxFQUFBLHFCQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQSxxQkFBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLGlCQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0FBQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSOztBQUNaLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7QUFFVixNQUFBLEdBQVM7O0FBRVQsTUFBQSxHQUFTOztBQUNULFVBQUEsR0FBYTs7QUFDYixPQUFBLEdBQVU7O0FBQ1YsY0FBQSxHQUFpQjs7QUFDakIsU0FBQSxHQUFZOztBQUNaLFNBQUEsR0FBWTs7QUFDWixlQUFBLEdBQWtCOztBQUNsQixTQUFBLEdBQVk7O0FBQ1osU0FBQSxHQUFZOztBQUNaLFNBQUEsR0FBWTs7QUFDWixVQUFBLEdBQWE7O0FBQ2IsVUFBQSxHQUFhOztBQUViLFVBQUEsR0FBYTs7QUFDYixVQUFBLEdBQWE7O0FBRWIsa0JBQUEsR0FBcUI7O0FBRXJCLE1BQUEsR0FBUzs7QUFDVCxRQUFBLEdBQVcsQ0FBQTs7QUFFWCxZQUFBLEdBQWU7O0FBQ2YsVUFBQSxHQUFhOztBQUNiLGVBQUEsR0FBa0I7O0FBRWxCLGFBQUEsR0FBZ0I7O0FBQ2hCLFdBQUEsR0FBYzs7QUFFZCxVQUFBLEdBQWEsTUFsQ2I7O0FBbUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxZQUFBLENBQUEsQ0FBZSxVQUFmLENBQUEsQ0FBWjs7QUFFQSxVQUFBLEdBQWE7O0FBQ2IsYUFBQSxHQUFnQjs7QUFFaEIsT0FBQSxHQUFVOztBQUNWLFVBQUEsR0FBYTs7QUFFYixtQkFBQSxHQUFzQjs7QUFFdEIsWUFBQSxHQUFlOztBQUNmO0FBQUEsS0FBQSxxQ0FBQTs7RUFDRSxZQUFZLENBQUMsSUFBYixDQUFrQixDQUFsQjtBQURGOztBQUVBLFlBQVksQ0FBQyxJQUFiLENBQWtCLE1BQWxCOztBQUVBLFlBQUEsR0FBZSxRQUFBLENBQUEsQ0FBQTtBQUNiLFNBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLFNBQTNCLENBQXFDLENBQXJDLEVBQXdDLEVBQXhDLENBQUEsR0FBOEMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsUUFBZCxDQUF1QixFQUF2QixDQUEwQixDQUFDLFNBQTNCLENBQXFDLENBQXJDLEVBQXdDLEVBQXhDO0FBRHhDOztBQUdmLEdBQUEsR0FBTSxRQUFBLENBQUEsQ0FBQTtBQUNKLFNBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUF4QjtBQURIOztBQUdOLFNBQUEsR0FBWSxHQUFBLENBQUE7O0FBRVosRUFBQSxHQUFLLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDTCxNQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7RUFBRSxHQUFBLEdBQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztFQUN0QixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCO0VBQ1AsS0FBQSxHQUFRLElBQUksTUFBSixDQUFXLE1BQUEsR0FBUyxJQUFULEdBQWdCLG1CQUEzQjtFQUNSLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVg7RUFDVixJQUFHLENBQUksT0FBSixJQUFlLENBQUksT0FBTyxDQUFDLENBQUQsQ0FBN0I7QUFDRSxXQUFPLEtBRFQ7O0FBRUEsU0FBTyxrQkFBQSxDQUFtQixPQUFPLENBQUMsQ0FBRCxDQUFHLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFuQjtBQVBKOztBQVNMLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLE1BQUE7RUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVo7RUFFQSxLQUFBLEdBQVEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEI7RUFDUixJQUFHLGtCQUFIO0lBQ0UsWUFBQSxDQUFhLFVBQWI7SUFDQSxVQUFBLEdBQWE7V0FDYixLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosR0FBc0IsRUFIeEI7R0FBQSxNQUFBO0lBS0UsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLEdBQXNCO1dBQ3RCLFVBQUEsR0FBYSxVQUFBLENBQVcsUUFBQSxDQUFBLENBQUE7TUFDdEIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFaO01BQ0EsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLEdBQXNCO2FBQ3RCLFVBQUEsR0FBYTtJQUhTLENBQVgsRUFJWCxLQUpXLEVBTmY7O0FBSlU7O0FBaUJaLE1BQUEsR0FBUyxRQUFBLENBQUMsSUFBRCxFQUFPLEVBQVAsQ0FBQTtBQUNULE1BQUEsT0FBQSxFQUFBO0VBQUUsSUFBTyxZQUFQO0FBQ0UsV0FERjs7RUFHQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsR0FBcUI7RUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CO0VBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjtFQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0I7RUFFeEIsSUFBRyxZQUFBLElBQVEsRUFBQSxHQUFLLENBQWhCO0lBQ0UsT0FBQSxHQUFVO1dBQ1YsS0FBQSxHQUFRLFdBQUEsQ0FBWSxRQUFBLENBQUEsQ0FBQTtNQUNsQixPQUFBLElBQVcsRUFBQSxHQUFLO01BQ2hCLElBQUcsT0FBQSxJQUFXLENBQWQ7UUFDRSxhQUFBLENBQWMsS0FBZDtRQUNBLE9BQUEsR0FBVSxFQUZaOztNQUlBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjthQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsR0FBb0IsZ0JBQUEsR0FBbUIsT0FBQSxHQUFVLEdBQTdCLEdBQW1DO0lBUHJDLENBQVosRUFRTixFQVJNLEVBRlY7R0FBQSxNQUFBO0lBWUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLEdBQXFCO1dBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxHQUFvQixtQkFidEI7O0FBVE87O0FBd0JULE9BQUEsR0FBVSxRQUFBLENBQUMsSUFBRCxFQUFPLEVBQVAsQ0FBQTtBQUNWLE1BQUEsT0FBQSxFQUFBO0VBQUUsSUFBTyxZQUFQO0FBQ0UsV0FERjs7RUFHQSxJQUFHLFlBQUEsSUFBUSxFQUFBLEdBQUssQ0FBaEI7SUFDRSxPQUFBLEdBQVU7V0FDVixLQUFBLEdBQVEsV0FBQSxDQUFZLFFBQUEsQ0FBQSxDQUFBO01BQ2xCLE9BQUEsSUFBVyxFQUFBLEdBQUs7TUFDaEIsSUFBRyxPQUFBLElBQVcsQ0FBZDtRQUNFLGFBQUEsQ0FBYyxLQUFkO1FBQ0EsT0FBQSxHQUFVO1FBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLEdBQXFCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBWCxHQUF3QixTQUoxQjs7TUFLQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsR0FBcUI7YUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLGdCQUFBLEdBQW1CLE9BQUEsR0FBVSxHQUE3QixHQUFtQztJQVJyQyxDQUFaLEVBU04sRUFUTSxFQUZWO0dBQUEsTUFBQTtJQWFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxHQUFxQjtJQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsR0FBb0I7SUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLEdBQXFCO1dBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBWCxHQUF3QixTQWhCMUI7O0FBSlE7O0FBc0JWLGFBQUEsR0FBZ0IsUUFBQSxDQUFBLENBQUE7RUFDZCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLEtBQUssQ0FBQyxPQUF4QyxHQUFrRDtFQUNsRCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLEtBQUssQ0FBQyxPQUF4QyxHQUFrRDtFQUNsRCxRQUFRLENBQUMsY0FBVCxDQUF3QixZQUF4QixDQUFxQyxDQUFDLEtBQUssQ0FBQyxPQUE1QyxHQUFzRDtFQUN0RCxRQUFRLENBQUMsY0FBVCxDQUF3QixTQUF4QixDQUFrQyxDQUFDLEtBQW5DLENBQUE7RUFDQSxVQUFBLEdBQWE7U0FDYixZQUFZLENBQUMsT0FBYixDQUFxQixRQUFyQixFQUErQixNQUEvQjtBQU5jOztBQVFoQixhQUFBLEdBQWdCLFFBQUEsQ0FBQSxDQUFBO0VBQ2QsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBaUMsQ0FBQyxLQUFLLENBQUMsT0FBeEMsR0FBa0Q7RUFDbEQsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBaUMsQ0FBQyxLQUFLLENBQUMsT0FBeEMsR0FBa0Q7RUFDbEQsVUFBQSxHQUFhO0VBQ2IsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsUUFBckIsRUFBK0IsT0FBL0I7U0FFQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO0FBTjlCOztBQVFoQixhQUFBLEdBQWdCLFFBQUEsQ0FBQSxDQUFBO0VBQ2QsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjtTQUNBLGFBQUEsR0FBZ0I7QUFGRjs7QUFJaEIsT0FBQSxHQUFVLFFBQUEsQ0FBQyxPQUFELENBQUEsRUFBQTs7QUFFVixlQUFBLEdBQWtCLFFBQUEsQ0FBQyxDQUFELENBQUE7U0FDaEIsV0FBQSxHQUFjO0FBREU7O0FBR2xCLHFCQUFBLEdBQXdCLFFBQUEsQ0FBQyxPQUFELENBQUE7RUFDdEIsSUFBRyxDQUFJLE9BQVA7V0FDRSxXQUFBLEdBQWMsS0FEaEI7O0FBRHNCOztBQUl4QixXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7QUFDZCxNQUFBLFNBQUEsRUFBQTtFQUFFLElBQUcsQ0FBSSxNQUFNLENBQUMsSUFBWCxJQUFtQixDQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBdEM7SUFDRSxJQUFHLEdBQUEsQ0FBQSxDQUFBLEdBQVEsQ0FBQyxTQUFBLEdBQVksRUFBYixDQUFYO01BQ0UsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsV0FBbEIsRUFBK0IsR0FBL0IsRUFERjs7QUFFQSxXQUhGOztFQUtBLGNBQUEsR0FBaUIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWhCLENBQStCLFVBQS9CLEVBTG5CO0VBTUUsU0FBQSxHQUFZLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFoQixDQUEwQixjQUExQixFQUEwQyxlQUExQyxFQUEyRCxRQUFBLENBQUEsQ0FBQSxFQUFBLENBQTNEO1NBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFaLENBQXVCLFNBQXZCLEVBQWtDLGFBQWxDLEVBQWlELE9BQWpEO0FBUlk7O0FBVWQsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO0FBQ1osTUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEI7RUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBUDtFQUN4QixZQUFBLEdBQWUsUUFBUSxDQUFDO0VBQ3hCLElBQU8seUJBQUosSUFBd0IsQ0FBQyxZQUFZLENBQUMsTUFBYixLQUF1QixDQUF4QixDQUEzQjtBQUNFLFdBQU8sR0FEVDs7RUFFQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBckIsQ0FBMkIsR0FBM0IsQ0FBK0IsQ0FBQyxDQUFELENBQUcsQ0FBQyxLQUFuQyxDQUF5QyxHQUF6QyxDQUE2QyxDQUFDLENBQUQ7RUFDdkQsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLEVBQXlCLEdBQXpCO0VBQ1YsTUFBQSxHQUFTLE9BQUEsR0FBVSxDQUFBLENBQUEsQ0FBQSxDQUFJLGtCQUFBLENBQW1CLGVBQW5CLENBQUosQ0FBQSxDQUFBLENBQUEsQ0FBMkMsa0JBQUEsQ0FBbUIsWUFBbkIsQ0FBM0MsQ0FBQTtBQUNuQixTQUFPO0FBVEc7O0FBV1osWUFBQSxHQUFlLFFBQUEsQ0FBQyxNQUFELENBQUE7QUFDZixNQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7RUFBRSxJQUFBLEdBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEI7RUFDUCxRQUFBLEdBQVcsSUFBSSxRQUFKLENBQWEsSUFBYjtFQUNYLE1BQUEsR0FBUyxJQUFJLGVBQUosQ0FBb0IsUUFBcEI7RUFDVCxJQUFHLE1BQUg7SUFDRSxNQUFNLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsQ0FBckI7SUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFGRjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQ7SUFDQSxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQVgsRUFBc0IsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFYLENBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUF0QixFQUxGOztFQU1BLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBZDtFQUNBLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBZDtFQUNBLFdBQUEsR0FBYyxNQUFNLENBQUMsUUFBUCxDQUFBO0VBQ2QsT0FBQSxHQUFVLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQXJCLENBQTJCLEdBQTNCLENBQStCLENBQUMsQ0FBRCxDQUFHLENBQUMsS0FBbkMsQ0FBeUMsR0FBekMsQ0FBNkMsQ0FBQyxDQUFEO0VBQ3ZELE1BQUEsR0FBUyxPQUFBLEdBQVUsR0FBVixHQUFnQjtBQUN6QixTQUFPO0FBZk07O0FBaUJmLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLE1BQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWjtFQUVBLElBQUEsR0FBTyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QjtFQUNQLFFBQUEsR0FBVyxJQUFJLFFBQUosQ0FBYSxJQUFiO0VBQ1gsTUFBQSxHQUFTLElBQUksZUFBSixDQUFvQixRQUFwQjtFQUNULElBQUcsNEJBQUg7SUFDRSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFERjs7RUFFQSxXQUFBLEdBQWMsTUFBTSxDQUFDLFFBQVAsQ0FBQTtFQUNkLE9BQUEsR0FBVSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFyQixDQUEyQixHQUEzQixDQUErQixDQUFDLENBQUQsQ0FBRyxDQUFDLEtBQW5DLENBQXlDLEdBQXpDLENBQTZDLENBQUMsQ0FBRDtFQUN2RCxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsRUFBeUIsRUFBekI7RUFDVixNQUFBLEdBQVMsT0FBQSxHQUFVLFFBQVYsR0FBcUI7RUFDOUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLGtCQUFBLENBQUEsQ0FBcUIsTUFBckIsQ0FBQSxDQUFaO1NBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFaLENBQTJCLFFBQUEsQ0FBQyxDQUFELENBQUE7SUFDekIsV0FBQSxHQUFjO1dBQ2QsV0FBVyxDQUFDLFdBQVosQ0FBd0Isa0JBQXhCLEVBQTRDO01BQUUsR0FBQSxFQUFLLE1BQVA7TUFBZSxLQUFBLEVBQU87SUFBdEIsQ0FBNUM7RUFGeUIsQ0FBM0IsRUFHRSxPQUhGO0FBYlUsRUFyTVo7OztBQXdOQSxhQUFBLEdBQWdCLFFBQUEsQ0FBQyxLQUFELENBQUE7RUFDZCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWIsQ0FBQTtTQUNBLFNBQUEsQ0FBQTtBQUZjLEVBeE5oQjs7O0FBNk5BLG1CQUFBLEdBQXNCLFFBQUEsQ0FBQyxLQUFELENBQUE7RUFDcEIsSUFBRyxrQkFBSDtJQUNFLFlBQUEsQ0FBYSxVQUFiO0lBQ0EsVUFBQSxHQUFhLEtBRmY7O0VBSUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLENBQWpCO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO1dBQ0EsVUFBQSxHQUFhLFVBQUEsQ0FBWSxRQUFBLENBQUEsQ0FBQTthQUN2QixPQUFBLEdBQVU7SUFEYSxDQUFaLEVBRVgsSUFGVyxFQUZmOztBQUxvQjs7QUFXdEIsU0FBQSxHQUFZLE1BQUEsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNaLE1BQUE7RUFBRSxPQUFPLENBQUMsR0FBUixDQUFZLGlCQUFaLEVBQStCLFVBQS9CO0VBQ0EsSUFBTyxrQkFBUDtJQUNFLFVBQUEsR0FBYSxDQUFBLE1BQU0sT0FBQSxDQUFRLGNBQVIsQ0FBTixFQURmOztFQUVBLE9BQUEsR0FBVTtFQUNWLElBQUcsa0JBQUg7SUFDRSxPQUFBLEdBQVUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFMLEVBRHRCOztFQUVBLElBQU8sZUFBUDtJQUNFLE9BQUEsR0FBVSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQWIsQ0FBb0IsQ0FBcEIsQ0FBc0IsQ0FBQyxXQUF2QixDQUFBLENBQUEsR0FBdUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFiLENBQW1CLENBQW5CO0lBQ2pELE9BQUEsSUFBVyxXQUZiOztBQUdBLFNBQU87QUFWRzs7QUFZWixRQUFBLEdBQVcsTUFBQSxRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ1gsTUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxXQUFBLEVBQUEsQ0FBQSxFQUFBO0VBQUUsV0FBQSxHQUFjLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCO0VBQ2QsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFsQixHQUE0QjtFQUM1QixLQUFBLDhDQUFBOztJQUNFLFlBQUEsQ0FBYSxDQUFiO0VBREY7RUFFQSxVQUFBLEdBQWE7RUFFYixNQUFBLEdBQVMsR0FBRyxDQUFDO0VBQ2IsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsTUFBZixFQUF1QixFQUF2QjtFQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFBdUIsRUFBdkI7RUFDVCxLQUFBLEdBQVEsR0FBRyxDQUFDO0VBQ1osS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBZCxFQUFzQixFQUF0QjtFQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLE1BQWQsRUFBc0IsRUFBdEI7RUFDUixJQUFBLEdBQU8sQ0FBQSxDQUFBLENBQUcsTUFBSCxDQUFBLFVBQUEsQ0FBQSxDQUFzQixLQUF0QixDQUFBLFFBQUE7RUFDUCxJQUFHLGNBQUg7SUFDRSxPQUFBLEdBQVUsQ0FBQSxNQUFNLFNBQUEsQ0FBVSxHQUFWLENBQU47SUFDVixJQUFBLElBQVEsQ0FBQSxFQUFBLENBQUEsQ0FBSyxPQUFMLENBQUE7SUFDUixJQUFHLFVBQUg7TUFDRSxJQUFBLElBQVEsZ0JBRFY7S0FBQSxNQUFBO01BR0UsSUFBQSxJQUFRLGNBSFY7S0FIRjtHQUFBLE1BQUE7SUFRRSxJQUFBLElBQVEsQ0FBQSxFQUFBLENBQUEsQ0FBSyxHQUFHLENBQUMsT0FBVCxDQUFBO0lBQ1IsUUFBQSxHQUFXO0lBQ1gsS0FBQSxnREFBQTs7TUFDRSxJQUFHLHVCQUFIO1FBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFkLEVBREY7O0lBREY7SUFHQSxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXRCO01BQ0UsSUFBQSxJQUFRLGdCQURWO0tBQUEsTUFBQTtNQUdFLEtBQUEsNENBQUE7O1FBQ0UsSUFBQSxHQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBRDtRQUNuQixJQUFJLENBQUMsSUFBTCxDQUFBO1FBQ0EsSUFBQSxJQUFRLENBQUEsRUFBQSxDQUFBLENBQUssT0FBTyxDQUFDLE1BQVIsQ0FBZSxDQUFmLENBQWlCLENBQUMsV0FBbEIsQ0FBQSxDQUFBLEdBQWtDLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxDQUF2QyxDQUFBLEVBQUEsQ0FBQSxDQUE0RCxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBNUQsQ0FBQTtNQUhWLENBSEY7S0FiRjs7RUFvQkEsV0FBVyxDQUFDLFNBQVosR0FBd0I7RUFFeEIsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBO1dBQ3pCLE1BQUEsQ0FBTyxXQUFQLEVBQW9CLElBQXBCO0VBRHlCLENBQVgsRUFFZCxJQUZjLENBQWhCO1NBR0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBO1dBQ3pCLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLElBQXJCO0VBRHlCLENBQVgsRUFFZCxLQUZjLENBQWhCO0FBdkNTOztBQTJDWCxJQUFBLEdBQU8sUUFBQSxDQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsZUFBZSxJQUF6QixFQUErQixhQUFhLElBQTVDLENBQUE7QUFDUCxNQUFBO0VBQUUsSUFBTyxjQUFQO0FBQ0UsV0FERjs7RUFFQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsU0FBQSxDQUFBLENBQVksRUFBWixDQUFBLENBQVo7RUFDQSxJQUFBLEdBQU87SUFDTCxPQUFBLEVBQVM7RUFESjtFQUdQLElBQUcsc0JBQUEsSUFBa0IsQ0FBQyxZQUFBLElBQWdCLENBQWpCLENBQXJCO0lBQ0UsSUFBSSxDQUFDLFlBQUwsR0FBb0IsYUFEdEI7O0VBRUEsSUFBRyxvQkFBQSxJQUFnQixDQUFDLFVBQUEsSUFBYyxDQUFmLENBQW5CO0lBQ0UsSUFBSSxDQUFDLFVBQUwsR0FBa0IsV0FEcEI7O0VBRUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsSUFBckI7RUFDQSxPQUFBLEdBQVU7U0FFVixRQUFBLENBQVMsR0FBVDtBQWRLOztBQWdCUCxpQkFBQSxHQUFvQixRQUFBLENBQUEsQ0FBQTtBQUNwQixNQUFBLElBQUEsRUFBQSxTQUFBLEVBQUE7RUFBRSxJQUFHLGdCQUFBLElBQVksZ0JBQVosSUFBd0IsbUJBQXhCLElBQXVDLENBQUksVUFBOUM7SUFDRSxTQUFBLEdBQVk7SUFDWixJQUFHLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFBVixHQUFtQixDQUFsQztNQUNFLFNBQUEsR0FBWSxTQUFTLENBQUMsU0FBQSxHQUFVLENBQVgsRUFEdkI7O0lBRUEsSUFBQSxHQUNFO01BQUEsT0FBQSxFQUFTLFNBQVQ7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLEtBQUEsRUFBTyxTQUFBLEdBQVksQ0FGbkI7TUFHQSxLQUFBLEVBQU87SUFIUDtJQUtGLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixFQUEyQixJQUEzQjtJQUNBLEdBQUEsR0FBTTtNQUNKLEVBQUEsRUFBSSxNQURBO01BRUosR0FBQSxFQUFLLE1BRkQ7TUFHSixJQUFBLEVBQU07SUFIRjtJQUtOLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQixHQUFwQjtXQUNBLFdBQUEsQ0FBWSxHQUFaLEVBakJGOztBQURrQjs7QUFvQnBCLFFBQUEsR0FBVyxRQUFBLENBQUMsUUFBUSxDQUFULENBQUE7QUFDWCxNQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtFQUFFLElBQU8sY0FBUDtBQUNFLFdBREY7O0VBRUEsSUFBRyxTQUFBLElBQWEsVUFBaEI7QUFDRSxXQURGOztFQUdBLElBQU8sbUJBQUosSUFBa0IsQ0FBQyxTQUFTLENBQUMsTUFBVixLQUFvQixDQUFyQixDQUFsQixJQUE2QyxDQUFDLENBQUMsU0FBQSxHQUFZLEtBQWIsQ0FBQSxHQUFzQixDQUFDLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXBCLENBQXZCLENBQWhEO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWjtJQUNBLFNBQUEsR0FBWSxDQUFFLGNBQWMsQ0FBQyxDQUFELENBQWhCO0lBQ1osS0FBQSxrRUFBQTs7TUFDRSxJQUFZLEtBQUEsS0FBUyxDQUFyQjtBQUFBLGlCQUFBOztNQUNBLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEtBQUEsR0FBUSxDQUFULENBQTNCO01BQ0osU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFTLENBQUMsQ0FBRCxDQUF4QjtNQUNBLFNBQVMsQ0FBQyxDQUFELENBQVQsR0FBZTtJQUpqQjtJQUtBLFNBQUEsR0FBWSxFQVJkO0dBQUEsTUFBQTtJQVVFLFNBQUEsSUFBYSxNQVZmOztFQVlBLElBQUcsU0FBQSxHQUFZLENBQWY7SUFDRSxTQUFBLEdBQVksRUFEZDs7RUFFQSxTQUFBLEdBQVksU0FBUyxDQUFDLFNBQUQ7RUFFckIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaLEVBckJGOzs7OztFQTRCRSxJQUFBLENBQUssU0FBTCxFQUFnQixTQUFTLENBQUMsRUFBMUIsRUFBOEIsU0FBUyxDQUFDLEtBQXhDLEVBQStDLFNBQVMsQ0FBQyxHQUF6RDtTQUVBLGlCQUFBLENBQUE7QUEvQlM7O0FBaUNYLFFBQUEsR0FBVyxRQUFBLENBQUEsQ0FBQTtFQUNULElBQU8sY0FBUDtBQUNFLFdBREY7O0VBR0EsSUFBTyxnQkFBSixJQUFlLFNBQWYsSUFBNEIsVUFBL0I7QUFDRSxXQURGOztFQUdBLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtFQUNBLElBQUcsQ0FBSSxPQUFKLElBQWdCLGdCQUFuQjtJQUNFLFFBQUEsQ0FBQSxFQURGOztBQVJTOztBQVlYLE9BQUEsR0FBVSxRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ1IsU0FBTyxJQUFJLE9BQUosQ0FBWSxRQUFBLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FBQTtBQUNyQixRQUFBO0lBQUksS0FBQSxHQUFRLElBQUksY0FBSixDQUFBO0lBQ1IsS0FBSyxDQUFDLGtCQUFOLEdBQTJCLFFBQUEsQ0FBQSxDQUFBO0FBQy9CLFVBQUE7TUFBUSxJQUFHLENBQUMsSUFBQyxDQUFBLFVBQUQsS0FBZSxDQUFoQixDQUFBLElBQXVCLENBQUMsSUFBQyxDQUFBLE1BQUQsS0FBVyxHQUFaLENBQTFCO0FBRUc7O1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFlBQWpCO2lCQUNWLE9BQUEsQ0FBUSxPQUFSLEVBRkY7U0FHQSxhQUFBO2lCQUNFLE9BQUEsQ0FBUSxJQUFSLEVBREY7U0FMSDs7SUFEdUI7SUFRM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLEVBQWtCLEdBQWxCLEVBQXVCLElBQXZCO1dBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBQTtFQVhpQixDQUFaO0FBREM7O0FBY1YsaUJBQUEsR0FBb0I7O0FBQ3BCLHFCQUFBLEdBQXdCLFFBQUEsQ0FBQSxDQUFBO0FBQ3hCLE1BQUE7RUFBRSxJQUFHLGlCQUFIO0FBQ0UsV0FERjs7RUFHQSxJQUFPLHdFQUFQO0lBQ0UsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBO2FBQ1QscUJBQUEsQ0FBQTtJQURTLENBQVgsRUFFRSxJQUZGO0FBR0EsV0FKRjs7RUFNQSxpQkFBQSxHQUFvQjtFQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxnQkFBOUIsQ0FBK0MsZUFBL0MsRUFBZ0UsUUFBQSxDQUFBLENBQUE7V0FDOUQsUUFBQSxDQUFBO0VBRDhELENBQWhFO0VBRUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsZ0JBQTlCLENBQStDLFdBQS9DLEVBQTRELFFBQUEsQ0FBQSxDQUFBO1dBQzFELFFBQUEsQ0FBQTtFQUQwRCxDQUE1RDtTQUVBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7QUFmc0I7O0FBaUJ4QixrQkFBQSxHQUFxQixRQUFBLENBQUEsQ0FBQTtFQUNuQixJQUFPLDJCQUFQO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsY0FBeEIsQ0FBdUMsQ0FBQyxTQUF4QyxHQUFvRDtJQUNwRCxRQUFRLENBQUMsS0FBVCxHQUFpQjtBQUNqQixXQUhGOztFQUlBLFFBQVEsQ0FBQyxjQUFULENBQXdCLGNBQXhCLENBQXVDLENBQUMsU0FBeEMsR0FBb0Q7U0FDcEQsUUFBUSxDQUFDLEtBQVQsR0FBaUIsQ0FBQSxVQUFBLENBQUEsQ0FBYSxtQkFBYixDQUFBO0FBTkU7O0FBUXJCLFNBQUEsR0FBWSxNQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ1osTUFBQTtFQUFFLGFBQUEsQ0FBQTtFQUVBLElBQU8sY0FBUDtJQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLG9CQUF4QixDQUE2QyxDQUFDLEtBQUssQ0FBQyxPQUFwRCxHQUE4RDtJQUM5RCxRQUFRLENBQUMsY0FBVCxDQUF3QixPQUF4QixDQUFnQyxDQUFDLFNBQVMsQ0FBQyxHQUEzQyxDQUErQyxRQUEvQztJQUNBLElBQUcsT0FBSDtNQUNFLFNBQUEsQ0FBQSxFQURGO0tBQUEsTUFBQTtNQUdFLFFBQVEsQ0FBQyxjQUFULENBQXdCLE9BQXhCLENBQWdDLENBQUMsU0FBUyxDQUFDLEdBQTNDLENBQStDLE9BQS9DLEVBSEY7O0lBSUEsTUFBQSxHQUFTLElBQUksRUFBRSxDQUFDLE1BQVAsQ0FBYyxZQUFkLEVBQTRCO01BQ25DLEtBQUEsRUFBTyxNQUQ0QjtNQUVuQyxNQUFBLEVBQVEsTUFGMkI7TUFHbkMsT0FBQSxFQUFTLGFBSDBCO01BSW5DLFVBQUEsRUFBWTtRQUFFLFVBQUEsRUFBWSxDQUFkO1FBQWlCLGFBQUEsRUFBZSxDQUFoQztRQUFtQyxVQUFBLEVBQVk7TUFBL0MsQ0FKdUI7TUFLbkMsTUFBQSxFQUFRO1FBQ04sT0FBQSxFQUFTLGFBREg7UUFFTixhQUFBLEVBQWU7TUFGVDtJQUwyQixDQUE1QjtBQVVULFdBakJGOztFQW1CQSxZQUFBLEdBQWUsRUFBQSxDQUFHLFNBQUg7RUFDZixjQUFBLEdBQWlCLENBQUEsTUFBTSxPQUFPLENBQUMsWUFBUixDQUFxQixZQUFyQixDQUFOO0VBQ2pCLElBQU8sc0JBQVA7SUFDRSxjQUFBLENBQWUsMkJBQWY7QUFDQSxXQUZGOztFQUlBLElBQUcsY0FBYyxDQUFDLE1BQWYsS0FBeUIsQ0FBNUI7SUFDRSxjQUFBLENBQWUsa0NBQWY7QUFDQSxXQUZGOztFQUdBLFNBQUEsR0FBWSxjQUFjLENBQUM7RUFFM0IsSUFBRyx1QkFBSDtJQUNFLGFBQUEsQ0FBYyxlQUFkLEVBREY7O0VBRUEsZUFBQSxHQUFrQixXQUFBLENBQVksUUFBWixFQUFzQixJQUF0QjtFQUNsQixTQUFBLEdBQVk7RUFDWixRQUFBLENBQUE7RUFDQSxJQUFHLFVBQUEsSUFBZSxTQUFsQjtJQUNFLElBQUEsQ0FBSyxTQUFMLEVBQWdCLFNBQVMsQ0FBQyxFQUExQixFQUE4QixTQUFTLENBQUMsS0FBeEMsRUFBK0MsU0FBUyxDQUFDLEdBQXpELEVBREY7O0VBR0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxLQUFLLENBQUMsT0FBM0MsR0FBcUQ7RUFDckQscUJBQUEsQ0FBQTtFQUVBLElBQUcsT0FBSDtXQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQXhCLENBQWtDLENBQUMsS0FBSyxDQUFDLE9BQXpDLEdBQW1ELFFBRHJEOztBQTVDVTs7QUErQ1osYUFBQSxHQUFnQixRQUFBLENBQUEsQ0FBQTtBQUNoQixNQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7RUFBRSxJQUFBLEdBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEI7RUFDUCxRQUFBLEdBQVcsSUFBSSxRQUFKLENBQWEsSUFBYjtFQUNYLE1BQUEsR0FBUyxJQUFJLGVBQUosQ0FBb0IsUUFBcEI7RUFDVCxNQUFNLENBQUMsTUFBUCxDQUFjLFVBQWQ7RUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLFVBQWQ7RUFDQSxJQUFHLDJCQUFIO0lBQ0UsTUFBTSxDQUFDLEdBQVAsQ0FBVyxNQUFYLEVBQW1CLG1CQUFuQixFQURGOztFQUVBLFdBQUEsR0FBYyxNQUFNLENBQUMsUUFBUCxDQUFBO0VBQ2QsT0FBQSxHQUFVLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQXJCLENBQTJCLEdBQTNCLENBQStCLENBQUMsQ0FBRCxDQUFHLENBQUMsS0FBbkMsQ0FBeUMsR0FBekMsQ0FBNkMsQ0FBQyxDQUFEO0VBQ3ZELE1BQUEsR0FBUyxPQUFBLEdBQVUsR0FBVixHQUFnQjtBQUN6QixTQUFPO0FBWE87O0FBYWhCLGlCQUFBLEdBQW9CLFFBQUEsQ0FBQSxDQUFBO0VBQ2xCLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVo7U0FDQSxNQUFNLENBQUMsUUFBUCxHQUFrQixhQUFBLENBQUE7QUFGQTs7QUFJcEIsV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO0VBQ1osT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaO0VBQ0EsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsTUFBckIsRUFBNkIsRUFBN0IsRUFBaUMsYUFBQSxDQUFBLENBQWpDO1NBQ0Esa0JBQUEsQ0FBQTtBQUhZOztBQUtkLFFBQUEsR0FBVyxRQUFBLENBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtJQUNsQixFQUFBLEVBQUksTUFEYztJQUVsQixHQUFBLEVBQUs7RUFGYSxDQUFwQjtTQUlBLFFBQUEsQ0FBQTtBQUxTOztBQU9YLFFBQUEsR0FBVyxRQUFBLENBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtJQUNsQixFQUFBLEVBQUksTUFEYztJQUVsQixHQUFBLEVBQUs7RUFGYSxDQUFwQjtTQUlBLFFBQUEsQ0FBUyxDQUFDLENBQVY7QUFMUzs7QUFPWCxXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7RUFDWixNQUFNLENBQUMsSUFBUCxDQUFZLE1BQVosRUFBb0I7SUFDbEIsRUFBQSxFQUFJLE1BRGM7SUFFbEIsR0FBQSxFQUFLO0VBRmEsQ0FBcEI7U0FJQSxRQUFBLENBQVMsQ0FBVDtBQUxZOztBQU9kLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtFQUNWLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtJQUNsQixFQUFBLEVBQUksTUFEYztJQUVsQixHQUFBLEVBQUs7RUFGYSxDQUFwQjtTQUlBLGFBQUEsQ0FBQTtBQUxVOztBQU9aLFVBQUEsR0FBYSxNQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ2IsTUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsSUFBTyxrQkFBSixJQUFxQiwwQkFBeEI7QUFDRSxXQURGOztFQUdBLFVBQUEsR0FBYSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBN0IsQ0FBa0MsQ0FBQyxJQUFuQyxDQUFBLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsSUFBL0M7RUFDYixPQUFBLEdBQVUsQ0FBQSxNQUFNLFNBQUEsQ0FBVSxRQUFRLENBQUMsT0FBbkIsQ0FBTjtFQUVWLElBQUEsR0FBTyxDQUFBLGdDQUFBLENBQUEsQ0FBbUMsUUFBUSxDQUFDLEtBQTVDLENBQUEsR0FBQSxDQUFBLENBQXVELFFBQVEsQ0FBQyxLQUFoRSxDQUFBLE1BQUEsRUFOVDs7RUFRRSxJQUFPLGNBQVA7SUFDRSxJQUFBLElBQVEsQ0FBQSxvREFBQSxDQUFBLENBQXVELGtCQUFBLENBQW1CLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBcEMsQ0FBdkQsQ0FBQSxtQ0FBQSxDQUFBLENBQW9JLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBckosQ0FBQSxhQUFBLEVBRFY7O0VBRUEsSUFBQSxJQUFRLENBQUEsc0NBQUEsQ0FBQSxDQUF5QyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQTFELENBQUEsTUFBQTtFQUNSLElBQUEsSUFBUSxDQUFBLDJCQUFBLENBQUEsQ0FBOEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUEvQyxDQUFBLFFBQUE7RUFDUixJQUFBLElBQVEsQ0FBQSx5QkFBQSxDQUFBLENBQTRCLE9BQTVCLENBQUEsTUFBQTtFQUNSLElBQUEsSUFBUSxDQUFBLDhCQUFBLENBQUEsQ0FBaUMsVUFBakMsQ0FBQSxZQUFBO0VBQ1IsSUFBRyxxQkFBSDtJQUNFLElBQUEsSUFBUTtJQUNSLElBQUEsSUFBUSxDQUFBLHFDQUFBLENBQUEsQ0FBd0MsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUF0RCxDQUFBLE9BQUE7SUFDUixJQUFBLElBQVE7SUFDUixJQUFBLElBQVEsQ0FBQSxzQ0FBQSxDQUFBLENBQXlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBdkQsQ0FBQSxTQUFBLEVBSlY7R0FBQSxNQUFBO0lBTUUsSUFBQSxJQUFRO0lBQ1IsSUFBQSxJQUFRLG1FQVBWOztTQVFBLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEM7QUF2QmpDOztBQXlCYixhQUFBLEdBQWdCLFFBQUEsQ0FBQSxDQUFBO0FBQ2hCLE1BQUE7RUFBRSxJQUFBLEdBQU87RUFDUCxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUF4QixDQUFvQyxDQUFDLFNBQXJDLEdBQWlEO1NBQ2pELFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQTtXQUNULGVBQUEsQ0FBQTtFQURTLENBQVgsRUFFRSxJQUZGO0FBSGM7O0FBT2hCLGVBQUEsR0FBa0IsUUFBQSxDQUFBLENBQUE7QUFDbEIsTUFBQTtFQUFFLElBQU8sa0JBQUosSUFBcUIsMEJBQXhCO0FBQ0UsV0FERjs7RUFHQSxJQUFBLEdBQU8sQ0FBQSxvREFBQSxDQUFBLENBQXVELFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBeEUsQ0FBQSxzREFBQTtFQUNQLFFBQVEsQ0FBQyxjQUFULENBQXdCLFdBQXhCLENBQW9DLENBQUMsU0FBckMsR0FBaUQ7U0FDakQsSUFBSSxTQUFKLENBQWMsU0FBZDtBQU5nQjs7QUFRbEIsS0FBQSxHQUFRLFFBQUEsQ0FBQSxDQUFBO0FBQ1IsTUFBQSxZQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsSUFBTyxzREFBUDtBQUNFLFdBREY7O0VBR0EsR0FBQSxHQUFNLFFBQVEsQ0FBQztFQUNmLFlBQUEsR0FBZSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxLQUExQyxDQUFnRCxDQUFDLElBQWpELENBQUE7RUFDZixJQUFHLFlBQVksQ0FBQyxNQUFiLEdBQXNCLENBQXpCO0lBQ0UsWUFBQSxJQUFnQixLQURsQjs7RUFFQSxZQUFBLElBQWdCLENBQUEsR0FBQSxDQUFBLENBQU0sR0FBRyxDQUFDLEVBQVYsQ0FBQSxHQUFBLENBQUEsQ0FBa0IsR0FBRyxDQUFDLE1BQXRCLENBQUEsR0FBQSxDQUFBLENBQWtDLEdBQUcsQ0FBQyxLQUF0QyxDQUFBLEVBQUE7RUFDaEIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxLQUFuQyxHQUEyQztFQUMzQyxXQUFBLENBQUE7RUFFQSxJQUFBLEdBQU87RUFDUCxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QixDQUE4QixDQUFDLFNBQS9CLEdBQTJDO1NBQzNDLFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQTtXQUNULFNBQUEsQ0FBQTtFQURTLENBQVgsRUFFRSxJQUZGO0FBZE07O0FBa0JSLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLE1BQUE7RUFBRSxJQUFPLGtCQUFKLElBQXFCLDBCQUFyQixJQUEwQyxDQUFJLFVBQWpEO0FBQ0UsV0FERjs7RUFHQSxJQUFBLEdBQU87U0FDUCxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QixDQUE4QixDQUFDLFNBQS9CLEdBQTJDO0FBTGpDOztBQU9aLGVBQUEsR0FBa0IsUUFBQSxDQUFBLENBQUE7QUFDbEIsTUFBQTtFQUFFLElBQUEsR0FBTztFQUNQLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBQW1DLENBQUMsU0FBcEMsR0FBZ0Q7U0FDaEQsVUFBQSxDQUFXLFFBQUEsQ0FBQSxDQUFBO1dBQ1QscUJBQUEsQ0FBQTtFQURTLENBQVgsRUFFRSxJQUZGO0FBSGdCOztBQU9sQixxQkFBQSxHQUF3QixRQUFBLENBQUEsQ0FBQTtBQUN4QixNQUFBO0VBQUUsSUFBTyxrQkFBSixJQUFxQiwwQkFBeEI7QUFDRSxXQURGOztFQUdBLElBQUEsR0FBTztFQUNQLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBQW1DLENBQUMsU0FBcEMsR0FBZ0Q7U0FDaEQsSUFBSSxTQUFKLENBQWMsU0FBZCxFQUF5QjtJQUN2QixJQUFBLEVBQU0sUUFBQSxDQUFBLENBQUE7QUFDSixhQUFPLFlBQUEsQ0FBYSxJQUFiO0lBREg7RUFEaUIsQ0FBekI7QUFOc0I7O0FBV3hCLGNBQUEsR0FBaUIsUUFBQSxDQUFDLE1BQUQsQ0FBQTtTQUNmLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEMsQ0FBQTt3QkFBQSxDQUFBLENBRWhCLFlBQUEsQ0FBYSxNQUFiLENBRmdCLENBQUEsTUFBQTtBQUQ3Qjs7QUFNakIsVUFBQSxHQUFhLFFBQUEsQ0FBQyxNQUFELENBQUE7U0FDWCxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDLENBQUE7d0JBQUEsQ0FBQSxDQUVoQixTQUFBLENBQUEsQ0FGZ0IsQ0FBQSxNQUFBO0FBRGpDOztBQU1iLFFBQUEsR0FBVyxNQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ1gsTUFBQSxDQUFBLEVBQUEsWUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxTQUFoQyxHQUE0QztFQUU1QyxZQUFBLEdBQWUsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQztFQUNsRCxJQUFBLEdBQU8sQ0FBQSxNQUFNLE9BQU8sQ0FBQyxZQUFSLENBQXFCLFlBQXJCLEVBQW1DLElBQW5DLENBQU47RUFDUCxJQUFPLFlBQVA7SUFDRSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO0FBQzVDLFdBRkY7O0VBSUEsSUFBQSxHQUFPO0VBQ1AsSUFBQSxJQUFRLENBQUEsMEJBQUEsQ0FBQSxDQUE2QixJQUFJLENBQUMsTUFBbEMsQ0FBQSxjQUFBO0VBQ1IsS0FBQSx3Q0FBQTs7SUFDRSxJQUFBLElBQVE7SUFDUixJQUFBLElBQVEsQ0FBQSxxQ0FBQSxDQUFBLENBQXdDLENBQUMsQ0FBQyxNQUExQyxDQUFBLE9BQUE7SUFDUixJQUFBLElBQVE7SUFDUixJQUFBLElBQVEsQ0FBQSxzQ0FBQSxDQUFBLENBQXlDLENBQUMsQ0FBQyxLQUEzQyxDQUFBLFNBQUE7SUFDUixJQUFBLElBQVE7RUFMVjtFQU9BLElBQUEsSUFBUTtTQUVSLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEM7QUFwQm5DOztBQXNCWCxVQUFBLEdBQWEsTUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNiLE1BQUEsQ0FBQSxFQUFBLGlCQUFBLEVBQUEsWUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQTtFQUFFLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsU0FBaEMsR0FBNEM7RUFFNUMsWUFBQSxHQUFlLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQXhCLENBQWtDLENBQUM7RUFDbEQsSUFBQSxHQUFPLENBQUEsTUFBTSxPQUFPLENBQUMsWUFBUixDQUFxQixZQUFyQixFQUFtQyxJQUFuQyxDQUFOO0VBQ1AsSUFBTyxZQUFQO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxTQUFoQyxHQUE0QztBQUM1QyxXQUZGOztFQUlBLGlCQUFBLEdBQW9CO0VBQ3BCLEdBQUEsR0FBTTtFQUNOLGFBQUEsR0FBZ0I7RUFDaEIsS0FBQSx3Q0FBQTs7SUFDRSxJQUFHLEdBQUcsQ0FBQyxNQUFKLElBQWMsRUFBakI7TUFDRSxpQkFBQSxJQUFxQixDQUFBLHdFQUFBLENBQUEsQ0FDdUQsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFULENBRHZELENBQUEsb0JBQUEsQ0FBQSxDQUMyRixhQUQzRixDQUFBLEVBQUEsQ0FBQSxDQUM2RyxHQUFHLENBQUMsTUFEakgsQ0FBQSxTQUFBO01BR3JCLGFBQUEsSUFBaUI7TUFDakIsR0FBQSxHQUFNLEdBTFI7O0lBTUEsR0FBRyxDQUFDLElBQUosQ0FBUyxDQUFDLENBQUMsRUFBWDtFQVBGO0VBUUEsSUFBRyxHQUFHLENBQUMsTUFBSixHQUFhLENBQWhCO0lBQ0UsaUJBQUEsSUFBcUIsQ0FBQSx3RUFBQSxDQUFBLENBQ3VELEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxDQUR2RCxDQUFBLG9CQUFBLENBQUEsQ0FDMkYsYUFEM0YsQ0FBQSxFQUFBLENBQUEsQ0FDNkcsR0FBRyxDQUFDLE1BRGpILENBQUEsU0FBQSxFQUR2Qjs7U0FLQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDLENBQUE7RUFBQSxDQUFBLENBRXRDLGlCQUZzQyxDQUFBO01BQUE7QUF6QmpDOztBQStCYixZQUFBLEdBQWUsUUFBQSxDQUFBLENBQUE7U0FDYixRQUFRLENBQUMsY0FBVCxDQUF3QixVQUF4QixDQUFtQyxDQUFDLFNBQXBDLEdBQWdEO0FBRG5DOztBQUdmLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNoQixNQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsSUFBTyxrQkFBSixJQUFxQiwwQkFBckIsSUFBMEMsQ0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFKLEtBQVUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUE1QixDQUFqRDtBQUNFLFdBREY7O0VBR0EsSUFBQSxHQUFPO0VBQ1AsS0FBQSw0Q0FBQTs7SUFDRSxJQUFBLEdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFULENBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBQSxHQUE0QixDQUFDLENBQUMsS0FBRixDQUFRLENBQVI7SUFDbkMsT0FBQSxHQUFVO0lBQ1YsSUFBRyxDQUFBLEtBQUssR0FBRyxDQUFDLE9BQVo7TUFDRSxPQUFBLElBQVcsVUFEYjs7SUFFQSxJQUFBLElBQVEsQ0FBQSxVQUFBLENBQUEsQ0FDTSxPQUROLENBQUEsdUJBQUEsQ0FBQSxDQUN1QyxDQUR2QyxDQUFBLG1CQUFBLENBQUEsQ0FDOEQsSUFEOUQsQ0FBQSxJQUFBO0VBTFY7U0FRQSxRQUFRLENBQUMsY0FBVCxDQUF3QixVQUF4QixDQUFtQyxDQUFDLFNBQXBDLEdBQWdEO0FBYmxDOztBQWVoQixVQUFBLEdBQWEsUUFBQSxDQUFDLE9BQUQsQ0FBQTtFQUNYLElBQU8sc0JBQUosSUFBeUIsa0JBQXpCLElBQTBDLDBCQUExQyxJQUFtRSw2QkFBdEU7QUFDRSxXQURGOztTQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixFQUF1QjtJQUFFLEtBQUEsRUFBTyxZQUFUO0lBQXVCLEVBQUEsRUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQTVDO0lBQWdELEdBQUEsRUFBSztFQUFyRCxDQUF2QjtBQUpXOztBQU1iLGFBQUEsR0FBZ0IsUUFBQSxDQUFBLENBQUE7RUFDZCxJQUFHLGNBQUg7SUFDRSxJQUFHLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBQSxLQUEyQixDQUE5QjthQUNFLE1BQU0sQ0FBQyxTQUFQLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxNQUFNLENBQUMsVUFBUCxDQUFBLEVBSEY7S0FERjs7QUFEYzs7QUFPaEIsV0FBQSxHQUFjLE1BQUEsUUFBQSxDQUFDLEdBQUQsQ0FBQTtFQUNaLElBQUcsR0FBRyxDQUFDLEVBQUosS0FBVSxNQUFiO0FBQ0UsV0FERjs7RUFFQSxPQUFPLENBQUMsR0FBUixDQUFZLGVBQVosRUFBNkIsR0FBN0I7QUFDQSxVQUFPLEdBQUcsQ0FBQyxHQUFYO0FBQUEsU0FDTyxNQURQO2FBRUksUUFBQSxDQUFTLENBQUMsQ0FBVjtBQUZKLFNBR08sTUFIUDthQUlJLFFBQUEsQ0FBUyxDQUFUO0FBSkosU0FLTyxTQUxQO2FBTUksUUFBQSxDQUFTLENBQVQ7QUFOSixTQU9PLE9BUFA7YUFRSSxhQUFBLENBQUE7QUFSSixTQVNPLE1BVFA7TUFVSSxJQUFHLGdCQUFIO1FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCLEdBQUcsQ0FBQyxJQUEvQjtRQUNBLFFBQUEsR0FBVyxHQUFHLENBQUM7UUFDZixNQUFNLFVBQUEsQ0FBQTtRQUNOLFNBQUEsQ0FBQTtRQUNBLGVBQUEsQ0FBQTtRQUNBLHFCQUFBLENBQUE7UUFDQSxJQUFHLFVBQUg7VUFDRSxTQUFBLEdBQVksR0FBRyxDQUFDLElBQUksQ0FBQztVQUNyQixJQUFHLGlCQUFIO1lBQ0UsSUFBTyxjQUFQO2NBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaLEVBREY7O1lBRUEsSUFBQSxDQUFLLFNBQUwsRUFBZ0IsU0FBUyxDQUFDLEVBQTFCLEVBQThCLFNBQVMsQ0FBQyxLQUF4QyxFQUErQyxTQUFTLENBQUMsR0FBekQsRUFIRjtXQUZGOztRQU1BLFlBQUEsQ0FBQTtRQUNBLElBQUcsc0JBQUEsSUFBa0IsMEJBQWxCLElBQXdDLDZCQUEzQztpQkFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLFNBQVosRUFBdUI7WUFBRSxLQUFBLEVBQU8sWUFBVDtZQUF1QixFQUFBLEVBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQztVQUE1QyxDQUF2QixFQURGO1NBZEY7O0FBVko7QUFKWTs7QUErQmQsWUFBQSxHQUFlLFFBQUEsQ0FBQyxTQUFELENBQUE7RUFDYixNQUFBLEdBQVM7RUFDVCxJQUFPLGNBQVA7SUFDRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQWQsR0FBMEI7QUFDMUIsV0FGRjs7RUFHQSxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLEtBQWxDLEdBQTBDO0VBQzFDLElBQUcsY0FBSDtXQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtNQUFFLEVBQUEsRUFBSTtJQUFOLENBQXBCLEVBREY7O0FBTmE7O0FBU2YsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO0VBQ1YsWUFBQSxDQUFhLFlBQUEsQ0FBQSxDQUFiO0VBQ0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBaUMsQ0FBQyxPQUFsQyxHQUE0QztFQUM1QyxRQUFRLENBQUMsY0FBVCxDQUF3QixlQUF4QixDQUF3QyxDQUFDLEtBQUssQ0FBQyxPQUEvQyxHQUF5RDtFQUN6RCxRQUFRLENBQUMsY0FBVCxDQUF3QixZQUF4QixDQUFxQyxDQUFDLEtBQUssQ0FBQyxPQUE1QyxHQUFzRDtTQUN0RCxpQkFBQSxDQUFBO0FBTFU7O0FBT1osWUFBQSxHQUFlLFFBQUEsQ0FBQSxDQUFBO0FBQ2YsTUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLGVBQUEsRUFBQSxRQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEI7RUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBUDtFQUN4QixZQUFBLEdBQWUsUUFBUSxDQUFDO0VBQ3hCLGNBQUEsR0FBaUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQztFQUNwRCxJQUFPLG9CQUFQO0FBQ0UsV0FERjs7RUFFQSxZQUFBLEdBQWUsWUFBWSxDQUFDLElBQWIsQ0FBQTtFQUNmLElBQUcsWUFBWSxDQUFDLE1BQWIsR0FBc0IsQ0FBekI7QUFDRSxXQURGOztFQUVBLElBQUcsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBM0I7SUFDRSxJQUFHLENBQUksT0FBQSxDQUFRLENBQUEsK0JBQUEsQ0FBQSxDQUFrQyxZQUFsQyxDQUFBLEVBQUEsQ0FBUixDQUFQO0FBQ0UsYUFERjtLQURGOztFQUdBLFlBQUEsR0FBZSxZQUFZLENBQUMsT0FBYixDQUFxQixPQUFyQjtFQUNmLGVBQUEsR0FBa0I7SUFDaEIsS0FBQSxFQUFPLFlBRFM7SUFFaEIsTUFBQSxFQUFRLE1BRlE7SUFHaEIsUUFBQSxFQUFVO0VBSE07RUFLbEIsbUJBQUEsR0FBc0I7U0FDdEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGVBQTVCO0FBcEJhOztBQXNCZixjQUFBLEdBQWlCLFFBQUEsQ0FBQSxDQUFBO0FBQ2pCLE1BQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxRQUFBLEVBQUE7RUFBRSxLQUFBLEdBQVEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEI7RUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBUDtFQUN4QixZQUFBLEdBQWUsUUFBUSxDQUFDO0VBQ3hCLElBQU8sb0JBQVA7QUFDRSxXQURGOztFQUVBLFlBQUEsR0FBZSxZQUFZLENBQUMsSUFBYixDQUFBO0VBQ2YsSUFBRyxZQUFZLENBQUMsTUFBYixHQUFzQixDQUF6QjtBQUNFLFdBREY7O0VBRUEsSUFBRyxDQUFJLE9BQUEsQ0FBUSxDQUFBLCtCQUFBLENBQUEsQ0FBa0MsWUFBbEMsQ0FBQSxFQUFBLENBQVIsQ0FBUDtBQUNFLFdBREY7O0VBRUEsWUFBQSxHQUFlLFlBQVksQ0FBQyxPQUFiLENBQXFCLE9BQXJCO0VBQ2YsZUFBQSxHQUFrQjtJQUNoQixLQUFBLEVBQU8sWUFEUztJQUVoQixNQUFBLEVBQVEsS0FGUTtJQUdoQixPQUFBLEVBQVM7RUFITztTQUtsQixNQUFNLENBQUMsSUFBUCxDQUFZLGNBQVosRUFBNEIsZUFBNUI7QUFqQmU7O0FBbUJqQixZQUFBLEdBQWUsUUFBQSxDQUFBLENBQUE7QUFDZixNQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUE7RUFBRSxVQUFBLEdBQWEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbUMsQ0FBQztFQUNqRCxVQUFBLEdBQWEsVUFBVSxDQUFDLElBQVgsQ0FBQTtFQUNiLGFBQUEsR0FBZ0IsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQztFQUNuRCxJQUFHLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQXZCO0FBQ0UsV0FERjs7RUFFQSxJQUFHLENBQUksT0FBQSxDQUFRLENBQUEsK0JBQUEsQ0FBQSxDQUFrQyxVQUFsQyxDQUFBLEVBQUEsQ0FBUixDQUFQO0FBQ0UsV0FERjs7RUFFQSxZQUFBLEdBQWUsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsT0FBckI7RUFDZixlQUFBLEdBQWtCO0lBQ2hCLEtBQUEsRUFBTyxZQURTO0lBRWhCLE1BQUEsRUFBUSxNQUZRO0lBR2hCLFFBQUEsRUFBVSxVQUhNO0lBSWhCLE9BQUEsRUFBUztFQUpPO0VBTWxCLG1CQUFBLEdBQXNCO1NBQ3RCLE1BQU0sQ0FBQyxJQUFQLENBQVksY0FBWixFQUE0QixlQUE1QjtBQWhCYTs7QUFrQmYsb0JBQUEsR0FBdUIsUUFBQSxDQUFBLENBQUE7QUFDdkIsTUFBQTtFQUFFLFlBQUEsR0FBZSxZQUFZLENBQUMsT0FBYixDQUFxQixPQUFyQjtFQUNmLGVBQUEsR0FBa0I7SUFDaEIsS0FBQSxFQUFPLFlBRFM7SUFFaEIsTUFBQSxFQUFRO0VBRlE7U0FJbEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGVBQTVCO0FBTnFCOztBQVF2QixtQkFBQSxHQUFzQixRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ3RCLE1BQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQTtFQUFFLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVosRUFBbUMsR0FBbkM7RUFDQSxJQUFHLGdCQUFIO0lBQ0UsS0FBQSxHQUFRLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCO0lBQ1IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFkLEdBQXVCO0lBQ3ZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxDQUFjLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO2FBQ1osQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFlLENBQUMsYUFBaEIsQ0FBOEIsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUE5QjtJQURZLENBQWQ7QUFFQTtJQUFBLEtBQUEsd0NBQUE7O01BQ0UsVUFBQSxHQUFjLElBQUEsS0FBUSxHQUFHLENBQUM7TUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWYsQ0FBYixHQUFzQyxJQUFJLE1BQUosQ0FBVyxJQUFYLEVBQWlCLElBQWpCLEVBQXVCLEtBQXZCLEVBQThCLFVBQTlCO0lBRnhDO0lBR0EsSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7TUFDRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBZixDQUFiLEdBQXNDLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsRUFBbkIsRUFEeEM7S0FSRjs7RUFVQSxJQUFHLG9CQUFIO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbUMsQ0FBQyxLQUFwQyxHQUE0QyxHQUFHLENBQUMsU0FEbEQ7O0VBRUEsSUFBRyxtQkFBSDtJQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQXhCLENBQWtDLENBQUMsS0FBbkMsR0FBMkMsR0FBRyxDQUFDLFFBRGpEOztTQUVBLFdBQUEsQ0FBQTtBQWhCb0I7O0FBa0J0QixNQUFBLEdBQVMsUUFBQSxDQUFBLENBQUE7RUFDUCxRQUFRLENBQUMsY0FBVCxDQUF3QixVQUF4QixDQUFtQyxDQUFDLFNBQXBDLEdBQWdEO0VBQ2hELFlBQVksQ0FBQyxVQUFiLENBQXdCLE9BQXhCO0VBQ0EsWUFBQSxHQUFlO1NBQ2YsWUFBQSxDQUFBO0FBSk87O0FBTVQsWUFBQSxHQUFlLFFBQUEsQ0FBQSxDQUFBO0FBQ2YsTUFBQTtFQUFFLFlBQUEsR0FBZSxZQUFZLENBQUMsT0FBYixDQUFxQixPQUFyQjtFQUNmLGVBQUEsR0FBa0I7SUFDaEIsS0FBQSxFQUFPO0VBRFM7RUFHbEIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQyxlQUFsQztTQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksVUFBWixFQUF3QixlQUF4QjtBQU5hOztBQVFmLGVBQUEsR0FBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNsQixNQUFBLHFCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxvQkFBWixFQUFrQyxHQUFsQztFQUNBLElBQUcsR0FBRyxDQUFDLFFBQVA7SUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLHdCQUFaO0lBQ0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbUMsQ0FBQyxTQUFwQyxHQUFnRDtBQUNoRCxXQUhGOztFQUtBLElBQUcsaUJBQUEsSUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBUixHQUFpQixDQUFsQixDQUFoQjtJQUNFLFVBQUEsR0FBYSxHQUFHLENBQUM7SUFDakIscUJBQUEsR0FBd0I7SUFDeEIsSUFBRyxvQkFBSDtNQUNFLGVBQUEsR0FBa0IsR0FBRyxDQUFDO01BQ3RCLHFCQUFBLEdBQXdCLENBQUEsRUFBQSxDQUFBLENBQUssZUFBTCxDQUFBLENBQUEsRUFGMUI7O0lBR0EsSUFBQSxHQUFPLENBQUEsQ0FBQSxDQUNILFVBREcsQ0FBQSxDQUFBLENBQ1UscUJBRFYsQ0FBQSxxQ0FBQTtJQUdQLG9CQUFBLENBQUEsRUFURjtHQUFBLE1BQUE7SUFXRSxVQUFBLEdBQWE7SUFDYixlQUFBLEdBQWtCO0lBQ2xCLFlBQUEsR0FBZTtJQUVmLFdBQUEsR0FBYyxNQUFBLENBQU8sTUFBTSxDQUFDLFFBQWQsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxNQUFoQyxFQUF3QyxFQUF4QyxDQUFBLEdBQThDO0lBQzVELFNBQUEsR0FBWSxDQUFBLG1EQUFBLENBQUEsQ0FBc0QsTUFBTSxDQUFDLFNBQTdELENBQUEsY0FBQSxDQUFBLENBQXVGLGtCQUFBLENBQW1CLFdBQW5CLENBQXZGLENBQUEsa0NBQUE7SUFDWixJQUFBLEdBQU8sQ0FBQSxpRkFBQTs7VUFHNEIsQ0FBRSxLQUFLLENBQUMsT0FBM0MsR0FBcUQ7OztVQUNsQixDQUFFLEtBQUssQ0FBQyxPQUEzQyxHQUFxRDtLQXJCdkQ7O0VBc0JBLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBQW1DLENBQUMsU0FBcEMsR0FBZ0Q7RUFDaEQsSUFBRywwREFBSDtXQUNFLFdBQUEsQ0FBQSxFQURGOztBQTlCZ0I7O0FBaUNsQixZQUFBLEdBQWU7O0FBQ2YsTUFBTSxDQUFDLHVCQUFQLEdBQWlDLFFBQUEsQ0FBQSxDQUFBO0VBQy9CLElBQUcsWUFBSDtBQUNFLFdBREY7O0VBRUEsWUFBQSxHQUFlO0VBRWYsT0FBTyxDQUFDLEdBQVIsQ0FBWSx5QkFBWjtTQUNBLFVBQUEsQ0FBVyxRQUFBLENBQUEsQ0FBQTtXQUNULFVBQUEsQ0FBQTtFQURTLENBQVgsRUFFRSxDQUZGO0FBTitCOztBQVVqQyxVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLFNBQUEsRUFBQTtFQUFFLE1BQU0sQ0FBQyxhQUFQLEdBQXVCO0VBQ3ZCLE1BQU0sQ0FBQyxlQUFQLEdBQXlCO0VBQ3pCLE1BQU0sQ0FBQyxjQUFQLEdBQXdCO0VBQ3hCLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0VBQ3JCLE1BQU0sQ0FBQyxZQUFQLEdBQXNCO0VBQ3RCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCO0VBQ2hCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CO0VBQ25CLE1BQU0sQ0FBQyxLQUFQLEdBQWU7RUFDZixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsWUFBUCxHQUFzQjtFQUN0QixNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUNwQixNQUFNLENBQUMsY0FBUCxHQUF3QjtFQUN4QixNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUNwQixNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUNwQixNQUFNLENBQUMsUUFBUCxHQUFrQjtFQUNsQixNQUFNLENBQUMsYUFBUCxHQUF1QjtFQUN2QixNQUFNLENBQUMsYUFBUCxHQUF1QjtFQUN2QixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsUUFBUCxHQUFrQjtFQUNsQixNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsUUFBUCxHQUFrQjtFQUNsQixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsU0FBUCxHQUFtQixVQXRCckI7OztFQTJCRSxTQUFBLEdBQVksU0FBUyxDQUFDO0VBQ3RCLElBQUcsbUJBQUEsSUFBZSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLEtBQWxCLENBQXdCLFdBQXhCLENBQWxCO0lBQ0UsT0FBQSxHQUFVLEtBRFo7O0VBR0EsSUFBRyxPQUFIO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBZ0MsQ0FBQyxTQUFTLENBQUMsR0FBM0MsQ0FBK0MsT0FBL0MsRUFERjs7RUFHQSxtQkFBQSxHQUFzQixFQUFBLENBQUcsTUFBSDtFQUN0QixJQUFHLDJCQUFIO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbUMsQ0FBQyxLQUFwQyxHQUE0QyxvQkFEOUM7O0VBR0EsYUFBQSxHQUFnQjtFQUNoQixPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsZ0JBQUEsQ0FBQSxDQUFtQixhQUFuQixDQUFBLENBQVo7RUFDQSxJQUFHLGFBQUg7SUFDRSxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLFNBQWxDLEdBQThDLENBQUEsK0lBQUEsRUFEaEQ7O0VBS0EsWUFBQSxDQUFhLEVBQUEsQ0FBRyxNQUFILENBQWI7RUFFQSxTQUFBLEdBQVksRUFBQSxDQUFHLFNBQUg7RUFDWixJQUFHLGlCQUFIO0lBQ0UsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxLQUFuQyxHQUEyQyxVQUQ3Qzs7RUFHQSxVQUFBLEdBQWE7RUFDYixRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUFpQyxDQUFDLE9BQWxDLEdBQTRDO0VBQzVDLElBQUcsVUFBSDtJQUNFLFFBQVEsQ0FBQyxjQUFULENBQXdCLGVBQXhCLENBQXdDLENBQUMsS0FBSyxDQUFDLE9BQS9DLEdBQXlEO0lBQ3pELFFBQVEsQ0FBQyxjQUFULENBQXdCLFlBQXhCLENBQXFDLENBQUMsS0FBSyxDQUFDLE9BQTVDLEdBQXNELFFBRnhEOztFQUlBLE1BQUEsR0FBUyxFQUFBLENBQUE7RUFFVCxNQUFNLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsUUFBQSxDQUFBLENBQUE7SUFDbkIsSUFBRyxjQUFIO01BQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFaLEVBQW9CO1FBQUUsRUFBQSxFQUFJO01BQU4sQ0FBcEI7YUFDQSxZQUFBLENBQUEsRUFGRjs7RUFEbUIsQ0FBckI7RUFLQSxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtXQUNoQixXQUFBLENBQVksR0FBWjtFQURnQixDQUFsQjtFQUdBLE1BQU0sQ0FBQyxFQUFQLENBQVUsVUFBVixFQUFzQixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQ3BCLGVBQUEsQ0FBZ0IsR0FBaEI7RUFEb0IsQ0FBdEI7RUFHQSxNQUFNLENBQUMsRUFBUCxDQUFVLFNBQVYsRUFBcUIsUUFBQSxDQUFDLEdBQUQsQ0FBQTtXQUNuQixhQUFBLENBQWMsR0FBZDtFQURtQixDQUFyQjtFQUdBLE1BQU0sQ0FBQyxFQUFQLENBQVUsY0FBVixFQUEwQixRQUFBLENBQUMsR0FBRCxDQUFBO1dBQ3hCLG1CQUFBLENBQW9CLEdBQXBCO0VBRHdCLENBQTFCO0VBR0EsV0FBQSxDQUFBO0VBRUEsSUFBSSxTQUFKLENBQWMsUUFBZCxFQUF3QjtJQUN0QixJQUFBLEVBQU0sUUFBQSxDQUFDLE9BQUQsQ0FBQTtBQUNWLFVBQUE7TUFBTSxJQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBZCxDQUFvQixRQUFwQixDQUFIO0FBQ0UsZUFBTyxTQUFBLENBQUEsRUFEVDs7TUFFQSxNQUFBLEdBQVM7TUFDVCxJQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBZCxDQUFvQixTQUFwQixDQUFIO1FBQ0UsTUFBQSxHQUFTLEtBRFg7O0FBRUEsYUFBTyxZQUFBLENBQWEsTUFBYjtJQU5IO0VBRGdCLENBQXhCO0VBVUEsSUFBRyxVQUFIO1dBQ0UsYUFBQSxDQUFBLEVBREY7R0FBQSxNQUFBO1dBR0UsYUFBQSxDQUFBLEVBSEY7O0FBekZXOztBQStGYixVQUFBLENBQVcsUUFBQSxDQUFBLENBQUEsRUFBQTs7RUFFVCxJQUFHLENBQUksWUFBUDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVo7V0FDQSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxFQUZGOztBQUZTLENBQVgsRUFLRSxJQUxGOzs7O0FDejhCQSxNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsUUFBQSxFQUNFO0lBQUEsSUFBQSxFQUFNLElBQU47SUFDQSxJQUFBLEVBQU0sSUFETjtJQUVBLEdBQUEsRUFBSyxJQUZMO0lBR0EsSUFBQSxFQUFNLElBSE47SUFJQSxJQUFBLEVBQU07RUFKTixDQURGO0VBT0EsWUFBQSxFQUNFLENBQUE7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLElBQUEsRUFBTTtFQUROLENBUkY7RUFXQSxZQUFBLEVBQ0UsQ0FBQTtJQUFBLEdBQUEsRUFBSztFQUFMLENBWkY7RUFjQSxXQUFBLEVBQ0UsQ0FBQTtJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsSUFBQSxFQUFNO0VBRE4sQ0FmRjtFQWtCQSxZQUFBLEVBQWM7SUFBQyxNQUFEO0lBQVMsTUFBVDtJQUFpQixLQUFqQjtJQUF3QixNQUF4QjtJQUFnQyxNQUFoQzs7QUFsQmQ7Ozs7QUNERixJQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUEseUJBQUEsRUFBQSxjQUFBLEVBQUEsb0JBQUEsRUFBQSxZQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsYUFBQSxFQUFBOztBQUFBLGNBQUEsR0FBaUI7O0FBQ2pCLGNBQUEsR0FBaUIsQ0FBQTs7QUFFakIsb0JBQUEsR0FBdUI7O0FBQ3ZCLHlCQUFBLEdBQTRCOztBQUM1QixPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSOztBQUVWLEdBQUEsR0FBTSxRQUFBLENBQUEsQ0FBQTtBQUNKLFNBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxJQUF4QjtBQURIOztBQUdOLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNkLFNBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLENBQWxCO0FBRE87O0FBR2hCLGtCQUFBLEdBQXFCLFFBQUEsQ0FBQyxFQUFELEVBQUssUUFBTCxFQUFlLG1CQUFmLENBQUE7RUFDbkIsY0FBQSxHQUFpQjtFQUNqQixvQkFBQSxHQUF1QjtTQUN2Qix5QkFBQSxHQUE0QjtBQUhUOztBQUtyQixPQUFBLEdBQVUsUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNSLFNBQU8sSUFBSSxPQUFKLENBQVksUUFBQSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQUE7QUFDckIsUUFBQTtJQUFJLEtBQUEsR0FBUSxJQUFJLGNBQUosQ0FBQTtJQUNSLEtBQUssQ0FBQyxrQkFBTixHQUEyQixRQUFBLENBQUEsQ0FBQTtBQUMvQixVQUFBO01BQVEsSUFBRyxDQUFDLElBQUMsQ0FBQSxVQUFELEtBQWUsQ0FBaEIsQ0FBQSxJQUF1QixDQUFDLElBQUMsQ0FBQSxNQUFELEtBQVcsR0FBWixDQUExQjtBQUVHOztVQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxZQUFqQjtpQkFDVixPQUFBLENBQVEsT0FBUixFQUZGO1NBR0EsYUFBQTtpQkFDRSxPQUFBLENBQVEsSUFBUixFQURGO1NBTEg7O0lBRHVCO0lBUTNCLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxFQUFrQixHQUFsQixFQUF1QixJQUF2QjtXQUNBLEtBQUssQ0FBQyxJQUFOLENBQUE7RUFYaUIsQ0FBWjtBQURDOztBQWNWLGFBQUEsR0FBZ0IsTUFBQSxRQUFBLENBQUMsVUFBRCxDQUFBO0VBQ2QsSUFBTyxrQ0FBUDtJQUNFLGNBQWMsQ0FBQyxVQUFELENBQWQsR0FBNkIsQ0FBQSxNQUFNLE9BQUEsQ0FBUSxDQUFBLG9CQUFBLENBQUEsQ0FBdUIsa0JBQUEsQ0FBbUIsVUFBbkIsQ0FBdkIsQ0FBQSxDQUFSLENBQU47SUFDN0IsSUFBTyxrQ0FBUDthQUNFLGNBQUEsQ0FBZSxDQUFBLDZCQUFBLENBQUEsQ0FBZ0MsVUFBaEMsQ0FBQSxDQUFmLEVBREY7S0FGRjs7QUFEYzs7QUFNaEIsWUFBQSxHQUFlLE1BQUEsUUFBQSxDQUFDLFlBQUQsRUFBZSxlQUFlLEtBQTlCLENBQUE7QUFDZixNQUFBLFVBQUEsRUFBQSxPQUFBLEVBQUEsaUJBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLGFBQUEsRUFBQTtFQUFFLFdBQUEsR0FBYztFQUNkLElBQUcsc0JBQUEsSUFBa0IsQ0FBQyxZQUFZLENBQUMsTUFBYixHQUFzQixDQUF2QixDQUFyQjtJQUNFLFdBQUEsR0FBYztJQUNkLFVBQUEsR0FBYSxZQUFZLENBQUMsS0FBYixDQUFtQixPQUFuQjtJQUNiLEtBQUEsNENBQUE7O01BQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQUE7TUFDVCxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQW5CO1FBQ0UsV0FBVyxDQUFDLElBQVosQ0FBaUIsTUFBakIsRUFERjs7SUFGRjtJQUlBLElBQUcsV0FBVyxDQUFDLE1BQVosS0FBc0IsQ0FBekI7O01BRUUsV0FBQSxHQUFjLEtBRmhCO0tBUEY7O0VBVUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLFdBQXhCO0VBQ0EsSUFBRyxzQkFBSDtJQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVosRUFERjtHQUFBLE1BQUE7SUFHRSxPQUFPLENBQUMsR0FBUixDQUFZLHlCQUFaO0lBQ0EsY0FBQSxHQUFpQixDQUFBLE1BQU0sT0FBQSxDQUFRLGdCQUFSLENBQU47SUFDakIsSUFBTyxzQkFBUDtBQUNFLGFBQU8sS0FEVDtLQUxGOztFQVFBLGNBQUEsR0FBaUI7RUFDakIsSUFBRyxtQkFBSDtJQUNFLEtBQUEsb0JBQUE7O01BQ0UsQ0FBQyxDQUFDLE9BQUYsR0FBWTtNQUNaLENBQUMsQ0FBQyxPQUFGLEdBQVk7SUFGZDtJQUlBLFVBQUEsR0FBYTtJQUNiLEtBQUEsK0NBQUE7O01BQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYjtNQUNULElBQUcsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFhLFNBQWhCO0FBQ0UsaUJBREY7O01BR0EsT0FBQSxHQUFVO01BQ1YsUUFBQSxHQUFXO01BQ1gsSUFBRyxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWEsTUFBaEI7UUFDRSxRQUFBLEdBQVc7UUFDWCxNQUFNLENBQUMsS0FBUCxDQUFBLEVBRkY7T0FBQSxNQUdLLElBQUcsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFhLEtBQWhCO1FBQ0gsUUFBQSxHQUFXO1FBQ1gsT0FBQSxHQUFVLENBQUM7UUFDWCxNQUFNLENBQUMsS0FBUCxDQUFBLEVBSEc7O01BSUwsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFwQjtBQUNFLGlCQURGOztNQUVBLElBQUcsUUFBQSxLQUFZLFNBQWY7UUFDRSxVQUFBLEdBQWEsTUFEZjs7TUFHQSxTQUFBLEdBQVksTUFBTSxDQUFDLEtBQVAsQ0FBYSxDQUFiLENBQWUsQ0FBQyxJQUFoQixDQUFxQixHQUFyQjtNQUNaLFFBQUEsR0FBVztNQUVYLElBQUcsT0FBQSxHQUFVLE1BQU0sQ0FBQyxDQUFELENBQUcsQ0FBQyxLQUFWLENBQWdCLFNBQWhCLENBQWI7UUFDRSxPQUFBLEdBQVUsQ0FBQztRQUNYLE1BQU0sQ0FBQyxDQUFELENBQU4sR0FBWSxPQUFPLENBQUMsQ0FBRCxFQUZyQjs7TUFJQSxPQUFBLEdBQVUsTUFBTSxDQUFDLENBQUQsQ0FBRyxDQUFDLFdBQVYsQ0FBQTtBQUNWLGNBQU8sT0FBUDtBQUFBLGFBQ08sUUFEUDtBQUFBLGFBQ2lCLE1BRGpCO1VBRUksU0FBQSxHQUFZLFNBQVMsQ0FBQyxXQUFWLENBQUE7VUFDWixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixDQUEvQixDQUFBLEtBQXFDLENBQUM7VUFBaEQ7QUFGQTtBQURqQixhQUlPLE9BSlA7QUFBQSxhQUlnQixNQUpoQjtVQUtJLFNBQUEsR0FBWSxTQUFTLENBQUMsV0FBVixDQUFBO1VBQ1osVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO21CQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsQ0FBOUIsQ0FBQSxLQUFvQyxDQUFDO1VBQS9DO0FBRkQ7QUFKaEIsYUFPTyxPQVBQO1VBUUksVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO21CQUFVLENBQUMsQ0FBQyxRQUFGLEtBQWM7VUFBeEI7QUFEVjtBQVBQLGFBU08sVUFUUDtVQVVJLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTttQkFBVSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsQ0FBQyxJQUFkLENBQW1CLENBQUMsTUFBcEIsS0FBOEI7VUFBeEM7QUFEVjtBQVRQLGFBV08sS0FYUDtVQVlJLFNBQUEsR0FBWSxTQUFTLENBQUMsV0FBVixDQUFBO1VBQ1osVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO21CQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBRCxDQUFOLEtBQWE7VUFBdkI7QUFGVjtBQVhQLGFBY08sUUFkUDtBQUFBLGFBY2lCLE9BZGpCO1VBZUksT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFNBQUEsQ0FBQSxDQUFZLFNBQVosQ0FBQSxDQUFBLENBQVo7QUFDQTtZQUNFLGlCQUFBLEdBQW9CLGFBQUEsQ0FBYyxTQUFkLEVBRHRCO1dBRUEsYUFBQTtZQUFNLHNCQUNoQjs7WUFDWSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsNEJBQUEsQ0FBQSxDQUErQixhQUEvQixDQUFBLENBQVo7QUFDQSxtQkFBTyxLQUhUOztVQUtBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxVQUFBLENBQUEsQ0FBYSxTQUFiLENBQUEsSUFBQSxDQUFBLENBQTZCLGlCQUE3QixDQUFBLENBQVo7VUFDQSxLQUFBLEdBQVEsR0FBQSxDQUFBLENBQUEsR0FBUTtVQUNoQixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7bUJBQVUsQ0FBQyxDQUFDLEtBQUYsR0FBVTtVQUFwQjtBQVhBO0FBZGpCLGFBMEJPLE1BMUJQO0FBQUEsYUEwQmUsTUExQmY7QUFBQSxhQTBCdUIsTUExQnZCO0FBQUEsYUEwQitCLE1BMUIvQjtVQTJCSSxhQUFBLEdBQWdCO1VBQ2hCLFVBQUEsR0FBYTtVQUNiLElBQUcsb0JBQUg7WUFDRSxVQUFBLEdBQWEseUJBQUEsQ0FBMEIsVUFBMUI7WUFDYixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7QUFBUyxrQkFBQTtzRUFBMkIsQ0FBRSxVQUFGLFdBQTFCLEtBQTJDO1lBQXJELEVBRmY7V0FBQSxNQUFBO1lBSUUsTUFBTSxhQUFBLENBQWMsVUFBZDtZQUNOLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtBQUFTLGtCQUFBO3NFQUEyQixDQUFFLENBQUMsQ0FBQyxFQUFKLFdBQTFCLEtBQXFDO1lBQS9DLEVBTGY7O0FBSDJCO0FBMUIvQixhQW1DTyxNQW5DUDtVQW9DSSxhQUFBLEdBQWdCO1VBQ2hCLFVBQUEsR0FBYTtVQUNiLElBQUcsb0JBQUg7WUFDRSxVQUFBLEdBQWEseUJBQUEsQ0FBMEIsVUFBMUI7WUFDYixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7QUFBUyxrQkFBQTtzRUFBMkIsQ0FBRSxVQUFGLFdBQTFCLEtBQTJDO1lBQXJELEVBRmY7V0FBQSxNQUFBO1lBSUUsTUFBTSxhQUFBLENBQWMsVUFBZDtZQUNOLFVBQUEsR0FBYSxRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtBQUFTLGtCQUFBO3NFQUEyQixDQUFFLENBQUMsQ0FBQyxFQUFKLFdBQTFCLEtBQXFDO1lBQS9DLEVBTGY7O0FBSEc7QUFuQ1AsYUE0Q08sTUE1Q1A7VUE2Q0ksU0FBQSxHQUFZLFNBQVMsQ0FBQyxXQUFWLENBQUE7VUFDWixVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUE7QUFDdkIsZ0JBQUE7WUFBWSxJQUFBLEdBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBQSxHQUF5QixLQUF6QixHQUFpQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQTttQkFDeEMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLENBQUEsS0FBbUIsQ0FBQztVQUZUO0FBRlY7QUE1Q1AsYUFpRE8sSUFqRFA7QUFBQSxhQWlEYSxLQWpEYjtVQWtESSxRQUFBLEdBQVcsQ0FBQTtBQUNYO1VBQUEsS0FBQSx1Q0FBQTs7WUFDRSxJQUFHLEVBQUUsQ0FBQyxLQUFILENBQVMsSUFBVCxDQUFIO0FBQ0Usb0JBREY7O1lBRUEsUUFBUSxDQUFDLEVBQUQsQ0FBUixHQUFlO1VBSGpCO1VBSUEsVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFBO21CQUFVLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBSDtVQUFsQjtBQU5KO0FBakRiOztBQTBESTtBQTFESjtNQTREQSxJQUFHLGdCQUFIO1FBQ0UsS0FBQSxjQUFBO1VBQ0UsQ0FBQSxHQUFJLGNBQWMsQ0FBQyxFQUFEO1VBQ2xCLElBQU8sU0FBUDtBQUNFLHFCQURGOztVQUVBLE9BQUEsR0FBVTtVQUNWLElBQUcsT0FBSDtZQUNFLE9BQUEsR0FBVSxDQUFDLFFBRGI7O1VBRUEsSUFBRyxPQUFIO1lBQ0UsQ0FBQyxDQUFDLFFBQUQsQ0FBRCxHQUFjLEtBRGhCOztRQVBGLENBREY7T0FBQSxNQUFBO1FBV0UsS0FBQSxvQkFBQTs7VUFDRSxPQUFBLEdBQVUsVUFBQSxDQUFXLENBQVgsRUFBYyxTQUFkO1VBQ1YsSUFBRyxPQUFIO1lBQ0UsT0FBQSxHQUFVLENBQUMsUUFEYjs7VUFFQSxJQUFHLE9BQUg7WUFDRSxDQUFDLENBQUMsUUFBRCxDQUFELEdBQWMsS0FEaEI7O1FBSkYsQ0FYRjs7SUF2RkY7SUF5R0EsS0FBQSxvQkFBQTs7TUFDRSxJQUFHLENBQUMsQ0FBQyxDQUFDLE9BQUYsSUFBYSxVQUFkLENBQUEsSUFBOEIsQ0FBSSxDQUFDLENBQUMsT0FBdkM7UUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQixFQURGOztJQURGLENBL0dGO0dBQUEsTUFBQTs7SUFvSEUsS0FBQSxvQkFBQTs7TUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixDQUFwQjtJQURGLENBcEhGOztFQXVIQSxJQUFHLFlBQUg7SUFDRSxjQUFjLENBQUMsSUFBZixDQUFvQixRQUFBLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBQTtNQUNsQixJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLENBQUMsRUFEVjs7TUFFQSxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVCxDQUFBLENBQUEsR0FBeUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFULENBQUEsQ0FBNUI7QUFDRSxlQUFPLEVBRFQ7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxDQUFDLEVBRFY7O01BRUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVIsQ0FBQSxDQUFBLEdBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBUixDQUFBLENBQTNCO0FBQ0UsZUFBTyxFQURUOztBQUVBLGFBQU87SUFUVyxDQUFwQixFQURGOztBQVdBLFNBQU87QUF4Sk07O0FBMEpmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxrQkFBQSxFQUFvQixrQkFBcEI7RUFDQSxZQUFBLEVBQWM7QUFEZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIVxuICogY2xpcGJvYXJkLmpzIHYyLjAuOFxuICogaHR0cHM6Ly9jbGlwYm9hcmRqcy5jb20vXG4gKlxuICogTGljZW5zZWQgTUlUIMKpIFplbm8gUm9jaGFcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQ2xpcGJvYXJkSlNcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24oKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVzX18gPSAoe1xuXG4vKioqLyAxMzQ6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIEVYUE9SVFNcbl9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCB7XG4gIFwiZGVmYXVsdFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIC8qIGJpbmRpbmcgKi8gY2xpcGJvYXJkOyB9XG59KTtcblxuLy8gRVhURVJOQUwgTU9EVUxFOiAuL25vZGVfbW9kdWxlcy90aW55LWVtaXR0ZXIvaW5kZXguanNcbnZhciB0aW55X2VtaXR0ZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI3OSk7XG52YXIgdGlueV9lbWl0dGVyX2RlZmF1bHQgPSAvKiNfX1BVUkVfXyovX193ZWJwYWNrX3JlcXVpcmVfXy5uKHRpbnlfZW1pdHRlcik7XG4vLyBFWFRFUk5BTCBNT0RVTEU6IC4vbm9kZV9tb2R1bGVzL2dvb2QtbGlzdGVuZXIvc3JjL2xpc3Rlbi5qc1xudmFyIGxpc3RlbiA9IF9fd2VicGFja19yZXF1aXJlX18oMzcwKTtcbnZhciBsaXN0ZW5fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9fX3dlYnBhY2tfcmVxdWlyZV9fLm4obGlzdGVuKTtcbi8vIEVYVEVSTkFMIE1PRFVMRTogLi9ub2RlX21vZHVsZXMvc2VsZWN0L3NyYy9zZWxlY3QuanNcbnZhciBzcmNfc2VsZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MTcpO1xudmFyIHNlbGVjdF9kZWZhdWx0ID0gLyojX19QVVJFX18qL19fd2VicGFja19yZXF1aXJlX18ubihzcmNfc2VsZWN0KTtcbjsvLyBDT05DQVRFTkFURUQgTU9EVUxFOiAuL3NyYy9jbGlwYm9hcmQtYWN0aW9uLmpzXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuXG4vKipcbiAqIElubmVyIGNsYXNzIHdoaWNoIHBlcmZvcm1zIHNlbGVjdGlvbiBmcm9tIGVpdGhlciBgdGV4dGAgb3IgYHRhcmdldGBcbiAqIHByb3BlcnRpZXMgYW5kIHRoZW4gZXhlY3V0ZXMgY29weSBvciBjdXQgb3BlcmF0aW9ucy5cbiAqL1xuXG52YXIgQ2xpcGJvYXJkQWN0aW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBDbGlwYm9hcmRBY3Rpb24ob3B0aW9ucykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbGlwYm9hcmRBY3Rpb24pO1xuXG4gICAgdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLmluaXRTZWxlY3Rpb24oKTtcbiAgfVxuICAvKipcbiAgICogRGVmaW5lcyBiYXNlIHByb3BlcnRpZXMgcGFzc2VkIGZyb20gY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKENsaXBib2FyZEFjdGlvbiwgW3tcbiAgICBrZXk6IFwicmVzb2x2ZU9wdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmFjdGlvbiA9IG9wdGlvbnMuYWN0aW9uO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICAgIHRoaXMuZW1pdHRlciA9IG9wdGlvbnMuZW1pdHRlcjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSBvcHRpb25zLnRleHQ7XG4gICAgICB0aGlzLnRyaWdnZXIgPSBvcHRpb25zLnRyaWdnZXI7XG4gICAgICB0aGlzLnNlbGVjdGVkVGV4dCA9ICcnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWNpZGVzIHdoaWNoIHNlbGVjdGlvbiBzdHJhdGVneSBpcyBnb2luZyB0byBiZSBhcHBsaWVkIGJhc2VkXG4gICAgICogb24gdGhlIGV4aXN0ZW5jZSBvZiBgdGV4dGAgYW5kIGB0YXJnZXRgIHByb3BlcnRpZXMuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpbml0U2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXRTZWxlY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50ZXh0KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0RmFrZSgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRhcmdldCkge1xuICAgICAgICB0aGlzLnNlbGVjdFRhcmdldCgpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZmFrZSB0ZXh0YXJlYSBlbGVtZW50LCBzZXRzIGl0cyB2YWx1ZSBmcm9tIGB0ZXh0YCBwcm9wZXJ0eSxcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNyZWF0ZUZha2VFbGVtZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUZha2VFbGVtZW50KCkge1xuICAgICAgdmFyIGlzUlRMID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGlyJykgPT09ICdydGwnO1xuICAgICAgdGhpcy5mYWtlRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7IC8vIFByZXZlbnQgem9vbWluZyBvbiBpT1NcblxuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5mb250U2l6ZSA9ICcxMnB0JzsgLy8gUmVzZXQgYm94IG1vZGVsXG5cbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGUuYm9yZGVyID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5wYWRkaW5nID0gJzAnO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS5tYXJnaW4gPSAnMCc7IC8vIE1vdmUgZWxlbWVudCBvdXQgb2Ygc2NyZWVuIGhvcml6b250YWxseVxuXG4gICAgICB0aGlzLmZha2VFbGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMuZmFrZUVsZW0uc3R5bGVbaXNSVEwgPyAncmlnaHQnIDogJ2xlZnQnXSA9ICctOTk5OXB4JzsgLy8gTW92ZSBlbGVtZW50IHRvIHRoZSBzYW1lIHBvc2l0aW9uIHZlcnRpY2FsbHlcblxuICAgICAgdmFyIHlQb3NpdGlvbiA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgdGhpcy5mYWtlRWxlbS5zdHlsZS50b3AgPSBcIlwiLmNvbmNhdCh5UG9zaXRpb24sIFwicHhcIik7XG4gICAgICB0aGlzLmZha2VFbGVtLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICB0aGlzLmZha2VFbGVtLnZhbHVlID0gdGhpcy50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMuZmFrZUVsZW07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCdzIHRoZSB2YWx1ZSBvZiBmYWtlRWxlbSxcbiAgICAgKiBhbmQgbWFrZXMgYSBzZWxlY3Rpb24gb24gaXQuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RGYWtlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdEZha2UoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZmFrZUVsZW0gPSB0aGlzLmNyZWF0ZUZha2VFbGVtZW50KCk7XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZUZha2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZmFrZUhhbmRsZXIgPSB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjaykgfHwgdHJ1ZTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGZha2VFbGVtKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKShmYWtlRWxlbSk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgICB0aGlzLnJlbW92ZUZha2UoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT25seSByZW1vdmVzIHRoZSBmYWtlIGVsZW1lbnQgYWZ0ZXIgYW5vdGhlciBjbGljayBldmVudCwgdGhhdCB3YXlcbiAgICAgKiBhIHVzZXIgY2FuIGhpdCBgQ3RybCtDYCB0byBjb3B5IGJlY2F1c2Ugc2VsZWN0aW9uIHN0aWxsIGV4aXN0cy5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlbW92ZUZha2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRmFrZSgpIHtcbiAgICAgIGlmICh0aGlzLmZha2VIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5mYWtlSGFuZGxlckNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5mYWtlSGFuZGxlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZmFrZUhhbmRsZXJDYWxsYmFjayA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmZha2VFbGVtKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuZmFrZUVsZW0pO1xuICAgICAgICB0aGlzLmZha2VFbGVtID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgY29udGVudCBmcm9tIGVsZW1lbnQgcGFzc2VkIG9uIGB0YXJnZXRgIHByb3BlcnR5LlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0VGFyZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdFRhcmdldCgpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRUZXh0ID0gc2VsZWN0X2RlZmF1bHQoKSh0aGlzLnRhcmdldCk7XG4gICAgICB0aGlzLmNvcHlUZXh0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBjb3B5IG9wZXJhdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJjb3B5VGV4dFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5VGV4dCgpIHtcbiAgICAgIHZhciBzdWNjZWVkZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN1Y2NlZWRlZCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKHRoaXMuYWN0aW9uKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oYW5kbGVSZXN1bHQoc3VjY2VlZGVkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlyZXMgYW4gZXZlbnQgYmFzZWQgb24gdGhlIGNvcHkgb3BlcmF0aW9uIHJlc3VsdC5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHN1Y2NlZWRlZFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlUmVzdWx0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlc3VsdChzdWNjZWVkZWQpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KHN1Y2NlZWRlZCA/ICdzdWNjZXNzJyA6ICdlcnJvcicsIHtcbiAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgdGV4dDogdGhpcy5zZWxlY3RlZFRleHQsXG4gICAgICAgIHRyaWdnZXI6IHRoaXMudHJpZ2dlcixcbiAgICAgICAgY2xlYXJTZWxlY3Rpb246IHRoaXMuY2xlYXJTZWxlY3Rpb24uYmluZCh0aGlzKVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIGZvY3VzIGF3YXkgZnJvbSBgdGFyZ2V0YCBhbmQgYmFjayB0byB0aGUgdHJpZ2dlciwgcmVtb3ZlcyBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImNsZWFyU2VsZWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudHJpZ2dlcikge1xuICAgICAgICB0aGlzLnRyaWdnZXIuZm9jdXMoKTtcbiAgICAgIH1cblxuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGBhY3Rpb25gIHRvIGJlIHBlcmZvcm1lZCB3aGljaCBjYW4gYmUgZWl0aGVyICdjb3B5JyBvciAnY3V0Jy5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMucmVtb3ZlRmFrZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhY3Rpb25cIixcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCgpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICdjb3B5JztcbiAgICAgIHRoaXMuX2FjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgaWYgKHRoaXMuX2FjdGlvbiAhPT0gJ2NvcHknICYmIHRoaXMuX2FjdGlvbiAhPT0gJ2N1dCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwiYWN0aW9uXCIgdmFsdWUsIHVzZSBlaXRoZXIgXCJjb3B5XCIgb3IgXCJjdXRcIicpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgYWN0aW9uYCBwcm9wZXJ0eS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkgdXNpbmcgYW4gZWxlbWVudFxuICAgICAqIHRoYXQgd2lsbCBiZSBoYXZlIGl0cyBjb250ZW50IGNvcGllZC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwidGFyZ2V0XCIsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiBfdHlwZW9mKHRhcmdldCkgPT09ICdvYmplY3QnICYmIHRhcmdldC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ2NvcHknICYmIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIGF0dHJpYnV0ZS4gUGxlYXNlIHVzZSBcInJlYWRvbmx5XCIgaW5zdGVhZCBvZiBcImRpc2FibGVkXCIgYXR0cmlidXRlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAnY3V0JyAmJiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgncmVhZG9ubHknKSB8fCB0YXJnZXQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFwidGFyZ2V0XCIgYXR0cmlidXRlLiBZb3UgY2FuXFwndCBjdXQgdGV4dCBmcm9tIGVsZW1lbnRzIHdpdGggXCJyZWFkb25seVwiIG9yIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGVzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBcInRhcmdldFwiIHZhbHVlLCB1c2UgYSB2YWxpZCBFbGVtZW50Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYHRhcmdldGAgcHJvcGVydHkuXG4gICAgICogQHJldHVybiB7U3RyaW5nfEhUTUxFbGVtZW50fVxuICAgICAqL1xuICAgICxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZEFjdGlvbjtcbn0oKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkX2FjdGlvbiA9IChDbGlwYm9hcmRBY3Rpb24pO1xuOy8vIENPTkNBVEVOQVRFRCBNT0RVTEU6IC4vc3JjL2NsaXBib2FyZC5qc1xuZnVuY3Rpb24gY2xpcGJvYXJkX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgY2xpcGJvYXJkX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBjbGlwYm9hcmRfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIGNsaXBib2FyZF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBjbGlwYm9hcmRfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGNsaXBib2FyZF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgY2xpcGJvYXJkX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVTdXBlcihEZXJpdmVkKSB7IHZhciBoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpOyByZXR1cm4gZnVuY3Rpb24gX2NyZWF0ZVN1cGVySW50ZXJuYWwoKSB7IHZhciBTdXBlciA9IF9nZXRQcm90b3R5cGVPZihEZXJpdmVkKSwgcmVzdWx0OyBpZiAoaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCkgeyB2YXIgTmV3VGFyZ2V0ID0gX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yOyByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChTdXBlciwgYXJndW1lbnRzLCBOZXdUYXJnZXQpOyB9IGVsc2UgeyByZXN1bHQgPSBTdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9IHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCByZXN1bHQpOyB9OyB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKGNhbGwgJiYgKGNsaXBib2FyZF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHsgcmV0dXJuIGNhbGw7IH0gcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7IH1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7IGlmIChzZWxmID09PSB2b2lkIDApIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChEYXRlLCBbXSwgZnVuY3Rpb24gKCkge30pKTsgcmV0dXJuIHRydWU7IH0gY2F0Y2ggKGUpIHsgcmV0dXJuIGZhbHNlOyB9IH1cblxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTsgfTsgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTsgfVxuXG5cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byByZXRyaWV2ZSBhdHRyaWJ1dGUgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3VmZml4XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqL1xuXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVWYWx1ZShzdWZmaXgsIGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZSA9IFwiZGF0YS1jbGlwYm9hcmQtXCIuY29uY2F0KHN1ZmZpeCk7XG5cbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG59XG4vKipcbiAqIEJhc2UgY2xhc3Mgd2hpY2ggdGFrZXMgb25lIG9yIG1vcmUgZWxlbWVudHMsIGFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZW0sXG4gKiBhbmQgaW5zdGFudGlhdGVzIGEgbmV3IGBDbGlwYm9hcmRBY3Rpb25gIG9uIGVhY2ggY2xpY2suXG4gKi9cblxuXG52YXIgQ2xpcGJvYXJkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfRW1pdHRlcikge1xuICBfaW5oZXJpdHMoQ2xpcGJvYXJkLCBfRW1pdHRlcik7XG5cbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihDbGlwYm9hcmQpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudHxIVE1MQ29sbGVjdGlvbnxOb2RlTGlzdH0gdHJpZ2dlclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gQ2xpcGJvYXJkKHRyaWdnZXIsIG9wdGlvbnMpIHtcbiAgICB2YXIgX3RoaXM7XG5cbiAgICBjbGlwYm9hcmRfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpcGJvYXJkKTtcblxuICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcyk7XG5cbiAgICBfdGhpcy5yZXNvbHZlT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIF90aGlzLmxpc3RlbkNsaWNrKHRyaWdnZXIpO1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIC8qKlxuICAgKiBEZWZpbmVzIGlmIGF0dHJpYnV0ZXMgd291bGQgYmUgcmVzb2x2ZWQgdXNpbmcgaW50ZXJuYWwgc2V0dGVyIGZ1bmN0aW9uc1xuICAgKiBvciBjdXN0b20gZnVuY3Rpb25zIHRoYXQgd2VyZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKi9cblxuXG4gIGNsaXBib2FyZF9jcmVhdGVDbGFzcyhDbGlwYm9hcmQsIFt7XG4gICAga2V5OiBcInJlc29sdmVPcHRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5hY3Rpb24gPSB0eXBlb2Ygb3B0aW9ucy5hY3Rpb24gPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLmFjdGlvbiA6IHRoaXMuZGVmYXVsdEFjdGlvbjtcbiAgICAgIHRoaXMudGFyZ2V0ID0gdHlwZW9mIG9wdGlvbnMudGFyZ2V0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50YXJnZXQgOiB0aGlzLmRlZmF1bHRUYXJnZXQ7XG4gICAgICB0aGlzLnRleHQgPSB0eXBlb2Ygb3B0aW9ucy50ZXh0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy50ZXh0IDogdGhpcy5kZWZhdWx0VGV4dDtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gY2xpcGJvYXJkX3R5cGVvZihvcHRpb25zLmNvbnRhaW5lcikgPT09ICdvYmplY3QnID8gb3B0aW9ucy5jb250YWluZXIgOiBkb2N1bWVudC5ib2R5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY2xpY2sgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHBhc3NlZCB0cmlnZ2VyLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0cmlnZ2VyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJsaXN0ZW5DbGlja1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0ZW5DbGljayh0cmlnZ2VyKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdGhpcy5saXN0ZW5lciA9IGxpc3Rlbl9kZWZhdWx0KCkodHJpZ2dlciwgJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMi5vbkNsaWNrKGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBuZXcgYENsaXBib2FyZEFjdGlvbmAgb24gZWFjaCBjbGljayBldmVudC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJvbkNsaWNrXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgdmFyIHRyaWdnZXIgPSBlLmRlbGVnYXRlVGFyZ2V0IHx8IGUuY3VycmVudFRhcmdldDtcblxuICAgICAgaWYgKHRoaXMuY2xpcGJvYXJkQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2xpcGJvYXJkQWN0aW9uID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24gPSBuZXcgY2xpcGJvYXJkX2FjdGlvbih7XG4gICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24odHJpZ2dlciksXG4gICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQodHJpZ2dlciksXG4gICAgICAgIHRleHQ6IHRoaXMudGV4dCh0cmlnZ2VyKSxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgdHJpZ2dlcjogdHJpZ2dlcixcbiAgICAgICAgZW1pdHRlcjogdGhpc1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYGFjdGlvbmAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdEFjdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0QWN0aW9uKHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgnYWN0aW9uJywgdHJpZ2dlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgYHRhcmdldGAgbG9va3VwIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gdHJpZ2dlclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVmYXVsdFRhcmdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZhdWx0VGFyZ2V0KHRyaWdnZXIpIHtcbiAgICAgIHZhciBzZWxlY3RvciA9IGdldEF0dHJpYnV0ZVZhbHVlKCd0YXJnZXQnLCB0cmlnZ2VyKTtcblxuICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc3VwcG9ydCBvZiB0aGUgZ2l2ZW4gYWN0aW9uLCBvciBhbGwgYWN0aW9ucyBpZiBubyBhY3Rpb24gaXNcbiAgICAgKiBnaXZlbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2FjdGlvbl1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlZmF1bHRUZXh0XCIsXG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IGB0ZXh0YCBsb29rdXAgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSB0cmlnZ2VyXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlZmF1bHRUZXh0KHRyaWdnZXIpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZSgndGV4dCcsIHRyaWdnZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGxpZmVjeWNsZS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5jbGlwYm9hcmRBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jbGlwYm9hcmRBY3Rpb24uZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmNsaXBib2FyZEFjdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XSwgW3tcbiAgICBrZXk6IFwiaXNTdXBwb3J0ZWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNTdXBwb3J0ZWQoKSB7XG4gICAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbJ2NvcHknLCAnY3V0J107XG4gICAgICB2YXIgYWN0aW9ucyA9IHR5cGVvZiBhY3Rpb24gPT09ICdzdHJpbmcnID8gW2FjdGlvbl0gOiBhY3Rpb247XG4gICAgICB2YXIgc3VwcG9ydCA9ICEhZG9jdW1lbnQucXVlcnlDb21tYW5kU3VwcG9ydGVkO1xuICAgICAgYWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgc3VwcG9ydCA9IHN1cHBvcnQgJiYgISFkb2N1bWVudC5xdWVyeUNvbW1hbmRTdXBwb3J0ZWQoYWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN1cHBvcnQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENsaXBib2FyZDtcbn0oKHRpbnlfZW1pdHRlcl9kZWZhdWx0KCkpKTtcblxuLyogaGFybW9ueSBkZWZhdWx0IGV4cG9ydCAqLyB2YXIgY2xpcGJvYXJkID0gKENsaXBib2FyZCk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyA4Mjg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbnZhciBET0NVTUVOVF9OT0RFX1RZUEUgPSA5O1xuXG4vKipcbiAqIEEgcG9seWZpbGwgZm9yIEVsZW1lbnQubWF0Y2hlcygpXG4gKi9cbmlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICB2YXIgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZTtcblxuICAgIHByb3RvLm1hdGNoZXMgPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgICAgICAgICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBjbG9zZXN0IHBhcmVudCB0aGF0IG1hdGNoZXMgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNsb3Nlc3QgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgd2hpbGUgKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSAhPT0gRE9DVU1FTlRfTk9ERV9UWVBFKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5tYXRjaGVzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvc2VzdDtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNDM4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX191bnVzZWRfd2VicGFja19leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbnZhciBjbG9zZXN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4MjgpO1xuXG4vKipcbiAqIERlbGVnYXRlcyBldmVudCB0byBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBfZGVsZWdhdGUoZWxlbWVudCwgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgdmFyIGxpc3RlbmVyRm4gPSBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXJGbiwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogRGVsZWdhdGVzIGV2ZW50IHRvIGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fFN0cmluZ3xBcnJheX0gW2VsZW1lbnRzXVxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBkZWxlZ2F0ZShlbGVtZW50cywgc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gICAgLy8gSGFuZGxlIHRoZSByZWd1bGFyIEVsZW1lbnQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBFbGVtZW50LWxlc3MgdXNhZ2UsIGl0IGRlZmF1bHRzIHRvIGdsb2JhbCBkZWxlZ2F0aW9uXG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIFVzZSBgZG9jdW1lbnRgIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIHRoZW4gYXBwbHkgYXJndW1lbnRzXG4gICAgICAgIC8vIFRoaXMgaXMgYSBzaG9ydCB3YXkgdG8gLnVuc2hpZnQgYGFyZ3VtZW50c2Agd2l0aG91dCBydW5uaW5nIGludG8gZGVvcHRpbWl6YXRpb25zXG4gICAgICAgIHJldHVybiBfZGVsZWdhdGUuYmluZChudWxsLCBkb2N1bWVudCkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgU2VsZWN0b3ItYmFzZWQgdXNhZ2VcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzID09PSAnc3RyaW5nJykge1xuICAgICAgICBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudHMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBBcnJheS1saWtlIGJhc2VkIHVzYWdlXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChlbGVtZW50cywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIF9kZWxlZ2F0ZShlbGVtZW50LCBzZWxlY3RvciwgdHlwZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEZpbmRzIGNsb3Nlc3QgbWF0Y2ggYW5kIGludm9rZXMgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyKGVsZW1lbnQsIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUuZGVsZWdhdGVUYXJnZXQgPSBjbG9zZXN0KGUudGFyZ2V0LCBzZWxlY3Rvcik7XG5cbiAgICAgICAgaWYgKGUuZGVsZWdhdGVUYXJnZXQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoZWxlbWVudCwgZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVsZWdhdGU7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDg3OTpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgZXhwb3J0cykge1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgSFRNTCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0cy5ub2RlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAmJiB2YWx1ZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XG4gICAgICAgICYmIHZhbHVlLm5vZGVUeXBlID09PSAxO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhcmd1bWVudCBpcyBhIGxpc3Qgb2YgSFRNTCBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydHMubm9kZUxpc3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcblxuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICYmICh0eXBlID09PSAnW29iamVjdCBOb2RlTGlzdF0nIHx8IHR5cGUgPT09ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXScpXG4gICAgICAgICYmICgnbGVuZ3RoJyBpbiB2YWx1ZSlcbiAgICAgICAgJiYgKHZhbHVlLmxlbmd0aCA9PT0gMCB8fCBleHBvcnRzLm5vZGUodmFsdWVbMF0pKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYXJndW1lbnQgaXMgYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLnN0cmluZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmc7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGFyZ3VtZW50IGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnRzLmZuID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG5cbiAgICByZXR1cm4gdHlwZSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDM3MDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fdW51c2VkX3dlYnBhY2tfZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG52YXIgaXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDg3OSk7XG52YXIgZGVsZWdhdGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzOCk7XG5cbi8qKlxuICogVmFsaWRhdGVzIGFsbCBwYXJhbXMgYW5kIGNhbGxzIHRoZSByaWdodFxuICogbGlzdGVuZXIgZnVuY3Rpb24gYmFzZWQgb24gaXRzIHRhcmdldCB0eXBlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fEhUTUxDb2xsZWN0aW9ufE5vZGVMaXN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBsaXN0ZW4odGFyZ2V0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIGlmICghdGFyZ2V0ICYmICF0eXBlICYmICFjYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpcy5zdHJpbmcodHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzLmZuKGNhbGxiYWNrKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlyZCBhcmd1bWVudCBtdXN0IGJlIGEgRnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICBpZiAoaXMubm9kZSh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5ub2RlTGlzdCh0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5Ob2RlTGlzdCh0YXJnZXQsIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMuc3RyaW5nKHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlblNlbGVjdG9yKHRhcmdldCwgdHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIFN0cmluZywgSFRNTEVsZW1lbnQsIEhUTUxDb2xsZWN0aW9uLCBvciBOb2RlTGlzdCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgSFRNTCBlbGVtZW50XG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTm9kZShub2RlLCB0eXBlLCBjYWxsYmFjaykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGEgbGlzdCBvZiBIVE1MIGVsZW1lbnRzXG4gKiBhbmQgcmV0dXJucyBhIHJlbW92ZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fEhUTUxDb2xsZWN0aW9ufSBub2RlTGlzdFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk5vZGVMaXN0KG5vZGVMaXN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobm9kZUxpc3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChub2RlTGlzdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYSBzZWxlY3RvclxuICogYW5kIHJldHVybnMgYSByZW1vdmUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbGlzdGVuU2VsZWN0b3Ioc2VsZWN0b3IsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGRlbGVnYXRlKGRvY3VtZW50LmJvZHksIHNlbGVjdG9yLCB0eXBlLCBjYWxsYmFjayk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdGVuO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4MTc6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlKSB7XG5cbmZ1bmN0aW9uIHNlbGVjdChlbGVtZW50KSB7XG4gICAgdmFyIHNlbGVjdGVkVGV4dDtcblxuICAgIGlmIChlbGVtZW50Lm5vZGVOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbGVtZW50Lm5vZGVOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgIHZhciBpc1JlYWRPbmx5ID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlYWRvbmx5Jyk7XG5cbiAgICAgICAgaWYgKCFpc1JlYWRPbmx5KSB7XG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgICAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKDAsIGVsZW1lbnQudmFsdWUubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIWlzUmVhZE9ubHkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyZWFkb25seScpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gZWxlbWVudC52YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG5cbiAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdGVkVGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZWxlY3Q7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDI3OTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUpIHtcblxuZnVuY3Rpb24gRSAoKSB7XG4gIC8vIEtlZXAgdGhpcyBlbXB0eSBzbyBpdCdzIGVhc2llciB0byBpbmhlcml0IGZyb21cbiAgLy8gKHZpYSBodHRwczovL2dpdGh1Yi5jb20vbGlwc21hY2sgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2lzc3Vlcy8zKVxufVxuXG5FLnByb3RvdHlwZSA9IHtcbiAgb246IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcblxuICAgIChlW25hbWVdIHx8IChlW25hbWVdID0gW10pKS5wdXNoKHtcbiAgICAgIGZuOiBjYWxsYmFjayxcbiAgICAgIGN0eDogY3R4XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvbmNlOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICBzZWxmLm9mZihuYW1lLCBsaXN0ZW5lcik7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGxpc3RlbmVyLl8gPSBjYWxsYmFja1xuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGxpc3RlbmVyLCBjdHgpO1xuICB9LFxuXG4gIGVtaXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGRhdGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGV2dEFyciA9ICgodGhpcy5lIHx8ICh0aGlzLmUgPSB7fSkpW25hbWVdIHx8IFtdKS5zbGljZSgpO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuID0gZXZ0QXJyLmxlbmd0aDtcblxuICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBldnRBcnJbaV0uZm4uYXBwbHkoZXZ0QXJyW2ldLmN0eCwgZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb2ZmOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgIHZhciBldnRzID0gZVtuYW1lXTtcbiAgICB2YXIgbGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgaWYgKGV2dHMgJiYgY2FsbGJhY2spIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChldnRzW2ldLmZuICE9PSBjYWxsYmFjayAmJiBldnRzW2ldLmZuLl8gIT09IGNhbGxiYWNrKVxuICAgICAgICAgIGxpdmVFdmVudHMucHVzaChldnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZXZlbnQgZnJvbSBxdWV1ZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrXG4gICAgLy8gU3VnZ2VzdGVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9sYXpkXG4gICAgLy8gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2NvbW1pdC9jNmViZmFhOWJjOTczYjMzZDExMGE4NGEzMDc3NDJiN2NmOTRjOTUzI2NvbW1pdGNvbW1lbnQtNTAyNDkxMFxuXG4gICAgKGxpdmVFdmVudHMubGVuZ3RoKVxuICAgICAgPyBlW25hbWVdID0gbGl2ZUV2ZW50c1xuICAgICAgOiBkZWxldGUgZVtuYW1lXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEU7XG5tb2R1bGUuZXhwb3J0cy5UaW55RW1pdHRlciA9IEU7XG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gXHR9KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHQvKiB3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcbi8qKioqKiovIFx0XHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzICovXG4vKioqKioqLyBcdCFmdW5jdGlvbigpIHtcbi8qKioqKiovIFx0XHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuLyoqKioqKi8gXHRcdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcbi8qKioqKiovIFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuLyoqKioqKi8gXHRcdFx0XHR9XG4vKioqKioqLyBcdFx0XHR9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovIFx0fSgpO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Lyogd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCAqL1xuLyoqKioqKi8gXHQhZnVuY3Rpb24oKSB7XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfVxuLyoqKioqKi8gXHR9KCk7XG4vKioqKioqLyBcdFxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSByZXR1cm5lZCBmcm9tIHJ1bnRpbWUgc28gZW50cnkgaW5saW5pbmcgaXMgZGlzYWJsZWRcbi8qKioqKiovIFx0Ly8gc3RhcnR1cFxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMTM0KTtcbi8qKioqKiovIH0pKClcbi5kZWZhdWx0O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQSBtb2R1bGUgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIFRoZSBwYXR0ZXJuIHVzZWQgZm9yIHBhcnNpbmcgSVNPODYwMSBkdXJhdGlvbiAoUG5Zbk1uRFRuSG5NblMpLlxuICogVGhpcyBkb2VzIG5vdCBjb3ZlciB0aGUgd2VlayBmb3JtYXQgUG5XLlxuICovXG5cbi8vIFBuWW5NbkRUbkhuTW5TXG52YXIgbnVtYmVycyA9ICdcXFxcZCsoPzpbXFxcXC4sXVxcXFxkKyk/JztcbnZhciB3ZWVrUGF0dGVybiA9ICcoJyArIG51bWJlcnMgKyAnVyknO1xudmFyIGRhdGVQYXR0ZXJuID0gJygnICsgbnVtYmVycyArICdZKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ0QpPyc7XG52YXIgdGltZVBhdHRlcm4gPSAnVCgnICsgbnVtYmVycyArICdIKT8oJyArIG51bWJlcnMgKyAnTSk/KCcgKyBudW1iZXJzICsgJ1MpPyc7XG5cbnZhciBpc284NjAxID0gJ1AoPzonICsgd2Vla1BhdHRlcm4gKyAnfCcgKyBkYXRlUGF0dGVybiArICcoPzonICsgdGltZVBhdHRlcm4gKyAnKT8pJztcbnZhciBvYmpNYXAgPSBbJ3dlZWtzJywgJ3llYXJzJywgJ21vbnRocycsICdkYXlzJywgJ2hvdXJzJywgJ21pbnV0ZXMnLCAnc2Vjb25kcyddO1xuXG4vKipcbiAqIFRoZSBJU084NjAxIHJlZ2V4IGZvciBtYXRjaGluZyAvIHRlc3RpbmcgZHVyYXRpb25zXG4gKi9cbnZhciBwYXR0ZXJuID0gZXhwb3J0cy5wYXR0ZXJuID0gbmV3IFJlZ0V4cChpc284NjAxKTtcblxuLyoqIFBhcnNlIFBuWW5NbkRUbkhuTW5TIGZvcm1hdCB0byBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBkdXJhdGlvblN0cmluZyAtIFBuWW5NbkRUbkhuTW5TIGZvcm1hdHRlZCBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gLSBXaXRoIGEgcHJvcGVydHkgZm9yIGVhY2ggcGFydCBvZiB0aGUgcGF0dGVyblxuICovXG52YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZHVyYXRpb25TdHJpbmcpIHtcbiAgLy8gU2xpY2UgYXdheSBmaXJzdCBlbnRyeSBpbiBtYXRjaC1hcnJheVxuICByZXR1cm4gZHVyYXRpb25TdHJpbmcubWF0Y2gocGF0dGVybikuc2xpY2UoMSkucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBuZXh0LCBpZHgpIHtcbiAgICBwcmV2W29iak1hcFtpZHhdXSA9IHBhcnNlRmxvYXQobmV4dCkgfHwgMDtcbiAgICByZXR1cm4gcHJldjtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IElTTzg2MDEgZHVyYXRpb24gb2JqZWN0IHRvIGFuIGVuZCBEYXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIERhdGUgZm9yIGNhbGN1bGF0aW5nIHRoZSBkdXJhdGlvblxuICogQHJldHVybiB7RGF0ZX0gLSBUaGUgcmVzdWx0aW5nIGVuZCBEYXRlXG4gKi9cbnZhciBlbmQgPSBleHBvcnRzLmVuZCA9IGZ1bmN0aW9uIGVuZChkdXJhdGlvbiwgc3RhcnREYXRlKSB7XG4gIC8vIENyZWF0ZSB0d28gZXF1YWwgdGltZXN0YW1wcywgYWRkIGR1cmF0aW9uIHRvICd0aGVuJyBhbmQgcmV0dXJuIHRpbWUgZGlmZmVyZW5jZVxuICB2YXIgdGltZXN0YW1wID0gc3RhcnREYXRlID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IERhdGUubm93KCk7XG4gIHZhciB0aGVuID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGVuLnNldEZ1bGxZZWFyKHRoZW4uZ2V0RnVsbFllYXIoKSArIGR1cmF0aW9uLnllYXJzKTtcbiAgdGhlbi5zZXRNb250aCh0aGVuLmdldE1vbnRoKCkgKyBkdXJhdGlvbi5tb250aHMpO1xuICB0aGVuLnNldERhdGUodGhlbi5nZXREYXRlKCkgKyBkdXJhdGlvbi5kYXlzKTtcbiAgdGhlbi5zZXRIb3Vycyh0aGVuLmdldEhvdXJzKCkgKyBkdXJhdGlvbi5ob3Vycyk7XG4gIHRoZW4uc2V0TWludXRlcyh0aGVuLmdldE1pbnV0ZXMoKSArIGR1cmF0aW9uLm1pbnV0ZXMpO1xuICAvLyBUaGVuLnNldFNlY29uZHModGhlbi5nZXRTZWNvbmRzKCkgKyBkdXJhdGlvbi5zZWNvbmRzKTtcbiAgdGhlbi5zZXRNaWxsaXNlY29uZHModGhlbi5nZXRNaWxsaXNlY29uZHMoKSArIGR1cmF0aW9uLnNlY29uZHMgKiAxMDAwKTtcbiAgLy8gU3BlY2lhbCBjYXNlIHdlZWtzXG4gIHRoZW4uc2V0RGF0ZSh0aGVuLmdldERhdGUoKSArIGR1cmF0aW9uLndlZWtzICogNyk7XG5cbiAgcmV0dXJuIHRoZW47XG59O1xuXG4vKipcbiAqIENvbnZlcnQgSVNPODYwMSBkdXJhdGlvbiBvYmplY3QgdG8gc2Vjb25kc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkdXJhdGlvbiAtIFRoZSBkdXJhdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7RGF0ZX0gc3RhcnREYXRlIC0gVGhlIHN0YXJ0aW5nIHBvaW50IGZvciBjYWxjdWxhdGluZyB0aGUgZHVyYXRpb25cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xudmFyIHRvU2Vjb25kcyA9IGV4cG9ydHMudG9TZWNvbmRzID0gZnVuY3Rpb24gdG9TZWNvbmRzKGR1cmF0aW9uLCBzdGFydERhdGUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IHN0YXJ0RGF0ZSA/IHN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiBEYXRlLm5vdygpO1xuICB2YXIgbm93ID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgdmFyIHRoZW4gPSBlbmQoZHVyYXRpb24sIG5vdyk7XG5cbiAgdmFyIHNlY29uZHMgPSAodGhlbi5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICBlbmQ6IGVuZCxcbiAgdG9TZWNvbmRzOiB0b1NlY29uZHMsXG4gIHBhdHRlcm46IHBhdHRlcm4sXG4gIHBhcnNlOiBwYXJzZVxufTsiLCJjb25zdGFudHMgPSByZXF1aXJlICcuLi9jb25zdGFudHMnXHJcbkNsaXBib2FyZCA9IHJlcXVpcmUgJ2NsaXBib2FyZCdcclxuZmlsdGVycyA9IHJlcXVpcmUgJy4uL2ZpbHRlcnMnXHJcblxyXG5zb2NrZXQgPSBudWxsXHJcblxyXG5wbGF5ZXIgPSBudWxsXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbnBsYXlpbmcgPSBmYWxzZVxyXG5zb2xvVW5zaHVmZmxlZCA9IFtdXHJcbnNvbG9RdWV1ZSA9IFtdXHJcbnNvbG9JbmRleCA9IDBcclxuc29sb1RpY2tUaW1lb3V0ID0gbnVsbFxyXG5zb2xvVmlkZW8gPSBudWxsXHJcbnNvbG9FcnJvciA9IG51bGxcclxuc29sb0NvdW50ID0gMFxyXG5zb2xvTGFiZWxzID0gbnVsbFxyXG5zb2xvTWlycm9yID0gZmFsc2VcclxuXHJcbmVuZGVkVGltZXIgPSBudWxsXHJcbm92ZXJUaW1lcnMgPSBbXVxyXG5cclxuREFTSENBU1RfTkFNRVNQQUNFID0gJ3Vybjp4LWNhc3Q6ZXMub2ZmZC5kYXNoY2FzdCdcclxuXHJcbnNvbG9JRCA9IG51bGxcclxuc29sb0luZm8gPSB7fVxyXG5cclxuZGlzY29yZFRva2VuID0gbnVsbFxyXG5kaXNjb3JkVGFnID0gbnVsbFxyXG5kaXNjb3JkTmlja25hbWUgPSBudWxsXHJcblxyXG5jYXN0QXZhaWxhYmxlID0gZmFsc2VcclxuY2FzdFNlc3Npb24gPSBudWxsXHJcblxyXG5sYXVuY2hPcGVuID0gZmFsc2UgIyAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xhdW5jaCcpID09IFwidHJ1ZVwiKVxyXG5jb25zb2xlLmxvZyBcImxhdW5jaE9wZW46ICN7bGF1bmNoT3Blbn1cIlxyXG5cclxuYWRkRW5hYmxlZCA9IHRydWVcclxuZXhwb3J0RW5hYmxlZCA9IGZhbHNlXHJcblxyXG5pc1Rlc2xhID0gZmFsc2VcclxudGFwVGltZW91dCA9IG51bGxcclxuXHJcbmN1cnJlbnRQbGF5bGlzdE5hbWUgPSBudWxsXHJcblxyXG5vcGluaW9uT3JkZXIgPSBbXVxyXG5mb3IgbyBpbiBjb25zdGFudHMub3Bpbmlvbk9yZGVyXHJcbiAgb3Bpbmlvbk9yZGVyLnB1c2ggb1xyXG5vcGluaW9uT3JkZXIucHVzaCgnbm9uZScpXHJcblxyXG5yYW5kb21TdHJpbmcgPSAtPlxyXG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMTUpICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDE1KVxyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhZ2VFcG9jaCA9IG5vdygpXHJcblxyXG5xcyA9IChuYW1lKSAtPlxyXG4gIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpXHJcbiAgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKVxyXG4gIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XHJcbiAgaWYgbm90IHJlc3VsdHMgb3Igbm90IHJlc3VsdHNbMl1cclxuICAgIHJldHVybiBudWxsXHJcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKVxyXG5cclxub25UYXBTaG93ID0gLT5cclxuICBjb25zb2xlLmxvZyBcIm9uVGFwU2hvd1wiXHJcblxyXG4gIG91dGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dGVyJylcclxuICBpZiB0YXBUaW1lb3V0P1xyXG4gICAgY2xlYXJUaW1lb3V0KHRhcFRpbWVvdXQpXHJcbiAgICB0YXBUaW1lb3V0ID0gbnVsbFxyXG4gICAgb3V0ZXIuc3R5bGUub3BhY2l0eSA9IDBcclxuICBlbHNlXHJcbiAgICBvdXRlci5zdHlsZS5vcGFjaXR5ID0gMVxyXG4gICAgdGFwVGltZW91dCA9IHNldFRpbWVvdXQgLT5cclxuICAgICAgY29uc29sZS5sb2cgXCJ0YXBUaW1lb3V0IVwiXHJcbiAgICAgIG91dGVyLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgICAgIHRhcFRpbWVvdXQgPSBudWxsXHJcbiAgICAsIDEwMDAwXHJcblxyXG5cclxuZmFkZUluID0gKGVsZW0sIG1zKSAtPlxyXG4gIGlmIG5vdCBlbGVtP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGVsZW0uc3R5bGUub3BhY2l0eSA9IDBcclxuICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxyXG4gIGVsZW0uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblxyXG4gIGlmIG1zPyBhbmQgbXMgPiAwXHJcbiAgICBvcGFjaXR5ID0gMFxyXG4gICAgdGltZXIgPSBzZXRJbnRlcnZhbCAtPlxyXG4gICAgICBvcGFjaXR5ICs9IDUwIC8gbXNcclxuICAgICAgaWYgb3BhY2l0eSA+PSAxXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcilcclxuICAgICAgICBvcGFjaXR5ID0gMVxyXG5cclxuICAgICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eVxyXG4gICAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT1cIiArIG9wYWNpdHkgKiAxMDAgKyBcIilcIlxyXG4gICAgLCA1MFxyXG4gIGVsc2VcclxuICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IDFcclxuICAgIGVsZW0uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTEpXCJcclxuXHJcbmZhZGVPdXQgPSAoZWxlbSwgbXMpIC0+XHJcbiAgaWYgbm90IGVsZW0/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbXM/IGFuZCBtcyA+IDBcclxuICAgIG9wYWNpdHkgPSAxXHJcbiAgICB0aW1lciA9IHNldEludGVydmFsIC0+XHJcbiAgICAgIG9wYWNpdHkgLT0gNTAgLyBtc1xyXG4gICAgICBpZiBvcGFjaXR5IDw9IDBcclxuICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKVxyXG4gICAgICAgIG9wYWNpdHkgPSAwXHJcbiAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgICAgICBlbGVtLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcbiAgICAgIGVsZW0uc3R5bGUub3BhY2l0eSA9IG9wYWNpdHlcclxuICAgICAgZWxlbS5zdHlsZS5maWx0ZXIgPSBcImFscGhhKG9wYWNpdHk9XCIgKyBvcGFjaXR5ICogMTAwICsgXCIpXCJcclxuICAgICwgNTBcclxuICBlbHNlXHJcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAwXHJcbiAgICBlbGVtLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiXHJcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cclxuc2hvd1dhdGNoRm9ybSA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNmb3JtJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FzdGJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS5mb2N1cygpXHJcbiAgbGF1bmNoT3BlbiA9IHRydWVcclxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbGF1bmNoJywgJ3RydWUnKVxyXG5cclxuc2hvd1dhdGNoTGluayA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzbGluaycpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgbGF1bmNoT3BlbiA9IGZhbHNlXHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xhdW5jaCcsICdmYWxzZScpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxub25Jbml0U3VjY2VzcyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJDYXN0IGF2YWlsYWJsZSFcIlxyXG4gIGNhc3RBdmFpbGFibGUgPSB0cnVlXHJcblxyXG5vbkVycm9yID0gKG1lc3NhZ2UpIC0+XHJcblxyXG5zZXNzaW9uTGlzdGVuZXIgPSAoZSkgLT5cclxuICBjYXN0U2Vzc2lvbiA9IGVcclxuXHJcbnNlc3Npb25VcGRhdGVMaXN0ZW5lciA9IChpc0FsaXZlKSAtPlxyXG4gIGlmIG5vdCBpc0FsaXZlXHJcbiAgICBjYXN0U2Vzc2lvbiA9IG51bGxcclxuXHJcbnByZXBhcmVDYXN0ID0gLT5cclxuICBpZiBub3QgY2hyb21lLmNhc3Qgb3Igbm90IGNocm9tZS5jYXN0LmlzQXZhaWxhYmxlXHJcbiAgICBpZiBub3coKSA8IChwYWdlRXBvY2ggKyAxMCkgIyBnaXZlIHVwIGFmdGVyIDEwIHNlY29uZHNcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQocHJlcGFyZUNhc3QsIDEwMClcclxuICAgIHJldHVyblxyXG5cclxuICBzZXNzaW9uUmVxdWVzdCA9IG5ldyBjaHJvbWUuY2FzdC5TZXNzaW9uUmVxdWVzdCgnNUMzRjBBM0MnKSAjIERhc2hjYXN0XHJcbiAgYXBpQ29uZmlnID0gbmV3IGNocm9tZS5jYXN0LkFwaUNvbmZpZyBzZXNzaW9uUmVxdWVzdCwgc2Vzc2lvbkxpc3RlbmVyLCAtPlxyXG4gIGNocm9tZS5jYXN0LmluaXRpYWxpemUoYXBpQ29uZmlnLCBvbkluaXRTdWNjZXNzLCBvbkVycm9yKVxyXG5cclxuY2FsY1Blcm1hID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGlmIG5vdCBkaXNjb3JkTmlja25hbWU/IG9yIChzZWxlY3RlZE5hbWUubGVuZ3RoID09IDApXHJcbiAgICByZXR1cm4gXCJcIlxyXG4gIGJhc2VVUkwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycpWzBdLnNwbGl0KCc/JylbMF0gIyBvb2YgaGFja3lcclxuICBiYXNlVVJMID0gYmFzZVVSTC5yZXBsYWNlKC9zb2xvJC8sIFwicFwiKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIi8je2VuY29kZVVSSUNvbXBvbmVudChkaXNjb3JkTmlja25hbWUpfS8je2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZE5hbWUpfVwiXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuY2FsY1NoYXJlVVJMID0gKG1pcnJvcikgLT5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIGlmIG1pcnJvclxyXG4gICAgcGFyYW1zLnNldChcIm1pcnJvclwiLCAxKVxyXG4gICAgcGFyYW1zLmRlbGV0ZShcImZpbHRlcnNcIilcclxuICBlbHNlXHJcbiAgICBwYXJhbXMuZGVsZXRlKFwic29sb1wiKVxyXG4gICAgcGFyYW1zLnNldChcImZpbHRlcnNcIiwgcGFyYW1zLmdldChcImZpbHRlcnNcIikudHJpbSgpKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJzYXZlbmFtZVwiKVxyXG4gIHBhcmFtcy5kZWxldGUoXCJsb2FkbmFtZVwiKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgbXR2VVJMID0gYmFzZVVSTCArIFwiP1wiICsgcXVlcnlzdHJpbmdcclxuICByZXR1cm4gbXR2VVJMXHJcblxyXG5zdGFydENhc3QgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwic3RhcnQgY2FzdCFcIlxyXG5cclxuICBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FzZm9ybScpXHJcbiAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSlcclxuICBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGZvcm1EYXRhKVxyXG4gIGlmIHBhcmFtcy5nZXQoXCJtaXJyb3JcIik/XHJcbiAgICBwYXJhbXMuZGVsZXRlKFwiZmlsdGVyc1wiKVxyXG4gIHF1ZXJ5c3RyaW5nID0gcGFyYW1zLnRvU3RyaW5nKClcclxuICBiYXNlVVJMID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpWzBdICMgb29mIGhhY2t5XHJcbiAgYmFzZVVSTCA9IGJhc2VVUkwucmVwbGFjZSgvc29sbyQvLCBcIlwiKVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIndhdGNoP1wiICsgcXVlcnlzdHJpbmdcclxuICBjb25zb2xlLmxvZyBcIldlJ3JlIGdvaW5nIGhlcmU6ICN7bXR2VVJMfVwiXHJcbiAgY2hyb21lLmNhc3QucmVxdWVzdFNlc3Npb24gKGUpIC0+XHJcbiAgICBjYXN0U2Vzc2lvbiA9IGVcclxuICAgIGNhc3RTZXNzaW9uLnNlbmRNZXNzYWdlKERBU0hDQVNUX05BTUVTUEFDRSwgeyB1cmw6IG10dlVSTCwgZm9yY2U6IHRydWUgfSlcclxuICAsIG9uRXJyb3JcclxuXHJcbiMgYXV0b3BsYXkgdmlkZW9cclxub25QbGF5ZXJSZWFkeSA9IChldmVudCkgLT5cclxuICBldmVudC50YXJnZXQucGxheVZpZGVvKClcclxuICBzdGFydEhlcmUoKVxyXG5cclxuIyB3aGVuIHZpZGVvIGVuZHNcclxub25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgLT5cclxuICBpZiBlbmRlZFRpbWVyP1xyXG4gICAgY2xlYXJUaW1lb3V0KGVuZGVkVGltZXIpXHJcbiAgICBlbmRlZFRpbWVyID0gbnVsbFxyXG5cclxuICBpZiBldmVudC5kYXRhID09IDBcclxuICAgIGNvbnNvbGUubG9nIFwiRU5ERURcIlxyXG4gICAgZW5kZWRUaW1lciA9IHNldFRpbWVvdXQoIC0+XHJcbiAgICAgIHBsYXlpbmcgPSBmYWxzZVxyXG4gICAgLCAyMDAwKVxyXG5cclxuY2FsY0xhYmVsID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcInNvbG9MYWJlbHMoMSk6IFwiLCBzb2xvTGFiZWxzXHJcbiAgaWYgbm90IHNvbG9MYWJlbHM/XHJcbiAgICBzb2xvTGFiZWxzID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL2xhYmVsc1wiKVxyXG4gIGNvbXBhbnkgPSBudWxsXHJcbiAgaWYgc29sb0xhYmVscz9cclxuICAgIGNvbXBhbnkgPSBzb2xvTGFiZWxzW3BrdC5uaWNrbmFtZV1cclxuICBpZiBub3QgY29tcGFueT9cclxuICAgIGNvbXBhbnkgPSBwa3Qubmlja25hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwa3Qubmlja25hbWUuc2xpY2UoMSlcclxuICAgIGNvbXBhbnkgKz0gXCIgUmVjb3Jkc1wiXHJcbiAgcmV0dXJuIGNvbXBhbnlcclxuXHJcbnNob3dJbmZvID0gKHBrdCkgLT5cclxuICBvdmVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3ZlclwiKVxyXG4gIG92ZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gIGZvciB0IGluIG92ZXJUaW1lcnNcclxuICAgIGNsZWFyVGltZW91dCh0KVxyXG4gIG92ZXJUaW1lcnMgPSBbXVxyXG5cclxuICBhcnRpc3QgPSBwa3QuYXJ0aXN0XHJcbiAgYXJ0aXN0ID0gYXJ0aXN0LnJlcGxhY2UoL15cXHMrLywgXCJcIilcclxuICBhcnRpc3QgPSBhcnRpc3QucmVwbGFjZSgvXFxzKyQvLCBcIlwiKVxyXG4gIHRpdGxlID0gcGt0LnRpdGxlXHJcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpXHJcbiAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpXHJcbiAgaHRtbCA9IFwiI3thcnRpc3R9XFxuJiN4MjAxQzsje3RpdGxlfSYjeDIwMUQ7XCJcclxuICBpZiBzb2xvSUQ/XHJcbiAgICBjb21wYW55ID0gYXdhaXQgY2FsY0xhYmVsKHBrdClcclxuICAgIGh0bWwgKz0gXCJcXG4je2NvbXBhbnl9XCJcclxuICAgIGlmIHNvbG9NaXJyb3JcclxuICAgICAgaHRtbCArPSBcIlxcbk1pcnJvciBNb2RlXCJcclxuICAgIGVsc2VcclxuICAgICAgaHRtbCArPSBcIlxcbkhlcmUgTW9kZVwiXHJcbiAgZWxzZVxyXG4gICAgaHRtbCArPSBcIlxcbiN7cGt0LmNvbXBhbnl9XCJcclxuICAgIGZlZWxpbmdzID0gW11cclxuICAgIGZvciBvIGluIG9waW5pb25PcmRlclxyXG4gICAgICBpZiBwa3Qub3BpbmlvbnNbb10/XHJcbiAgICAgICAgZmVlbGluZ3MucHVzaCBvXHJcbiAgICBpZiBmZWVsaW5ncy5sZW5ndGggPT0gMFxyXG4gICAgICBodG1sICs9IFwiXFxuTm8gT3BpbmlvbnNcIlxyXG4gICAgZWxzZVxyXG4gICAgICBmb3IgZmVlbGluZyBpbiBmZWVsaW5nc1xyXG4gICAgICAgIGxpc3QgPSBwa3Qub3BpbmlvbnNbZmVlbGluZ11cclxuICAgICAgICBsaXN0LnNvcnQoKVxyXG4gICAgICAgIGh0bWwgKz0gXCJcXG4je2ZlZWxpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmZWVsaW5nLnNsaWNlKDEpfTogI3tsaXN0LmpvaW4oJywgJyl9XCJcclxuICBvdmVyRWxlbWVudC5pbm5lckhUTUwgPSBodG1sXHJcblxyXG4gIG92ZXJUaW1lcnMucHVzaCBzZXRUaW1lb3V0IC0+XHJcbiAgICBmYWRlSW4ob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgLCAzMDAwXHJcbiAgb3ZlclRpbWVycy5wdXNoIHNldFRpbWVvdXQgLT5cclxuICAgIGZhZGVPdXQob3ZlckVsZW1lbnQsIDEwMDApXHJcbiAgLCAxNTAwMFxyXG5cclxucGxheSA9IChwa3QsIGlkLCBzdGFydFNlY29uZHMgPSBudWxsLCBlbmRTZWNvbmRzID0gbnVsbCkgLT5cclxuICBpZiBub3QgcGxheWVyP1xyXG4gICAgcmV0dXJuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5aW5nOiAje2lkfVwiXHJcbiAgb3B0cyA9IHtcclxuICAgIHZpZGVvSWQ6IGlkXHJcbiAgfVxyXG4gIGlmIHN0YXJ0U2Vjb25kcz8gYW5kIChzdGFydFNlY29uZHMgPj0gMClcclxuICAgIG9wdHMuc3RhcnRTZWNvbmRzID0gc3RhcnRTZWNvbmRzXHJcbiAgaWYgZW5kU2Vjb25kcz8gYW5kIChlbmRTZWNvbmRzID49IDEpXHJcbiAgICBvcHRzLmVuZFNlY29uZHMgPSBlbmRTZWNvbmRzXHJcbiAgcGxheWVyLmxvYWRWaWRlb0J5SWQob3B0cylcclxuICBwbGF5aW5nID0gdHJ1ZVxyXG5cclxuICBzaG93SW5mbyhwa3QpXHJcblxyXG5zb2xvSW5mb0Jyb2FkY2FzdCA9IC0+XHJcbiAgaWYgc29ja2V0PyBhbmQgc29sb0lEPyBhbmQgc29sb1ZpZGVvPyBhbmQgbm90IHNvbG9NaXJyb3JcclxuICAgIG5leHRWaWRlbyA9IG51bGxcclxuICAgIGlmIHNvbG9JbmRleCA8IHNvbG9RdWV1ZS5sZW5ndGggLSAxXHJcbiAgICAgIG5leHRWaWRlbyA9IHNvbG9RdWV1ZVtzb2xvSW5kZXgrMV1cclxuICAgIGluZm8gPVxyXG4gICAgICBjdXJyZW50OiBzb2xvVmlkZW9cclxuICAgICAgbmV4dDogbmV4dFZpZGVvXHJcbiAgICAgIGluZGV4OiBzb2xvSW5kZXggKyAxXHJcbiAgICAgIGNvdW50OiBzb2xvQ291bnRcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcIkJyb2FkY2FzdDogXCIsIGluZm9cclxuICAgIHBrdCA9IHtcclxuICAgICAgaWQ6IHNvbG9JRFxyXG4gICAgICBjbWQ6ICdpbmZvJ1xyXG4gICAgICBpbmZvOiBpbmZvXHJcbiAgICB9XHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycsIHBrdFxyXG4gICAgc29sb0NvbW1hbmQocGt0KVxyXG5cclxuc29sb1BsYXkgPSAoZGVsdGEgPSAxKSAtPlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICByZXR1cm5cclxuICBpZiBzb2xvRXJyb3Igb3Igc29sb01pcnJvclxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCBzb2xvVmlkZW8/IG9yIChzb2xvUXVldWUubGVuZ3RoID09IDApIG9yICgoc29sb0luZGV4ICsgZGVsdGEpID4gKHNvbG9RdWV1ZS5sZW5ndGggLSAxKSlcclxuICAgIGNvbnNvbGUubG9nIFwiUmVzaHVmZmxpbmcuLi5cIlxyXG4gICAgc29sb1F1ZXVlID0gWyBzb2xvVW5zaHVmZmxlZFswXSBdXHJcbiAgICBmb3IgaSwgaW5kZXggaW4gc29sb1Vuc2h1ZmZsZWRcclxuICAgICAgY29udGludWUgaWYgaW5kZXggPT0gMFxyXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGluZGV4ICsgMSkpXHJcbiAgICAgIHNvbG9RdWV1ZS5wdXNoKHNvbG9RdWV1ZVtqXSlcclxuICAgICAgc29sb1F1ZXVlW2pdID0gaVxyXG4gICAgc29sb0luZGV4ID0gMFxyXG4gIGVsc2VcclxuICAgIHNvbG9JbmRleCArPSBkZWx0YVxyXG5cclxuICBpZiBzb2xvSW5kZXggPCAwXHJcbiAgICBzb2xvSW5kZXggPSAwXHJcbiAgc29sb1ZpZGVvID0gc29sb1F1ZXVlW3NvbG9JbmRleF1cclxuXHJcbiAgY29uc29sZS5sb2cgc29sb1ZpZGVvXHJcblxyXG4gICMgZGVidWdcclxuICAjIHNvbG9WaWRlby5zdGFydCA9IDEwXHJcbiAgIyBzb2xvVmlkZW8uZW5kID0gNTBcclxuICAjIHNvbG9WaWRlby5kdXJhdGlvbiA9IDQwXHJcblxyXG4gIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuXHJcbiAgc29sb0luZm9Ccm9hZGNhc3QoKVxyXG5cclxuc29sb1RpY2sgPSAtPlxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgbm90IHNvbG9JRD8gb3Igc29sb0Vycm9yIG9yIHNvbG9NaXJyb3JcclxuICAgIHJldHVyblxyXG5cclxuICBjb25zb2xlLmxvZyBcInNvbG9UaWNrKClcIlxyXG4gIGlmIG5vdCBwbGF5aW5nIGFuZCBwbGF5ZXI/XHJcbiAgICBzb2xvUGxheSgpXHJcbiAgICByZXR1cm5cclxuXHJcbmdldERhdGEgPSAodXJsKSAtPlxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuICAgICAgICBpZiAoQHJlYWR5U3RhdGUgPT0gNCkgYW5kIChAc3RhdHVzID09IDIwMClcclxuICAgICAgICAgICAjIFR5cGljYWwgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCB3aGVuIHRoZSBkb2N1bWVudCBpcyByZWFkeTpcclxuICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgIGVudHJpZXMgPSBKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgIHJlc29sdmUoZW50cmllcylcclxuICAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxyXG4gICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpXHJcbiAgICB4aHR0cC5zZW5kKClcclxuXHJcbm1lZGlhQnV0dG9uc1JlYWR5ID0gZmFsc2VcclxubGlzdGVuRm9yTWVkaWFCdXR0b25zID0gLT5cclxuICBpZiBtZWRpYUJ1dHRvbnNSZWFkeVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIG5vdCB3aW5kb3cubmF2aWdhdG9yPy5tZWRpYVNlc3Npb24/XHJcbiAgICBzZXRUaW1lb3V0KC0+XHJcbiAgICAgIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXHJcbiAgICAsIDEwMDApXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbWVkaWFCdXR0b25zUmVhZHkgPSB0cnVlXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAncHJldmlvdXN0cmFjaycsIC0+XHJcbiAgICBzb2xvUHJldigpXHJcbiAgd2luZG93Lm5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlciAnbmV4dHRyYWNrJywgLT5cclxuICAgIHNvbG9Ta2lwKClcclxuICBjb25zb2xlLmxvZyBcIk1lZGlhIEJ1dHRvbnMgcmVhZHkuXCJcclxuXHJcbnJlbmRlclBsYXlsaXN0TmFtZSA9IC0+XHJcbiAgaWYgbm90IGN1cnJlbnRQbGF5bGlzdE5hbWU/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWxpc3RuYW1lJykuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvXCJcclxuICAgIHJldHVyblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5bGlzdG5hbWUnKS5pbm5lckhUTUwgPSBjdXJyZW50UGxheWxpc3ROYW1lXHJcbiAgZG9jdW1lbnQudGl0bGUgPSBcIk1UViBTb2xvOiAje2N1cnJlbnRQbGF5bGlzdE5hbWV9XCJcclxuXHJcbnN0YXJ0SGVyZSA9IC0+XHJcbiAgc2hvd1dhdGNoTGluaygpXHJcblxyXG4gIGlmIG5vdCBwbGF5ZXI/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29sb3ZpZGVvY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRlcicpLmNsYXNzTGlzdC5hZGQoJ2Nvcm5lcicpXHJcbiAgICBpZiBpc1Rlc2xhXHJcbiAgICAgIG9uVGFwU2hvdygpXHJcbiAgICBlbHNlXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRlcicpLmNsYXNzTGlzdC5hZGQoJ2ZhZGV5JylcclxuICAgIHBsYXllciA9IG5ldyBZVC5QbGF5ZXIgJ210di1wbGF5ZXInLCB7XHJcbiAgICAgIHdpZHRoOiAnMTAwJSdcclxuICAgICAgaGVpZ2h0OiAnMTAwJSdcclxuICAgICAgdmlkZW9JZDogJ0FCN3lrT2ZBZ0lBJyAjIE1UViBsb2FkaW5nIHNjcmVlbiwgdGhpcyB3aWxsIGJlIHJlcGxhY2VkIGFsbW9zdCBpbW1lZGlhdGVseVxyXG4gICAgICBwbGF5ZXJWYXJzOiB7ICdhdXRvcGxheSc6IDEsICdlbmFibGVqc2FwaSc6IDEsICdjb250cm9scyc6IDEgfVxyXG4gICAgICBldmVudHM6IHtcclxuICAgICAgICBvblJlYWR5OiBvblBsYXllclJlYWR5XHJcbiAgICAgICAgb25TdGF0ZUNoYW5nZTogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm5cclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gcXMoJ2ZpbHRlcnMnKVxyXG4gIHNvbG9VbnNodWZmbGVkID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nKVxyXG4gIGlmIG5vdCBzb2xvVW5zaHVmZmxlZD9cclxuICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCBzb2xvIGRhdGFiYXNlIVwiKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIHNvbG9VbnNodWZmbGVkLmxlbmd0aCA9PSAwXHJcbiAgICBzb2xvRmF0YWxFcnJvcihcIk5vIG1hdGNoaW5nIHNvbmdzIGluIHRoZSBmaWx0ZXIhXCIpXHJcbiAgICByZXR1cm5cclxuICBzb2xvQ291bnQgPSBzb2xvVW5zaHVmZmxlZC5sZW5ndGhcclxuXHJcbiAgaWYgc29sb1RpY2tUaW1lb3V0P1xyXG4gICAgY2xlYXJJbnRlcnZhbChzb2xvVGlja1RpbWVvdXQpXHJcbiAgc29sb1RpY2tUaW1lb3V0ID0gc2V0SW50ZXJ2YWwoc29sb1RpY2ssIDUwMDApXHJcbiAgc29sb1F1ZXVlID0gW11cclxuICBzb2xvUGxheSgpXHJcbiAgaWYgc29sb01pcnJvciBhbmQgc29sb1ZpZGVvXHJcbiAgICBwbGF5KHNvbG9WaWRlbywgc29sb1ZpZGVvLmlkLCBzb2xvVmlkZW8uc3RhcnQsIHNvbG9WaWRlby5lbmQpXHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicXVpY2ttZW51XCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gIGxpc3RlbkZvck1lZGlhQnV0dG9ucygpXHJcblxyXG4gIGlmIGlzVGVzbGFcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YXBzaG93Jykuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxyXG5cclxuY2FsY1Blcm1hbGluayA9IC0+XHJcbiAgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc2Zvcm0nKVxyXG4gIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pXHJcbiAgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhmb3JtRGF0YSlcclxuICBwYXJhbXMuZGVsZXRlKFwibG9hZG5hbWVcIilcclxuICBwYXJhbXMuZGVsZXRlKFwic2F2ZW5hbWVcIilcclxuICBpZiBjdXJyZW50UGxheWxpc3ROYW1lP1xyXG4gICAgcGFyYW1zLnNldChcIm5hbWVcIiwgY3VycmVudFBsYXlsaXN0TmFtZSlcclxuICBxdWVyeXN0cmluZyA9IHBhcmFtcy50b1N0cmluZygpXHJcbiAgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMF0uc3BsaXQoJz8nKVswXSAjIG9vZiBoYWNreVxyXG4gIG10dlVSTCA9IGJhc2VVUkwgKyBcIj9cIiArIHF1ZXJ5c3RyaW5nXHJcbiAgcmV0dXJuIG10dlVSTFxyXG5cclxuZ2VuZXJhdGVQZXJtYWxpbmsgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiZ2VuZXJhdGVQZXJtYWxpbmsoKVwiXHJcbiAgd2luZG93LmxvY2F0aW9uID0gY2FsY1Blcm1hbGluaygpXHJcblxyXG5mb3JtQ2hhbmdlZCA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJGb3JtIGNoYW5nZWQhXCJcclxuICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSgnaGVyZScsICcnLCBjYWxjUGVybWFsaW5rKCkpXHJcbiAgcmVuZGVyUGxheWxpc3ROYW1lKClcclxuXHJcbnNvbG9Ta2lwID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3NraXAnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KClcclxuXHJcbnNvbG9QcmV2ID0gLT5cclxuICBzb2NrZXQuZW1pdCAnc29sbycsIHtcclxuICAgIGlkOiBzb2xvSURcclxuICAgIGNtZDogJ3ByZXYnXHJcbiAgfVxyXG4gIHNvbG9QbGF5KC0xKVxyXG5cclxuc29sb1Jlc3RhcnQgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICdzb2xvJywge1xyXG4gICAgaWQ6IHNvbG9JRFxyXG4gICAgY21kOiAncmVzdGFydCdcclxuICB9XHJcbiAgc29sb1BsYXkoMClcclxuXHJcbnNvbG9QYXVzZSA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7XHJcbiAgICBpZDogc29sb0lEXHJcbiAgICBjbWQ6ICdwYXVzZSdcclxuICB9XHJcbiAgcGF1c2VJbnRlcm5hbCgpXHJcblxyXG5yZW5kZXJJbmZvID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIHRhZ3NTdHJpbmcgPSBPYmplY3Qua2V5cyhzb2xvSW5mby5jdXJyZW50LnRhZ3MpLnNvcnQoKS5qb2luKCcsICcpXHJcbiAgY29tcGFueSA9IGF3YWl0IGNhbGNMYWJlbChzb2xvSW5mby5jdXJyZW50KVxyXG5cclxuICBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvY291bnRzXFxcIj5UcmFjayAje3NvbG9JbmZvLmluZGV4fSAvICN7c29sb0luZm8uY291bnR9PC9kaXY+XCJcclxuICAjIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvaGVhZGluZ1xcXCI+Q3VycmVudDogWzxzcGFuIGNsYXNzPVxcXCJ5b3V0dWJlaWRcXFwiPiN7c29sb0luZm8uY3VycmVudC5pZH08L3NwYW4+XTwvZGl2PlwiXHJcbiAgaWYgbm90IHBsYXllcj9cclxuICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvdGh1bWJcXFwiPjxhIGhyZWY9XFxcImh0dHBzOi8veW91dHUuYmUvI3tlbmNvZGVVUklDb21wb25lbnQoc29sb0luZm8uY3VycmVudC5pZCl9XFxcIj48aW1nIHdpZHRoPTMyMCBoZWlnaHQ9MTgwIHNyYz1cXFwiI3tzb2xvSW5mby5jdXJyZW50LnRodW1ifVxcXCI+PC9hPjwvZGl2PlwiXHJcbiAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImluZm9jdXJyZW50IGluZm9hcnRpc3RcXFwiPiN7c29sb0luZm8uY3VycmVudC5hcnRpc3R9PC9kaXY+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb3RpdGxlXFxcIj5cXFwiI3tzb2xvSW5mby5jdXJyZW50LnRpdGxlfVxcXCI8L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvbGFiZWxcXFwiPiN7Y29tcGFueX08L2Rpdj5cIlxyXG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJpbmZvdGFnc1xcXCI+Jm5ic3A7I3t0YWdzU3RyaW5nfSZuYnNwOzwvZGl2PlwiXHJcbiAgaWYgc29sb0luZm8ubmV4dD9cclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2hlYWRpbmcgbmV4dHZpZGVvXFxcIj5OZXh0Ojwvc3Bhbj4gXCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7c29sb0luZm8ubmV4dC5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje3NvbG9JbmZvLm5leHQudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gIGVsc2VcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2hlYWRpbmcgbmV4dHZpZGVvXFxcIj5OZXh0Ojwvc3Bhbj4gXCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb3Jlc2h1ZmZsZSBuZXh0dmlkZW9cXFwiPiguLi5SZXNodWZmbGUuLi4pPC9zcGFuPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8nKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5jbGlwYm9hcmRFZGl0ID0gLT5cclxuICBodG1sID0gXCI8YSBjbGFzcz1cXFwiY2J1dHRvIGNvcGllZFxcXCIgb25jbGljaz1cXFwicmV0dXJuIGZhbHNlXFxcIj5Db3BpZWQhPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBib2FyZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJDbGlwYm9hcmQoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQ2xpcGJvYXJkID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG9cXFwiIGRhdGEtY2xpcGJvYXJkLXRleHQ9XFxcIiNtdHYgZWRpdCAje3NvbG9JbmZvLmN1cnJlbnQuaWR9IFxcXCIgb25jbGljaz1cXFwiY2xpcGJvYXJkRWRpdCgpOyByZXR1cm4gZmFsc2VcXFwiPkVkaXQ8L2E+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcGJvYXJkJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIG5ldyBDbGlwYm9hcmQoJy5jYnV0dG8nKVxyXG5cclxub25BZGQgPSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8uY3VycmVudD9cclxuICAgIHJldHVyblxyXG5cclxuICB2aWQgPSBzb2xvSW5mby5jdXJyZW50XHJcbiAgZmlsdGVyU3RyaW5nID0gU3RyaW5nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWUpLnRyaW0oKVxyXG4gIGlmIGZpbHRlclN0cmluZy5sZW5ndGggPiAwXHJcbiAgICBmaWx0ZXJTdHJpbmcgKz0gXCJcXG5cIlxyXG4gIGZpbHRlclN0cmluZyArPSBcImlkICN7dmlkLmlkfSAjICN7dmlkLmFydGlzdH0gLSAje3ZpZC50aXRsZX1cXG5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IGZpbHRlclN0cmluZ1xyXG4gIGZvcm1DaGFuZ2VkKClcclxuXHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcImNidXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+QWRkZWQhPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZCcpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJBZGQoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQWRkID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50PyBvciBub3QgYWRkRW5hYmxlZFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJjYnV0dG9cXFwiIG9uY2xpY2s9XFxcIm9uQWRkKCk7IHJldHVybiBmYWxzZVxcXCI+QWRkPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZCcpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbmNsaXBib2FyZE1pcnJvciA9IC0+XHJcbiAgaHRtbCA9IFwiPGEgY2xhc3M9XFxcIm1idXR0byBjb3BpZWRcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZVxcXCI+Q29waWVkITwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYm1pcnJvcicpLmlubmVySFRNTCA9IGh0bWxcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICByZW5kZXJDbGlwYm9hcmRNaXJyb3IoKVxyXG4gICwgMjAwMFxyXG5cclxucmVuZGVyQ2xpcGJvYXJkTWlycm9yID0gLT5cclxuICBpZiBub3Qgc29sb0luZm8/IG9yIG5vdCBzb2xvSW5mby5jdXJyZW50P1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIGh0bWwgPSBcIjxhIGNsYXNzPVxcXCJtYnV0dG9cXFwib25jbGljaz1cXFwiY2xpcGJvYXJkTWlycm9yKCk7IHJldHVybiBmYWxzZVxcXCI+TWlycm9yPC9hPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NibWlycm9yJykuaW5uZXJIVE1MID0gaHRtbFxyXG4gIG5ldyBDbGlwYm9hcmQgJy5tYnV0dG8nLCB7XHJcbiAgICB0ZXh0OiAtPlxyXG4gICAgICByZXR1cm4gY2FsY1NoYXJlVVJMKHRydWUpXHJcbiAgfVxyXG5cclxuc2hhcmVDbGlwYm9hcmQgPSAobWlycm9yKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVxcXCJzaGFyZWNvcGllZFxcXCI+Q29waWVkIHRvIGNsaXBib2FyZDo8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJldXJsXFxcIj4je2NhbGNTaGFyZVVSTChtaXJyb3IpfTwvZGl2PlxyXG4gIFwiXCJcIlxyXG5cclxuc2hhcmVQZXJtYSA9IChtaXJyb3IpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XFxcInNoYXJlY29waWVkXFxcIj5Db3BpZWQgdG8gY2xpcGJvYXJkOjwvZGl2PlxyXG4gICAgPGRpdiBjbGFzcz1cXFwic2hhcmV1cmxcXFwiPiN7Y2FsY1Blcm1hKCl9PC9kaXY+XHJcbiAgXCJcIlwiXHJcblxyXG5zaG93TGlzdCA9IC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlBsZWFzZSB3YWl0Li4uXCJcclxuXHJcbiAgZmlsdGVyU3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMnKS52YWx1ZVxyXG4gIGxpc3QgPSBhd2FpdCBmaWx0ZXJzLmdlbmVyYXRlTGlzdChmaWx0ZXJTdHJpbmcsIHRydWUpXHJcbiAgaWYgbm90IGxpc3Q/XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IFwiRXJyb3IuIFNvcnJ5LlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwibGlzdGNvbnRhaW5lclxcXCI+XCJcclxuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaW5mb2NvdW50c1xcXCI+I3tsaXN0Lmxlbmd0aH0gdmlkZW9zOjwvZGl2PlwiXHJcbiAgZm9yIGUgaW4gbGlzdFxyXG4gICAgaHRtbCArPSBcIjxkaXY+XCJcclxuICAgIGh0bWwgKz0gXCI8c3BhbiBjbGFzcz1cXFwiaW5mb2FydGlzdCBuZXh0dmlkZW9cXFwiPiN7ZS5hcnRpc3R9PC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcIm5leHR2aWRlb1xcXCI+IC0gPC9zcGFuPlwiXHJcbiAgICBodG1sICs9IFwiPHNwYW4gY2xhc3M9XFxcImluZm90aXRsZSBuZXh0dmlkZW9cXFwiPlxcXCIje2UudGl0bGV9XFxcIjwvc3Bhbj5cIlxyXG4gICAgaHRtbCArPSBcIjwvZGl2PlxcblwiXHJcblxyXG4gIGh0bWwgKz0gXCI8L2Rpdj5cIlxyXG5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmlubmVySFRNTCA9IGh0bWxcclxuXHJcbnNob3dFeHBvcnQgPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuaW5uZXJIVE1MID0gXCJQbGVhc2Ugd2FpdC4uLlwiXHJcblxyXG4gIGZpbHRlclN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXJzJykudmFsdWVcclxuICBsaXN0ID0gYXdhaXQgZmlsdGVycy5nZW5lcmF0ZUxpc3QoZmlsdGVyU3RyaW5nLCB0cnVlKVxyXG4gIGlmIG5vdCBsaXN0P1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIkVycm9yLiBTb3JyeS5cIlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGV4cG9ydGVkUGxheWxpc3RzID0gXCJcIlxyXG4gIGlkcyA9IFtdXHJcbiAgcGxheWxpc3RJbmRleCA9IDFcclxuICBmb3IgZSBpbiBsaXN0XHJcbiAgICBpZiBpZHMubGVuZ3RoID49IDUwXHJcbiAgICAgIGV4cG9ydGVkUGxheWxpc3RzICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaF92aWRlb3M/dmlkZW9faWRzPSN7aWRzLmpvaW4oJywnKX1cIj5FeHBvcnRlZCBQbGF5bGlzdCAje3BsYXlsaXN0SW5kZXh9ICgje2lkcy5sZW5ndGh9KTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgICBwbGF5bGlzdEluZGV4ICs9IDFcclxuICAgICAgaWRzID0gW11cclxuICAgIGlkcy5wdXNoIGUuaWRcclxuICBpZiBpZHMubGVuZ3RoID4gMFxyXG4gICAgZXhwb3J0ZWRQbGF5bGlzdHMgKz0gXCJcIlwiXHJcbiAgICAgIDxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaF92aWRlb3M/dmlkZW9faWRzPSN7aWRzLmpvaW4oJywnKX1cIj5FeHBvcnRlZCBQbGF5bGlzdCAje3BsYXlsaXN0SW5kZXh9ICgje2lkcy5sZW5ndGh9KTwvYT48YnI+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5pbm5lckhUTUwgPSBcIlwiXCJcclxuICAgIDxkaXYgY2xhc3M9XFxcImxpc3Rjb250YWluZXJcXFwiPlxyXG4gICAgICAje2V4cG9ydGVkUGxheWxpc3RzfVxyXG4gICAgPC9kaXY+XHJcbiAgXCJcIlwiXHJcblxyXG5jbGVhck9waW5pb24gPSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGluaW9ucycpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbnVwZGF0ZU9waW5pb24gPSAocGt0KSAtPlxyXG4gIGlmIG5vdCBzb2xvSW5mbz8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQ/IG9yIG5vdCAocGt0LmlkID09IHNvbG9JbmZvLmN1cnJlbnQuaWQpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaHRtbCA9IFwiXCJcclxuICBmb3IgbyBpbiBvcGluaW9uT3JkZXIgYnkgLTFcclxuICAgIGNhcG8gPSBvLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgby5zbGljZSgxKVxyXG4gICAgY2xhc3NlcyA9IFwib2J1dHRvXCJcclxuICAgIGlmIG8gPT0gcGt0Lm9waW5pb25cclxuICAgICAgY2xhc3NlcyArPSBcIiBjaG9zZW5cIlxyXG4gICAgaHRtbCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XCIje2NsYXNzZXN9XCIgb25jbGljaz1cInNldE9waW5pb24oJyN7b30nKTsgcmV0dXJuIGZhbHNlO1wiPiN7Y2Fwb308L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BpbmlvbnMnKS5pbm5lckhUTUwgPSBodG1sXHJcblxyXG5zZXRPcGluaW9uID0gKG9waW5pb24pIC0+XHJcbiAgaWYgbm90IGRpc2NvcmRUb2tlbj8gb3Igbm90IHNvbG9JbmZvPyBvciBub3Qgc29sb0luZm8uY3VycmVudD8gb3Igbm90IHNvbG9JbmZvLmN1cnJlbnQuaWQ/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBzb2xvSW5mby5jdXJyZW50LmlkLCBzZXQ6IG9waW5pb24gfVxyXG5cclxucGF1c2VJbnRlcm5hbCA9IC0+XHJcbiAgaWYgcGxheWVyP1xyXG4gICAgaWYgcGxheWVyLmdldFBsYXllclN0YXRlKCkgPT0gMlxyXG4gICAgICBwbGF5ZXIucGxheVZpZGVvKClcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVyLnBhdXNlVmlkZW8oKVxyXG5cclxuc29sb0NvbW1hbmQgPSAocGt0KSAtPlxyXG4gIGlmIHBrdC5pZCAhPSBzb2xvSURcclxuICAgIHJldHVyblxyXG4gIGNvbnNvbGUubG9nIFwic29sb0NvbW1hbmQ6IFwiLCBwa3RcclxuICBzd2l0Y2ggcGt0LmNtZFxyXG4gICAgd2hlbiAncHJldidcclxuICAgICAgc29sb1BsYXkoLTEpXHJcbiAgICB3aGVuICdza2lwJ1xyXG4gICAgICBzb2xvUGxheSgxKVxyXG4gICAgd2hlbiAncmVzdGFydCdcclxuICAgICAgc29sb1BsYXkoMClcclxuICAgIHdoZW4gJ3BhdXNlJ1xyXG4gICAgICBwYXVzZUludGVybmFsKClcclxuICAgIHdoZW4gJ2luZm8nXHJcbiAgICAgIGlmIHBrdC5pbmZvP1xyXG4gICAgICAgIGNvbnNvbGUubG9nIFwiTkVXIElORk8hOiBcIiwgcGt0LmluZm9cclxuICAgICAgICBzb2xvSW5mbyA9IHBrdC5pbmZvXHJcbiAgICAgICAgYXdhaXQgcmVuZGVySW5mbygpXHJcbiAgICAgICAgcmVuZGVyQWRkKClcclxuICAgICAgICByZW5kZXJDbGlwYm9hcmQoKVxyXG4gICAgICAgIHJlbmRlckNsaXBib2FyZE1pcnJvcigpXHJcbiAgICAgICAgaWYgc29sb01pcnJvclxyXG4gICAgICAgICAgc29sb1ZpZGVvID0gcGt0LmluZm8uY3VycmVudFxyXG4gICAgICAgICAgaWYgc29sb1ZpZGVvP1xyXG4gICAgICAgICAgICBpZiBub3QgcGxheWVyP1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwibm8gcGxheWVyIHlldFwiXHJcbiAgICAgICAgICAgIHBsYXkoc29sb1ZpZGVvLCBzb2xvVmlkZW8uaWQsIHNvbG9WaWRlby5zdGFydCwgc29sb1ZpZGVvLmVuZClcclxuICAgICAgICBjbGVhck9waW5pb24oKVxyXG4gICAgICAgIGlmIGRpc2NvcmRUb2tlbj8gYW5kIHNvbG9JbmZvLmN1cnJlbnQ/IGFuZCBzb2xvSW5mby5jdXJyZW50LmlkP1xyXG4gICAgICAgICAgc29ja2V0LmVtaXQgJ29waW5pb24nLCB7IHRva2VuOiBkaXNjb3JkVG9rZW4sIGlkOiBzb2xvSW5mby5jdXJyZW50LmlkIH1cclxuXHJcbnVwZGF0ZVNvbG9JRCA9IChuZXdTb2xvSUQpIC0+XHJcbiAgc29sb0lEID0gbmV3U29sb0lEXHJcbiAgaWYgbm90IHNvbG9JRD9cclxuICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gXCJFUlJPUjogbm8gc29sbyBxdWVyeSBwYXJhbWV0ZXJcIlxyXG4gICAgcmV0dXJuXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzb2xvaWRcIikudmFsdWUgPSBzb2xvSURcclxuICBpZiBzb2NrZXQ/XHJcbiAgICBzb2NrZXQuZW1pdCAnc29sbycsIHsgaWQ6IHNvbG9JRCB9XHJcblxyXG5uZXdTb2xvSUQgPSAtPlxyXG4gIHVwZGF0ZVNvbG9JRChyYW5kb21TdHJpbmcoKSlcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pcnJvclwiKS5jaGVja2VkID0gZmFsc2VcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyc2VjdGlvbicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pcnJvcm5vdGUnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgZ2VuZXJhdGVQZXJtYWxpbmsoKVxyXG5cclxubG9hZFBsYXlsaXN0ID0gLT5cclxuICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICBzZWxlY3RlZCA9IGNvbWJvLm9wdGlvbnNbY29tYm8uc2VsZWN0ZWRJbmRleF1cclxuICBzZWxlY3RlZE5hbWUgPSBzZWxlY3RlZC52YWx1ZVxyXG4gIGN1cnJlbnRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJzXCIpLnZhbHVlXHJcbiAgaWYgbm90IHNlbGVjdGVkTmFtZT9cclxuICAgIHJldHVyblxyXG4gIHNlbGVjdGVkTmFtZSA9IHNlbGVjdGVkTmFtZS50cmltKClcclxuICBpZiBzZWxlY3RlZE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgY3VycmVudEZpbHRlcnMubGVuZ3RoID4gMFxyXG4gICAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbG9hZCAnI3tzZWxlY3RlZE5hbWV9Jz9cIilcclxuICAgICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwibG9hZFwiXHJcbiAgICBsb2FkbmFtZTogc2VsZWN0ZWROYW1lXHJcbiAgfVxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBzZWxlY3RlZE5hbWVcclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5kZWxldGVQbGF5bGlzdCA9IC0+XHJcbiAgY29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRuYW1lXCIpXHJcbiAgc2VsZWN0ZWQgPSBjb21iby5vcHRpb25zW2NvbWJvLnNlbGVjdGVkSW5kZXhdXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWQudmFsdWVcclxuICBpZiBub3Qgc2VsZWN0ZWROYW1lP1xyXG4gICAgcmV0dXJuXHJcbiAgc2VsZWN0ZWROYW1lID0gc2VsZWN0ZWROYW1lLnRyaW0oKVxyXG4gIGlmIHNlbGVjdGVkTmFtZS5sZW5ndGggPCAxXHJcbiAgICByZXR1cm5cclxuICBpZiBub3QgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsb2FkICcje3NlbGVjdGVkTmFtZX0nP1wiKVxyXG4gICAgcmV0dXJuXHJcbiAgZGlzY29yZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJylcclxuICBwbGF5bGlzdFBheWxvYWQgPSB7XHJcbiAgICB0b2tlbjogZGlzY29yZFRva2VuXHJcbiAgICBhY3Rpb246IFwiZGVsXCJcclxuICAgIGRlbG5hbWU6IHNlbGVjdGVkTmFtZVxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5zYXZlUGxheWxpc3QgPSAtPlxyXG4gIG91dHB1dE5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNhdmVuYW1lXCIpLnZhbHVlXHJcbiAgb3V0cHV0TmFtZSA9IG91dHB1dE5hbWUudHJpbSgpXHJcbiAgb3V0cHV0RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZVxyXG4gIGlmIG91dHB1dE5hbWUubGVuZ3RoIDwgMVxyXG4gICAgcmV0dXJuXHJcbiAgaWYgbm90IGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2F2ZSAnI3tvdXRwdXROYW1lfSc/XCIpXHJcbiAgICByZXR1cm5cclxuICBkaXNjb3JkVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKVxyXG4gIHBsYXlsaXN0UGF5bG9hZCA9IHtcclxuICAgIHRva2VuOiBkaXNjb3JkVG9rZW5cclxuICAgIGFjdGlvbjogXCJzYXZlXCJcclxuICAgIHNhdmVuYW1lOiBvdXRwdXROYW1lXHJcbiAgICBmaWx0ZXJzOiBvdXRwdXRGaWx0ZXJzXHJcbiAgfVxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBvdXRwdXROYW1lXHJcbiAgc29ja2V0LmVtaXQgJ3VzZXJwbGF5bGlzdCcsIHBsYXlsaXN0UGF5bG9hZFxyXG5cclxucmVxdWVzdFVzZXJQbGF5bGlzdHMgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgcGxheWxpc3RQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gICAgYWN0aW9uOiBcImxpc3RcIlxyXG4gIH1cclxuICBzb2NrZXQuZW1pdCAndXNlcnBsYXlsaXN0JywgcGxheWxpc3RQYXlsb2FkXHJcblxyXG5yZWNlaXZlVXNlclBsYXlsaXN0ID0gKHBrdCkgLT5cclxuICBjb25zb2xlLmxvZyBcInJlY2VpdmVVc2VyUGxheWxpc3RcIiwgcGt0XHJcbiAgaWYgcGt0Lmxpc3Q/XHJcbiAgICBjb21ibyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZG5hbWVcIilcclxuICAgIGNvbWJvLm9wdGlvbnMubGVuZ3RoID0gMFxyXG4gICAgcGt0Lmxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgYS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi50b0xvd2VyQ2FzZSgpKVxyXG4gICAgZm9yIG5hbWUgaW4gcGt0Lmxpc3RcclxuICAgICAgaXNTZWxlY3RlZCA9IChuYW1lID09IHBrdC5zZWxlY3RlZClcclxuICAgICAgY29tYm8ub3B0aW9uc1tjb21iby5vcHRpb25zLmxlbmd0aF0gPSBuZXcgT3B0aW9uKG5hbWUsIG5hbWUsIGZhbHNlLCBpc1NlbGVjdGVkKVxyXG4gICAgaWYgcGt0Lmxpc3QubGVuZ3RoID09IDBcclxuICAgICAgY29tYm8ub3B0aW9uc1tjb21iby5vcHRpb25zLmxlbmd0aF0gPSBuZXcgT3B0aW9uKFwiTm9uZVwiLCBcIlwiKVxyXG4gIGlmIHBrdC5sb2FkbmFtZT9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZW5hbWVcIikudmFsdWUgPSBwa3QubG9hZG5hbWVcclxuICBpZiBwa3QuZmlsdGVycz9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHBrdC5maWx0ZXJzXHJcbiAgZm9ybUNoYW5nZWQoKVxyXG5cclxubG9nb3V0ID0gLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlkZW50aXR5XCIpLmlubmVySFRNTCA9IFwiTG9nZ2luZyBvdXQuLi5cIlxyXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpXHJcbiAgZGlzY29yZFRva2VuID0gbnVsbFxyXG4gIHNlbmRJZGVudGl0eSgpXHJcblxyXG5zZW5kSWRlbnRpdHkgPSAtPlxyXG4gIGRpc2NvcmRUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpXHJcbiAgaWRlbnRpdHlQYXlsb2FkID0ge1xyXG4gICAgdG9rZW46IGRpc2NvcmRUb2tlblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyBcIlNlbmRpbmcgaWRlbnRpZnk6IFwiLCBpZGVudGl0eVBheWxvYWRcclxuICBzb2NrZXQuZW1pdCAnaWRlbnRpZnknLCBpZGVudGl0eVBheWxvYWRcclxuXHJcbnJlY2VpdmVJZGVudGl0eSA9IChwa3QpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJpZGVudGlmeSByZXNwb25zZTpcIiwgcGt0XHJcbiAgaWYgcGt0LmRpc2FibGVkXHJcbiAgICBjb25zb2xlLmxvZyBcIkRpc2NvcmQgYXV0aCBkaXNhYmxlZC5cIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgcGt0LnRhZz8gYW5kIChwa3QudGFnLmxlbmd0aCA+IDApXHJcbiAgICBkaXNjb3JkVGFnID0gcGt0LnRhZ1xyXG4gICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCJcIlxyXG4gICAgaWYgcGt0Lm5pY2tuYW1lP1xyXG4gICAgICBkaXNjb3JkTmlja25hbWUgPSBwa3Qubmlja25hbWVcclxuICAgICAgZGlzY29yZE5pY2tuYW1lU3RyaW5nID0gXCIgKCN7ZGlzY29yZE5pY2tuYW1lfSlcIlxyXG4gICAgaHRtbCA9IFwiXCJcIlxyXG4gICAgICAje2Rpc2NvcmRUYWd9I3tkaXNjb3JkTmlja25hbWVTdHJpbmd9IC0gWzxhIG9uY2xpY2s9XCJsb2dvdXQoKVwiPkxvZ291dDwvYT5dXHJcbiAgICBcIlwiXCJcclxuICAgIHJlcXVlc3RVc2VyUGxheWxpc3RzKClcclxuICBlbHNlXHJcbiAgICBkaXNjb3JkVGFnID0gbnVsbFxyXG4gICAgZGlzY29yZE5pY2tuYW1lID0gbnVsbFxyXG4gICAgZGlzY29yZFRva2VuID0gbnVsbFxyXG5cclxuICAgIHJlZGlyZWN0VVJMID0gU3RyaW5nKHdpbmRvdy5sb2NhdGlvbikucmVwbGFjZSgvIy4qJC8sIFwiXCIpICsgXCJvYXV0aFwiXHJcbiAgICBsb2dpbkxpbmsgPSBcImh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi9hdXRob3JpemU/Y2xpZW50X2lkPSN7d2luZG93LkNMSUVOVF9JRH0mcmVkaXJlY3RfdXJpPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX0mcmVzcG9uc2VfdHlwZT1jb2RlJnNjb3BlPWlkZW50aWZ5XCJcclxuICAgIGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImxvZ2luaGludFwiPihMb2dpbiBvbiA8YSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiPkRhc2hib2FyZDwvYT4pPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGFyZWFcIik/LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlYXJlYVwiKT8uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpZGVudGl0eVwiKS5pbm5lckhUTUwgPSBodG1sXHJcbiAgaWYgbGFzdENsaWNrZWQ/XHJcbiAgICBsYXN0Q2xpY2tlZCgpXHJcblxyXG55b3V0dWJlUmVhZHkgPSBmYWxzZVxyXG53aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSAtPlxyXG4gIGlmIHlvdXR1YmVSZWFkeVxyXG4gICAgcmV0dXJuXHJcbiAgeW91dHViZVJlYWR5ID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcIm9uWW91VHViZVBsYXllckFQSVJlYWR5XCJcclxuICBzZXRUaW1lb3V0IC0+XHJcbiAgICBmaW5pc2hJbml0KClcclxuICAsIDBcclxuXHJcbmZpbmlzaEluaXQgPSAtPlxyXG4gIHdpbmRvdy5jbGlwYm9hcmRFZGl0ID0gY2xpcGJvYXJkRWRpdFxyXG4gIHdpbmRvdy5jbGlwYm9hcmRNaXJyb3IgPSBjbGlwYm9hcmRNaXJyb3JcclxuICB3aW5kb3cuZGVsZXRlUGxheWxpc3QgPSBkZWxldGVQbGF5bGlzdFxyXG4gIHdpbmRvdy5mb3JtQ2hhbmdlZCA9IGZvcm1DaGFuZ2VkXHJcbiAgd2luZG93LmxvYWRQbGF5bGlzdCA9IGxvYWRQbGF5bGlzdFxyXG4gIHdpbmRvdy5sb2dvdXQgPSBsb2dvdXRcclxuICB3aW5kb3cubmV3U29sb0lEID0gbmV3U29sb0lEXHJcbiAgd2luZG93Lm9uQWRkID0gb25BZGRcclxuICB3aW5kb3cub25UYXBTaG93ID0gb25UYXBTaG93XHJcbiAgd2luZG93LnNhdmVQbGF5bGlzdCA9IHNhdmVQbGF5bGlzdFxyXG4gIHdpbmRvdy5zZXRPcGluaW9uID0gc2V0T3BpbmlvblxyXG4gIHdpbmRvdy5zaGFyZUNsaXBib2FyZCA9IHNoYXJlQ2xpcGJvYXJkXHJcbiAgd2luZG93LnNoYXJlUGVybWEgPSBzaGFyZVBlcm1hXHJcbiAgd2luZG93LnNob3dFeHBvcnQgPSBzaG93RXhwb3J0XHJcbiAgd2luZG93LnNob3dMaXN0ID0gc2hvd0xpc3RcclxuICB3aW5kb3cuc2hvd1dhdGNoRm9ybSA9IHNob3dXYXRjaEZvcm1cclxuICB3aW5kb3cuc2hvd1dhdGNoTGluayA9IHNob3dXYXRjaExpbmtcclxuICB3aW5kb3cuc29sb1BhdXNlID0gc29sb1BhdXNlXHJcbiAgd2luZG93LnNvbG9QcmV2ID0gc29sb1ByZXZcclxuICB3aW5kb3cuc29sb1Jlc3RhcnQgPSBzb2xvUmVzdGFydFxyXG4gIHdpbmRvdy5zb2xvU2tpcCA9IHNvbG9Ta2lwXHJcbiAgd2luZG93LnN0YXJ0Q2FzdCA9IHN0YXJ0Q2FzdFxyXG4gIHdpbmRvdy5zdGFydEhlcmUgPSBzdGFydEhlcmVcclxuXHJcbiAgIyBhZGRFbmFibGVkID0gcXMoJ2FkZCcpP1xyXG4gICMgY29uc29sZS5sb2cgXCJBZGQgRW5hYmxlZDogI3thZGRFbmFibGVkfVwiXHJcblxyXG4gIHVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnRcclxuICBpZiB1c2VyQWdlbnQ/IGFuZCBTdHJpbmcodXNlckFnZW50KS5tYXRjaCgvVGVzbGFcXC8yMC8pXHJcbiAgICBpc1Rlc2xhID0gdHJ1ZVxyXG5cclxuICBpZiBpc1Rlc2xhXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0ZXInKS5jbGFzc0xpc3QuYWRkKCd0ZXNsYScpXHJcblxyXG4gIGN1cnJlbnRQbGF5bGlzdE5hbWUgPSBxcygnbmFtZScpXHJcbiAgaWYgY3VycmVudFBsYXlsaXN0TmFtZT9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZW5hbWVcIikudmFsdWUgPSBjdXJyZW50UGxheWxpc3ROYW1lXHJcblxyXG4gIGV4cG9ydEVuYWJsZWQgPSBxcygnZXhwb3J0Jyk/XHJcbiAgY29uc29sZS5sb2cgXCJFeHBvcnQgRW5hYmxlZDogI3tleHBvcnRFbmFibGVkfVwiXHJcbiAgaWYgZXhwb3J0RW5hYmxlZFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cG9ydCcpLmlubmVySFRNTCA9IFwiXCJcIlxyXG4gICAgICA8aW5wdXQgY2xhc3M9XCJmc3ViXCIgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPVwiRXhwb3J0XCIgb25jbGljaz1cImV2ZW50LnByZXZlbnREZWZhdWx0KCk7IHNob3dFeHBvcnQoKTtcIiB0aXRsZT1cIkV4cG9ydCBsaXN0cyBpbnRvIGNsaWNrYWJsZSBwbGF5bGlzdHNcIj5cclxuICAgIFwiXCJcIlxyXG5cclxuICB1cGRhdGVTb2xvSUQocXMoJ3NvbG8nKSlcclxuXHJcbiAgcXNGaWx0ZXJzID0gcXMoJ2ZpbHRlcnMnKVxyXG4gIGlmIHFzRmlsdGVycz9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyc1wiKS52YWx1ZSA9IHFzRmlsdGVyc1xyXG5cclxuICBzb2xvTWlycm9yID0gcXMoJ21pcnJvcicpP1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWlycm9yXCIpLmNoZWNrZWQgPSBzb2xvTWlycm9yXHJcbiAgaWYgc29sb01pcnJvclxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnNlY3Rpb24nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlycm9ybm90ZScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuXHJcbiAgc29ja2V0Lm9uICdjb25uZWN0JywgLT5cclxuICAgIGlmIHNvbG9JRD9cclxuICAgICAgc29ja2V0LmVtaXQgJ3NvbG8nLCB7IGlkOiBzb2xvSUQgfVxyXG4gICAgICBzZW5kSWRlbnRpdHkoKVxyXG5cclxuICBzb2NrZXQub24gJ3NvbG8nLCAocGt0KSAtPlxyXG4gICAgc29sb0NvbW1hbmQocGt0KVxyXG5cclxuICBzb2NrZXQub24gJ2lkZW50aWZ5JywgKHBrdCkgLT5cclxuICAgIHJlY2VpdmVJZGVudGl0eShwa3QpXHJcblxyXG4gIHNvY2tldC5vbiAnb3BpbmlvbicsIChwa3QpIC0+XHJcbiAgICB1cGRhdGVPcGluaW9uKHBrdClcclxuXHJcbiAgc29ja2V0Lm9uICd1c2VycGxheWxpc3QnLCAocGt0KSAtPlxyXG4gICAgcmVjZWl2ZVVzZXJQbGF5bGlzdChwa3QpXHJcblxyXG4gIHByZXBhcmVDYXN0KClcclxuXHJcbiAgbmV3IENsaXBib2FyZCAnLnNoYXJlJywge1xyXG4gICAgdGV4dDogKHRyaWdnZXIpIC0+XHJcbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL1Blcm1hL2kpXHJcbiAgICAgICAgcmV0dXJuIGNhbGNQZXJtYSgpXHJcbiAgICAgIG1pcnJvciA9IGZhbHNlXHJcbiAgICAgIGlmIHRyaWdnZXIudmFsdWUubWF0Y2goL01pcnJvci9pKVxyXG4gICAgICAgIG1pcnJvciA9IHRydWVcclxuICAgICAgcmV0dXJuIGNhbGNTaGFyZVVSTChtaXJyb3IpXHJcbiAgfVxyXG5cclxuICBpZiBsYXVuY2hPcGVuXHJcbiAgICBzaG93V2F0Y2hGb3JtKClcclxuICBlbHNlXHJcbiAgICBzaG93V2F0Y2hMaW5rKClcclxuXHJcblxyXG5zZXRUaW1lb3V0IC0+XHJcbiAgIyBzb21laG93IHdlIG1pc3NlZCB0aGlzIGV2ZW50LCBqdXN0IGtpY2sgaXQgbWFudWFsbHlcclxuICBpZiBub3QgeW91dHViZVJlYWR5XHJcbiAgICBjb25zb2xlLmxvZyBcImtpY2tpbmcgWW91dHViZS4uLlwiXHJcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkoKVxyXG4sIDMwMDBcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIG9waW5pb25zOlxyXG4gICAgbG92ZTogdHJ1ZVxyXG4gICAgbGlrZTogdHJ1ZVxyXG4gICAgbWVoOiB0cnVlXHJcbiAgICBibGVoOiB0cnVlXHJcbiAgICBoYXRlOiB0cnVlXHJcblxyXG4gIGdvb2RPcGluaW9uczogIyBkb24ndCBza2lwIHRoZXNlXHJcbiAgICBsb3ZlOiB0cnVlXHJcbiAgICBsaWtlOiB0cnVlXHJcblxyXG4gIHdlYWtPcGluaW9uczogIyBza2lwIHRoZXNlIGlmIHdlIGFsbCBhZ3JlZVxyXG4gICAgbWVoOiB0cnVlXHJcblxyXG4gIGJhZE9waW5pb25zOiAjIHNraXAgdGhlc2VcclxuICAgIGJsZWg6IHRydWVcclxuICAgIGhhdGU6IHRydWVcclxuXHJcbiAgb3Bpbmlvbk9yZGVyOiBbJ2xvdmUnLCAnbGlrZScsICdtZWgnLCAnYmxlaCcsICdoYXRlJ10gIyBhbHdheXMgaW4gdGhpcyBzcGVjaWZpYyBvcmRlclxyXG4iLCJmaWx0ZXJEYXRhYmFzZSA9IG51bGxcclxuZmlsdGVyT3BpbmlvbnMgPSB7fVxyXG5cclxuZmlsdGVyU2VydmVyT3BpbmlvbnMgPSBudWxsXHJcbmZpbHRlckdldFVzZXJGcm9tTmlja25hbWUgPSBudWxsXHJcbmlzbzg2MDEgPSByZXF1aXJlICdpc284NjAxLWR1cmF0aW9uJ1xyXG5cclxubm93ID0gLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMClcclxuXHJcbnBhcnNlRHVyYXRpb24gPSAocykgLT5cclxuICByZXR1cm4gaXNvODYwMS50b1NlY29uZHMoaXNvODYwMS5wYXJzZShzKSlcclxuXHJcbnNldFNlcnZlckRhdGFiYXNlcyA9IChkYiwgb3BpbmlvbnMsIGdldFVzZXJGcm9tTmlja25hbWUpIC0+XHJcbiAgZmlsdGVyRGF0YWJhc2UgPSBkYlxyXG4gIGZpbHRlclNlcnZlck9waW5pb25zID0gb3BpbmlvbnNcclxuICBmaWx0ZXJHZXRVc2VyRnJvbU5pY2tuYW1lID0gZ2V0VXNlckZyb21OaWNrbmFtZVxyXG5cclxuZ2V0RGF0YSA9ICh1cmwpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxyXG4gICAgICAgIGlmIChAcmVhZHlTdGF0ZSA9PSA0KSBhbmQgKEBzdGF0dXMgPT0gMjAwKVxyXG4gICAgICAgICAgICMgVHlwaWNhbCBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIHJlYWR5OlxyXG4gICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgZW50cmllcyA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgcmVzb2x2ZShlbnRyaWVzKVxyXG4gICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgICByZXNvbHZlKG51bGwpXHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSlcclxuICAgIHhodHRwLnNlbmQoKVxyXG5cclxuY2FjaGVPcGluaW9ucyA9IChmaWx0ZXJVc2VyKSAtPlxyXG4gIGlmIG5vdCBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9cclxuICAgIGZpbHRlck9waW5pb25zW2ZpbHRlclVzZXJdID0gYXdhaXQgZ2V0RGF0YShcIi9pbmZvL29waW5pb25zP3VzZXI9I3tlbmNvZGVVUklDb21wb25lbnQoZmlsdGVyVXNlcil9XCIpXHJcbiAgICBpZiBub3QgZmlsdGVyT3BpbmlvbnNbZmlsdGVyVXNlcl0/XHJcbiAgICAgIHNvbG9GYXRhbEVycm9yKFwiQ2Fubm90IGdldCB1c2VyIG9waW5pb25zIGZvciAje2ZpbHRlclVzZXJ9XCIpXHJcblxyXG5nZW5lcmF0ZUxpc3QgPSAoZmlsdGVyU3RyaW5nLCBzb3J0QnlBcnRpc3QgPSBmYWxzZSkgLT5cclxuICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBpZiBmaWx0ZXJTdHJpbmc/IGFuZCAoZmlsdGVyU3RyaW5nLmxlbmd0aCA+IDApXHJcbiAgICBzb2xvRmlsdGVycyA9IFtdXHJcbiAgICByYXdGaWx0ZXJzID0gZmlsdGVyU3RyaW5nLnNwbGl0KC9cXHI/XFxuLylcclxuICAgIGZvciBmaWx0ZXIgaW4gcmF3RmlsdGVyc1xyXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXIudHJpbSgpXHJcbiAgICAgIGlmIGZpbHRlci5sZW5ndGggPiAwXHJcbiAgICAgICAgc29sb0ZpbHRlcnMucHVzaCBmaWx0ZXJcclxuICAgIGlmIHNvbG9GaWx0ZXJzLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgTm8gZmlsdGVyc1xyXG4gICAgICBzb2xvRmlsdGVycyA9IG51bGxcclxuICBjb25zb2xlLmxvZyBcIkZpbHRlcnM6XCIsIHNvbG9GaWx0ZXJzXHJcbiAgaWYgZmlsdGVyRGF0YWJhc2U/XHJcbiAgICBjb25zb2xlLmxvZyBcIlVzaW5nIGNhY2hlZCBkYXRhYmFzZS5cIlxyXG4gIGVsc2VcclxuICAgIGNvbnNvbGUubG9nIFwiRG93bmxvYWRpbmcgZGF0YWJhc2UuLi5cIlxyXG4gICAgZmlsdGVyRGF0YWJhc2UgPSBhd2FpdCBnZXREYXRhKFwiL2luZm8vcGxheWxpc3RcIilcclxuICAgIGlmIG5vdCBmaWx0ZXJEYXRhYmFzZT9cclxuICAgICAgcmV0dXJuIG51bGxcclxuXHJcbiAgc29sb1Vuc2h1ZmZsZWQgPSBbXVxyXG4gIGlmIHNvbG9GaWx0ZXJzP1xyXG4gICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgIGUuYWxsb3dlZCA9IGZhbHNlXHJcbiAgICAgIGUuc2tpcHBlZCA9IGZhbHNlXHJcblxyXG4gICAgYWxsQWxsb3dlZCA9IHRydWVcclxuICAgIGZvciBmaWx0ZXIgaW4gc29sb0ZpbHRlcnNcclxuICAgICAgcGllY2VzID0gZmlsdGVyLnNwbGl0KC8gKy8pXHJcbiAgICAgIGlmIHBpZWNlc1swXSA9PSBcInByaXZhdGVcIlxyXG4gICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBuZWdhdGVkID0gZmFsc2VcclxuICAgICAgcHJvcGVydHkgPSBcImFsbG93ZWRcIlxyXG4gICAgICBpZiBwaWVjZXNbMF0gPT0gXCJza2lwXCJcclxuICAgICAgICBwcm9wZXJ0eSA9IFwic2tpcHBlZFwiXHJcbiAgICAgICAgcGllY2VzLnNoaWZ0KClcclxuICAgICAgZWxzZSBpZiBwaWVjZXNbMF0gPT0gXCJhbmRcIlxyXG4gICAgICAgIHByb3BlcnR5ID0gXCJza2lwcGVkXCJcclxuICAgICAgICBuZWdhdGVkID0gIW5lZ2F0ZWRcclxuICAgICAgICBwaWVjZXMuc2hpZnQoKVxyXG4gICAgICBpZiBwaWVjZXMubGVuZ3RoID09IDBcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBwcm9wZXJ0eSA9PSBcImFsbG93ZWRcIlxyXG4gICAgICAgIGFsbEFsbG93ZWQgPSBmYWxzZVxyXG5cclxuICAgICAgc3Vic3RyaW5nID0gcGllY2VzLnNsaWNlKDEpLmpvaW4oXCIgXCIpXHJcbiAgICAgIGlkTG9va3VwID0gbnVsbFxyXG5cclxuICAgICAgaWYgbWF0Y2hlcyA9IHBpZWNlc1swXS5tYXRjaCgvXiEoLispJC8pXHJcbiAgICAgICAgbmVnYXRlZCA9ICFuZWdhdGVkXHJcbiAgICAgICAgcGllY2VzWzBdID0gbWF0Y2hlc1sxXVxyXG5cclxuICAgICAgY29tbWFuZCA9IHBpZWNlc1swXS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIHN3aXRjaCBjb21tYW5kXHJcbiAgICAgICAgd2hlbiAnYXJ0aXN0JywgJ2JhbmQnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLmFydGlzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICd0aXRsZScsICdzb25nJ1xyXG4gICAgICAgICAgc3Vic3RyaW5nID0gc3Vic3RyaW5nLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocykgIT0gLTFcclxuICAgICAgICB3aGVuICdhZGRlZCdcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5uaWNrbmFtZSA9PSBzXHJcbiAgICAgICAgd2hlbiAndW50YWdnZWQnXHJcbiAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IE9iamVjdC5rZXlzKGUudGFncykubGVuZ3RoID09IDBcclxuICAgICAgICB3aGVuICd0YWcnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBlLnRhZ3Nbc10gPT0gdHJ1ZVxyXG4gICAgICAgIHdoZW4gJ3JlY2VudCcsICdzaW5jZSdcclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwicGFyc2luZyAnI3tzdWJzdHJpbmd9J1wiXHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgZHVyYXRpb25JblNlY29uZHMgPSBwYXJzZUR1cmF0aW9uKHN1YnN0cmluZylcclxuICAgICAgICAgIGNhdGNoIHNvbWVFeGNlcHRpb25cclxuICAgICAgICAgICAgIyBzb2xvRmF0YWxFcnJvcihcIkNhbm5vdCBwYXJzZSBkdXJhdGlvbjogI3tzdWJzdHJpbmd9XCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gcGFyc2luZyBleGNlcHRpb246ICN7c29tZUV4Y2VwdGlvbn1cIlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiRHVyYXRpb24gWyN7c3Vic3RyaW5nfV0gLSAje2R1cmF0aW9uSW5TZWNvbmRzfVwiXHJcbiAgICAgICAgICBzaW5jZSA9IG5vdygpIC0gZHVyYXRpb25JblNlY29uZHNcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gZS5hZGRlZCA+IHNpbmNlXHJcbiAgICAgICAgd2hlbiAnbG92ZScsICdsaWtlJywgJ2JsZWgnLCAnaGF0ZSdcclxuICAgICAgICAgIGZpbHRlck9waW5pb24gPSBjb21tYW5kXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ25vbmUnXHJcbiAgICAgICAgICBmaWx0ZXJPcGluaW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICBmaWx0ZXJVc2VyID0gc3Vic3RyaW5nXHJcbiAgICAgICAgICBpZiBmaWx0ZXJTZXJ2ZXJPcGluaW9uc1xyXG4gICAgICAgICAgICBmaWx0ZXJVc2VyID0gZmlsdGVyR2V0VXNlckZyb21OaWNrbmFtZShmaWx0ZXJVc2VyKVxyXG4gICAgICAgICAgICBmaWx0ZXJGdW5jID0gKGUsIHMpIC0+IGZpbHRlclNlcnZlck9waW5pb25zW2UuaWRdP1tmaWx0ZXJVc2VyXSA9PSBmaWx0ZXJPcGluaW9uXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGF3YWl0IGNhY2hlT3BpbmlvbnMoZmlsdGVyVXNlcilcclxuICAgICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPiBmaWx0ZXJPcGluaW9uc1tmaWx0ZXJVc2VyXT9bZS5pZF0gPT0gZmlsdGVyT3BpbmlvblxyXG4gICAgICAgIHdoZW4gJ2Z1bGwnXHJcbiAgICAgICAgICBzdWJzdHJpbmcgPSBzdWJzdHJpbmcudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgZmlsdGVyRnVuYyA9IChlLCBzKSAtPlxyXG4gICAgICAgICAgICBmdWxsID0gZS5hcnRpc3QudG9Mb3dlckNhc2UoKSArIFwiIC0gXCIgKyBlLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgZnVsbC5pbmRleE9mKHMpICE9IC0xXHJcbiAgICAgICAgd2hlbiAnaWQnLCAnaWRzJ1xyXG4gICAgICAgICAgaWRMb29rdXAgPSB7fVxyXG4gICAgICAgICAgZm9yIGlkIGluIHBpZWNlcy5zbGljZSgxKVxyXG4gICAgICAgICAgICBpZiBpZC5tYXRjaCgvXiMvKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGlkTG9va3VwW2lkXSA9IHRydWVcclxuICAgICAgICAgIGZpbHRlckZ1bmMgPSAoZSwgcykgLT4gaWRMb29rdXBbZS5pZF1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIHNraXAgdGhpcyBmaWx0ZXJcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBpZiBpZExvb2t1cD9cclxuICAgICAgICBmb3IgaWQgb2YgaWRMb29rdXBcclxuICAgICAgICAgIGUgPSBmaWx0ZXJEYXRhYmFzZVtpZF1cclxuICAgICAgICAgIGlmIG5vdCBlP1xyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgaXNNYXRjaCA9IHRydWVcclxuICAgICAgICAgIGlmIG5lZ2F0ZWRcclxuICAgICAgICAgICAgaXNNYXRjaCA9ICFpc01hdGNoXHJcbiAgICAgICAgICBpZiBpc01hdGNoXHJcbiAgICAgICAgICAgIGVbcHJvcGVydHldID0gdHJ1ZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIGlkLCBlIG9mIGZpbHRlckRhdGFiYXNlXHJcbiAgICAgICAgICBpc01hdGNoID0gZmlsdGVyRnVuYyhlLCBzdWJzdHJpbmcpXHJcbiAgICAgICAgICBpZiBuZWdhdGVkXHJcbiAgICAgICAgICAgIGlzTWF0Y2ggPSAhaXNNYXRjaFxyXG4gICAgICAgICAgaWYgaXNNYXRjaFxyXG4gICAgICAgICAgICBlW3Byb3BlcnR5XSA9IHRydWVcclxuXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgaWYgKGUuYWxsb3dlZCBvciBhbGxBbGxvd2VkKSBhbmQgbm90IGUuc2tpcHBlZFxyXG4gICAgICAgIHNvbG9VbnNodWZmbGVkLnB1c2ggZVxyXG4gIGVsc2VcclxuICAgICMgUXVldWUgaXQgYWxsIHVwXHJcbiAgICBmb3IgaWQsIGUgb2YgZmlsdGVyRGF0YWJhc2VcclxuICAgICAgc29sb1Vuc2h1ZmZsZWQucHVzaCBlXHJcblxyXG4gIGlmIHNvcnRCeUFydGlzdFxyXG4gICAgc29sb1Vuc2h1ZmZsZWQuc29ydCAoYSwgYikgLT5cclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA8IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS5hcnRpc3QudG9Mb3dlckNhc2UoKSA+IGIuYXJ0aXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gMVxyXG4gICAgICBpZiBhLnRpdGxlLnRvTG93ZXJDYXNlKCkgPCBiLnRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICByZXR1cm4gLTFcclxuICAgICAgaWYgYS50aXRsZS50b0xvd2VyQ2FzZSgpID4gYi50aXRsZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgcmV0dXJuIDFcclxuICAgICAgcmV0dXJuIDBcclxuICByZXR1cm4gc29sb1Vuc2h1ZmZsZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBzZXRTZXJ2ZXJEYXRhYmFzZXM6IHNldFNlcnZlckRhdGFiYXNlc1xyXG4gIGdlbmVyYXRlTGlzdDogZ2VuZXJhdGVMaXN0XHJcbiJdfQ==
