import { InternalServerErrorException } from '@nestjs/common';

export function getSessionUniqueKey(
  date: string,
  timeSlot: number,
  roomNumber: number,
): string {
  return `${date}_${timeSlot}_${roomNumber}`;
}

export function getSessionTimeRange(timeSlot: number): [number, number] {
  switch (timeSlot) {
    case 0:
      return [10, 12];
    case 1:
      return [12, 14];
    case 2:
      return [14, 16];
    case 3:
      return [16, 18];
    case 4:
      return [18, 20];
    case 5:
      return [20, 22];
    case 6:
      return [22, 24];
    default:
      throw new InternalServerErrorException(`Invalid timeSlot: ${timeSlot}`);
  }
}
