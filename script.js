// Constantes do jogo
const TEMPO_CARREGAMENTO = 500;
const TEMPO_ESPERA_RESPOSTA = 1500;
const PONTOS_POR_ACERTO = 50;

// Variáveis do modal de login
const modalLogin = document.getElementById('modal-login');
const btnFecharLogin = document.querySelector('#modal-login .fechar-modal');
const btnConfirmar = document.getElementById('btn-confirmar');
const inputSenha = document.getElementById('senha-jogo');
const mensagemErro = document.getElementById('mensagem-erro');
let jogoSelecionado = null;

// Variáveis do modal de detalhes
const modalDetalhes = document.getElementById('modal-detalhes');
const btnFecharDetalhes = document.querySelector('#modal-detalhes .fechar-modal');
const tituloDetalhes = document.getElementById('titulo-detalhes');
const conteudoDetalhes = document.getElementById('conteudo-detalhes');

// Variáveis do jogo das silhuetas
const modalSilhuetas = document.getElementById('modal-silhuetas');
const fecharSilhuetas = document.querySelector('#modal-silhuetas .fechar-jogo');
const silhuetaImagem = document.getElementById('silhueta-imagem');
const mensagemCarregando = document.getElementById('mensagem-carregando');
const opcoesContainer = document.getElementById('opcoes-container');
const pontuacaoElement = document.getElementById('pontuacao');
const acertosElement = document.getElementById('acertos');
const totalPerguntasElement = document.getElementById('total-perguntas');

// Elementos de áudio
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Lista de todas as turmas com suas senhas
const TURMAS = {
    '1A': 'turma1a123', '1B': 'turma1b123', '1C': 'turma1c123',
    '2A': 'turma2a123', '2B': 'turma2b123', '2C': 'turma2c123',
    '3A': 'turma3a123', '3B': 'turma3b123', '3C': 'turma3c123',
    '4A': 'turma4a123', '4B': 'turma4b123', '4C': 'turma4c123',
    '5A': 'turma5a123', '5B': 'turma5b123', '5C': 'turma5c123',
    '6A': 'turma6a123', '6B': 'turma6b123', '6C': 'turma6c123',
    '7A': 'turma7a123', '7B': 'turma7b123', '7C': 'turma7c123',
    '8A': 'turma8a123', '8B': 'turma8b123', '8C': 'turma8c123',
    '9A': 'turma9a123', '9B': 'turma9b123', '9C': 'turma9c123',
    '101': 'turma101123', '102': 'turma102123', '103': 'turma103123',
    '201': 'turma201123', '202': 'turma202123', '203': 'turma203123',
    '301': 'turma301123', '302': 'turma302123', '303': 'turma303123'
};

// Variáveis para o ranking
let rankingRef;
let turmaAtual = null;

// Dados dos jogos
const detalhesJogos = {
    'silhuetas': {
        titulo: 'Jogo das Silhuetas',
        descricao: 'Um jogo divertido onde você precisa adivinhar o que é apenas pela sua sombra!',
        instrucoes: [
            'Você verá uma silhueta na tela',
            'Tente adivinhar o que é',
            'Cada acerto vale 50 pontos para sua turma'
        ],
        dicas: [
            'Observe bem os contornos da sombra',
            'Pense em objetos do seu dia a dia'
        ]
    },
    'quiz-facil': {
        titulo: 'Quiz Fácil',
        descricao: 'Perguntas divertidas para testar seus conhecimentos básicos!',
        instrucoes: [
            'Você terá perguntas com 4 alternativas',
            'Selecione a resposta correta',
            'Cada acerto vale 50 pontos'
        ],
        dicas: [
            'Leia todas as alternativas antes de responder'
        ]
    },
    'quiz-medio': {
        titulo: 'Quiz Médio',
        descricao: 'Perguntas mais desafiadoras para testar seu conhecimento!',
        instrucoes: [
            'Perguntas com nível médio de dificuldade',
            'Cada acerto vale 75 pontos'
        ],
        dicas: [
            'Elimine as alternativas que parecem incorretas'
        ]
    },
    'quiz-dificil': {
        titulo: 'Quiz Difícil',
        descricao: 'Perguntas complexas que exigem raciocínio avançado!',
        instrucoes: [
            'Perguntas de alto nível de dificuldade',
            'Cada acerto vale 100 pontos'
        ],
        dicas: [
            'Pense cuidadosamente antes de responder'
        ]
    }
};

// Perguntas do jogo das silhuetas (9 questões)
const perguntasSilhuetas = [
    {
        silhueta: 'imagens/gato.png',
        opcoes: ['Cachorro', 'Gato', 'Elefante', 'Leão'],
        resposta: 1
    },
    {
        silhueta: 'imagens/girafa.png',
        opcoes: ['Cavalo', 'Zebra', 'Girafa', 'Vaca'],
        resposta: 2
    },
    {
        silhueta: 'imagens/maça.png',
        opcoes: ['Maçã', 'Banana', 'Pera', 'Uva'],
        resposta: 0
    },
    {
        silhueta: 'imagens/boboesponja.png',
        opcoes: ['Galinha Pintadinha', 'Peppa Pig', 'Bob Esponja', 'Dora, a Aventureira'],
        resposta: 2
    },
    {
        silhueta: 'imagens/amongus.png',
        opcoes: ['Subway Surfers', 'Fortnite', 'Fall Guys', 'Among Us'],
        resposta: 3
    },
    {
        silhueta: 'imagens/arvore.png',
        opcoes: ['Casa', 'Árvore', 'Montanha', 'Cachoeira'],
        resposta: 1
    },
    {
        silhueta: 'imagens/carro.png',
        opcoes: ['Ônibus', 'Avião', 'Carro', 'Bicicleta'],
        resposta: 2
    },
    {
        silhueta: 'imagens/estrela.png',
        opcoes: ['Coração', 'Estrela', 'Lua', 'Sol'],
        resposta: 1
    }
];

// Função para abrir detalhes do jogo
function abrirDetalhes(jogoId) {
    const jogo = detalhesJogos[jogoId];
    if (!jogo) {
        console.error('Detalhes do jogo não encontrados para:', jogoId);
        return;
    }
    
    tituloDetalhes.innerHTML = `<i class="fas fa-info-circle"></i> ${jogo.titulo}`;
    
    let html = `
        <div class="detalhes-jogo">
            <p><strong>Descrição:</strong> ${jogo.descricao}</p>
        </div>
        
        <h3><i class="fas fa-list-ol"></i> Como Jogar</h3>
        <ul>`;
    
    jogo.instrucoes.forEach(instrucao => {
        html += `<li>${instrucao}</li>`;
    });
    
    html += `</ul>
        
        <h3><i class="fas fa-lightbulb"></i> Dicas</h3>
        <ul>`;
    
    jogo.dicas.forEach(dica => {
        html += `<li>${dica}</li>`;
    });
    
    html += `</ul>`;
    
    conteudoDetalhes.innerHTML = html;
    modalDetalhes.style.display = 'block';
}

// Configuração dos eventos dos cards
const cardsJogo = document.querySelectorAll('.jogo-card');
cardsJogo.forEach(card => {
    card.addEventListener('click', function(e) {
        if (e.target.closest('.btn-jogar')) {
            return;
        }
        abrirDetalhes(this.id);
    });
});

// Configuração dos eventos dos botões Jogar
const botoesJogar = document.querySelectorAll('.btn-jogar');
botoesJogar.forEach(botao => {
    botao.addEventListener('click', function(e) {
        e.stopPropagation();
        
        jogoSelecionado = this.getAttribute('data-jogo');
        
        const instrucao = document.getElementById('instrucao-jogo');
        const nomeJogo = this.closest('.jogo-card').querySelector('h3').textContent;
        instrucao.textContent = `Digite a senha da sua turma para acessar o ${nomeJogo}:`;
        
        modalLogin.style.display = 'block';
        inputSenha.value = '';
        inputSenha.focus();
    });
});

// Confirmar senha
btnConfirmar.addEventListener('click', function() {
    const senhaDigitada = inputSenha.value.trim();
    
    // Verifica se a senha corresponde a alguma turma
    for (const [turma, senha] of Object.entries(TURMAS)) {
        if (senhaDigitada === senha) {
            turmaAtual = turma;
            mensagemErro.textContent = '';
            fecharModalLogin();
            
            if (jogoSelecionado === 'silhuetas') {
                iniciarJogoSilhuetas();
            } else {
                alert(`Senha correta! Redirecionando para o ${jogoSelecionado}...`);
            }
            return;
        }
    }
    
    // Se não encontrou a turma
    mensagemErro.textContent = 'Senha incorreta! Digite a senha da sua turma.';
    inputSenha.value = '';
    inputSenha.focus();
    if (somErro) somErro.play().catch(e => console.log('Erro ao reproduzir som:', e));
});

// Funções do jogo das silhuetas
let perguntaAtual = 0;
let pontuacao = 0;
let acertos = 0;

function iniciarJogoSilhuetas() {
    perguntaAtual = 0;
    pontuacao = 0;
    acertos = 0;
    
    totalPerguntasElement.textContent = perguntasSilhuetas.length;
    atualizarPlacar();
    
    modalSilhuetas.style.display = 'block';
    mostrarPergunta();
}

function mostrarPergunta() {
    if (perguntaAtual >= perguntasSilhuetas.length) {
        finalizarJogo();
        return;
    }
    
    const pergunta = perguntasSilhuetas[perguntaAtual];
    if (!pergunta) {
        console.error('Pergunta não encontrada:', perguntaAtual);
        return;
    }
    
    silhuetaImagem.style.display = 'none';
    mensagemCarregando.style.display = 'block';
    
    setTimeout(() => {
        silhuetaImagem.src = pergunta.silhueta;
        silhuetaImagem.onload = function() {
            mensagemCarregando.style.display = 'none';
            silhuetaImagem.style.display = 'block';
        };
        silhuetaImagem.onerror = function() {
            mensagemCarregando.textContent = 'Erro ao carregar imagem';
            console.error('Erro ao carregar imagem:', pergunta.silhueta);
        };
        
        opcoesContainer.innerHTML = '';
        pergunta.opcoes.forEach((opcao, index) => {
            const botao = document.createElement('button');
            botao.className = 'opcao-btn';
            botao.textContent = opcao;
            botao.addEventListener('click', () => verificarResposta(index));
            opcoesContainer.appendChild(botao);
        });
    }, TEMPO_CARREGAMENTO);
}

function verificarResposta(respostaIndex) {
    const pergunta = perguntasSilhuetas[perguntaAtual];
    const botoes = document.querySelectorAll('.opcao-btn');
    
    botoes.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });
    
    if (respostaIndex === pergunta.resposta) {
        botoes[respostaIndex].classList.add('correta');
        pontuacao += PONTOS_POR_ACERTO;
        acertos++;
        
        if (somAcerto) somAcerto.play().catch(e => console.log('Erro ao reproduzir som:', e));
    } else {
        botoes[respostaIndex].classList.add('incorreta');
        botoes[pergunta.resposta].classList.add('correta');
        if (somErro) somErro.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
    
    atualizarPlacar();
    
    setTimeout(() => {
        perguntaAtual++;
        mostrarPergunta();
    }, TEMPO_ESPERA_RESPOSTA);
}

function atualizarPlacar() {
    pontuacaoElement.textContent = pontuacao;
    acertosElement.textContent = acertos;
}

function finalizarJogo() {
    if (turmaAtual) {
        // Envia a pontuação para o Firebase
        const pontosRef = database.ref('ranking/' + turmaAtual);
        pontosRef.transaction((currentPontos) => {
            return (currentPontos || 0) + pontuacao;
        });
    }

    // Cria a tela de finalização
    const modalFinal = document.createElement('div');
    modalFinal.className = 'modal-final-container';
    modalFinal.innerHTML = `
        <div class="modal-final-conteudo">
            <h1 class="titulo-final"><i class="fas fa-trophy"></i> Jogo Concluído!</h1>
            
            <div class="resultado-final">
                <div class="pontuacao-final">${pontuacao}</div>
                <p class="mensagem-final">Pontos conquistados para a Turma ${turmaAtual}!</p>
                
                <div class="detalhes-pontuacao">
                    <p><i class="fas fa-check-circle"></i> Acertos: ${acertos}/${perguntasSilhuetas.length}</p>
                    <p><i class="fas fa-star"></i> Pontos: ${pontuacao}</p>
                </div>
                
                <p class="mensagem-ranking">Verifique o ranking e veja onde sua turma está!</p>
                
                <div class="botoes-final">
                    <a href="#ranking" id="btn-ranking" class="btn-final">
                        <i class="fas fa-trophy"></i> Ver Ranking
                    </a>
                    <button id="btn-jogar-novamente" class="btn-final destaque">
                        <i class="fas fa-redo"></i> Jogar Novamente
                    </button>
                </div>
                
                <p class="dica-final">Quanto mais você jogar, mais pontos sua turma ganhará!</p>
            </div>
        </div>
    `;
    
    modalSilhuetas.innerHTML = '';
    modalSilhuetas.appendChild(modalFinal);
    
    // Adiciona eventos aos botões
    document.getElementById('btn-jogar-novamente').addEventListener('click', iniciarJogoSilhuetas);
}

// Função para criar e atualizar o ranking
function atualizarRanking() {
    rankingRef = database.ref('ranking');
    rankingRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const rankingGeral = document.getElementById('ranking-geral');
        
        // Garante que todas as turmas existam no ranking com pelo menos 0 pontos
        Object.keys(TURMAS).forEach(turma => {
            if (!data.hasOwnProperty(turma)) {
                data[turma] = 0;
            }
        });
        
        // Converte o objeto em array e ordena por pontos
        const rankingArray = Object.entries(data)
            .map(([turma, pontos]) => ({ turma, pontos }))
            .sort((a, b) => b.pontos - a.pontos);
        
        // Cria o menu de ranking
        rankingGeral.innerHTML = '';
        
        // Cria um menu suspenso para selecionar a série
        const series = {
            'Fundamental I': ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C'],
            'Fundamental II': ['6A', '6B', '6C', '7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'],
            'Ensino Médio': ['101', '102', '103', '201', '202', '203', '301', '302', '303']
        };
        
        // Cria os menus por série
        for (const [serie, turmasSerie] of Object.entries(series)) {
            const serieDiv = document.createElement('div');
            serieDiv.className = 'ranking-serie';
            
            const serieTitle = document.createElement('h3');
            serieTitle.textContent = serie;
            serieTitle.className = 'serie-title';
            serieDiv.appendChild(serieTitle);
            
            const turmasDiv = document.createElement('div');
            turmasDiv.className = 'turmas-container';
            
            turmasSerie.forEach(turma => {
                const pontos = data[turma] || 0;
                
                const itemRanking = document.createElement('div');
                itemRanking.className = 'item-ranking';
                if (turma === turmaAtual) {
                    itemRanking.classList.add('turma-atual');
                }
                
                const turmaElement = document.createElement('div');
                turmaElement.className = 'turma-ranking';
                turmaElement.textContent = turma;
                
                const pontosElement = document.createElement('div');
                pontosElement.className = 'pontos-ranking';
                pontosElement.textContent = `${pontos} pts`;
                
                itemRanking.appendChild(turmaElement);
                itemRanking.appendChild(pontosElement);
                
                turmasDiv.appendChild(itemRanking);
            });
            
            serieDiv.appendChild(turmasDiv);
            rankingGeral.appendChild(serieDiv);
        }
    });
}

// Fechar modais
btnFecharLogin.addEventListener('click', fecharModalLogin);
btnFecharDetalhes.addEventListener('click', fecharModalDetalhes);
fecharSilhuetas.addEventListener('click', fecharModalSilhuetas);

function fecharModalSilhuetas() {
    modalSilhuetas.style.display = 'none';
}

window.addEventListener('click', function(event) {
    if (event.target === modalLogin) {
        fecharModalLogin();
    }
    if (event.target === modalDetalhes) {
        fecharModalDetalhes();
    }
    if (event.target === modalSilhuetas) {
        fecharModalSilhuetas();
    }
});

// Funções auxiliares
function fecharModalLogin() {
    modalLogin.style.display = 'none';
    inputSenha.value = '';
    mensagemErro.textContent = '';
}

function fecharModalDetalhes() {
    modalDetalhes.style.display = 'none';
}

// Enter para confirmar
inputSenha.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btnConfirmar.click();
    }
});

// Verificar se todas as imagens existem
function verificarImagens() {
    perguntasSilhuetas.forEach(pergunta => {
        const img = new Image();
        img.src = pergunta.silhueta;
        img.onerror = () => console.error('Imagem não encontrada:', pergunta.silhueta);
    });
}

// Inicializa o ranking quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    verificarImagens();
    atualizarRanking();
    
    // Inicializa todas as turmas no Firebase com 0 pontos se não existirem
    const rankingRef = database.ref('ranking');
    rankingRef.once('value').then(snapshot => {
        const data = snapshot.val() || {};
        const updates = {};
        
        Object.keys(TURMAS).forEach(turma => {
            if (!data.hasOwnProperty(turma)) {
                updates[turma] = 0;
            }
        });
        
        if (Object.keys(updates).length > 0) {
            rankingRef.update(updates);
        }
    });
});