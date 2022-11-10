import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'

import Company from 'App/Models/Company'
import Database from '@ioc:Adonis/Lucid/Database'


export default class CompaniesController {

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
            const email = await Database.from('companies').where('email', request.input('email'))
  
            if(Object.keys(email).length !== 0)
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

    public async login({request, auth, response}:HttpContextContract){
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

            const token =  await auth.use('api').attempt(body.email, body.password)
    
            return {data: token}
        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }


    }

    public async update({request, response, auth}:HttpContextContract){
        const body = request.all()
        const companyAuth = auth.user
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

}
