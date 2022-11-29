import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('company_id').unsigned().references('companies.id').onDelete('CASCADE')
      table.integer('category_id').unsigned().references('categories.id').onUpdate('CASCADE').onDelete('SET NULL')
      table.string('name').notNullable()
      table.double('value', 8,2).notNullable()
      table.string('resume')
      table.string('details')
      table.string('image')
      table.boolean('highlight')
      table.boolean('visible_online')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
