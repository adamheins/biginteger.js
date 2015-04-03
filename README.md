# biginteger.js

## What is it?
biginteger.js is a javascript library that implements arbitrarily-sized integers. Methods are available for:
* addition
* subtraction
* multiplication
* division
* modulo
* exponentiation
* modular exponentiation
* random numbers
* primality checking

In addition, many others are available for equality testing, conversion between bases, finding the max and min, and more. Read the [source code](https://github.com/adamheins/BigInteger.js/blob/master/biginteger.js) to view the documentation for every method.

## Example
The [Primality Checker](https://github.com/adamheins/primality-checker) is a small but useful web-app that shows off the power of biginteger.js's primality checking.

## References
The algorithms for long division and modulo were adapted from [Multiple-Length Division Revisited: A Tour of the Minefield](http://brinch-hansen.net/papers/1994b.pdf) by Per Brinch Hansen. An efficient modular exponentiation algorithm was taken from [Large Prime Numbers](http://people.reed.edu/~jerry/361/lectures/bigprimes.pdf) by Jerry Shurman.
