import test from 'ava';
import { fieldLength } from '../src/field.mjs';
import {
  TYPE_NULL,
  TYPE_CHAR,
  TYPE_INT8,
  TYPE_INT16,
  TYPE_INT32,
  TYPE_INT64,
  TYPE_STRING,
  TYPE_BIN,
  TYPE_STRING_ARRAY,
  TYPE_I18NSTRING
} from '../src/types.mjs';

test('length TYPE_NULL', t => {
  t.is(fieldLength({ type: TYPE_NULL }), 0);
});

test('length TYPE_CHAR', t => {
  t.is(fieldLength({ type: TYPE_CHAR }, 'a'), 1);
});

test('length TYPE_INT8', t => {
  t.is(fieldLength({ type: TYPE_INT8 }, 1), 1);
});

test('length TYPE_INT16', t => {
  t.is(fieldLength({ type: TYPE_INT16 }, 1), 2);
});

test('length TYPE_INT32', t => {
  t.is(fieldLength({ type: TYPE_INT32 }, 1), 4);
});

test('length TYPE_INT64', t => {
  t.is(fieldLength({ type: TYPE_INT64 }, 1), 8);
});

test('length TYPE_BIN', t => {
  t.is(fieldLength({ type: TYPE_BIN }, new Uint8Array(4)), 4);
});

test('length TYPE_STRING', t => {
  t.is(fieldLength({ type: TYPE_STRING }, 'abc'), 4);
});

test('length TYPE_STRING_ARRAY', t => {
  t.is(fieldLength({ type: TYPE_STRING_ARRAY }, ['a', 'b', 'c']), 6);
});

test('length TYPE_I18NSTRING', t => {
  t.is(fieldLength({ type: TYPE_I18NSTRING }, ['a', 'b', 'c']), 6);
});
