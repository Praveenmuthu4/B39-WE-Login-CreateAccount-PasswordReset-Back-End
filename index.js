import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { userRouter } from "./routes/users.js";
import cors from "cors"

dotenv.config();
const app = express();
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is Connected");
  return client;
}

export const client = await createConnection();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to Login Page");
  });

app.use("/users", userRouter)

app.listen(PORT, () => console.log("Server started on PORT ", PORT));