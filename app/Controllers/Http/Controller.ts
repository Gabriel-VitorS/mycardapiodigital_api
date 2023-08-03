//import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class Controller {
    private linkImages = Env.get('LINK_IMAGES')
    public async getUrlLogoImage(logo){
        return logo !== null ? `${this.linkImages}/api/image_logo/${logo}` :  `${Env.get('HOST')}/api/image_logo/padrao.png`
    } 

    public async getUrlBannerImage(banner){
        return banner !== null ? `${this.linkImages}/api/image_banner/${banner}` :  `${Env.get('HOST')}/api/image_banner/padrao.png`
    } 

    public async getUrlProductImage(image){
        return image !== null ? `${this.linkImages}/api/image_product/${image}` :  `${Env.get('HOST')}/api/image_product/padrao.png`
    }
}
