import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import * as jose from 'jose'
import Env from '@ioc:Adonis/Core/Env'

import Company from 'App/Models/Company'
import Database from '@ioc:Adonis/Lucid/Database'
import Controller from './Controller'


export default class CompaniesController extends Controller {

    private postRequestValidate = schema.create({
        name: schema.string([
            rules.minLength(3)
        ]),
        cpf_cnpj: schema.string([
            rules.minLength(11),
            rules.maxLength(14)
        ]),
        email: schema.string([
            rules.email()
        ]),
        password: schema.string([
            rules.confirmed()
        ])
    })

    private putRequestValidate = schema.create({
        name: schema.string.optional([
            rules.minLength(3)
        ]),
        cpf_cnpj: schema.string.optional([
            rules.minLength(11),
            rules.maxLength(14)
        ]),
        email: schema.string.optional([
            rules.email()
        ]),
        password: schema.string.optional([
            rules.confirmed()
        ])
    })

    public async verifyIfEmailExist({request, response}:HttpContextContract){
        try {
            const email = await Database.from('companies').where('email', request.input('email').email)
            if(Object.keys(email).length > 0)
                return {isValid: false}
            else
                return {isValid: true}
                
        } catch (error) {
            response.status(500)
            return {
                message: 'Server error',
                error: error
            }
        }

    }

    public async get({request, response}:HttpContextContract){

        try {
            const companyAuth: any = request.input('auth')

            const company = await Company.query().where('id', companyAuth.id).first()
            
            if(!company){
                response.status(402)
                return
            }
                       
            interface CompanyResponse {
                name: string;
                id: number;
                cpf_cnpj: string;
                email: string
            }

            const companyNoPassword: CompanyResponse = {
                name: company.name, 
                id: company.id, 
                cpf_cnpj: company.cpf_cnpj,
                email: company.email
            }
            
            return companyNoPassword
            
        } catch (error) {
            response.status(500)
            return {
                message: 'Server error',
                error: error
            }
        }
        
    }

    public async store({request, response}:HttpContextContract){
        const body = request.body()

        await request.validate({schema: this.postRequestValidate})

        const findEmail = await Database.from('companies').where('email', body.email)

        if(Object.keys(findEmail).length !== 0){
            response.status(406)
            return {message: 'email field already exists'}
        }

        const hashedPassowrd = await Hash.make(body.password)

        body.password = hashedPassowrd

        delete body.password_confirmation

        try {
            const company = await Company.create(body)
        
            return {
                id: company.id,
            }
        } catch (error) {
            response.status(500)
            return {
                message: 'Server error',
                error: error
            }
        }

    }

    public async login({request, response}:HttpContextContract){
        const body = request.all()

        const postRequestValidate = schema.create({
            email: schema.string([
                rules.minLength(1)
            ]),
            password: schema.string([
                rules.minLength(1)
            ]),
        })

        try {
            await request.validate({schema: postRequestValidate})

            const company = await Company.query().where('email', body.email).first()

            if(!company){
                response.status(422)
                return{
                    message: 'Invalid user'
                }
            }

            if(await Hash.verify(company.password, body.password) == false){
                response.status(422)
                return{
                    message: 'Invalid user'
                }
            }

            const iat = Math.floor(Date.now() / 1000);
            const exp = iat + 60* 60 *60 //1h
            // const exp = iat + 60* 60 *60 //1h
            const token = await new jose.SignJWT({
                id:company.id,
                name: company.name
            })
            .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
            .setExpirationTime(exp)
            .setIssuedAt(iat)
            .setNotBefore(iat)
            .sign(new TextEncoder().encode(Env.get('JWT_KEY')))
            
    
            return {token: token}

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }


    }

    public async update({request, response}:HttpContextContract){
        const body = request.all()
        const companyAuth = request.input('auth')
        const company = await Company.findOrFail(companyAuth?.id)

        await request.validate({schema: this.putRequestValidate})

        if(body.email){
            const findEmail = await Database.from('companies').where('email', body.email)
            
            if(Object.keys(findEmail).length !== 0){
                if(findEmail[0].id !== companyAuth?.id){
                    response.status(406)
                    return {message: 'email field already exists', email: findEmail}
                }else{
                    company.email = body.email
                }
                
            }else{
                company.email = body.email
            }
        }

        if(body.password){
            const hashedPassowrd = await Hash.make(body.password)            

            company.password = hashedPassowrd
        }

        if(body.name)
            company.name = body.name
        
        
        if(body.cpf_cnpj)
            company.cpf_cnpj = body.cpf_cnpj
        
        
        try {
            await company.save()

            return {
                message: 'Company successfully updated',
                data: company.id
            }

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }
        
    }

    /**
     * 
     * @param url
     */
    public async menu({params, response}:HttpContextContract){
        const urlParam: string = params.url

        const configuration = await Database.from('configurations').where('url', urlParam).first()

        if(!configuration){
            response.status(404)
            return {message:'menu not find'}
        }

        const companyId = configuration.company_id

        const urlLogo = await this.getUrlLogoImage(configuration.logo_image)
        const urlBanner = await this.getUrlBannerImage(configuration.banner_image)

        /**
         * Pega os produtos de destaque
         */
        const productsHighlight = await Database.from('products').where('company_id', companyId).where('highlight', 'true').where('visible_online', 'true')

        if(productsHighlight){

            Object.keys(productsHighlight).forEach( async (index)=>{

                delete productsHighlight[index].updated_at
                delete productsHighlight[index].created_at

                productsHighlight[index].url_image = await this.getUrlProductImage(productsHighlight[index].image)
            })

        }

        /**
         * Seleciona a categoria de acordo com a ordem que foi definida e pega os produtos de acordo com a categoria
         */
        let category = await Database.from('categories').where('company_id', companyId).orderBy('order', 'asc')

        if(category){

            for(let i = 0; i < Object.keys(category).length ; i++ ){

                delete category[i].updated_at
                delete category[i].created_at

                const products = await Database.from('products').where('company_id', companyId).where('visible_online', 'true').where('category_id', category[i].id)

                Object.keys(products).forEach( async (index)=>{

                    delete products[index].updated_at
                    delete products[index].created_at

                    products[index].url_image = await this.getUrlProductImage(products[index].image)
                })
                
                category[i].products = products
                
            }

            category = category.filter(item => item.products.length >= 1)
        }

        return {
            configuration: {
                name_company: configuration.name_company,
                banner_image: urlBanner,
                url_logo: urlLogo
            },
            highlight: productsHighlight, 
            company: companyId,
            categories: category

        }
    }

}
