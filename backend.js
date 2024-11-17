const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/callback', async (req, res) => {
    const code = req.query.code; // Recebe o código de autorização do Discord

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', null, {
            params: {
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                scope: 'identify',
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const access_token = response.data.access_token;

        // Usar o token para obter as informações do usuário
        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const user = userResponse.data;

        res.json(user); // Exibe as informações do usuário ou redireciona conforme necessário
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro na autenticação');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
