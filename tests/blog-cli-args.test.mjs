import assert from "node:assert/strict";
import test from "node:test";

import { parseScaffoldArgs } from "../scripts/blog/scaffold.mjs";
import { parseStatusArgs } from "../scripts/blog/status.mjs";

test("status accepts npm 11 config forwarding on Windows", () => {
  assert.deepEqual(
    parseStatusArgs(["areti-monastery-mirabello-crete"], {
      npm_config_slug: "true",
      npm_config_simulate: "true",
    }),
    { slug: "areti-monastery-mirabello-crete", simulateRun: true },
  );
});

test("scaffold accepts named arguments from argv or npm config", () => {
  assert.deepEqual(
    parseScaffoldArgs(["Parking in Mavrikiano", "parking-in-mavrikiano"], {
      npm_config_topic: "true",
      npm_config_slug: "true",
    }),
    { topic: "Parking in Mavrikiano", slug: "parking-in-mavrikiano" },
  );
  assert.deepEqual(parseScaffoldArgs(["--resume", "run-id"], {}), {
    resume: "run-id",
  });
  assert.deepEqual(
    parseScaffoldArgs([
      "--topic",
      "Parking in Mavrikiano",
      "--slug",
      "parking-in-mavrikiano",
      "--distinct-angle",
      "Step-free arrival only.",
    ]),
    {
      topic: "Parking in Mavrikiano",
      slug: "parking-in-mavrikiano",
      distinctAngle: "Step-free arrival only.",
    },
  );
});
