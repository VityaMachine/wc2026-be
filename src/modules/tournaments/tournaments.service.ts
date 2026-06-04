import { tournamentsRepository } from './tournaments.repository';

export class TournamentsService {
  async list() {
    const tournaments = await tournamentsRepository.findAll();
    return tournaments.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      isPrizePoolEnabled: t.isPrizePoolEnabled,
    }));
  }

  async getBySlug(slug: string) {
    const t = await tournamentsRepository.findBySlug(slug);
    if (!t) {
      const err = new Error('Tournament not found');
      (err as any).status = 404;
      throw err;
    }

    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      prizePoolEntryDeadline: t.prizePoolEntryDeadline,
      entryFee: t.entryFee.toString(),
      currency: t.currency,
      isPrizePoolEnabled: t.isPrizePoolEnabled,
    };
  }
}

export const tournamentsService = new TournamentsService();
