// app/api/coletores/atualizar/route.ts - VERSÃO SIMPLIFICADA
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ SUBSTITUA PELA SUA URL COMPLETA DO GOOGLE APPS SCRIPT
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx83bwfL9k3Jq2QAMOTTrdFFb1zdKooIOh56o1NjLqBpyrPmw1GMreHpeDgKRIk4YNzRg/exec';
const SPREADSHEET_ID = '1E2ffKxsUF5r3TMZMcS-eGvHxwlnK2GRpxQbrYejVonI';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'API de Coletores funcionando!',
    timestamp: new Date().toISOString(),
    scriptUrl: SCRIPT_URL
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API Coletores] 🔄 Recebendo requisição...');
    
    const body = await request.json();
    const { coletorId, dados } = body;

    console.log('[API Coletores] 📦 Dados recebidos:', { coletorId, dados });

    if (!coletorId || !dados) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: coletorId, dados' 
      }, { status: 400 });
    }

    const linha = coletorId + 1; // Linha na planilha (pular cabeçalho)
    console.log(`[API Coletores] 📍 Coletor ${coletorId} vai para linha ${linha}`);

    // ✅ MAPEAMENTO SIMPLIFICADO - Removidas colunas de turno/setor
    const atualizacoes: { range: string; value: any }[] = [];
    
    // COLUNA C: Status como TRUE/FALSE ou string para manutenção
    if (dados.status) {
      let statusValue;
      
      if (dados.status === 'disponivel') {
        statusValue = true;
      } else if (dados.status === 'emprestado') {
        statusValue = false;
      } else if (dados.status === 'manutencao') {
        statusValue = 'MANUTENÇÃO'; // Usar string para identificar manutenção
      }
      
      if (statusValue !== undefined) {
        atualizacoes.push({
          range: `Sheet1!C${linha}`,
          value: statusValue
        });
        console.log(`[API Coletores] 🔄 Status: ${dados.status} → ${statusValue}`);
      }
    }
    
    // ESTRUTURA DA PLANILHA COM SETOR:
    // A: ID | B: Número | C: Disponível | D: Setor | E: Nome | F: Data Retirada | G: Previsão Retorno | H: Observações
    const mapeamentoColunas = {
      setor: `D${linha}`,                 // Coluna D: Setor (era Matrícula)
      nomeColaborador: `E${linha}`,       // Coluna E: Nome
      dataRetirada: `F${linha}`,          // Coluna F: Data Retirada
      dataPrevisaoRetorno: `G${linha}`,   // Coluna G: Previsão Retorno
      observacoes: `H${linha}`            // Coluna H: Observações
    };

    // Definir tipo para as chaves de mapeamentoColunas
    type CamposValidos = keyof typeof mapeamentoColunas;

    // Adicionar atualizações para cada campo
    for (const [campo, valor] of Object.entries(dados)) {
      const campoValido = campo as CamposValidos;
      if (campo !== 'status' && mapeamentoColunas[campoValido]) {
        atualizacoes.push({
          range: `Sheet1!${mapeamentoColunas[campoValido]}`,
          value: valor || '' // Garantir que valor vazio seja string vazia
        });
        console.log(`[API Coletores] 📝 Campo ${campo}: ${valor} → ${mapeamentoColunas[campoValido]}`);
      }
    }

    console.log(`[API Coletores] 📊 Total de ${atualizacoes.length} atualizações para processar`);

    // ✅ PROCESSAR ATUALIZAÇÕES COM MELHOR TRATAMENTO DE ERRO
    const resultados = await Promise.allSettled(
      atualizacoes.map(async (atualizacao, index) => {
        try {
          console.log(`[API Coletores] 📝 [${index + 1}/${atualizacoes.length}] Atualizando ${atualizacao.range} = "${atualizacao.value}"`);
          
          // ✅ REQUISIÇÃO CORRIGIDA COM HEADERS APROPRIADOS
          const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              action: 'updateCell',
              spreadsheetId: SPREADSHEET_ID,
              range: atualizacao.range,
              value: atualizacao.value
            })
          });

          console.log(`[API Coletores] 📡 Resposta ${atualizacao.range}: Status ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Coletores] ❌ Erro HTTP ${response.status} para ${atualizacao.range}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const resultado = await response.json();
          console.log(`[API Coletores] ✅ Sucesso ${atualizacao.range}:`, resultado);

          return { 
            sucesso: true, 
            range: atualizacao.range,
            value: atualizacao.value,
            resultado 
          };

        } catch (error) {
          console.error(`[API Coletores] ❌ Erro ao atualizar ${atualizacao.range}:`, error);
          return { 
            sucesso: false, 
            range: atualizacao.range, 
            value: atualizacao.value,
            erro: error instanceof Error ? error.message : 'Erro desconhecido' 
          };
        }
      })
    );

    // ✅ ANÁLISE DETALHADA DOS RESULTADOS
    const sucessos = resultados.filter(result => 
      result.status === 'fulfilled' && result.value.sucesso
    );
    
    const erros = resultados.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.sucesso)
    );

    const totalSucessos = sucessos.length;
    const totalErros = erros.length;

    console.log(`[API Coletores] 📊 Resultado Final: ${totalSucessos} sucessos, ${totalErros} erros de ${atualizacoes.length} total`);

    // Log de erros para debug
    if (totalErros > 0) {
      console.error('[API Coletores] 🚨 Erros encontrados:');
      erros.forEach((erro, index) => {
        if (erro.status === 'fulfilled') {
          console.error(`  ${index + 1}. ${erro.value.range}: ${erro.value.erro}`);
        } else {
          console.error(`  ${index + 1}. Erro na promise:`, erro.reason);
        }
      });
    }

    return NextResponse.json({
      sucesso: totalSucessos,
      erros: totalErros,
      total: atualizacoes.length,
      message: `Coletor ${coletorId}: ${totalSucessos}/${atualizacoes.length} campos atualizados com sucesso`,
      coletorId,
      linha,
      detalhes: resultados.map(r => r.status === 'fulfilled' ? r.value : { erro: r.reason }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API Coletores] ❌ Erro geral na API:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
