
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
//accepts less than 1 but not equal to 0
@ValidatorConstraint({ async: false })
export class IsPositiveNonZeroNumber implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value === 'string') {
      let numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    } else if (typeof value === 'number') {
      return value > 0;
    }
    return false;
  }

  defaultMessage(): string {
    return 'Value must be a positive non-zero number.';
  }
}