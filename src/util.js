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

const typeLength = {
  s: 1,
  u8: 1,
  void: 1,
  u16be: 2,
  u16le: 2,
  u32be: 4,
  u32le: 4
};

export function structLength(type, length = 1) {
  return (
    (Array.isArray(type)
      ? type.reduce((acc, t) => acc + structLength(t.type, t.length), 0)
      : typeLength[type]) * length
  );
}

export function structDecode(buffer, offset, format) {
  if (Array.isArray(format)) {
    const result = {};

    format.forEach(f => {
      switch (f.type) {
        case 's':
          const i = buffer.indexOf(0, offset);
          result[f.name] = buffer.toString(
            'utf8',
            offset,
            i >= 0 ? i : offset + f.length
          );
          break;
        case 'u8':
          if (f.length > 1) {
            const a = new Uint8Array(f.length);
            for (let i = 0; i < f.length; i++) {
              a[i] = buffer.readUInt8(offset + i);
            }
            result[f.name] = a;
          } else {
            result[f.name] = buffer.readUInt8(offset);
          }
          break;
        case 'u16be':
          result[f.name] = buffer.readUInt16BE(offset);
          break;
        case 'u16le':
          result[f.name] = buffer.readUInt16LE(offset);
          break;
        case 'u32be':
          result[f.name] = buffer.readUInt32BE(offset);
          break;
        case 'u32le':
          result[f.name] = buffer.readUInt32LE(offset);
          break;
      }

      offset += structLength(f.type, f.length);
    });

    return result;
  }

  const result = [];
  for (let i = 0; i < format.length; i++) {
    result.push(structDecode(buffer, offset, format.type));
    offset += structLength(format.type, 1);
  }

  return result;
}

export function structEncode(object, buffer, offset, format) {
  format.forEach(f => {
    switch (f.type) {
      case 's':
        buffer.write(object[f.name], offset, f.length, 'utf8');
        break;
      case 'u8':
        if (f.length > 1) {
          const a = object[f.name];
          for (let i = 0; i < f.length; i++) {
            buffer.writeUInt8(a[i], offset + i);
          }
        } else {
          buffer.writeUInt8(object[f.name], offset);
        }
        break;
      case 'u16be':
        buffer.writeUInt16BE(object[f.name], offset);
        break;
      case 'u16le':
        buffer.writeUInt16LE(object[f.name], offset);
        break;
      case 'u32be':
        buffer.writeUInt32BE(object[f.name], offset);
        break;
      case 'u32le':
        buffer.writeUInt32LE(object[f.name], offset);
        break;
    }

    offset += structLength(f.type, f.length);
  });
}

export function structDefaults(struct, record = {}) {
  struct.forEach(s => {
    if (s.default !== undefined) {
      record[s.name] = s.default;
    }
  });

  return record;
}

export function structCheckDefaults(record, struct, name) {
  struct.forEach(s => {
    if (s.default !== undefined) {
      const value = record[s.name];

      function e() {
        throw new TypeError(
          `Bad ${s.name}, this is not a ${name}. Expecting ${s.default} but got ${value}`
        );
      }

      if (s.default instanceof Uint8Array) {
        for (let i = 0; i < s.default.length; i++)
          if (value[i] !== s.default[i]) {
            e();
          }
      } else {
        if (s.default != value) {
          e();
        }
      }
    }
  });
}
