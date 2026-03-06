import type { NextApiRequest, NextApiResponse } from "next";
import backendHandler from "../../../api/index";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return backendHandler(req as any, res as any);
}
