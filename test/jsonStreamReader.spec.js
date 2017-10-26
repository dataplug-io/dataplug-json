/* eslint-env node, mocha */
const should = require('chai')
  .should()
const { PassThrough } = require('stream')
const { JsonStreamReader } = require('../lib')

describe('JsonStreamReader', () => {
  it('transforms empty JSON to null', () => {
    const reader = new JsonStreamReader()
    reader.end()
    const data = reader.read()
    should.not.exist(data)
  })

  it('transforms empty JSON array to null', () => {
    const reader = new JsonStreamReader()
    reader.write('[]')
    reader.end()
    const data = reader.read()
    should.not.exist(data)
  })

  it('transforms simple JSON to object', () => {
    const reader = new JsonStreamReader()
    reader.write('[{"property":"value"}]')
    reader.end()
    reader.read()
      .should.be.deep.equal({property: 'value'})
  })

  it('transforms complex JSON to object', () => {
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

  it('supports chaining without data', () => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.end()

    const data = targetStream.read()
    should.not.exist(data)
  })

  it('supports chaining with data', () => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.write('[{"property":"value"}]')
    sourceStream.end()

    targetStream.read()
      .should.be.deep.equal({property: 'value'})
  })

  it('supports "complete" event', (done) => {
    const reader = new JsonStreamReader('!.data.*')
    reader.on('complete', (data) => {
      data.should.be.deep.equal({ property: 'value', data: [undefined] })
      done()
    })
    reader.write('{"property":"value","data":[{"itemProperty":"value"}]}')
    reader.end()
  })
})
