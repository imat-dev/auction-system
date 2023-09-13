import { ValueTransformer } from 'typeorm';

export const decimalTransformer: ValueTransformer = {
  from: (dbValue: string) => parseFloat(dbValue),
  to: (entityValue: number) => {
    return entityValue !== undefined ? entityValue.toString() : 0   },
};
