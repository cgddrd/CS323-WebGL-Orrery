function Utils() {}

Utils.isPowerOfTwo = function(value) {
    return (value & (value - 1)) == 0;
}

Utils.degToRad = function (degrees) {
    return degrees * Math.PI / 180;
}
