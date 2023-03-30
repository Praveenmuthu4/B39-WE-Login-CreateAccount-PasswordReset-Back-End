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
// let user = {
//   Email: getUserList(),
// };

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

router.get("/forget-password", (req, res, next) => {
  res.render("forget-password");
});

//forget-password

router.post("/forget-password",async (req, res, next) => {
  const { Email } = req.body;
  const userFromDb = await getUserByName(Email);
  console.log(userFromDb)
  if (!userFromDb) {
    res.status(400).send({message:"User details not registered"});
    return;
  }
  const secret = process.env.SECRET_KEY + userFromDb.password;
  const payload = {
    Email: userFromDb.Email,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `http://localhost:3500/reset-password/${userFromDb.Email}/${token}`;
  console.log(link);
  res.send(
    "Password reset link has been sent to your email ID and Its valid for 15 minutes only"
  );
});

//reset-password
router.get("/reset-password/:Email/:token",async (req, res, next) => {
  const { Email, token } = req.params;
  const userFromDb = await getUserByName(Email);
  if (!userFromDb) {
    res.send("Invalid ID");
    return;
  }
  const secret = process.env.SECRET_KEY + userFromDb.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { Email: userFromDb.Email });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

router.post("/reset-password/:Email/:token",async (req, res, next) => {
  const { Email, token } = req.params;
  const storedDbPassword = userFromDb.password;
  const isPasswordMatch = await bcrypt.compare(password, storedDbPassword);

  const { password} = req.body;

  if (Email !== userFromDb.Email) {
    res.send("Invalid ID");
    return;
  }
  const secret = process.env.SECRET_KEY + user.password;
  try {
    const payload = jwt.verify(token, secret);
    userFromDb.password = password;
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

export const userRouter = router;

//Validate Email
//Validate Password
