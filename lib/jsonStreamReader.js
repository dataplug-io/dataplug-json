const _ = require('lodash')
const check = require('check-types')
const { Transform } = require('stream')
const oboe = require('oboe')
const logger = require('winston')

/**
 * Transforms input JSON data stream to output object stream
 *
 * 'complete' event is fired when parsing is complete with all data that was not selected using selector
 */
class JsonStreamReader extends Transform {
  /**
   * @constructor
   * @param {string} [selector='!.*'] Output data selector
   */
  constructor (selector = '!.*') {
    check.assert.string(selector)

    super({
      objectMode: false,
      readableObjectMode: true,
      writableObjectMode: false
    })

    this._selector = selector
    this._onParserDoneHandler = (...args) => this._onParserDone(...args)
    this._onParserFailHandler = (...args) => this._onParserFail(...args)
    this._onParserNodeHandler = (...args) => this._onParserNode(...args)

    // Configure Oboe.js to expect data being fed externally
    this._parser = oboe()
      .done(this._onParserDoneHandler)
      .fail(this._onParserFailHandler)
      .node(selector, this._onParserNodeHandler)
    this.once('end', () => {
      logger.log('debug', 'JsonStreamReader end')

      if (this._parser) {
        this._detachFromParser()
        this._parser.emit('end')
        this._parser = null
      }
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
   * Detaches from parser
   */
  _detachFromParser () {
    logger.log('debug', 'JsonStreamReader detach from parser')

    this._parser.removeListener('done', this._onParserDoneHandler)
    this._parser.removeListener('fail', this._onParserFailHandler)
    this._parser.removeListener('node', this._selector, this._onParserNodeHandler)
  }

  /**
   * Handles parser 'done' event
   */
  _onParserDone (data) {
    logger.log('debug', 'JsonStreamReader parser done')
    logger.log('silly', 'Data:', data)

    if (this._parser) {
      this._detachFromParser()
      this._parser.emit('end')
      this._parser = null
    }

    this.emit('complete', data)
    this.push(null)
  }

  /**
   * Handles parser 'fail' event
   */
  _onParserFail (error) {
    logger.log('error', error)

    this.emit('error', error)
  }

  /**
   * Handles parser 'node' event
   */
  _onParserNode (node) {
    logger.log('debug', 'JsonStreamReader parser node')
    logger.log('silly', 'Node:', node)

    this.push(node)

    return oboe.drop
  }
}

module.exports = JsonStreamReader
