//получаем express
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
//path
const path = require('path')
//шифрование пользователей csrf
const csrf = require('csurf')
//mongoose mongodb
const mongoose = require('mongoose')
//сессии
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
//handlebars
const exphbs = require('express-handlebars')

//роуты
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/card')
const addRoutes = require('./routes/add')
const authRoutes = require('./routes/auth')
const ordersRoutes = require('./routes/orders')
const coursesRoutes = require('./routes/courses')
const profileRoutes = require('./routes/profile')
const marketRoutes = require('./routes/market')
//миддлвейр
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const keys = require('./keys')
const fileMiddleware = require('./middleware/file')

const app = express()

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helper.hbs')
})
const store = new MongoStore({
  collection: 'session',
  uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))

app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())

//миддлвэйр
app.use(varMiddleware)
app.use(userMiddleware)


//страницы
app.use('/auth', authRoutes)
app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
/*app.use('/orders', ordersRoutes)*/
app.use('/profile', profileRoutes)
app.use('/market', marketRoutes)

app.use(errorHandler)
//запуск сервера
const PORT = process.env.PORT || 3000

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true,
    useFindAndModify:false,  useUnifiedTopology: true
    })

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()



