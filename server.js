const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

// Inicializando o Express
const app = express();
const PORT = 3000;

// Configuração do Passport para usar o Discord
passport.use(new DiscordStrategy({
    clientID: 'YOUR_DISCORD_CLIENT_ID',
    clientSecret: 'YOUR_DISCORD_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    // Verifique se o usuário está no seu servidor
    if (profile.guilds.some(guild => guild.id === 'YOUR_GUILD_ID')) {
        return done(null, profile);
    } else {
        return done(null, false, { message: 'Você não é membro deste servidor!' });
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((id, done) => done(null, id));

// Middleware
app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Rota de autenticação do Discord
app.get('/auth/discord', passport.authenticate('discord'));

// Rota de retorno de callback
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard'); // Redireciona para uma página restrita
    }
);

// Rota de Dashboard (apenas acessível para membros do servidor)
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/'); // Se não estiver autenticado, volta para a página inicial
    }
    res.send('<h1>Bem-vindo ao Dashboard!</h1>');
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
