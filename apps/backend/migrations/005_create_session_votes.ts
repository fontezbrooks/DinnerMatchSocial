import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('session_votes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').notNullable();
    table.uuid('user_id').notNullable();
    table.string('item_id').notNullable(); // Yelp business ID or other external ID
    table.enum('item_type', ['restaurant', 'dish', 'cuisine']).defaultTo('restaurant');
    table.enum('vote', ['like', 'dislike', 'skip']).notNullable();
    table.json('item_data').nullable(); // Store full item details from external API
    table.integer('round_number').defaultTo(1);
    table.timestamp('voted_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('session_id').references('id').inTable('sessions').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Unique constraint - user can only vote once per item per round
    table.unique(['session_id', 'user_id', 'item_id', 'round_number']);

    // Indexes
    table.index('session_id');
    table.index('user_id');
    table.index(['session_id', 'round_number']);
    table.index(['session_id', 'item_id']);
    table.index('vote');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('session_votes');
}