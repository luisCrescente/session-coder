import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import fkr from './faker/faker.js'
const PORT = 8080;

const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views','./public/views');

app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://luis:8986cc7cc5@cluster0.6wsge.mongodb.net/?retryWrites=true&w=majority',
    }),
    secret:'shhhhhhhhh',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))

app.get('/productos', (req,res)=> {
    if(req.session.user){
        const userName = req.session.user
        const list = fkr();
        console.log(list);
        res.render('products', {list, userName})
    } else {
        res.redirect('/login')
    }
})
app.get('/login' , (req,res)=> {
    const {userName} = req.body
    req.session.user = userName
    res.render('login')
})
app.get('/logout', (req,res)=> {
    const userName = req.session.user
    req.session.destroy()
    res.render('logout', {
        userName
    })
})
app.post('/login', (req,res)=> {
    const {userName} = req.body
    req.session.user = userName
    res.redirect('/productos')
})


app.listen(PORT, ()=> {
    console.log(`servidor corriendo en el puerto: ${PORT}`)
});