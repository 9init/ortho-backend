import { Transform, TransformFnParams } from "class-transformer";
import { hashPasswordSync } from "./helper";

/**
 * Decorator that hashes the password value using memoization.
 * @returns The transformed hashed password value.
 */
export const HashPassword = () =>
  // Memoization ensures that the password is hashed only once and subsequent calls return the same hashed value.
  (() => {
    let hashed = undefined;
    return Transform(({ value }: TransformFnParams) => {
      hashed ??= hashPasswordSync(value);
      return hashed;
    });
  })();
