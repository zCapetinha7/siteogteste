const express = require('express');
const passport = require('passport');
const session = require('express-session');
const DiscordStrategy = require('passport-discord').Strategy;
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS] });

const app = express();
const PORT = 3000;

// Configuração da sessão
app.use(session({
  secret: 'seu segredo', // Pode ser qualquer string
  resave: false,
  saveUninitialized: false,
}));

// Inicializar o passport
app.use(passport.initialize());
app.use(passport.session());

// Configuração do Passport (estratégia do Discord)
passport.use(new DiscordStrategy({
  clientID: '1307836078333624412',  // Coloque o Client ID do seu bot
  clientSecret: 'SEU_CLIENT_SECRET_DO_DISCORD',  // O client secret que você pegou ao criar o bot
  callbackURL: 'https://originalgifstm.vercel.app/auth/discord/callback',  // URL para onde o Discord vai redirecionar após o login
  scope: ['identify', 'guilds', 'guild.members.read'],
}, async (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Serializa e desserializa o usuário
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Rota de login via Discord
app.get('/auth/discord', passport.authenticate('discord'));

// Rota de callback do Discord
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  async (req, res) => {
    // Verifica se o usuário está no servidor
    const guildId = '1006703572601294888';  // ID do seu servidor
    const guild = await client.guilds.fetch(guildId);
    
    try {
      const member = await guild.members.fetch(req.user.id);  // Verifica se o usuário está no servidor
      if (member) {
        res.redirect('/dashboard');  // Página protegida
      } else {
        res.send(`
          <h1>Você precisa estar no servidor para acessar!</h1>
          <p>Por favor, entre no nosso servidor do Discord:</p>
          <a href="https://discord.gg/originalgifs">Entrar no servidor</a>
        `);
      }
    } catch (error) {
      res.send(`
        <h1>Você precisa estar no servidor para acessar!</h1>
        <p>Por favor, entre no nosso servidor do Discord:</p>
        <a href="https://discord.gg/originalgifs">Entrar no servidor</a>
      `);
    }
  });

// Página inicial (login)
app.get('/', (req, res) => {
  res.send('<a href="/auth/discord">Login com Discord</a>');  // Link para login
});

// Página de dashboard (apenas para quem estiver no servidor)
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send('<h1>Bem-vindo ao dashboard!</h1><p>Conteúdo exclusivo para membros do servidor.</p>');
});

// Rodar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
