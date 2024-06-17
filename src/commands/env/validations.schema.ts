/* eslint-disable import/prefer-default-export */
import { envSchema as resourcesEnvSchema } from "@src/commands/resources/validations.schema";
import { envSchema as computeEnvSchema } from "@src/commands/compute/validations.schema";
import { AppConfig } from "@src/types/config";
import { ValidationOperator } from "@src/utils/Validator";

const envSchema = (config: AppConfig) =>
  ValidationOperator.object()
    .concat(resourcesEnvSchema(config))
    .concat(computeEnvSchema(config));
// .unknown(true); // Allow unknown because secrets can be included too

export { envSchema };
