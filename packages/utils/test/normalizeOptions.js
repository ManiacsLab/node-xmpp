import test from 'ava'
import {normalizeOptions} from '../src'

test('normalizeOptions', t => {
  t.deepEqual(normalizeOptions(123), {timeout: 123, Promise: global.Promise})
  const f = () => {}
  t.deepEqual(normalizeOptions(f), {Promise: f})
  t.deepEqual(normalizeOptions(), {Promise: global.Promise})
  t.deepEqual(normalizeOptions({}), {Promise: global.Promise})
  t.deepEqual(normalizeOptions({timeout: 123}), {timeout: 123, Promise: global.Promise})
  t.deepEqual(normalizeOptions({timeout: 123, Promise: f}), {timeout: 123, Promise: f})
})
