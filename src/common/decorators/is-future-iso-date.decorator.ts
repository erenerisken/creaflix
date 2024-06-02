import { registerDecorator, ValidationOptions } from 'class-validator';
import { isFuture, isValid, parseISO } from 'date-fns';

export function IsFutureISODate(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isFutureISODate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          const date = parseISO(value);
          return isValid(date) && isFuture(date);
        },
        defaultMessage() {
          return 'Date must be a valid ISO string and in the future';
        },
      },
    });
  };
}
