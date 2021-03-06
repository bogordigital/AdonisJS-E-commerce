'use strict'
const Event = use('Event')
const User = use('App/Model/User');
const Profile = use('App/Model/Profile');
const Product = use('App/Model/Product');
const Image = use('App/Model/Image');
const Helpers = use('Helpers');
const Category = use('App/Model/Category')
const Wishlist = use('App/Model/Wishlist')
const Database = use('Database')
const Color = use('App/Model/Color')
class ProductController {
    * index (request, response){
        const color = yield Color.query().with('user').where('user_id', '=', request.currentUser.id)
        const user = yield User.findOrFail(request.currentUser.id)
      const profile = yield Profile.query().with('user').where('user_id', '=', user.id).fetch()
      const products = yield Image.query().with('products').fetch()
      const categories = yield Category.query().with('products.images').fetch()
       const admin = yield User.find(request.currentUser.id)
        const isAdmin = yield admin.role().where('role', '=', 'admin').fetch()  
        yield response.sendView('shop', { products: products.toJSON(), profile:profile.toJSON(), categories:categories.toJSON(), color, isAdmin }) 
    }
    * show (request, response){
         
        const product = yield Product.findOrFail(request.param('id'))
        const images = yield product.images().fetch()
     const productImages = yield Product.query().with('images').where('id', '=', product.id).fetch()
     const categories = yield Category.all() 
     const productIs = yield Product.query().with('images').fetch()
    
     
     const admin = yield User.find(request.currentUser.id)
    const isAdmin = yield admin.role().where('role', '=', 'admin').fetch()  
     


     const wishlists = yield Wishlist.query('user').where('user_id', '=', request.currentUser.id).fetch()
    
    
    yield response.sendView('product.show', {
         product: product.toJSON(), images:images.toJSON(),
         productImages:productImages.toJSON(), productIs:productIs.toJSON(),
         categories:categories.toJSON(), wishlists:wishlists.toJSON(), isAdmin }
         )
    }
    * create (request, response){
        yield response.sendView('product.create')
    }
    * store (request, response){
        const postData = request.all() 
      
         const file = request.file('imagem')
            const fileName = `${new Date().getTime()}.${file.extension()}`
            
            yield file.move(Helpers.publicPath('uploads'), fileName)
            if (!file.move()){
                response.badRequest({error:file.errors()})
                
                return
            }
         const data = {
               src: fileName
           }
           
    
      const product = new Product()
      product.title = request.input('title'),
      product.description = request.input('description'),
      product.sku = request.input('sku'),
      product.price = request.input('price')
      
      yield product.save(product)   
      
       yield product.images().create(data) 
       
        
    
        response.redirect('back')
    }
   
    * update(request, response){
      const id = request.param('id');
      const product = yield Product.with().where({ id }).firstOrFail();
      const data = new Product()
        product.title = request.input('title'),
        product.description = request.input('description'),
        product.sku = request.input('sku'),
        product.price = request.input('price')  
      
      const dataCat = request.input('category')
          
        
      

      yield product.save(data)
      yield product.categories().sync([dataCat])
     
      response.redirect('back')
    }
    * destroy(request,response){
      const id = request.param('id');
      
      const product = yield Product.find(id)
      yield product
  .delete()
         yield response.redirect('/backend/shop')
    
    }
    * destroyWish(request,response){
      const id = request.param('id');
      const wishlistID = yield Database.from('product_wishlist').where('product_id', '=', id)
      const product = yield Product.find(wishlistID[0].product_id)
      yield Database
  .table('product_wishlist')
  .where('id', wishlistID[0].id)
  .delete()
         yield response.redirect('back')
    
    }

    * addToWishlist(request,response){
      const id = request.param('id');
      const product = yield Product.find(id)
      const wishID = request.input('wishlist')
      const wishlist = yield Wishlist.find(wishID);
      const user = request.currentUser
      yield wishlist.products().attach([product.id])
      yield response.redirect('back')
    }
}

module.exports = ProductController
