import * as oboe from 'oboe';
import { Transform } from 'stream';
import * as _ from 'lodash';
import * as logger from 'winston';

/**
 * Transforms input JSON data stream to output object stream
 *
 * 'complete' event is fired when parsing is complete with all data that was not selected using selector
 */
export default class JsonStreamReader extends Transform {
  _selector: string;
  _onParserDoneHandler: (args: any[]) => void;
  _onParserFailHandler: (args: any[]) => void;
  _onParserNodeHandler: (args: any[]) => void;
  _parser: any;

  /**
   * @constructor
   * @param {string} [selector='!.*'] Output data selector
   */
  constructor(selector: string = '!.*') {
    super({
      objectMode: false,
      readableObjectMode: true,
      writableObjectMode: false,
    });

    this._selector = selector;
    this._onParserDoneHandler = args => this._onParserDone(args);
    this._onParserFailHandler = args => this._onParserFail(args);
    this._onParserNodeHandler = args => this._onParserNode(args);

    // Configure Oboe.js to expect data being fed externally
    this._parser = oboe()
      .done(this._onParserDoneHandler)
      .fail(this._onParserFailHandler)
      .node(selector, this._onParserNodeHandler);
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
   * @override
   */
  _transform(chunk, encoding, callback) {
    if (this._parser) {
      this._parser.emit('data', _.toString(chunk));
    }
    callback(null, null);
  }

  /**
   * https://nodejs.org/api/stream.html#stream_transform_flush_callback
   * @override
   */
  _flush(callback) {
    if (this._parser) {
      this._detachFromParser();
      this._parser.emit('end');
      this._parser = null;
    }

    callback();
  }

  /**
   * Detaches from parser
   */
  _detachFromParser() {
    this._parser.removeListener('done', this._onParserDoneHandler);
    this._parser.removeListener('fail', this._onParserFailHandler);
    this._parser.removeListener(
      'node',
      this._selector,
      this._onParserNodeHandler,
    );
  }

  /**
   * Handles parser 'done' event
   */
  _onParserDone(data) {
    logger.log('debug', 'JsonStreamReader completed parsing');
    logger.log('silly', 'Data:', data);

    if (this._parser) {
      this._detachFromParser();
      this._parser = null;
    }

    this.emit('complete', data);
    this.emit('close');
    this.push(null);
  }

  /**
   * Handles parser 'fail' event
   */
  _onParserFail(error) {
    logger.log(
      'error',
      'Error in JsonStreamReader during parsing:',
      error.thrown,
    );
    this.emit('error', error.thrown);

    if (this._parser) {
      this._detachFromParser();
      this._parser = null;
    }

    this.emit('close');
    this.push(null);
  }

  /**
   * Handles parser 'node' event
   */
  _onParserNode(node) {
    logger.log('debug', 'JsonStreamReader parsed node');
    logger.log('silly', 'Node:', node);

    this.push(node);
    return oboe.drop;
  }
}
