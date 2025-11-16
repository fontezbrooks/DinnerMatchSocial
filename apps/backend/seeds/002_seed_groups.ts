import { Knex } from 'knex';
import { randomUUID } from 'crypto';

export async function seed(knex: Knex): Promise<void> {
  // Get existing users
  const users = await knex('users').select('id', 'name');

  if (users.length < 3) {
    console.log('⚠️ Need at least 3 users to create groups');
    return;
  }

  // Helper function to generate invite code
  const generateInviteCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const groups = [
    {
      id: randomUUID(),
      name: 'Foodie Friends',
      description: 'A group of food enthusiasts exploring new restaurants together',
      created_by: users[0].id,
      max_members: 10,
      invite_code: generateInviteCode(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      name: 'Office Lunch Crew',
      description: 'Coworkers deciding where to grab lunch',
      created_by: users[1].id,
      max_members: 8,
      invite_code: generateInviteCode(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      name: 'Date Night Planners',
      description: 'Couples finding romantic dinner spots',
      created_by: users[2].id,
      max_members: 6,
      invite_code: generateInviteCode(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('groups').insert(groups);

  // Add group memberships
  const memberships = [
    // Foodie Friends (group 0)
    { id: randomUUID(), group_id: groups[0].id, user_id: users[0].id, role: 'admin', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[0].id, user_id: users[1].id, role: 'member', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[0].id, user_id: users[2].id, role: 'member', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[0].id, user_id: users[3].id, role: 'member', is_active: true, joined_at: new Date() },

    // Office Lunch Crew (group 1)
    { id: randomUUID(), group_id: groups[1].id, user_id: users[1].id, role: 'admin', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[1].id, user_id: users[2].id, role: 'member', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[1].id, user_id: users[4].id, role: 'member', is_active: true, joined_at: new Date() },

    // Date Night Planners (group 2)
    { id: randomUUID(), group_id: groups[2].id, user_id: users[2].id, role: 'admin', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[2].id, user_id: users[3].id, role: 'member', is_active: true, joined_at: new Date() },
    { id: randomUUID(), group_id: groups[2].id, user_id: users[4].id, role: 'member', is_active: true, joined_at: new Date() }
  ];

  await knex('group_members').insert(memberships);

  console.log('✅ Seeded groups:', groups.length);
  console.log('✅ Seeded group memberships:', memberships.length);
  console.log('📝 Group invite codes:', groups.map(g => `${g.name}: ${g.invite_code}`));
}