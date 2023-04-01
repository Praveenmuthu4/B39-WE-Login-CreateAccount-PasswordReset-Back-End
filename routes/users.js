import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  genPassword,
  createUser,
  getUserByName,
  getUserList,
} from "../helper.js";
const userFromDb = require("../models/userSchema.js")
const authenticate = require("../middleware/auth.js");
const nodemailer = require("nodemailer");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
      user:process.env.EMAIL,
      pass:process.env.PASSWORD
  }
}) 


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

// //forget-password

// router.post("/forget-password",async (req, res, next) => {
//   const { Email } = req.body;
//   const userFromDb = await getUserByName(Email);
//   console.log(userFromDb)
//   if (!userFromDb) {
//     res.status(400).send({message:"User details not registered"});
//     return;
//   }
//   const secret = process.env.SECRET_KEY + userFromDb.password;
//   const payload = {
//     Email: userFromDb.Email,
//   };
//   const token = jwt.sign(payload, secret, { expiresIn: "15m" });
//   const localhost = `http://localhost:4000/reset-password/${userFromDb.Email}/${token}`;
//   const link =  localhost
//   console.log(link);
//   res.send(
//     "Password reset link has been sent to your email ID and Its valid for 15 minutes only"
//   );
// });

// //reset-password
// router.get("/reset-password/:Email/:token",async (req, res, next) => {
//   const { Email, token } = req.params;
//   const userFromDb = await getUserByName(Email);
//   if (!userFromDb) {
//     res.send("Invalid ID");
//     return;
//   }
//   const secret = process.env.SECRET_KEY + userFromDb.password;
//   try {
//     const payload = jwt.verify(token, secret);
//     res.render( { Email: userFromDb.Email });
//   } catch (error) {
//     console.log(error.message);
//     res.send(error.message);
//   }
// });

// router.post("/reset-password/:Email/:token",async (req, res, next) => {
//   const { Email, token } = req.params;
//   const storedDbPassword = userFromDb.password;
//   const isPasswordMatch = await bcrypt.compare(password, storedDbPassword);

//   const { password} = req.body;

//   if (Email !== userFromDb.Email) {
//     res.send("Invalid ID");
//     return;
//   }
//   const secret = process.env.SECRET_KEY + user.password;
//   try {
//     const payload = jwt.verify(token, secret);
//     userFromDb.password = password;
//     res.send(user);
//   } catch (error) {
//     console.log(error.message);
//     res.send(error.message);
//   }
// });


router.post("/reset-password",async(req,res)=>{
  console.log(req.body)

  const {Email} = req.body;

  if(!Email){
      res.status(401).json({status:401,message:"Enter Your Email"})
  }

  try {
      const userFind = await users.findOne({email:email});

      // token generate for reset password
      const token = jwt.sign({_id:userFromDb._id},keysecret,{
          expiresIn:"120s"
      });
      
      const setusertoken = await users.findByIdAndUpdate({Email:userFind.Email},{verifytoken:token},{new:true});


      if(setusertoken){
          const mailOptions = {
              from:process.env.EMAIL,
              to:Email,
              subject:"Sending Email For password Reset",
              text:`This Link Valid For 2 MINUTES http://localhost:3001/forgotpassword/${userFromDb.Email}/${setusertoken.verifytoken}`
          }

          transporter.sendMail(mailOptions,(error,info)=>{
              if(error){
                  console.log("error",error);
                  res.status(401).json({status:401,message:"email not send"})
              }else{
                  console.log("Email sent",info.response);
                  res.status(201).json({status:201,message:"Email sent Succsfully"})
              }
          })

      }

  } catch (error) {
      res.status(401).json({status:401,message:"invalid user"})
  }

});

router.get("/forgot-password/:Email/:token",async(req,res)=>{
  const {Email,token} = req.params;

  try {
      const validuser = await users.findOne({Email:Email,verifytoken:token});
      
      const verifyToken = jwt.verify(token,keysecret);

      console.log(verifyToken)

      if(validuser && verifyToken.Email){
          res.status(201).json({status:201,validuser})
      }else{
          res.status(401).json({status:401,message:"user not exist"})
      }

  } catch (error) {
      res.status(401).json({status:401,error})
  }
});

router.post("/:Email/:token",async(req,res)=>{
  const {Email,token} = req.params;

  const {password} = req.body;

  try {
      const validuser = await userdb.findOne({Email:Email,verifytoken:token});
      
      const verifyToken = jwt.verify(token,keysecret);

      if(validuser && verifyToken.Email){
          const newpassword = await bcrypt.hash(password,12);

          const setnewuserpass = await userdb.findByIdAndUpdate({Email:Email},{password:newpassword});

          setnewuserpass.save();
          res.status(201).json({status:201,setnewuserpass})

      }else{
          res.status(401).json({status:401,message:"user not exist"})
      }
  } catch (error) {
      res.status(401).json({status:401,error})
  }
})



export const userRouter = router;

//Validate Email
//Validate Password
