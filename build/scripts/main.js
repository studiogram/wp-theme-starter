(function (factory) {
  typeof define === 'function' && define.amd ? define('main', factory) :
  factory();
})((function () { 'use strict';

  // Public: Create a new SelectorSet.
  function SelectorSet() {
    // Construct new SelectorSet if called as a function.
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    // Public: Number of selectors added to the set
    this.size = 0;

    // Internal: Incrementing ID counter
    this.uid = 0;

    // Internal: Array of String selectors in the set
    this.selectors = [];

    // Internal: Map of selector ids to objects
    this.selectorObjects = {};

    // Internal: All Object index String names mapping to Index objects.
    this.indexes = Object.create(this.indexes);

    // Internal: Used Object index String names mapping to Index objects.
    this.activeIndexes = [];
  }

  // Detect prefixed Element#matches function.
  var docElem = window.document.documentElement;
  var matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector;

  // Public: Check if element matches selector.
  //
  // Maybe overridden with custom Element.matches function.
  //
  // el       - An Element
  // selector - String CSS selector
  //
  // Returns true or false.
  SelectorSet.prototype.matchesSelector = function (el, selector) {
    return matches.call(el, selector);
  };

  // Public: Find all elements in the context that match the selector.
  //
  // Maybe overridden with custom querySelectorAll function.
  //
  // selectors - String CSS selectors.
  // context   - Element context
  //
  // Returns non-live list of Elements.
  SelectorSet.prototype.querySelectorAll = function (selectors, context) {
    return context.querySelectorAll(selectors);
  };

  // Public: Array of indexes.
  //
  // name     - Unique String name
  // selector - Function that takes a String selector and returns a String key
  //            or undefined if it can't be used by the index.
  // element  - Function that takes an Element and returns an Array of String
  //            keys that point to indexed values.
  //
  SelectorSet.prototype.indexes = [];

  // Index by element id
  var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'ID',
    selector: function matchIdSelector(sel) {
      var m;
      if (m = sel.match(idRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementId(el) {
      if (el.id) {
        return [el.id];
      }
    }
  });

  // Index by all of its class names
  var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'CLASS',
    selector: function matchClassSelector(sel) {
      var m;
      if (m = sel.match(classRe)) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      var className = el.className;
      if (className) {
        if (typeof className === 'string') {
          return className.split(/\s/);
        } else if (typeof className === 'object' && 'baseVal' in className) {
          // className is a SVGAnimatedString
          // global SVGAnimatedString is not an exposed global in Opera 12
          return className.baseVal.split(/\s/);
        }
      }
    }
  });

  // Index by tag/node name: `DIV`, `FORM`, `A`
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'TAG',
    selector: function matchTagSelector(sel) {
      var m;
      if (m = sel.match(tagRe)) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName.toUpperCase()];
    }
  });

  // Default index just contains a single array of elements.
  SelectorSet.prototype.indexes['default'] = {
    name: 'UNIVERSAL',
    selector: function () {
      return true;
    },
    element: function () {
      return [true];
    }
  };

  // Use ES Maps when supported
  var Map$1;
  if (typeof window.Map === 'function') {
    Map$1 = window.Map;
  } else {
    Map$1 = function () {
      function Map() {
        this.map = {};
      }
      Map.prototype.get = function (key) {
        return this.map[key + ' '];
      };
      Map.prototype.set = function (key, value) {
        this.map[key + ' '] = value;
      };
      return Map;
    }();
  }

  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Internal: Get indexes for selector.
  //
  // selector - String CSS selector
  //
  // Returns Array of {index, key}.
  function parseSelectorIndexes(allIndexes, selector) {
    allIndexes = allIndexes.slice(0).concat(allIndexes['default']);
    var allIndexesLen = allIndexes.length,
      i,
      j,
      m,
      dup,
      rest = selector,
      key,
      index,
      indexes = [];
    do {
      chunker.exec('');
      if (m = chunker.exec(rest)) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if (key = index.selector(m[1])) {
              j = indexes.length;
              dup = false;
              while (j--) {
                if (indexes[j].index === index && indexes[j].key === key) {
                  dup = true;
                  break;
                }
              }
              if (!dup) {
                indexes.push({
                  index: index,
                  key: key
                });
              }
              break;
            }
          }
        }
      }
    } while (m);
    return indexes;
  }

  // Internal: Find first item in Array that is a prototype of `proto`.
  //
  // ary   - Array of objects
  // proto - Prototype of expected item in `ary`
  //
  // Returns object from `ary` if found. Otherwise returns undefined.
  function findByPrototype(ary, proto) {
    var i, len, item;
    for (i = 0, len = ary.length; i < len; i++) {
      item = ary[i];
      if (proto.isPrototypeOf(item)) {
        return item;
      }
    }
  }

  // Public: Log when added selector falls under the default index.
  //
  // This API should not be considered stable. May change between
  // minor versions.
  //
  // obj - {selector, data} Object
  //
  //   SelectorSet.prototype.logDefaultIndexUsed = function(obj) {
  //     console.warn(obj.selector, "could not be indexed");
  //   };
  //
  // Returns nothing.
  SelectorSet.prototype.logDefaultIndexUsed = function () {};

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function (selector, data) {
    var obj,
      i,
      indexProto,
      key,
      index,
      objs,
      selectorIndexes,
      selectorIndex,
      indexes = this.activeIndexes,
      selectors = this.selectors,
      selectorObjects = this.selectorObjects;
    if (typeof selector !== 'string') {
      return;
    }
    obj = {
      id: this.uid++,
      selector: selector,
      data: data
    };
    selectorObjects[obj.id] = obj;
    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      indexProto = selectorIndex.index;
      index = findByPrototype(indexes, indexProto);
      if (!index) {
        index = Object.create(indexProto);
        index.map = new Map$1();
        indexes.push(index);
      }
      if (indexProto === this.indexes['default']) {
        this.logDefaultIndexUsed(obj);
      }
      objs = index.map.get(key);
      if (!objs) {
        objs = [];
        index.map.set(key, objs);
      }
      objs.push(obj);
    }
    this.size++;
    selectors.push(selector);
  };

  // Public: Remove selector from set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.remove = function (selector, data) {
    if (typeof selector !== 'string') {
      return;
    }
    var selectorIndexes,
      selectorIndex,
      i,
      j,
      k,
      selIndex,
      objs,
      obj,
      indexes = this.activeIndexes,
      selectors = this.selectors = [],
      selectorObjects = this.selectorObjects,
      removedIds = {},
      removeAll = arguments.length === 1;
    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      j = indexes.length;
      while (j--) {
        selIndex = indexes[j];
        if (selectorIndex.index.isPrototypeOf(selIndex)) {
          objs = selIndex.map.get(selectorIndex.key);
          if (objs) {
            k = objs.length;
            while (k--) {
              obj = objs[k];
              if (obj.selector === selector && (removeAll || obj.data === data)) {
                objs.splice(k, 1);
                removedIds[obj.id] = true;
              }
            }
          }
          break;
        }
      }
    }
    for (i in removedIds) {
      delete selectorObjects[i];
      this.size--;
    }
    for (i in selectorObjects) {
      selectors.push(selectorObjects[i].selector);
    }
  };

  // Sort by id property handler.
  //
  // a - Selector obj.
  // b - Selector obj.
  //
  // Returns Number.
  function sortById(a, b) {
    return a.id - b.id;
  }

  // Public: Find all matching decendants of the context element.
  //
  // context - An Element
  //
  // Returns Array of {selector, data, elements} matches.
  SelectorSet.prototype.queryAll = function (context) {
    if (!this.selectors.length) {
      return [];
    }
    var matches = {},
      results = [];
    var els = this.querySelectorAll(this.selectors.join(', '), context);
    var i, j, len, len2, el, m, match, obj;
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      m = this.matches(el);
      for (j = 0, len2 = m.length; j < len2; j++) {
        obj = m[j];
        if (!matches[obj.id]) {
          match = {
            id: obj.id,
            selector: obj.selector,
            data: obj.data,
            elements: []
          };
          matches[obj.id] = match;
          results.push(match);
        } else {
          match = matches[obj.id];
        }
        match.elements.push(el);
      }
    }
    return results.sort(sortById);
  };

  // Public: Match element against all selectors in set.
  //
  // el - An Element
  //
  // Returns Array of {selector, data} matches.
  SelectorSet.prototype.matches = function (el) {
    if (!el) {
      return [];
    }
    var i, j, k, len, len2, len3, index, keys, objs, obj, id;
    var indexes = this.activeIndexes,
      matchedIds = {},
      matches = [];
    for (i = 0, len = indexes.length; i < len; i++) {
      index = indexes[i];
      keys = index.element(el);
      if (keys) {
        for (j = 0, len2 = keys.length; j < len2; j++) {
          if (objs = index.map.get(keys[j])) {
            for (k = 0, len3 = objs.length; k < len3; k++) {
              obj = objs[k];
              id = obj.id;
              if (!matchedIds[id] && this.matchesSelector(el, obj.selector)) {
                matchedIds[id] = true;
                matches.push(obj);
              }
            }
          }
        }
      }
    }
    return matches.sort(sortById);
  };

  /**
   * Holds the SelectorSets for each event type
   * @type {{}}
   */
  const eventTypes = {};

  /**
   * Holds Bus event stacks
   * @type {{}}
   */
  const listeners = {};

  /**
   * Events that don't bubble
   * @type {string[]}
   */
  const nonBubblers = ['mouseenter', 'mouseleave', 'pointerenter', 'pointerleave', 'blur', 'focus'];

  /**
   * Make a bus stack if not already created.
   *
   * @param {string} event
   */
  function makeBusStack(event) {
    if (listeners[event] === undefined) {
      listeners[event] = new Set();
    }
  }

  /**
   * Trigger a bus stack.
   *
   * @param {string} event
   * @param args
   */
  function triggerBus(event, args) {
    if (listeners[event]) {
      listeners[event].forEach(cb => {
        cb(...args);
      });
    }
  }

  /**
   * Maybe run querySelectorAll if input is a string.
   *
   * @param {HTMLElement|Element|string} el
   * @returns {NodeListOf<Element>}
   */
  function maybeRunQuerySelector(el) {
    return typeof el === 'string' ? document.querySelectorAll(el) : el;
  }

  /**
   * Handle delegated events
   *
   * @param {Event} e
   */
  function handleDelegation(e) {
    let matches = traverse(eventTypes[e.type], e.target);
    if (matches.length) {
      for (let i = 0; i < matches.length; i++) {
        for (let i2 = 0; i2 < matches[i].stack.length; i2++) {
          if (nonBubblers.indexOf(e.type) !== -1) {
            addDelegateTarget(e, matches[i].delegatedTarget);
            if (e.target === matches[i].delegatedTarget) {
              matches[i].stack[i2].data(e);
            }
          } else {
            addDelegateTarget(e, matches[i].delegatedTarget);
            matches[i].stack[i2].data(e);
          }
        }
      }
    }
  }

  /**
   * Find a matching selector for delegation
   *
   * @param {SelectorSet} listeners
   * @param {HTMLElement|Element|EventTarget} target
   * @returns {[]}
   */
  function traverse(listeners, target) {
    const queue = [];
    let node = target;
    do {
      if (node.nodeType !== 1) {
        break;
      }
      const matches = listeners.matches(node);
      if (matches.length) {
        queue.push({
          delegatedTarget: node,
          stack: matches
        });
      }
    } while (node = node.parentElement);
    return queue;
  }

  /**
   * Add delegatedTarget attribute to dispatched delegated events
   *
   * @param {Event} event
   * @param {HTMLElement|Element} delegatedTarget
   */
  function addDelegateTarget(event, delegatedTarget) {
    Object.defineProperty(event, 'currentTarget', {
      configurable: true,
      enumerable: true,
      get: () => delegatedTarget
    });
  }

  /**
   * Creates a deep clone of an object.
   *
   * @param object
   * @returns {Object.<string, array>}
   */
  function clone(object) {
    const copy = {};
    for (const key in object) {
      copy[key] = [...object[key]];
    }
    return copy;
  }

  /**
   * Public API
   */
  class E {
    /**
     * Binds all provided methods to a provided context.
     *
     * @param {object} context
     * @param {string[]} [methods] Optional.
     */
    bindAll(context, methods) {
      if (!methods) {
        methods = Object.getOwnPropertyNames(Object.getPrototypeOf(context));
      }
      for (let i = 0; i < methods.length; i++) {
        context[methods[i]] = context[methods[i]].bind(context);
      }
    }

    /**
     * Bind event to a string, NodeList, or element.
     *
     * @param {string} event
     * @param {string|NodeList|NodeListOf<Element>|HTMLElement|HTMLElement[]|Window|Document|function} el
     * @param {*} [callback]
     * @param {{}|boolean} [options]
     */
    on(event, el, callback, options) {
      const events = event.split(' ');
      for (let i = 0; i < events.length; i++) {
        if (typeof el === 'function' && callback === undefined) {
          makeBusStack(events[i]);
          listeners[events[i]].add(el);
          continue;
        }
        if (el.nodeType && el.nodeType === 1 || el === window || el === document) {
          el.addEventListener(events[i], callback, options);
          continue;
        }
        el = maybeRunQuerySelector(el);
        for (let n = 0; n < el.length; n++) {
          el[n].addEventListener(events[i], callback, options);
        }
      }
    }

    /**
     * Add a delegated event.
     *
     * @param {string} event
     * @param {string|NodeList|HTMLElement|Element} delegate
     * @param {*} [callback]
     */
    delegate(event, delegate, callback) {
      const events = event.split(' ');
      for (let i = 0; i < events.length; i++) {
        let map = eventTypes[events[i]];
        if (map === undefined) {
          map = new SelectorSet();
          eventTypes[events[i]] = map;
          if (nonBubblers.indexOf(events[i]) !== -1) {
            document.addEventListener(events[i], handleDelegation, true);
          } else {
            document.addEventListener(events[i], handleDelegation);
          }
        }
        map.add(delegate, callback);
      }
    }

    /**
     * Remove a callback from a DOM element, or one or all Bus events.
     *
     * @param {string} event
     * @param {string|NodeList|HTMLElement|Element|Window|undefined} [el]
     * @param {*} [callback]
     * @param {{}|boolean} [options]
     */
    off(event, el, callback, options) {
      const events = event.split(' ');
      for (let i = 0; i < events.length; i++) {
        if (el === undefined) {
          listeners[events[i]]?.clear();
          continue;
        }
        if (typeof el === 'function') {
          makeBusStack(events[i]);
          listeners[events[i]].delete(el);
          continue;
        }
        const map = eventTypes[events[i]];
        if (map !== undefined) {
          map.remove(el, callback);
          if (map.size === 0) {
            delete eventTypes[events[i]];
            if (nonBubblers.indexOf(events[i]) !== -1) {
              document.removeEventListener(events[i], handleDelegation, true);
            } else {
              document.removeEventListener(events[i], handleDelegation);
            }
            continue;
          }
        }
        if (el.removeEventListener !== undefined) {
          el.removeEventListener(events[i], callback, options);
          continue;
        }
        el = maybeRunQuerySelector(el);
        for (let n = 0; n < el.length; n++) {
          el[n].removeEventListener(events[i], callback, options);
        }
      }
    }

    /**
     * Emit a Bus event.
     *
     * @param {string} event
     * @param {...*} args
     */
    emit(event, ...args) {
      triggerBus(event, args);
    }

    /**
     * Return a clone of the delegated event stack for debugging.
     *
     * @returns {Object.<string, array>}
     */
    debugDelegated() {
      return JSON.parse(JSON.stringify(eventTypes));
    }

    /**
     * Return a clone of the bus event stack for debugging.
     *
     * @returns {Object.<string, array>}
     */
    debugBus() {
      return clone(listeners);
    }

    /**
     * Checks if a given bus event has listeners.
     *
     * @param {string} event
     * @returns {boolean}
     */
    hasBus(event) {
      return this.debugBus().hasOwnProperty(event);
    }
  }
  const instance = new E();

  const parser = new DOMParser();

  /**
   * Parse a HTML string into a proper Document.
   *
   * @param {string|Document} html
   * @return {Document|*}
   */
  function parseDom(html) {
    return typeof html === 'string' ? parser.parseFromString(html, 'text/html') : html;
  }

  /**
   * Extract details from a given URL string. Assumed to be on the current TLD.
   *
   * @param {string} url
   * @return {{raw: string, href: string, host: string, search: string, hasHash: boolean, pathname: string}}
   */
  function processUrl(url) {
    const details = new URL(url, window.location.origin);
    const normalized = details.hash.length ? url.replace(details.hash, '') : null;
    return {
      hasHash: details.hash.length > 0,
      pathname: details.pathname.replace(/\/+$/, ''),
      host: details.host,
      search: details.search,
      raw: url,
      href: normalized || details.href
    };
  }

  /**
   * Reloads a provided script/stylesheet by replacing with itself.
   *
   * @param {HTMLElement|HTMLScriptElement|HTMLStyleElement} node
   * @param {string} elementType - 'SCRIPT' or 'STYLE'
   */
  function reloadElement(node, elementType) {
    node.parentNode.replaceChild(duplicateElement(node, elementType), node);
  }

  /**
   * Loads a provided script/stylesheet by appending a clone to the current document.
   *
   * @param {HTMLElement|HTMLStyleElement} node
   * @param {string} elementType - 'SCRIPT' or 'STYLE'
   */
  function appendElement(node, elementType) {
    const target = node.parentNode.tagName === 'HEAD' ? document.head : document.body;
    target.appendChild(duplicateElement(node, elementType));
  }

  /**
   * Creates a clone of a given HTMLElement or HTMLStyleElement
   *
   * @param {HTMLElement|HTMLStyleElement} node
   * @param {string} elementType - 'SCRIPT' or 'STYLE'
   * @return {HTMLElement|HTMLStyleElement}
   */
  function duplicateElement(node, elementType) {
    const replacement = document.createElement(elementType);
    for (let k = 0; k < node.attributes.length; k++) {
      const attr = node.attributes[k];
      replacement.setAttribute(attr.nodeName, attr.nodeValue);
    }

    // Inline Script or Style
    if (node.innerHTML) {
      replacement.innerHTML = node.innerHTML;
    }
    return replacement;
  }

  class Transition {
    /**
     * @param {{wrapper: HTMLElement}} props
     */
    constructor({
      wrapper
    }) {
      this.wrapper = wrapper;
    }

    /**
     * @param {{ from: HTMLElement|Element, trigger: string|HTMLElement|false }} props
     * @return {Promise<void>}
     */
    leave(props) {
      return new Promise(resolve => {
        this.onLeave({
          ...props,
          done: resolve
        });
      });
    }

    /**
     * @param {{ to: HTMLElement|Element, trigger: string|HTMLElement|false }} props
     * @return {Promise<void>}
     */
    enter(props) {
      return new Promise(resolve => {
        this.onEnter({
          ...props,
          done: resolve
        });
      });
    }

    /**
     * Handle the transition leaving the previous page.
     * @param {{from: HTMLElement|Element, trigger: string|HTMLElement|false, done: function}} props
     */
    onLeave({
      from,
      trigger,
      done
    }) {
      done();
    }

    /**
     * Handle the transition entering the next page.
     * @param {{to: HTMLElement|Element, trigger: string|HTMLElement|false, done: function}} props
     */
    onEnter({
      to,
      trigger,
      done
    }) {
      done();
    }
  }

  class Renderer {
    /**
     * @param {{content: HTMLElement|Element, page: Document|Node, title: string, wrapper: Element}} props
     */
    constructor({
      content,
      page,
      title,
      wrapper
    }) {
      this._contentString = content.outerHTML;
      this._DOM = null;
      this.page = page;
      this.title = title;
      this.wrapper = wrapper;
      this.content = this.wrapper.lastElementChild;
    }
    onEnter() {}
    onEnterCompleted() {}
    onLeave() {}
    onLeaveCompleted() {}
    initialLoad() {
      this.onEnter();
      this.onEnterCompleted();
    }
    update() {
      document.title = this.title;
      this.wrapper.appendChild(this._DOM.firstElementChild);
      this.content = this.wrapper.lastElementChild;
      this._DOM = null;
    }
    createDom() {
      if (!this._DOM) {
        this._DOM = document.createElement('div');
        this._DOM.innerHTML = this._contentString;
      }
    }
    remove() {
      this.wrapper.firstElementChild.remove();
    }

    /**
     * Called when transitioning into the current page.
     * @param {Transition} transition
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<null>}
     */
    enter(transition, trigger) {
      return new Promise(resolve => {
        this.onEnter();
        transition.enter({
          trigger,
          to: this.content
        }).then(() => {
          this.onEnterCompleted();
          resolve();
        });
      });
    }

    /**
     * Called when transitioning away from the current page.
     * @param {Transition} transition
     * @param {string|HTMLElement|false} trigger
     * @param {boolean} removeOldContent
     * @return {Promise<null>}
     */
    leave(transition, trigger, removeOldContent) {
      return new Promise(resolve => {
        this.onLeave();
        transition.leave({
          trigger,
          from: this.content
        }).then(() => {
          if (removeOldContent) {
            this.remove();
          }
          this.onLeaveCompleted();
          resolve();
        });
      });
    }
  }

  class RouteStore {
    /**
     * @type {Map<string, Map<string, string>>}
     */
    data = new Map();

    /**
     * @type {Map<string, RegExp>}
     */
    regexCache = new Map();

    /**
     *
     * @param {string} fromPattern
     * @param {string} toPattern
     * @param {string} transition
     */
    add(fromPattern, toPattern, transition) {
      if (!this.data.has(fromPattern)) {
        this.data.set(fromPattern, new Map());
        this.regexCache.set(fromPattern, new RegExp(`^${fromPattern}$`));
      }
      this.data.get(fromPattern).set(toPattern, transition);
      this.regexCache.set(toPattern, new RegExp(`^${toPattern}$`));
    }

    /**
     *
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} currentUrl
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} nextUrl
     * @return {string|null}
     */
    findMatch(currentUrl, nextUrl) {
      // Loop through all from patterns
      for (const [fromPattern, potentialMatches] of this.data) {
        // If we have a match
        if (currentUrl.pathname.match(this.regexCache.get(fromPattern))) {
          // loop through all associated to patterns
          for (const [toPattern, transition] of potentialMatches) {
            // If we find a match, return it
            if (nextUrl.pathname.match(this.regexCache.get(toPattern))) {
              return transition;
            }
          }
          break;
        }
      }
      return null;
    }
  }

  const IN_PROGRESS = 'A transition is currently in progress';

  /**
   * @typedef CacheEntry
   * @type {object}
   * @property {typeof Renderer|Renderer} renderer
   * @property {Document|Node} page
   * @property {array} scripts
   * @property {HTMLLinkElement[]} styles
   * @property {string} finalUrl
   * @property {boolean} skipCache
   * @property {string} title
   * @property {HTMLElement|Element} content
   */

  class Core {
    isTransitioning = false;

    /**
     * @type {CacheEntry|null}
     */
    currentCacheEntry = null;

    /**
     * @type {Map<string, CacheEntry>}
     */
    cache = new Map();

    /**
     * @private
     * @type {Map<string, Promise>}
     */
    activePromises = new Map();

    /**
     * @param {{
     * 		links?: string,
     * 		removeOldContent?: boolean,
     * 		allowInterruption?: boolean,
     * 		bypassCache?: boolean,
     * 		enablePrefetch?: boolean,
     * 		renderers?: Object.<string, typeof Renderer>,
     * 		transitions?: Object.<string, typeof Transition>,
     * 		reloadJsFilter?: boolean|function(HTMLElement): boolean,
     * 		reloadCssFilter?: boolean|function(HTMLLinkElement): boolean
     * }} parameters
     */
    constructor(parameters = {}) {
      const {
        links = 'a[href]:not([target]):not([href^=\\#]):not([data-taxi-ignore])',
        removeOldContent = true,
        allowInterruption = false,
        bypassCache = false,
        enablePrefetch = true,
        renderers = {
          default: Renderer
        },
        transitions = {
          default: Transition
        },
        reloadJsFilter = element => element.dataset.taxiReload !== undefined,
        reloadCssFilter = element => true //element.dataset.taxiReload !== undefined
      } = parameters;
      this.renderers = renderers;
      this.transitions = transitions;
      this.defaultRenderer = this.renderers.default || Renderer;
      this.defaultTransition = this.transitions.default || Transition;
      this.wrapper = document.querySelector('[data-taxi]');
      this.reloadJsFilter = reloadJsFilter;
      this.reloadCssFilter = reloadCssFilter;
      this.removeOldContent = removeOldContent;
      this.allowInterruption = allowInterruption;
      this.bypassCache = bypassCache;
      this.enablePrefetch = enablePrefetch;
      this.cache = new Map();
      this.isPopping = false;

      // Add delegated link events
      this.attachEvents(links);
      this.currentLocation = processUrl(window.location.href);

      // as this is the initial page load, prime this page into the cache
      this.cache.set(this.currentLocation.href, this.createCacheEntry(document.cloneNode(true), window.location.href));

      // fire the current Renderer enter methods
      this.currentCacheEntry = this.cache.get(this.currentLocation.href);
      this.currentCacheEntry.renderer.initialLoad();
    }

    /**
     * @param {string} renderer
     */
    setDefaultRenderer(renderer) {
      this.defaultRenderer = this.renderers[renderer];
    }

    /**
     * @param {string} transition
     */
    setDefaultTransition(transition) {
      this.defaultTransition = this.transitions[transition];
    }

    /**
     * Registers a route into the RouteStore
     *
     * @param {string} fromPattern
     * @param {string} toPattern
     * @param {string} transition
     */
    addRoute(fromPattern, toPattern, transition) {
      if (!this.router) {
        this.router = new RouteStore();
      }
      this.router.add(fromPattern, toPattern, transition);
    }

    /**
     * Prime the cache for a given URL
     *
     * @param {string} url
     * @param {boolean} [preloadAssets]
     * @return {Promise}
     */
    preload(url, preloadAssets = false) {
      // convert relative URLs to absolute
      url = processUrl(url).href;
      if (!this.cache.has(url)) {
        return this.fetch(url, false).then(async response => {
          this.cache.set(url, this.createCacheEntry(response.html, response.url));
          if (preloadAssets) {
            this.cache.get(url).renderer.createDom();
          }
        }).catch(err => console.warn(err));
      }
      return Promise.resolve();
    }

    /**
     * Updates the HTML cache for a given URL.
     * If no URL is passed, then cache for the current page is updated.
     * Useful when adding/removing content via AJAX such as a search page or infinite loader.
     *
     * @param {string} [url]
     */
    updateCache(url) {
      const key = processUrl(url || window.location.href).href;
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }
      this.cache.set(key, this.createCacheEntry(document.cloneNode(true), key));
    }

    /**
     * Clears the cache for a given URL.
     * If no URL is passed, then cache for the current page is cleared.
     *
     * @param {string} [url]
     */
    clearCache(url) {
      const key = processUrl(url || window.location.href).href;
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }
    }

    /**
     * @param {string} url
     * @param {string|false} [transition]
     * @param {string|false|HTMLElement} [trigger]
     * @return {Promise<void|Error>}
     */
    navigateTo(url, transition = false, trigger = false) {
      return new Promise((resolve, reject) => {
        // Don't allow multiple navigations to occur at once
        if (!this.allowInterruption && this.isTransitioning) {
          reject(new Error(IN_PROGRESS));
          return;
        }
        this.isTransitioning = true;
        this.isPopping = true;
        this.targetLocation = processUrl(url);
        this.popTarget = window.location.href;
        const TransitionClass = new (this.chooseTransition(transition))({
          wrapper: this.wrapper
        });
        let navigationPromise;
        if (this.bypassCache || !this.cache.has(this.targetLocation.href) || this.cache.get(this.targetLocation.href).skipCache) {
          const fetched = this.fetch(this.targetLocation.href).then(response => {
            this.cache.set(this.targetLocation.href, this.createCacheEntry(response.html, response.url));
            this.cache.get(this.targetLocation.href).renderer.createDom();
          }).catch(err => {
            // we encountered a 4** or 5** error, redirect to the requested URL
            window.location.href = url;
          });
          navigationPromise = this.beforeFetch(this.targetLocation, TransitionClass, trigger).then(async () => {
            return fetched.then(async () => {
              return await this.afterFetch(this.targetLocation, TransitionClass, this.cache.get(this.targetLocation.href), trigger);
            });
          });
        } else {
          this.cache.get(this.targetLocation.href).renderer.createDom();
          navigationPromise = this.beforeFetch(this.targetLocation, TransitionClass, trigger).then(async () => {
            return await this.afterFetch(this.targetLocation, TransitionClass, this.cache.get(this.targetLocation.href), trigger);
          });
        }
        navigationPromise.then(() => {
          resolve();
        });
      });
    }

    /**
     * Add an event listener.
     * @param {string} event
     * @param {any} callback
     */
    on(event, callback) {
      instance.on(event, callback);
    }

    /**
     * Remove an event listener.
     * @param {string} event
     * @param {any} [callback]
     */
    off(event, callback) {
      instance.off(event, callback);
    }

    /**
     * @private
     * @param {{ raw: string, href: string, hasHash: boolean, pathname: string }} url
     * @param {Transition} TransitionClass
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<void>}
     */
    beforeFetch(url, TransitionClass, trigger) {
      instance.emit('NAVIGATE_OUT', {
        from: this.currentCacheEntry,
        trigger
      });
      return new Promise(resolve => {
        this.currentCacheEntry.renderer.leave(TransitionClass, trigger, this.removeOldContent).then(() => {
          if (trigger !== 'popstate') {
            window.history.pushState({}, '', url.raw);
          }
          resolve();
        });
      });
    }

    /**
     * @private
     * @param {{ raw: string, href: string, host: string, hasHash: boolean, pathname: string }} url
     * @param {Transition} TransitionClass
     * @param {CacheEntry} entry
     * @param {string|HTMLElement|false} trigger
     * @return {Promise<void>}
     */
    afterFetch(url, TransitionClass, entry, trigger) {
      this.currentLocation = url;
      this.popTarget = this.currentLocation.href;
      return new Promise(resolve => {
        entry.renderer.update();
        instance.emit('NAVIGATE_IN', {
          from: this.currentCacheEntry,
          to: entry,
          trigger
        });
        if (this.reloadJsFilter) {
          this.loadScripts(entry.scripts);
        }
        if (this.reloadCssFilter) {
          this.loadStyles(entry.styles);
        }

        // If the fetched url had a redirect chain, then replace the history to reflect the final resolved URL
        if (trigger !== 'popstate' && url.href !== entry.finalUrl) {
          window.history.replaceState({}, '', entry.finalUrl);
        }
        entry.renderer.enter(TransitionClass, trigger).then(() => {
          instance.emit('NAVIGATE_END', {
            from: this.currentCacheEntry,
            to: entry,
            trigger
          });
          this.currentCacheEntry = entry;
          this.isTransitioning = false;
          this.isPopping = false;
          resolve();
        });
      });
    }

    /**
     * Load up scripts from the target page if needed
     *
     * @param {HTMLElement[]} cachedScripts
     */
    loadScripts(cachedScripts) {
      const newScripts = [...cachedScripts];
      const currentScripts = Array.from(document.querySelectorAll('script')).filter(this.reloadJsFilter);

      // loop through all new scripts
      for (let i = 0; i < currentScripts.length; i++) {
        for (let n = 0; n < newScripts.length; n++) {
          if (currentScripts[i].outerHTML === newScripts[n].outerHTML) {
            reloadElement(currentScripts[i], 'SCRIPT');
            newScripts.splice(n, 1);
            break;
          }
        }
      }
      for (const script of newScripts) {
        appendElement(script, 'SCRIPT');
      }
    }

    /**
     * Load up styles from the target page if needed
     *
     * @param {Array<HTMLLinkElement|HTMLStyleElement>} cachedStyles
     */
    loadStyles(cachedStyles) {
      const currentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(this.reloadCssFilter);
      const currentInlineStyles = Array.from(document.querySelectorAll('style')).filter(this.reloadCssFilter);
      const newInlineStyles = cachedStyles.filter(el => {
        // no el.href, assume it's an inline style
        if (!el.href) {
          return true;
        } else if (!currentStyles.find(link => link.href === el.href)) {
          document.body.append(el);
          return false;
        }
      });

      // loop through all new inline styles
      for (let i = 0; i < currentInlineStyles.length; i++) {
        for (let n = 0; n < newInlineStyles.length; n++) {
          if (currentInlineStyles[i].outerHTML === newInlineStyles[n].outerHTML) {
            reloadElement(currentInlineStyles[i], 'STYLE');
            newInlineStyles.splice(n, 1);
            break;
          }
        }
      }
      for (const style of newInlineStyles) {
        appendElement(style, 'STYLE');
      }
    }

    /**
     * @private
     * @param {string} links
     */
    attachEvents(links) {
      instance.delegate('click', links, this.onClick);
      instance.on('popstate', window, this.onPopstate);
      if (this.enablePrefetch) {
        instance.delegate('mouseenter focus', links, this.onPrefetch);
      }
    }

    /**
     * @private
     * @param {MouseEvent} e
     */
    onClick = e => {
      if (!(e.metaKey || e.ctrlKey)) {
        const target = processUrl(e.currentTarget.href);
        this.currentLocation = processUrl(window.location.href);
        if (this.currentLocation.host !== target.host) {
          return;
        }

        // the target is a new URL, or is removing the hash from the current URL
        if (this.currentLocation.href !== target.href || this.currentLocation.hasHash && !target.hasHash) {
          e.preventDefault();
          // noinspection JSIgnoredPromiseFromCall
          this.navigateTo(target.raw, e.currentTarget.dataset.transition || false, e.currentTarget).catch(err => console.warn(err));
          return;
        }

        // a click to the current URL was detected
        if (!this.currentLocation.hasHash && !target.hasHash) {
          e.preventDefault();
        }
      }
    };

    /**
     * @private
     * @return {void|boolean}
     */
    onPopstate = () => {
      const target = processUrl(window.location.href);

      // don't trigger for on-page anchors
      if (target.pathname === this.currentLocation.pathname && target.search === this.currentLocation.search && !this.isPopping) {
        return false;
      }
      if (!this.allowInterruption && (this.isTransitioning || this.isPopping)) {
        // overwrite history state with current page if currently navigating
        window.history.pushState({}, '', this.popTarget);
        console.warn(IN_PROGRESS);
        return false;
      }
      if (!this.isPopping) {
        this.popTarget = window.location.href;
      }
      this.isPopping = true;

      // noinspection JSIgnoredPromiseFromCall
      this.navigateTo(window.location.href, false, 'popstate');
    };

    /**
     * @private
     * @param {MouseEvent} e
     */
    onPrefetch = e => {
      const target = processUrl(e.currentTarget.href);
      if (this.currentLocation.host !== target.host) {
        return;
      }
      this.preload(e.currentTarget.href, false);
    };

    /**
     * @private
     * @param {string} url
     * @param {boolean} [runFallback]
     * @return {Promise<{html: Document, url: string}>}
     */
    fetch(url, runFallback = true) {
      // If Taxi is currently performing a fetch for the given URL, return that instead of starting a new request
      if (this.activePromises.has(url)) {
        return this.activePromises.get(url);
      }
      const request = new Promise((resolve, reject) => {
        let resolvedUrl;
        fetch(url, {
          mode: 'same-origin',
          method: 'GET',
          headers: {
            'X-Requested-With': 'Taxi'
          },
          credentials: 'same-origin'
        }).then(response => {
          if (!response.ok) {
            reject('Taxi encountered a non 2xx HTTP status code');
            if (runFallback) {
              window.location.href = url;
            }
          }
          resolvedUrl = response.url;
          return response.text();
        }).then(htmlString => {
          resolve({
            html: parseDom(htmlString),
            url: resolvedUrl
          });
        }).catch(err => {
          reject(err);
          if (runFallback) {
            window.location.href = url;
          }
        }).finally(() => {
          this.activePromises.delete(url);
        });
      });
      this.activePromises.set(url, request);
      return request;
    }

    /**
     * @private
     * @param {string|false} transition
     * @return {Transition|function}
     */
    chooseTransition(transition) {
      if (transition) {
        return this.transitions[transition];
      }
      const routeTransition = this.router?.findMatch(this.currentLocation, this.targetLocation);
      if (routeTransition) {
        return this.transitions[routeTransition];
      }
      return this.defaultTransition;
    }

    /**
     * @private
     * @param {Document|Node} page
     * @param {string} url
     * @return {CacheEntry}
     */
    createCacheEntry(page, url) {
      const content = page.querySelector('[data-taxi-view]');
      const Renderer = content.dataset.taxiView.length ? this.renderers[content.dataset.taxiView] : this.defaultRenderer;
      if (!Renderer) {
        console.warn(`The Renderer "${content.dataset.taxiView}" was set in the data-taxi-view of the requested page, but not registered in Taxi.`);
      }
      return {
        page,
        content,
        finalUrl: url,
        skipCache: content.hasAttribute('data-taxi-nocache'),
        scripts: this.reloadJsFilter ? Array.from(page.querySelectorAll('script')).filter(this.reloadJsFilter) : [],
        styles: this.reloadCssFilter ? Array.from(page.querySelectorAll('link[rel="stylesheet"], style')).filter(this.reloadCssFilter) : [],
        title: page.title,
        renderer: new Renderer({
          wrapper: this.wrapper,
          title: page.title,
          content,
          page
        })
      };
    }
  }

  class Page extends Renderer {
    initialLoad() {
      this.onEnter();
      this.onEnterCompleted();
    }
    onEnter() {
      this.views = [];
      this.elements();
      this.events();
    }
    elements() {}
    events() {}
    onEnterCompleted() {
      console.log('default onEnterCompleted');
    }
    onLeave() {
      console.log('default onLeave');
    }
    onLeaveCompleted() {
      console.log('default onLeaveCompleted');
    }
  }

  class Loader extends Transition {
    /**
     * Handle the transition leaving the previous page.
     * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
     */
    onLeave({
      from,
      trigger,
      done
    }) {
      console.log('leave transition');
      done();
    }

    /**
     * Handle the transition entering the next page.
     * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
     */
    onEnter({
      to,
      trigger,
      done
    }) {
      console.log('enter transition');
      done();
    }
  }

  class Special extends Transition {
    /**
     * Handle the transition leaving the previous page.
     * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
     */
    onLeave({
      from,
      trigger,
      done
    }) {
      console.log('special leave transition');
      done();
    }

    /**
     * Handle the transition entering the next page.
     * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
     */
    onEnter({
      to,
      trigger,
      done
    }) {
      console.log('special enter transition');
      done();
    }
  }

  class FrontPage extends Page {
    onEnter() {
      console.log('HOME ENTER');
    }
    onLeaveCompleted() {
      console.log('HOME LEAVE COMPLETED');
    }
  }

  class Main {
    constructor() {
      this.initTaxi();
      this.events();
      // this.initTaxi().then(this.start.bind(this));
      // console.log('App');
      // const blocks = document.querySelectorAll('[data-block]');
      // blocks.forEach((block) => {
      //   console.log(block.getAttribute('data-block'));
      // });

      // this.taxi.addRoute('', '/contact', 'special');
    }
    initTaxi() {
      this.taxi = new Core({
        renderers: {
          default: Page,
          frontPage: FrontPage
        },
        transitions: {
          default: Loader,
          special: Special
        },
        links: 'a:not([target]):not([href^=\\#]):not([data-taxi-ignore]):not([lang])'
      });
    }
    events() {
      this.taxi.on('NAVIGATE_IN', ({
        to,
        trigger
      }) => {
        document.title = to.page.title;
        document.body.classList = to.page.body.classList;
        document.head.innerHTML = to.page.head.innerHTML;
      });
    }
  }
  const ready = () => {
    new Main();
  };
  document.addEventListener('DOMContentLoaded', ready);

}));
