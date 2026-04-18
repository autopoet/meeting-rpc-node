-- CreateTable
CREATE TABLE "Meeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizer" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "participants" INTEGER NOT NULL
);
