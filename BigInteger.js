/* TODO
 * Finish commenting
 * Proper formatting
 * Add checking for array and string type in constructor
 * Have constructor handle no parameters
 */

function BigInteger(number, negative) {


    this.base = 1000000;
    this.logbase = 6;

    // Number is a string.
    if (typeof number === "string") {

        this.numberString = number;

        if (number.charAt(0) === '-') {
            number = number.substr(1);
            this.negative = true;
        } else {
            this.negative = false;
        }

        var numDigits = Math.ceil(number.length / this.logbase);
        this.digits = new Array(numDigits);

        var excess = number.length % this.logbase;
        excess = excess == 0 ? this.logbase : excess;
        this.digits[numDigits - 1] = parseInt(number.substr(0, excess));

        for (var i = 1; i < numDigits; i++) {
            this.digits[i - 1] = parseInt(number.substr(number.length - this.logbase * i, this.logbase));
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
}


/**
 * Returns the value of this BigInteger as a string.
 */
BigInteger.prototype.toString = function() {

    // If the BigInteger was constructed from a string, simply return that.
    if (this.numberString != null)
        return this.numberString;

    // If the BigInteger was constructed with an Array of digits, the
    // string must be built manually.
    var string = "";
    for (var i = 0; i < this.digits.length - 1; i++) {
        var digitString = (this.digits[i] + this.base).toString();
        string = digitString.substr(1, digitString.length) + string;
    }
    string = this.digits[i] + string;

    return (this.negative ? "-" : "") + string;
}


BigInteger.prototype.add = function(other) { //TODO remove redundancy my manually handling subtraction cases (only calls to subtractByComplements should be made)
    if (this.negative && other.negative) {
        var result = this.addBackend(other);
        result.negative = true;
        return result;
    } else if (!this.negative && !other.negative) {
        var result = this.addBackend(other);
        result.negative = false;
        return result;
    } else if (this.negative && !other.negative) {
        var positiveThis = new BigInteger(this.digits, false);
        return other.subtract(positiveThis);
    } else {
        var positiveOther = new BigInteger(other.digits, false);
        return this.subtract(positiveOther);
    }
}


/**
 * Add another BigInteger to this one, returning the sum as a new
 * BigInteger.
 */
BigInteger.prototype.addBackend = function(other) { //TODO rename
    var newDigits = [];

    var numDigits = Math.max(this.digits.length, other.digits.length);
    var carry = 0;

    for (var i = 0; i < numDigits; i++) {
        var result;
        if (i >= this.digits.length)
            result = other.digits[i] + carry;
        else if (i >= other.digits.length)
            result = this.digits[i] + carry;
        else
            result = this.digits[i] + other.digits[i] + carry;

        carry = Math.floor(result / this.base);
        result = result % this.base;
        newDigits[i] = result;
    }

    if (carry != 0)
        newDigits[numDigits] = carry;

    return new BigInteger(newDigits, false);
}


BigInteger.prototype.subtract = function(other) {

    if (this.negative) {
        if (other.negative) {
            if (this.isLessThan(other)) {
                    // Subtract other from this, result negative.
                    var result = this.subtractByComplement(other);
                    result.negative = true;
                    return result;
            } else {
                    // Subtract this from other, result positive.
                    var result = other.subtractByComplement(this);
                    result.negative = false;
                    return result;
            }
        } else {
            var result = this.addBackend(other);
            result.negative = true;
            return result;
        }
    } else {
        if (other.negative) {
            var result = this.addBackend(other);
            result.negative = false;
            return result;
        } else {

            if (this.isGreaterThan(other) || this.equals(other)) {
                    // Subtract other from this, result negative.
                    var result = this.subtractByComplement(other);
                    result.negative = false;
                    return result;
            } else {
                    // Subtract this from other, result positive.
                    var result = other.subtractByComplement(this);
                    result.negative = true;
                    return result;
            }
        }
    }
}


/**
 * Subtract another BigInteger from this one, using the method
 * of complements. The difference is returned as a new BigInteger.
 */
BigInteger.prototype.subtractByComplement = function(other) {

    // Create positive version of this and the other.
    var positiveThis = new BigInteger(this.digits, false);
    var positiveOther = new BigInteger(other.digits, false);

    // Return a copy of this BigInteger if the other number is zero/empty.
    if (positiveOther.digits.length === 0)
        return new BigInteger(positiveThis.digits);

    var newDigits = new Array(positiveOther.digits.size);
    var complement = new BigInteger(newDigits, false);

    // Compute the complement of the subtrahend.
    for (var i = 0; i < positiveOther.digits.length; i++)
        complement.digits[i] = positiveThis.base - 1 - positiveOther.digits[i];

    // Add this and complement.
    var result = positiveThis.add(complement);

    // Add one to the result.
    result = result.add(new BigInteger("1"));

    // Subtract one from the most significant digits.
    var msdIndex = result.digits.length - 1;
    var msd = result.digits[msdIndex] - Math.pow(10, Math.floor(Math.log(result.digits[msdIndex]) / Math.LN10));

    // Removing leading zeros if they have been introduced by reducing the msd.
    if (msd === 0) {
        result.digits.length--;
        while (result.digits[result.digits.length - 1] === 0 && result.digits.length > 1)
            result.digits.length--;
    } else
        result.digits[msdIndex] = msd;

    return result;
}


/**
 * Multiplies this BigInteger with another BigInteger and returns the product.
 */
BigInteger.prototype.multiply = function(other) {

    var result = new BigInteger("0");

    // Add results of the long multiplication with each digit.
    for (var i = 0; i < other.digits.length; i++)
        result = result.add(multiplyOneDigit(this, other.digits[i], i));

    // The sign of the result is the signs of the factors xor'ed.
    result.negative = this.negative ^ other.negative;

    return result;
}


/**
 * Multiply a BigInteger by a single digit, and giving it an appropriate order of
 * magnitude.
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
    if (carry != 0)
        newDigits[newDigits.length - 1] = carry;
    else
        newDigits.length = newDigits.length - 1;

    return new BigInteger(newDigits);
}



// TODO if number is zero, negative should always be false.

BigInteger.prototype.pow = function(other) {


    function exponentiationBySquaring(base, exponent) {
        if (exponent.equals("0"))
            return new BigInteger("1");
        else if (exponent.equals("1"))
            return new BigInteger(base.digits, base.negative);
        else if (exponents.digits[0] % 2 === 0)
            return expBySquaring(base.multiply(base), exponent.divideByNativeNumber(2));
        else
            return base.multiply(expBySquaring(base.multiply(base), exponent.subtract(new BigInteger("1")).divide(2)));
    }

    return exponentiationBySquaring(this, other);
}


/**
 * Returns the quotient of a BigInteger divided by a native JS Number object.
 * The number should be at most equal to the maximum value of base * carry + digit,
 * which means it is less than BigInteger.base squared.
 */
function divideByNativeNumber(bigIntegerDividend, number) {

    var quotient = new BigInteger(bigIntegerDividend.digits, bigIntegerDividend.negative);

    var carry = 0;

    // Perform long division.
    for (var i = quotient.digits.length - 1; i >= 0; i--){
        var result = quotient.base * carry + quotient[i];
        quotient[i] = Math.floor(result / number);
        carry = result % number;
    }

    // If there is a leading zero, remove it.
    if (quotient.digits[quotient.digits.length - 1] === 0)
        quotient.digits.length--;

    return quotient;
}


/**
 * Calculates a 'trial' digit in long division. A trial digit is a (educated)
 * guess as to what the next digit in the division should be. The trial digit
 * is usually calculated with the first two digits of the dividend and the
 * divisor. If only one is available, then just it is used. Occasionally, when
 * the digits of the dividend are less than the divisor, we use three digits in
 * the divisor.
 */
function trialDigit(dividend, firstTwoDivisorDigits, useThreeDigits) {

    var firstTwoDividendDigits = firstTwoDigits(dividend);
    if (useThreeDigits && dividend.digits.length > 2) {
        divisorPart /= divisor.base;
        dividendPart += dividend.digits[dividend.digits.length - 3] / dividend.base;
    }

    return Math.floor(firstTwoDividendDigits / firstTwoDivisorDigits);
}


/**
 * Calculates the value of the first two digits of the BigInteger. Returns zero if the BigInteger
 * is empty. If there is only one digit, returns the value of that digit.
 *
 * @param  {BigInteger} number The BigInteger from which the first two digits are taken.
 * @return {[type]}        [description]
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

    // Create a new clone of the dividend (this) for use in the algorithm.
    var dividend = new BigInteger(this.digits, false);
    var divisor = new BigInteger(other.digits, false);

    // If the dividend is less than the divisor, zero can be immediately returned.
    if (dividend.isLessThan(divisor))
        return new BigInteger("0"); //TODO constant for zero, 1, 2, 10, -1

    // If the dividend is less than the value of the maximum JS number, primitive
    // division can be used. Note that 'this' and 'other' are used instead of
    // 'dividend' and 'divisor' to maintain sign value.
    if (dividend.isLessThan(new BigInteger(Number.MAX_VALUE))) {
        var negativeMultiplier = (this.negative ^ other.negative) ? -1 : 1;
        var magnitude = Math.floor(Math.abs(this.toNumber() / other.toNumber()));
        return new BigInteger(negativeMultiplier * magnitude);
    }

    // If the divisor is less than the value of the base squared, a simpler long division
    // algorithm can be used.
    if (divisor.isLessThan(new BigInteger("1000000000000"))) //TODO constant for base squared.
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

        // If the product is greater than the actual quotient, obviously the
        // trial digit is too large. It is only possible for the trial digit to
        // be too large by 1, so be subtract 1 and are left with the correct digit.
        if (product.isGreaterThan(dividend)) {
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

        // If the MSD of the dividend is less than the MSD of the divisor,
        // reduce position and activate flag.
        if (pos >= 0 && firstTwoDivisorDigits > firstTwoDigits(dividend)) {
            pos--;
            useThreeDigits = true;
        } else
            useThreeDigits = false;
    }

    return new BigInteger(quotient, this.negative ^ other.negative);
}


BigInteger.prototype.modulo = function(other) {

    // Create a new clone of the dividend (this) for use in the algorithm.
    var dividend = new BigInteger(this.digits, false);
    var divisor = new BigInteger(other.digits, false);

    // If the dividend is less than the divisor, simply return the dividend.
    if (dividend.isLessThan(divisor))
        return dividend;

    // If the dividend is less than the value of the maximum JS number, primitive
    // modulo can be used. Note that 'this' and 'other' are used instead of
    // 'dividend' and 'divisor' to maintain sign value.
    if (dividend.isLessThan(new BigInteger(Number.MAX_VALUE)))
        return new BigInteger(this.toNumber() % other.toNumber());

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

        // If the product is greater than the actual quotient, obviously the
        // trial digit is too large. It is only possible for the trial digit to
        // be too large by 1, so be subtract 1 and are left with the correct digit.
        if (product.isGreaterThan(dividend)) {
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

        // If the MSD of the dividend is less than the MSD of the divisor,
        // reduce position and activate flag.
        if (pos >= 0 && firstTwoDivisorDigits > firstTwoDigits(dividend)) {
            pos--;
            useThreeDigits = true;
        } else
            useThreeDigits = false;
    }

    return dividend;
}


/**
 * Converts the BigInteger to it's Number representation. Throws an exception if the BigInteger
 * is too large to fit into a native Number object.
 *
 * @return {Number} The Number representation of this BigInteger.
 */
BigInteger.prototype.toNumber = function() {
    return parseInt(this.toString());
}




/**
 * Checks for equality of this BigInteger and another one.
 *
 * @param  {BigInteger} other The other BigInteger to which this one is being compared.
 *
 * @return {Boolean} True if this BigInteger is equal to other, false otherwise.
 */
BigInteger.prototype.equals = function(other) {

    // Check for null and undefined.
    if (other === null || other === undefined)
        return false;

    // Compare signs.
    if (this.negative != other.negative)
        return false;

    // Compare number of digits.
    if (this.digits.length != other.digits.length)
        return false;

    // Compare each digit.
    for (var i = this.digits.length - 1; i >= 0; i++) {
        if (this.digits[i] != other.digits[i])
            return false;
    }

    return true;
}


/**
 * Checks if this BigInteger is greater than another BigInteger. Returns
 * true if this BigInteger is greater, false otherwise.
 */
BigInteger.prototype.isGreaterThan = function(other) {

    // Check for null and undefined.
    if (other === null || other === undefined)
        return false;

    // Compare signs.
    if (this.negative && !other.negative)
        return false;
    else if (!this.negative && other.negative)
        return true;
    else if (this.negative && other.negative) {
        var positiveThis = new BigInteger(this.digits, false);
        var positiveOther = new BigInteger(other.digits, false);
        return positiveThis.isLessThan(positiveOther);
    }

    var thisString = this.toString();
    var otherString = other.toString();

    // Compare string length.
    if (thisString.length > otherString.length)
        return true;
    else if (thisString.length < otherString.length)
        return false;

    // Compare strings lexicographically.
    return thisString > otherString;
}


/**
 * Checks if this BigInteger is less than another BigInteger. Returns
 * true if this BigInteger is less, false otherwise.
 */
BigInteger.prototype.isLessThan = function(other) {

    // Check for null and undefined.
    if (other === null || other === undefined)
        return false;

    // Otherwise, simply check that it is not equal or greater than the other number.
    return (!this.equals(other) && !this.isGreaterThan(other));
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


/** Test BigInteger.toString() **/

// Test BigInteger.toString() with positive number, multiple digits.
console.assert(num9E6.toString() === "9000000");

// Test BigInteger.toString() with negative number, multiple digits.
console.assert(numNeg5E6.toString() === "-5000000");

// Test BigInteger.toString() with positive number, one digit,
// with only one decimal order of magnitude less than BigInteger.base.
console.assert(numNeg1E5.toString() === "-100000");


/** Test BigInteger.equals() **/

// Test equals with positive number, multiple digits.
console.assert(num9E6.equals(new BigInteger("9000000")));

// Test equals with negative number, multiple digits.
console.assert(numNeg9E6.equals(new BigInteger("-9000000")));


/** Test BigInteger.isGreaterThan() **/

// Test isGreaterThan with positive numbers, same order of magnitude.
console.assert(num9E6.isGreaterThan(num5E6));

// Test isGreaterThan with positive numbers, different orders of magnitude.
console.assert(num5E6.isGreaterThan(num800));

// Test isGreaterThan with negative numbers, same order of magnitude.
console.assert(numNeg5E6.isGreaterThan(numNeg9E6));

// Test isGreaterThan with negative numbers, different orders of magnitude.
console.assert(numNeg800.isGreaterThan(numNeg5E6));


/** Test BigInteger.isLessThan() **/

// Test isLessThan with positive numbers, same order of magnitude.
console.assert(num5E6.isLessThan(num9E6));

// Test isLessThan with positive numbers, different orders of magnitude.
console.assert(num800.isLessThan(num5E6));

// Test isLessThan with negative numbers, same order of magnitude.
console.assert(numNeg9E6.isLessThan(numNeg5E6));

// Test isLessThan with negative numbers, different orders of magnitude.
console.assert(numNeg5E6.isLessThan(numNeg800));


/** Test BigInteger.add(...) **/

// Test addition with two positive numbers.
console.assert(num9E6.add(num5E6).equals(new BigInteger("14000000")));

// Test addition with two negative numbers.
console.assert(numNeg9E6.add(numNeg5E6).equals(new BigInteger("-14000000")));

// Test addition with negative added to positive.
console.assert(num9E6.add(numNeg5E6).equals(new BigInteger("4000000")));

// Test addition with positive added to negative.
console.assert(numNeg9E6.add(num5E6).equals(new BigInteger("-4000000")));


/** Test BigInteger.subtract(...) **/

// Test subtraction with a positive number minus itself.
console.assert(num5E6.subtract(num5E6).equals(new BigInteger("0")));

// Test subtraction with a negative number minus itself.
console.assert(numNeg5E6.subtract(numNeg5E6).equals(new BigInteger("0")));

// Test subtraction with two positive numbers, greater - lesser.
console.assert(num9E6.subtract(num5E6).equals(new BigInteger("4000000")));

// Test subtraction with two positive numbers, lesser - greater.
console.assert(num5E6.subtract(num9E6).equals(new BigInteger("-4000000")));

// Test subtraction with two negative numbers, lesser - greater.
console.assert(numNeg9E6.subtract(numNeg5E6).equals(new BigInteger("-4000000")));

// Test subtraction with two negative numbers, greater - lesser.
console.assert(numNeg5E6.subtract(numNeg9E6).equals(new BigInteger("4000000")));

// Test subtraction with negative - positive.
console.assert(numNeg9E6.subtract(num5E6).equals(new BigInteger("-14000000")));

// Test subtraction with positive - negative.
console.assert(num9E6.subtract(numNeg5E6).equals(new BigInteger("14000000")));


/** Test BigInteger.multiply(...) **/

// Test multiply with result greater order of magnitude than factors.
console.assert(num800.multiply(num1E5).equals(new BigInteger("80000000")));

// Test multiplication with two positive numbers.
console.assert(num9E6.multiply(num5E6).equals(new BigInteger("45000000000000")));

// Test multiplication with two negative numbers.
console.assert(numNeg9E6.multiply(numNeg5E6).equals(new BigInteger("45000000000000")));

// Test multiplication with one positive and one negative number.
console.assert(numNeg9E6.multiply(num5E6).equals(new BigInteger("-45000000000000")));


/** Test BigInteger.divide(...) **/

// Test division with number dividing itself.
console.assert(num9E6.divide(num9E6).equals(new BigInteger("1")));

// Test division with smaller number divided by larger number.
console.assert(num5E6.divide(num9E6).equals(new BigInteger("0")));

// Test division with both numbers less than Number.MAX_INT.
console.assert(num5E6.divide(num1E5).equals(new BigInteger("50")));

// Test division with both numbers less than Number.MAX_INT, with non-even result.
console.assert(num9E6.divide(num5E6).equals(new BigInteger("1")));

// Test division with a number larger than Number.MAX_INT, and a divisor which isn't.
console.assert(num7E16.divide(num5E6).equals(new BigInteger("14000000000")));

// Repeat the above test with one value negative.
console.assert(numNeg7E16.divide(num5E6).equals(new BigInteger("-14000000000")));

// Repeat the above test with both values negative.
console.assert(numNeg7E16.divide(numNeg5E6).equals(new BigInteger("14000000000")));

// Test division with two numbers that are both larger than Number.MAX_INT.
console.assert(num7E16.divide(num2E16).equals(new BigInteger(3)));

// Repeat the above test with a negative divisor.
console.assert(num7E16.divide(numNeg2E16).equals(new BigInteger(-3)));

// Test division with a significantly larger dividend.
console.assert(num4E20.divide(num7E16).equals(new BigInteger(5714)));

// Test division with a two numbers that have equal first digits (but do not divide cleanly).
console.assert(num2E16.divide(new BigInteger("2000000000001234")).equals(new BigInteger(9)));

console.log("Testing complete.");
