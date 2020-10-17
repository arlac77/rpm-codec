import test from "ava";
import { createReadStream } from "fs";
import { RPMDecoder, contentDecoder } from "../src/codec.mjs";

test("RPMDecoder lzma", async t => {
  const input = createReadStream(
    new URL("fixtures/mktemp-1.6-4mdv2010.1.i586.rpm", import.meta.url).pathname
  );

  const result = await RPMDecoder(input);

  //console.log(result.signature.values);

  t.deepEqual(
    result.signature.values.get("MD5"),
    new Uint8Array([
      0x74,
      0x5c,
      0x0d,
      0xe1,
      0x49,
      0xea,
      0xe9,
      0x66,
      0xdf,
      0x7c,
      0x69,
      0x49,
      0x48,
      0x03,
      0x85,
      0x85
    ])
  );

  t.is(result.header.values.get("PAYLOADCOMPRESSOR"), "lzma");

  input.pipe(
    await contentDecoder(result, (header, stream, callback) => {
      //console.log(`extract: ${header.name}`);
      stream.on("end", () => callback());
      stream.resume();
    })
  );
});

test("RPMDecoder gzip", async t => {
  const input = createReadStream(
    new URL("fixtures/hello-2.3-1.el2.rf.i386.rpm", import.meta.url).pathname
  );

  const result = await RPMDecoder(input);

  t.is(result.header.values.get("PAYLOADCOMPRESSOR"), "gzip");

  input.pipe(await contentDecoder(result));
});

function collectEntries() {}

test("RPMDecoder aarch64", async t => {
  const input = createReadStream(
    new URL("fixtures/filesystem-3.2-40.fc26.aarch64.rpm", import.meta.url)
      .pathname
  );

  const result = await RPMDecoder(input);

  t.is(result.header.values.get("PAYLOADCOMPRESSOR"), "xz");

  const files = new Set();

  const p = input.pipe(
    await contentDecoder(result, (header, stream, callback) => {
      files.add(header.name);
      stream.on("end", () => callback());
      stream.resume();
    })
  );

  await new Promise((resolve, reject) => {
    p.on("end", () => resolve());
    p.on("error", err => reject(err));
  });

  t.true(files.has("./usr/src"));
});

test.only("fail RPMDecoder invalid header", async t => {
  const input = createReadStream(
    new URL("decode-test.mjs", import.meta.url).pathname
  );

  await t.throwsAsync(async () => RPMDecoder(input), {
    instanceOf: TypeError,
    message:
      "Bad magic, this is not a lead. Expecting 237,171,238,219 but got 105,109,112,111"
  });
});

test("fail RPMDecoder short file", async t => {
  const input = createReadStream(
    new URL("fixtures/to-short.rpm", import.meta.url).pathname
  );

  await t.throwsAsync(async () => RPMDecoder(input), {
    instanceOf: TypeError,
    message: `Unexpected end of stream at 96 while reading signature`
  });
});
