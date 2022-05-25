const   mongoose    =   require('mongoose'),
        Print       =   require('./models/print'),
        Comment     =   require('./models/comment'),
        Cart        =   require('./models/cart');
        Order     = require('./models/order');
        User        =   require('./models/user');
        

// const data = [
//     {
//         name : "Shirt", 
//         price : "300", 
//         url :  "https://www.uniqlo.com/jp/ja/contents/feature/masterpiece/common_22ss/img/products/contentsArea_itemimg_16.jpg"
//     },
//     {
//         name : "Coat", 
//         price : "1000", 
//         url :  "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/camel-coats-1629991736.jpg?crop=0.338xw:0.676xh;0.0128xw,0.00962xh&resize=640:*"
//     },
//     {
//         name : "T-shirt", 
//         price : "450", 
//         url :  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2PaeXsOo4t1ELbGaIzUTia7gpWBPIwv_oTh2W0zXZLCNNMPCzLeliF0wAE30d0EqP9Fo&usqp=CAU"
//     }
// ];
function seedDB(){
    Print.remove({},function(err){
        if(err){
            console.log(err)
        } else {
            console.log('Data removal complete');
            // data.forEach(function(seed){
            //     Print.create(seed, function(err, print){
            //         if(err){
            //             console.log(err);
            //         } else {
            //             console.log('New data added!');
            //             // Comment.create({
            //             //     author: 'Tony Stark',
            //             //     text: 'This is my FAV!'
            //             // }, function(err, comment){
            //             //     if(err){
            //             //         console.log(err)
            //             //     } else {
            //             //         print.comments.push(comment);
            //             //         print.save();
            //             //     }
            //             // });
            //         }
            //     });
            // });
        }
    });
}

module.exports = seedDB;