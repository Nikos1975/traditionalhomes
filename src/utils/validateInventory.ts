import type { InventoryUnit } from '../types';

const EXPECTED_HOUSES = 10;
const EXPECTED_VILLA_BOOKING_ID = 'ASP3SV';

export function validateInventory(units: InventoryUnit[]): void {
  const houses = units.filter((u) => u.type === 'house');
  const villas = units.filter((u) => u.type === 'villa');
  const errors: string[] = [];

  if (houses.length !== EXPECTED_HOUSES) {
    errors.push(
      `[inventory] Expected ${EXPECTED_HOUSES} houses, found ${houses.length}. ` +
      `Present slugs: ${houses.map((h) => h.slug).join(', ')}. ` +
      `Add the missing ${EXPECTED_HOUSES - houses.length} house(s) to src/inventory/inventory.json.`
    );
  }

  if (villas.length < 1) {
    errors.push(
      `[inventory] No villa found. Add a villa entry with bookingId: "${EXPECTED_VILLA_BOOKING_ID}" to src/inventory/inventory.json.`
    );
  } else {
    const villa = villas.find((v) => v.bookingId === EXPECTED_VILLA_BOOKING_ID);
    if (!villa) {
      errors.push(
        `[inventory] Villa with bookingId "${EXPECTED_VILLA_BOOKING_ID}" is missing. ` +
        `Found villa(s): ${villas.map((v) => `${v.slug} (bookingId: ${v.bookingId ?? 'null'})`).join(', ')}. ` +
        `Set bookingId: "${EXPECTED_VILLA_BOOKING_ID}" on the correct villa entry in src/inventory/inventory.json.`
      );
    }
  }

  const slugs = units.map((u) => u.slug);
  const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (duplicates.length > 0) {
    errors.push(`[inventory] Duplicate slugs found: ${duplicates.join(', ')}. Each slug must be unique.`);
  }

  if (errors.length > 0) {
    const divider = '─'.repeat(70);
    const msg = [
      '',
      divider,
      '  INVENTORY VALIDATION FAILED',
      divider,
      ...errors.map((e) => `  • ${e}`),
      '',
      '  Edit src/inventory/inventory.json to fix these issues.',
      divider,
      '',
    ].join('\n');
    throw new Error(msg);
  }
}
