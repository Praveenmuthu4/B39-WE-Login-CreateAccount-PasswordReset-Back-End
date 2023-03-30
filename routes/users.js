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
  const { Email, password } = req.body;
  console.log(Email, password);
  const isUserExist = await getUserByName(Email);
  console.log(isUserExist);
  if (isUserExist) {
    res.status(400).send({ message: "Email already taken" });
    return;
  }
  if (
    !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%&]).{8,}$/g.test(password)
  ) {
    res.status(400).send({ message: "Password pattern does not match" });
    return;
  }
  const hashedPassword = await genPassword(password);
  const result = await createUser(Email, hashedPassword);
  res.send(result);
});

router.post("/login", async (req, res) => {
  const { Email, password } = req.body;
  console.log(Email, password);
  const userFromDb = await getUserByName(Email);
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

//Validate Email
//Validate Password
