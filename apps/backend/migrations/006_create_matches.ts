import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('matches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').notNullable();
    table.string('item_id').notNullable(); // Yelp business ID or other external ID
    table.enum('item_type', ['restaurant', 'dish', 'cuisine']).defaultTo('restaurant');
    table.json('item_data').notNullable(); // Store full item details from external API
    table.integer('vote_count').defaultTo(0); // Number of positive votes
    table.decimal('match_score', 5, 2).nullable(); // Calculated match score
    table.integer('round_number').defaultTo(1);
    table.timestamp('matched_at').defaultTo(knex.fn.now());

    // Foreign key
    table.foreign('session_id').references('id').inTable('sessions').onDelete('CASCADE');

    // Unique constraint - one match per item per session per round
    table.unique(['session_id', 'item_id', 'round_number']);

    // Indexes
    table.index('session_id');
    table.index(['session_id', 'round_number']);
    table.index('item_id');
    table.index('match_score');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('matches');
}