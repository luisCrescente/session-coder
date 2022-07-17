import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';
import fkr from './faker/faker.js';
import MongoDbContenedor from './contenedor/contenedor.js';
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

const PORT = 8080;

const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('views'));

app.set('view engine', 'ejs');
app.set('views','./views');

let products
let messages

async function connectMongo() {
    try {
        const mongo = new MongoClient("mongodb+srv://luis:8986cc7cc5@cluster0.6wsge.mongodb.net/?retryWrites=true&w=majority");
        products = new MongoDbContenedor(mongo, 'ecommerce', 'products');
        messages = new MongoDbContenedor(mongo, 'ecommerce', 'messages')
        await mongo.connect();
    }
    catch(err) {
        console.log(`ERROR: ${err}`);
    }
}
connectMongo();

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

app.get('/productos-test', (req,res)=> {
        const list = fkr();
        console.log(list);
        res.render('productos-test', {list})
})

app.get('/productos', async (req,res)=> {
    if(req.session.user){
        const userName = req.session.user
        const prods = await products.getAll();
        const msgs = await messages.getAll();
        res.render('formulario', { prods, msgs, userName })
    } else {
        res.redirect('/')
    }
})
app.get('/' , (req,res)=> {
    const {userName} = req.body
    req.session.user = userName
    res.render('login')
});

app.post('/login', (req,res)=> {
    const {userName} = req.body
    req.session.user = userName
    res.redirect('/productos')
});

app.get('/logout', (req,res)=> {
    const userName = req.session.user
    req.session.destroy()
    res.render('logout', {
        userName
    })
});
const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

socketServer.on('connection', async (socket) => {
    socket.emit('products', await products.getAll());
    socket.emit('messages', await messages.getAll());

    socket.on('new_message', async (messages) =>{
        try{
            await messages.save(mesage);
            let msgs = await messages.getAll();
            socketServer.sockets.emit.getAll('messages', msgs);
        }catch(error){
            console.log(error);
        }
    });

    socket.on('new_product', async (product) => {
        try{
            await products.save(product);
            let prods = await products.getAll();
            socketServer.sockets.emit('products', prods);
        }catch (error){
            console.log(error);
        }
    });
});

httpServer.listen(PORT, ()=> {
    console.log(`servidor corriendo en el puerto: ${PORT}`)
});