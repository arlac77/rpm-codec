import test from 'ava';
import { tags, TYPE_STRING } from '../src/types';

test('tags tag + name', t => {
  t.deepEqual(tags.get(1000), {
    tag: 1000,
    name: 'NAME',
    type: TYPE_STRING
  });

  t.deepEqual(tags.get('NAME'), {
    tag: 1000,
    name: 'NAME',
    type: TYPE_STRING
  });
});
