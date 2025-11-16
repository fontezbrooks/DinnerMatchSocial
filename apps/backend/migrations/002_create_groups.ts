import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('description').nullable();
    table.uuid('created_by').notNullable();
    table.integer('max_members').defaultTo(10);
    table.boolean('is_active').defaultTo(true);
    table.string('invite_code').unique().notNullable(); // for joining groups
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign key
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index('created_by');
    table.index('invite_code');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('groups');
}