const   express = require('express'),
        router  = express.Router({mergeParams: true}),
        multer  = require('multer'),
        path    = require('path'),
        middleware = require('../middleware'),
        storage = multer.diskStorage({
            destination: function(req, file, callback){
                callback(null,'./public/upload/');
            },
            filename: function(req, file, callback){
                callback(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
            }
        }),

        imageFilter = function(req, file, callback){
            if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
                return callback(new Error('Only jpg, jpeg, png and gif.'), false);
            }
            callback(null, true);
        },

        upload = multer({storage: storage, fileFilter: imageFilter}),
        Print   = require('../models/print'),
        Cart    = require('../models/cart'),
        User    = require('../models/user'),
        Order = require('../models/order');
router.post("/", upload.single('image'), function(req, res){
    req.body.print.image  ='/upload/'+ req.file.filename;
    req.body.print.author = {
        id: req.user._id,
        username: req.user.username
    };
    Print.create(req.body.print, function(err, newlyAdded){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
    
});



router.get("/:id/edit", middleware.checkPrintOwner, function(req, res){
    Print.findById(req.params.id, function(err, foundprint){
        if(err){
            console.log(err);
        } else {
            res.render('print/edit.ejs',{print: foundprint})
        }
    });
});


router.put('/:id',upload.single('image'), function(req, res){
    if(req.file){
        req.body.print.image = '/upload/'+req.file.filename;
    }
    Print.findByIdAndUpdate(req.params.id, req.body.print, function(err, updatedPrint){
        if(err){
            console.log(err);
            res.redirect('/prints/'+req.params.id);
            req.flash('error','Update fail!');
        } else {
            res.redirect('/prints/'+req.params.id);
        }
    });
});

router.get('/:id/addToCart', middleware.isLoggedIn, function(req,res){
    Print.findById(req.params.id, function(err,foundPrint){
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            Cart.findOne({user: {id: req.user._id}},function(err, foundCart){
                if(err){
                    console.log(err);
                }
                else{
                    if(!foundCart){
                        const newCart = {user:{id: req.user._id}};
                        Cart.create(newCart, function(err, newCart){
                            if(err){
                                console.log(err)
                            }
                            else{
                                newCart.product.push(foundPrint);
                                newCart.totalPrice =0;
                                newCart.totalPrice += foundPrint.price;
                                newCart.totalQuantity = 0;
                                newCart.totalQuantity++;
                                newCart.save();
                                req.flash('success','Product add to your cart');
                                res.redirect('/');
                            }
                        });
                    }
                    else{
                        foundCart.product.push(foundPrint);
                        foundCart.totalPrice += foundPrint.price;
                        foundCart.totalQuantity++;
                        foundCart.save();
                        req.flash('success','Product add to your cart');
                        res.redirect('/');
                    }
                }
            });
        }
    });
});

router.get('/cart', middleware.isLoggedIn, function(req, res){
    Cart.findOne({user: {id: req.user._id}}).populate("product").populate("user").exec(function(err, foundCart){
        if(err){
            console.log(err);
        } else{
            res.render('cart/cart.ejs', {showCart: foundCart});
            console.log(foundCart);
        }
    });
});

router.get('/:id/remove', function(req, res){
    Print.findById(req.params.id, function(err, foundPrint){
        if(err){
            console.log(err);
        } else {
            Cart.findOne({user: {id: req.user._id}}, function(err, foundCart){
                if(err){
                    console.log(err);
                } else{
                    foundCart.product.pull(foundPrint);
                    foundCart.totalPrice -= foundPrint.price;                 
                    foundCart.totalQuantity --;
                    foundCart.save();
                    res.redirect('/prints/cart');
                }
            });
        }
    });
});
router.get('/:id/order', middleware.isLoggedIn, function(req, res){
    Cart.findOne({user: {id: req.user._id}}).populate("user").exec(function(err, foundCart){
        if(err){
            console.log(err);
        }
        else{
            foundCart.user.address = req.user.address;
            foundCart.user.phone = req.user.phone;
            foundCart.save();
            res.render('order/order.ejs', {foundCart: foundCart});
        }
    });
});

router.post('/order/:id/createOrder',middleware.isLoggedIn, function(req, res){
    Cart.findById(req.params.id).populate("product").populate("user").exec(function(err, foundCart){
        if(err){
            console.log(err);
        }
        else{
            Order.create({user: {id: req.user._id}}, function(err, newOrder){
                if(err){
                    console.log(err);
                }
                else{
                    newOrder.cart.push(foundCart);
                    newOrder.phone = req.user.phone;
                    newOrder.address = req.user.address;
                    newOrder.paymentMethod = req.body.paymentMethod;
                    newOrder.save();
                    req.flash('success','Order success');
                    res.redirect('/');
                }
            });
        }
    })
})



router.get('/lowToHigh', function(req, res){
    Print.find({}).sort([['price', 1]]).exec(function(err, sortPrint){
        if(err){
            console.log(err);
        } else{
            res.render('print/landing.ejs', {prints: sortPrint});
        }
    });
});

router.get('/highToLow', function(req, res){
    Print.find({}).sort([['price', -1]]).exec(function(err, sortPrint){
        if(err){
            console.log(err);
        } else{
            res.render('print/landing.ejs', {prints: sortPrint});
        }
    });
});


router.get("/:id", function(req, res){
    Print.findById(req.params.id).populate('comments').exec(function(err, foundPrint){
        if(err){
            console.log(err);
        }
        else{
            res.render('print/show.ejs',{print: foundPrint})
        }
    });
});

router.delete('/:id',middleware.checkPrintOwner, function(req,res){
    Print.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect('/prints/');
            req.flash('error','Delete fail!');
        } else {
            res.redirect('/');
        }
    });
});


module.exports = router;