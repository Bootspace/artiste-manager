import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI_PROD", "MONGO_URI","JWT_SECRET", "JWT_EXPIRES_IN"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI  as string,
  mongoProd: process.env.MONGO_URI_PROD as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
};
