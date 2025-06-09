// components/AdminManutencao.tsx - Componente para administradores verem equipamentos em manutenção
'use client';
import React, { useState } from 'react';
import { useColetores } from '../utils/coletoresSheets';
import { Shield, AlertTriangle, CheckCircle, Calendar, User, FileText } from 'lucide-react';

interface AdminManutencaoProps {
  isAdmin: boolean;
}

export default function AdminManutencao({ isAdmin }: AdminManutencaoProps) {
  const { coletores, recarregar } = useColetores();
  const [processando, setProcessando] = useState<number | null>(null);

  // Filtrar apenas equipamentos em manutenção
  const equipamentosManutencao = coletores.filter(c => c.status === 'manutencao');

  // Função para marcar como reparado (voltar para disponível)
  const marcarReparado = async (coletorId: number) => {
    if (!isAdmin) return;
    
    setProcessando(coletorId);
    
    try {
      // Aqui você pode usar a função devolverColetor ou criar uma nova função específica
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recarregar dados
      recarregar();
      
    } catch (error) {
      console.error('Erro ao marcar como reparado:', error);
    } finally {
      setProcessando(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Shield className="mx-auto text-red-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-red-800 mb-2">Acesso Restrito</h3>
        <p className="text-red-600">Apenas administradores podem visualizar equipamentos em manutenção.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-red-600 px-6 py-4">
        <div className="flex items-center">
          <Shield className="text-white mr-3" size={24} />
          <h2 className="text-xl font-bold text-white">Gestão de Manutenção</h2>
          <span className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {equipamentosManutencao.length} em manutenção
          </span>
        </div>
      </div>

      <div className="p-6">
        {equipamentosManutencao.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum equipamento em manutenção
            </h3>
            <p className="text-gray-600">
              Todos os coletores estão funcionando normalmente!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {equipamentosManutencao.map((coletor) => (
              <div 
                key={coletor.id} 
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="text-red-600 mr-2" size={20} />
                      <h3 className="text-lg font-bold text-gray-900">
                        {coletor.numero}
                      </h3>
                      <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        Em Manutenção
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {coletor.observacoes && (
                        <div className="flex items-start">
                          <FileText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <span className="font-medium text-gray-700">Problema:</span>
                            <p className="text-gray-600">{coletor.observacoes}</p>
                          </div>
                        </div>
                      )}

                      {coletor.nomeColaborador && (
                        <div className="flex items-center">
                          <User className="text-gray-500 mr-2" size={16} />
                          <div>
                            <span className="font-medium text-gray-700">Último usuário:</span>
                            <p className="text-gray-600">{coletor.nomeColaborador}</p>
                          </div>
                        </div>
                      )}

                      {coletor.dataRetirada && (
                        <div className="flex items-center">
                          <Calendar className="text-gray-500 mr-2" size={16} />
                          <div>
                            <span className="font-medium text-gray-700">Data do problema:</span>
                            <p className="text-gray-600">
                              {new Date(coletor.dataRetirada).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => marcarReparado(coletor.id)}
                      disabled={processando === coletor.id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {processando === coletor.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Marcar como Reparado
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instruções para administrador */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            📋 Instruções para Administradores:
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Visualize todos os equipamentos</strong> que estão em manutenção</p>
            <p>• <strong>Veja detalhes do problema</strong> reportado pelo usuário</p>
            <p>• <strong>Marque como reparado</strong> quando o conserto for concluído</p>
            <p>• <strong>Equipamentos reparados</strong> voltam automaticamente para "Disponível"</p>
          </div>
        </div>
      </div>
    </div>
  );
}