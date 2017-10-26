/* eslint-env node, mocha */
require('chai')
  .should()
const { JsonStreamWriter } = require('../lib')

describe('JsonStreamWriter', () => {
  it('transform empty input to empty JSON array', () => {
    const writer = new JsonStreamWriter()
    writer.end()
    writer.read().toString()
      .should.be.equal('[]')
  })

  it('transform object to JSON array with one element', () => {
    const writer = new JsonStreamWriter()
    writer.write({property: 'value'})
    writer.end()
    writer.read().toString()
      .should.be.equal('[{"property":"value"}]')
  })
})
