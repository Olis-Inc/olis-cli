import { ComputeConfig } from "@src/types/compute";
import { ValidationOperator } from "@src/utils/Validator";
import { VALID_COMPUTE_ID_REGEX } from "@src/utils/constants";

const configSchema = ValidationOperator.object<undefined, false, ComputeConfig>(
  {
    staging: ValidationOperator.string()
      .required()
      .pattern(VALID_COMPUTE_ID_REGEX),
    production: ValidationOperator.string()
      .required()
      .pattern(VALID_COMPUTE_ID_REGEX),
  },
).required();

// eslint-disable-next-line import/prefer-default-export
export { configSchema };
