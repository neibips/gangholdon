const keys = require('../keys/index')

module.exports = function (to, name) {
    return {
        to: to,
        from: keys.EMAIL_FROM,
        subject: 'Account created',
        html: `
        <h1>Поздравляем, ${name} , вы зарегестрировались на b2b площадке</h1>
        <p>Теперь вам доступен весь функционал нашей площадки, 
        можете добавить свою фирму</p>
        <a href="${keys.BASE_URL}">Ссылка на сайт</a>
        `
    }
}