import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    table.string('oauth_provider').nullable(); // 'google', 'facebook', etc.
    table.string('oauth_id').nullable(); // provider-specific user ID
    table.string('avatar_url').nullable();
    table.json('dietary_restrictions').nullable(); // JSON array of restrictions
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('oauth_provider');
    table.index(['oauth_provider', 'oauth_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}