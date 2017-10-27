import test from 'ava';
import { tags, TYPE_STRING, oses, architectures } from '../src/types';

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

test('os Linux', t => {
  t.is(oses.get(1).name, 'Linux');
  t.is(oses.get('Linux').id, 1);
});

test('architecture x86_64', t => {
  t.is(architectures.get(1).name, 'athlon');
  t.is(architectures.get('x86_64').id, 1);
});
