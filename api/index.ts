import app from "../Backend/src/app";

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong"
    });
  }
}
