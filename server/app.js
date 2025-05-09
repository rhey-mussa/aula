const express = require('express');
const path = require('path');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON e servir arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Importar rotas AJAX
const routes = require('./routes');
app.use('/', routes);

// Criar servidor HTTP
const server = app.listen(port, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${port}`);
});

// Configurar servidor WebSocket
const wss = new WebSocket.Server({ server });

// Banco de respostas automáticas
const respostas = {
    'olá': 'Olá! Como posso ajudar com lesões esportivas hoje?',
    'oi': 'Oi! Pergunte sobre prevenção ou tratamento de lesões esportivas.',
    'como você está': 'Estou pronto para ajudar com dicas sobre lesões! E você, como está?',
    'tudo bem': 'Tudo ótimo por aqui! Qual é sua dúvida sobre lesões esportivas?',
    'bom dia': 'Bom dia! Quer saber como prevenir ou tratar alguma lesão?',
    'boa tarde': 'Boa tarde! Estou aqui para responder sobre lesões esportivas.',
    'boa noite': 'Boa noite! Pergunte sobre lesões ou prevenção!',
    'como prevenir lesões no joelho': 'Fortalecimento dos quadríceps e isquiotibiais, uso de joelheiras e técnica correta de aterrissagem.',
    'como tratar entorse de tornozelo': 'Aplique o método RICE (repouso, gelo, compressão, elevação) por 48 horas e consulte um fisioterapeuta.',
    'lesões no ombro natação': 'Fortalecimento do manguito rotador, técnica de nado ajustada e pausas para evitar overuse.',
    'distensão muscular corrida': 'Repouso inicial, gelo nas primeiras 24 horas, seguido de alongamento leve e massagem.',
    'tendinite basquete': 'Repouso, anti-inflamatórios sob orientação médica e exercícios de fortalecimento do tendão.',
    'como evitar lesões no futebol': 'Aquecimento completo, uso de caneleiras e treinamento de agilidade.',
    'fratura por estresse corrida': 'Reduza a carga de treino, use calçados adequados e consulte um ortopedista.',
    'luxação ombro rugby': 'Imobilização imediata, redução por profissional médico e reabilitação com fisioterapia.',
    'lesão no pulso tênis': 'Uso de munhequeiras, técnica correta de empunhadura e fortalecimento do antebraço.',
    'tratamento para fascite plantar': 'Órteses, alongamento da fáscia plantar e repouso de atividades de alto impacto.',
    'lesões no cotovelo golfe': 'Ajuste da técnica de swing, uso de cotoveleiras e exercícios de fortalecimento.',
    'como tratar lesão meniscal': 'Repouso, gelo, e avaliação médica; em casos graves, pode ser necessária artroscopia.',
    'tendinite aquiles corrida': 'Repouso, alongamento do tendão de Aquiles e uso de palmilhas para suporte.',
    'tratamento para contusão muscular': 'Gelo nas primeiras 48 horas, compressão e elevação, seguido de reabilitação leve.',
    'lesões no quadril ciclismo': 'Ajuste da altura do selim, fortalecimento do core e pausas para evitar tensão.',
    'como prevenir lesões no tornozelo basquete': 'Uso de tênis de cano alto, treinamento proprioceptivo e fortalecimento muscular.',
    'tratamento para síndrome do impacto no ombro': 'Fisioterapia para fortalecimento, evitar movimentos repetitivos e, se necessário, infiltração.'
};

// Contador de perguntas e informações do usuário
const contadoresPerguntas = new Map();
const usuarios = new Map();

wss.on('connection', (ws, req) => {
    console.log('Novo cliente conectado ao WebSocket!');
    ws.send('Bem-vindo ao chat de dicas sobre lesões esportivas! Faça sua pergunta.');

    contadoresPerguntas.set(ws, 0);

    ws.on('message', (data) => {
        const mensagem = data.toString();
        console.log('Mensagem recebida:', mensagem);

        let contador = contadoresPerguntas.get(ws);
        const usuario = usuarios.get(ws);

        if (!usuario && mensagem.includes(':::') && contador >= 6) {
            const [nome, funcao] = mensagem.split(':::');
            usuarios.set(ws, { nome, funcao });
            ws.send(`Função registrada: ${funcao} (${nome})`);
            return;
        }

        if (contador < 6) {
            const pergunta = mensagem.toLowerCase().trim();
            let resposta = respostas[pergunta] || `Desculpe, não tenho uma resposta para essa pergunta. Tente algo como "como prevenir lesões no joelho", ou vá para a página de "Registrar Lesão" e clique no botão "Listar Registros" para poder visualizar as lesões.`;
            ws.send(`Servidor: ${resposta}`);
            contador++;
            contadoresPerguntas.set(ws, contador);

            if (contador === 6) {
                ws.send('Limite de 6 perguntas atingido! Insira seu nome e função para continuar.');
            }
        } else if (usuario) {
            const { nome, funcao } = usuario;
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    const outroUsuario = usuarios.get(client);
                    if (outroUsuario) {
                        if (funcao === 'Gerente' && outroUsuario.funcao === 'Cliente Normal') {
                            client.send(`Gerente (${nome}): ${mensagem}`);
                        } else if (funcao === 'Cliente Normal' && outroUsuario.funcao === 'Gerente') {
                            client.send(`Cliente (${nome}): ${mensagem}`);
                        }
                    }
                }
            });
            ws.send(`${funcao} (${nome}): ${mensagem}`);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado do WebSocket.');
        contadoresPerguntas.delete(ws);
        usuarios.delete(ws);
    });
});

console.log(`WebSocket rodando na mesma porta ${port}`);