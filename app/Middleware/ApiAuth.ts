import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import Env from '@ioc:Adonis/Core/Env'
import { jwtVerify } from 'jose'

export default class ApiAuth {
  public async handle({request}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    
    try {

      const token = request.header('authorization')!.split(' ')[1]
      
      if(token === undefined){
        throw new AuthenticationException(
          'Unauthorized access',
          'E_UNAUTHORIZED_ACCESS',
        )
      }
      

      const payload = await jwtVerify( `${token}`, new TextEncoder().encode( await Env.get('JWT_KEY')) )
      
      const req = request.all()
      req.auth = payload.payload
      await next()

    } catch (error) {
      throw new AuthenticationException(
        'Unauthorized access',
        'E_UNAUTHORIZED_ACCESS',
        
      )
    }
    
  }
}
