import { describe, it, expect } from 'vitest';
import { calculateLeaderboard, selectRandomWinners } from '../utils';

describe('calculateLeaderboard', () => {
  it('should sort players by score in descending order', () => {
    const players = [
      { id: '1', name: 'Kevin', score: 1595 },
      { id: '2', name: 'Miranda is gay', score: 0 },
      { id: '3', name: 'Alice', score: 800 },
    ];

    const leaderboard = calculateLeaderboard(players);

    expect(leaderboard[0]).toMatchObject({
      playerId: '1',
      playerName: 'Kevin',
      score: 1595,
      rank: 1,
    });
    expect(leaderboard[1]).toMatchObject({
      playerId: '3',
      playerName: 'Alice',
      score: 800,
      rank: 2,
    });
    expect(leaderboard[2]).toMatchObject({
      playerId: '2',
      playerName: 'Miranda is gay',
      score: 0,
      rank: 3,
    });
  });

  it('should assign correct ranks', () => {
    const players = [
      { id: '1', name: 'First', score: 100 },
      { id: '2', name: 'Second', score: 90 },
      { id: '3', name: 'Third', score: 80 },
    ];

    const leaderboard = calculateLeaderboard(players);

    expect(leaderboard.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('should handle equal scores', () => {
    const players = [
      { id: '1', name: 'Alice', score: 100 },
      { id: '2', name: 'Bob', score: 100 },
      { id: '3', name: 'Charlie', score: 50 },
    ];

    const leaderboard = calculateLeaderboard(players);

    // Both with 100 should be ranked 1 and 2
    expect(leaderboard[0].score).toBe(100);
    expect(leaderboard[1].score).toBe(100);
    expect(leaderboard[2].score).toBe(50);
    expect(leaderboard[2].rank).toBe(3);
  });

  it('should handle empty player list', () => {
    const leaderboard = calculateLeaderboard([]);
    expect(leaderboard).toEqual([]);
  });

  it('should handle single player', () => {
    const players = [{ id: '1', name: 'Solo', score: 42 }];
    const leaderboard = calculateLeaderboard(players);

    expect(leaderboard).toEqual([
      {
        playerId: '1',
        playerName: 'Solo',
        score: 42,
        rank: 1,
      },
    ]);
  });
});

describe('selectRandomWinners', () => {
  it('should select correct number of winners', () => {
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ];

    const winners = selectRandomWinners(players, 1);
    expect(winners).toHaveLength(1);

    const winners2 = selectRandomWinners(players, 2);
    expect(winners2).toHaveLength(2);

    const winners3 = selectRandomWinners(players, 3);
    expect(winners3).toHaveLength(3);
  });

  it('should return winners with correct structure', () => {
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const winners = selectRandomWinners(players, 1);

    expect(winners[0]).toHaveProperty('playerId');
    expect(winners[0]).toHaveProperty('playerName');
    expect(typeof winners[0].playerId).toBe('string');
    expect(typeof winners[0].playerName).toBe('string');
  });

  it('should not select the same player twice', () => {
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ];

    const winners = selectRandomWinners(players, 3);
    const winnerIds = winners.map((w) => w.playerId);

    // All IDs should be unique
    expect(new Set(winnerIds).size).toBe(3);
  });

  it('should only select from provided players', () => {
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const winners = selectRandomWinners(players, 2);
    const validIds = new Set(['1', '2']);

    winners.forEach((winner) => {
      expect(validIds.has(winner.playerId)).toBe(true);
    });
  });

  it('should handle default count parameter', () => {
    const players = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const winners = selectRandomWinners(players);
    expect(winners).toHaveLength(1);
  });

  it('should handle single player', () => {
    const players = [{ id: '1', name: 'Solo' }];

    const winners = selectRandomWinners(players, 1);

    expect(winners).toEqual([
      {
        playerId: '1',
        playerName: 'Solo',
      },
    ]);
  });
});
