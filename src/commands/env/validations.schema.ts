/* eslint-disable import/prefer-default-export */
import { envSchema as resourcesEnvSchema } from "@src/commands/resources/validations.schema";
import { ValidationOperator } from "@src/utils/Validator";

const envSchema = () =>
  ValidationOperator.object({
    ...resourcesEnvSchema(),
  });

export { envSchema };
