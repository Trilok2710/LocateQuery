import express from "express";
import queryRoutes from "./src/routes/queryRoutes.js";
import { PORT } from "./config/index.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());


app.use("/query", queryRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("server is up");
});