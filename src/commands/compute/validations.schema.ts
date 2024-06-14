import { ComputeConfig } from "@src/types/config";
import { ValidationOperator } from "@src/utils/Validator";

const configSchema = ValidationOperator.object<undefined, false, ComputeConfig>(
  {
    staging: ValidationOperator.string().required(),
    production: ValidationOperator.string().required(),
  },
).required();

// eslint-disable-next-line import/prefer-default-export
export { configSchema };
