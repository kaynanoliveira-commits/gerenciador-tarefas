// Dados globais
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let eventos = JSON.parse(localStorage.getItem('eventos')) || [];
let anotacoes = JSON.parse(localStorage.getItem('anotacoes')) || [];

let proximoIdTarefa = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 1;
let proximoIdEvento = eventos.length > 0 ? Math.max(...eventos.map(e => e.id)) + 1 : 1;
let proximoIdAnotacao = anotacoes.length > 0 ? Math.max(...anotacoes.map(a => a.id)) + 1 : 1;

// Função para escapar HTML (previne XSS)
function escapeHTML(str) {
    return String(str === null || str === undefined ? "" : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Melhor formatação de data (fallback para formato já existente)
function formatarData(data) {
    if (!data) return "Sem prazo";
    try {
        const dt = new Date(data + "T00:00:00"); // força timezone neutro
        return dt.toLocaleDateString("pt-BR");
    } catch (e) {
        const partes = data.split("-");
        return partes[2] + "/" + partes[1] + "/" + partes[0];
    }
}

// Atualizar tarefas usando escapeHTML
function atualizarTarefas() {
    const lista = document.getElementById("listaTarefas");

    if (tarefas.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhuma tarefa cadastrada.</div>';
        return;
    }

    lista.innerHTML = tarefas.map(function(tarefa) {
        const nome = escapeHTML(tarefa.nome);
        const materia = escapeHTML(tarefa.materia || "Sem matéria");
        const prioridade = escapeHTML(tarefa.prioridade);
        const dataFormatada = formatarData(tarefa.data);

        return `
            <div class="item">
                <input
                    type="checkbox"
                    ${tarefa.concluida ? "checked" : ""}
                    onchange="concluirTarefa(${tarefa.id})"
                >
                <div class="item-conteudo ${tarefa.concluida ? "concluida" : ""}">
                    <span class="badge">${prioridade}</span>
                    <br>
                    <strong>${nome}</strong>
                    <br>
                    <span class="subtitulo">
                        ${materia} • ${dataFormatada}
                    </span>
                </div>
                <button class="excluir" onclick="excluirTarefa(${tarefa.id})" type="button">
                    Excluir
                </button>
            </div>
        `;
    }).join("");
}

// Atualizar eventos usando escapeHTML
function atualizarEventos() {
    const lista = document.getElementById("listaEventos");

    if (eventos.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhum evento cadastrado.</div>';
        return;
    }

    lista.innerHTML = eventos
        .slice()
        .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
        .map(evento => {
            const nome = escapeHTML(evento.nome);
            const tipo = escapeHTML(evento.tipo);
            const dataFormatada = formatarData(evento.data);

            return `
                <div class="item">
                    <div class="item-conteudo">
                        <span class="badge">${tipo}</span>
                        <br>
                        <strong>${nome}</strong>
                        <br>
                        <span class="subtitulo">📅 ${dataFormatada}</span>
                    </div>
                    <button class="excluir" onclick="excluirEvento(${evento.id})" type="button">Excluir</button>
                </div>
            `;
        }).join("");
}

// Atualizar anotações usando escapeHTML
function atualizarAnotacoes() {
    const lista = document.getElementById("listaAnotacoes");

    if (anotacoes.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhuma anotação salva.</div>';
        return;
    }

    lista.innerHTML = anotacoes
        .slice()
        .reverse()
        .map(anotacao => {
            const materia = escapeHTML(anotacao.materia || "Geral");
            const texto = escapeHTML(anotacao.texto);

            return `
                <div class="item">
                    <div class="item-conteudo">
                        <span class="badge">${materia}</span>
                        <p>${texto}</p>
                    </div>
                    <button class="excluir" onclick="excluirAnotacao(${anotacao.id})" type="button">Excluir</button>
                </div>
            `;
        }).join("");
}

// Adicionar tarefa
function adicionarTarefa() {
    const nome = document.getElementById("inputTarefa").value.trim();
    const materia = document.getElementById("selectMateria").value;
    const prioridade = document.getElementById("selectPrioridade").value;
    const data = document.getElementById("inputDataTarefa").value;

    if (!nome) {
        alert("Digite o nome da tarefa!");
        return;
    }

    tarefas.push({
        id: proximoIdTarefa++,
        nome: nome,
        materia: materia,
        prioridade: prioridade,
        data: data,
        concluida: false
    });

    salvarDados();
    document.getElementById("inputTarefa").value = "";
    document.getElementById("inputDataTarefa").value = "";
    atualizarTarefas();
}

// Concluir tarefa
function concluirTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarDados();
        atualizarTarefas();
    }
}

// Excluir tarefa
function excluirTarefa(id) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        tarefas = tarefas.filter(t => t.id !== id);
        salvarDados();
        atualizarTarefas();
    }
}

// Adicionar evento
function adicionarEvento() {
    const nome = document.getElementById("inputEvento").value.trim();
    const tipo = document.getElementById("selectTipoEvento").value;
    const data = document.getElementById("inputDataEvento").value;

    if (!nome) {
        alert("Digite o nome do evento!");
        return;
    }

    eventos.push({
        id: proximoIdEvento++,
        nome: nome,
        tipo: tipo,
        data: data
    });

    salvarDados();
    document.getElementById("inputEvento").value = "";
    document.getElementById("inputDataEvento").value = "";
    atualizarEventos();
}

// Excluir evento
function excluirEvento(id) {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
        eventos = eventos.filter(e => e.id !== id);
        salvarDados();
        atualizarEventos();
    }
}

// Adicionar anotação
function adicionarAnotacao() {
    const materia = document.getElementById("selectMateriaAnotacao").value;
    const texto = document.getElementById("inputAnotacao").value.trim();

    if (!texto) {
        alert("Digite sua anotação!");
        return;
    }

    anotacoes.push({
        id: proximoIdAnotacao++,
        materia: materia,
        texto: texto
    });

    salvarDados();
    document.getElementById("inputAnotacao").value = "";
    atualizarAnotacoes();
}

// Excluir anotação
function excluirAnotacao(id) {
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
        anotacoes = anotacoes.filter(a => a.id !== id);
        salvarDados();
        atualizarAnotacoes();
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    localStorage.setItem('eventos', JSON.stringify(eventos));
    localStorage.setItem('anotacoes', JSON.stringify(anotacoes));
}

// Sistema de abas
document.querySelectorAll('.btn-aba').forEach(btn => {
    btn.addEventListener('click', function() {
        const abaAtiva = this.dataset.aba;
        
        // Remove classe ativa de todos os botões
        document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('ativo'));
        // Remove classe ativa de todas as seções
        document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativa'));
        
        // Adiciona classe ativa ao botão clicado
        this.classList.add('ativo');
        // Adiciona classe ativa à seção correspondente
        document.getElementById(abaAtiva).classList.add('ativa');
    });
});

// Enter para adicionar
document.getElementById('inputTarefa')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') adicionarTarefa();
});

document.getElementById('inputEvento')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') adicionarEvento();
});

document.getElementById('inputAnotacao')?.addEventListener('keypress', e => {
    if (e.key === 'Enter' && e.ctrlKey) adicionarAnotacao();
});

// Inicializar
atualizarTarefas();
atualizarEventos();
atualizarAnotacoes();