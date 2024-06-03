import { IsString, validateSync } from 'class-validator';
import { IsFutureISODate } from './is-future-iso-date.decorator';

class TestClass {
  @IsFutureISODate({ message: 'Invalid date' })
  @IsString()
  date: string;
}

describe('IsFutureISODate', () => {
  it('should validate future ISO date', () => {
    const testClass = new TestClass();
    testClass.date = '2999-12-31';
    const errors = validateSync(testClass);
    expect(errors.length).toBe(0);
  });

  it('should invalidate past ISO date', () => {
    const testClass = new TestClass();
    testClass.date = '1999-12-31';
    const errors = validateSync(testClass);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isFutureISODate).toBe('Invalid date');
  });

  it('should invalidate non-ISO date string', () => {
    const testClass = new TestClass();
    testClass.date = 'not-a-date';
    const errors = validateSync(testClass);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isFutureISODate).toBe('Invalid date');
  });

  it('should invalidate non-string value', () => {
    const testClass = new TestClass();
    // @ts-expect-error: Intentionally assigning wrong type for testing
    testClass.date = 12345;
    const errors = validateSync(testClass);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isFutureISODate).toBe('Invalid date');
  });
});
