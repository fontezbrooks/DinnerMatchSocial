import { knex } from '../config/database';
import { MatchResult, RestaurantItem } from './types';

export interface VoteRecord {
  id: string;
  session_id: string;
  user_id: string;
  item_id: string;
  item_type: 'restaurant' | 'dish' | 'cuisine';
  vote: 'like' | 'dislike' | 'skip';
  item_data: RestaurantItem;
  round_number: number;
  voted_at: Date;
}

export class MatchDetectionService {
  /**
   * Record a vote in the database
   */
  async recordVote(
    sessionId: string,
    userId: string,
    itemId: string,
    vote: 'like' | 'dislike' | 'skip',
    itemData: RestaurantItem,
    roundNumber: number
  ): Promise<void> {
    try {
      await knex('session_votes').insert({
        session_id: sessionId,
        user_id: userId,
        item_id: itemId,
        item_type: 'restaurant',
        vote,
        item_data: JSON.stringify(itemData),
        round_number: roundNumber,
        voted_at: new Date(),
      });

      console.log(`📝 Vote recorded: ${userId} voted ${vote} for ${itemId} in round ${roundNumber}`);
    } catch (error) {
      console.error('❌ Error recording vote:', error);
      throw error;
    }
  }

  /**
   * Calculate matches for a specific session and round
   * A match occurs when ALL active users in the session vote 'like' for the same item
   */
  async calculateMatches(
    sessionId: string,
    roundNumber: number,
    requireAllUsers: boolean = true
  ): Promise<MatchResult[]> {
    try {
      // Get all active users in the session
      const sessionUsers = await knex('group_members as gm')
        .join('sessions as s', 's.group_id', 'gm.group_id')
        .join('users as u', 'u.id', 'gm.user_id')
        .where('s.id', sessionId)
        .where('gm.status', 'active')
        .select('u.id as user_id', 'u.username');

      const totalUsers = sessionUsers.length;

      if (totalUsers < 2) {
        console.log('⚠️ Not enough users for matching');
        return [];
      }

      // Get all votes for this session and round
      const votes = await knex('session_votes')
        .where('session_id', sessionId)
        .where('round_number', roundNumber)
        .select('*');

      // Group votes by item_id
      const votesByItem = new Map<string, VoteRecord[]>();

      for (const vote of votes) {
        const itemId = vote.item_id;
        if (!votesByItem.has(itemId)) {
          votesByItem.set(itemId, []);
        }
        votesByItem.get(itemId)!.push({
          ...vote,
          item_data: typeof vote.item_data === 'string'
            ? JSON.parse(vote.item_data)
            : vote.item_data,
          voted_at: new Date(vote.voted_at),
        });
      }

      const matches: MatchResult[] = [];

      // Check each item for matches
      for (const [itemId, itemVotes] of votesByItem) {
        const likeVotes = itemVotes.filter(vote => vote.vote === 'like');

        // Calculate required votes threshold
        const requiredVotes = requireAllUsers ? totalUsers : Math.ceil(totalUsers / 2);

        if (likeVotes.length >= requiredVotes) {
          // Check if we have votes from enough unique users
          const uniqueUserIds = new Set(likeVotes.map(vote => vote.user_id));

          if (uniqueUserIds.size >= requiredVotes) {
            // We have a match!
            const matchedUsers = Array.from(uniqueUserIds);
            const itemData = itemVotes[0].item_data; // All votes for same item have same data

            matches.push({
              sessionId,
              item: itemData,
              matchedUsers,
              round: roundNumber,
              timestamp: new Date(),
            });

            console.log(`🎉 Match found! Item: ${itemData.name}, Users: ${matchedUsers.length}`);
          }
        }
      }

      return matches;
    } catch (error) {
      console.error('❌ Error calculating matches:', error);
      throw error;
    }
  }

  /**
   * Get voting progress for current round
   */
  async getVotingProgress(
    sessionId: string,
    roundNumber: number
  ): Promise<{
    totalUsers: number;
    votedUsers: number;
    remainingUsers: string[];
    votes: { [itemId: string]: { likes: number; dislikes: number; skips: number } };
  }> {
    try {
      // Get session users
      const sessionUsers = await knex('group_members as gm')
        .join('sessions as s', 's.group_id', 'gm.group_id')
        .join('users as u', 'u.id', 'gm.user_id')
        .where('s.id', sessionId)
        .where('gm.status', 'active')
        .select('u.id as user_id', 'u.username');

      // Get votes for this round
      const votes = await knex('session_votes')
        .where('session_id', sessionId)
        .where('round_number', roundNumber)
        .select('user_id', 'item_id', 'vote');

      const totalUsers = sessionUsers.length;
      const votedUserIds = new Set(votes.map(v => v.user_id));
      const votedUsers = votedUserIds.size;

      const remainingUsers = sessionUsers
        .filter(user => !votedUserIds.has(user.user_id))
        .map(user => user.username);

      // Aggregate votes by item
      const votesByItem: { [itemId: string]: { likes: number; dislikes: number; skips: number } } = {};

      for (const vote of votes) {
        if (!votesByItem[vote.item_id]) {
          votesByItem[vote.item_id] = { likes: 0, dislikes: 0, skips: 0 };
        }

        switch (vote.vote) {
          case 'like':
            votesByItem[vote.item_id].likes++;
            break;
          case 'dislike':
            votesByItem[vote.item_id].dislikes++;
            break;
          case 'skip':
            votesByItem[vote.item_id].skips++;
            break;
        }
      }

      return {
        totalUsers,
        votedUsers,
        remainingUsers,
        votes: votesByItem,
      };
    } catch (error) {
      console.error('❌ Error getting voting progress:', error);
      throw error;
    }
  }

  /**
   * Check if a user has already voted for an item in this round
   */
  async hasUserVoted(
    sessionId: string,
    userId: string,
    itemId: string,
    roundNumber: number
  ): Promise<boolean> {
    try {
      const existingVote = await knex('session_votes')
        .where('session_id', sessionId)
        .where('user_id', userId)
        .where('item_id', itemId)
        .where('round_number', roundNumber)
        .first();

      return !!existingVote;
    } catch (error) {
      console.error('❌ Error checking if user voted:', error);
      return false;
    }
  }

  /**
   * Get all matches for a session across all rounds
   */
  async getSessionMatches(sessionId: string): Promise<MatchResult[]> {
    try {
      // Get session details for round progression
      const session = await knex('sessions')
        .where('id', sessionId)
        .first();

      if (!session) {
        throw new Error('Session not found');
      }

      const allMatches: MatchResult[] = [];

      // Check each round
      for (let round = 1; round <= session.round_number; round++) {
        const roundMatches = await this.calculateMatches(sessionId, round);
        allMatches.push(...roundMatches);
      }

      return allMatches;
    } catch (error) {
      console.error('❌ Error getting session matches:', error);
      throw error;
    }
  }

  /**
   * Clean up old votes (for privacy and storage optimization)
   */
  async cleanupOldVotes(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await knex('session_votes')
        .where('voted_at', '<', cutoffDate)
        .del();

      console.log(`🧹 Cleaned up ${deletedCount} old votes`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old votes:', error);
      throw error;
    }
  }

  /**
   * Get voting statistics for a session
   */
  async getSessionStatistics(sessionId: string): Promise<{
    totalVotes: number;
    votesByRound: { [round: number]: number };
    votesByType: { likes: number; dislikes: number; skips: number };
    userParticipation: { [userId: string]: { votes: number; username: string } };
  }> {
    try {
      const votes = await knex('session_votes as sv')
        .leftJoin('users as u', 'u.id', 'sv.user_id')
        .where('sv.session_id', sessionId)
        .select(
          'sv.vote',
          'sv.round_number',
          'sv.user_id',
          'u.username'
        );

      const stats = {
        totalVotes: votes.length,
        votesByRound: {} as { [round: number]: number },
        votesByType: { likes: 0, dislikes: 0, skips: 0 },
        userParticipation: {} as { [userId: string]: { votes: number; username: string } },
      };

      for (const vote of votes) {
        // Count by round
        const round = vote.round_number;
        stats.votesByRound[round] = (stats.votesByRound[round] || 0) + 1;

        // Count by type
        switch (vote.vote) {
          case 'like':
            stats.votesByType.likes++;
            break;
          case 'dislike':
            stats.votesByType.dislikes++;
            break;
          case 'skip':
            stats.votesByType.skips++;
            break;
        }

        // Count by user
        const userId = vote.user_id;
        if (!stats.userParticipation[userId]) {
          stats.userParticipation[userId] = {
            votes: 0,
            username: vote.username || 'Unknown',
          };
        }
        stats.userParticipation[userId].votes++;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting session statistics:', error);
      throw error;
    }
  }
}