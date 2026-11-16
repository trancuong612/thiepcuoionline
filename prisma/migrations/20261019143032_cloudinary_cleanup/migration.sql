-- CreateTable
CREATE TABLE "CloudinaryCleanup" (
    "publicId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudinaryCleanup_pkey" PRIMARY KEY ("publicId")
);
