import test from "ava";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream } from "node:fs";
import { RPMEncoder, RPMDecoder } from "../src/codec.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test.skip("RPMEncoder", async t => {
  const fileName = join(here, "..", "build", "xxx.rpm");

  const output = createWriteStream(fileName);

  await RPMEncoder(output, {
    name: "mktemp-1.5-12sls",
    os: "Linux",
    architecture: "i586"
  });

  const input = createReadStream(fileName);

  const result = await RPMDecoder(input);

  //console.log(result.signature);
  t.is(result.lead.signatureType, 5);
});
