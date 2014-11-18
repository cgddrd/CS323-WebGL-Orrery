/**
 * Provides common "utility" functions required throughout the application.
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 */
function Utils() {}

/**
 * "Static" function to determine if the current value is a power of two.
 * @param {int} value - Value to test.
 */
Utils.isPowerOfTwo = function(value) {
    return (value & (value - 1)) == 0;
}

/**
 * "Static" function to cbnvert degrees to radians.
 * @param {int} degrees - Angle in degrees requiring conversion to radians.
 */
Utils.degreesToRadians = function (degrees) {
    return degrees * Math.PI / 180;
}
