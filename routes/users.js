import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  genPassword,
  createUser,
  getUserByName,
  getUserList,
} from "../helper.js";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const isUserExist = await getUserByName(username);
  console.log(isUserExist);
  if (isUserExist) {
    res.status(400).send({ message: "Username already taken" });
    return;
  }
  if (
    !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%&]).{8,}$/g.test(password)
  ) {
    res.status(400).send({ message: "Password pattern does not match" });
    return;
  }
  const hashedPassword = await genPassword(password);
  const result = await createUser(username, hashedPassword);
  res.send(result);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const userFromDb = await getUserByName(username);
  console.log(userFromDb);
  if (!userFromDb) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }

  const storedDbPassword = userFromDb.password;
  const isPasswordMatch = await bcrypt.compare(password, storedDbPassword);
  if (!isPasswordMatch) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }

  const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY);
  console.log(token);
  res.send({ message: "Successfully Logged In", token: token });
});

//get all users

router.get("/list", async (req, res) => {
  const result = await getUserList();
  res.send(result);
});

export const userRouter = router;

//Validate userName
//Validate Password
