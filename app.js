const express=require('express')
const mysql=require('mysql')
const exphbs=require('express-handlebars')
bodyParser=require('body-parser')
const app=express()
const port=2000
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static("public"))
app.engine("hbs",exphbs({extname:".hbs"}))
app.set("view engine","hbs")
global.username;
global.userid;
global.productid;
const pool=mysql.createPool({
    connectionLimit  : 10,
    host             : 'localhost',
    user             : 'root',
    password         : 'pramoth6302',
    database         : 'pizza'
})
pool.getConnection((err,connection)=>{
    if(err) throw err;
    console.log(`Connected to Thread : ${connection.threadId}`)
})

app.get('/',(req,res)=>{
    res.render('login')
})
app.get('/admin',(req,res)=>{
    res.render('loginadmin')
})

app.get('/sign',(req,res)=>{
    res.render('signup')
})

app.post('/homepage',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('SELECT * FROM customers WHERE name=? and password=?',[req.body.uname,req.body.password],(err,rows)=>{
            connection.release();
            if(!err){
                if(rows.password=req.body.password){
                    if(rows.name=req.body.uname){
                        res.render('home',{rows})
                    }
                    else{
                        res.render('login',{alert:"Username or Password seems invalid"});
                    }
                }else{
                    res.render('login',{alert:"Username or Password seems invalid"});
                }
            }else{
                console.log(err)
            }
        })
    })
})

app.post('/adminpage',(req,res)=>{

    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('SELECT m.user_id,m.prod_id,c.name,p.prod_name,p.price,p.image,m.quantity,m.total_price,m.address FROM customers c,product p,myorders m where m.user_id=c.user_id and p.prod_id=m.prod_id',(err,rows)=>{
            connection.release();
            if(!err){
                if(req.body.password=="password"){
                    if(req.body.uname=="admin"){
                        res.render('admincart',{rows})
                    }
                    else{
                        res.render('loginadmin',{alert:"Admin Name or Password seems invalid"});
                    }
                }else{
                    res.render('loginadmin',{alert:"Admin Name or Password seems invalid"});
                }
            }else{
                console.log(err)
            }
        })
    })
})

app.get('/remove/:uid/:pid/:quan/:ad',(req,res)=>{
    pool.getConnection((err,connection)=>{
        uid=req.params.uid;
        pid=req.params.pid;
        quan=req.params.quan;
        ad=req.params.ad;
        if(err) throw err;
        connection.query('DELETE FROM myorders where user_id=? and prod_id=? and quantity=? and address=?',[uid,pid,quan,ad],(err,rows)=>{
            connection.release();
            if(!err){
                res.render('success',{alert:"The Order has been Delivered Successfully"})
            }else{
                console.log(err)
            }
        })
    })
})


app.get('/product/:id/:uname',(req,res)=>{
    userid=req.params.id;
    username=req.params.uname;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('SELECT * FROM product',(err,rows)=>{
            connection.release();
            if(!err){
                   res.render('products',{rows,username})
            }else{
                console.log(err)
            }
        })
    })
})

app.get('/cart/:uname',(req,res)=>{
    uname=req.params.uname;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('SELECT c.name,p.prod_name,p.price,p.image,m.quantity,m.total_price,m.address FROM customers c,product p,myorders m where c.name=? and m.user_id=c.user_id and p.prod_id=m.prod_id',[req.params.uname],(err,rows)=>{
            connection.release();
            if(!err){
                   res.render('cart',{rows})
            }else{
                console.log(err)
            }
        })
    })
})



app.post('/sign',(req,res)=>{
    const {uname,dob,mobile,password}=req.body;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('INSERT INTO customers SET name=?,dob=?,mobile=?,password=?',[uname,dob,mobile,password],(err,rows)=>{
            connection.release();
            if(!err){
                res.render('signup',{alert:"User Added Successfully"});
            }else{
                console.log(err)
            }
        })
    })
})
app.get('/about',(req,res)=>{
    res.render('about')
})

app.get('/order/:id',(req,res)=>{
    productid=req.params.id;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('SELECT * FROM product where prod_id=?',[req.params.id],(err,rows)=>{
            connection.release();
            if(!err){
                res.render('order',{rows,username})
            }else{
                console.log(err)
            }
        })
    })
})

app.post('/order/:price',(req,res)=>{
    const {mobile,quantity,address}=req.body;
    price=req.params.price;
    total=quantity*price;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query('INSERT INTO myorders SET user_id=?,prod_id=?,quantity=?,total_price=?,address=?,mobile2=?',[userid,productid,quantity,total,address,mobile],(err,rows)=>{
            connection.release();
            if(!err){
                res.render('success',{alert:"Your Order has been placed Successfully"})
            }else{
                console.log(err)
            }
        })
    })
})



app.listen(port,()=>console.log(`Listening to port : ${port}`))

