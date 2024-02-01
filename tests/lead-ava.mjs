import test from "ava";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { open, read } from "node:fs";
import { LEAD } from "../src/lead.mjs";
import {
  structDecode,
  structEncode,
  structLength,
  structDefaults
} from "../src/util.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("lead length", t => t.is(structLength(LEAD), 96));

// TODO test lead with bad length -> throw
// TODO test lead with bad magic -> throw

test("Read lead from rpm package", t => {
  t.plan(7);
  const filename = join(
    here,
    "..",
    "tests",
    "fixtures",
    "mktemp-1.6-4mdv2010.1.i586.rpm"
  );

  open(filename, "r", (err, fd) => {
    if (err) {
      t.fail(`Opening rpm file failed with ${err}`);
      return;
    }

    const buffer = Buffer.alloc(96);
    read(fd, buffer, 0, 96, 0, (err, num) => {
      if (err) {
        t.fail(`Reading failed with ${err}`);
        return;
      }
      const lead = structDecode(buffer, 0, LEAD);
      t.is(lead.major, 3);
      t.is(lead.minor, 0);
      t.is(lead.signatureType, 5);
      t.is(lead.os, 1);
      t.is(lead.name, "mktemp-1.6-4mdv2010.1");
      t.is(lead.arch, 1);
      t.is(lead.type, 0);
    });
  });
});

test("write lead", t => {
  const lead = structDefaults(LEAD);
  lead.name = "AA";
  lead.os = 1;
  lead.arch = 1;
  lead.type = 0;

  const buffer = Buffer.alloc(structLength(LEAD));
  structEncode(lead, buffer, 0, LEAD);
  t.deepEqual(
    buffer.slice(0, 12),
    Buffer.from([
      0xed,
      0xab,
      0xee,
      0xdb,
      0x03,
      0x00,
      0x00,
      0x00,
      0x00,
      0x01,
      0x41,
      0x41
    ])
  );
});
