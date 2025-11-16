import { Knex } from 'knex';
import { randomUUID } from 'crypto';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('session_votes').del();
  await knex('matches').del();
  await knex('sessions').del();
  await knex('group_members').del();
  await knex('groups').del();
  await knex('users').del();

  // Insert seed users
  const users = [
    {
      id: randomUUID(),
      email: 'alice@example.com',
      name: 'Alice Johnson',
      oauth_provider: 'google',
      oauth_id: 'google_123456',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
      dietary_restrictions: JSON.stringify(['vegetarian']),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      email: 'bob@example.com',
      name: 'Bob Smith',
      oauth_provider: 'google',
      oauth_id: 'google_789012',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      dietary_restrictions: JSON.stringify(['gluten-free']),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      email: 'carol@example.com',
      name: 'Carol Davis',
      oauth_provider: 'facebook',
      oauth_id: 'facebook_345678',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      dietary_restrictions: JSON.stringify([]),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      email: 'dave@example.com',
      name: 'Dave Wilson',
      oauth_provider: 'google',
      oauth_id: 'google_901234',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      dietary_restrictions: JSON.stringify(['vegan', 'nut-free']),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      email: 'eve@example.com',
      name: 'Eve Martinez',
      oauth_provider: 'google',
      oauth_id: 'google_567890',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      dietary_restrictions: JSON.stringify(['pescatarian']),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('users').insert(users);

  console.log('✅ Seeded users:', users.length);
}