import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('group_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable();
    table.uuid('user_id').notNullable();
    table.enum('role', ['admin', 'member']).defaultTo('member');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamp('left_at').nullable();

    // Foreign keys
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Unique constraint - user can only be in a group once
    table.unique(['group_id', 'user_id']);

    // Indexes
    table.index('group_id');
    table.index('user_id');
    table.index(['group_id', 'user_id']);
    table.index('role');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('group_members');
}