/* eslint-env node, mocha */
require('chai')
  .should()
const { JsonStreamReader } = require('../lib')

describe('JsonStreamReader', () => {
  it('should transform object to json', () => {
    const object = {
      $attr: 'attrValue',
      subObject: {
        $attr: 'attrValue'
      }
    }
    const reader = new JsonStreamReader()
    reader.write(JSON.stringify([object]))
    reader.end()
    reader.read()
      .should.be.deep.equal(object)
  })
})
