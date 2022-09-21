/*!
 * EasePack 3.6.0
 * https://greensock.com
 *
 * @license Copyright 2008-2020, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
 */

/* eslint-disable */
import {
  getGlobalMatrix,
  _getDocScrollTop,
  _getDocScrollLeft,
  Matrix2D,
  _setDoc,
} from "./utils/matrix.js";

var _id = 1,
  _toArray,
  gsap,
  _RAD2DEG = 180 / Math.PI,
  _DEG2RAD = Math.PI / 180,
  _emptyObj = {},
  _dashedNameLookup = {},
  _memoizedRemoveProps = {},
  _memoizedProps = {},
  _callbacks =
    "onStart,onUpdate,onComplete,onReverseComplete,onInterrupt".split(","),
  _removeProps =
    "transform,transformOrigin,width,height,position,top,left,opacity,zIndex".split(
      ","
    ),
  _getEl = function _getEl(target) {
    return _toArray(target)[0] || console.warn("Element not found:", target);
  },
  _round = function _round(value) {
    return Math.round(value * 10000) / 10000 || 0;
  },
  _toggleClass = function _toggleClass(targets, className, action) {
    return targets.forEach(function (el) {
      return el.classList[action](className);
    });
  },
  _reserved = {
    zIndex: 1,
    clear: 1,
    simple: 1,
    spin: 1,
    clearProps: 1,
    targets: 1,
    toggleClass: 1,
    onComplete: 1,
    onUpdate: 1,
    onInterrupt: 1,
    onStart: 1,
    delay: 1,
    repeat: 1,
    repeatDelay: 1,
    yoyo: 1,
    scale: 1,
    fade: 1,
    absolute: 1,
    props: 1,
    onEnter: 1,
    onLeave: 1,
    custom: 1,
    paused: 1,
    nested: 1,
  },
  _fitReserved = {
    zIndex: 1,
    simple: 1,
    clearProps: 1,
    scale: 1,
    absolute: 1,
    fitChild: 1,
    getVars: 1,
    props: 1,
  },
  _camelToDashed = function _camelToDashed(p) {
    return p.replace(/([A-Z])/g, "-$1").toLowerCase();
  },
  _listToArray = function _listToArray(list) {
    return typeof list === "string"
      ? list.split(" ").join("").split(",")
      : list;
  },
  // removes extra spaces contaminating the names, returns an Array.
  _bonusValidated = 1,
  //<name>Flip</name>
  _copy = function _copy(obj, exclude) {
    var result = {},
      p;

    for (p in obj) {
      exclude[p] || (result[p] = obj[p]);
    }

    return result;
  },
  _getInverseGlobalMatrix = function _getInverseGlobalMatrix(el) {
    // integrates caching for improved performance
    var cache = el._gsap || gsap.core.getCache(el);

    if (cache.gmCache === gsap.ticker.frame) {
      return cache.gMatrix;
    }

    cache.gmCache = gsap.ticker.frame;
    return (cache.gMatrix = getGlobalMatrix(el, true, false, true));
  },
  _getDOMDepth = function _getDOMDepth(el, invert, level) {
    if (level === void 0) {
      level = 0;
    }

    // In invert is true, the sibling depth is increments of 1, and parent/nesting depth is increments of 1000. This lets us order elements in an Array to reflect document flow.
    var parent = el.parentNode,
      inc = 1000 * Math.pow(10, level) * (invert ? -1 : 1),
      l = invert ? -inc * 900 : 0;

    while (el) {
      l += inc;
      el = el.previousSibling;
    }

    return parent ? l + _getDOMDepth(parent, invert, level + 1) : l;
  },
  _orderByDOMDepth = function _orderByDOMDepth(comps, invert, isElStates) {
    comps.forEach(function (comp) {
      return (comp.d = _getDOMDepth(
        isElStates ? comp.element : comp.t,
        invert
      ));
    });
    comps.sort(function (c1, c2) {
      return c1.d - c2.d;
    });
    return comps;
  },
  _recordInlineStyles = function _recordInlineStyles(elState, props) {
    // records the current inline CSS properties into an Array in alternating name/value pairs that's stored in a "css" property on the state object so that we can revert later.
    var style = elState.element.style,
      a = (elState.css = elState.css || []),
      i = props.length,
      p,
      v;

    while (i--) {
      p = props[i];
      v = style[p] || style.getPropertyValue(p);
      a.push(
        v
          ? p
          : _dashedNameLookup[p] || (_dashedNameLookup[p] = _camelToDashed(p)),
        v
      );
    }

    return style;
  },
  _applyInlineStyles = function _applyInlineStyles(state) {
    var css = state.css,
      style = state.element.style,
      i = 0;
    state.cache.uncache = 1;

    for (; i < css.length; i += 2) {
      css[i + 1] ? (style[css[i]] = css[i + 1]) : style.removeProperty(css[i]);
    }
  },
  _setFinalStates = function _setFinalStates(comps, onlyTransforms) {
    var i = comps.length,
      comp;

    while (i--) {
      comp = comps[i];
      comp.a.cache.uncache = 1;
    }

    onlyTransforms || comps.finalStates.forEach(_applyInlineStyles);
  },
  _makeAbsolute = function _makeAbsolute(elState, fallbackNode) {
    var element = elState.element,
      width = elState.width,
      height = elState.height,
      uncache = elState.uncache,
      getProp = elState.getProp,
      style = element.style,
      result,
      displayIsNone;
    typeof fallbackNode !== "object" && (fallbackNode = elState);

    if (getProp("position") !== "absolute") {
      displayIsNone = getProp("display") === "none";

      if (!elState.isVisible || displayIsNone) {
        displayIsNone &&
          (_recordInlineStyles(elState, ["display"]).display =
            fallbackNode.display);
        elState.matrix = fallbackNode.matrix;
        elState.width = width = elState.width || fallbackNode.width;
        elState.height = height = elState.height || fallbackNode.height;
      }

      style.position = "absolute";
      style.width = width + "px";
      style.height = height + "px";
      style.top || (style.top = "0px");
      style.left || (style.left = "0px");

      if (uncache) {
        result = new ElementState(element);
      } else {
        // better performance
        result = _copy(elState, _emptyObj);

        if (elState.simple) {
          var bounds = element.getBoundingClientRect();
          result.matrix = new Matrix2D(1, 0, 0, 1, bounds.left, bounds.top);
        } else {
          result.matrix = getGlobalMatrix(element, false, false, true);
        }
      }

      result = _fit(result, elState, true);
      elState.x = parseFloat(result.x);
      elState.y = parseFloat(result.y);
    }

    return element;
  },
  _findElStateInState = function _findElStateInState(state, other) {
    return (
      (other && state.idLookup[_parseElementState(other).id]) ||
      state.elementStates[0]
    );
  },
  _parseElementState = function _parseElementState(
    elOrNode,
    props,
    simple,
    other
  ) {
    return elOrNode instanceof ElementState
      ? elOrNode
      : elOrNode instanceof FlipState
      ? _findElStateInState(elOrNode, other)
      : new ElementState(
          typeof elOrNode === "string"
            ? _getEl(elOrNode) || console.warn(elOrNode + " not found")
            : elOrNode,
          props,
          simple
        );
  },
  _recordProps = function _recordProps(elState, props) {
    var getProp = gsap.getProperty(elState.element, null, "native"),
      obj = (elState.props = {}),
      i = props.length;

    while (i--) {
      obj[props[i]] = (getProp(props[i]) + "").trim();
    }

    obj.zIndex && (obj.zIndex = parseFloat(obj.zIndex) || 0);
    return elState;
  },
  _applyProps = function _applyProps(element, props) {
    var style = element.style || element,
      // could pass in a vars object.
      p;

    for (p in props) {
      style[p] = props[p];
    }
  },
  _getID = function _getID(el) {
    var id = el.getAttribute("data-flip-id");
    id || el.setAttribute("data-flip-id", (id = "auto-" + _id++));
    return id;
  },
  _elementsFromElementStates = function _elementsFromElementStates(elStates) {
    return elStates.map(function (elState) {
      return elState.element;
    });
  },
  _handleCallback = function _handleCallback(callback, elStates, tl) {
    return (
      callback &&
      elStates.length &&
      tl.add(
        callback(
          _elementsFromElementStates(elStates),
          new FlipState(elStates, 0, true)
        ),
        0
      )
    );
  },
  _fit = function _fit(fromState, toState, scale, applyProps, fitChild, vars) {
    var element = fromState.element,
      cache = fromState.cache,
      parent = fromState.parent,
      x = fromState.x,
      y = fromState.y,
      width = toState.width,
      height = toState.height,
      scaleX = toState.scaleX,
      scaleY = toState.scaleY,
      rotation = toState.rotation,
      cssText = vars && element.style.cssText,
      dimensionState = fromState,
      _toState$matrix = toState.matrix,
      e = _toState$matrix.e,
      f = _toState$matrix.f,
      deep =
        fromState.width !== width ||
        fromState.height !== height ||
        fromState.scaleX !== scaleX ||
        fromState.scaleY !== scaleY ||
        fromState.rotation !== rotation,
      simple = !deep && fromState.simple && toState.simple && !fitChild,
      skewX,
      fromPoint,
      toPoint,
      getProp,
      parentMatrix,
      matrix;

    if (simple) {
      scaleX = scaleY = 1;
      rotation = skewX = 0;
    } else {
      parentMatrix = _getInverseGlobalMatrix(parent);
      matrix = parentMatrix.clone().multiply(toState.matrix);
      rotation = _round(Math.atan2(matrix.b, matrix.a) * _RAD2DEG);
      skewX =
        _round(Math.atan2(matrix.c, matrix.d) * _RAD2DEG + rotation) % 360; // in very rare cases, minor rounding might end up with 360 which should be 0.

      scaleX = Math.sqrt(Math.pow(matrix.a, 2) + Math.pow(matrix.b, 2));
      scaleY =
        Math.sqrt(Math.pow(matrix.c, 2) + Math.pow(matrix.d, 2)) *
        Math.cos(skewX * _DEG2RAD);

      if (fitChild) {
        getProp = gsap.getProperty(fitChild);
        dimensionState = {
          scaleX: getProp("scaleX"),
          scaleY: getProp("scaleY"),
          width: Math.ceil(parseFloat(getProp("width", "px"))),
          height: parseFloat(getProp("height", "px")),
        };
      }

      cache.rotation = rotation + "deg";
      cache.skewX = skewX + "deg";
    }

    if (scale) {
      scaleX *= width / dimensionState.width;
      scaleY *= height / dimensionState.height;
      cache.scaleX = scaleX;
      cache.scaleY = scaleY;
    } else {
      width *= scaleX / dimensionState.scaleX;
      height *= scaleY / dimensionState.scaleY;
      element.style.width = width + "px";
      element.style.height = height + "px";
    }

    if (fromState.position === "fixed") {
      e -= _getDocScrollLeft();
      f -= _getDocScrollTop();
    }

    if (toState.position === "fixed") {
      e += _getDocScrollLeft();
      f += _getDocScrollTop();
    }

    if (simple) {
      x += e - fromState.matrix.e;
      y += f - fromState.matrix.f;
    } else if (deep || parent !== toState.parent) {
      cache.renderTransform(1, cache);
      matrix = getGlobalMatrix(fitChild || element, false, false, true);
      applyProps && _applyProps(element, toState.props);
      fromPoint = parentMatrix.apply({
        x: matrix.e,
        y: matrix.f,
      });
      toPoint = parentMatrix.apply({
        x: e,
        y: f,
      });
      x += _round(toPoint.x - fromPoint.x);
      y += _round(toPoint.y - fromPoint.y);
    } else {
      // use a faster/cheaper algorithm if we're just moving x/y
      parentMatrix.e = parentMatrix.f = 0;
      toPoint = parentMatrix.apply({
        x: e - fromState.matrix.e,
        y: f - fromState.matrix.f,
      });
      x += _round(toPoint.x);
      y += _round(toPoint.y);
      applyProps && _applyProps(element, toState.props);
    }

    if (vars && !(vars instanceof ElementState)) {
      // revert
      element.style.cssText = cssText;
      cache.uncache = 1;
    } else {
      // or apply the transform immediately
      cache.x = x + "px";
      cache.y = y + "px";
      cache.renderTransform(1, cache);
    }

    if (vars) {
      vars.x = x;
      vars.y = y;
      vars.rotation = rotation;
      vars.skewX = skewX;

      if (scale) {
        vars.scaleX = scaleX;
        vars.scaleY = scaleY;
      } else {
        vars.width = width;
        vars.height = height;
      }
    }

    return vars || cache;
  },
  _parseState = function _parseState(targetsOrState, vars) {
    return targetsOrState instanceof FlipState
      ? targetsOrState
      : new FlipState(targetsOrState, vars);
  },
  _getChangingElState = function _getChangingElState(toState, fromState, id) {
    var to1 = toState.idLookup[id],
      to2 = toState.alt[id];
    return to2.isVisible &&
      (!(fromState.getElementState(to2.element) || to2).isVisible ||
        !to1.isVisible)
      ? to2
      : to1;
  },
  _fromTo = function _fromTo(fromState, toState, vars, relative) {
    // relative is -1 if "from()", and 1 if "to()"
    if (!_bonusValidated) {
      return;
    }

    (fromState instanceof FlipState && toState instanceof FlipState) ||
      console.warn("Not a valid state object.");
    vars = vars || {};

    var _vars = vars,
      clearProps = _vars.clearProps,
      onEnter = _vars.onEnter,
      onLeave = _vars.onLeave,
      absolute = _vars.absolute,
      custom = _vars.custom,
      delay = _vars.delay,
      paused = _vars.paused,
      repeat = _vars.repeat,
      repeatDelay = _vars.repeatDelay,
      yoyo = _vars.yoyo,
      toggleClass = _vars.toggleClass,
      nested = _vars.nested,
      _zIndex = _vars.zIndex,
      scale = _vars.scale,
      fade = _vars.fade,
      stagger = _vars.stagger,
      spin = _vars.spin,
      props = ("props" in vars ? vars : fromState).props,
      tweenVars = _copy(vars, _reserved),
      animation = gsap.timeline({
        delay: delay,
        paused: paused,
        repeat: repeat,
        repeatDelay: repeatDelay,
        yoyo: yoyo,
      }),
      remainingProps = tweenVars,
      entering = [],
      leaving = [],
      comps = [],
      swapOutTargets = [],
      spinNum = spin === true ? 1 : spin || 0,
      spinFunc =
        typeof spin === "function"
          ? spin
          : function () {
              return spinNum;
            },
      interrupted = fromState.interrupted || toState.interrupted,
      addFunc = animation[relative !== 1 ? "to" : "from"],
      v,
      p,
      endTime,
      i,
      el,
      comp,
      state,
      targets,
      finalStates,
      fromNode,
      toNode;

    relative ||
      (toState = new FlipState(toState.targets, props).fit(toState, scale));

    for (p in toState.idLookup) {
      toNode = !toState.alt[p]
        ? toState.idLookup[p]
        : _getChangingElState(toState, fromState, p);
      el = toNode.element;
      fromNode = fromState.idLookup[p];
      fromState.alt[p] &&
        el === fromNode.element &&
        (fromNode = fromState.alt[p]);

      if (fromNode) {
        comp = {
          t: el,
          b: fromNode,
          a: toNode,
          sd: fromNode.element === el ? 0 : toNode.isVisible ? 1 : -1,
        };
        comps.push(comp);

        if (comp.sd) {
          if (comp.sd < 0) {
            comp.b = toNode;
            comp.a = fromNode;
          } //comp.fb = fromState.getElementState(el) || comp.b; // fallback? Might need to be something other than the before state, like making sure we use the values from the same element.

          fade &&
            comps.push(
              (comp.swap = {
                t: fromNode.element,
                b: comp.b,
                a: comp.a,
                sd: comp.sd * -1,
                swap: comp,
              })
            );
        }

        el._flip = fromNode.element._flip = animation;
      } else if (toNode.isVisible) {
        comps.push({
          t: el,
          b: _copy(toNode, {
            isVisible: 1,
          }),
          a: toNode,
          sd: 0,
        }); // to include it in the "entering" Array and do absolute positioning if necessary

        el._flip = animation;
      }
    }

    props &&
      _memoizedProps[props].forEach(function (p) {
        return (tweenVars[p] = function (i) {
          return comps[i].a.props[p];
        });
      });
    comps.finalStates = finalStates = []; // if (absolute) {
    // 	targets = typeof(absolute) !== "boolean" ? comps.concat((new FlipState(absolute)).elementStates.map(t => finalStates.push(t) && {a:t, b:t, t:t.element})) : comps;
    // 	_orderByDOMDepth(targets, true).forEach(c => (c.a.isVisible || c.b.isVisible) && _makeAbsolute(c.sd < 0 ? c.b : c.a, c.b)); // when making absolute, we must go in a very particular order so that document flow changes don't affect things. Don't make it visible if both the before and after states are invisible! There's no point, and it could make things appear visible during the flip that shouldn't be.
    // }

    absolute &&
      _orderByDOMDepth(comps, true).forEach(function (c) {
        return (
          (c.a.isVisible || c.b.isVisible) &&
          _makeAbsolute(c.sd < 0 ? c.b : c.a, c.b)
        );
      }); // when making absolute, we must go in a very particular order so that document flow changes don't affect things. Don't make it visible if both the before and after states are invisible! There's no point, and it could make things appear visible during the flip that shouldn't be.

    _orderByDOMDepth(comps); // TODO: cache the matrix, especially for parent because it'll probably get reused quite a bit, but lock it to a particular cycle(?).

    for (i = 0; i < comps.length; i++) {
      comp = comps[i];
      el = comp.t;
      nested &&
        !(comp.sd < 0) &&
        (comp.a.matrix = getGlobalMatrix(el, false, false, true)); // moving a parent affects the position of children

      if (comp.sd || (comp.b.isVisible && comp.a.isVisible)) {
        if (comp.sd < 0) {
          // swapping OUT (swap direction of -1 is out)
          state = new ElementState(el, props, fromState.simple);

          _fit(state, comp.a, scale, 0, 0, state);

          state.matrix = getGlobalMatrix(el, false, false, true);
          state.css = comp.b.css;
          comp.a = state;
          fade &&
            (el.style.opacity = interrupted ? comp.b.opacity : comp.a.opacity);
          stagger && swapOutTargets.push(el);
        } else if (comp.sd > 0 && fade) {
          // swapping IN (swap direction of 1 is in)
          el.style.opacity = interrupted
            ? comp.a.opacity - comp.b.opacity
            : "0";
        }

        _fit(comp.a, comp.b, scale, props);
      } else {
        // either entering or leaving (one side is invisible)
        if (!comp.b.isVisible) {
          // entering
          comp.a.isVisible && entering.push(comp.a);
          comps.splice(i--, 1);
        } else if (!comp.a.isVisible) {
          // leaving
          comp.b.css = comp.a.css;
          leaving.push(comp.b);
          comps.splice(i--, 1);
          absolute && nested && _fit(comp.a, comp.b, scale, props);
        }
      }

      finalStates.push(comp.a);
    }

    if (scale) {
      tweenVars.scaleX = function (i) {
        return comps[i].a.scaleX;
      };

      tweenVars.scaleY = function (i) {
        return comps[i].a.scaleY;
      };
    } else {
      tweenVars.width = function (i) {
        return comps[i].a.width;
      };

      tweenVars.height = function (i) {
        return comps[i].a.height;
      };
    }

    tweenVars.x = function (i) {
      return comps[i].a.x;
    };

    tweenVars.y = function (i) {
      return comps[i].a.y;
    };

    tweenVars.rotation = function (i) {
      return (
        comps[i].a.rotation +
        (spin ? spinFunc(i, targets[i], targets) * 360 : 0)
      );
    };

    tweenVars.skewX = function (i) {
      return comps[i].a.skewX;
    };

    (_zIndex || _zIndex === 0) &&
      (tweenVars.modifiers = {
        zIndex: function zIndex() {
          return _zIndex;
        },
      }) &&
      (tweenVars.zIndex = 0);
    targets = comps.map(function (c) {
      return c.t;
    });
    fade &&
      (tweenVars.opacity = function (i) {
        return comps[i].sd < 0
          ? 0
          : comps[i].sd > 0
          ? comps[i].a.opacity
          : "+=0";
      });

    if (swapOutTargets.length) {
      stagger = gsap.utils.distribute(stagger);
      var dummyArray = targets.slice(swapOutTargets.length);

      tweenVars.stagger = function (i, el) {
        return stagger(
          ~swapOutTargets.indexOf(el) ? targets.indexOf(comps[i].swap.t) : i,
          el,
          dummyArray
        );
      };
    } // // for testing...
    // gsap.delayedCall(vars.data ? 50 : 1, function() {
    // 	animation.eventCallback("onComplete", () => _setFinalStates(comps, !clearProps));
    // 	addFunc.call(animation, targets, tweenVars, 0).play();
    // });
    // return;

    _callbacks.forEach(function (name) {
      return (
        vars[name] &&
        animation.eventCallback(name, vars[name], vars[name + "Params"])
      );
    }); // apply callbacks to the timeline, not tweens (because "custom" timing can make multiple tweens)

    if (custom && targets.length) {
      // bust out the custom properties as their own tweens so they can use different eases, durations, etc.
      remainingProps = _copy(tweenVars, _reserved);

      if ("scale" in custom) {
        custom.scaleX = custom.scaleY = custom.scale;
        delete custom.scale;
      }

      for (p in custom) {
        v = _copy(custom[p], _fitReserved);
        v[p] = tweenVars[p];
        "duration" in v || (v.duration = tweenVars.duration);
        addFunc.call(animation, targets, v, 0);
        delete remainingProps[p];
      }
    }

    if (targets.length || leaving.length || entering.length) {
      toggleClass &&
        animation.add(function () {
          return _toggleClass(
            targets,
            toggleClass,
            animation._zTime < 0 ? "remove" : "add"
          );
        }, 0) &&
        !paused &&
        _toggleClass(targets, toggleClass, "add");
      targets.length && addFunc.call(animation, targets, remainingProps, 0);
    }

    _handleCallback(onEnter, entering, animation);

    _handleCallback(onLeave, leaving, animation);

    endTime = animation.duration();
    animation.call(function () {
      var forward = animation.time() >= endTime;
      forward && _setFinalStates(comps, !clearProps);
      toggleClass &&
        _toggleClass(targets, toggleClass, forward ? "remove" : "add");
    });
    return animation;
  },
  _createLookup = function _createLookup(state) {
    var lookup = (state.idLookup = {}),
      alt = (state.alt = {}),
      elStates = state.elementStates,
      i = elStates.length,
      elState;

    while (i--) {
      elState = elStates[i];
      lookup[elState.id]
        ? (alt[elState.id] = elState)
        : (lookup[elState.id] = elState);
    }
  };

var FlipState = /*#__PURE__*/ (function () {
  function FlipState(targets, vars, targetsAreElementStates) {
    this.props = vars && vars.props;
    this.simple = !!(vars && vars.simple);

    if (targetsAreElementStates) {
      this.targets = _elementsFromElementStates(targets);
      this.elementStates = targets;

      _createLookup(this);
    } else {
      this.targets = _toArray(targets);
      this.update(!vars || vars.clear !== false);
    }
  }

  var _proto = FlipState.prototype;

  _proto.update = function update(clear) {
    var _this = this;

    this.elementStates = this.targets.map(function (el) {
      return new ElementState(el, _this.props, _this.simple);
    });

    _createLookup(this);

    this.killFlips(clear); // TODO: maybe record the progress of each in-progress flip and then revert there AFTER we recordInlineStyles()?

    this.recordInlineStyles();
    return this;
  };

  _proto.fit = function fit(state, scale, nested) {
    var elStatesInOrder = _orderByDOMDepth(
        this.elementStates.slice(0),
        false,
        true
      ),
      toElStates = (state || this).idLookup,
      i = 0,
      fromNode,
      toNode;

    for (; i < elStatesInOrder.length; i++) {
      fromNode = elStatesInOrder[i];
      nested &&
        (fromNode.matrix = getGlobalMatrix(
          fromNode.element,
          false,
          false,
          true
        )); // moving a parent affects the position of children

      toNode = toElStates[fromNode.id];
      toNode && _fit(fromNode, toNode, scale, true, 0, fromNode);
      fromNode.matrix = getGlobalMatrix(fromNode.element, false, false, true);
    }

    return this;
  };

  _proto.getProperty = function getProperty(element, property) {
    var es = this.getElementState(element) || _emptyObj;

    return property in es ? es[property] : (es.props || _emptyObj)[property];
  };

  _proto.recordInlineStyles = function recordInlineStyles() {
    var props = _memoizedRemoveProps[this.props] || _removeProps,
      i = this.elementStates.length;

    while (i--) {
      _recordInlineStyles(this.elementStates[i], props);
    }
  };

  _proto.killFlips = function killFlips(clear) {
    var found;
    this.targets.forEach(function (tl) {
      tl = tl._flip;

      if (tl && tl.progress() < 1 && !tl.paused()) {
        found = 1;
        tl.vars.onInterrupt &&
          tl.vars.onInterrupt.apply(tl, tl.vars.onInterruptParams || []);
        clear && tl.progress(1);
        tl.kill(); // we should also kill it in case it was added to a parent timeline.
      }
    });

    if (found && clear) {
      // if we found an in-progress Flip animation, we must record all the values in their current state at that point BUT we should update the isVisible value AFTER pushing that flip to completion so that elements that are entering or leaving will populate those Arrays properly.
      this.elementStates.forEach(function (es) {
        var b = es.element.getBoundingClientRect();
        es.isVisible = b.width || b.height || b.top || b.left;
        es.uncache = 1;
      });
    }

    this.interrupted = !!found;
  };

  _proto.getElementState = function getElementState(element) {
    return this.elementStates[this.targets.indexOf(_getEl(element))];
  };

  _proto.makeAbsolute = function makeAbsolute() {
    return _orderByDOMDepth(this.elementStates.slice(0), true, true).map(
      _makeAbsolute
    );
  };

  return FlipState;
})();

var ElementState = /*#__PURE__*/ (function () {
  function ElementState(element, props, simple) {
    this.element = element;
    this.update(props, simple);
  }

  var _proto2 = ElementState.prototype;

  _proto2.update = function update(props, simple) {
    var element = this.element,
      getProp = gsap.getProperty(element),
      cache = gsap.core.getCache(element),
      bounds = element.getBoundingClientRect(),
      m = simple
        ? new Matrix2D(
            1,
            0,
            0,
            1,
            bounds.left + _getDocScrollLeft(),
            bounds.top + _getDocScrollTop()
          )
        : getGlobalMatrix(element, false, false, true);
    this.getProp = getProp;
    this.element = element;
    this.id = _getID(element);
    this.matrix = m;
    this.cache = cache;
    this.bounds = bounds;
    this.isVisible = !!(
      bounds.width ||
      bounds.height ||
      bounds.left ||
      bounds.top
    );
    this.display = getProp("display");
    this.position = getProp("position");
    this.parent = element.parentNode;
    this.x = getProp("x");
    this.y = getProp("y");
    this.scaleX = cache.scaleX;
    this.scaleY = cache.scaleY;
    this.rotation = getProp("rotation");
    this.skewX = getProp("skewX");
    this.opacity = getProp("opacity");
    this.width = Math.ceil(parseFloat(getProp("width", "px")));
    this.height = parseFloat(getProp("height", "px"));

    if (props) {
      _memoizedRemoveProps[props] ||
        ((_memoizedProps[props] = _listToArray(props)) &&
          (_memoizedRemoveProps[props] =
            _memoizedProps[props].concat(_removeProps)));

      _recordProps(this, _memoizedProps[props]);
    }

    this.simple =
      simple ||
      (_round(m.a) === 1 && !_round(m.b) && !_round(m.c) && _round(m.d) === 1); // allows us to speed through some other tasks if it's not scale/rotated

    this.uncache = 0;
  };

  return ElementState;
})();

export var Flip = /*#__PURE__*/ (function () {
  function Flip() {}

  Flip.getState = function getState(targets, vars) {
    return _parseState(
      targets,
      typeof vars === "string"
        ? {
            props: vars,
          }
        : vars
    );
  };

  Flip.from = function from(state, vars) {
    vars = vars || {};
    "clearProps" in vars || (vars.clearProps = true);
    return _fromTo(
      state,
      _parseState(vars.targets || state.targets, {
        props: vars.props || state.props,
        simple: vars.simple,
        clear: !!vars.clear,
      }),
      vars,
      -1
    );
  };

  Flip.to = function to(state, vars) {
    return _fromTo(
      state,
      _parseState(vars.targets || state.targets, {
        props: vars.props || state.props,
        simple: vars.simple,
        clear: !!vars.clear,
      }),
      vars,
      1
    );
  };

  Flip.fromTo = function fromTo(fromState, toState, vars) {
    return _fromTo(fromState, toState, vars);
  };

  Flip.fit = function fit(fromEl, toEl, vars) {
    if (!_bonusValidated) {
      return;
    }

    var v = vars ? _copy(vars, _fitReserved) : {},
      _ref = vars || v,
      absolute = _ref.absolute,
      scale = _ref.scale,
      getVars = _ref.getVars,
      props = _ref.props,
      runBackwards = _ref.runBackwards,
      onComplete = _ref.onComplete,
      simple = _ref.simple,
      fitChild = vars && vars.fitChild && _getEl(vars.fitChild),
      before = _parseElementState(toEl, props, simple, fromEl),
      after = _parseElementState(fromEl, 0, simple, before),
      inlineProps = props ? _memoizedRemoveProps[props] : _removeProps;

    props && _applyProps(v, before.props);

    if (runBackwards) {
      _recordInlineStyles(after, inlineProps);

      "immediateRender" in v || (v.immediateRender = true);

      v.onComplete = function () {
        _applyInlineStyles(after);

        onComplete && onComplete.apply(this, arguments);
      };
    }

    absolute && _makeAbsolute(after, before);
    v = _fit(
      after,
      before,
      scale || fitChild,
      props,
      fitChild,
      v.duration || getVars ? v : 0
    );
    return getVars ? v : v.duration ? gsap.to(after.element, v) : null;
  };

  Flip.makeAbsolute = function makeAbsolute(targetsOrStates, vars) {
    return (
      targetsOrStates instanceof FlipState
        ? targetsOrStates
        : new FlipState(targetsOrStates, vars)
    ).makeAbsolute();
  };

  Flip.isFlipping = function isFlipping(target) {
    var f = Flip.getByTarget(target);
    return !!f && f.isActive();
  };

  Flip.getByTarget = function getByTarget(target) {
    return (_getEl(target) || _emptyObj)._flip;
  };

  Flip.getElementState = function getElementState(target, props) {
    return new ElementState(_getEl(target), props);
  };

  Flip.convertCoordinates = function convertCoordinates(
    fromElement,
    toElement,
    point
  ) {
    var m = getGlobalMatrix(toElement, true, true).multiply(
      getGlobalMatrix(fromElement)
    );
    return point ? m.apply(point) : m;
  };

  Flip.register = function register(core) {
    gsap = core;

    _setDoc(document.body);

    _toArray = gsap.utils.toArray;
  };

  return Flip;
})(); // function whenImagesLoad(el, func) {
// 	let pending = [],
// 		onLoad = e => {
// 			pending.splice(pending.indexOf(e.target), 1);
// 			e.target.removeEventListener("load", onLoad);
// 			pending.length || func();
// 		};
// 	gsap.utils.toArray(el.tagName.toLowerCase() === "img" ? el : el.querySelectorAll("img")).forEach(img => img.complete || img.addEventListener("load", onLoad) || pending.push(img));
// 	pending.length || func();
// }

typeof window !== "undefined" &&
  window.gsap &&
  window.gsap.registerPlugin(Flip);
export { Flip as default };
