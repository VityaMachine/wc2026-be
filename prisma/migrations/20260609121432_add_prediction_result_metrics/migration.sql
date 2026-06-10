-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "isDrawGuessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isExactScore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGoalDifferenceGuessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTotalGoalsGuessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWinnerGuessed" BOOLEAN NOT NULL DEFAULT false;
