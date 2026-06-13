import { apiFootballSyncService } from "../api-football/api-football.sync.service";
import { env } from "../../config/env";

type SyncReason = "regular" | "live";

export class SyncSchedulerService {
  private isStarted = false;
  private isSyncRunning = false;
  private regularSyncTimer?: ReturnType<typeof setInterval>;
  private liveSyncTimer?: ReturnType<typeof setInterval>;

  startScheduler() {
    if (!env.API_FOOTBALL_SCHEDULER_ENABLED) {
      console.log("API-Football sync scheduler disabled");
      return;
    }

    if (this.isStarted) {
      return;
    }

    this.isStarted = true;
    console.log("API-Football sync scheduler started");
    console.log(`Season: ${env.API_FOOTBALL_SEASON}`);
    console.log(
      `Regular sync interval: ${env.API_FOOTBALL_REGULAR_SYNC_INTERVAL_MS} ms`,
    );
    console.log(
      `Live sync interval: ${env.API_FOOTBALL_LIVE_SYNC_INTERVAL_MS} ms`,
    );

    this.regularSyncTimer = setInterval(() => {
      void this.syncFixtures("regular");
    }, env.API_FOOTBALL_REGULAR_SYNC_INTERVAL_MS);

    this.liveSyncTimer = setInterval(() => {
      void this.syncLiveFixtures();
    }, env.API_FOOTBALL_LIVE_SYNC_INTERVAL_MS);
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
    this.isSyncRunning = false;
  }

  private async syncLiveFixtures() {
    await this.syncLiveFixturesOnce("live");
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
        await apiFootballSyncService.syncWorldCupFixtures(
          env.API_FOOTBALL_SEASON,
        );

      console.log(`API-Football ${reason} sync finished`, result);
    } catch (error) {
      console.error(`API-Football ${reason} sync failed`, error);
    } finally {
      this.isSyncRunning = false;
    }
  }

  private async syncLiveFixturesOnce(reason: SyncReason) {
    if (this.isSyncRunning) {
      console.log(
        "API-Football live sync skipped because another sync is running",
      );
      return;
    }

    this.isSyncRunning = true;

    try {
      await apiFootballSyncService.syncLiveWorldCupFixtures(
        env.API_FOOTBALL_SEASON,
      );
    } catch (error) {
      console.error(`API-Football ${reason} sync failed`, error);
    } finally {
      this.isSyncRunning = false;
    }
  }
}

export const syncSchedulerService = new SyncSchedulerService();
