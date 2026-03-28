"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "./lib/supabase";

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
  created_at?: string;
  nome: string;
  telefone: string;
  cidade: string;
  origem: string;
  tipo: string;
  status: string;
  temperatura: string;
  valor: string;
  proxima_acao: string;
  data_proxima_acao: string;
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

function limparTelefoneParaWhatsapp(telefone: string) {
  return telefone.replace(/\D/g, "");
}

function montarMensagemInteligente(lead: Lead) {
  const primeiroNome = lead.nome?.split(" ")[0] || lead.nome;
  const produto = lead.tipo;
  const acao = lead.proxima_acao?.trim();

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
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

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
  const [valor, setValor] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");
  const [dataProximaAcao, setDataProximaAcao] = useState("");

  async function carregarLeads() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erro ao carregar leads:", error);
      alert("Erro ao carregar leads do banco.");
      setCarregando(false);
      return;
    }

    setLeads((data as Lead[]) || []);
    setCarregando(false);
  }

 useEffect(() => {
  async function testar() {
    const { data, error } = await supabase
      .from("leads")
      .select("*");

    console.log("dados:", data);
    console.log("erro:", error);
  }

  testar();
}, []);
  function limparFormulario() {
    setNome("");
    setTelefone("");
    setCidade("");
    setOrigem("WhatsApp");
    setTipo("Seguro de Vida");
    setStatus("Novo");
    setTemperatura("Morno");
    setValor("");
    setProximaAcao("");
    setDataProximaAcao("");
  }

  async function adicionarLead() {
    if (!nome.trim()) {
      alert("Preencha o nome do lead.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("leads").insert([
      {
        nome,
        telefone,
        cidade,
        origem,
        tipo,
        status,
        temperatura,
        valor,
        proxima_acao: proximaAcao,
        data_proxima_acao: dataProximaAcao,
      },
    ]);

    setSalvando(false);

    if (error) {
      console.error("Erro ao salvar lead:", error);
      alert("Erro ao salvar lead no banco.");
      return;
    }

    limparFormulario();
    await carregarLeads();
    alert("Lead salvo no banco com sucesso.");
  }

  async function atualizarLead(id: number, campo: keyof Lead, valorNovo: string) {
    const colunaBanco =
      campo === "proxima_acao" || campo === "data_proxima_acao"
        ? campo
        : campo;

    const { error } = await supabase
      .from("leads")
      .update({ [colunaBanco]: valorNovo })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar lead:", error);
      alert("Erro ao atualizar lead.");
      return;
    }

    await carregarLeads();
  }

  async function excluirLead(id: number) {
    const confirmar = window.confirm("Deseja excluir este lead?");
    if (!confirmar) return;

    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir lead:", error);
      alert("Erro ao excluir lead.");
      return;
    }

    await carregarLeads();
  }

  function iniciarEdicao(lead: Lead) {
    setEditandoId(lead.id);
    setLeadEditado({ ...lead });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setLeadEditado(null);
  }

  function atualizarLeadEditado(campo: keyof Lead, valorNovo: string) {
    if (!leadEditado) return;
    setLeadEditado({ ...leadEditado, [campo]: valorNovo });
  }

  async function salvarEdicao() {
    if (!leadEditado) return;

    const { error } = await supabase
      .from("leads")
      .update({
        nome: leadEditado.nome,
        telefone: leadEditado.telefone,
        cidade: leadEditado.cidade,
        origem: leadEditado.origem,
        tipo: leadEditado.tipo,
        status: leadEditado.status,
        temperatura: leadEditado.temperatura,
        valor: leadEditado.valor,
        proxima_acao: leadEditado.proxima_acao,
        data_proxima_acao: leadEditado.data_proxima_acao,
      })
      .eq("id", leadEditado.id);

    if (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao salvar edição.");
      return;
    }

    setEditandoId(null);
    setLeadEditado(null);
    await carregarLeads();
  }

  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const texto =
        `${lead.nome} ${lead.telefone} ${lead.cidade} ${lead.origem} ${lead.tipo}`.toLowerCase();

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
      (acc, lead) => acc + Number(lead.valor || 0),
      0
    );
    const followupsAtrasados = leads.filter(
      (lead) => classificarFollowUp(lead.data_proxima_acao).label === "Atrasado"
    ).length;
    const followupsHoje = leads.filter(
      (lead) => classificarFollowUp(lead.data_proxima_acao).label === "Hoje"
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
        const prioridadeA = classificarFollowUp(a.data_proxima_acao).prioridade;
        const prioridadeB = classificarFollowUp(b.data_proxima_acao).prioridade;
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
      <h1 style={{ marginBottom: 6 }}>CRM Fortis - Banco de Dados Online</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Agora os leads estão sendo salvos no Supabase.
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

        <div
          style={{
            ...cardResumoStyle,
            border: "2px solid #ef4444",
            background: "#fef2f2",
          }}
        >
          <strong>Follow-ups atrasados</strong>
          <div style={{ ...numeroResumoStyle, color: "#b91c1c" }}>
            {resumo.followupsAtrasados}
          </div>
        </div>

        <div
          style={{
            ...cardResumoStyle,
            border: "2px solid #f59e0b",
            background: "#fffbeb",
          }}
        >
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
              const follow = classificarFollowUp(lead.data_proxima_acao);

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
                    <div><strong>Ação:</strong> {lead.proxima_acao || "-"}</div>
                    <div><strong>Data:</strong> {formatarDataVisual(lead.data_proxima_acao)}</div>
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
            onChange={(e) => setTipo(e.target.value as TipoProduto)}
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
            value={valor}
            onChange={(e) => setValor(e.target.value)}
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
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={adicionarLead}
            style={botaoPrincipalStyle}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Adicionar lead"}
          </button>

          <button onClick={limparFormulario} style={botaoSecundarioStyle}>
            Limpar formulário
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

        {carregando && <div style={blocoStyle}>Carregando leads...</div>}

        {!carregando && leadsFiltrados.length === 0 && (
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
            const follow = classificarFollowUp(lead.data_proxima_acao);
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
                      <input
                        style={inputStyle}
                        value={leadEditado.nome}
                        onChange={(e) => atualizarLeadEditado("nome", e.target.value)}
                        placeholder="Nome"
                      />
                      <input
                        style={inputStyle}
                        value={leadEditado.telefone}
                        onChange={(e) => atualizarLeadEditado("telefone", e.target.value)}
                        placeholder="Telefone"
                      />
                      <input
                        style={inputStyle}
                        value={leadEditado.cidade}
                        onChange={(e) => atualizarLeadEditado("cidade", e.target.value)}
                        placeholder="Cidade"
                      />

                      <select
                        style={inputStyle}
                        value={leadEditado.origem}
                        onChange={(e) => atualizarLeadEditado("origem", e.target.value)}
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
                        value={leadEditado.tipo}
                        onChange={(e) => atualizarLeadEditado("tipo", e.target.value)}
                      >
                        {tiposProduto.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>

                      <select
                        style={inputStyle}
                        value={leadEditado.status}
                        onChange={(e) => atualizarLeadEditado("status", e.target.value)}
                      >
                        {etapas.map((etapa) => (
                          <option key={etapa}>{etapa}</option>
                        ))}
                      </select>

                      <select
                        style={inputStyle}
                        value={leadEditado.temperatura}
                        onChange={(e) =>
                          atualizarLeadEditado("temperatura", e.target.value)
                        }
                      >
                        <option>Quente</option>
                        <option>Morno</option>
                        <option>Frio</option>
                      </select>

                      <input
                        style={inputStyle}
                        value={leadEditado.valor}
                        onChange={(e) => atualizarLeadEditado("valor", e.target.value)}
                        placeholder="Valor"
                      />

                      <input
                        style={inputStyle}
                        value={leadEditado.proxima_acao}
                        onChange={(e) =>
                          atualizarLeadEditado("proxima_acao", e.target.value)
                        }
                        placeholder="Próxima ação"
                      />

                      <input
                        style={inputStyle}
                        type="date"
                        value={leadEditado.data_proxima_acao}
                        onChange={(e) =>
                          atualizarLeadEditado("data_proxima_acao", e.target.value)
                        }
                      />
                    </div>

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
                            color:
                              lead.temperatura === "Quente"
                                ? "#dc2626"
                                : lead.temperatura === "Morno"
                                  ? "#d97706"
                                  : "#2563eb",
                          }}
                        >
                          {lead.temperatura}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color:
                              lead.status === "Contrato finalizado"
                                ? "#15803d"
                                : lead.status === "Perdido"
                                  ? "#6b7280"
                                  : "#111827",
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
                      <strong>Origem:</strong> {lead.origem}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Valor estimado:</strong> R$ {lead.valor || "0"}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Próxima ação:</strong> {lead.proxima_acao || "-"}
                    </div>
                    <div style={linhaInfoStyle}>
                      <strong>Data próxima ação:</strong> {formatarDataVisual(lead.data_proxima_acao)}
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