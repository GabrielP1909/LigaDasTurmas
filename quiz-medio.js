// Constantes do jogo
const PONTOS_POR_ACERTO_QUIZ_MEDIO = 75; // Pontuação para o quiz médio

// Elementos do quiz
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const fecharQuizBtn = document.querySelector('.fechar-quiz'); // Botão de fechar o quiz

// Elementos de áudio
const somAcerto = document.getElementById('som-acerto');
const somErro = document.getElementById('som-erro');

// Variáveis de estado do quiz
let currentQuestionIndex = 0; // Renomeado para evitar conflito com 'currentQuestion' no loop
let score = 0;
let correctAnswersCount = 0; // Nova variável para contar acertos
let turmaAtualQuiz = null; // Para armazenar a turma logada

// Perguntas do Quiz Médio
const questions = [
  {
    question: "Qual o nome do processo pelo qual as plantas produzem seu próprio alimento?",
    options: ["A) Respiração", "B) Fotossíntese", "C) Transpiração", "D) Polinização"],
    answer: 1
  },
  {
    question: "Quem escreveu a obra 'Dom Quixote'?",
    options: ["A) William Shakespeare", "B) Miguel de Cervantes", "C) Gabriel García Márquez", "D) Victor Hugo"],
    answer: 1
  },
  {
    question: "Qual é o elemento químico mais abundante na crosta terrestre?",
    options: ["A) Ferro", "B) Alumínio", "C) Oxigênio", "D) Silício"],
    answer: 2
  },
  {
    question: "Em que ano o homem pisou na Lua pela primeira vez?",
    options: ["A) 1965", "B) 1969", "C) 1971", "D) 1975"],
    answer: 1
  },
  {
    question: "Qual o maior oceano do mundo?",
    options: ["A) Atlântico", "B) Índico", "C) Ártico", "D) Pacífico"],
    answer: 3
  },
  {
    question: "Qual a capital da Austrália?",
    options: ["A) Sydney", "B) Melbourne", "C) Canberra", "D) Perth"],
    answer: 2
  },
  {
    question: "Quantos lados tem um heptágono?",
    options: ["A) 6", "B) 7", "C) 8", "D) 9"],
    answer: 1
  },
  {
    question: "Qual o nome do cientista que formulou a Teoria da Relatividade?",
    options: ["A) Isaac Newton", "B) Stephen Hawking", "C) Albert Einstein", "D) Galileu Galilei"],
    answer: 2
  },
  {
    question: "Qual o metal líquido à temperatura ambiente?",
    options: ["A) Ferro", "B) Mercúrio", "C) Chumbo", "D) Ouro"],
    answer: 1
  },
  {
    question: "Qual o país de origem do sushi?",
    options: ["A) China", "B) Coreia do Sul", "C) Japão", "D) Tailândia"],
    answer: 2
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
  const q = questions[currentQuestionIndex];
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
  const correct = questions[currentQuestionIndex].answer;
  const buttons = document.querySelectorAll(".opcao-btn");

  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
  });

  if (index === correct) {
    feedbackEl.textContent = " ✅ Resposta correta!";
    buttons[index].classList.add('correta'); // Adiciona classe para feedback visual
    score += PONTOS_POR_ACERTO_QUIZ_MEDIO;
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
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
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

    // Exibe o modal final do jogo
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
        currentQuestionIndex = 0;
        score = 0;
        correctAnswersCount = 0; // Resetar acertos
        showQuestion();
    });

    document.getElementById('btn-voltar-inicio').addEventListener('click', () => {
        window.location.href = 'index.html'; // Volta para a página principal
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
