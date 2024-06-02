export function getSessionUniqueKey(
  date: string,
  timeSlot: number,
  roomNumber: number,
): string {
  return `${date}_${timeSlot}_${roomNumber}`;
}
