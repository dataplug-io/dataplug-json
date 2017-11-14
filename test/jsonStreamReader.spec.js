/* eslint-env node, mocha */
require('chai')
  .use(require('chai-as-promised'))
  .should()
const { PassThrough } = require('stream')
const { Promise } = require('bluebird')
const logger = require('winston')
const { JsonStreamReader } = require('../lib')

logger.clear()

describe('JsonStreamReader', () => {
  it('transforms empty JSON to null', (done) => {
    const reader = new JsonStreamReader()

    new Promise((resolve, reject) => {
      let data = []
      reader
        .on('end', () => {
          resolve(data)
        })
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([])
      .and.notify(done)
    reader.resume()

    reader.end()
  })

  it('transforms empty JSON array to null', (done) => {
    const reader = new JsonStreamReader()

    new Promise((resolve, reject) => {
      let data = []
      reader
        .on('end', () => {
          resolve(data)
        })
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([])
      .and.notify(done)
    reader.resume()

    reader.write('[]')
  })

  it('transforms simple JSON to object', (done) => {
    const reader = new JsonStreamReader()

    new Promise((resolve, reject) => {
      let data = []
      reader
        .on('end', () => {
          resolve(data)
        })
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([{property: 'value'}])
      .and.notify(done)
    reader.resume()

    reader.write('[{"property":"value"}]')
  })

  it('transforms complex JSON to object', (done) => {
    const object = {
      $attr: 'attrValue',
      subObject: {
        $attr: 'attrValue'
      }
    }
    const reader = new JsonStreamReader()

    new Promise((resolve, reject) => {
      let data = []
      reader
        .on('end', () => {
          resolve(data)
        })
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([object])
      .and.notify(done)
    reader.resume()

    reader.write(JSON.stringify([object]))
  })

  it('supports chaining without data', (done) => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    new Promise((resolve, reject) => {
      let data = []
      targetStream
        .on('end', () => {
          resolve(data)
        })
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([])
      .and.notify(done)

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.end()
  })

  it('supports chaining with data', (done) => {
    const sourceStream = new PassThrough()
    const reader = new JsonStreamReader()
    const targetStream = new PassThrough({ objectMode: true })

    new Promise((resolve, reject) => {
      let data = []
      targetStream
        .on('end', () => resolve(data))
        .on('data', (chunk) => data.push(chunk))
        .on('error', reject)
    })
      .should.eventually.be.deep.equal([{property: 'value'}])
      .and.notify(done)

    sourceStream
      .pipe(reader)
      .pipe(targetStream)
    sourceStream.write('[{"property":"value"}]')
    targetStream.resume()
  })

  it('supports "complete" event', (done) => {
    const reader = new JsonStreamReader('!.data.*')
    new Promise((resolve, reject) => {
      reader
        .on('complete', resolve)
        .on('error', reject)
    })
      .should.eventually.be.deep.equal({ property: 'value', data: [undefined] })
      .and.notify(done)
    reader.resume()

    reader.write('{"property":"value","data":[{"itemProperty":"value"}]}')
  })

  it('handles bad JSON', (done) => {
    const reader = new JsonStreamReader('!.data.*')

    new Promise((resolve, reject) => {
      let captured = {}
      reader
        .on('error', (error) => {
          captured.error = error
        })
        .on('end', () => {
          reject(captured.error)
        })
    })
      .should.eventually.be.rejectedWith('Bad value\nLn: 1\nCol: 11\nChr: <')
      .and.notify(done)
    reader.resume()

    reader.write('{')
    reader.write('"property":"value",')
    reader.write('"badData":<bad json>,')
    reader.write('"goodData":0')
    reader.write('}')
  })
})
