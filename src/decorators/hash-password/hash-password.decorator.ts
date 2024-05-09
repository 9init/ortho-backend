import { Transform, TransformFnParams } from "class-transformer";
import { hashPasswordSync } from "./helper";

/**
 * Decorator that hashes the password value using memoization.
 * @returns The transformed hashed password value.
 */
export const HashPassword = () =>
  Transform(({ value }: TransformFnParams) => {
    return hashPasswordSync(value);
  });
