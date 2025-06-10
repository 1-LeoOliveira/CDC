'use client';
import React, { useState, useEffect } from 'react';
import { useColetores, Coletor } from '../utils/coletoresSheets';
import { Settings, Eye, EyeOff, LogOut, Shield } from 'lucide-react';

// Credenciais de administrador
const ADMIN_CREDENTIALS = {
  email: 'admin@coletores.com',
  senha: 'admin123'
};

// Componente de Login do Administrador
function LoginAdmin({ onLoginSuccess, onCancel }: { 
  onLoginSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarLogin, setLembrarLogin] = useState(false);

  // Carregar credenciais salvas ao abrir o modal
  useEffect(() => {
    const emailSalvo = localStorage.getItem('admin_email_salvo');
    const senhaSalva = localStorage.getItem('admin_senha_salva');
    
    if (emailSalvo && senhaSalva) {
      setEmail(emailSalvo);
      setSenha(senhaSalva);
      setLembrarLogin(true);
    }
  }, []);

  const handleLogin = () => {
    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    // Simulação de autenticação
    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
        // Salvar ou remover credenciais baseado na opção "lembrar"
        if (lembrarLogin) {
          localStorage.setItem('admin_email_salvo', email);
          localStorage.setItem('admin_senha_salva', senha);
        } else {
          localStorage.removeItem('admin_email_salvo');
          localStorage.removeItem('admin_senha_salva');
        }
        
        // Salvar sessão de admin (apenas para manutenção)
        sessionStorage.setItem('admin_manutencao', 'true');
        sessionStorage.setItem('admin_user', email);
        onLoginSuccess();
      } else {
        setError('Email ou senha incorretos');
      }
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
          <p className="text-gray-300">Apenas administradores podem realizar operações administrativas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email do Administrador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="exemplo@controle.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
                  disabled={loading}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Checkbox para lembrar login */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lembrarLogin"
                checked={lembrarLogin}
                onChange={(e) => setLembrarLogin(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="lembrarLogin" className="ml-2 text-sm text-gray-700 cursor-pointer">
                🔐 Lembrar minhas credenciais neste dispositivo
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColetorAutoatendimento() {
  const { 
    coletores, 
    loading, 
    error, 
    stats, 
    retirarColetor, 
    devolverColetor,
    marcarManutencao,
    recarregar 
  } = useColetores();

  const [acao, setAcao] = useState<'retirar' | 'devolver' | 'manutencao'>('retirar');
  const [busca, setBusca] = useState('');
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [turno, setTurno] = useState('Manhã');
  const [observacoes, setObservacoes] = useState('');
  const [coletorSelecionado, setColetorSelecionado] = useState<Coletor | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState<{tipo: 'sucesso' | 'erro', texto: string} | null>(null);
  
  // Estados de autenticação
  const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');

  // Verificar se usuário está logado como admin
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_manutencao');
    const adminUserStorage = sessionStorage.getItem('admin_user');
    
    if (adminAuth === 'true' && adminUserStorage) {
      setIsAdmin(true);
      setAdminUser(adminUserStorage);
    }
  }, []);

  // Filtrar coletores baseado na ação
  const coletoresFiltrados = coletores.filter(coletor => {
    if (acao === 'retirar') {
      return coletor.status === 'disponivel';
    } else if (acao === 'devolver') {
      return coletor.status === 'emprestado';
    } else if (acao === 'manutencao') {
      // Para manutenção, mostrar disponíveis e emprestados (não os que já estão em manutenção)
      return coletor.status === 'disponivel' || coletor.status === 'emprestado';
    }
    return false;
  }).filter(coletor => {
    if (!busca) return true;
    return coletor.numero.toLowerCase().includes(busca.toLowerCase()) ||
           (coletor.colaborador && coletor.colaborador.includes(busca)) ||
           (coletor.nomeColaborador && coletor.nomeColaborador.toLowerCase().includes(busca.toLowerCase()));
  });

  const handleDevolverClick = () => {
    if (!isAdmin) {
      setMostrarLoginAdmin(true);
    } else {
      setAcao('devolver');
      setColetorSelecionado(null);
      setBusca('');
      setObservacoes('');
    }
  };

  const handleManutencaoClick = () => {
    if (!isAdmin) {
      setMostrarLoginAdmin(true);
    } else {
      setAcao('manutencao');
      setColetorSelecionado(null);
      setBusca('');
      setObservacoes('');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setAdminUser(sessionStorage.getItem('admin_user') || '');
    setMostrarLoginAdmin(false);
    
    // Manter a ação desejada quando o login for bem-sucedido
    // Por padrão, vamos para devolução se não estiver em manutenção
    if (acao === 'retirar') {
      setAcao('devolver');
    }
    
    setColetorSelecionado(null);
    setBusca('');
    setObservacoes('');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_manutencao');
    sessionStorage.removeItem('admin_user');
    
    // Perguntar se deseja manter credenciais salvas
    const manterCredenciais = localStorage.getItem('admin_email_salvo');
    if (manterCredenciais) {
      const confirmar = window.confirm('Deseja manter suas credenciais salvas para próximos logins?');
      if (!confirmar) {
        localStorage.removeItem('admin_email_salvo');
        localStorage.removeItem('admin_senha_salva');
      }
    }
    
    setIsAdmin(false);
    setAdminUser('');
    setAcao('retirar');
    setColetorSelecionado(null);
    setObservacoes('');
  };

  const handleSubmit = async () => {
    
    if (!coletorSelecionado) {
      setMensagem({tipo: 'erro', texto: 'Selecione um coletor'});
      return;
    }

    if (acao === 'retirar' && (!matricula || !nome)) {
      setMensagem({tipo: 'erro', texto: 'Preencha sua matrícula e nome'});
      return;
    }

    if ((acao === 'devolver' || acao === 'manutencao') && !isAdmin) {
      setMensagem({tipo: 'erro', texto: 'Apenas administradores podem realizar esta operação'});
      return;
    }

    if (acao === 'manutencao' && !observacoes.trim()) {
      setMensagem({tipo: 'erro', texto: 'Descreva o problema do equipamento'});
      return;
    }

    setProcessando(true);
    setMensagem(null);

    try {
      if (acao === 'retirar') {
        await retirarColetor(coletorSelecionado.id, matricula, nome, turno);
        setMensagem({
          tipo: 'sucesso', 
          texto: `Coletor ${coletorSelecionado.numero} retirado com sucesso!`
        });
      } else if (acao === 'devolver') {
        await devolverColetor(coletorSelecionado.id);
        setMensagem({
          tipo: 'sucesso', 
          texto: `Coletor ${coletorSelecionado.numero} devolvido com sucesso!`
        });
      } else if (acao === 'manutencao') {
        await marcarManutencao(coletorSelecionado.id, observacoes);
        setMensagem({
          tipo: 'sucesso', 
          texto: `Coletor ${coletorSelecionado.numero} marcado para manutenção!`
        });
      }

      // Limpar formulário
      setColetorSelecionado(null);
      setBusca('');
      setMatricula('');
      setNome('');
      setObservacoes('');
      
    } catch (err) {
      setMensagem({
        tipo: 'erro', 
        texto: 'Erro ao processar: ' + (err instanceof Error ? err.message : 'Erro desconhecido')
      });
    } finally {
      setProcessando(false);
    }
  };

  // Auto-hide mensagens
  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando coletores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Modal de Login Admin */}
      {mostrarLoginAdmin && (
        <LoginAdmin 
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={() => setMostrarLoginAdmin(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-between mb-4">
              <div></div> {/* Espaçador */}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🎯 Sistema de Coletores
                </h1>
                <p className="text-gray-600">
                  Retire equipamentos ou acesse funções administrativas
                </p>
              </div>

              {/* Status do Admin */}
              <div className="flex items-center">
                {isAdmin ? (
                  <div className="flex items-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <Shield size={16} className="text-red-600 mr-2" />
                    <div className="text-sm">
                      <div className="font-medium text-red-800">Admin</div>
                      <div className="text-red-600 text-xs">{adminUser}</div>
                    </div>
                    <button
                      onClick={handleAdminLogout}
                      className="ml-3 text-red-600 hover:text-red-800"
                      title="Sair do modo admin"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Usuário padrão
                  </div>
                )}
              </div>
            </div>
            
            {/* Estatísticas resumidas */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">{stats.disponiveis} Disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-700">{stats.emprestados} Em Uso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-700">{stats.manutencao} Manutenção</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensagens */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-lg border ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{mensagem.texto}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span className="text-yellow-800">
                Sistema em modo offline - Algumas funcionalidades podem estar limitadas
              </span>
            </div>
          </div>
        )}

        {/* Seletor de Ação */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => {
                setAcao('retirar');
                setColetorSelecionado(null);
                setBusca('');
                setObservacoes('');
              }}
              className={`py-3 px-6 rounded-lg font-medium transition-all ${
                acao === 'retirar'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📤 Retirar Coletor
            </button>
            <button
              onClick={handleDevolverClick}
              className={`py-3 px-6 rounded-lg font-medium transition-all relative ${
                acao === 'devolver'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📥 Devolver Coletor
              {!isAdmin && (
                <Shield size={16} className="absolute top-2 right-2 text-red-500" />
              )}
            </button>
            <button
              onClick={handleManutencaoClick}
              className={`py-3 px-6 rounded-lg font-medium transition-all relative ${
                acao === 'manutencao'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔧 Marcar Manutenção
              {!isAdmin && (
                <Shield size={16} className="absolute top-2 right-2 text-red-500" />
              )}
            </button>
          </div>

          {/* Aviso para devolução */}
          {acao === 'devolver' && !isAdmin && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="text-green-600" size={20} />
                <span className="text-green-800 font-medium">
                  Acesso restrito: Apenas administradores podem processar devoluções de equipamentos
                </span>
              </div>
            </div>
          )}

          {/* Aviso para manutenção */}
          {acao === 'manutencao' && !isAdmin && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="text-red-600" size={20} />
                <span className="text-red-800 font-medium">
                  Acesso restrito: Apenas administradores podem marcar equipamentos para manutenção
                </span>
              </div>
            </div>
          )}

          {/* Busca */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {acao === 'retirar' && '🔍 Buscar coletor disponível'}
              {acao === 'devolver' && '🔍 Buscar por número do coletor ou matrícula do colaborador'}
              {acao === 'manutencao' && '🔍 Buscar coletor para manutenção'}
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                acao === 'retirar' 
                  ? "Ex: COL001, COL015..." 
                  : acao === 'devolver'
                  ? "Ex: COL001 ou matrícula 12345..."
                  : "Ex: COL001 (equipamento com problema)"
              }
              disabled={(acao === 'devolver' || acao === 'manutencao') && !isAdmin}
            />
          </div>

          {/* Lista de Coletores */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {acao === 'retirar' && `📱 Coletores Disponíveis (${coletoresFiltrados.length})`}
              {acao === 'devolver' && `🔄 Coletores em Uso (${coletoresFiltrados.length})`}
              {acao === 'manutencao' && `🔧 Coletores para Manutenção (${coletoresFiltrados.length})`}
            </h3>
            
            {((acao === 'devolver' || acao === 'manutencao') && !isAdmin) ? (
              <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
                <Shield className="mx-auto text-red-400 mb-4" size={48} />
                <p className="text-red-600 text-lg font-medium mb-2">
                  Acesso Restrito
                </p>
                <p className="text-red-500 mb-4">
                  {acao === 'devolver' 
                    ? 'Faça login como administrador para processar devoluções'
                    : 'Faça login como administrador para marcar equipamentos em manutenção'
                  }
                </p>
                <button
                  onClick={() => setMostrarLoginAdmin(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🔐 Login de Administrador
                </button>
              </div>
            ) : coletoresFiltrados.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <span className="text-4xl mb-4 block">
                  {acao === 'retirar' ? '📭' : acao === 'devolver' ? '🎉' : '🔧'}
                </span>
                <p className="text-gray-600 text-lg">
                  {acao === 'retirar' 
                    ? 'Nenhum coletor disponível no momento'
                    : acao === 'devolver'
                    ? 'Nenhum coletor em uso encontrado'
                    : 'Nenhum coletor encontrado para manutenção'
                  }
                </p>
                <button
                  onClick={recarregar}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  🔄 Atualizar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {coletoresFiltrados.map((coletor) => (
                  <button
                    key={coletor.id}
                    onClick={() => setColetorSelecionado(coletor)}
                    disabled={(acao === 'devolver' || acao === 'manutencao') && !isAdmin}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      coletorSelecionado?.id === coletor.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : (acao === 'devolver' || acao === 'manutencao') && !isAdmin
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {coletor.numero}
                    </div>
                    {(acao === 'devolver' || acao === 'manutencao') && coletor.nomeColaborador && (
                      <div className="text-xs text-gray-600 mb-1">
                        {coletor.nomeColaborador}
                      </div>
                    )}
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                      coletor.status === 'disponivel' 
                        ? 'bg-green-100 text-green-800'
                        : coletor.status === 'emprestado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coletor.status === 'disponivel' ? 'Disponível' : 
                       coletor.status === 'emprestado' ? 'Em uso' : 'Manutenção'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formulário de dados */}
          {coletorSelecionado && ((acao === 'retirar') || (acao === 'devolver' && isAdmin) || (acao === 'manutencao' && isAdmin)) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {acao === 'retirar' && `📤 Retirar ${coletorSelecionado.numero}`}
                  {acao === 'devolver' && `📥 Devolver ${coletorSelecionado.numero}`}
                  {acao === 'manutencao' && `🔧 Marcar ${coletorSelecionado.numero} para Manutenção`}
                </h4>
                
                {(acao === 'devolver' || acao === 'manutencao') && coletorSelecionado.nomeColaborador && (
                  <p className="text-sm text-gray-600 mb-4">
                    {coletorSelecionado.status === 'emprestado' ? 'Emprestado para: ' : 'Usado por: '}
                    <strong>{coletorSelecionado.nomeColaborador}</strong> 
                    {coletorSelecionado.dataRetirada && (
                      <span> em {new Date(coletorSelecionado.dataRetirada).toLocaleString('pt-BR')}</span>
                    )}
                  </p>
                )}

                {/* Badge de admin para devolução e manutenção */}
                {(acao === 'devolver' || acao === 'manutencao') && isAdmin && (
                  <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm mb-4">
                    <Shield size={14} className="mr-2" />
                    Logado como Administrador ({adminUser})
                  </div>
                )}
              </div>

              {/* Campos específicos por ação */}
              {acao === 'retirar' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sua Matrícula *
                    </label>
                    <input
                      type="text"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 12345"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seu Turno
                    </label>
                    <select
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Manhã">🌅 Manhã (06:00 - 14:00)</option>
                      <option value="Tarde">☀️ Tarde (14:00 - 22:00)</option>
                      <option value="Noite">🌙 Noite (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
              )}

              {acao === 'manutencao' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descreva o Problema *
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 min-h-[100px]"
                    placeholder="Ex: Tela quebrada, não liga, botão travado, etc..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Seja específico sobre o problema para facilitar o reparo
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setColetorSelecionado(null);
                    setObservacoes('');
                  }}
                  className="flex-1 py-3 px-6 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processando}
                  className={`flex-1 py-3 px-6 text-white rounded-lg font-medium transition-all ${
                    acao === 'retirar'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : acao === 'devolver'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processando ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </span>
                  ) : (
                    <>
                      {acao === 'retirar' && '📤 Confirmar Retirada'}
                      {acao === 'devolver' && '📥 Confirmar Devolução'}
                      {acao === 'manutencao' && '🔧 Marcar para Manutenção'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com instruções */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ℹ️ Como usar o sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📤 Para Retirar:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em "Retirar Coletor"</li>
                <li>Busque pelo número do equipamento</li>
                <li>Selecione o coletor desejado</li>
                <li>Preencha sua matrícula e nome</li>
                <li>Confirme a retirada</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                📥 Para Devolver:
                <Shield size={16} className="ml-2 text-green-500" />
              </h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Faça login como administrador</strong></li>
                <li>Clique em "Devolver Coletor"</li>
                <li>Busque pelo número ou matrícula</li>
                <li>Selecione o coletor a devolver</li>
                <li>Confirme a devolução</li>
                <li>Pronto! Equipamento liberado</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                🔧 Para Manutenção:
                <Shield size={16} className="ml-2 text-red-500" />
              </h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Faça login como administrador</strong></li>
                <li>Clique em "Marcar Manutenção"</li>
                <li>Busque o coletor com problema</li>
                <li>Selecione o equipamento</li>
                <li>Descreva o problema detalhadamente</li>
                <li>Confirme para enviar à manutenção</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Importante:</strong> Sempre confirme o número do coletor antes de qualquer ação. 
              <strong className="flex items-center mt-1">
                <Shield size={14} className="mr-1" />
                Funcionalidades de devolução e manutenção restritas apenas a administradores autorizados.
              </strong>
            </p>
          </div>

          {/* Credenciais de teste para administrador */}
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
              <Shield size={14} className="mr-2" />
              Credenciais de Teste - Administrador:
            </h4>
            <div className="text-sm text-red-700">
              <p><strong>Email:</strong> admin@coletores.com</p>
              <p><strong>Senha:</strong> admin123</p>
              <p className="mt-2 text-xs">
                <strong>Acesso liberado para:</strong> Devolução de equipamentos e marcação para manutenção
              </p>
              <p className="mt-1 text-xs">
                💡 <strong>Dica:</strong> Use a opção "Lembrar credenciais" para facilitar próximos acessos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}