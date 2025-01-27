import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config();

const nextConfig: NextConfig = {
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
