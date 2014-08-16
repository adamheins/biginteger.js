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
    this.logbase = 6;

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
        } else {
            this.negative = false;
        }

        // Check if the number is simply zero.
        if ((function(str){
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) !== '0')
                    return false;
            }
            return true;
        })(number)) {
            this.digits = [];
            this.negative = false;
            return;
        }

        // Parse the digits of the number.
        var numDigits = Math.ceil(number.length / this.logbase);
        this.digits = new Array(numDigits);

        var excess = number.length % this.logbase;
        excess = excess == 0 ? this.logbase : excess;
        this.digits[numDigits - 1] = parseInt(number.substr(0, excess));

        for (var i = 1; i < numDigits; i++) {
            this.digits[i - 1] = parseInt(number.substr(number.length - this.logbase * i,
                this.logbase));
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


// Useful, common constants.
BigInteger.ZERO = new BigInteger();
BigInteger.ONE = new BigInteger(1);
BigInteger.TWO = new BigInteger(2);
BigInteger.THREE = new BigInteger(3);
BigInteger.TEN = new BigInteger(10)
BigInteger.NEGATIVE_ONE = new BigInteger(-1);

// Maximum native integer.
BigInteger.MAX_NATIVE = new BigInteger(9007199254740992);


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
 * Converts the value of this BigInteger to a string.
 *
 * @return {String} A String representation of this BigInteger.
 */
BigInteger.prototype.toString = function() {

    // If the BigInteger was constructed from a string, simply return that.
    if (this.numberString !== null)
        return this.numberString;

    // Return zero for a BigInteger with an empty digit array.
    if (this.digits.length === 0)
        return "0";

    // If the BigInteger was constructed with an Array of digits, the string must be built manually.
    var string = "";
    for (var i = 0; i < this.digits.length - 1; i++) {
        var digitString = (this.digits[i] + this.base).toString();
        string = digitString.substr(1, digitString.length) + string;
    }
    string = this.digits[this.digits.length - 1] + string;

    return (this.negative ? "-" : "") + string;
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
 * Calculates the sum of this BigInteger and another one. This function calls other private addition
 * and subtraction functions depending on the signs of the numbers.
 *
 * @param {BigInteger} other The BigInteger being added to this one.
 *
 * @return {BigInteger} The sum of this BigInteger and 'other'.
 */
BigInteger.prototype.add = function(other) {

    // Case where both numbers are negative.
    if (this.negative && other.negative)
        return longAddition(this, other).negate();

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
 * Calculates the sum of two BigIntegers using a standard long addition algorithm.
 *
 * @param {BigInteger} firstNumber The first BigInteger being added.
 * @param {BigInteger} secondNumber The second BigInteger being added.
 *
 * @return {BigInteger} The sum of the two BigIntegers.
 */
function longAddition(firstNumber, secondNumber) {
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

    if (this.negative) {
        if (other.negative) {
            if (this.compare(other) < 0) {

                    // Subtract other from this, result negative.
                    var result = subtractionByComplement(this, other);
                    result.negative = true;
                    return result;
            } else {

                    // Subtract this from other, result positive.
                    var result = subtractionByComplement(other, this);
                    result.negative = false;
                    return result;
            }
        } else {
            var result = longAddition(this, other);
            result.negative = true;
            return result;
        }
    } else {
        if (other.negative) {
            var result = longAddition(this, other);
            result.negative = false;
            return result;
        } else {
            if (this.compare(other) >= 0) {

                    // Subtract other from this, result negative.
                    var result = subtractionByComplement(this, other);
                    result.negative = false;
                    return result;
            } else {

                    // Subtract this from other, result positive.
                    var result = subtractionByComplement(other, this);
                    result.negative = true;
                    return result;
            }
        }
    }
}


/**
 * Calculates the difference between this BigInteger and another one, using the method of
 * complements.
 *
 * @param {BigInteger} other The BigInteger to substract from this one.
 *
 * @return {Number} The difference, which is always returned in absolute form.
 */
function subtractionByComplement(minuend, subtrahend) {

    // Create positive version of this and the other.
    var posMinuend = new BigInteger(minuend.digits, false); //TODO may be redundant
    var posSubtrahend = new BigInteger(subtrahend.digits, false);

    // Return a copy of this BigInteger if the other number is zero/empty.
    if (posSubtrahend.digits.length === 0)
        return new BigInteger(posMinuend.digits);

    var newDigits = new Array(posSubtrahend.digits.size);
    var complement = new BigInteger(newDigits, false);

    // Compute the complement of the subtrahend.
    for (var i = 0; i < posSubtrahend.digits.length; i++)
        complement.digits[i] = posMinuend.base - 1 - posSubtrahend.digits[i];

    // Add this and complement.
    var result = posMinuend.add(complement);

    // Add one to the result.
    result = result.add(BigInteger.ONE);

    // Subtract one from the most significant digit.
   // var msdIndex = complement.digits.length;
    //var msd = result.digits[msdIndex] - 1;

    result.digits[complement.digits.length]--;

    stripLeadingZeroDigits(result);

    return result;
}


//TODO deal with later...
BigInteger.prototype.clone = function() {
    var array = new Array(this.digits.length);
    for (var i = 0; i < array.length; i++) {
        array[i] = this.digits[i];
    }
    return new BigInteger(array, this.negative);
}


/**
 * Removes the leading zeros from the digit array of a BigInteger.
 *
 * @param {BigInteger} number The BigInteger to be stripped.
 */
function stripLeadingZeroDigits(number) {
    while (number.digits[number.digits.length - 1] === 0)
        number.digits.length--;
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
 * Calculates this BigInteger raised to the power of a number.
 *
 * @param {Number} exponent The exponent.
 *
 * @return {BigInteger} The result.
 */
BigInteger.prototype.pow = function(exponent) {

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
        else if (exponent === 1)
            return base;
        else if (exponent % 2 === 0)
            return exponentiationBySquaring(base.multiply(base), exponent / 2);
        else
            return base.multiply(exponentiationBySquaring(base.multiply(base), (exponent - 1) / 2));
    }

    return exponentiationBySquaring(this, exponent);
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

    // Create a new clone of the dividend (this) for use in the algorithm.
    var dividend = new BigInteger(this.digits, false);
    var divisor = new BigInteger(other.digits, false);

    // If the dividend is less than the divisor, zero can be immediately returned.
    if (dividend.compare(divisor) < 0)
        return new BigInteger("0");

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

        // If the product is greater than the actual quotient, obviously the
        // trial digit is too large. It is only possible for the trial digit to
        // be too large by 1, so be subtract 1 and are left with the correct digit.
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


/**
 * Calculates the result of this BigInteger modulo another BigInteger.
 *
 * @param  {BigInteger} other The modulus.
 *
 * @return {BigInteger} The result.
 */
BigInteger.prototype.modulo = function(other) {

    // Create a new clone of the dividend (this) for use in the algorithm.
    var dividend = new BigInteger(this.digits, false);
    var divisor = new BigInteger(other.digits, false);

    // If the dividend is less than the divisor, simply return the dividend.
    if (dividend.compare(divisor) < 0)
        return dividend;

    // If the dividend is less than the value of the maximum JS number, primitive modulo can be
    // used. Note that 'this' and 'other' are used instead of 'dividend' and 'divisor' to maintain
    // sign value.
    if (dividend.compare(BigInteger.MAX_NATIVE) < 0)
        return new BigInteger(Math.floor(this.toNumber() % other.toNumber()));

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
    // divisor. That digit in the quotient is filled with a zero and we move onto the next, but we
    // must include the unused previous digit from the dividend.
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

        // If the product is greater than the actual quotient, obviously the
        // trial digit is too large. It is only possible for the trial digit to
        // be too large by 1, so be subtract 1 and are left with the correct digit.
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
 * Convenience method that indicates whether or not this BigInteger is even. Significantly
 * cheaper than performing BigInteger.modulo(2).
 *
 * @return {Boolean} True if this BigInteger is even, false if it is odd.
 */
BigInteger.prototype.isEven = function() {
    if (this.digits.length === 0)
        return true;
    return (this.digits[0] % 2 === 0);
}


/**
 * Calculates the modulus of this BigInteger raised to some power.
 *
 * @param  {BigInteger} exponent The exponent to which this BigInteger is raised.
 * @param  {BigInteger} modulus  The modulus.
 *
 * @return {BigInteger} The result of the modPow operation.
 */
BigInteger.prototype.modPow = function(exponent, modulus) {

    var x = BigInteger.ONE;
    var a = this;
    var e = exponent;

    while (e.compare(BigInteger.ZERO) > 0) {
        if (e.isEven()) {
            a = a.multiply(a).modulo(modulus);
            e = divideByNativeNumber(e, 2);
        } else {
            x = x.multiply(a).modulo(modulus);
            e = e.subtract(BigInteger.ONE);
        }
    }

    return x;
}


/**
 * Checks if the this BigInteger is a probable prime. Will always return true for primes, but may
 * not always return false for some composites which are strong liars. In other words, false
 * indicates that the number is definitely composite, but true does not necessarily mean it is
 * prime.
 *
 * @param  {Number}  witnessLoops The number of witness loops through which to iterate. More loops
 *    reduce the chance of incorrectly identifying composite numbers as prime.
 *
 * @return {Boolean} True if the number is probably prime, false otherwise.
 */
BigInteger.prototype.isPrime = function(witnessLoops) {

    // Check for an incorrect parameter.
    if (witnessLoops != undefined && (witnessLoops === null || typeof(witnessLoops) != "number"
            || witnessLoops < 1))
        throw "Number of witness loops must be a positive integer."

    if (this.compare(BigInteger.ONE) <= 0)
        return false;
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
        d = divideByNativeNumber(d, 2);
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


/** Test toString() **/

// Test toString() with an empty constructor.
console.assert((new BigInteger()).toString() === "0")

// Test BigInteger.toString() with positive number, multiple digits.
console.assert(num9E6.toString() === "9000000");

// Test BigInteger.toString() with negative number, multiple digits.
console.assert(numNeg5E6.toString() === "-5000000");

// Test BigInteger.toString() with positive number, one digit,
// with only one decimal order of magnitude less than BigInteger.base.
console.assert(numNeg1E5.toString() === "-100000");


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


/** isEven() **/

// Test with zero.
console.assert(BigInteger.ZERO.isEven());

// Test with one.
console.assert(!BigInteger.ONE.isEven());

// Test with multi-digit even number.
console.assert((new BigInteger("123456789098765432")).isEven());

// Test with multi-digit odd number.
console.assert(!(new BigInteger("98765432123456789")).isEven());


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
