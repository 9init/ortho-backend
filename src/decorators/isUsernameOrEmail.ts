import { ValidateBy, ValidationOptions, buildMessage } from "class-validator";
import ValidatorJS from "validator";
import { USERNAME_REGEX } from "./isUsername";

const IS_USERNAME_OR_EMAIL = "IS_USERNAME_OR_EMAIL";
const USERNAME_OR_EMAIL_IS_INVALID =
  "$property must be a valid username or email";

/**
 * Checks if the given value is a valid username or email.
 * @param value - The value to be checked.
 * @returns True if the value is a valid username or email, false otherwise.
 */
export function isUsernameOrEmail(value: string): boolean {
  return value && (ValidatorJS.isEmail(value) || USERNAME_REGEX.test(value));
}

/**
 * Decorator that validates if a value is a valid username or email.
 *
 * @param validationOptions - The validation options.
 * @returns The property decorator.
 */
export function IsUsernameOrEmail(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_USERNAME_OR_EMAIL,
      validator: {
        validate: isUsernameOrEmail,
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + USERNAME_OR_EMAIL_IS_INVALID,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
