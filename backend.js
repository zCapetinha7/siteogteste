const express = require('express');
const passport = require('passport');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();
const PORT = 3000;

// Configuração da sessão
app.use(session({ secret: 'seu-segredo', resave: false, saveUninitialized: true }));

// Inicializando o Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuração do Passport Discord
passport.use(new DiscordStrategy({
  clientID: 'SEU_CLIENT_ID',  // Substitua com seu Client ID do Discord
  clientSecret: 'SEU_CLIENT_SECRET',  // Substitua com seu Client Secret do Discord
  callbackURL: 'http://localhost:3000/auth/discord/callback',  // URL de callback
}, function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Rota de login com Discord
app.get('/auth/discord',
  passport.authenticate('discord'));

// Rota de callback após o login
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');  // Redireciona para a página protegida
  });

// Página inicial com link para login
app.get('/', (req, res) => {
  res.send('<h1>Bem-vindo! <a href="/auth/discord">Login com Discord</a></h1>');
});

// Página protegida (somente para usuários logados)
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Olá, ${req.user.username}</h1><p>Você está logado!</p>`);
  } else {
    res.redirect('/');
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
