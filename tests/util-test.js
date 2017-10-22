import test from 'ava';
import { num, str } from '../src/util';

test('Convert byte[] to number', t => {
  t.is(0, num([0]), 'Can convert 0');
});

test('Convert byte[] to number', t => {
  t.is(65537, num([1, 0, 1]), 'Can convert large numbers');
});
