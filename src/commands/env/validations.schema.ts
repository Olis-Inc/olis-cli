/* eslint-disable import/prefer-default-export */
import { envSchemaMap as resourcesEnvSchemaMap } from "@src/commands/resources/validations.schema";
import { AppConfig } from "@src/types/config";
import { ValidationOperator } from "@src/utils/Validator";
import compute from "../compute";

const envSchema = (config: AppConfig) =>
  ValidationOperator.object({
    ...resourcesEnvSchemaMap(),
    ...compute.providers.envSchemaMap(config),
  }).unknown(true); // Allow unknown because secrets can be included too

export { envSchema };
