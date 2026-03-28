"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type StatusLead =
  | "Novo"
  | "Contato feito"
  | "Qualificado"
  | "Cotação"
  | "Proposta enviada"
  | "Aguardando aprovação"
  | "Aprovado"
  | "Contrato finalizado"
  | "Perdido";

type TemperaturaLead = "Quente" | "Morno" | "Frio";

type TipoProduto =
  | "Seguro de Vida"
  | "Consórcio"
  | "Plano de Saúde"
  | "Previdência Privada"
  | "Outros";

type Lead = {
  id: number;
  nome: string;
  telefone: string;
  cidade: string;
  origem: string;
  tipo: TipoProduto;
  status: StatusLead;
  temperatura: TemperaturaLead;
  valorEstimado: string;
  proximaAcao: string;
  dataProximaAcao: string;
  dataFechamento: string;
  dataRenovacao: string;
  observacoes: string;
  detalhesProduto: string;
  dataCriacao: string;
};

const etapas: StatusLead[] = [
  "Novo",
  "Contato feito",
  "Qualificado",
  "Cotação",
  "Proposta enviada",
  "Aguardando aprovação",
  "Aprovado",
  "Contrato finalizado",
  "Perdido",
];

const tiposProduto: TipoProduto[] = [
  "Seguro de Vida",
  "Consórcio",
  "Plano de Saúde",
  "Previdência Privada",
  "Outros",
];

const leadsIniciais: Lead[] = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "(92) 99999-1111",
    cidade: "Manaus",
    origem: "WhatsApp",
    tipo: "Seguro de Vida",
    status: "Novo",
    temperatura: "Quente",
    valorEstimado: "150",
    proximaAcao: "Ligar para entender necessidade",
    dataProximaAcao: "",
    dataFechamento: "",
    dataRenovacao: "",
    observacoes: "Cliente pediu retorno ainda hoje.",
    detalhesProduto: "Idade: 35, Profissão: Autônomo, Fumante: Não",
    dataCriacao: new Date().toLocaleDateString("pt-BR"),
  },
  {
    id: 2,
    nome: "Maria Souza",
    telefone: "(92) 98888-2222",
    cidade: "Manaus",
    origem: "Instagram",
    tipo: "Plano de Saúde",
    status: "Cotação",
    temperatura: "Morno",
    valorEstimado: "480",
    proximaAcao: "Enviar opções de operadora",
    dataProximaAcao: "",
    dataFechamento: "",
    dataRenovacao: "",
    observacoes: "Está comparando com concorrente.",
    detalhesProduto: "Vidas: 3, CNPJ: Não informado, Já tem plano: Sim",
    dataCriacao: new Date().toLocaleDateString("pt-BR"),
  },
];

function corTemperatura(temperatura: TemperaturaLead) {
  if (temperatura === "Quente") return "#dc2626";
  if (temperatura === "Morno") return "#d97706";
  return "#2563eb";
}

function corStatus(status: StatusLead) {
  if (status === "Contrato finalizado") return "#15803d";
  if (status === "Perdido") return "#6b7280";
  if (status === "Aprovado") return "#0f766e";
  return "#111827";
}

function limparTelefoneParaWhatsapp(telefone: string) {
  return telefone.replace(/\D/g, "");
}

function montarMensagemInteligente(lead: Lead) {
  const primeiroNome = lead.nome.split(" ")[0] || lead.nome;
  const produto = lead.tipo;
  const acao = lead.proximaAcao?.trim();

  if (lead.status === "Novo") {
    return `Olá, ${primeiroNome}! Tudo bem? Aqui é da Fortis. Recebi seu interesse em ${produto} e gostaria de entender melhor sua necessidade para te atender da melhor forma. Podemos falar por aqui?`;
  }

  if (lead.status === "Contato feito") {
    return `Olá, ${primeiroNome}! Passando para dar continuidade no seu atendimento sobre ${produto}. ${acao ? `Minha próxima etapa é: ${acao}.` : ""} Podemos seguir?`;
  }

  if (lead.status === "Qualificado") {
    return `Olá, ${primeiroNome}! Analisei seu perfil para ${produto} e já tenho um direcionamento inicial para você. ${acao ? `Próximo passo: ${acao}.` : ""} Posso te explicar por aqui?`;
  }

  if (lead.status === "Cotação") {
    return `Olá, ${primeiroNome}! Estou dando andamento na sua cotação de ${produto}. ${acao ? `Hoje estou em: ${acao}.` : ""} Assim que você quiser, seguimos com os detalhes.`;
  }

  if (lead.status === "Proposta enviada") {
    return `Olá, ${primeiroNome}! Passando para confirmar se você conseguiu analisar a proposta de ${produto}. Fico à disposição para te explicar qualquer ponto e avançarmos.`;
  }

  if (lead.status === "Aguardando aprovação") {
    return `Olá, ${primeiroNome}! Estou acompanhando sua proposta de ${produto} e queria saber se posso te ajudar a concluir essa etapa. Se quiser, podemos avançar hoje mesmo.`;
  }

  if (lead.status === "Aprovado") {
    return `Olá, ${primeiroNome}! Ótima notícia: seu processo de ${produto} foi aprovado. Agora podemos seguir para a finalização. ${acao ? `Próximo passo: ${acao}.` : ""}`;
  }

  if (lead.status === "Contrato finalizado") {
    return `Olá, ${primeiroNome}! Passando para agradecer pela confiança na Fortis. Seu ${produto} foi finalizado com sucesso. Fico à disposição para suporte, renovação e outros planejamentos futuros.`;
  }

  if (lead.status === "Perdido") {
    return `Olá, ${primeiroNome}! Tudo bem? Estou retomando nosso contato sobre ${produto}. Caso ainda faça sentido para você, posso te apresentar uma nova condição ou opção mais alinhada ao que precisa.`;
  }

  return `Olá, ${primeiroNome}! Tudo bem? Estou entrando em contato sobre seu atendimento de ${produto}. ${acao ? `Próxima etapa: ${acao}.` : ""} Podemos continuar?`;
}

function montarLinkWhatsapp(lead: Lead) {
  const numero = limparTelefoneParaWhatsapp(lead.telefone);
  if (!numero) return "#";

  const numeroComPais = numero.startsWith("55") ? numero : `55${numero}`;
  const mensagem = encodeURIComponent(montarMensagemInteligente(lead));

  return `https://wa.me/${numeroComPais}?text=${mensagem}`;
}

function formatarDataVisual(data: string) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

function classificarFollowUp(dataProximaAcao: string) {
  if (!dataProximaAcao) {
    return {
      label: "Sem data",
      cor: "#6b7280",
      fundo: "#f3f4f6",
      borda: "#d1d5db",
      prioridade: 4,
    };
  }

  const hoje = new Date();
  const hojeSemHora = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  const [ano, mes, dia] = dataProximaAcao.split("-").map(Number);
  const dataLead = new Date(ano, mes - 1, dia);

  const diferencaMs = dataLead.getTime() - hojeSemHora.getTime();
  const diferencaDias = Math.round(diferencaMs / (1000 * 60 * 60 * 24));

  if (diferencaDias < 0) {
    return {
      label: "Atrasado",
      cor: "#b91c1c",
      fundo: "#fee2e2",
      borda: "#ef4444",
      prioridade: 1,
    };
  }

  if (diferencaDias === 0) {
    return {
      label: "Hoje",
      cor: "#b45309",
      fundo: "#fef3c7",
      borda: "#f59e0b",
      prioridade: 2,
    };
  }

  return {
    label: "Próximo",
    cor: "#1d4ed8",
    fundo: "#dbeafe",
    borda: "#60a5fa",
    prioridade: 3,
  };
}

export default function Page() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroTemperatura, setFiltroTemperatura] = useState("Todas");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [leadEditado, setLeadEditado] = useState<Lead | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [origem, setOrigem] = useState("WhatsApp");
  const [tipo, setTipo] = useState<TipoProduto>("Seguro de Vida");
  const [status, setStatus] = useState<StatusLead>("Novo");
  const [temperatura, setTemperatura] = useState<TemperaturaLead>("Morno");
  const [valorEstimado, setValorEstimado] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");
  const [dataProximaAcao, setDataProximaAcao] = useState("");
  const [dataFechamento, setDataFechamento] = useState("");
  const [dataRenovacao, setDataRenovacao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [idade, setIdade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [fumante, setFumante] = useState("Não");

  const [vidas, setVidas] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [jaTemPlano, setJaTemPlano] = useState("Não");

  const [tipoConsorcio, setTipoConsorcio] = useState("Imóvel");
  const [valorConsorcio, setValorConsorcio] = useState("");
  const [entrada, setEntrada] = useState("");

  const [objetivo, setObjetivo] = useState("");
  const [valorMensal, setValorMensal] = useState("");

  const [parceiro, setParceiro] = useState("");
  const [tipoOutroSeguro, setTipoOutroSeguro] = useState("");

  useEffect(() => {
    const dados = localStorage.getItem("fortis-leads-profissional");
    if (dados) {
      setLeads(JSON.parse(dados));
    } else {
      setLeads(leadsIniciais);
      localStorage.setItem(
        "fortis-leads-profissional",
        JSON.stringify(leadsIniciais)
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fortis-leads-profissional", JSON.stringify(leads));
  }, [leads]);

  function limparCamposProduto() {
    setIdade("");
    setProfissao("");
    setFumante("Não");

    setVidas("");
    setCnpj("");
    setJaTemPlano("Não");

    setTipoConsorcio("Imóvel");
    setValorConsorcio("");
    setEntrada("");

    setObjetivo("");
    setValorMensal("");

    setParceiro("");
    setTipoOutroSeguro("");
  }

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setCidade("");
    setOrigem("WhatsApp");
    setTipo("Seguro de Vida");
    setStatus("Novo");
    setTemperatura("Morno");
    setValorEstimado("");
    setProximaAcao("");
    setDataProximaAcao("");
    setDataFechamento("");
    setDataRenovacao("");
    setObservacoes("");
    limparCamposProduto();
  }

  function montarDetalhesProduto() {
    if (tipo === "Seguro de Vida") {
      return `Idade: ${idade || "-"}, Profissão: ${profissao || "-"}, Fumante: ${fumante}`;
    }

    if (tipo === "Plano de Saúde") {
      return `Vidas: ${vidas || "-"}, CNPJ: ${cnpj || "-"}, Já tem plano: ${jaTemPlano}`;
    }

    if (tipo === "Consórcio") {
      return `Tipo: ${tipoConsorcio}, Valor desejado: ${valorConsorcio || "-"}, Entrada: ${entrada || "-"}`;
    }

    if (tipo === "Previdência Privada") {
      return `Objetivo: ${objetivo || "-"}, Valor mensal: ${valorMensal || "-"}`;
    }

    return `Tipo procurado: ${tipoOutroSeguro || "-"}, Parceiro responsável: ${parceiro || "-"}`;
  }

  function adicionarLead() {
    if (!nome.trim()) return;

    const novoLead: Lead = {
      id: Date.now(),
      nome,
      telefone,
      cidade,
      origem,
      tipo,
      status,
      temperatura,
      valorEstimado,
      proximaAcao,
      dataProximaAcao,
      dataFechamento,
      dataRenovacao,
      observacoes,
      detalhesProduto: montarDetalhesProduto(),
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
    };

    setLeads([novoLead, ...leads]);
    limparFormulario();
  }

  function atualizarLead(id: number, campo: keyof Lead, valor: string) {
    const atualizados = leads.map((lead) =>
      lead.id === id ? { ...lead, [campo]: valor } : lead
    );
    setLeads(atualizados);
  }

  function excluirLead(id: number) {
    const confirmar = window.confirm("Deseja excluir este lead?");
    if (!confirmar) return;
    setLeads(leads.filter((lead) => lead.id !== id));
  }

  function resetarSistema() {
    const confirmar = window.confirm(
      "Deseja resetar todo o CRM? Isso apaga todos os leads salvos neste navegador."
    );
    if (!confirmar) return;
    setLeads(leadsIniciais);
    localStorage.setItem(
      "fortis-leads-profissional",
      JSON.stringify(leadsIniciais)
    );
  }

  function iniciarEdicao(lead: Lead) {
    setEditandoId(lead.id);
    setLeadEditado({ ...lead });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setLeadEditado(null);
  }

  function salvarEdicao() {
    if (!leadEditado) return;

    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadEditado.id ? leadEditado : lead))
    );

    setEditandoId(null);
    setLeadEditado(null);
  }

  function atualizarLeadEditado(campo: keyof Lead, valor: string) {
    if (!leadEditado) return;
    setLeadEditado({ ...leadEditado, [campo]: valor });
  }

  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const texto =
        `${lead.nome} ${lead.telefone} ${lead.cidade} ${lead.origem} ${lead.tipo} ${lead.detalhesProduto}`.toLowerCase();
      const passouBusca = texto.includes(busca.toLowerCase());
      const passouStatus =
        filtroStatus === "Todos" || lead.status === filtroStatus;
      const passouTemperatura =
        filtroTemperatura === "Todas" ||
        lead.temperatura === filtroTemperatura;
      return passouBusca && passouStatus && passouTemperatura;
    });
  }, [leads, busca, filtroStatus, filtroTemperatura]);

  const resumo = useMemo(() => {
    const total = leads.length;
    const quentes = leads.filter((l) => l.temperatura === "Quente").length;
    const finalizados = leads.filter(
      (l) => l.status === "Contrato finalizado"
    ).length;
    const valorPipeline = leads.reduce(
      (acc, lead) => acc + Number(lead.valorEstimado || 0),
      0
    );
    const followupsAtrasados = leads.filter(
      (lead) => classificarFollowUp(lead.dataProximaAcao).label === "Atrasado"
    ).length;
    const followupsHoje = leads.filter(
      (lead) => classificarFollowUp(lead.dataProximaAcao).label === "Hoje"
    ).length;

    return {
      total,
      quentes,
      finalizados,
      valorPipeline,
      followupsAtrasados,
      followupsHoje,
    };
  }, [leads]);

  const followupsPrioritarios = useMemo(() => {
    return [...leads]
      .filter(
        (lead) =>
          lead.status !== "Contrato finalizado" && lead.status !== "Perdido"
      )
      .sort((a, b) => {
        const prioridadeA = classificarFollowUp(a.dataProximaAcao).prioridade;
        const prioridadeB = classificarFollowUp(b.dataProximaAcao).prioridade;
        return prioridadeA - prioridadeB;
      })
      .slice(0, 6);
  }, [leads]);

  return (
    <main
      style={{
        padding: 20,
        fontFamily: "Arial, sans-serif",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>CRM Fortis - Versão Profissional</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Funil comercial com edição completa, follow-up forte, renovação,
        WhatsApp inteligente e dados por produto.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <div style={cardResumoStyle}>
          <strong>Total de leads</strong>
          <div style={numeroResumoStyle}>{resumo.total}</div>
        </div>

        <div style={cardResumoStyle}>
          <strong>Leads quentes</strong>
          <div style={numeroResumoStyle}>{resumo.quentes}</div>
        </div>

        <div style={cardResumoStyle}>
          <strong>Contratos finalizados</strong>
          <div style={numeroResumoStyle}>{resumo.finalizados}</div>
        </div>

        <div style={cardResumoStyle}>
          <strong>Valor no pipeline</strong>
          <div style={numeroResumoStyle}>
            R$ {resumo.valorPipeline.toLocaleString("pt-BR")}
          </div>
        </div>

        <div style={{ ...cardResumoStyle, border: "2px solid #ef4444", background: "#fef2f2" }}>
          <strong>Follow-ups atrasados</strong>
          <div style={{ ...numeroResumoStyle, color: "#b91c1c" }}>
            {resumo.followupsAtrasados}
          </div>
        </div>

        <div style={{ ...cardResumoStyle, border: "2px solid #f59e0b", background: "#fffbeb" }}>
          <strong>Follow-ups hoje</strong>
          <div style={{ ...numeroResumoStyle, color: "#b45309" }}>
            {resumo.followupsHoje}
          </div>
        </div>
      </div>

      <section style={blocoStyle}>
        <h2 style={tituloSecaoStyle}>Atenção imediata</h2>

        {followupsPrioritarios.length === 0 ? (
          <div>Nenhum follow-up prioritário no momento.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {followupsPrioritarios.map((lead) => {
              const follow = classificarFollowUp(lead.dataProximaAcao);

              return (
                <div
                  key={lead.id}
                  style={{
                    ...cardAtencaoStyle,
                    background: follow.fundo,
                    border: `2px solid ${follow.borda}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <strong>{lead.nome}</strong>
                    <span
                      style={{
                        ...badgeStyle,
                        background: follow.cor,
                      }}
                    >
                      {follow.label}
                    </span>
                  </div>

                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    <div><strong>Produto:</strong> {lead.tipo}</div>
                    <div><strong>Ação:</strong> {lead.proximaAcao || "-"}</div>
                    <div><strong>Data:</strong> {formatarDataVisual(lead.dataProximaAcao)}</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <a
                      href={montarLinkWhatsapp(lead)}
                      target="_blank"
                      rel="noreferrer"
                      style={botaoWhatsappLinkStyle}
                    >
                      Chamar no WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={blocoStyle}>
        <h2 style={tituloSecaoStyle}>Cadastrar novo lead</h2>

        <div style={gridFormularioStyle}>
          <input
            style={inputStyle}
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Telefone / WhatsApp"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />

          <select
            style={inputStyle}
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
          >
            <option>WhatsApp</option>
            <option>Instagram</option>
            <option>Indicação</option>
            <option>Facebook</option>
            <option>Site</option>
            <option>Tráfego pago</option>
            <option>Outro</option>
          </select>

          <select
            style={inputStyle}
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as TipoProduto);
              limparCamposProduto();
            }}
          >
            {tiposProduto.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusLead)}
          >
            {etapas.map((etapa) => (
              <option key={etapa}>{etapa}</option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value as TemperaturaLead)}
          >
            <option>Quente</option>
            <option>Morno</option>
            <option>Frio</option>
          </select>

          <input
            style={inputStyle}
            placeholder="Valor estimado"
            value={valorEstimado}
            onChange={(e) => setValorEstimado(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Próxima ação"
            value={proximaAcao}
            onChange={(e) => setProximaAcao(e.target.value)}
          />

          <input
            style={inputStyle}
            type="date"
            value={dataProximaAcao}
            onChange={(e) => setDataProximaAcao(e.target.value)}
          />

          <input
            style={inputStyle}
            type="date"
            value={dataFechamento}
            onChange={(e) => setDataFechamento(e.target.value)}
          />

          <input
            style={inputStyle}
            type="date"
            value={dataRenovacao}
            onChange={(e) => setDataRenovacao(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 10 }}>Dados específicos do produto</h3>

          <div style={gridFormularioStyle}>
            {tipo === "Seguro de Vida" && (
              <>
                <input style={inputStyle} placeholder="Idade" value={idade} onChange={(e) => setIdade(e.target.value)} />
                <input style={inputStyle} placeholder="Profissão" value={profissao} onChange={(e) => setProfissao(e.target.value)} />
                <select style={inputStyle} value={fumante} onChange={(e) => setFumante(e.target.value)}>
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </>
            )}

            {tipo === "Plano de Saúde" && (
              <>
                <input style={inputStyle} placeholder="Quantidade de vidas" value={vidas} onChange={(e) => setVidas(e.target.value)} />
                <input style={inputStyle} placeholder="CNPJ (se tiver)" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                <select style={inputStyle} value={jaTemPlano} onChange={(e) => setJaTemPlano(e.target.value)}>
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </>
            )}

            {tipo === "Consórcio" && (
              <>
                <select style={inputStyle} value={tipoConsorcio} onChange={(e) => setTipoConsorcio(e.target.value)}>
                  <option>Imóvel</option>
                  <option>Automóvel</option>
                  <option>Moto</option>
                  <option>Serviços</option>
                </select>
                <input style={inputStyle} placeholder="Valor desejado" value={valorConsorcio} onChange={(e) => setValorConsorcio(e.target.value)} />
                <input style={inputStyle} placeholder="Entrada disponível" value={entrada} onChange={(e) => setEntrada(e.target.value)} />
              </>
            )}

            {tipo === "Previdência Privada" && (
              <>
                <input style={inputStyle} placeholder="Objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                <input style={inputStyle} placeholder="Valor mensal pretendido" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} />
              </>
            )}

            {tipo === "Outros" && (
              <>
                <input style={inputStyle} placeholder="Tipo de seguro/produto procurado" value={tipoOutroSeguro} onChange={(e) => setTipoOutroSeguro(e.target.value)} />
                <input style={inputStyle} placeholder="Corretora/parceiro responsável" value={parceiro} onChange={(e) => setParceiro(e.target.value)} />
              </>
            )}
          </div>
        </div>

        <textarea
          style={{ ...inputStyle, minHeight: 90, marginTop: 12, width: "100%" }}
          placeholder="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={adicionarLead} style={botaoPrincipalStyle}>
            Adicionar lead
          </button>
          <button onClick={limparFormulario} style={botaoSecundarioStyle}>
            Limpar formulário
          </button>
          <button onClick={resetarSistema} style={botaoPerigoStyle}>
            Resetar CRM
          </button>
        </div>
      </section>

      <section style={blocoStyle}>
        <h2 style={tituloSecaoStyle}>Filtros</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <input
            style={inputStyle}
            placeholder="Buscar por nome, telefone, cidade, origem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <select
            style={inputStyle}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option>Todos</option>
            {etapas.map((etapa) => (
              <option key={etapa}>{etapa}</option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={filtroTemperatura}
            onChange={(e) => setFiltroTemperatura(e.target.value)}
          >
            <option>Todas</option>
            <option>Quente</option>
            <option>Morno</option>
            <option>Frio</option>
          </select>
        </div>
      </section>

      <section>
        <h2 style={tituloSecaoStyle}>Leads cadastrados</h2>

        {leadsFiltrados.length === 0 && (
          <div style={blocoStyle}>Nenhum lead encontrado.</div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {leadsFiltrados.map((lead) => {
            const follow = classificarFollowUp(lead.dataProximaAcao);
            const estaEditando = editandoId === lead.id && leadEditado;

            return (
              <div
                key={lead.id}
                style={{
                  ...cardLeadStyle,
                  background: follow.fundo,
                  border: `2px solid ${follow.borda}`,
                }}
              >
                {estaEditando ? (
                  <>
                    <h3 style={{ marginTop: 0 }}>Editando lead</h3>

                    <div style={gridFormularioStyle}>
                      <input style={inputStyle} value={leadEditado.nome} onChange={(e) => atualizarLeadEditado("nome", e.target.value)} placeholder="Nome" />
                      <input style={inputStyle} value={leadEditado.telefone} onChange={(e) => atualizarLeadEditado("telefone", e.target.value)} placeholder="Telefone" />
                      <input style={inputStyle} value={leadEditado.cidade} onChange={(e) => atualizarLeadEditado("cidade", e.target.value)} placeholder="Cidade" />

                      <select style={inputStyle} value={leadEditado.origem} onChange={(e) => atualizarLeadEditado("origem", e.target.value)}>
                        <option>WhatsApp</option>
                        <option>Instagram</option>
                        <option>Indicação</option>
                        <option>Facebook</option>
                        <option>Site</option>
                        <option>Tráfego pago</option>
                        <option>Outro</option>
                      </select>

                      <select style={inputStyle} value={leadEditado.tipo} onChange={(e) => atualizarLeadEditado("tipo", e.target.value)}>
                        {tiposProduto.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>

                      <select style={inputStyle} value={leadEditado.status} onChange={(e) => atualizarLeadEditado("status", e.target.value)}>
                        {etapas.map((etapa) => (
                          <option key={etapa}>{etapa}</option>
                        ))}
                      </select>

                      <select style={inputStyle} value={leadEditado.temperatura} onChange={(e) => atualizarLeadEditado("temperatura", e.target.value)}>
                        <option>Quente</option>
                        <option>Morno</option>
                        <option>Frio</option>
                      </select>

                      <input style={inputStyle} value={leadEditado.valorEstimado} onChange={(e) => atualizarLeadEditado("valorEstimado", e.target.value)} placeholder="Valor estimado" />
                      <input style={inputStyle} value={leadEditado.proximaAcao} onChange={(e) => atualizarLeadEditado("proximaAcao", e.target.value)} placeholder="Próxima ação" />
                      <input style={inputStyle} type="date" value={leadEditado.dataProximaAcao} onChange={(e) => atualizarLeadEditado("dataProximaAcao", e.target.value)} />
                      <input style={inputStyle} type="date" value={leadEditado.dataFechamento} onChange={(e) => atualizarLeadEditado("dataFechamento", e.target.value)} />
                      <input style={inputStyle} type="date" value={leadEditado.dataRenovacao} onChange={(e) => atualizarLeadEditado("dataRenovacao", e.target.value)} />
                    </div>

                    <textarea
                      style={{ ...inputStyle, minHeight: 80, marginTop: 10 }}
                      value={leadEditado.detalhesProduto}
                      onChange={(e) => atualizarLeadEditado("detalhesProduto", e.target.value)}
                      placeholder="Detalhes do produto"
                    />

                    <textarea
                      style={{ ...inputStyle, minHeight: 80, marginTop: 10 }}
                      value={leadEditado.observacoes}
                      onChange={(e) => atualizarLeadEditado("observacoes", e.target.value)}
                      placeholder="Observações"
                    />

                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={salvarEdicao} style={botaoPrincipalStyle}>
                        Salvar edição
                      </button>
                      <button onClick={cancelarEdicao} style={botaoSecundarioStyle}>
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{lead.nome}</h3>
                        <div style={{ color: "#555", fontSize: 14 }}>{lead.telefone}</div>
                        <div style={{ color: "#555", fontSize: 14 }}>{lead.cidade}</div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: corTemperatura(lead.temperatura),
                          }}
                        >
                          {lead.temperatura}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: corStatus(lead.status),
                            marginTop: 4,
                          }}
                        >
                          {lead.status}
                        </div>
                      </div>
                    </div>

                    <hr style={{ margin: "12px 0" }} />

                    <div style={{ marginBottom: 10 }}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: follow.cor,
                        }}
                      >
                        Follow-up: {follow.label}
                      </span>
                    </div>

                    <div style={linhaInfoStyle}>
                      <strong>Produto:</strong> {lead.tipo}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Detalhes:</strong> {lead.detalhesProduto || "-"}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Origem:</strong> {lead.origem}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Valor estimado:</strong> R$ {lead.valorEstimado || "0"}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Próxima ação:</strong> {lead.proximaAcao || "-"}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Data próxima ação:</strong> {formatarDataVisual(lead.dataProximaAcao)}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Fechamento:</strong> {formatarDataVisual(lead.dataFechamento)}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Renovação:</strong> {formatarDataVisual(lead.dataRenovacao)}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Criado em:</strong> {lead.dataCriacao}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>Mensagem do WhatsApp:</strong>
                      <div
                        style={{
                          marginTop: 4,
                          background: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          padding: 8,
                          minHeight: 60,
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        {montarMensagemInteligente(lead)}
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>Observações:</strong>
                      <div
                        style={{
                          marginTop: 4,
                          background: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          padding: 8,
                          minHeight: 40,
                        }}
                      >
                        {lead.observacoes || "-"}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Atualizar status</strong>
                      <select
                        style={{ ...inputStyle, marginTop: 6 }}
                        value={lead.status}
                        onChange={(e) =>
                          atualizarLead(lead.id, "status", e.target.value)
                        }
                      >
                        {etapas.map((etapa) => (
                          <option key={etapa}>{etapa}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong>Atualizar temperatura</strong>
                      <select
                        style={{ ...inputStyle, marginTop: 6 }}
                        value={lead.temperatura}
                        onChange={(e) =>
                          atualizarLead(lead.id, "temperatura", e.target.value)
                        }
                      >
                        <option>Quente</option>
                        <option>Morno</option>
                        <option>Frio</option>
                      </select>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      <a
                        href={montarLinkWhatsapp(lead)}
                        target="_blank"
                        rel="noreferrer"
                        style={botaoWhatsappLinkStyle}
                      >
                        Abrir WhatsApp com mensagem pronta
                      </a>

                      <button
                        onClick={() => iniciarEdicao(lead)}
                        style={botaoSecundarioStyle}
                      >
                        Editar lead completo
                      </button>

                      <button
                        onClick={() => atualizarLead(lead.id, "status", "Cotação")}
                        style={botaoSecundarioStyle}
                      >
                        Ir para cotação
                      </button>

                      <button
                        onClick={() =>
                          atualizarLead(lead.id, "status", "Contrato finalizado")
                        }
                        style={botaoPrincipalStyle}
                      >
                        Finalizar
                      </button>

                      <button
                        onClick={() => excluirLead(lead.id)}
                        style={botaoPerigoStyle}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const blocoStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};

const cardResumoStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const numeroResumoStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 24,
  fontWeight: "bold",
};

const tituloSecaoStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
};

const gridFormularioStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
};

const botaoPrincipalStyle: CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const botaoSecundarioStyle: CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const botaoPerigoStyle: CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
};

const botaoWhatsappLinkStyle: CSSProperties = {
  display: "inline-block",
  textAlign: "center",
  background: "#16a34a",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 8,
  padding: "10px 14px",
};

const cardLeadStyle: CSSProperties = {
  borderRadius: 12,
  padding: 16,
};

const cardAtencaoStyle: CSSProperties = {
  borderRadius: 12,
  padding: 14,
};

const linhaInfoStyle: CSSProperties = {
  marginBottom: 6,
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  color: "#fff",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: "bold",
};