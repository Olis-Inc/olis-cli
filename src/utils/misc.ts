/* eslint-disable import/prefer-default-export */

const keyValuePairsToJSON = (content: string) =>
  content.split("\n").reduce<Record<string, string>>((acc, line) => {
    // eslint-disable-next-line no-param-reassign
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, value] = line.split("=", 2);
      acc[key] = value;
    }
    return acc;
  }, {});

const jsonToKeyValuePairs = (content: Record<string, unknown>) =>
  Object.keys(content)
    .map((key) => `${key}=${content[key]}`)
    .join("\n");

const camelCaseToSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, "_$1").toLowerCase();

const toSentenceCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.substring(1);

export {
  keyValuePairsToJSON,
  camelCaseToSnakeCase,
  jsonToKeyValuePairs,
  toSentenceCase,
};
