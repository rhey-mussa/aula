const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rota para adicionar dados (AJAX)
router.post('/adicionar', (req, res) => {
    const { lesao, esporte, metodo } = req.body;

    if (!lesao || !esporte || !metodo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    let dados = [];
    const dadosPath = path.join(__dirname, '../public/dados.json');
    if (fs.existsSync(dadosPath)) {
        dados = JSON.parse(fs.readFileSync(dadosPath));
    }

    dados.push({ lesao, esporte, metodo });
    fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2));

    res.status(200).json({ message: 'Dados adicionados com sucesso' });
});

module.exports = router;