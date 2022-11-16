import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class Controller {
    public async getUrlLogoImage(logo){
        return logo !== null ? `${Env.get('HOST')}/api/image_logo/${logo}` :  `${Env.get('HOST')}/api/image_logo/padrao.png`
    } 

    public async getUrlBannerImage(banner){
        return banner !== null ? `${Env.get('HOST')}/api/image_banner/${banner}` :  `${Env.get('HOST')}/api/image_banner/padrao.png`
    } 
}
