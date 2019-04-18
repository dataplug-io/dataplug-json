import 'ts-jest';
import { JsonStreamReader, JsonStreamWriter } from '../lib';

describe('dataplug-json', () => {
  it('has "JsonStreamReader" class', () => {
    expect(typeof JsonStreamReader).toEqual('function');
  });

  it('has "JsonStreamWriter" class', () => {
    expect(typeof JsonStreamWriter).toEqual('function');
  });
});
