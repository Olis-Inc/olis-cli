import { AppConfig, Framework, StateStorage } from "@src/types/config";
import { configSchema as resourcesConfigSchema } from "@src/commands/resources/validations.schema";
import { configSchema as computeConfigSchema } from "@src/commands/compute/validations.schema";
import Joi from "joi";

const configSchema = Joi.object<undefined, false, AppConfig>({
  framework: Joi.string().valid(...Object.keys(Framework)),
  name: Joi.string().required(),
  hostname: Joi.string(),
  subdomain: Joi.string(),
  environmentFile: Joi.string().required(),
  stateStorage: Joi.string().valid(...Object.keys(StateStorage)),
  compute: computeConfigSchema,
  architecture: Joi.string().required(),
  infrastructure: Joi.boolean().required(),
  resources: resourcesConfigSchema,
  manageRepository: Joi.boolean().required(),
});

export { configSchema, resourcesConfigSchema };
