import { client } from "./index.js";
import bcrypt from "bcrypt";

export async function genPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function createUser(username, hashedPassword) {
  return await client
    .db("password-reset")
    .collection("users")
    .insertOne({ username: username, password: hashedPassword });
}

export async function getUserByName(username) {
  return await client
    .db("password-reset")
    .collection("users")
    .findOne({ username: username });
}

export async function getUserList() {
  return await client.db("password-reset").collection("users").find().toArray();
}
