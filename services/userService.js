const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");

  const derivedKey = await scrypt(inputPassword, salt, 64);

  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const prisma = new PrismaClient();

async function createUser(data) {
  const hashed = await hashPassword(data.password);
  delete data.password;
  return await prisma.user.create({
    data: { ...data, hashedPassword: hashed },
  });
}

async function verifyUserPassword(userId, inputPassword) {
  const user = await prisma.user.findUnique({ where: { email: userId }, mode: "insensitive" });
  if (!user) return { user: null, isValid: false };

  return {
    user,
    isValid: await comparePassword(inputPassword, user.hashedPassword),
  };
}

module.exports = { createUser, verifyUserPassword };
