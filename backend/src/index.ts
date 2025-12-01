import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "Core API" });
});

app.listen(PORT, () => {
  console.log(`[Core API] Server running on port ${PORT}`);
});
