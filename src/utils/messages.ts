export function createArrivalMessage(house: any, parking: any) {
  return `
Arrival instructions:

1. Please park here first:
${parking.googleMapsUrl}

2. Then walk or we guide you to:
${house.googleMapsUrl}

Alternative:
You may briefly stop near the house to drop luggage.

We usually meet guests at the parking and guide them to the house.

If you arrive earlier, please wait at the parking area and inform us.
`.trim()
}
