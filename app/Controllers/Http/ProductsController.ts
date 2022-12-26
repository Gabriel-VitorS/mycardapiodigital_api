import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'

import Category from 'App/Models/Category'
import Product from "App/Models/Product"
import Controller from './Controller'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ProductsController extends Controller {
    private requestValidate = schema.create({
        category_id: schema.number(),
        name: schema.string([
            rules.minLength(3)
        ]),
        value: schema.number(),
        resume: schema.string.nullableAndOptional(),
        details: schema.string.nullableAndOptional(),
        highlight: schema.boolean(),
        image: schema.file.optional({
            extnames: ['jpg', 'png'],
        }),
        visible_online: schema.boolean()

    })

    private validationImage = {
        types: ['image'],
        size: '5mb'
    }

    public async store({response, request}:HttpContextContract){
        const body = request.all()
        const companyAuth: any = request.input('auth')     
        delete body.auth

        try { 
            await request.validate({schema: this.requestValidate})
        
            const category = await Category.query().where('id', body.category_id).where('company_id', companyAuth.id).first()

            if(!category){
                response.status(404)
                return {message:'Category not find'}
            }

            body.company_id = companyAuth.id

            const produc = await Product.create(body)

            const image = request.file('image', this.validationImage)

            if(image){
                const imageName = `${produc.id}.${image.extname}`

                await image.move(Application.tmpPath(`products/company_${companyAuth.id}`), {
                    name: imageName,
                    overwrite: true
                })

                produc.image = imageName

                await produc.save()
            }

            return {
                data: produc.id
            }

        } catch (error) {
            response.status(500)
            return{
                message: "serve error",
                error: error
            }
        }
        
    }

    public async destroy({request, response, params}:HttpContextContract){
        const id = params.id 
        const companyAuth: any = request.input('auth')

        try{
            const product = await Product.query().where('id', id).where('company_id', companyAuth.id).first()

            if(!product){
                response.status(404)
                return {
                    message:'Product not find'
                }
            }

            if(product.image)
                await Drive.delete(`products/company_${companyAuth.id}/${product.image}`)

            await product.delete()

            return {message:'Product deleted successfully', data: product.id}

        }catch(error){
            response.status(500)
            return{
                message: "serve error",
                error: error
            }
        }  

    }

    public async show({params, response, request}:HttpContextContract){
        const id: number = params.id 
        const companyAuth: any = request.input('auth')

        try {

            const product = await Database.from('products').where('id', id).where('company_id', companyAuth.id).first()

            if(!product){
                response.status(404)
                return {
                    message:'Product not find'
                }
            }

            const urlImage = await this.getUrlProductImage(product.image)

            product.url_image = urlImage

            if(product.category_id != null){
                const category = await Category.query().where('id', product.category_id).first()

                product.category_name = category?.name

                return{
                    data: product
                }
            }

            return{
                data: product
            }

        } catch (error) {
            response.status(500)
            return{
                message: "serve error",
                error: error
            }
        }
        
    }

    public async index({response, request}:HttpContextContract){
        const companyAuth: any = request.input('auth')
        const body =  request.all()

        await request.validate({
            schema: schema.create({
                page: schema.number.optional(),
                name: schema.string.optional(),
                category_id: schema.number.optional(),
                highlight: schema.boolean.optional(),
                visible_online: schema.boolean.optional()
            })
        })

        try {
            
            const products = await Database.from('products').where('company_id', companyAuth.id)
            .andWhere((query)=>{

                if(body.name)
                    query.from('products').where('name', 'like',`%${body.name}%`)

                if(body.category_id)
                    query.from('products').where('category_id', `${body.category_id}`)

                if(body.highlight)
                    query.from('products').where('highlight', `${body.highlight}`)

                if(body.visible_online)
                    query.from('products').where('visible_online', `${body.visible_online}`)
                    
            })
            .orderBy('created_at', 'desc')
            .paginate(body.page ?? 1, 15)

            return {
                data: products
            }

        } catch (error) {

            response.status(500)
            return{
                message: "serve error",
                error: error
            }

        }

    }

    public async update({request,response,params}:HttpContextContract){
        const id: number = params.id 
        const companyAuth: any = request.input('auth')
        const body = request.all()

        try {
            await request.validate({schema: this.requestValidate})

            const product = await Product.query().where('id', id).where('company_id', companyAuth.id).first()
    
            if(!product){
                response.status(404)
                return {message:'Product not find'}
            }
    
            const category = await Category.query().where('id', body.category_id).where('company_id', companyAuth.id).first()
    
            if(!category){
                response.status(404)
                return {message:'Category not find'}
            }
    
            product.name = body.name
            product.category_id = body.category_id
            product.value = body.value
            product.highlight = body.highlight
            product.visible_online = body.visible_online
            product.resume = body.resume
            product.details = body.details
    
            const image = request.file('image', this.validationImage)
    
            if(image){
    
                if(product.image)
                    await Drive.delete(`products/company_${companyAuth.id}/${product.image}`)
                    
                const imageName = `${product.id}.${image.extname}`
    
                await image.move(Application.tmpPath(`products/company_${companyAuth.id}`), {
                    name: imageName,
                    overwrite: true
                })
    
                product.image = imageName
                
            }
    
            product.save()
    
            return{
                message: 'Configuration successfully updated',
                data: product.id
            }
    
        } catch (error) {
            response.status(500)
            return{
                message: "serve error",
                error: error
            }
        }
        

    }

    public async image({response, params}: HttpContextContract) {
        const imageParam = params.image
        
        const product = await Product.query().where('image', imageParam).first()
        const imagePath = Application.tmpPath(`products/company_${product?.company_id}/${imageParam}`)
        
        response.download(imagePath)
        
    }
}
