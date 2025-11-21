-- CreateTable
CREATE TABLE "sitesettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'SMMM Ofisi',
    "siteDescription" TEXT,
    "favicon" TEXT,
    "brandIcon" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "mapLatitude" TEXT,
    "mapLongitude" TEXT,
    "mapEmbedUrl" TEXT,
    "facebookUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "threadsUrl" TEXT,
    "xUrl" TEXT
);
