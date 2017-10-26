/* eslint-env node, mocha */
require('chai')
  .should()
const dataplugJson = require('../lib')

describe('dataplug-json', () => {
  it('has "JsonStreamReader" class', () => {
    dataplugJson
      .should.have.property('JsonStreamReader')
      .that.is.an('function')
  })

  it('has "JsonStreamWriter" class', () => {
    dataplugJson
      .should.have.property('JsonStreamWriter')
      .that.is.an('function')
  })
})
