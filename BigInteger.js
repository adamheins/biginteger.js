'use strict';

/**
 * Arbitrary-sized integer.
 *
 * @constructor
 *
 * @param {String, Number, or Array} number A representation of the magnitude of the BigInteger.
 *     If the number is a Number or string, it is parsed into the BigInteger's digits. If it is an
 *     array, this is taken as the digits array. If number is null or undefined, a BigInteger with a
 *     value of zero is created.\Note that leading zeroes are not permitted in the array of digits
 *     for a BigInteger. Therefore, a BigInteger with a value of zero contains an empty digit array.
 *
 * @param {Boolean} negative Only required when the parameter 'number' is of type Array. True if the
 *     BigInteger is negative, false otherwise.
 *
 * @author Adam Heins
 */
function BigInteger(number, negative) {

    // The base of the BigInteger. Each digit cannot be larger than this base. A base of 1,000,000
    // was chosen because 1,000,000 ^ 2 still fits nicely into a native Number object (useful for
    // multiplication).
    this.base = 1000000;

    // The base 10 logarithm of the base.
    var logbase = 6;

    // Null or undefined parameters results in a BigInteger of 0.
    if (number === null || number === undefined) {
        this.digits = [];
        this.numberString = "0";
        this.negative = false;

    // Number is a string.
    } else if (typeof number === "string") {

        this.numberString = number;

        // Determine if the number is negative.
        if (number.charAt(0) === '-') {
            number = number.substr(1);
            this.negative = true;
        } else
            this.negative = false;

        // Check if the number is simply zero.
        if (representsZero(number)) {
            this.digits = [];
            this.negative = false;
            return;
        }

        // Parse the digits of the number.
        var numDigits = Math.ceil(number.length / logbase);
        this.digits = new Array(numDigits);

        var excess = number.length % logbase;
        excess = excess == 0 ? logbase : excess;
        this.digits[numDigits - 1] = parseInt(number.substr(0, excess));

        for (var i = 1; i < numDigits; i++) {
            this.digits[i - 1] = parseInt(number.substr(number.length - logbase * i,
                logbase));
        }

    // Number is actually a number.
    } else if (typeof number === "number") {

        this.numberString = number.toString();

        this.negative = number < 0;
        number = Math.abs(number);

        this.digits = [];

        while (number > 0) {
            this.digits.push(number % this.base);
            number = Math.floor(number / this.base);
        }

    // Number is an array of digits.
    } else {
        this.digits = number;
        this.negative = negative;
        this.numberString = null;
    }

    //TODO implement properly
    this.isNegative = function() {
        return this.negative;
    }

    this.getBase = function() {
        return this.base;
    }
}


// Useful, common constants.
BigInteger.ZERO = new BigInteger();
BigInteger.ONE = new BigInteger(1);
BigInteger.TWO = new BigInteger(2);
BigInteger.THREE = new BigInteger(3);
BigInteger.TEN = new BigInteger(10)
BigInteger.NEGATIVE_ONE = new BigInteger(-1);

BigInteger.BASE = new BigInteger(1000000);

// Maximum native integer.
BigInteger.MAX_NATIVE = new BigInteger(9007199254740992);


/**
 * Helper function that removes the leading zeros from the digit array of a BigInteger.
 *
 * @param {BigInteger} number The BigInteger to be stripped.
 */
function stripLeadingZeroDigits(number) {
    while (number.digits[number.digits.length - 1] === 0)
        number.digits.length--;
}


/**
 * Helper function that determines if a string is empty or composed only of zeros.
 *
 * @param  {String} str The string to check.
 *
 * @return {Boolean} True if the string is empty or composed only of zeroes, false otherwise.
 */
function representsZero(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) !== '0')
            return false;
    }
    return true;
}


/**
 * Generates a random BigInteger in the range [0, limit).
 *
 * @param {BigInteger} limit The upper bound of the generated random number (exclusive).
 *
 * @return {BigInteger} A random BigInteger in the range [0, limit).
 */
BigInteger.random = function(limit) {

    /**
     * Generates a random number in [0, numLim).
     *
     * @param {Number} numLim The upper limit of the generated number (exclusive).
     *
     * @return {Number} A random number in [0, numLim).
     */
    var randomNumber = function(numLim) {
        return Math.floor(Math.random() * numLim);
    }

    var randDigits = new Array(limit.digits.length);

    // Put a random number in every digit of the BigInteger.
    randDigits[randDigits.length - 1] = randomNumber(limit.digits[limit.digits.length - 1]);
    for (var i = 0; i < randDigits.length - 1; i++)
        randDigits[i] = randomNumber(limit.base);

    var randomBigInteger = new BigInteger(randDigits, false);

    // Leading zeroes may have been created as random numbers. Strip them.
    stripLeadingZeroDigits(randomBigInteger);

    return randomBigInteger;
}


/**
 * Returns the largest of a number of BigIntegers.
 *
 * @param {BigInteger} A variable number of BigIntegers. At least one must be passed.
 *
 * @return {BigInteger} The largest BigInteger that was passed to the function.
 */
BigInteger.max = function() {
    if (arguments.length === 0)
        throw "No arguments passed.";

    var largest = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i].compare(largest) > 0)
            largest = arguments[i];
    }
    return largest;
}


/**
 * Returns the smallest of a number of BigIntegers.
 *
 * @param {BigInteger} A variable number of BigIntegers. At least one must be passed.
 *
 * @return {BigInteger} The smallest BigInteger that was passed to the function.
 */
BigInteger.min = function() {
    if (arguments.length === 0)
        throw "No arguments passed.";

    var smallest = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i].compare(smallest) < 0)
            smallest = arguments[i];
    }
    return smallest;
}


/**
 * Creates a new BigInteger from a string in the specified base from 2 to 36.
 *
 * @param  {String} str The string representation of the number.
 * @param  {Number} base The base of the number represented by this string. Must be in the range
 *     [2, 36].
 *
 * @return {BigInteger} A BigInteger with equivalent value of str.
 */
BigInteger.valueOf = function(str, base) {

    // Check for zero.
    if(representsZero(str))
        return BigInteger.ZERO;

    // Result where the value of the BigInteger is stored.
    var result = BigInteger.ZERO;

    // Check if the number is negative.
    if (str.charAt(0) === '-') {
        str = str.substr(1);
        result.negative = true;
    } else
        result.negative = false;

    // BigInteger value of the base.
    var bigBase = new BigInteger(base);

    // Multiplier for each digit in str.
    var multiplier = BigInteger.ONE;

    for (var i = 0; i < str.length; i++) {

        // Create a BigInteger from the current digit.
        var bigDigit = new BigInteger((function(digit) {
                if (!isNaN(digit))
                    return parseInt(digit);
                digit = digit.toUpperCase();
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(digit) + 10;
            })(str.charAt(str.length - 1 - i)));

        // If the digit is not zero, add the digit times the multipier to the result.
        if (!bigDigit.isZero())
            result = result.add(bigDigit.multiply(multiplier));

        // Multiply the multiplier by the base.
        multiplier = multiplier.multiply(bigBase);
    }

    return result;
}


/**
 * Converts the value of this BigInteger to a string.
 *
 * @return {String} A String representation of this BigInteger.
 */
BigInteger.prototype.toString = function(base) {

    // Check for null or out of range.
    if (base === null || base < 2 || base > 36)
        throw 'Base not in acceptable range of [2, 36]';

    // Check for a value of zero.
    if (this.isZero()) {
        this.numberString = '0';
        return this.numberString;
    }

    // Default displays in decimal.
    if (base === undefined || base === 10) {

        // If the BigInteger was constructed from a string, simply return that.
        if (this.numberString !== null)
            return this.numberString;

        // If the BigInteger was constructed with an Array of digits, the string must be built manually.
        this.numberString = "";
        for (var i = 0; i < this.digits.length - 1; i++) {
            var digitString = (this.digits[i] + this.base).toString();
            this.numberString = digitString.substr(1, digitString.length) + this.numberString;
        }
        this.numberString = (this.negative ? "-" : "") + this.digits[this.digits.length - 1]
            + this.numberString;

        return this.numberString;
    }

    var str = '';
    var currentValue = this;
    var bigBase = new BigInteger(base);

    while (!currentValue.isZero()) {

        // Get the string representation of the next digit.
        var newDigit = (function(digit) {
                if (digit < 10)
                    return digit.toString();
                return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(digit - 10);
            })(currentValue.modulo(bigBase).toNumber());

        // Update the current value.
        currentValue = currentValue.divide(bigBase);

        // Prepend the digit to the string.
        str = newDigit + str;
    }
    return str;
}


/**
 * Converts the BigInteger to it's Number representation. Throws an exception if the BigInteger
 * is too large to fit into a native Number object.
 *
 * @return {Number} The Number representation of this BigInteger.
 */
BigInteger.prototype.toNumber = function() {
    if (this.abs().compare(BigInteger.MAX_NATIVE) > 0)
        throw 'Value is to large to be represented by a Number.';

    var value  = 0;
    var multiplier = 1;

    for (var i = 0; i < this.digits.length; i++) {
        value += this.digits[i] * multiplier;
        multiplier *= this.base;
    }

    return (this.negative ? -1 : 1) * value;
}


/**
 * Returns a new BigInteger that is the absolute value of this BigInteger.
 *
 * @return {BigInteger} The absolute value of this BigInteger.
 */
BigInteger.prototype.abs = function() {
    return new BigInteger(this.digits, false);
}


/**
 * Returns a new BigInteger with the opposite sign of this BigInteger.
 *
 * @return {BigInteger} A BigInteger with the opposite sign of this BigInteger.
 */
BigInteger.prototype.negate = function() {
    return new BigInteger(this.digits, !this.negative);
}


/**
 * Convenience method to check if this BigInteger is equal to zero.
 *
 * @return {Boolean} True if this BigInteger has a value of zero, false otherwise.
 */
BigInteger.prototype.isZero = function() {
    return this.digits.length === 0;
}


/**
 * Convenience method that indicates whether or not this BigInteger is even. Significantly
 * cheaper than performing BigInteger.modulo(2).
 *
 * @return {Boolean} True if this BigInteger is even, false if it is odd.
 */
BigInteger.prototype.isEven = function() {
    if (this.isZero())
        return true;
    return (this.digits[0] % 2 === 0);
}


/**
 * Compares this BigInteger with another BigInteger.
 *
 * @param {BigInteger} other The BigInteger to which this one is compared.
 *
 * @return {Number} Positive if this BigInteger is greater than 'other', 0 if they are equal,
 *     or negative if this BigInteger is less than 'other'.
 */
BigInteger.prototype.compare = function (other) {

    // Check if other is null, undefined, or not a BigInteger.
    if (other === null || other === undefined || other.constructor !== BigInteger)
        throw "Object being compared is not a valid BigInteger.";

    // Check for the special case of zero.
    if (this.isZero() && other.isZero())
        return 0;

    // Compare signs.
    if (this.negative && !other.negative)
        return -1;
    if (!this.negative && other.negative)
        return 1;

    if (this.negative) {

        // Compare lengths.
        if (this.digits.length > other.digits.length)
            return -1;
        if (this.digits.length < other.digits.length)
            return 1;

        // Compare each digit until there is a difference.
        for (var i = this.digits.length - 1; i >= 0; i--) {
            if (this.digits[i] > other.digits[i])
                return -1;
            if (this.digits[i] < other.digits[i])
                return 1;
        }

    } else {

        // Compare lengths.
        if (this.digits.length > other.digits.length)
            return 1;
        if (this.digits.length < other.digits.length)
            return -1;

        // Compare each digit until there is a difference.
        for (var i = this.digits.length - 1; i >= 0; i--) {
            if (this.digits[i] < other.digits[i])
                return -1;
            if (this.digits[i] > other.digits[i])
                return 1;
        }
    }

    return 0;
}


/**
 * Convenience method for testing equality of this BigInteger and another one.
 *
 * @param {BigInteger} other The BigInteger to which to compare this one.
 *
 * @return {Boolean} True if this BigInteger and 'other' are equal, false otherwise.
 */
BigInteger.prototype.equals = function(other) {
    return this.compare(other) === 0;
}


/**
 * Convenience method for testing if this BigInteger is greater than another one.
 *
 * @param {BigInteger} other The BigInteger to which to compare this one.
 *
 * @return {Boolean} True if this BigInteger is greater than 'other', false otherwise.
 */
BigInteger.prototype.isGreaterThan = function(other) {
    return this.compare(other) > 0;
}


/**
 * Convenience method for testing if this BigInteger is less than another one.
 *
 * @param {BigInteger} other The BigInteger to which to compare this one.
 *
 * @return {Boolean} True if this BigInteger is less than 'other', false otherwise.
 */
BigInteger.prototype.isLessThan = function(other) {
    return this.compare(other) < 0;
}


/**
 * Calculates the sum of this BigInteger and another one. This function calls other private addition
 * and subtraction functions depending on the signs of the numbers.
 *
 * @param {BigInteger} other The BigInteger being added to this one.
 *
 * @return {BigInteger} The sum of this BigInteger and 'other'.
 */
BigInteger.prototype.add = function(other) {

    // Check for addition of zero.
    if (other.isZero())
        return this;

    /**
     * Calculates the sum of two BigIntegers using a standard long addition algorithm.
     *
     * @param {BigInteger} firstNumber The first BigInteger being added.
     * @param {BigInteger} secondNumber The second BigInteger being added.
     *
     * @return {BigInteger} The sum of the two BigIntegers.
     */
    var longAddition = function(firstNumber, secondNumber) {
        var newDigits = [];

        var numDigits = Math.max(firstNumber.digits.length, secondNumber.digits.length);
        var carry = 0;

        for (var i = 0; i < numDigits; i++) {
            var result;
            if (i >= firstNumber.digits.length)
                result = secondNumber.digits[i] + carry;
            else if (i >= secondNumber.digits.length)
                result = firstNumber.digits[i] + carry;
            else
                result = firstNumber.digits[i] + secondNumber.digits[i] + carry;

            carry = Math.floor(result / firstNumber.base);
            result = result % firstNumber.base;
            newDigits[i] = result;
        }

        // Add an extra digit if the carry is not zero.
        if (carry !== 0)
            newDigits[numDigits] = carry;

        return new BigInteger(newDigits, false);
    }

    // Case where both numbers are negative.
    if (this.negative && other.negative) {
        var sum = longAddition(this, other);
        sum.negative = true;
        return sum;
    }

    // Case where both numbers are positive.
    if (!this.negative && !other.negative)
        return longAddition(this, other);

    // Case of this being negative, other being positive.
    if (this.negative && !other.negative)
        return other.subtract(this.abs());

    // Case of this being positive, other being negative.
    return this.subtract(other.abs());
}


/**
 * Calculates the difference between this BigInteger and another one. This function makes calls to
 * private addition and subtraction functions depending on the signs and magnitudes of the numbers
 * involved.
 *
 * @param  {BigInteger} other The BigInteger that is subtracted from this one.
 *
 * @return {BigInteger} The difference.
 */
BigInteger.prototype.subtract = function(other) {

    // Check for subtraction of zero.
    if (other.isZero())
        return this;

    // If the numbers do not have the same sign, add the complement of other to this BigInteger.
    if (this.negative ^ other.negative)
        return this.add(other.negate());

    /**
     * Calculates the difference between this BigInteger and another one, using the method of
     * complements.
     *
     * @param {BigInteger} other The BigInteger to substract from this one.
     *
     * @return {Number} The difference, which is always returned in absolute form.
     */
    var subtractionByComplement = function(minuend, subtrahend) {

        var newDigits = new Array(subtrahend.digits.length);
        var complement = new BigInteger(newDigits, false);

        // Compute the complement of the subtrahend.
        for (var i = 0; i < subtrahend.digits.length; i++)
            complement.digits[i] = minuend.base - 1 - subtrahend.digits[i];

        // Add this and complement.
        var result = minuend.add(complement);

        // Add one to the result.
        result = result.add(BigInteger.ONE);

        // Subtract one from the most significant digit.
        result.digits[complement.digits.length]--;

        stripLeadingZeroDigits(result);

        return result;
    }

    // Both numbers are negative.
    if (this.negative) {

        // This BigInteger is less than other.
        if (this.compare(other) < 0) {
            var difference = subtractionByComplement(this.abs(), other.abs());
            difference.negative = true;
            return difference;

        // This BigInteger is greater than or equal to other.
        } else {
            var difference = subtractionByComplement(other.abs(), this.abs());
            difference.negative = false;
            return difference;
        }

    // Both numbers are positive.
    } else {

        // This BigInteger is greater than or equal to other.
        if (this.compare(other) >= 0) {
            var difference = subtractionByComplement(this.abs(), other.abs());
            difference.negative = false;
            return difference;

        // This BigInteger is less than other.
        } else {
            var difference = subtractionByComplement(other.abs(), this.abs());
            difference.negative = true;
            return difference;
        }
    }
}


/**
 * Calculates the product of this BigInteger multiplied by another.
 *
 * @param {BigInteger} other The BigInteger by which this one will be multiplied.
 *
 * @return {BigInteger} The product of the multiplication.
 */
BigInteger.prototype.multiply = function(other) {

    var result = BigInteger.ZERO;

    // Add results of the long multiplication with each digit.
    for (var i = 0; i < other.digits.length; i++)
        result = result.add(multiplyOneDigit(this, other.digits[i], i));

    // The sign of the result is the signs of the factors xor'ed.
    result.negative = this.negative ^ other.negative;

    return result;
}


/**
 * Multiplies a BigInteger by a single digit, and gives it additional magnitude.
 *
 * @param {BigInteger} number The BigInteger to be multiplied.
 * @param {Number} digit The digit by which 'number' is being multiplied.
 * @param {Number} magnitude The number of additional digits with value 0 to prepend to the
 *     digit array of the result.
 *
 * @return {BigInteger} The result of the multiplication.
 */
function multiplyOneDigit(number, digit, magnitude) {

    var newDigits = new Array(magnitude + number.digits.length + 1);

    // Initialize new digits to zero.
    for (var i = 0; i < magnitude; i++)
        newDigits[i] = 0;

    var carry = 0;

    // Perform long multiplication on the number.
    for (var i = 0; i < number.digits.length; i++) {
        var result = digit * number.digits[i] + carry;
        carry = Math.floor(result / number.base);
        result = Math.floor(result % number.base);
        newDigits[i + magnitude] = result;
    }

    // Add the carry as the msd if there is any.
    if (carry !== 0)
        newDigits[newDigits.length - 1] = carry;
    else
        newDigits.length = newDigits.length - 1;

    return new BigInteger(newDigits);
}


/**
 * Calculates the quotient of a BigInteger divided by a native JS Number object.
 * The number should be at most equal to the maximum value of base * carry + digit,
 * which means it is less than BigInteger.base squared.
 *
 * @param  {BigIngteger} bigIntegerDividend The BigInteger to be divided.
 * @param  {Number} number The number by which the BigInteger is to be divided.
 *
 * @return {BigInteger} The quotient.
 */
function divideByNativeNumber(bigIntegerDividend, number) {

    if (number === 0)
        throw "Division by zero.";

    var quotient = new Array(bigIntegerDividend.digits.length);

    // Make number absolute.
    var numNeg = number < 0;
    number = Math.abs(number);

    var carry = 0;

    // Perform long division.
    for (var i = quotient.length - 1; i >= 0; i--){
        var result = bigIntegerDividend.base * carry + bigIntegerDividend.digits[i];
        quotient[i] = Math.floor(result / number);
        carry = result % number;
    }

    var result = new BigInteger(quotient, bigIntegerDividend.negative ^ numNeg);

    stripLeadingZeroDigits(result);

    return result;
}


/**
 * Calculates a 'trial' digit in long division. A trial digit is a (educated) guess as to what the
 * next digit in the division should be. The trial digit is usually calculated with the first two
 * digits of the dividend and the divisor. If only one is available, then just it is used.
 * Occasionally, when the digits of the dividend are less than the divisor, we use three digits in
 * the divisor.
 *
 * @param  {BigInteger} dividend The dividend.
 * @param  {Number} firstTwoDivisorDigits The value of the first two digits of the divisor. These
 *     are not calculated in this function because they are static for the entire division and
 *     modulo algorithms.
 * @param  {Boolean} useThreeDigits True if three digits should be taken into account for the
 *     divisor, false otherwise.
 *
 * @return {Number} The value of the trial digit.
 */
function trialDigit(dividend, firstTwoDivisorDigits, useThreeDigits) {

    var firstTwoDividendDigits = firstTwoDigits(dividend);
    if (useThreeDigits && dividend.digits.length > 2) {
        firstTwoDivisorDigits /= dividend.base;
        firstTwoDividendDigits += dividend.digits[dividend.digits.length - 3] / dividend.base;
    }

    return Math.floor(firstTwoDividendDigits / firstTwoDivisorDigits);
}


/**
 * Calculates the value of the first two digits of the BigInteger. Returns zero if the BigInteger
 * is empty. If there is only one digit, returns the value of that digit.
 *
 * @param  {BigInteger} number The BigInteger from which the first two digits are taken.
 *
 * @return {Number} The value of the first two digits of 'number'.
 */
function firstTwoDigits(number) {
    var size = number.digits.length;

    if (size === 0)
        return 0;

    var part = number.digits[size - 1];
    if (size > 1)
        part = part * number.base + number.digits[size - 2];

    return part;
}


/**
 * Calculates the quotient of this BigInteger divided by another.
 *
 * @param  {BigInteger} other The divisor.
 *
 * @return {BigInteger} The quotient.
 */
BigInteger.prototype.divide = function(other) {



    // Create positive versions of this and other.
    var dividend = this.abs();
    var divisor = other.abs();

    // If the dividend is less than the divisor, zero can be immediately returned.
    if (dividend.compare(divisor) < 0)
        return BigInteger.ZERO;

    // If the dividend is less than the value of the maximum JS number, primitive
    // division can be used. Note that 'this' and 'other' are used instead of
    // 'dividend' and 'divisor' to maintain sign value.
    if (dividend.compare(BigInteger.MAX_NATIVE) < 0) {
        var negativeMultiplier = (this.negative ^ other.negative) ? -1 : 1;
        var magnitude = Math.floor(Math.abs(this.toNumber() / other.toNumber()));
        return new BigInteger(negativeMultiplier * magnitude);
    }

    // If the divisor is less than the value of the base squared, a simpler long division
    // algorithm can be used.
    if (divisor.compare(BigInteger.MAX_NATIVE) < 0)
        return divideByNativeNumber(this, other.toNumber());


    // useThreeDigits flag indicates we are going to include two digits from the divisor in our
    // trial digit calculation. This occurs when the first digit is smaller than that
    // of the divisor. That digit in the quotient is filled with a zero and we move
    // onto the next, but we must include the unused previous digit from the dividend.
    var useThreeDigits = false;

    // Position indicates the current place in the quotient for which we are calculating a digit.
    var pos = dividend.digits.length - divisor.digits.length;

    // Precalculate the value of the first two digits of the divisor, since the divisor does not
    // change throughout the computation.
    var firstTwoDivisorDigits = firstTwoDigits(divisor);

    // If the MSD of the dividend is less than the MSD of the divisor, reduce position and activate
    // flag.
    if (firstTwoDivisorDigits > firstTwoDigits(dividend)) {
        pos--;
        useThreeDigits = true;
    }

    // Create quotient digit array.
    var quotient = new Array(pos + 1);

    while (pos >= 0) {

        // Calculate a trial digit.
        var qt = trialDigit(dividend, firstTwoDivisorDigits, useThreeDigits);

        // Calculate product of current quotient and divisor.
        var product = multiplyOneDigit(divisor, qt, pos);

        // If the product is greater than the actual quotient, then the trial digit is too large. It
        // is only possible for the trial digit to be too large by 1, so be subtract 1 and are left
        // with the correct digit.
        if (product.compare(dividend) > 0) {
            qt--;
            product = multiplyOneDigit(divisor, qt, pos);
        }

        // If the trial digit is 0, there is no need to subtract the product (of 0) from the
        // dividend.
        if (qt === 0) {
            pos--;
            useThreeDigits = true;
            continue;
        }

        // Subtract the product from the dividend.
        dividend = dividend.subtract(product);

        // Put the trial digit in the quotient.
        quotient[pos] = qt;

        // Calculate the new position in the quotient.
        pos = dividend.digits.length - divisor.digits.length;

        // If the MSD of the dividend is less than the MSD of the divisor, reduce position and
        // activate flag.
        if (pos >= 0 && firstTwoDivisorDigits > firstTwoDigits(dividend)) {
            pos--;
            useThreeDigits = true;
        } else
            useThreeDigits = false;
    }

    return new BigInteger(quotient, this.negative ^ other.negative);
}


/**
 * Calculates the result of this BigInteger modulo another BigInteger. The result is always positive
 * regardless of the signs of the dividend or divisor.
 *
 * @param  {BigInteger} other The modulus. Cannot be zero.
 *
 * @return {BigInteger} The result.
 */
BigInteger.prototype.modulo = function(other) {

    // Throw an exception for a modulus of zero.
    if (other.isZero())
        throw "Modulus cannot be zero.";

    // Create positive versions of this and other.
    var dividend = this.abs();
    var divisor = other.abs();

    // If the dividend is less than the divisor, simply return the dividend.
    if (dividend.compare(divisor) < 0)
        return dividend;

    // If the dividend is less than the value of the maximum JS number, primitive modulo can be
    // used. Note that 'this' and 'other' are used instead of 'dividend' and 'divisor' to maintain
    // sign value.
    if (dividend.compare(BigInteger.MAX_NATIVE) < 0)
        return new BigInteger(Math.floor(Math.abs(this.toNumber() % other.toNumber())));

    // If the divisor is smaller than a single digit, we can use a simpler function to calculate the
    // remainder.
    if (divisor.compare(new BigInteger(this.base)) < 0)
        return (function(number, mod){
            var carry = 0;
            for (var i = number.digits.length - 1; i >= 0; i--)
                carry = (carry * number.base + number.digits[i]) % mod;
            return new BigInteger(carry);
        })(this, other.toNumber());

    // useThreeDigits flag indicates we are going to include two digits from the divisor in our
    // trial digit calculation. This occurs when the first digit is smaller than that of the
    // divisor. That digit in the quotient is a zero and we move onto the next one, but we must
    // include the unused previous digit from the dividend.
    var useThreeDigits = false;

    // Position indicates the current place in the quotient for which we are calculating a digit.
    var pos = dividend.digits.length - divisor.digits.length;

    // Precalculate the value of the first two digits of the divisor, since the divisor does not
    // change throughout the computation.
    var firstTwoDivisorDigits = firstTwoDigits(divisor);

    // If the MSD of the dividend is less than the MSD of the divisor, reduce position and activate
    // flag.
    if (firstTwoDivisorDigits > firstTwoDigits(dividend)) {
        pos--;
        useThreeDigits = true;
    }

    while (pos >= 0) {

        // Calculate a trial digit.
        var qt = trialDigit(dividend, firstTwoDivisorDigits, useThreeDigits);

        // Calculate product of current quotient and divisor.
        var product = multiplyOneDigit(divisor, qt, pos);

        // If the product is greater than the actual quotient, then the trial digit is too large. It
        // is only possible for the trial digit to be too large by 1, so be subtract 1 and are left
        // with the correct digit.
        if (product.compare(dividend) > 0) {
            qt--;
            product = multiplyOneDigit(divisor, qt, pos);
        }

        // If the trial digit is 0, there is no need to subtract the product (of 0) from the
        // dividend.
        if (qt === 0) {
            pos--;
            useThreeDigits = true;
            continue;
        }

        // Subtract the product from the dividend.
        dividend = dividend.subtract(product);

        // Calculate the new position in the quotient.
        pos = dividend.digits.length - divisor.digits.length;

        // If the MSD of the dividend is less than the MSD of the divisor, reduce position and
        // activate flag.
        if (pos >= 0 && firstTwoDivisorDigits > firstTwoDigits(dividend)) {
            pos--;
            useThreeDigits = true;
        } else
            useThreeDigits = false;
    }

    return dividend;
}


/**
 * Calculates this BigInteger raised to the power of a number.
 *
 * @param {Number} exponent The exponent.
 *
 * @return {BigInteger} The result.
 */
BigInteger.prototype.pow = function(exponent) {

    // Throw an error is exponent is NaN.
    if (typeof(exponent) !== 'number')
        throw 'Exponent is not a number.';

    // Throw an error if the exponent is negative.
    if (exponent < 0)
        throw 'Negative exponent.';

    /**
     * Calculates the result of one BigInteger raised to the power of a number using the
     * exponentiation by squaring method.
     *
     * @param  {BigInteger} base The base.
     * @param  {Number} exponent The exponent.
     *
     * @return {BigInteger} The result.
     */
    var exponentiationBySquaring = function(base, exponent) {
        if (exponent === 0)
            return BigInteger.ONE;
        if (exponent === 1)
            return base;
        if (exponent % 2 === 0)
            return exponentiationBySquaring(base.multiply(base), exponent / 2);
        return base.multiply(exponentiationBySquaring(base.multiply(base), (exponent - 1) / 2));
    }

    return exponentiationBySquaring(this, exponent);
}


/**
 * Calculates the modulus of this BigInteger raised to some power.
 *
 * @param {BigInteger} exponent The exponent to which this BigInteger is raised.
 * @param {BigInteger} modulus The modulus.
 *
 * @return {BigInteger} The result of the modPow operation.
 */
BigInteger.prototype.modPow = function(exponent, modulus) {

    // Throw an error if the exponent is negative.
    if (exponent.negative)
        throw "Negative exponent.";

    var result = BigInteger.ONE;
    var base = this;

    while (exponent.compare(BigInteger.ZERO) > 0) {
        if (exponent.isEven()) {
            base = base.multiply(base).modulo(modulus);
            exponent = exponent.divide(BigInteger.TWO);
        } else {
            result = result.multiply(base).modulo(modulus);
            exponent = exponent.subtract(BigInteger.ONE);
        }
    }

    return result;
}


/**
 * Checks if the this BigInteger is a probable prime. Will always return true for primes, but may
 * not always return false for some composites which are strong liars. In other words, false
 * indicates that the number is definitely composite, but true does not necessarily mean it is
 * prime.
 *
 * @param {Number} witnessLoops The number of witness loops through which to iterate. More loops
 *    reduce the chance of incorrectly identifying composite numbers as prime.
 *
 * @return {Boolean} True if the number is probably prime, false otherwise.
 */
BigInteger.prototype.isPrime = function(witnessLoops) {

    // Check for an incorrect parameter.
    if (witnessLoops != undefined && (witnessLoops === null || typeof(witnessLoops) != "number"
            || witnessLoops < 1))
        throw "Number of witness loops must be a positive integer."

    // Return false for any value equal to or below 1.
    if (this.compare(BigInteger.ONE) <= 0)
        return false;

    // Return true for a value of 2 or 3.
    if (this.compare(BigInteger.THREE) <= 0)
        return true;

    // If the number is divisible by 2, 3, or 5.
    if(this.isEven() || this.modulo(BigInteger.THREE) === 0 || this.digits[0] % 5 === 0)
        return false;

    // Set witnessLoops if it was not set by the user.
    if (witnessLoops === undefined)
        witnessLoops = 5;

    var nSub1 = this.subtract(BigInteger.ONE);
    var d = nSub1;

    var count = 0;

    // Factor out power of two from the number.
    while (d.isEven()) {
        d = d.divide(BigInteger.TWO);
        count++;
    }

    for (var i = 0; i < witnessLoops; i++) {

        // Random integer in [2, n - 2].
        var a = BigInteger.random(this.subtract(BigInteger.THREE)).add(BigInteger.TWO);

        var x = a.modPow(d, this);

        if (x.compare(BigInteger.ONE) === 0 || x.compare(nSub1) === 0)
            continue;

        for (var j = 0; j < count - 1; j++) {
            x = x.multiply(x).modulo(this);

            if (x.compare(BigInteger.ONE) === 0)
                return false;

            if (x.compare(nSub1) === 0)
                break;
        }
        if (x.compare(nSub1) !== 0)
            return false;
    }

    return true;
}


// Create some numbers to test with.
var num1000 = new BigInteger("1000");
var num800 = new BigInteger("800");
var num1E5 = new BigInteger("100000");
var num9E6 = new BigInteger("9000000");
var num5E6 = new BigInteger("5000000");
var num4E20 = new BigInteger("400000000000000000000");
var num7E16 = new BigInteger("70000000000000000");
var num2E16 = new BigInteger("20000000000000000");

var numNeg1000 = new BigInteger("-1000");
var numNeg800 = new BigInteger("-800");
var numNeg1E5 = new BigInteger("-100000");
var numNeg9E6 = new BigInteger("-9000000");
var numNeg5E6 = new BigInteger("-5000000");
var numNeg4E20 = new BigInteger("-400000000000000000000");
var numNeg7E16 = new BigInteger("-70000000000000000");
var numNeg2E16 = new BigInteger("-20000000000000000");


/** Test the constructor **/

console.assert((new BigInteger("0")).compare(BigInteger.ZERO) === 0);

console.assert((new BigInteger(0)).compare(BigInteger.ZERO) === 0);

console.assert((new BigInteger("")).compare(BigInteger.ZERO) === 0);


/** Test toString() **/

// Test toString() with an empty constructor.
console.assert((new BigInteger()).toString() === '0')

// Test BigInteger.toString() with positive number, multiple digits.
console.assert(num9E6.toString() === '9000000');

// Test BigInteger.toString() with negative number, multiple digits.
console.assert(numNeg5E6.toString() === '-5000000');

// Test BigInteger.toString() with positive number, one digit, with only one decimal order of
// magnitude less than BigInteger.base.
console.assert(numNeg1E5.toString() === '-100000');

// Test conversion to a lower base.
console.assert((new BigInteger(8)).toString(2) === '1000');

// Test convervion to a base higher than decimal.
console.assert((new BigInteger(123456789)).toString(16) === '75BCD15');


/** Test toNumber() **/

// Test with zero.
console.assert(BigInteger.ZERO.toNumber() === 0);

// Test with a negative number constructed from a number.
console.assert((new BigInteger("-1234567")).toNumber() === -1234567);

// Test with a positive number constructed from a number.
console.assert((new BigInteger(11223344)).toNumber() === 11223344);


/** Test valueOf() **/

console.assert(BigInteger.valueOf("1234567890", 10).compare(new BigInteger("1234567890")) === 0);

console.assert(BigInteger.valueOf("100000000", 2).compare(new BigInteger(256)) === 0);

console.assert(BigInteger.valueOf("ffffff", 16).compare(new BigInteger(16777215)) === 0);

console.assert(BigInteger.valueOf("nameisadam", 30).compare(new BigInteger("459761806362022")) === 0);


/** Test compare(...) **/

// Test === with positive number, multiple digits.
console.assert(num9E6.compare(new BigInteger("9000000")) === 0);

// Test === with negative number, multiple digits.
console.assert(numNeg9E6.compare(new BigInteger("-9000000")) === 0);

// Test > with positive numbers, same order of magnitude.
console.assert(num9E6.compare(num5E6) > 0);

// Test > with positive numbers, different orders of magnitude.
console.assert(num5E6.compare(num800) > 0);

// Test > with negative numbers, same order of magnitude.
console.assert(numNeg5E6.compare(numNeg9E6) > 0);

// Test > with negative numbers, different orders of magnitude.
console.assert(numNeg800.compare(numNeg5E6) > 0);

// Test < with positive numbers, same order of magnitude.
console.assert(num5E6.compare(num9E6) < 0);

// Test < with positive numbers, different orders of magnitude.
console.assert(num800.compare(num5E6) < 0);

// Test < with negative numbers, same order of magnitude.
console.assert(numNeg9E6.compare(numNeg5E6) < 0);

// Test < with negative numbers, different orders of magnitude.
console.assert(numNeg5E6.compare(numNeg800) < 0);


/** Test equals(...) **/

// Test === with positive number, multiple digits.
console.assert(num9E6.equals(new BigInteger("9000000")));

// Test === with negative number, multiple digits.
console.assert(numNeg9E6.equals(new BigInteger("-9000000")));


/** Test isGreaterThan(...) **/

// Test > with positive numbers, same order of magnitude.
console.assert(num9E6.isGreaterThan(num5E6));

// Test > with positive numbers, different orders of magnitude.
console.assert(num5E6.isGreaterThan(num800));

// Test > with negative numbers, same order of magnitude.
console.assert(numNeg5E6.isGreaterThan(numNeg9E6));

// Test > with negative numbers, different orders of magnitude.
console.assert(numNeg800.isGreaterThan(numNeg5E6));


/** Test isLessThan(...) **/

// Test < with positive numbers, same order of magnitude.
console.assert(num5E6.isLessThan(num9E6));

// Test < with positive numbers, different orders of magnitude.
console.assert(num800.isLessThan(num5E6));

// Test < with negative numbers, same order of magnitude.
console.assert(numNeg9E6.isLessThan(numNeg5E6));

// Test < with negative numbers, different orders of magnitude.
console.assert(numNeg5E6.isLessThan(numNeg800));


/** Test max(...) **/

// Test with a single argument.
console.assert(BigInteger.max(new BigInteger("1234567890")).compare(new BigInteger("1234567890")) === 0);

// Test two equal numbers.
console.assert(BigInteger.max(new BigInteger("1234567890"), new BigInteger("1234567890")).compare(new BigInteger("1234567890")) === 0);

// Test two positives, with the first greater.
console.assert(BigInteger.max(new BigInteger("1234567890"), new BigInteger("123456789")).compare(new BigInteger("1234567890")) === 0);

// Test two positives, with the second greater.
console.assert(BigInteger.max(new BigInteger("56789"), new BigInteger("123456789")).compare(new BigInteger("123456789")) === 0);

// Test two negatives, with the first greater.
console.assert(BigInteger.max(new BigInteger("-56789"), new BigInteger("-123456789")).compare(new BigInteger("-56789")) === 0);

// Test a negative and a positive.
console.assert(BigInteger.max(new BigInteger("-56789"), new BigInteger("45")).compare(new BigInteger("45")) === 0);

// Test with more than two arguments.
console.assert(BigInteger.max(new BigInteger("-56789"), new BigInteger("4500"), new BigInteger("67000000")).compare(new BigInteger("67000000")) === 0);


/** Test min(...) **/

// Test with a single argument.
console.assert(BigInteger.min(new BigInteger("1234567890")).compare(new BigInteger("1234567890")) === 0);

// Test two equal numbers.
console.assert(BigInteger.min(new BigInteger("1234567890"), new BigInteger("1234567890")).compare(new BigInteger("1234567890")) === 0);

// Test two positives, with the second less than the first.
console.assert(BigInteger.min(new BigInteger("1234567890"), new BigInteger("123456789")).compare(new BigInteger("123456789")) === 0);

// Test two positives, with the first less than the second.
console.assert(BigInteger.min(new BigInteger("56789"), new BigInteger("123456789")).compare(new BigInteger("56789")) === 0);

// Test two negatives, with the second less than the first.
console.assert(BigInteger.min(new BigInteger("-56789"), new BigInteger("-123456789")).compare(new BigInteger("-123456789")) === 0);

// Test a negative and a positive.
console.assert(BigInteger.min(new BigInteger("-56789"), new BigInteger("45")).compare(new BigInteger("-56789")) === 0);

// Test with more than two arguments.
console.assert(BigInteger.min(new BigInteger("-56789"), new BigInteger("4500"), new BigInteger("67000000")).compare(new BigInteger("-56789")) === 0);


/** Test add(...) **/

// Test addition with two positive numbers.
console.assert(num9E6.add(num5E6).compare(new BigInteger("14000000")) === 0);

// Test addition with two negative numbers.
console.assert(numNeg9E6.add(numNeg5E6).compare(new BigInteger("-14000000")) === 0);

// Test addition with negative added to positive.
console.assert(num9E6.add(numNeg5E6).compare(new BigInteger("4000000")) === 0);

// Test addition with positive added to negative.
console.assert(numNeg9E6.add(num5E6).compare(new BigInteger("-4000000")) === 0);


/** Test subtract(...) **/

// Test subtraction with a positive number minus itself.
console.assert(num5E6.subtract(num5E6).compare(BigInteger.ZERO) === 0);

// Test subtraction with a negative number minus itself.
console.assert(numNeg5E6.subtract(numNeg5E6).compare(BigInteger.ZERO) === 0);

// Test subtraction with two positive numbers, greater - lesser.
console.assert(num9E6.subtract(num5E6).compare(new BigInteger("4000000")) === 0);

// Test subtraction with two positive numbers, lesser - greater.
console.assert(num5E6.subtract(num9E6).compare(new BigInteger("-4000000")) === 0);

// Test subtraction with two negative numbers, lesser - greater.
console.assert(numNeg9E6.subtract(numNeg5E6).compare(new BigInteger("-4000000")) === 0);

// Test subtraction with two negative numbers, greater - lesser.
console.assert(numNeg5E6.subtract(numNeg9E6).compare(new BigInteger("4000000")) === 0);

// Test subtraction with negative - positive.
console.assert(numNeg9E6.subtract(num5E6).compare(new BigInteger("-14000000")) === 0);

// Test subtraction with positive - negative.
console.assert(num9E6.subtract(numNeg5E6).compare(new BigInteger("14000000")) === 0);

// Test a number beginning with a 1, minus 1.
console.assert((new BigInteger(15000000)).subtract(BigInteger.ONE).compare(new BigInteger(14999999)) === 0);


/** Test multiply(...) **/

// Test multiply with result greater order of magnitude than factors.
console.assert(num800.multiply(num1E5).compare(new BigInteger("80000000")) === 0);

// Test multiplication with two positive numbers.
console.assert(num9E6.multiply(num5E6).compare(new BigInteger("45000000000000")) === 0);

// Test multiplication with two negative numbers.
console.assert(numNeg9E6.multiply(numNeg5E6).compare(new BigInteger("45000000000000")) === 0);

// Test multiplication with one positive and one negative number.
console.assert(numNeg9E6.multiply(num5E6).compare(new BigInteger("-45000000000000")) === 0);


/** Test divide(...) **/

// Test division with number dividing itself.
console.assert(num9E6.divide(num9E6).compare(new BigInteger("1")) === 0);

// Test division with smaller number divided by larger number.
console.assert(num5E6.divide(num9E6).compare(new BigInteger("0")) === 0);

// Test division with both numbers less than Number.MAX_INT.
console.assert(num5E6.divide(num1E5).compare(new BigInteger("50")) === 0);

// Test division with both numbers less than Number.MAX_INT, with non-even result.
console.assert(num9E6.divide(num5E6).compare(new BigInteger("1")) === 0);

// Test division with a number larger than Number.MAX_INT, and a divisor which isn't.
console.assert(num7E16.divide(num5E6).compare(new BigInteger("14000000000")) === 0);

// Repeat the above test with one value negative.
console.assert(numNeg7E16.divide(num5E6).compare(new BigInteger("-14000000000")) === 0);

// Repeat the above test with both values negative.
console.assert(numNeg7E16.divide(numNeg5E6).compare(new BigInteger("14000000000")) === 0);

// Test division with two numbers that are both larger than Number.MAX_INT.
console.assert(num7E16.divide(num2E16).compare(new BigInteger(3)) === 0);

// Repeat the above test with a negative divisor.
console.assert(num7E16.divide(numNeg2E16).compare(new BigInteger(-3)) === 0);

// Test division with a significantly larger dividend.
console.assert(num4E20.divide(num7E16).compare(new BigInteger(5714)) === 0);

// Test division with a two numbers that have equal first digits (but do not divide cleanly).
console.assert(num2E16.divide(new BigInteger("2000000000001234")).compare(new BigInteger(9)) === 0);


/** Test modulo(...) **/

// Test modulo with the same number.
console.assert(num7E16.modulo(num7E16).compare(BigInteger.ZERO)  === 0);

// Test modulo with smaller number % larger number.
console.assert(num2E16.modulo(num7E16).compare(num2E16)  === 0);

// Test with a negative number.
console.assert((new BigInteger("-1234567890")).modulo(new BigInteger(4545454)).compare(new BigInteger(2749856)) === 0);

// Test with large numbers.
console.assert((new BigInteger("135546343434234528")).modulo(new BigInteger("54657342556")).compare(new BigInteger("14566676004")) === 0);
console.assert((new BigInteger("8326445093271549824986317")).modulo(new BigInteger("8235329764373457")).compare(new BigInteger("2739574529170425")) === 0);
console.assert((new BigInteger("3324094572302349474629238")).modulo(new BigInteger("2355463456645787980")).compare(new BigInteger("944770484040977778")) === 0);
console.assert((new BigInteger("46598234734957437345")).modulo(new BigInteger("98340063749944")).compare(new BigInteger("90547237722777")) === 0);
console.assert((new BigInteger("225094688443758234773948532")).modulo(new BigInteger("576388348357322834364352")).compare(new BigInteger("303232584402329371851252")) === 0);


/** Test pow(...) **/

// Test with non-zero base and exponent of zero.
console.assert(BigInteger.TEN.pow(0).compare(BigInteger.ONE) === 0);

// Test with base of zero and non-zero exponent.
console.assert(BigInteger.ZERO.pow(10).compare(BigInteger.ZERO) === 0);

// Test zero raised to the zero.
console.assert(BigInteger.ZERO.pow(0).compare(BigInteger.ONE) === 0);

// Additional tests.
console.assert(BigInteger.TWO.pow(64).compare(new BigInteger("18446744073709551616")) === 0);
console.assert((new BigInteger(1234)).pow(10).compare(new BigInteger("8187505353567209228244052427776")) === 0);
console.assert((new BigInteger(1002030)).pow(7).compare(new BigInteger("1014296832285033013205252695154427870000000")) === 0);


/** Test modPow(...) **/

// Test with a base of zero. Result should be 0 unless the exponent is 0.
console.assert(BigInteger.ZERO.modPow(BigInteger.TEN, BigInteger.THREE).compare(BigInteger.ZERO) === 0);

// Test with a base and exponent of zero. Result should be 1 regardless of modulus.
console.assert(BigInteger.ZERO.modPow(BigInteger.ZERO, new BigInteger("1000000000000")).compare(BigInteger.ONE) === 0);

// Test with small numbers.
console.assert((new BigInteger(1234)).modPow(new BigInteger(100), new BigInteger(5675)).compare(new BigInteger(2976)) === 0);
console.assert((new BigInteger(34152124)).modPow(new BigInteger(132434), new BigInteger(98434562)).compare(new BigInteger(45277914)) === 0);
console.assert((new BigInteger(678753365)).modPow(new BigInteger(1244687965), new BigInteger(343679864)).compare(new BigInteger(72297501)) === 0);

// Test with large numbers.
console.assert((new BigInteger('2430957173853042962243656')).modPow(new BigInteger('987342561893547832'), new BigInteger('5983475872376235874569843')).compare(new BigInteger('905570691752001406787623')) === 0);
console.assert((new BigInteger('19835634509568237234940045')).modPow(new BigInteger('8937526649545345000003247328'), new BigInteger('673578234651248345983472834')).compare(new BigInteger('350736991726113048455882751')) === 0);
console.assert((new BigInteger('450924756723458456900128335734590483672')).modPow(new BigInteger('66657859236735983457291912483475345322'), new BigInteger('98870002362348234612002347384')).compare(new BigInteger('6527423847839304886258924072')) === 0);


/** Test isEven() **/

// Test with zero.
console.assert(BigInteger.ZERO.isEven());

// Test with one.
console.assert(!BigInteger.ONE.isEven());

// Test with multi-digit even number.
console.assert((new BigInteger("123456789098765432")).isEven());

// Test with multi-digit odd number.
console.assert(!(new BigInteger("98765432123456789")).isEven());


/** Test isZero() **/

// Test with zero.
console.assert(BigInteger.ZERO.isZero());

// Test with a positive number.
console.assert(!BigInteger.ONE.isZero());

// Test with a positive number.
console.assert(!BigInteger.NEGATIVE_ONE.isZero());


/** Test abs() **/

// Test with zero.
console.assert(BigInteger.ZERO.abs().compare(BigInteger.ZERO) === 0);

// Test with a positive number.
console.assert(BigInteger.ONE.abs().compare(BigInteger.ONE) === 0);

// Test with a negative number.
console.assert(BigInteger.NEGATIVE_ONE.abs().compare(BigInteger.ONE) === 0);


/** Test negate() **/

// Test that negate has no effect on zero.
console.assert(BigInteger.ZERO.negate().compare(BigInteger.ZERO) === 0);

// Test with a positive number.
console.assert(BigInteger.ONE.negate().compare(BigInteger.NEGATIVE_ONE) === 0);

// Test with a negative number. m
console.assert(BigInteger.NEGATIVE_ONE.negate().compare(BigInteger.ONE) === 0);


/** Test isPrime() **/

// Test that 0 is not prime.
console.assert(!BigInteger.ZERO.isPrime());

// Test that 1 is not primes.
console.assert(!BigInteger.ONE.isPrime());

// Test that 2 is prime.
console.assert(BigInteger.TWO.isPrime());

// Test that 3 is prime.
console.assert(BigInteger.THREE.isPrime());

// Test a very small composite number.
console.assert(!BigInteger.TEN.isPrime());

// Test a very small prime number.
console.assert((new BigInteger(11)).isPrime());

// Test a composite number divisible by 2.
console.assert(!(new BigInteger("1000000000000000000000000")).isPrime());

// Test a composite number divisible by 3.
console.assert(!(new BigInteger("3333333333333333333333333")).isPrime());

// Test large composite only divisible by primes greater than 10,000.
console.assert(!(new BigInteger(8226930013)).isPrime());

// Test large composite only divisible by primes greater than 10,000,000.
console.assert(!(new BigInteger("773978878498831")).isPrime());

// Test primes with one digit.
console.assert((new BigInteger(78607)).isPrime());
console.assert((new BigInteger(104659)).isPrime());

// Test primes with two digits.
console.assert((new BigInteger(15485863)).isPrime());
console.assert((new BigInteger(735632797)).isPrime());

// Test primes with three digits.
console.assert((new BigInteger(4398042316799)).isPrime());
console.assert((new BigInteger("18014398241046527")).isPrime());

// Test large primes (four or more digits).
console.assert((new BigInteger("18446744082299486207")).isPrime());
console.assert((new BigInteger("523347633027360537213687137")).isPrime());
console.assert((new BigInteger("1066340417491710595814572169")).isPrime());
console.assert((new BigInteger("10888869450418352160768000001")).isPrime());
console.assert((new BigInteger("19134702400093278081449423917")).isPrime());
console.assert((new BigInteger("162259276829213363391578010288127")).isPrime());
console.assert((new BigInteger("265252859812191058636308479999999")).isPrime());
console.assert((new BigInteger("1298074214633706835075030044377087")).isPrime());
console.assert((new BigInteger("263130836933693530167218012159999999")).isPrime());
console.assert((new BigInteger("8683317618811886495518194401279999999")).isPrime());
console.assert((new BigInteger("43143988327398957279342419750374600193")).isPrime());
console.assert((new BigInteger("35742549198872617291353508656626642567")).isPrime());
console.assert((new BigInteger("393050634124102232869567034555427371542904833")).isPrime());
console.assert((new BigInteger("359334085968622831041960188598043661065388726959079837")).isPrime());




console.log("Testing complete.");
