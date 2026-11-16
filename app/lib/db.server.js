import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const db = globalForPrisma.__weddingPrisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.__weddingPrisma = db;
