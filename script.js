// Constantes do jogo
const TEMPO_CARREGAMENTO = 150; // Tempo para carregar a silhueta
const TEMPO_ESPERA_RESPOSTA = 1500; // Tempo para exibir feedback da resposta antes de ir para a próxima pergunta
const PONTOS_POR_ACERTO = 50; // Pontuação padronizada para 50 pontos

// Variáveis dos modais
const modalLogin = document.getElementById('modal-login');
const modalDetalhes = document.getElementById('modal-detalhes');
const modalSilhuetas = document.getElementById('modal-silhuetas');
const modalSelecaoTurma = document.getElementById('modal-selecao-turma');
const modalRanking = document.getElementById('modal-ranking'); // Novo modal de ranking

// Botões de fechar modais
const btnFecharLogin = document.querySelector('#modal-login .fechar-modal');
const btnFecharDetalhes = document.querySelector('#modal-detalhes .fechar-modal');
const fecharSilhuetas = document.querySelector('#modal-silhuetas .fechar-jogo');
const btnFecharSelecaoTurma = document.querySelector('#modal-selecao-turma .fechar-modal');
const btnFecharRanking = document.querySelector('#modal-ranking .fechar-modal'); // Botão fechar ranking

// Elementos do modal de login
const btnConfirmar = document.getElementById('btn-confirmar');
const inputSenha = document.getElementById('senha-jogo');
const mensagemErroSenha = document.getElementById('mensagem-erro-senha'); // Mensagem de erro específica para senha
const instrucaoSenha = document.getElementById('instrucao-senha');
const turmaSelecionadaNome = document.getElementById('turma-selecionada-nome');

// Elementos do modal de detalhes
const tituloDetalhes = document.getElementById('titulo-detalhes');
const conteudoDetalhes = document.getElementById('conteudo-detalhes');

// Elementos do jogo das silhuetas
const silhuetaImagem = document.getElementById('silhueta-imagem');
const mensagemCarregando = document.getElementById('mensagem-carregando');
const opcoesContainer = document.getElementById('opcoes-container');
const pontuacaoElement = document.getElementById('pontuacao');
const acertosElement = document.getElementById('acertos');
const totalPerguntasElement = document.getElementById('total-perguntas');

// Elementos do modal de seleção de turma
const nomeJogoSelecao = document.getElementById('nome-jogo-selecao');
const turmasContainerSelecao = document.getElementById('turmas-container-selecao');
const mensagemErroSelecao = document.getElementById('mensagem-erro-selecao');

// Elementos do modal de ranking
const rankingGeralModal = document.getElementById('ranking-geral-modal'); // Container do ranking dentro do modal

// Elementos de áudio
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// NOVO: Elemento do botão de controle de som
const btnToggleSom = document.getElementById('btn-toggle-som');

// Variáveis de estado do jogo e ranking
let jogoSelecionado = null; // ID do jogo que o usuário quer jogar
let turmaAtual = null; // Turma logada atualmente
let turmaTemporaria = null; // Turma selecionada no modal de seleção antes de digitar a senha
let rankingRef; // Referência ao nó 'ranking' no Firebase
let modalFinalInstance = null; // Variável para armazenar a instância do modal final

// NOVO: Variável de estado para o som (true = ligado, false = desligado)
let somAtivado = true; 

// Mapeamento de faixas etárias para turmas - ALTERADO
const FAIXAS_ETARIAS = {
    'fundamental-i': ['1º','2º','3º'],
    'fundamental-ii-parte1': ['4º','5º','6º'],
    'fundamental-ii-parte2': ['7º','8º','9º'],
    'ensino-medio': ['1º 101','1º 102','2º 201','3º 301']
};

// Lista de todas as turmas com suas senhas - ALTERADO (mantendo as senhas existentes para as turmas listadas)
const TURMAS = {
    '1º': 'turma1681',
    '2º': 'turma2681',
    '3º': 'turma3681',
    '4º': 'turma4681',
    '5º': 'turma5681',
    '6º': 'turma6681',
    '7º': 'turma7681',
    '8º': 'turma8681',
    '9º': 'turma9681',
    '1º 101': 'turma101681', 
    '1º 102': 'turma102681',
    '2º 201': 'turma201681',
    '3º 301': 'turma301681',
};

// Dados dos jogos (descrição, instruções, dicas)
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
            'Cada acerto vale 50 pontos' // Pontuação padronizada
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
            'Cada acerto vale 50 pontos' // Pontuação padronizada
        ],
        dicas: [
            'Pense cuidadosamente antes de responder'
        ]
    }
};

// Perguntas do jogo das silhuetas (Máximo de 10 questões)
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
    },
    {
        silhueta: 'imagens/frozen.png',
        opcoes: ['AnnaBelle', 'Olaf', 'Frozen', 'Pinóquio'],
        resposta: 2
    },
    {
        silhueta: 'imagens/roblox.png',
        opcoes: ['Roblox', 'Brawl stars', 'Pokemom', 'Pou'],
        resposta: 0
    }
    // A questão 'freefire.png' foi removida para manter o máximo de 10 questões.
];

// --- Funções de Abertura e Fechamento de Modais ---

function abrirModal(modalElement) {
    modalElement.style.display = 'flex'; // Usa flex para centralizar
    // Adiciona classe para desfoque do fundo se necessário (estilo no CSS)
    document.body.classList.add('modal-aberto'); 
}

function fecharModal(modalElement) {
    modalElement.style.display = 'none';
    document.body.classList.remove('modal-aberto');
    // Limpa mensagens de erro e campos de input ao fechar
    if (modalElement === modalLogin) {
        inputSenha.value = '';
        mensagemErroSenha.textContent = '';
    } else if (modalElement === modalSelecaoTurma) {
        mensagemErroSelecao.textContent = '';
    }
}

// --- Event Listeners para Fechar Modais ---
btnFecharLogin.addEventListener('click', () => fecharModal(modalLogin));
btnFecharDetalhes.addEventListener('click', () => fecharModal(modalDetalhes));
fecharSilhuetas.addEventListener('click', () => fecharModal(modalSilhuetas));
btnFecharSelecaoTurma.addEventListener('click', () => fecharModal(modalSelecaoTurma));
btnFecharRanking.addEventListener('click', () => fecharModal(modalRanking));

// Fecha modais ao clicar fora deles
window.addEventListener('click', function(event) {
    if (event.target === modalLogin) fecharModal(modalLogin);
    if (event.target === modalDetalhes) fecharModal(modalDetalhes);
    if (event.target === modalSilhuetas) fecharModal(modalSilhuetas);
    if (event.target === modalSelecaoTurma) fecharModal(modalSelecaoTurma);
    if (event.target === modalRanking) fecharModal(modalRanking);
    // Adicionado para fechar o modal final ao clicar fora
    if (event.target.classList.contains('modal-final-container')) {
        fecharModalFinal();
    }
});

// --- Funções de Detalhes do Jogo ---

// Função para abrir o modal de detalhes de um jogo
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
    abrirModal(modalDetalhes);
}

// Configuração dos eventos dos cards de jogo (para abrir detalhes ao clicar no card, exceto no botão "Jogar")
const cardsJogo = document.querySelectorAll('.jogo-card');
cardsJogo.forEach(card => {
    card.addEventListener('click', function(e) {
        if (e.target.closest('.btn-jogar')) {
            return;
        }
        abrirDetalhes(this.id);
    });
});

// --- Funções de Seleção de Turma e Login ---

// Configuração dos eventos dos botões "Jogar" (para abrir o modal de seleção de turma)
const botoesJogar = document.querySelectorAll('.btn-jogar');
botoesJogar.forEach(botao => {
    botao.addEventListener('click', function(e) {
        e.stopPropagation(); 
        
        jogoSelecionado = this.getAttribute('data-jogo'); 
        const faixaEtaria = this.getAttribute('data-faixa');
        const nomeDoJogo = this.closest('.jogo-card').querySelector('h3').textContent;
        
        nomeJogoSelecao.textContent = nomeDoJogo; // Atualiza o nome do jogo no modal de seleção
        carregarTurmasParaSelecao(faixaEtaria); // Carrega as turmas relevantes
        abrirModal(modalSelecaoTurma); // Abre o modal de seleção de turma
    });
});

// Carrega as turmas no modal de seleção de turma com base na faixa etária
function carregarTurmasParaSelecao(faixaEtaria) {
    turmasContainerSelecao.innerHTML = ''; // Limpa as turmas anteriores
    mensagemErroSelecao.textContent = ''; // Limpa mensagens de erro

    const turmasDaFaixa = FAIXAS_ETARIAS[faixaEtaria];

    if (!turmasDaFaixa || turmasDaFaixa.length === 0) {
        mensagemErroSelecao.textContent = 'Nenhuma turma encontrada para esta faixa etária.';
        return;
    }

    turmasDaFaixa.forEach(turma => {
        const itemTurma = document.createElement('div');
        itemTurma.className = 'item-ranking'; // Reutiliza o estilo do item de ranking
        itemTurma.textContent = turma;
        itemTurma.dataset.turma = turma; // Armazena o nome da turma no dataset

        itemTurma.addEventListener('click', () => selecionarTurma(turma));
        turmasContainerSelecao.appendChild(itemTurma);
    });
}

// Função chamada ao selecionar uma turma no modal de seleção
function selecionarTurma(turma) {
    turmaTemporaria = turma; // Armazena a turma selecionada temporariamente
    fecharModal(modalSelecaoTurma); // Fecha o modal de seleção
    
    turmaSelecionadaNome.textContent = turma; // Atualiza o nome da turma no modal de senha
    instrucaoSenha.textContent = `Digite a senha da turma ${turma}:`;
    abrirModal(modalLogin); // Abre o modal de login para a senha
    inputSenha.value = '';
    inputSenha.focus();
}

// Evento para confirmar a senha no modal de login
btnConfirmar.addEventListener('click', function() {
    const senhaDigitada = inputSenha.value.trim();
    
    if (turmaTemporaria && TURMAS[turmaTemporaria] === senhaDigitada) {
        turmaAtual = turmaTemporaria; // Define a turma atual como a turma logada
        mensagemErroSenha.textContent = '';
        fecharModal(modalLogin);
        
        // Inicia o jogo selecionado
        if (jogoSelecionado === 'silhuetas') {
            iniciarJogoSilhuetas();
        } else if (jogoSelecionado === 'quiz-facil') {
            // Redireciona para a página do quiz fácil
            localStorage.setItem('turmaAtual', turmaAtual); // Salva a turma para o quiz
            window.location.href = 'quiz-facil.html';
        } else if (jogoSelecionado === 'quiz-medio') { // NOVO: Lógica para Quiz Médio
            localStorage.setItem('turmaAtual', turmaAtual);
            window.location.href = 'quiz-medio.html';
        } else if (jogoSelecionado === 'quiz-dificil') { // NOVO: Lógica para Quiz Difícil
            localStorage.setItem('turmaAtual', turmaAtual);
            // Você precisará criar quiz-dificil.html e quiz-dificil.js
            window.location.href = 'quiz-dificil.html'; 
        }
        else {
            alert(`Senha correta! Redirecionando para o ${detalhesJogos[jogoSelecionado].titulo}...`);
            // Se houver outros jogos que não sejam quizzes ou silhuetas, adicione a lógica aqui.
            // Por exemplo: iniciarOutroJogo(jogoSelecionado);
        }
    } else {
        mensagemErroSenha.textContent = 'Senha incorreta! Tente novamente.';
        inputSenha.value = '';
        inputSenha.focus();
        // CORREÇÃO: Toca o som de erro apenas se o som estiver ativado
        if (somAtivado && somErro) {
            somErro.currentTime = 0; // Reinicia o áudio
            somErro.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
    }
});

// Permite confirmar a senha pressionando Enter no campo de senha
inputSenha.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btnConfirmar.click();
    }
});

// --- Funções do Jogo das Silhuetas ---
let perguntaAtual = 0;
let pontuacao = 0;
let acertos = 0;

// Função para fechar o modal final
function fecharModalFinal() {
    if (modalFinalInstance) {
        modalFinalInstance.remove(); // Remove o modal final do DOM
        modalFinalInstance = null;
        document.body.classList.remove('modal-aberto'); // Remove a classe de desfoque
    }
}

// Inicia o jogo das silhuetas
function iniciarJogoSilhuetas() {
    fecharModalFinal(); // Garante que o modal final esteja fechado antes de iniciar um novo jogo
    perguntaAtual = 0;
    pontuacao = 0;
    acertos = 0;
    
    totalPerguntasElement.textContent = perguntasSilhuetas.length; 
    atualizarPlacar(); 
    
    abrirModal(modalSilhuetas); 
    mostrarPergunta(); 
}

// Mostra a pergunta atual do jogo das silhuetas
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
    mensagemCarregando.textContent = 'Carregando jogo...'; 
    
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

// Verifica a resposta selecionada pelo usuário
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
        
        // CORREÇÃO: Toca o som de acerto apenas se o som estiver ativado
        if (somAtivado && somAcerto) {
            somAcerto.currentTime = 0; // Reinicia o áudio
            somAcerto.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
    } else {
        botoes[respostaIndex].classList.add('incorreta');
        botoes[pergunta.resposta].classList.add('correta'); 
        // CORREÇÃO: Toca o som de erro apenas se o som estiver ativado
        if (somAtivado && somErro) {
            somErro.currentTime = 0; // Reinicia o áudio
            somErro.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
    }
    
    atualizarPlacar();
    
    setTimeout(() => {
        perguntaAtual++;
        mostrarPergunta();
    }, TEMPO_ESPERA_RESPOSTA);
}

// Atualiza os elementos do placar na tela
function atualizarPlacar() {
    pontuacaoElement.textContent = pontuacao;
    acertosElement.textContent = acertos;
}

// Finaliza o jogo e exibe a tela de resultados
function finalizarJogo() {
    // Atualiza a pontuação no Firebase
    if (turmaAtual) {
        const pontosRef = database.ref('ranking/' + turmaAtual);
        pontosRef.transaction((currentPontos) => {
            return (currentPontos || 0) + pontuacao; 
        });
    }

    // Fecha o modal do jogo das silhuetas
    fecharModal(modalSilhuetas);

    // Cria o modal final
    modalFinalInstance = document.createElement('div');
    modalFinalInstance.className = 'modal-final-container';
    modalFinalInstance.innerHTML = `
        <div class="modal-final-conteudo">
            <h1 class="titulo-final"><i class="fas fa-trophy"></i> Jogo Concluído!</h1>
            
            <div class="resultado-final">
                <div class="pontuacao-final">${pontuacao}</div>
                <p class="mensagem-final">Pontos conquistados para a Turma ${turmaAtual || 'desconhecida'}!</p>
                
                <div class="detalhes-pontuacao">
                    <p><i class="fas fa-check-circle"></i> Acertos: ${acertos}/${perguntasSilhuetas.length}</p>
                    <p><i class="fas fa-star"></i> Pontos: ${pontuacao}</p>
                </div>
                
                <p class="mensagem-ranking">Verifique o ranking e veja onde sua turma está!</p>
                
                <div class="botoes-final">
                    <button id="btn-ver-ranking-final" class="btn-final">
                        <i class="fas fa-trophy"></i> Ver Ranking
                    </button>
                    <button id="btn-jogar-novamente" class="btn-final destaque">
                        <i class="fas fa-redo"></i> Jogar Novamente
                    </button>
                </div>
                
                <p class="dica-final">Quanto mais você jogar, mais pontos sua turma ganhará!</p>
            </div>
        </div>
    `;
    
    // Adiciona o modal final diretamente ao body
    document.body.appendChild(modalFinalInstance);
    document.body.classList.add('modal-aberto'); // Adiciona a classe para desfoque do fundo

    // Adiciona eventos aos botões da tela final
    document.getElementById('btn-jogar-novamente').addEventListener('click', iniciarJogoSilhuetas);
    document.getElementById('btn-ver-ranking-final').addEventListener('click', () => {
        fecharModalFinal(); // Fecha o modal final
        abrirModal(modalRanking); // Abre o modal de ranking
        atualizarRankingModal(); // Garante que o ranking esteja atualizado
    });
}

// --- Funções de Ranking ---

// Event listener para abrir o modal de ranking pelo menu de navegação
document.getElementById('abrir-ranking-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    abrirModal(modalRanking);
    atualizarRankingModal(); // Garante que o ranking esteja atualizado ao abrir
});

// Função para criar e atualizar o ranking dinamicamente dentro do modal
function atualizarRankingModal() {
    rankingRef = database.ref('ranking'); 
    rankingRef.on('value', (snapshot) => { 
        const data = snapshot.val() || {}; 
        
        // Garante que todas as turmas existam no ranking com pelo menos 0 pontos
        Object.keys(TURMAS).forEach(turma => {
            if (!data.hasOwnProperty(turma)) {
                data[turma] = 0; 
            }
        });
        
        // Define as séries e suas respectivas turmas
        const series = {
            'Fundamental I': FAIXAS_ETARIAS['fundamental-i'],
            'Fundamental II': [...FAIXAS_ETARIAS['fundamental-ii-parte1'], ...FAIXAS_ETARIAS['fundamental-ii-parte2']],
            'Ensino Médio': FAIXAS_ETARIAS['ensino-medio']
        };
        
        // Limpa o conteúdo atual do ranking
        rankingGeralModal.innerHTML = '';
        
        // Cria os menus de ranking por série
        for (const [serie, turmasSerie] of Object.entries(series)) {
            const serieDiv = document.createElement('div');
            serieDiv.className = 'ranking-serie';
            
            const serieTitle = document.createElement('h3');
            serieTitle.textContent = serie;
            serieTitle.className = 'serie-title';
            serieDiv.appendChild(serieTitle);
            
            const turmasDiv = document.createElement('div');
            turmasDiv.className = 'turmas-container-modal'; // Usa o container de turmas para modais
            
            // Coleta as turmas da série com suas pontuações e as ordena
            const turmasComPontuacao = turmasSerie.map(turma => ({
                nome: turma,
                pontos: data[turma] || 0
            }));

            // Ordena as turmas por pontuação (do maior para o menor)
            turmasComPontuacao.sort((a, b) => b.pontos - a.pontos);

            // Adiciona as turmas da série ao container
            turmasComPontuacao.forEach(turmaData => { // Alterado para usar turmaData
                const itemRanking = document.createElement('div');
                itemRanking.className = 'item-ranking';
                if (turmaData.nome === turmaAtual) { // Alterado para turmaData.nome
                    itemRanking.classList.add('turma-atual');
                }
                
                const turmaElement = document.createElement('div');
                turmaElement.className = 'turma-ranking';
                turmaElement.textContent = turmaData.nome; // Alterado para turmaData.nome
                
                const pontosElement = document.createElement('div');
                pontosElement.className = 'pontos-ranking';
                pontosElement.textContent = `${turmaData.pontos} pts`; // Alterado para turmaData.pontos
                
                itemRanking.appendChild(turmaElement);
                itemRanking.appendChild(pontosElement);
                
                turmasDiv.appendChild(itemRanking);
            });
            
            serieDiv.appendChild(turmasDiv);
            rankingGeralModal.appendChild(serieDiv);
        }
    });
}

// --- Funções de Controle de Som ---
function toggleSom() {
    somAtivado = !somAtivado; // Inverte o estado do som
    if (somAtivado) {
        btnToggleSom.innerHTML = '<i class="fas fa-volume-up"></i> Som: Ligado';
        // Opcional: Tocar um som de confirmação ao ligar
        if (somAcerto) {
            somAcerto.currentTime = 0;
            somAcerto.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
    } else {
        btnToggleSom.innerHTML = '<i class="fas fa-volume-mute"></i> Som: Desligado';
        // Pausar qualquer som que esteja tocando
        if (somAcerto) somAcerto.pause();
        if (somErro) somErro.pause();
    }
    // Armazenar a preferência do usuário (opcional, mas recomendado)
    localStorage.setItem('somAtivado', somAtivado);
}

// --- Otimizações e Inicialização ---

// Função para verificar se os caminhos das imagens das silhuetas estão corretos
function verificarImagens() {
    perguntasSilhuetas.forEach(pergunta => {
        const img = new Image();
        img.src = pergunta.silhueta;
        img.onerror = () => console.error('Erro: Imagem não encontrada ou caminho incorreto:', pergunta.silhueta);
    });
}

// Inicializa o ranking e verifica imagens quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    verificarImagens(); 
    
    // Carrega a preferência de som do usuário ou define como ativado por padrão
    const savedSomState = localStorage.getItem('somAtivado');
    if (savedSomState !== null) {
        somAtivado = JSON.parse(savedSomState);
    }
    // Atualiza o texto do botão de som com base no estado inicial
    btnToggleSom.innerHTML = somAtivado ? '<i class="fas fa-volume-up"></i> Som: Ligado' : '<i class="fas fa-volume-mute"></i> Som: Desligado';

    // Adiciona o event listener para o botão de toggle de som
    btnToggleSom.addEventListener('click', toggleSom);

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

    // NOVO: Verifica se deve abrir o ranking ao carregar a página
    const abrirRanking = localStorage.getItem('abrirRankingAoCarregar');
    if (abrirRanking === 'true') {
        localStorage.removeItem('abrirRankingAoCarregar'); // Remove a flag
        abrirModal(modalRanking);
        atualizarRankingModal();
    }
});
