/* eslint-disable import/prefer-default-export */
import { envSchemaMap as resourcesEnvSchemaMap } from "@src/commands/resources/validations.schema";
import { ValidationOperator } from "@src/utils/Validator";

const envSchema = () =>
  ValidationOperator.object({
    ...resourcesEnvSchemaMap(),
  }).unknown(true); // Allow unknown because secrets can be included too

export { envSchema };
