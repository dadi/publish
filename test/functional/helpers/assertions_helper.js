'use strict'

const {expect, assert} = require('chai')

class Assertions extends Helper {
  seeNumberOfElementsBetween(elementCount, minimum, maximum) {
    expect(elementCount >= minimum).to.be.true
    expect(elementCount <= maximum).to.be.true
  }

  seeNumberOfElementsAtLeastOne(elementCount, minimum) {
    expect(elementCount >= minimum).to.be.true
  }

  seeNumbersAreEqual(actual, expected) {
    expect(actual).to.equal(expected)
  }

  seeStringsAreEqual(actual, expected) {
    expect(actual).to.equal(expected)
  }

  seeStringsAreNotEqual(actual, expected) {
    assert.notEqual(actual, expected)
  }

  seeTotalHasIncreased(actual, expected) {
    expect(actual > expected).to.be.true
  }

  seeTotalHasDecreased(actual, expected) {
    expect(actual < expected).to.be.true
  }

  seeTotalGreaterThanZero(actual) {
    expect(actual > 0).to.be.true
  }

  seeStringContains(actual, expected) {
    expect(actual).to.include(expected)
  }
}

module.exports = Assertions
