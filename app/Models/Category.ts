import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasMany(()=>Product)
  public product: HasMany<typeof Product>

  @column()
  public company_id: number

  @column()
  public name: string

  @column()
  public order: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
