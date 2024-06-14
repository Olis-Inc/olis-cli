import ValidationOperator, { PartialSchemaMap as SchemaMap } from "joi";

class Validator {
  // eslint-disable-next-line class-methods-use-this
  validate(
    schema: ValidationOperator.ObjectSchema,
    obj: object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any,
  ) {
    const result = schema.validate(obj, { context });
    if (result.error) {
      throw result.error;
    }

    return result.value;
  }
}

export default Validator;
export { SchemaMap, ValidationOperator };
