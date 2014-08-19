/**
 * Tests for the BigInteger class.
 *
 * @author Adam Heins
 */


/** Test all ways to create a BigInteger with the value of zero. **/

assertEquals(BigInteger.ZERO, new BigInteger('0'));
assertEquals(BigInteger.ZERO, new BigInteger(0));
assertEquals(BigInteger.ZERO, new BigInteger(''));
assertEquals(BigInteger.ZERO, new BigInteger());


/** Test toString() **/

// Test toString() with an empty constructor.
assertEquals((new BigInteger()).toString(), '0');

// Test BigInteger.toString() with positive number, multiple digits.
assertEquals((new BigInteger('9000000')).toString(), '9000000');

// Test BigInteger.toString() with negative number, multiple digits.
assertEquals('-5000000', new BigInteger(-5000000).toString());

// Test BigInteger.toString() with positive number, one digit, with only one decimal order of
// magnitude less than BigInteger.base.
assertEquals('-100000', new BigInteger(-100000).toString());

// Test conversion to a lower base.
assertEquals('1000', (new BigInteger(8)).toString(2));

// Test convervion to a base higher than decimal.
assertEquals('75BCD15', (new BigInteger(123456789)).toString(16));


/** Test toNumber() **/

// Test with zero.
assertEquals(0, BigInteger.ZERO.toNumber());

// Test with a negative number constructed from a number.
assertEquals(-1234567, (new BigInteger('-1234567')).toNumber());

// Test with a positive number constructed from a number.
assertEquals(11223344, (new BigInteger(11223344)).toNumber());


/** Test valueOf() **/

// Test with base 10.
assertEquals(new BigInteger('1234567890'), BigInteger.valueOf('1234567890', 10));

// Test with a lower base, binary.
assertEquals(new BigInteger(256), BigInteger.valueOf('100000000', 2));

// Test with a lower base, hexadecimal.
assertEquals(new BigInteger(16777215), BigInteger.valueOf('ffffff', 16));

// Test with a much higher base, 30.
assertEquals(new BigInteger('459761806362022'), BigInteger.valueOf('nameisadam', 30));


/** Test compare(...) **/

// Test === with positive number, multiple digits.
assertTrue(new BigInteger(9000000).compare(new BigInteger('9000000')) === 0);

// Test === with negative number, multiple digits.
assertTrue(new BigInteger(-9000000).compare(new BigInteger('-9000000')) === 0);

// Test > with positive numbers, same order of magnitude.
assertTrue(new BigInteger(9000000).compare(new BigInteger(5000000)) > 0);

// Test > with positive numbers, different orders of magnitude.
assertTrue(new BigInteger(5000000).compare(new BigInteger(800)) > 0);

// Test > with negative numbers, same order of magnitude.
assertTrue(new BigInteger(-5000000).compare(new BigInteger(-9000000)) > 0);

// Test > with negative numbers, different orders of magnitude.
assertTrue(new BigInteger(-800).compare(new BigInteger(-5000000)) > 0);

// Test < with positive numbers, same order of magnitude.
assertTrue(new BigInteger(5000000).compare(new BigInteger(9000000)) < 0);

// Test < with positive numbers, different orders of magnitude.
assertTrue(new BigInteger(800).compare(new BigInteger(5000000)) < 0);

// Test < with negative numbers, same order of magnitude.
assertTrue(new BigInteger(-9000000).compare(new BigInteger(-5000000)) < 0);

// Test < with negative numbers, different orders of magnitude.
assertTrue(new BigInteger(-5000000).compare(new BigInteger(-800)) < 0);


/** Test equals(...) **/

// Test === with positive number, multiple digits.
assertTrue(new BigInteger(9000000).equals(new BigInteger('9000000')));

// Test === with negative number, multiple digits.
assertTrue(new BigInteger(-9000000).equals(new BigInteger('-9000000')));


/** Test isGreaterThan(...) **/

// Test > with positive numbers, same order of magnitude.
assertTrue(new BigInteger(9000000).isGreaterThan(new BigInteger(5000000)));

// Test > with positive numbers, different orders of magnitude.
assertTrue(new BigInteger(5000000).isGreaterThan(new BigInteger(800)));

// Test > with negative numbers, same order of magnitude.
assertTrue(new BigInteger(-5000000).isGreaterThan(new BigInteger(-9000000)));

// Test > with negative numbers, different orders of magnitude.
assertTrue(new BigInteger(-800).isGreaterThan(new BigInteger(-5000000)));


/** Test isLessThan(...) **/

// Test < with positive numbers, same order of magnitude.
assertTrue(new BigInteger(5000000).isLessThan(new BigInteger(9000000)));

// Test < with positive numbers, different orders of magnitude.
assertTrue(new BigInteger(800).isLessThan(new BigInteger(5000000)));

// Test < with negative numbers, same order of magnitude.
assertTrue(new BigInteger(-9000000).isLessThan(new BigInteger(-5000000)));

// Test < with negative numbers, different orders of magnitude.
assertTrue(new BigInteger(-5000000).isLessThan(new BigInteger(-800)));


/** Test max(...) **/

// Test with a single argument.
assertEquals(new BigInteger('1234567890'), BigInteger.max(new BigInteger('1234567890')));

// Test two equal numbers.
assertEquals(new BigInteger('1234567890'), BigInteger.max(new BigInteger('1234567890'),
    new BigInteger('1234567890')));

// Test two positives, with the first greater.
assertEquals(new BigInteger('1234567890'), BigInteger.max(new BigInteger('1234567890'),
    new BigInteger('123456789')));

// Test two positives, with the second greater.
assertEquals(new BigInteger('123456789'), BigInteger.max(new BigInteger('56789'),
    new BigInteger('123456789')));

// Test two negatives, with the first greater.
assertEquals(new BigInteger('-56789'), BigInteger.max(new BigInteger('-56789'),
    new BigInteger('-123456789')));

// Test a negative and a positive.
assertEquals(new BigInteger('45'), BigInteger.max(new BigInteger('-56789'), new BigInteger('45')));

// Test with more than two arguments.
console.assert(new BigInteger('67000000'), BigInteger.max(new BigInteger('-56789'),
    new BigInteger('4500'), new BigInteger('67000000')));


/** Test min(...) **/

// Test with a single argument.
assertEquals(new BigInteger('1234567890'), BigInteger.min(new BigInteger('1234567890')));

// Test two equal numbers.
assertEquals(new BigInteger('1234567890'), BigInteger.min(new BigInteger('1234567890'),
    new BigInteger('1234567890')));

// Test two positives, with the second less than the first.
assertEquals(new BigInteger('123456789'), BigInteger.min(new BigInteger('1234567890'),
    new BigInteger('123456789')));

// Test two positives, with the first less than the second.
assertEquals(new BigInteger('56789'), BigInteger.min(new BigInteger('56789'),
    new BigInteger('123456789')));

// Test two negatives, with the second less than the first.
assertEquals(new BigInteger('-123456789'), BigInteger.min(new BigInteger('-56789'),
    new BigInteger('-123456789')));

// Test a negative and a positive.
assertEquals(new BigInteger('-56789'), BigInteger.min(new BigInteger('-56789'),
    new BigInteger('45')));

// Test with more than two arguments.
assertEquals(new BigInteger('-56789'), BigInteger.min(new BigInteger('-56789'),
    new BigInteger('4500'), new BigInteger('67000000')));


/** Test add(...) **/

// Test addition with two small numbers.
assertEquals(new BigInteger('14000000'), new BigInteger(9000000).add(new BigInteger(5000000)));

// Test addition with two larger, positive numbers.
assertEquals(new BigInteger('140000000000000000'),
    new BigInteger('90000000000000000').add(new BigInteger('50000000000000000')));

// Test addition with two negative numbers.
assertEquals(new BigInteger('-140000000000000000'),
    new BigInteger('-90000000000000000').add(new BigInteger('-50000000000000000')));

// Test addition with negative added to positive.
assertEquals(new BigInteger('40000000000000000'),
    new BigInteger('90000000000000000').add(new BigInteger('-50000000000000000')));

// Test addition with positive added to negative.
assertEquals(new BigInteger('-40000000000000000'),
    new BigInteger('-90000000000000000').add(new BigInteger('50000000000000000')));

// Test with large, irregular number.
assertEquals(new BigInteger('24691357802469135780'),
    (new BigInteger('12345678901234567890')).add(new BigInteger('12345678901234567890')));


/** Test subtract(...) **/

// Test subtraction with a positive number minus itself.
assertEquals(BigInteger.ZERO, new BigInteger(5000000).subtract(new BigInteger(5000000)));

// Test subtraction with a negative number minus itself.
assertEquals(BigInteger.ZERO, new BigInteger(-5000000).subtract(new BigInteger(-5000000)));

// Test subtraction with two positive numbers, greater - lesser.
assertEquals(new BigInteger('4000000'), new BigInteger(9000000).subtract(new BigInteger(5000000)));

// Test subtraction with two positive numbers, lesser - greater.
assertEquals(new BigInteger('-4000000'), new BigInteger(5000000).subtract(new BigInteger(9000000)));

// Test subtraction with two negative numbers, lesser - greater.
assertEquals(new BigInteger('-4000000'),
    new BigInteger(-9000000).subtract(new BigInteger(-5000000)));

// Test subtraction with two negative numbers, greater - lesser.
assertEquals(new BigInteger('40000000000000000'),
    new BigInteger('-50000000000000000').subtract(new BigInteger('-90000000000000000')));

// Test subtraction with negative - positive.
assertEquals(new BigInteger('-140000000000000000'),
    new BigInteger('-90000000000000000').subtract(new BigInteger('50000000000000000')));

// Test subtraction with positive - negative.
assertEquals(new BigInteger('140000000000000000'),
    new BigInteger('90000000000000000').subtract(new BigInteger('-50000000000000000')));

// Test a number beginning with a 1, minus 1.
assertEquals(new BigInteger(14999999), (new BigInteger(15000000)).subtract(BigInteger.ONE));

// Test with large, irregular number.
assertEquals(new BigInteger('12345678901234567890'),
    (new BigInteger('24691357802469135780')).subtract(new BigInteger('12345678901234567890')));


/** Test multiply(...) **/

// Test multiply with result greater order of magnitude than factors.
assertEquals(new BigInteger('80000000'), new BigInteger(800).multiply(new BigInteger(100000)));

// Test multiplication with two positive numbers.
assertEquals(new BigInteger('45000000000000000000'),
    new BigInteger(9000000000).multiply(new BigInteger(5000000000)));

// Test multiplication with two negative numbers.
assertEquals(new BigInteger('45000000000000000000'),
    new BigInteger(-9000000000).multiply(new BigInteger(-5000000000)));

// Test multiplication with one positive and one negative number.
assertEquals(new BigInteger('-45000000000000000000'),
    new BigInteger(-9000000000).multiply(new BigInteger(5000000000)));

// Test with large, irregular number.
assertEquals(new BigInteger('152415787532374345526722756'),
    (new BigInteger('12345678901234')).multiply(new BigInteger('12345678901234')));


/** Test divide(...) **/

// Test division with number dividing itself.
assertEquals(BigInteger.ONE, new BigInteger(9000000).divide(new BigInteger(9000000)));

// Test division with smaller number divided by larger number.
assertEquals(BigInteger.ZERO, new BigInteger(5000000).divide(new BigInteger(9000000)));

// Test division with both numbers less than Number.MAX_INT.
assertEquals(new BigInteger('50'), new BigInteger(5000000).divide(new BigInteger(100000)));

// Test division with both numbers less than Number.MAX_INT, with non-even result.
assertEquals(BigInteger.ONE, new BigInteger(9000000).divide(new BigInteger(5000000)));

// Test division with a number larger than Number.MAX_INT, and a divisor which isn't.
assertEquals(new BigInteger('14000000000'),
    new BigInteger('70000000000000000').divide(new BigInteger(5000000)));

// Repeat the above test with one value negative.
assertEquals(new BigInteger('-14000000000'),
    new BigInteger('-70000000000000000').divide(new BigInteger(5000000)));

// Repeat the above test with both values negative.
assertEquals(new BigInteger('14000000000'),
    new BigInteger('-70000000000000000').divide(new BigInteger(-5000000)));

// Test division with two numbers that are both larger than Number.MAX_INT.
assertEquals(BigInteger.THREE,
    new BigInteger('70000000000000000').divide(new BigInteger('20000000000000000')));

// Repeat the above test with a negative divisor.
assertEquals(new BigInteger(-3),
    new BigInteger('70000000000000000').divide(new BigInteger('-20000000000000000')));

// Test division with a significantly larger dividend.
assertEquals(new BigInteger(5714),
    new BigInteger('400000000000000000000').divide(new BigInteger('70000000000000000')));

// Test division with a two numbers that have equal first digits (but do not divide cleanly).
assertEquals(new BigInteger(9),
    new BigInteger('20000000000000000').divide(new BigInteger('2000000000001234')));


/** Test modulo(...) **/

// Test modulo with the same number.
assertEquals(BigInteger.ZERO,
    new BigInteger('70000000000000000').modulo(new BigInteger('70000000000000000')));

// Test modulo with smaller number % larger number.
assertEquals(new BigInteger('20000000000000000'),
    new BigInteger('20000000000000000').modulo(new BigInteger('70000000000000000')));

// Test with a negative number.
assertEquals(new BigInteger(2749856),
    (new BigInteger('-1234567890')).modulo(new BigInteger(4545454)));

// Test with large numbers.
assertEquals(new BigInteger('14566676004'), (new BigInteger('135546343434234528'))
    .modulo(new BigInteger('54657342556')));
assertEquals(new BigInteger('2739574529170425'), (new BigInteger('8326445093271549824986317'))
    .modulo(new BigInteger('8235329764373457')));
assertEquals(new BigInteger('944770484040977778'), (new BigInteger('3324094572302349474629238'))
    .modulo(new BigInteger('2355463456645787980')));
assertEquals(new BigInteger('90547237722777'), (new BigInteger('46598234734957437345'))
    .modulo(new BigInteger('98340063749944')));
assertEquals(new BigInteger('303232584402329371851252'),
    (new BigInteger('225094688443758234773948532'))
        .modulo(new BigInteger('576388348357322834364352')));


/** Test pow(...) **/

// Test with non-zero base and exponent of zero.
assertEquals(BigInteger.ONE, BigInteger.TEN.pow(0));

// Test with base of zero and non-zero exponent.
assertEquals(BigInteger.ZERO, BigInteger.ZERO.pow(10));

// Test zero raised to the zero.
assertEquals(BigInteger.ONE, BigInteger.ZERO.pow(0));

// Additional tests.
assertEquals(new BigInteger('18446744073709551616'), BigInteger.TWO.pow(64));
assertEquals(new BigInteger('8187505353567209228244052427776'), (new BigInteger(1234)).pow(10));
assertEquals(new BigInteger('1014296832285033013205252695154427870000000'),
    (new BigInteger(1002030)).pow(7));


/** Test modPow(...) **/

// Test with a base of zero. Result should be 0 unless the exponent is 0.
assertEquals(BigInteger.ZERO, BigInteger.ZERO.modPow(BigInteger.TEN, BigInteger.THREE));

// Test with a base and exponent of zero. Result should be 1 regardless of modulus.
assertEquals(BigInteger.ONE, BigInteger.ZERO.modPow(BigInteger.ZERO,
    new BigInteger('1000000000000')));

// Test with small numbers.
assertEquals(new BigInteger(2976), (new BigInteger(1234)).modPow(new BigInteger(100),
    new BigInteger(5675)));
assertEquals(new BigInteger(45277914), (new BigInteger(34152124)).modPow(new BigInteger(132434),
    new BigInteger(98434562)));
assertEquals(new BigInteger(72297501), (new BigInteger(678753365))
    .modPow(new BigInteger(1244687965), new BigInteger(343679864)));

// Test with large numbers.
assertEquals(new BigInteger('905570691752001406787623'),
    (new BigInteger('2430957173853042962243656')).modPow(new BigInteger('987342561893547832'),
        new BigInteger('5983475872376235874569843')));
assertEquals(new BigInteger('350736991726113048455882751'),
    (new BigInteger('19835634509568237234940045'))
        .modPow(new BigInteger('8937526649545345000003247328'),
            new BigInteger('673578234651248345983472834')));
assertEquals(new BigInteger('6527423847839304886258924072'),
    (new BigInteger('450924756723458456900128335734590483672'))
        .modPow(new BigInteger('66657859236735983457291912483475345322'),
            new BigInteger('98870002362348234612002347384')));


/** Test isEven() **/

// Test with zero.
assertTrue(BigInteger.ZERO.isEven());

// Test with one.
assertFalse(BigInteger.ONE.isEven());

// Test with multi-digit even number.
assertTrue((new BigInteger('123456789098765432')).isEven());

// Test with multi-digit odd number.
assertFalse((new BigInteger('98765432123456789')).isEven());


/** Test isZero() **/

// Test with zero.
assertTrue(BigInteger.ZERO.isZero());

// Test with a positive number.
assertFalse(BigInteger.ONE.isZero());

// Test with a positive number.
assertFalse(BigInteger.NEGATIVE_ONE.isZero());


/** Test abs() **/

// Test with zero.
assertEquals(BigInteger.ZERO, BigInteger.ZERO.abs());

// Test with a positive number.
assertEquals(BigInteger.ONE, BigInteger.ONE.abs());

// Test with a negative number.
assertEquals(BigInteger.ONE, BigInteger.NEGATIVE_ONE.abs());


/** Test negate() **/

// Test that negate has no effect on zero.
assertEquals(BigInteger.ZERO, BigInteger.ZERO.negate());

// Test with a positive number.
assertEquals(BigInteger.NEGATIVE_ONE, BigInteger.ONE.negate());

// Test with a negative number. m
assertEquals(BigInteger.ONE, BigInteger.NEGATIVE_ONE.negate());


/** Test isPrime() **/

// Test that 0 is not prime.
assertFalse(BigInteger.ZERO.isPrime());

// Test that 1 is not primes.
assertFalse(BigInteger.ONE.isPrime());

// Test that 2 is prime.
assertTrue(BigInteger.TWO.isPrime());

// Test that 3 is prime.
assertTrue(BigInteger.THREE.isPrime());

// Test a very small composite number.
assertFalse(BigInteger.TEN.isPrime());

// Test a very small prime number.
assertTrue((new BigInteger(11)).isPrime());

// Test a composite number divisible by 2.
assertFalse((new BigInteger('1000000000000000000000000')).isPrime());

// Test a composite number divisible by 3.
assertFalse((new BigInteger('3333333333333333333333333')).isPrime());

// Test large composite only divisible by primes greater than 10,000.
assertFalse((new BigInteger(8226930013)).isPrime());

// Test large composite only divisible by primes greater than 10,000,000.
assertFalse((new BigInteger('773978878498831')).isPrime());

// Test primes with one digit.
assertTrue((new BigInteger(78607)).isPrime());
assertTrue((new BigInteger(104659)).isPrime());

// Test primes with two digits.
assertTrue((new BigInteger(15485863)).isPrime());
assertTrue((new BigInteger(735632797)).isPrime());

// Test primes with three digits.
assertTrue((new BigInteger(4398042316799)).isPrime());
assertTrue((new BigInteger('18014398241046527')).isPrime());

// Test large primes (four or more digits).
assertTrue((new BigInteger('18446744082299486207')).isPrime());
assertTrue((new BigInteger('523347633027360537213687137')).isPrime());
assertTrue((new BigInteger('1066340417491710595814572169')).isPrime());
assertTrue((new BigInteger('10888869450418352160768000001')).isPrime());
assertTrue((new BigInteger('19134702400093278081449423917')).isPrime());
assertTrue((new BigInteger('162259276829213363391578010288127')).isPrime());
assertTrue((new BigInteger('265252859812191058636308479999999')).isPrime());
assertTrue((new BigInteger('1298074214633706835075030044377087')).isPrime());
assertTrue((new BigInteger('263130836933693530167218012159999999')).isPrime());
assertTrue((new BigInteger('8683317618811886495518194401279999999')).isPrime());
assertTrue((new BigInteger('43143988327398957279342419750374600193')).isPrime());
assertTrue((new BigInteger('35742549198872617291353508656626642567')).isPrime());
assertTrue((new BigInteger('393050634124102232869567034555427371542904833')).isPrime());
assertTrue((new BigInteger('359334085968622831041960188598043661065388726959079837')).isPrime());

console.log('Testing complete.');


/**
 * Asserts that two objects are equal. Specially build to be able to handle BigIntegers.
 *
 * @param {object} expected The expected value of the object.
 * @param {object} actual The actual value of the object.
 * @param {string} message Optional. A message to display if expected and actual are not equal.
 */
function assertEquals(expected, actual, message) {
    if (message === undefined)
        message = 'Expected <' + expected + '> (' + typeof(expected) + '), but instead received <'
            + actual + '> (' + typeof(actual) + ').';

    // Both objects are BigIntegers.
    if (expected.constructor === BigInteger && actual.constructor === BigInteger) {
        if (expected.compare(actual) !== 0)
            throw message;

    // Any other combination of objects.
    } else {
        if (expected !== actual)
            throw message;
    }
}


/**
 * Asserts that a boolean expression is true.
 *
 * @param {boolean} expression The boolean expression.
 * @param {string} message Optional. A message to display if the expression is false.
 */
function assertTrue(expression, message) {
    if (message === undefined)
        message = 'Expression was not true as expected.';

    if (!expression)
        throw message;
}


/**
 * Asserts that a boolean expression is false.
 *
 * @param {boolean} expression The boolean expression.
 * @param {string} message Optional. A message to display if the expression is false.
 */
function assertFalse(expression, message) {
    if (message === undefined)
        message = 'Expression was not false as expected.';

    if (expression)
        throw message;
}
