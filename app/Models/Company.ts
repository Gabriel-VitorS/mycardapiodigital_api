import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Configuration from './Configuration'
import Category from './Category'
import Product from './Product'
export default class Company extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(()=> Configuration)
  public configuration: HasOne<typeof Configuration>

  @hasMany(()=>Category)
  public category: HasMany<typeof Category>

  @hasMany(()=>Product)
  public product: HasMany<typeof Product>

  @column()
  public name: string

  @column()
  public cpf_cnpj: string

  @column()
  public email: string

  @column()
  public password: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
