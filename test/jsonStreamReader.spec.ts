/// <reference types="node" />
import { PassThrough } from 'stream';
import { Promise } from 'bluebird';
import logger from 'winston';
import { JsonStreamReader } from '../lib';
import 'ts-jest';

// logger.clear();

describe('JsonStreamReader', () => {
  it('transforms empty JSON to null', done => {
    const reader = new JsonStreamReader();
    expect(
      new Promise((resolve, reject) => {
        let data = [];
        reader
          .on('end', () => {
            resolve(data);
          })
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([])
      .then(done);
    reader.resume();

    reader.end();
  });

  it('transforms empty JSON array to null', done => {
    const reader = new JsonStreamReader();

    expect(
      new Promise((resolve, reject) => {
        let data = [];
        reader
          .on('end', () => {
            resolve(data);
          })
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([])
      .then(done);
    reader.resume();

    reader.write('[]');
    reader.end();
  });

  it('transforms simple JSON to object', done => {
    const reader = new JsonStreamReader();

    expect(
      new Promise((resolve, reject) => {
        let data = [];
        reader
          .on('end', () => {
            resolve(data);
          })
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([{ property: 'value' }])
      .then(done);
    reader.resume();

    reader.write('[{"property":"value"}]');
    reader.end();
  });

  it('transforms complex JSON to object', done => {
    const object = {
      $attr: 'attrValue',
      subObject: {
        $attr: 'attrValue',
      },
    };
    const reader = new JsonStreamReader();

    expect(
      new Promise((resolve, reject) => {
        let data = [];
        reader
          .on('end', () => {
            resolve(data);
          })
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([object])
      .then(done);
    reader.resume();

    reader.write(JSON.stringify([object]));
    reader.end();
  });

  it('supports chaining without data', done => {
    const sourceStream = new PassThrough();
    const reader = new JsonStreamReader();
    const targetStream = new PassThrough({ objectMode: true });

    expect(
      new Promise((resolve, reject) => {
        let data = [];
        targetStream
          .on('end', () => {
            resolve(data);
          })
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([])
      .then(done);

    sourceStream.pipe(reader).pipe(targetStream);
    sourceStream.end();
  });

  it('supports chaining with data', done => {
    const sourceStream = new PassThrough();
    const reader = new JsonStreamReader();
    const targetStream = new PassThrough({ objectMode: true });

    expect(
      new Promise((resolve, reject) => {
        let data = [];
        targetStream
          .on('end', () => resolve(data))
          .on('data', chunk => data.push(chunk))
          .on('error', reject);
      }),
    )
      .resolves.toEqual([{ property: 'value' }])
      .then(done);

    sourceStream.pipe(reader).pipe(targetStream);
    sourceStream.write('[{"property":"value"}]');
    targetStream.resume();
  });

  it('supports "complete" event', done => {
    const reader = new JsonStreamReader('!.data.*');
    expect(
      new Promise((resolve, reject) => {
        reader.on('complete', resolve).on('error', reject);
      }),
    )
      .resolves.toEqual({ property: 'value', data: [undefined] })
      .then(done);
    reader.resume();

    reader.write('{"property":"value","data":[{"itemProperty":"value"}]}');
    reader.end();
  });

  it('handles bad JSON', done => {
    const reader = new JsonStreamReader('!.data.*');

    expect(
      new Promise((resolve, reject) => {
        let captured = { error: null };
        reader
          .on('error', error => {
            captured.error = error;
          })
          .on('end', () => {
            reject(captured.error);
          });
      }),
    )
      .rejects.toEqual('Bad value\nLn: 1\nCol: 11\nChr: <')
      .then(done);
    reader.resume();

    reader.write('{');
    reader.write('"property":"value",');
    reader.write('"badData":<bad json>,');
    reader.write('"goodData":0');
    reader.write('}');
    reader.end();
  });
});
