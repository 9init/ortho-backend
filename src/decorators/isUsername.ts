import { ValidateBy, ValidationOptions, buildMessage } from "class-validator";

const IS_USERNAME = "IS_USERNAME";
const MIN_LENGTH = 4;
const MAX_LENGTH = 15;
const USERNAME_INVALID_LENGTH_ERROR =
  "$property must be between 4 and 15 characters.";
const USERNAME_INVALID_FORMAT_ERROR = "$property is in an invalid format.";

export const USERNAME_REGEX = new RegExp(
  `^(?=[a-zA-Z0-9.]{${MIN_LENGTH},${MAX_LENGTH}}$)(?!.*[.]{2})[^.].*[^.]$`,
);

/**
 * Returns an error message if the provided username value is invalid.
 * @param value - The username value to validate.
 * @returns An error message if the username is invalid, otherwise undefined.
 */
export function getUsernameErrorMSG(value: string) {
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH)
    return USERNAME_INVALID_LENGTH_ERROR;
  if (!USERNAME_REGEX.test(value)) return USERNAME_INVALID_FORMAT_ERROR;
}

/**
 * Checks if the string is a valid username.
 * If given value is not a string, then it returns false.
 * @param value The value to be checked.
 * @returns True if the string is a valid username, false otherwise.
 */
export function isUsername(value: string): boolean {
  return USERNAME_REGEX.test(value);
}

/**
 * Decorator to checks if the field is a valid username.
 * If given value is not a string, then it returns false.
 */
export function IsUsername(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_USERNAME,
      validator: {
        validate: isUsername,
        defaultMessage: buildMessage(
          (eachPrefix, args) => eachPrefix + getUsernameErrorMSG(args.value),
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
