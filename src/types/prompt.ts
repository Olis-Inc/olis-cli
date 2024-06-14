import { DistinctQuestion } from "inquirer";

export type PromptQuestion<T> = DistinctQuestion & { name: keyof T };
