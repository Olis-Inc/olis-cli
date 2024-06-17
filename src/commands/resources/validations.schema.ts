import { ValidationOperator } from "@src/utils/Validator";
import {
  ResourceConfig,
  ResourceItemConfig,
  ResourceItemConfigEnv,
  ResourceItemManagementType,
  ResourceType,
} from "@src/types/resource";
import { STRICTLY_FULLY_MANAGED_PROVIDERS_REGEX } from "@src/utils/constants";
import { AppConfig } from "@src/types/config";
import resources from ".";

const envSchema = (config: AppConfig) =>
  Object.keys(config.resources).reduce<ValidationOperator.ObjectSchema>(
    (acc, resource) => {
      const schema = resources
        .getResource(resource as ResourceType)
        .getEnvSchemaMap(config);
      return acc.keys({
        ...schema,
      });
    },
    ValidationOperator.object().unknown(true),
  );

const configSchema = ValidationOperator.object<
  undefined,
  false,
  ResourceConfig
>().pattern(
  ValidationOperator.string().valid(...Object.keys(ResourceType)),
  ValidationOperator.object<undefined, false, ResourceItemConfig>({
    port: ValidationOperator.number().required(),
    env: ValidationOperator.object<undefined, false, ResourceItemConfigEnv>({
      staging: ValidationOperator.string()
        .required()
        /*
          If architecture.staging starts with item from strictly managed providers,
          then resource config should be fully-managed as well,
          otherwise, it can be an resource management type.
          As an aside, none architecture just does nothing, and is good to test your setup
        */
        .when(ValidationOperator.ref("/compute.staging"), {
          is: ValidationOperator.string().pattern(
            STRICTLY_FULLY_MANAGED_PROVIDERS_REGEX,
          ),
          then: ValidationOperator.valid(ResourceItemManagementType.managed),
          otherwise: ValidationOperator.valid(
            ...Object.keys(ResourceItemManagementType),
          ),
        }),
      production: ValidationOperator.string()
        .required()
        .when(ValidationOperator.ref("/compute.production"), {
          is: ValidationOperator.string().pattern(
            STRICTLY_FULLY_MANAGED_PROVIDERS_REGEX,
          ),
          then: ValidationOperator.valid(ResourceItemManagementType.managed),
          otherwise: ValidationOperator.valid(
            ...Object.keys(ResourceItemManagementType),
          ),
        }),
    }).required(),
  }),
);

export { configSchema, envSchema };
