import { prisma } from "../../lib/prisma";
import { apiFootballSyncService } from "../api-football/api-football.sync.service";

const WORLD_CUP_SEASON = 2026;
const REGULAR_SYNC_INTERVAL_MS = 3 * 60 * 60 * 1000;
const LIVE_SYNC_INTERVAL_MS = 60 * 1000;

type SyncReason = "regular" | "live";

export class SyncSchedulerService {
  private isStarted = false;
  private isSyncRunning = false;
  private regularSyncTimer?: ReturnType<typeof setInterval>;
  private liveSyncTimer?: ReturnType<typeof setInterval>;

  startScheduler() {
    if (this.isStarted) {
      return;
    }

    this.isStarted = true;
    console.log("API-Football sync scheduler started");

    this.regularSyncTimer = setInterval(() => {
      void this.syncFixtures("regular");
    }, REGULAR_SYNC_INTERVAL_MS);

    this.liveSyncTimer = setInterval(() => {
      void this.syncLiveFixturesIfNeeded();
    }, LIVE_SYNC_INTERVAL_MS);
  }

  stopScheduler() {
    if (this.regularSyncTimer) {
      clearInterval(this.regularSyncTimer);
    }

    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
    }

    this.regularSyncTimer = undefined;
    this.liveSyncTimer = undefined;
    this.isStarted = false;
  }

  private async syncLiveFixturesIfNeeded() {
    try {
      const liveMatchesCount = await prisma.match.count({
        where: { status: "LIVE" },
      });

      if (liveMatchesCount === 0) {
        return;
      }

      await this.syncFixtures("live");
    } catch (error) {
      console.error("API-Football live sync check failed", error);
    }
  }

  private async syncFixtures(reason: SyncReason) {
    if (this.isSyncRunning) {
      console.log("API-Football sync skipped because another sync is running");
      return;
    }

    this.isSyncRunning = true;
    console.log(`API-Football ${reason} sync started`);

    try {
      const result =
        await apiFootballSyncService.syncWorldCupFixtures(WORLD_CUP_SEASON);

      console.log(`API-Football ${reason} sync finished`, result);
    } catch (error) {
      console.error(`API-Football ${reason} sync failed`, error);
    } finally {
      this.isSyncRunning = false;
    }
  }
}

export const syncSchedulerService = new SyncSchedulerService();
