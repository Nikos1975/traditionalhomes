# Example: Vrouchas Route Pilot

This is a reference pattern, not a route registry.

The Stage 3 pilot demonstrated:

- stable internal guide id `vrouchas`;
- EN public path `/en/guide/vrouchas/`;
- DE public path `/de/reisefuehrer/vrouchas/`;
- one shared `GuidePage` renderer;
- explicit locale passed by each route wrapper;
- self-canonical EN and DE pages;
- reciprocal EN/DE hreflang and x-default → English;
- no hreflang for unbuilt locales;
- real English fallback links rather than phantom German pages.

Use the current source/tests for implementation details; this example only documents the proven shape.
