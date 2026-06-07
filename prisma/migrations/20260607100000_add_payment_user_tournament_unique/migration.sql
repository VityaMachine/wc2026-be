-- CreateIndex
CREATE UNIQUE INDEX "Payment_userId_tournamentId_key" ON "Payment"("userId", "tournamentId");
