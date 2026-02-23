import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// API endpoints
app.use("/api/admin", adminRouter);
//localhost:4000/api/admin/add-doctor
app.use("/api/doctor",doctorRouter)

app.use('/api/user',userRouter)
app.get("/", (req, res) => {
  res.send("API Working ");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working successfully!",
  });
});

// Initialize connections and start server
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    
    // Start server only after successful connections
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
