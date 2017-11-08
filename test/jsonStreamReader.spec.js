/* eslint-env node, mocha */
require('chai')
  .should()
const { PassThrough } = require('stream')
const { JsonStreamReader } = require('../lib')

describe('JsonStreamReader', () => {
  it('transforms empty JSON to null', (done) => {
    const reader = new JsonStreamReader()

    let data = []
    reader
      .on('end', () => {
        data.should.be.lengthOf(0)
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    reader.end()
  })

  it('transforms empty JSON array to null', (done) => {
    const reader = new JsonStreamReader()

    let data = []
    reader
      .on('end', () => {
        data.should.be.lengthOf(0)
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    reader.write('[]')
    reader.end()
  })

  it('transforms simple JSON to object', (done) => {
    const reader = new JsonStreamReader()

    let data = []
    reader
      .on('end', () => {
        data.should.be.lengthOf(1)
        data[0].should.be.deep.equal({property: 'value'})
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    reader.write('[{"property":"value"}]')
    reader.end()
  })

  it('transforms complex JSON to object', (done) => {
    const object = {
      $attr: 'attrValue',
      subObject: {
        $attr: 'attrValue'
      }
    }
    const reader = new JsonStreamReader()

    let data = []
    reader
      .on('end', () => {
        data.should.be.lengthOf(1)
        data[0].should.be.deep.equal(object)
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    reader.write(JSON.stringify([object]))
    reader.end()
  })

  it('supports chaining without data', (done) => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    let data = []
    targetStream
      .on('end', () => {
        data.should.be.lengthOf(0)
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.end()
  })

  it('supports chaining with data', (done) => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    let data = []
    targetStream
      .on('end', () => {
        data.should.be.lengthOf(1)
        data[0].should.be.deep.equal({property: 'value'})
        done()
      })
      .on('data', (chunk) => data.push(chunk))

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.write('[{"property":"value"}]')
    sourceStream.end()
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
