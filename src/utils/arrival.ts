export function getArrivalInstructions(houseUrl: string | null, parkingUrl: string | null) {
  const houseLink = houseUrl ?? '#';
  const parkingLink = parkingUrl ?? '#';
  return {
    primary: `Arrive at the private parking first: ${parkingLink}`,
    alternative: `Alternatively, you may stop briefly near the house to drop luggage: ${houseLink}`,
    note: `We usually meet guests at the parking and guide them personally to the house.`,
    earlyArrival: `If you arrive earlier than expected, please wait at the parking area and contact us.`
  }
}
