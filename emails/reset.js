const keys = require('../keys/index')

module.exports = function (email, token, name) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Восстановление доступа',
        html: `
        <h1>${name} , вы забыли пароль? Сейчас мы его восстановим </h1>
        <p>Вот вам ссылка по которой вы можете задать новый:</p>
        <p><a href="${keys.BASE_URL}auth/password/${token}">Ссылка на восстановление</a></p>
        `
    }
}