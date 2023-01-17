import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

import Category from 'App/Models/Category'

export default class CategoriesController {

    private requestValidate = schema.create({
        name: schema.string([
            rules.minLength(3)
        ]),
        order: schema.number()
    })

    public async verifyOrderExists({response, request}:HttpContextContract){
        const body = request.all()
        const companyAuth: any = request.input('auth')
        
        try {

            await request.validate({ schema: schema.create({ order: schema.number() }) })

            const order = await Database.from('categories').where('company_id', companyAuth.id).where('order', body.order).first()

            if( (order) && order.company_id === companyAuth.id){
                return {
                    isValid: false
                }
            }

            return {
                isValid: true
            }
            
        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }

    }

    public async store({response, request}:HttpContextContract){
        const body = request.all()
        const companyAuth: any = request.input('auth')
        delete body.auth

        try {

            await request.validate({schema: this.requestValidate})

            const order = await Database.from('categories').where('company_id', companyAuth.id).where('order', body.order).first()

            if( (order) && order.company_id === companyAuth.id){
                response.status(406)
                return {
                    message: 'order field already exists'
                }
            }

            body.company_id = companyAuth.id

            const category = await Category.create(body)

            return {data: category.id}
            
        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }

    }

    public async update({response, request, params}: HttpContextContract){
        const body = request.all()
        const id: number = params.id
        const companyAuth: any = request.input('auth')    

        try {

            request.validate({schema: this.requestValidate})

            const category = await Category.query().where('id', id).where('company_id', companyAuth.id).first()
    
            if(!category){
                response.status(404)
                return {message:'Configuration not find'}
            }
    
            const order = await Database.from('categories').where('company_id', companyAuth.id).where('order', body.order).first()
    
            if( (order) && order.company_id === companyAuth.id && order.order != body.order){
                response.status(406)
                return {
                    message: 'order field already exists'
                }
            }
    
            category.name = body.name
    
            category.order = body.order
    
            category.save()
    
            return{
                message: 'Configuration successfully updated',
                data: category?.id
            }

            
        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }

    }

    public async destroy({request, response, params}:HttpContextContract){
        const id = params.id
        const companyAuth: any = request.input('auth')

        try {

            const category = await Category.query().where('id', id).where('company_id', companyAuth.id).first()

            if(!category){
                response.status(404)
                return {message:'Configuration not find'}
            }

            await category.delete()

            return {message:'Configuration deleted successfully', data: category.id}

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }
    }

    public async index({response, request}:HttpContextContract){
        const companyAuth: any = request.input('auth')
        const body =  request.all()

        try {

            await request.validate({schema: 
                    schema.create({
                    page: schema.number.optional(),
                    limit: schema.number.optional(),
                    name: schema.string.optional()
                    })
                })

            const categories = await Database.from('categories').where('company_id', companyAuth.id)
                            .andWhere((query)=>{

                                if(body.name)
                                    query.from('categories').where('name', 'like',`%${body.name}%`)
                                    
                            })
                            .orderBy('created_at', 'desc')
                            .paginate(body.page ?? 1, body.limit ?? 15)

            return {
                data: categories
            }
            
        } catch (error) {
            response.status(500)
            return{
                message: "Server error",
                error: error
            }
        }

    }

    public async show({request, params, response}: HttpContextContract){
        const id: number = params.id
        const companyAuth: any = request.input('auth')

        try {
            
            const category = await Database.from('categories').where('id', id).where('company_id', companyAuth.id).first()

            if(!category){
                response.status(404)
                return {message:'Configuration not find'}
            }

            return {
                data: category
            }
            
        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }
    }
}
