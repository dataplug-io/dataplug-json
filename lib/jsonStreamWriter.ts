const _ = require('lodash');
import { Transform } from 'stream';
import logger from 'winston';

/**
 * Transforms input object stream to output JSON data stream
 */
export default class JsonStreamWriter extends Transform {
  _replacer: any;
  _space: any;
  _abortOnError: boolean;
  _opened: boolean;

  /**
   * @constructor
   *
   * @param replacer
   * @param space
   * @param replacer
   * @param space
   * @param {boolean} [abortOnError=] True to abort the stream on error, false to ignore
   */
  constructor(
    replacer = undefined,
    space = undefined,
    abortOnError: boolean = false,
  ) {
    super({
      objectMode: false,
      readableObjectMode: false,
      writableObjectMode: true,
    });

    this._replacer = _.isArray(replacer) ? _.cloneDeep(replacer) : replacer;
    this._space = space;
    this._abortOnError = abortOnError;

    this._opened = false;
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
   * @override
   */
  _transform(chunk, encoding, callback) {
    let json;
    try {
      json = JSON.stringify(chunk, this._replacer, this._space);
    } catch (error) {
      logger.log('error', 'Error in JsonStreamWriter:', error);
      callback(this._abortOnError ? error : null, null);
      return;
    }
    if (this._opened) {
      json = `,${json}`;
    } else {
      json = `[${json}`;
      this._opened = true;
    }
    callback(null, json);
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_flush_callback
   * @override
   */
  _flush(callback) {
    callback(null, this._opened ? ']' : '[]');
  }
}
