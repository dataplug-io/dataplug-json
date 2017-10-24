/* eslint-env node, mocha */
require('chai')
  .should()
const dataplugJson = require('../lib')

describe('dataplug-json', () => {
  it('should have "JsonSequentialStreamsReader" class', () => {
    dataplugJson
      .should.have.property('JsonSequentialStreamsReader')
      .that.is.an('function')
  })

  it('should have "JsonStreamReader" class', () => {
    dataplugJson
      .should.have.property('JsonStreamReader')
      .that.is.an('function')
  })

  it('should have "JsonStreamWriter" class', () => {
    dataplugJson
      .should.have.property('JsonStreamWriter')
      .that.is.an('function')
  })
})
