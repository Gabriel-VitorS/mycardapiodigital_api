import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Configuration from './Configuration'
export default class Company extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasOne(()=> Configuration)
  public configuration: HasOne<typeof Configuration>

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
