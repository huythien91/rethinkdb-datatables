"use strict";

var HELPER = function () {
  /**
   * Prevent a param from being an empty string.
   * @function noEmpty
   * @instance
   * @param {object} object containing the field to validate
   * @param {string} key key of this variable
   * @returns the string itself
   * @throws {Error} if the specified key leads to an empty string
   */
  this.noEmpty = function(params, key) {
    if(params[key] === "")
      throw new Error("Request parameter `" + key + "` must not be an empty string");
    return params[key];
  }

  /**
   * Validate if a request parameter is a valid integer number
   * @function validInt
   * @instance
   * @param {object} object containing the field to validate
   * @param {string} key key of this variable
   * @return the integer value, properly parsed
   * @throws {Error} if the input parameter is not a valid integer number
   */
  this.validInt = function(params, key) {
    var val = parseInt(params[key]);
    if(isNaN(val))
      throw new Error("Request parameter `" + key + "` must be a valid integer value");
    return val;
  }

  /**
   * Validate a param as valid boolean
   * @function validBoolean
   * @param {object} object containing the field to validate
   * @param {string} key key of this variable
   * @instance
   * @return the boolean value, properly parsed
   * @throws {Error} if the input parameter is not a valid boolean
   */
  this.validBoolean = function(params, key) {
    switch(params[key].toString().toLowerCase().trim()) {
      case "true": 
        return true;
      case "false": 
        return false;
      default: 
        throw new Error('Request parameter `' + key + "` must be a valid boolean value");
    };
  };

  /**
   * Helper for escaping regex special characters
   * @function regexEscape
   * @instance
   * @param {string} s the string to escape
   * @returns the escaped string
   */
  this.regexEscape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
}

var helper = new HELPER();
module.exports = helper;