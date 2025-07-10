// Constantes do jogo (padrão)
const PONTOS_POR_ACERTO_GEO = 50;
const MAX_RODADAS = 10;
const TEMPO_FEEDBACK = 2000;

// Elementos da página
const gameAreaEl = document.getElementById('game-area');
const areaFeedback = document.getElementById('feedback');
const areaOpcoes = document.getElementById('options');
const fecharQuizBtn = document.querySelector('.fechar-quiz');
const rodadaStatusEl = document.getElementById('rodada-status'); 

// Elementos de áudio
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Variáveis de estado do jogo
let turmaAtualQuiz = null;
let score = 0;
let rodadaAtual = 0;
let acertos = 0;

// Variáveis do mapa e dados do jogo
let mapa, dadosPaises = [], paisCorreto, camadaPais;

// Lista de países permitidos e traduções 
const paisesPermitidos = [
    "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt", "France", "Germany",
    "India", "Italy", "Japan", "Mexico", "Russia", "South Africa", "Spain", "United Kingdom",
    "United States of America", "Chile", "Colombia", "Cuba", "Peru", "Venezuela", "Belgium",
    "Croatia", "Denmark", "Finland", "Greece", "Ireland", "Netherlands", "Norway",
    "Poland", "Portugal", "Sweden", "Switzerland", "Turkey", "Afghanistan", "Indonesia",
    "Iran", "Iraq", "Israel", "Kazakhstan", "Myanmar", "New Zealand", "Pakistan",
    "Philippines", "Saudi Arabia", "South Korea", "Thailand", "Vietnam", "Algeria",
    "Angola", "Botswana", "Democratic Republic of the Congo", "Ethiopia", "Kenya",
    "Madagascar", "Morocco", "Mozambique", "Namibia", "Nigeria", "Somalia", "Sudan"
];
const traducoes = {
    "Argentina": "Argentina", "Australia": "Austrália", "Brazil": "Brasil", "Canada": "Canadá", "China": "China",
    "Egypt": "Egito", "France": "França", "Germany": "Alemanha", "India": "Índia", "Italy": "Itália",
    "Japan": "Japão", "Mexico": "México", "Russia": "Rússia", "South Africa": "África do Sul", "Spain": "Espanha",
    "United Kingdom": "Reino Unido", "United States of America": "Estados Unidos", "Chile": "Chile", "Colombia": "Colômbia",
    "Cuba": "Cuba", "Peru": "Peru", "Venezuela": "Venezuela", "Belgium": "Bélgica", "Croatia": "Croácia",
    "Denmark": "Dinamarca", "Finland": "Finlândia", "Greece": "Grécia", "Ireland": "Irlanda", "Netherlands": "Países Baixos",
    "Norway": "Noruega", "Poland": "Polônia", "Portugal": "Portugal", "Sweden": "Suécia", "Switzerland": "Suíça",
    "Turkey": "Turquia", "Afghanistan": "Afeganistão", "Indonesia": "Indonésia", "Iran": "Irã", "Iraq": "Iraque",
    "Israel": "Israel", "Kazakhstan": "Cazaquistão", "Myanmar": "Myanmar", "New Zealand": "Nova Zelândia", "Pakistan": "Paquistão",
    "Philippines": "Filipinas", "Saudi Arabia": "Arábia Saudita", "South Korea": "Coreia do Sul", "Thailand": "Tailândia",
    "Vietnam": "Vietnã", "Algeria": "Argélia", "Angola": "Angola", "Botswana": "Botsuana",
    "Democratic Republic of the Congo": "República Democrática do Congo", "Ethiopia": "Etiópia", "Kenya": "Quênia",
    "Madagascar": "Madagáscar", "Morocco": "Marrocos", "Mozambique": "Moçambique", "Namibia": "Namíbia",
    "Nigeria": "Nigéria", "Somalia": "Somália", "Sudan": "Sudão"
};
const traduzir = nome => traducoes[nome] || nome;

// Função padrão para verificar estado do som
function isSomAtivado() {
    const savedSomState = localStorage.getItem('somAtivado');
    return savedSomState !== null ? JSON.parse(savedSomState) : true;
}

// Função para embaralhar um array (Fisher-Yates shuffle)
const embaralhar = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function iniciarJogoGeo() {
    // Garante que a área do jogo e o status da rodada estejam visíveis
    gameAreaEl.style.display = 'block';
    rodadaStatusEl.style.display = 'block'; 

    // Zera o estado do jogo
    score = 0;
    rodadaAtual = 0;
    acertos = 0;
    
    // Mostra mensagem de carregamento enquanto busca os dados
    areaFeedback.textContent = "Carregando dados do mapa...";
    rodadaStatusEl.textContent = ''; // Limpa o status da rodada

    // Carrega os dados dos países se ainda não foram carregados
    if (dadosPaises.length === 0) {
        fetch('countries.geo.json')
            .then(resposta => {
                if (!resposta.ok) { // Verifica se a resposta do servidor foi bem-sucedida
                    throw new Error(`Erro na rede: ${resposta.statusText}`);
                }
                return resposta.json();
            })
            .then(dados => {
                dadosPaises = dados.features.filter(f => paisesPermitidos.includes(f.properties.name));
                inicializarMapa();
                novaRodada();
            })
            // Tratamento de erro robusto
            .catch(erro => {
                console.error("Erro fatal ao carregar o GeoJSON:", erro);
                gameAreaEl.innerHTML = `
                    <p style="color: #dc3545; text-align: center; font-weight: bold; font-size: 1.1rem;">
                        <i class="fas fa-exclamation-triangle"></i> Falha ao carregar os dados do mapa.
                    </p>
                    <p style="text-align: center;">Por favor, verifique sua conexão com a internet e <strong>recarregue a página</strong>.</p>
                `;
                rodadaStatusEl.style.display = 'none'; // Esconde o status em caso de erro
            });
    } else {
        novaRodada();
    }
}

function inicializarMapa() {
    if (mapa) return;
    mapa = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,            
        scrollWheelZoom: false,     
        doubleClickZoom: false,     
        boxZoom: false,             
        touchZoom: false,           
        keyboard: false,
        tap: false                  
    });
}

function novaRodada() {
    rodadaAtual++;
    if (rodadaAtual > MAX_RODADAS) {
        finalizarJogo();
        return;
    }
    
    rodadaStatusEl.textContent = `Rodada ${rodadaAtual}/${MAX_RODADAS}`;

    if (camadaPais) {
        mapa.removeLayer(camadaPais);
    }
    areaFeedback.textContent = '';
    areaOpcoes.innerHTML = '';
    
    paisCorreto = dadosPaises[Math.floor(Math.random() * dadosPaises.length)];
    console.log(`Rodada ${rodadaAtual}: País correto é ${traduzir(paisCorreto.properties.name)}`)
    const opcoes = [paisCorreto];
    while (opcoes.length < 4) {
        const candidato = dadosPaises[Math.floor(Math.random() * dadosPaises.length)];
        if (!opcoes.includes(candidato)) opcoes.push(candidato);
    }
    
    embaralhar(opcoes).forEach(pais => {
        const botao = document.createElement('button');
        botao.className = 'opcao-btn';
        botao.textContent = traduzir(pais.properties.name);
        botao.onclick = () => verificarResposta(pais, botao);
        areaOpcoes.appendChild(botao);
    });

    camadaPais = L.geoJSON(paisCorreto, {
        interactive: false,
        style: { color: '#333', weight: 2, fillColor: '#4CAF50', fillOpacity: 0.8 }
    }).addTo(mapa);
    mapa.fitBounds(camadaPais.getBounds().pad(0.1));
}

function verificarResposta(paisEscolhido, botaoClicado) {
    document.querySelectorAll('.opcao-btn').forEach(botao => {
        botao.disabled = true;
        if (botao.textContent === traduzir(paisCorreto.properties.name)) {
            botao.classList.add('correta');
        }
    });

    if (paisEscolhido === paisCorreto) {
        acertos++;
        score += PONTOS_POR_ACERTO_GEO;
        areaFeedback.textContent = 'Correto!';
        areaFeedback.style.color = '#28a745';
        if (isSomAtivado() && somAcerto) {
            somAcerto.currentTime = 0;
            somAcerto.play();
        }
    } else {
        botaoClicado.classList.add('incorreta');
        areaFeedback.innerHTML = `Errado! O país era <strong>${traduzir(paisCorreto.properties.name)}</strong>.`;
        areaFeedback.style.color = '#dc3545';
        if (isSomAtivado() && somErro) {
            somErro.currentTime = 0;
            somErro.play();
        }
    }
    
    setTimeout(novaRodada, TEMPO_FEEDBACK);
}

function finalizarJogo() {
    // Esconde a área do jogo e o status da rodada
    gameAreaEl.style.display = 'none';
    rodadaStatusEl.style.display = 'none'; // NOVO

    if (turmaAtualQuiz) {
        const pontosRef = database.ref('ranking/' + turmaAtualQuiz);
        pontosRef.transaction((currentPontos) => {
            return (currentPontos || 0) + score;
        }).then(() => {
            console.log(`Pontuação da turma ${turmaAtualQuiz} atualizada com mais ${score} pontos.`);
        }).catch(error => {
            console.error("Erro ao atualizar pontuação no Firebase:", error);
        });
    }

    const modalFinal = document.createElement('div');
    modalFinal.className = 'modal-final-container';
    modalFinal.innerHTML = `
        <div class="modal-final-conteudo">
            <h1 class="titulo-final"><i class="fas fa-trophy"></i> Jogo Concluído!</h1>
            <div class="resultado-final">
                <div class="pontuacao-final">${score}</div>
                <p class="mensagem-final">Pontos conquistados para a Turma ${turmaAtualQuiz || 'desconhecida'}!</p>
                <div class="detalhes-pontuacao">
                    <p><i class="fas fa-check-circle"></i> Acertos: ${acertos}/${MAX_RODADAS}</p>
                    <p><i class="fas fa-star"></i> Pontos: ${score}</p>
                </div>
                <p class="mensagem-ranking">Verifique o ranking e veja onde sua turma está!</p>
                <div class="botoes-final">
                    <button id="btn-ver-ranking-final-geo" class="btn-final">
                        <i class="fas fa-trophy"></i> Ver Ranking
                    </button>
                    <button id="btn-voltar-inicio-geo" class="btn-final">
                        <i class="fas fa-home"></i> Voltar ao Início
                    </button>
                    <button id="btn-jogar-novamente-geo" class="btn-final destaque">
                        <i class="fas fa-redo"></i> Jogar Novamente
                    </button>
                </div>
                <p class="dica-final">Quanto mais você jogar, mais pontos sua turma ganhará!</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalFinal);
    document.body.classList.add('modal-aberto');

    document.getElementById('btn-jogar-novamente-geo').addEventListener('click', () => {
        modalFinal.remove();
        document.body.classList.remove('modal-aberto');
        iniciarJogoGeo();
    });
    document.getElementById('btn-voltar-inicio-geo').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('btn-ver-ranking-final-geo').addEventListener('click', () => {
        localStorage.setItem('abrirRankingAoCarregar', 'true');
        window.location.href = 'index.html';
    });
}

// Event listener para o botão de fechar
fecharQuizBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    turmaAtualQuiz = localStorage.getItem('turmaAtual');
    if (!turmaAtualQuiz) {
        alert('Nenhuma turma selecionada. Por favor, selecione uma turma na página inicial.');
        window.location.href = 'index.html';
        return;
    }
    iniciarJogoGeo();
});