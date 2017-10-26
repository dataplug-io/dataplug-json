const _ = require('lodash')
const { Transform } = require('stream')
const oboe = require('oboe')

/**
 * Transforms input JSON data stream to output object stream
 */
class JsonStreamReader extends Transform {
  /**
   * @constructor
   * @param {string} [selector='!.*'] Output data selector
   */
  constructor (selector = '!.*') {
    super({
      objectMode: false,
      readableObjectMode: true,
      writableObjectMode: false
    })

    // Configure Oboe.js to expect data being fed externally
    this._parser = oboe()
      .done(() => {
        this.push(null)
      })
      .fail((error) => {
        this.emit('error', error)
      })
      .node(selector, (node) => {
        this.push(node)
        return oboe.drop
      })
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
   * @override
   */
  _transform (chunk, encoding, callback) {
    this._parser.emit('data', _.toString(chunk))
    callback(null, null)
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_flush_callback
   * @override
   */
  _flush (callback) {
    this._parser.emit('end')
    callback(null, null)
  }
}

module.exports = JsonStreamReader
