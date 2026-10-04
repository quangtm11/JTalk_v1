// import mongoose from "mongoose";
// import config from "./index.js";

// export const connectDB = async () => {
//   try {
//     const uri = config.mongoUri || process.env.MONGODB_CONNECTIONSTRING;
//     if (!uri) {
//       throw new Error("MONGODB_CONNECTIONSTRING chưa được cấu hình trong file .env");
//     }
//     // @ts-ignore
//     await mongoose.connect(uri);
//     console.log("✅ Liên kết CSDL MongoDB Atlas thành công!");
//   } catch (error) {
//     console.error("❌ Lỗi khi kết nối CSDL:", error.message || error);
//     process.exit(1);
//   }
// };

// export default connectDB;


import mongoose from "mongoose";
import dns from "dns";

import config from "./index.js";

// Force Node.js to use public DNS servers.
// This fixes MongoDB Atlas SRV lookup when Node resolves through 127.0.0.1.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    const uri = config.mongoUri || process.env.MONGODB_CONNECTIONSTRING;

    if (!uri) {
      throw new Error(
        "MONGODB_CONNECTIONSTRING chưa được cấu hình trong file .env"
      );
    }

    console.log("🌐 Node.js DNS:", dns.getServers());

    await mongoose.connect(uri);

    console.log("✅ Liên kết CSDL MongoDB Atlas thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi kết nối CSDL:", error.message || error);
    process.exit(1);
  }
};

export default connectDB;