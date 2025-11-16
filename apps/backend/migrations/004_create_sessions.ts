import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable();
    table.enum('status', ['pending', 'active', 'voting', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('energy_level', ['low', 'medium', 'high']).defaultTo('medium');
    table.integer('round_number').defaultTo(1);
    table.json('session_config').nullable(); // Store session-specific settings
    table.timestamp('started_at').nullable();
    table.timestamp('ended_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign key
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');

    // Indexes
    table.index('group_id');
    table.index('status');
    table.index(['group_id', 'status']);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sessions');
}