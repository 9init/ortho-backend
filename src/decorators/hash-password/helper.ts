import { randomBytes, scryptSync, scrypt } from "crypto";

export function hashPasswordSync(
  password: string,
  salt: string = randomBytes(16).toString("hex"),
): string {
  const key = scryptSync(password, salt, 64);

  return `${key.toString("hex")}.${salt}`;
}

export async function hashPasswordAsync(
  password: string,
  salt: string = randomBytes(16).toString("hex"),
): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(`${key.toString("hex")}.${salt}`);
    });
  });
}

export async function comparePasswords(
  candidatePassword: string,
  hashedPassword: string,
): Promise<boolean> {
  // Extract the salt from the stored hashed password
  const [, storedSalt] = hashedPassword.split(".");
  const hashedCandidatePass = await hashPasswordAsync(
    candidatePassword,
    storedSalt,
  );
  return hashedCandidatePass == hashedPassword;
}
