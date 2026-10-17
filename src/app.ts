import cors from "cors";
import express from "express";
import { router } from "./routes";

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
	}),
);
app.use(express.json());
app.use(router);

export { app };
