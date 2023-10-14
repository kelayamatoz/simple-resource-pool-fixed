(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("simple-resource-pool", [], factory);
	else if(typeof exports === 'object')
		exports["simple-resource-pool"] = factory();
	else
		root["SimpleResourcePool"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./resource-pool.ts
var ResourcePool = (function () {
    function ResourcePool(creator, maxResources) {
        if (maxResources === void 0) { maxResources = Number.MAX_SAFE_INTEGER - 1; }
        this.availables = [];
        this.busies = [];
        this.debts = [];
        if (creator() === creator()) {
            throw new Error('Creator function returns the same object on diff calls');
        }
        if (!Number.isInteger(maxResources)) {
            throw new TypeError();
        }
        if (maxResources < 1) {
            throw new RangeError();
        }
        if (maxResources >= Number.MAX_SAFE_INTEGER) {
            throw new RangeError();
        }
        this.creator = creator;
        this.maxResources = maxResources;
    }
    ResourcePool.prototype.getRes = function () {
        var _this = this;
        var id = Math.random();
        this.debts.push(id);
        return new Promise(function (resolve) {
            if (_this.availables.length > 0) {
                var theRes = _this.availables.pop();
                _this.busies.push(theRes);
                _this.debts.splice(_this.debts.indexOf(id), 1);
                resolve(theRes);
            }
            else if (_this.resCount() < _this.maxResources) {
                var theRes = _this.creator();
                _this.busies.push(theRes);
                _this.debts.splice(_this.debts.indexOf(id), 1);
                resolve(theRes);
            }
            else {
                var interval_1 = setInterval(function () {
                    if (_this.availables.length > 0) {
                        var theRes = _this.availables.pop();
                        _this.busies.push(theRes);
                        _this.debts.splice(_this.debts.indexOf(id), 1);
                        clearInterval(interval_1);
                        resolve(theRes);
                    }
                }, 0);
            }
        });
    };
    ResourcePool.prototype.release = function (res) {
        var posInBusies = this.busies.indexOf(res);
        this.busies.splice(posInBusies, 1);
        this.availables.push(res);
    };
    ResourcePool.prototype.resCount = function () {
        return this.busies.length + this.availables.length;
    };
    return ResourcePool;
}());


// CONCATENATED MODULE: ./index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "ResourcePool", function() { return ResourcePool; });



/***/ })
/******/ ]);
});