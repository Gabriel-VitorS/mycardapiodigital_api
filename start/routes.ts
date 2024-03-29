/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.get('/', async () => {
    return { hello: 'world' }
  })

  Route.post('/register', 'CompaniesController.store')
  Route.post('/verify_email', 'CompaniesController.verifyIfEmailExist')
  Route.post('/login', 'CompaniesController.login')
  Route.get('/menu/:url', 'CompaniesController.menu')
  Route.get('/menu/product/:id', 'ProductsController.menuProduct')
  Route.get('/image_product/:image', 'ProductsController.image')
  Route.get('/image_banner/:image', 'ConfigurationsController.imageBanner')
  Route.get('/image_logo/:image', 'ConfigurationsController.imageLogo')
  Route.group(()=>{

    Route.put('/company', 'CompaniesController.update')
    Route.get('/company', 'CompaniesController.get')

    Route.resource('/configuration', 'ConfigurationsController').apiOnly()
    Route.post('/configuration/verify_url', 'ConfigurationsController.verifyIfUrlExist')

    Route.resource('/category', 'CategoriesController').apiOnly()
    Route.post('/category/verify_order', 'CategoriesController.verifyOrderExists')

    Route.resource('/product', 'ProductsController').apiOnly()
    
  }).middleware('apiAuth')

}).prefix('/api')
