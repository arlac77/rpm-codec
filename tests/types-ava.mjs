import test from 'ava';
import {
  tags,
  TYPE_STRING,
  oses,
  architectures,
  fileFlags
} from '../src/types.mjs';

test('tags tag + name', t => {
  t.deepEqual(tags.get(1000), {
    tag: 1000,
    name: 'NAME',
    type: TYPE_STRING,
    required: true
  });

  t.deepEqual(tags.get('NAME'), {
    tag: 1000,
    name: 'NAME',
    type: TYPE_STRING,
    required: true
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

test('fileType config', t => {
  t.is(fileFlags.get(0x01).name, 'config');
  t.is(fileFlags.get('config').id, 0x01);
});

/*
test('fileType doc', t => {
  t.is(fileFlags.get(0x02).name, 'doc');
  t.is(fileFlags.get('doc').id, 0x02);
});
*/
