# Example: Property Localization Without a Second Inventory

Argyro is the reference pattern.

The German page does not copy factual inventory fields into a German inventory.

Instead:

1. factual values remain in `src/inventory/inventory.json` and related structured sources;
2. German long-form narrative lives in the localized content entry;
3. presentation mappings localize descriptive factual values using stable slugs/ids/source strings;
4. component-derived display summaries use stable semantic translation keys;
5. generated-output tests assert that mapped ids exist, numbers are not invented, list lengths remain aligned, and proper names are preserved.

This separation allows facts to remain single-source while still producing fully German visible output.
