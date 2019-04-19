import { JsonStreamWriter } from '../lib';
import 'ts-jest';

describe('JsonStreamWriter', () => {
  it('transform empty input to empty JSON array', () => {
    const writer = new JsonStreamWriter();
    writer.end();
    expect(writer.read().toString()).toEqual('[]');
  });

  it('transform object to JSON array with one element', () => {
    const writer = new JsonStreamWriter();
    writer.write({ property: 'value' });
    writer.end();
    expect(writer.read().toString()).toEqual('[{"property":"value"}]');
  });
});
