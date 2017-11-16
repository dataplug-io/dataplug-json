const _ = require('lodash')
const { Transform } = require('stream')
const check = require('check-types')
const logger = require('winston')

/**
 * Transforms input object stream to output JSON data stream
 */
class JsonStreamWriter extends Transform {
  /**
   * @constructor
   *
   * @param {boolean} [abortOnError=] True to abort the stream on error, false to ignore
   */
  constructor (replacer = undefined, space = undefined, abortOnError = false) {
    check.assert.boolean(abortOnError)

    super({
      objectMode: false,
      readableObjectMode: false,
      writableObjectMode: true
    })

    this._replacer = _.isArray(replacer) ? _.cloneDeep(replacer) : replacer
    this._space = space
    this._abortOnError = abortOnError

    this._opened = false
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
   * @override
   */
  _transform (chunk, encoding, callback) {
    let json
    try {
      json = JSON.stringify(chunk, this._replacer, this._space)
    } catch (error) {
      logger.log('error', 'Error in JsonStreamWriter:', error)
      callback(this._abortOnError ? error : null, null)
      return
    }
    if (this._opened) {
      json = `,${json}`
    } else {
      json = `[${json}`
      this._opened = true
    }
    callback(null, json)
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_flush_callback
   * @override
   */
  _flush (callback) {
    callback(null, this._opened ? ']' : '[]')
  }
};

module.exports = JsonStreamWriter
