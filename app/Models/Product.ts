import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public company_id: string

  @column()
  public category_id: number

  @column()
  public name: string

  @column()
  public value: string

  @column()
  public resume: string

  @column()
  public details: string

  @column()
  public image: string

  @column()
  public highlight: boolean
  
  @column()
  public visible_online: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
