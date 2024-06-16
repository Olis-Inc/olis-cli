import config from "@src/config";
import { ComputeProvider } from "@src/types/compute";
import { AppConfig } from "@src/types/config";
import { PromptQuestion } from "@src/types/prompt";
import Prompt from "@src/utils/Prompt";
import Storage from "@src/utils/Storage";
import { SchemaMap, ValidationOperator } from "@src/utils/Validator";
import { toSentenceCase } from "@src/utils/misc";

const AWS_ACCESS_TOKEN = "AWS_ACCESS_TOKEN";
const AWS_SECRET_TOKEN = "AWS_SECRET_TOKEN";
const VERCEL_ACCESS_TOKEN = "VERCEL_ACCESS_TOKEN";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = PromptQuestion<any>;

class Providers {
  config = config;

  secureStorage = new Storage("secrets");

  private prompt = new Prompt();

  // eslint-disable-next-line class-methods-use-this
  private getProviderId(computeId: string) {
    return computeId.split(":")[0] as ComputeProvider;
  }

  private getCredentialKeys(computeId: string) {
    const providerId = this.getProviderId(computeId);

    switch (providerId) {
      case ComputeProvider.none:
        return [];

      case ComputeProvider.aws:
        return [AWS_ACCESS_TOKEN, AWS_SECRET_TOKEN];

      case ComputeProvider.vercel:
        return [VERCEL_ACCESS_TOKEN];

      default:
        throw new Error(`Unrecognized provider ${providerId}`);
    }
  }

  async getCredentials(
    envCompute: { staging: string; production: string },
    filterFxn: ((item: Q, i: number) => boolean) | undefined = undefined,
  ) {
    try {
      const credentialKeys = [
        ...this.getCredentialKeys(envCompute.staging),
        ...this.getCredentialKeys(envCompute.production),
      ];
      const credentials = this.secureStorage.all;

      let questions: Array<Q> = credentialKeys.map((key) => {
        const label = toSentenceCase(key.replace(/_/g, " "));
        return {
          type: "password",
          name: key,
          message: `${label}:`,
          default: credentials[key],
          validate: (value) =>
            this.prompt.validations.required(value, `Please enter ${label}`),
        };
      });
      if (filterFxn) {
        questions = questions.filter(filterFxn);
      }

      const answers = await this.prompt.ask(questions);
      const inSync = Object.keys(answers).length === 0;

      for (const answerKey of Object.keys(answers)) {
        this.secureStorage.set(answerKey, answers[answerKey]);
      }

      return Promise.resolve({ inSync });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  envSchemaMap(config: AppConfig) {
    return [
      ...this.getCredentialKeys(config.compute.staging),
      ...this.getCredentialKeys(config.compute.production),
    ].reduce<SchemaMap>((schema, key) => {
      // eslint-disable-next-line no-param-reassign
      schema[key] = ValidationOperator.string().required();
      return schema;
    }, {});
  }
}

export default Providers;
