-- CreateTable
CREATE TABLE "FavoriteCity" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "userId" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteCity_pkey" PRIMARY KEY ("id")
);
