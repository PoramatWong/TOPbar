const   express = require('express'),
        router  = express.Router({mergeParams: true}),
        User    = require('../models/user'),
        multer  = require('multer'),
        path    = require('path'),

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
        Print    = require('../models/print'),
        passport = require('passport');

router.get('/register', function(req, res){
    res.render('register.ejs');
});

router.get("/", function(req, res){
    Print.find({},function(err,allPrints){
        if(err){
            console.log(err);
        }
        else{
            res.render("print/landing.ejs",{prints:allPrints})
        }
    })
});

router.get("/new", function(req, res){
    res.render("print/new.ejs")
});


router.post('/register',upload.single('profileImage'), function(req, res){
    req.body.profileImage = '/upload/'+ req.file.filename;
    let newUser = new User({username: req.body.username,
                            name    : req.body.name,
                            fullName: req.body.fullName,
                            email   : req.body.email,
                            phone   : req.body.phone,
                            address : req.body.address,
                            profileImage : req.body.profileImage
    });
    if(req.body.adminCode === 'poramat'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash('error', err.message);
            return res.redirect('/register');
        }
        else{
            passport.authenticate('local')(req, res, function(){
            res.redirect('/');   
            });
        }
    });
});
router.get("/user/:id", function(req, res){
    User.findById(req.params.id,function(err, foundUser){
        if(err){
            req.flash('error', 'Something wrong!');
            return res.redirect('/');
        }
        else{
            res.render('user/profile.ejs', {user: foundUser});
        }
    });
});
router.get('/login', function(req, res){
    res.render('login.ejs');
});

router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash : true,
        failureFlash : 'Invalid username or password.' 
        
    }), function(req, res){
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;