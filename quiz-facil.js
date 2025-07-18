// Constantes do jogo (podem ser as mesmas do script.js principal ou específicas)
const PONTOS_POR_ACERTO_QUIZ = 50; // Pontuação padronizada para 50 pontos

// Elementos do quiz
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const fecharQuizBtn = document.querySelector('.fechar-quiz'); // Botão de fechar o quiz

// Elementos de áudio (se o quiz tiver seus próprios sons ou usar os globais)
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Variáveis de estado do quiz
let currentQuestion = 0;
let score = 0;
let correctAnswersCount = 0; // Nova variável para contar acertos
let turmaAtualQuiz = null; // Para armazenar a turma logada

// Perguntas do Quiz Fácil (Máximo de 10 questões)
const questions = [
  {
    question: "Qual é a capital do Brasil?",
    options: ["A) Rio de Janeiro", "B) Brasília", "C) 8", "D) 9"],
    answer: 1
  },
  {
    question: "Quanto é 5 + 3?",
    options: ["A) 6", "B) 7", "C) 8", "D) 9"],
    answer: 2
  },
  {
    question: "Qual desses animais é um mamífero?",
    options: ["A) Tubarão", "B) Jacaré", "C) Baleia", "D) Galinha"],
    answer: 2
  },
  {
    question: "Quantas patas possui uma aranha?",
    options: ["A) 6", "B) 8", "C) 4", "D) 10"],
    answer: 1
  },
  {
    question: "Quanto é 3 x 4?",
    options: ["A) 12", "B) 9", "C) 7", "D) 16"],
    answer: 0
  },
  {
    question: "Como chamamos alguém que dá aula numa escola?",
    options: ["A) Doutor", "B) Diretor", "C) Professor", "D) Estudante"],
    answer: 2
  },
  {
    question: "Qual nome do acento da palavra 'café'?",
    options: ["A) Acento agudo", "B) Acento grave", "C) Acento circunflexo", "D) Não tem acento"],
    answer: 0
  },
  {
    question: "Qual é o maior planeta do sistema solar?",
    options: ["A) Terra", "B) Marte", "C) Júpiter", "D) Saturno"],
    answer: 2
  },
  {
    question: "Qual desses animais bota ovos?",
    options: ["A) Gato", "B) Cachorro", "C) Cobra", "D) Cavalo"],
    answer: 2
  },
  {
    question: "O que usamos para respirar?",
    options: ["A) Olhos", "B) Pulmões", "C) Estômago", "D) Ouvidos"],
    answer: 1
  }
];

// Função para verificar o estado do som (pode ser global ou local)
function isSomAtivado() {
    const savedSomState = localStorage.getItem('somAtivado');
    return savedSomState !== null ? JSON.parse(savedSomState) : true;
}

function showQuestion() {
  feedbackEl.textContent = "";
  nextBtn.style.display = "none";
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "opcao-btn"; // Usando a classe de botão do seu CSS principal
    btn.onclick = () => checkAnswer(index);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(index) {
  const correct = questions[currentQuestion].answer;
  const buttons = document.querySelectorAll(".opcao-btn");

  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
  });

  if (index === correct) {
    feedbackEl.textContent = " ✅ Resposta correta!";
    buttons[index].classList.add('correta'); // Adiciona classe para feedback visual
    score += PONTOS_POR_ACERTO_QUIZ;
    correctAnswersCount++; // Incrementa o contador de acertos
    if (isSomAtivado() && somAcerto) {
        somAcerto.currentTime = 0;
        somAcerto.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
  } else {
    feedbackEl.textContent = " ❌ Resposta errada!";
    buttons[index].classList.add('incorreta'); // Adiciona classe para feedback visual
    buttons[correct].classList.add('correta'); // Mostra a resposta correta
    if (isSomAtivado() && somErro) {
        somErro.currentTime = 0;
        somErro.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
  }
  nextBtn.style.display = "inline-block";
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    finalizeQuiz();
  }
};

function finalizeQuiz() {
    questionEl.textContent = "Fim do quiz!";
    optionsEl.innerHTML = "";
    feedbackEl.textContent = ""; // Limpa o feedback
    nextBtn.style.display = "none";

    // Atualiza a pontuação no Firebase
    if (turmaAtualQuiz) {
        const pontosRef = database.ref('ranking/' + turmaAtualQuiz);
        pontosRef.transaction((currentPontos) => {
            return (currentPontos || 0) + score; 
        }).then(() => {
            console.log(`Pontuação da turma ${turmaAtualQuiz} atualizada para ${score} pontos.`);
        }).catch(error => {
            console.error("Erro ao atualizar pontuação no Firebase:", error);
        });
    }

    // Exibe o modal final do jogo (reutilizando a estrutura do modal final do jogo de silhuetas)
    const modalFinalQuiz = document.createElement('div');
    modalFinalQuiz.className = 'modal-final-container';
    modalFinalQuiz.innerHTML = `
        <div class="modal-final-conteudo">
            <h1 class="titulo-final"><i class="fas fa-trophy"></i> Quiz Concluído!</h1>
            
            <div class="resultado-final">
                <div class="pontuacao-final">${score}</div>
                <p class="mensagem-final">Pontos conquistados para a Turma ${turmaAtualQuiz || 'desconhecida'}!</p>
                
                <div class="detalhes-pontuacao">
                    <p><i class="fas fa-check-circle"></i> Acertos: ${correctAnswersCount}/${questions.length}</p>
                    <p><i class="fas fa-star"></i> Pontos: ${score}</p>
                </div>
                
                <p class="mensagem-ranking">Verifique o ranking e veja onde sua turma está!</p>
                
                <div class="botoes-final">
                    <button id="btn-ver-ranking-final-quiz" class="btn-final">
                        <i class="fas fa-trophy"></i> Ver Ranking
                    </button>
                    <button id="btn-voltar-inicio" class="btn-final">
                        <i class="fas fa-home"></i> Voltar ao Início
                    </button>
                    <button id="btn-jogar-novamente-quiz" class="btn-final destaque">
                        <i class="fas fa-redo"></i> Jogar Novamente
                    </button>
                </div>
                
                <p class="dica-final">Quanto mais você jogar, mais pontos sua turma ganhará!</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalFinalQuiz);
    document.body.classList.add('modal-aberto');

    document.getElementById('btn-jogar-novamente-quiz').addEventListener('click', () => {
        modalFinalQuiz.remove();
        document.body.classList.remove('modal-aberto');
        currentQuestion = 0;
        score = 0;
        correctAnswersCount = 0; // Resetar acertos
        showQuestion();
    });

    document.getElementById('btn-voltar-inicio').addEventListener('click', () => {
        window.location.href = 'index.html'; // Volta para a página principal
    });

    // NOVO: Event listener para o botão "Ver Ranking"
    document.getElementById('btn-ver-ranking-final-quiz').addEventListener('click', () => {
        // Redireciona para a página principal e abre o modal de ranking
        localStorage.setItem('abrirRankingAoCarregar', 'true'); // Sinaliza para abrir o ranking
        window.location.href = 'index.html';
    });
}

// Event listener para fechar o quiz e voltar para a página principal
fecharQuizBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Inicialização do quiz
document.addEventListener('DOMContentLoaded', function() {
    turmaAtualQuiz = localStorage.getItem('turmaAtual'); // Recupera a turma
    if (!turmaAtualQuiz) {
        alert('Nenhuma turma selecionada. Por favor, selecione uma turma na página inicial.');
        window.location.href = 'index.html'; // Redireciona se não houver turma
        return;
    }
    showQuestion();
});
