import { BrowserRouter, Routes, Route, NavLink } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import type { Aluno } from './types/aluno'
import { atualizarAluno, buscarTurma } from './services/turma'
import Cabecalho from './components/Cabecalho'
import Chamada from './components/Chamada'
import Entregas from './components/Entregas'
import FichaAluno from './components/FichaAluno'
import NaoEncontrado from './components/NaoEncontrado'

function App() {
  // a turma nao mora mais no codigo: ela CHEGA pela rede
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  // escrita: tres estados PROPRIOS. O erro de salvar nao esconde a tela (o de leitura esconde)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  // Trava imediata também cobre dois eventos antes da próxima renderização.
  const escritaEmCurso = useRef(false)

  const [tentativa, setTentativa] = useState(0)
  const botaoTentar = useRef<HTMLButtonElement>(null)

  function tentarNovamente() {
    setCarregando(true)
    setErro('')
    setTentativa(valor => valor + 1)
  }

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const dados = await buscarTurma()   // nenhum fetch aqui: quem fala com a rede e' o servico
        if (ativo) setAlunos(dados)
      } catch (falha) {
        if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar a turma.')
      } finally {
        if (ativo) setCarregando(false)   // deu certo ou errado, a espera acabou
      }
    }

    void carregar()
    return () => { ativo = false }
  }, [tentativa])

  useEffect(() => {
    // O botão desmonta ao tentar; devolvemos o foco se a tentativa falhar.
    if (erro && tentativa > 0) botaoTentar.current?.focus()
  }, [erro, tentativa])

  // PESSIMISTA: a tela so muda DEPOIS que o servidor responde. Mesmo molde do carregar():
  // liga o estado, tenta, mostra o erro, desliga o estado — agora com o servidor no meio.
  async function marcarPresenca(id: number) {
    const aluno = alunos.find(item => item.id === id)
    if (aluno === undefined || escritaEmCurso.current) return
    escritaEmCurso.current = true
    setSalvando(true)
    setSalvo(false)
    setErroSalvar('')
    try {
      const atualizado = await atualizarAluno(id, { presente: !aluno.presente })
      setAlunos(anteriores => anteriores.map(item => item.id === id ? atualizado : item))
      setSalvo(true)
    } catch (falha) {
      setErroSalvar(falha instanceof Error ? falha.message : 'Não foi possível salvar.')
    } finally {
      escritaEmCurso.current = false
      setSalvando(false)
    }
  }

  async function registrarEntrega(id: number) {
    const aluno = alunos.find(item => item.id === id)
    if (aluno === undefined || escritaEmCurso.current) return
    escritaEmCurso.current = true
    setSalvando(true)
    setSalvo(false)
    setErroSalvar('')
    try {
      const atualizado = await atualizarAluno(id, { entregas: aluno.entregas + 1 })
      setAlunos(anteriores => anteriores.map(item => item.id === id ? atualizado : item))
      setSalvo(true)
    } catch (falha) {
      setErroSalvar(falha instanceof Error ? falha.message : 'Não foi possível salvar.')
    } finally {
      escritaEmCurso.current = false
      setSalvando(false)
    }
  }

  // N3: decremento próprio; a recusa de -1 vem do servidor, não de uma conta otimista.
  async function removerEntrega(id: number) {
    const aluno = alunos.find(item => item.id === id)
    if (aluno === undefined || escritaEmCurso.current) return
    escritaEmCurso.current = true
    setSalvando(true)
    setSalvo(false)
    setErroSalvar('')
    try {
      const atualizado = await atualizarAluno(id, { entregas: aluno.entregas - 1 })
      setAlunos(anteriores => anteriores.map(item => item.id === id ? atualizado : item))
      setSalvo(true)
    } catch (falha) {
      setErroSalvar(falha instanceof Error ? falha.message : 'Não foi possível salvar a entrega.')
    } finally {
      escritaEmCurso.current = false
      setSalvando(false)
    }
  }

  // a espera acabou E nao deu erro: so' agora as telas tem dados de verdade para mostrar
  const terminou = !carregando && !erro
  // terminou sem erro, mas a lista veio vazia: e' um 4o estado, e a tela tem de dizer isso
  const vazia = terminou && alunos.length === 0

  return (
    <BrowserRouter>
      <div className="painel">
        <Cabecalho />

        {/* as abas viraram LINKS: cada tela tem uma URL, e a URL sobrevive ao F5 */}
        <nav className="abas" aria-label="Telas do painel">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'aba ativa' : 'aba')}>Chamada</NavLink>
          <NavLink to="/entregas" className={({ isActive }) => (isActive ? 'aba ativa' : 'aba')}>Entregas</NavLink>
        </nav>

        <main>
          {/* as MESMAS regioes vivas da S08 — agora anunciam a rede.
              dentro do <main>: quem navega por marcos TEM de alcancar o aviso */}
          <p className="aviso" role="status" aria-live="polite">
            {carregando && <span>carregando a turma...</span>}
            {vazia && <span>A turma chegou vazia: ainda não há nenhum aluno para mostrar.</span>}
          </p>
          <div className="erro" role="alert" aria-live="assertive">
            {erro && <>
              <p>{erro}</p>
              <button ref={botaoTentar} type="button" onClick={tentarNovamente}>Tentar novamente</button>
            </>}
          </div>
          {/* a ESCRITA ganha as mesmas duas regioes, separadas das da leitura, numa faixa de
              altura FIXA (medido: sem ela, "salvando..." empurrava a lista 36 px para baixo) */}
          <div className="salvar">
            <p className="aviso" role="status" aria-live="polite">
              {salvando && <span>salvando...</span>}
              {salvo && <span>salvo</span>}
            </p>
            <p className="erro" role="alert" aria-live="assertive">{erroSalvar}</p>
          </div>

          {terminou && !vazia && <Routes>
            <Route path="/" element={<Chamada alunos={alunos} onPresenca={marcarPresenca} salvando={salvando} />} />
            <Route path="/entregas" element={<Entregas alunos={alunos} onEntrega={registrarEntrega} onRemoverEntrega={removerEntrega} salvando={salvando} />} />
            {/* a URL carrega um DADO: o :id diz de quem e' a ficha */}
            <Route path="/aluno/:id" element={<FichaAluno alunos={alunos} carregando={carregando} />} />
            {/* qualquer outro endereco: a rota existe, e ela mostra uma TELA de erro.
                A ORDEM NAO DECIDE: o React Router escolhe a rota MAIS ESPECIFICA (medido: com
                "*" na primeira linha, as outras telas continuam abrindo). Ela fica por ultimo
                por LEITURA — e' o "senao" do mapa, e quem le espera o "senao" no fim. */}
            <Route path="*" element={<NaoEncontrado />} />
          </Routes>}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
