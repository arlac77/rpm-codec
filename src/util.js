export function byteArrayEqual(b1, b2) {
  if (b2.length < b1.length) return false;
  for (let i = b1.length; --i >= 0; ) {
    if (b1[i] != b2[i]) return false;
  }
  return true;
}

// [byte[] -> Number]
// Convert a byte buffer in base 10 into a number
export function num(buf) {
  let base = 1;
  let result = 0;
  for (let i = buf.length - 1; i >= 0; i--) {
    result += buf[i] * base;
    base *= 256;
  }
  return result;
}

// [byte[] -> String]
// Convert an optionally 0-terminated byte array into a String
export function str(buf) {
  let s = '';
  for (let i = 0; i < buf.length; i++) {
    let c = buf[i];
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}
