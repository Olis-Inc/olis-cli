import { SchemaMap, ValidationOperator } from "@src/utils/Validator";
import {
  ResourceConfig,
  ResourceItemConfig,
  ResourceItemConfigEnv,
  ResourceItemManagementType,
  ResourceType,
} from "@src/types/resource";
import resources from ".";

const envSchema = () =>
  Object.values(ResourceType).reduce<SchemaMap>((acc, resource) => {
    const schema = resources.getResource(resource).envSchemaMap;
    return {
      ...acc,
      ...schema,
    };
  }, {});

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
        .valid(...Object.keys(ResourceItemManagementType)),
      production: ValidationOperator.string()
        .required()
        .valid(...Object.keys(ResourceItemManagementType)),
    }).required(),
  }),
);

export { envSchema, configSchema };
