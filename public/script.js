document.getElementById('form-lesao').addEventListener('submit', async (e) => {
    e.preventDefault();

    const lesao = document.getElementById('lesao').value;
    const esporte = document.getElementById('esporte').value;
    const metodo = document.getElementById('metodo').value;
    const resultado = document.getElementById('resultado');

    try {
        const response = await fetch('http://localhost:3000/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lesao, esporte, metodo })
        });

        const data = await response.json();
        resultado.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } catch (error) {
        resultado.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
    }
});

document.getElementById('listar').addEventListener('click', async () => {
    const listaRegistros = document.getElementById('lista-registros');

    try {
        const response = await fetch('dados.json');
        const dados = await response.json();

        listaRegistros.innerHTML = '<h3>Registros de Lesões</h3>';
        dados.forEach((item, index) => {
            listaRegistros.innerHTML += `
                <div class="card mt-2">
                    <div class="card-body">
                        <h5 class="card-title">Registro ${index + 1}</h5>
                        <p class="card-text"><strong>Lesão:</strong> ${item.lesao}</p>
                        <p class="card-text"><strong>Esporte:</strong> ${item.esporte}</p>
                        <p class="card-text"><strong>Método:</strong> ${item.metodo}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        listaRegistros.innerHTML = `<div class="alert alert-danger">Erro ao carregar registros: ${error.message}</div>`;
    }
});