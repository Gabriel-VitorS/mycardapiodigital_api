import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Configuration extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name_company: string

  @column()
  public company_id: number

  @column()
  public url: string

  @column()
  public banner_image: string

  @column()
  public logo_image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
