import { teamRepository } from './team.repository';

export class TeamService {
  async list(tournamentId?: string) {
    const teams = await teamRepository.findAllByTournament(tournamentId);
    return teams.map((t) => ({ id: t.id, name: t.name, code: t.code }));
  }
}

export const teamService = new TeamService();
