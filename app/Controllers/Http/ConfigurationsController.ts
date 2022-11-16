import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'
import Configuration from 'App/Models/Configuration'
import Database from '@ioc:Adonis/Lucid/Database'
import Controller from './Controller'

export default class ConfigurationsController extends Controller {

    private postValidate = schema.create({
        name_company: schema.string([
            rules.minLength(2)
        ]),
        url: schema.string([
            rules.minLength(2),
            rules.maxLength(30),
            rules.regex(/^[A-Za-z0-9-]+$/)
        ]),
        banner_image: schema.file.optional({
            extnames: ['jpg', 'png'],
        }),
        logo_image: schema.file.optional({
            extnames: ['jpg', 'png'],
        })
    })

    private validationImage = {
        types: ['image'],
        size: '5mb'
    }

    public async verifyIfUrlExist({request, response}:HttpContextContract){

        try {
            const urlRequestValidate = schema.create({
                url: schema.string([
                    rules.minLength(2),
                    rules.regex(/^[A-Za-z0-9-]+$/)
                ])
            })
    
            await request.validate({schema: urlRequestValidate})

            const url = await Database.from('configurations').where('url', '=' , request.input('url')).first()

            if(url)
                return {isValid: false}
            else
                return {isValid: true}

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }
        
    }

    public async store({request,auth, response}:HttpContextContract){
        const body = request.all()
        const companyAuth = auth.user

        try {

            await request.validate({schema: this.postValidate})

            const banner_image = request.file('banner_image', this.validationImage)

            const logo_image = request.file('logo_image', this.validationImage)

            if(banner_image){
                const bannerImageName = `${companyAuth?.id}.${banner_image?.extname}`

                await banner_image.move(Application.tmpPath('banners'), {
                    name: bannerImageName,
                    overwrite: true
                })

                body.banner_image = bannerImageName
            }

            if(logo_image){
                const logoImageName = `${companyAuth?.id}.${logo_image?.extname}`

                await logo_image.move(Application.tmpPath('logos'), {
                    name: logoImageName,
                    overwrite: true
                })

                body.logo_image = logoImageName
            }

            body.company_id = companyAuth?.id
            
            const url = await Database.from('configurations').where('url', '=' ,body.url).first()

            if(url){
                response.status(406)
                return {message: 'url field already exists'}
            }
            
            const configuration = await Configuration.create(body)
            return {data: configuration.id}

            
        } catch (error) {
            response.status(500)
            return {
                message: 'Server error',
                error: error
            }
        }       
    }

    public async destroy({params, auth, response}:HttpContextContract){
        const id = params.id
        const companyAuth: any = auth.user 

        try {
            const configuration = await Database.from('configurations').where('id', id).where('company_id', companyAuth.id).first()

            if(configuration){
                response.status(404)
                return {message:'Configuration not find'}
            }

            await (await Configuration.findOrFail(configuration.id)).delete()    
            return {message:'Configuration deleted successfully', data: configuration.id}

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }   

    }

    public async index({response, auth}: HttpContextContract){
        const companyAuth: any = auth.user

        try {
            const configuration = await Database.from('configurations').where('company_id', companyAuth.id).first()

            const urlLogo = await this.getUrlLogoImage(configuration.logo_image)
            const urlBanner = await this.getUrlBannerImage(configuration.banner_image)
    
            configuration.url_logo = urlLogo
            configuration.url_banner = urlBanner
    
            return {
                data: configuration
            }

        } catch (error) {
            response.status(500)
            return{
                message: 'Server error',
                error: error
            }
        }
        
    }

    public async update({params, auth, response, request}: HttpContextContract){
        const body = request.all()
        const companyAuth: any = auth.user
        const configurarionId = params.id


        try {
            await request.validate({schema: this.postValidate})


            //verifica se URL já está cadastrado
            const url = await Database.from('configurations').where('url', '=' ,body.url).first()

            if( (url) && url.company_id !== companyAuth.id){
                response.status(406)
                return {message: 'url field already exists'}
            }

            const configurationUser = await Database.from('configurations').where('id', configurarionId).where('company_id', companyAuth.id).first()

            if(!configurationUser){
                response.status(404)
                return{
                    message: 'Configuration not find'
                }
            }

            const configurationUserById = await Configuration.findOrFail(configurationUser.id)

            if(body.name_company)
                configurationUserById.name_company = body.name_company

            if(body.url)
                configurationUserById.url = body.url

            const banner_image = request.file('banner_image', this.validationImage)

            const logo_image = request.file('logo_image', this.validationImage)

            if(banner_image){
                const bannerImageName = `${companyAuth?.id}.${banner_image?.extname}`
    
                await banner_image.move(Application.tmpPath('banners'), {
                    name: bannerImageName,
                    overwrite: true
                })
    
                configurationUserById.banner_image = bannerImageName
            }
    
            if(logo_image){
                const logoImageName = `${companyAuth?.id}.${logo_image?.extname}`
    
                await logo_image.move(Application.tmpPath('logos'), {
                    name: logoImageName,
                    overwrite: true
                })
    
                configurationUserById.logo_image = logoImageName
            }

            configurationUserById.save()

            return {
                message: 'Configuration successfully updated',
                data: configurationUserById.id
            }

        } catch (error) {
            response.status(500)
            return {
                message: 'Server error',
                error: error
            }
        }
    

    }

}
