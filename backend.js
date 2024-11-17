const express = require('express');
const passport = require('passport');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client, GatewayIntentBits } = require('discord.js');  // Importando discord.js

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
  scope: ['identify', 'guilds']  // Permissões para obter informações sobre o usuário e seus servidores
}, function(accessToken, refreshToken, profile, done) {
  return done(null, { ...profile, accessToken });  // Passa o token de acesso para poder fazer requisições
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Rota de login com Discord
app.get('https://discord.com/oauth2/authorize?client_id=1307836078333624412&response_type=code&redirect_uri=https%3A%2F%2Foriginalgifstm.vercel.app&scope=identify+guilds.members.read',
  passport.authenticate('discord'));

// Rota de callback após o login
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  async (req, res) => {
    // Configuração do cliente do Discord para acessar a API do servidor
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

    client.once('ready', async () => {
      const guildId = 'SEU_GUILD_ID';  // Substitua pelo ID do seu servidor
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(req.user.id);  // Verifica se o usuário está no servidor

      if (member) {
        // Se o usuário estiver no servidor
        res.redirect('/dashboard');  // Redireciona para a página protegida
      } else {
        // Se o usuário não estiver no servidor
        res.send('<h1>Você precisa estar no servidor para acessar esta página.</h1>');
      }
    });

    client.login('SEU_TOKEN_DO_BOT');  // Substitua com o Token do seu Bot
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
