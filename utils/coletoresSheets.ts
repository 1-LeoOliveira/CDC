// utils/coletoresSheets.ts - VERSÃO COM MANUTENÇÃO - CORRIGIDA
'use client';
import { useState, useEffect, useCallback } from 'react';

export interface Coletor {
  id: number;
  numero: string;
  status: 'disponivel' | 'emprestado' | 'manutencao';
  statusOriginal?: any; // Para debug - valor original da planilha
  colaborador?: string;
  nomeColaborador?: string;
  turno?: string;
  dataRetirada?: string;
  dataPrevisaoRetorno?: string;
  observacoes?: string;
}

// ⚙️ SUAS CONFIGURAÇÕES REAIS
const GOOGLE_SHEETS_API_KEY = 'AIzaSyAxLu9efr7ViqhzBV4Q0sGzkTqdXISufzM';
const SPREADSHEET_ID = '1E2ffKxsUF5r3TMZMcS-eGvHxwlnK2GRpxQbrYejVonI';

// 🏠 DADOS DE FALLBACK LOCAL - Para testes sem internet
const COLETORES_FALLBACK: Record<number, Coletor> = {
  1: { id: 1, numero: 'COL001', status: 'disponivel' },
  2: { id: 2, numero: 'COL002', status: 'emprestado', colaborador: '12345', nomeColaborador: 'João Silva', turno: 'Manhã', dataRetirada: '2025-06-09T08:00' },
  3: { id: 3, numero: 'COL003', status: 'disponivel' },
  4: { id: 4, numero: 'COL004', status: 'manutencao', observacoes: 'Tela quebrada' },
  5: { id: 5, numero: 'COL005', status: 'emprestado', colaborador: '67890', nomeColaborador: 'Maria Santos', turno: 'Tarde', dataRetirada: '2025-06-09T14:00' },
  6: { id: 6, numero: 'COL006', status: 'disponivel' },
  7: { id: 7, numero: 'COL007', status: 'disponivel' },
  8: { id: 8, numero: 'COL008', status: 'manutencao', observacoes: 'Não liga' },
  9: { id: 9, numero: 'COL009', status: 'disponivel' },
  10: { id: 10, numero: 'COL010', status: 'disponivel' }
};

// 📊 Função para buscar coletores do Google Sheets
async function buscarColetoresDaPlanilha(): Promise<Coletor[]> {
  try {
    console.log('[Coletores] 🔄 Buscando dados da planilha...');
    console.log('[Coletores] 📋 Planilha ID:', SPREADSHEET_ID);
    
    const range = 'Sheet1!A:I';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    console.log('[Coletores] 🌐 URL da requisição:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    console.log('[Coletores] 📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Coletores] ❌ Erro na resposta:', errorText);
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[Coletores] 📦 Dados recebidos:', data);
    
    if (!data.values || data.values.length <= 1) {
      throw new Error('Planilha vazia ou sem dados');
    }
    
    // Processar dados (pular cabeçalho)
    const linhas = data.values.slice(1);
    console.log('[Coletores] 🔍 Linhas para processar:', linhas.length);
    console.log('[Coletores] 📋 Primeira linha de dados:', linhas[0]);
    console.log('[Coletores] 📋 Segunda linha de dados:', linhas[1]);
    
    const coletores: Coletor[] = linhas
      .map((linha: any[], index: number): Coletor | null => {
        try {
          if (!linha || linha.length < 3) return null;
          
          const id = parseInt(linha[0] || '0');
          const numero = (linha[1] || '').toString().trim();
          const statusRaw = linha[2]; // Valor original da planilha
          const status = parseStatus(statusRaw, linha[8]); // Passa observações para ajudar na decisão
          const colaborador = linha[3] ? linha[3].toString().trim() : undefined;
          const nomeColaborador = linha[4] ? linha[4].toString().trim() : undefined;
          const turno = linha[5] ? linha[5].toString().trim() : undefined;
          const dataRetirada = linha[6] ? linha[6].toString().trim() : undefined;
          const dataPrevisaoRetorno = linha[7] ? linha[7].toString().trim() : undefined;
          const observacoes = linha[8] ? linha[8].toString().trim() : undefined;
          
          // Log detalhado para as primeiras 3 linhas
          if (index < 3) {
            console.log(`[Coletores] 📱 Linha ${index + 2}:`, {
              id,
              numero,
              statusRaw,
              statusRawType: typeof statusRaw,
              statusParsed: status,
              colaborador,
              nomeColaborador,
              observacoes
            });
          }
          
          if (isNaN(id) || id <= 0 || !numero) return null;
          
          return {
            id,
            numero,
            status,
            statusOriginal: statusRaw, // Manter valor original para debug
            colaborador: colaborador || undefined,
            nomeColaborador: nomeColaborador || undefined,
            turno: turno || undefined,
            dataRetirada: dataRetirada || undefined,
            dataPrevisaoRetorno: dataPrevisaoRetorno || undefined,
            observacoes: observacoes || undefined
          };
          
        } catch (err) {
          console.error(`[Coletores] Erro linha ${index + 2}:`, err);
          return null;
        }
      })
      .filter((coletor): coletor is Coletor => coletor !== null);
    
    console.log(`[Coletores] ✅ ${coletores.length} coletores carregados da planilha`);
    
    // Log das estatísticas para debug
    const stats = {
      total: coletores.length,
      disponiveis: coletores.filter(c => c.status === 'disponivel').length,
      emprestados: coletores.filter(c => c.status === 'emprestado').length,
      manutencao: coletores.filter(c => c.status === 'manutencao').length
    };
    console.log('[Coletores] 📊 Estatísticas:', stats);
    
    return coletores;
    
  } catch (err) {
    console.error('[Coletores] ❌ Erro ao buscar planilha:', err);
    throw err;
  }
}

// 🏠 Função para usar dados locais como fallback
function usarDadosLocais(): Coletor[] {
  console.log('[Coletores] 🏠 Usando dados locais como fallback');
  return Object.values(COLETORES_FALLBACK);
}

// 🔄 Função para interpretar status (ATUALIZADA PARA INCLUIR MANUTENÇÃO)
function parseStatus(valor: any, observacoes?: string): 'disponivel' | 'emprestado' | 'manutencao' {
  console.log(`[Parse Status] Valor recebido: "${valor}" (tipo: ${typeof valor}), observações: "${observacoes}"`);
  
  // ✅ REGRA ESPECIAL: Se tem observações significativas, pode ser manutenção
  if (observacoes && observacoes.trim().length > 0) {
    const obsLower = observacoes.toLowerCase();
    const palavrasManutencao = [
      'quebrado', 'quebrada', 'tela', 'problema', 'defeito', 'não funciona', 
      'não liga', 'travado', 'botão', 'display', 'bateria', 'reparo', 
      'conserto', 'manutenção', 'manutencao'
    ];
    
    const temProblema = palavrasManutencao.some(palavra => obsLower.includes(palavra));
    if (temProblema) {
      console.log('[Parse Status] → manutencao (por observações)');
      return 'manutencao';
    }
  }
  
  // Se for booleano TRUE = disponível
  if (valor === true || valor === 'TRUE' || valor === 'true') {
    console.log('[Parse Status] → disponivel (TRUE)');
    return 'disponivel';
  }
  
  // Se for booleano FALSE = emprestado
  if (valor === false || valor === 'FALSE' || valor === 'false') {
    console.log('[Parse Status] → emprestado (FALSE)');
    return 'emprestado';
  }
  
  // Se for string, processar como antes + manutenção
  if (typeof valor === 'string') {
    const valorLower = valor.toLowerCase().trim();
    
    if (['manutencao', 'manutenção', 'quebrado', 'reparo', 'conserto'].includes(valorLower)) {
      console.log('[Parse Status] → manutencao (string)');
      return 'manutencao';
    }
    
    if (['emprestado', 'em uso', 'ocupado'].includes(valorLower)) {
      console.log('[Parse Status] → emprestado (string)');
      return 'emprestado';
    }
    
    if (['disponivel', 'disponível', 'livre'].includes(valorLower)) {
      console.log('[Parse Status] → disponivel (string)');
      return 'disponivel';
    }
  }
  
  // Padrão: se não conseguiu interpretar, considera disponível
  console.log('[Parse Status] → disponivel (padrão)');
  return 'disponivel';
}

// 🎯 Hook principal para coletores
export function useColetores() {
  const [coletores, setColetores] = useState<Coletor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(0);

  const carregarDados = useCallback(async () => {
    try {
      console.log('[Hook] 🚀 Carregando coletores...');
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      const dadosPlanilha = await buscarColetoresDaPlanilha();
      
      setColetores(dadosPlanilha);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('[Hook] ✅ Dados da planilha carregados com sucesso!');
      
    } catch (err) {
      console.warn('[Hook] ⚠️ Erro ao carregar planilha, usando dados locais...');
      
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      
      const dadosLocais = usarDadosLocais();
      setColetores(dadosLocais);
      setUsingFallback(true);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('[Hook] 🏠 Funcionando com dados locais (fallback)');
    }
  }, []);

  // 📤 Função para retirar coletor
  const retirarColetor = useCallback(async (
    coletorId: number, 
    colaborador: string, 
    nomeColaborador: string, 
    turno: string,
    observacoes?: string
  ) => {
    try {
      console.log(`[Hook] 📤 Retirando coletor ${coletorId} para ${nomeColaborador}...`);
      setPendingUpdates(prev => prev + 1);
      
      const agora = new Date().toISOString();
      const previsaoRetorno = new Date();
      previsaoRetorno.setHours(previsaoRetorno.getHours() + 8);
      
      // Atualizar estado local imediatamente (otimistic update)
      setColetores(prev => prev.map(coletor => 
        coletor.id === coletorId 
          ? {
              ...coletor,
              status: 'emprestado' as const,
              colaborador,
              nomeColaborador,
              turno,
              dataRetirada: agora,
              dataPrevisaoRetorno: previsaoRetorno.toISOString(),
              observacoes
            }
          : coletor
      ));
      
      // Sincronizar com Google Sheets
      await sincronizarComPlanilha(coletorId, {
        status: 'emprestado',
        colaborador,
        nomeColaborador,  
        turno,
        dataRetirada: agora,
        dataPrevisaoRetorno: previsaoRetorno.toISOString(),
        observacoes
      });
      
      console.log(`[Hook] ✅ Coletor ${coletorId} retirado por ${nomeColaborador}`);
      
      // Recarregar dados após um delay para sincronizar
      setTimeout(() => {
        console.log('[Hook] 🔄 Recarregando dados após retirada...');
        carregarDados();
      }, 2000);
      
    } catch (err) {
      console.error('[Hook] ❌ Erro ao retirar coletor:', err);
      
      // Reverter estado local em caso de erro
      setColetores(prev => prev.map(coletor => 
        coletor.id === coletorId 
          ? {
              ...coletor,
              status: 'disponivel' as const,
              colaborador: undefined,
              nomeColaborador: undefined,
              turno: undefined,
              dataRetirada: undefined,
              dataPrevisaoRetorno: undefined,
              observacoes: undefined
            }
          : coletor
      ));
      
      throw err;
    } finally {
      setPendingUpdates(prev => prev - 1);
    }
  }, [carregarDados]);

  // 📥 Função para devolver coletor
  const devolverColetor = useCallback(async (coletorId: number, observacoes?: string) => {
    try {
      console.log(`[Hook] 📥 Devolvendo coletor ${coletorId}...`);
      setPendingUpdates(prev => prev + 1);
      
      // Atualizar estado local imediatamente (optimistic update)
      setColetores(prev => prev.map(coletor => 
        coletor.id === coletorId 
          ? {
              ...coletor,
              status: 'disponivel' as const,
              colaborador: undefined,
              nomeColaborador: undefined,
              turno: undefined,
              dataRetirada: undefined,
              dataPrevisaoRetorno: undefined,
              observacoes
            }
          : coletor
      ));
      
      // Sincronizar com Google Sheets
      await sincronizarComPlanilha(coletorId, {
        status: 'disponivel',
        colaborador: '',
        nomeColaborador: '',
        turno: '',
        dataRetirada: '',
        dataPrevisaoRetorno: '',
        observacoes: observacoes || ''
      });
      
      console.log(`[Hook] ✅ Coletor ${coletorId} devolvido`);
      
      // Recarregar dados após um delay para sincronizar
      setTimeout(() => {
        console.log('[Hook] 🔄 Recarregando dados após devolução...');
        carregarDados();
      }, 2000);
      
    } catch (err) {
      console.error('[Hook] ❌ Erro ao devolver coletor:', err);
      
      // Reverter mudança local em caso de erro
      carregarDados();
      
      throw err;
    } finally {
      setPendingUpdates(prev => prev - 1);
    }
  }, [carregarDados]);

  // 🔧 Função para marcar como manutenção
  const marcarManutencao = useCallback(async (coletorId: number, observacoes: string) => {
    try {
      console.log(`[Hook] 🔧 Marcando coletor ${coletorId} para manutenção...`);
      setPendingUpdates(prev => prev + 1);
      
      // Atualizar estado local imediatamente
      setColetores(prev => prev.map(coletor => 
        coletor.id === coletorId 
          ? { 
              ...coletor, 
              status: 'manutencao' as const, 
              observacoes,
              // Limpar dados de empréstimo se houver
              colaborador: undefined,
              nomeColaborador: undefined,
              turno: undefined,
              dataRetirada: undefined,
              dataPrevisaoRetorno: undefined
            }
          : coletor
      ));
      
      // ✅ Para manutenção, vamos usar um valor especial na planilha
      await sincronizarComPlanilha(coletorId, {
        status: 'manutencao', // Nosso código vai tratar isso especialmente
        colaborador: '',
        nomeColaborador: '',
        turno: '',
        dataRetirada: '',
        dataPrevisaoRetorno: '',
        observacoes
      });
      
      console.log(`[Hook] ✅ Coletor ${coletorId} marcado para manutenção`);
      
      // Recarregar dados após um delay
      setTimeout(() => {
        console.log('[Hook] 🔄 Recarregando dados após marcar manutenção...');
        carregarDados();
      }, 2000);
      
    } catch (err) {
      console.error('[Hook] ❌ Erro ao marcar manutenção:', err);
      
      // Reverter mudança local em caso de erro
      carregarDados();
      
      throw err;
    } finally {
      setPendingUpdates(prev => prev - 1);
    }
  }, [carregarDados]);

  const recarregar = useCallback(() => {
    console.log('[Hook] 🔄 Recarregamento manual solicitado...');
    carregarDados();
  }, [carregarDados]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Auto-reload periódico (apenas se não estiver usando fallback)
  useEffect(() => {
    if (!error && !usingFallback) {
      const interval = setInterval(() => {
        console.log('[Hook] ⏰ Auto-reload periódico...');
        carregarDados();
      }, 2 * 60 * 1000); // 2 minutos
      return () => clearInterval(interval);
    }
  }, [error, usingFallback, carregarDados]);

  // Estatísticas calculadas
  const stats = {
    total: coletores.length,
    disponiveis: coletores.filter(c => c.status === 'disponivel').length,
    emprestados: coletores.filter(c => c.status === 'emprestado').length,
    manutencao: coletores.filter(c => c.status === 'manutencao').length,
    taxaOcupacao: coletores.length > 0 
      ? Math.round((coletores.filter(c => c.status === 'emprestado').length / coletores.length) * 100)
      : 0
  };

  return {
    coletores,
    loading,
    error,
    lastUpdate,
    usingFallback,
    pendingUpdates,
    stats,
    // Ações
    retirarColetor,
    devolverColetor,
    marcarManutencao,
    recarregar
  };
}

// 🔄 Função auxiliar para sincronizar com Google Sheets (ATUALIZADA)
async function sincronizarComPlanilha(coletorId: number, dados: Partial<Coletor>) {
  try {
    console.log('[Sync] 🔄 Sincronizando coletor', coletorId, 'com dados:', dados);
    
    const response = await fetch('/api/coletores/atualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coletorId,
        dados,
        spreadsheetId: SPREADSHEET_ID
      })
    });

    console.log('[Sync] 📡 Resposta da API:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sync] ❌ Erro na resposta:', errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    const resultado = await response.json();
    console.log('[Sync] ✅ Sincronizado com sucesso:', resultado);
    
    return resultado;
    
  } catch (err) {
    console.error('[Sync] ❌ Erro na sincronização:', err);
    throw err;
  }
}

// 📊 Função para obter coletores por turno
export function getColetoresPorTurno(coletores: Coletor[]) {
  const turnos = ['Manhã', 'Tarde', 'Noite'];
  
  return turnos.map(turno => ({
    turno,
    coletores: coletores.filter(c => c.turno === turno),
    disponiveis: coletores.filter(c => c.status === 'disponivel').length,
    emprestados: coletores.filter(c => c.turno === turno && c.status === 'emprestado').length,
    manutencao: coletores.filter(c => c.status === 'manutencao').length
  }));
}

// 📋 Função para obter coletores em manutenção
export function getColetoresManutencao(coletores: Coletor[]) {
  return coletores.filter(c => c.status === 'manutencao').map(c => ({
    numero: c.numero,
    problema: c.observacoes || 'Sem descrição',
    dataProblema: c.dataRetirada || 'Não informado'
  }));
}

// 🧪 Função para testar a conexão com a API
export async function testarConexaoAPI() {
  try {
    console.log('🧪 Testando conexão com Google Sheets API...');
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A1:B2?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      return { sucesso: false, erro: errorText };
    }
    
    const data = await response.json();
    console.log('✅ Dados:', data);
    return { sucesso: true, dados: data };
    
  } catch (err) {
    console.error('💥 Erro na requisição:', err);
    return { sucesso: false, erro: err };
  }
}

// 🔍 Função para debug de status
export function debugStatus() {
  console.log('🔍 Testando parseStatus...');
  
  const testes = [
    { valor: true, obs: '' },
    { valor: false, obs: '' },
    { valor: 'TRUE', obs: '' },
    { valor: 'FALSE', obs: '' },
    { valor: true, obs: 'Tela quebrada' },
    { valor: false, obs: 'Não liga' },
    { valor: 'disponivel', obs: '' },
    { valor: 'emprestado', obs: '' },
    { valor: 'manutencao', obs: '' },
    { valor: '', obs: 'Botão travado' },
    { valor: null, obs: 'Display com defeito' }
  ];
  
  testes.forEach(teste => {
    const resultado = parseStatus(teste.valor, teste.obs);
    console.log(`${teste.valor} (${typeof teste.valor}) + "${teste.obs}" → ${resultado}`);
  });
}

// Para debug no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testarConexaoAPI = testarConexaoAPI;
  (window as any).debugStatus = debugStatus;
  console.log('🔧 Debug: Use window.testarConexaoAPI() e window.debugStatus() no console');
}