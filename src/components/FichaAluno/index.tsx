import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { Aluno } from '../../types/aluno'

interface FichaAlunoProps {
  alunos: Aluno[]
  // o `?` diz que esta prop e' OPCIONAL: uma ficha pode viver sem espera nenhuma
  // (turma escrita no codigo). Quando a turma chega pela rede, o App manda o valor de verdade.
  carregando?: boolean
}

function FichaAluno({ alunos, carregando = false }: FichaAlunoProps) {
  // useParams NAO sabe em que rota estamos: para ele, todo parametro
  // pode faltar. Por isso o tipo de `id` e' `string | undefined`.
  const { id } = useParams()
  const navigate = useNavigate()

  // duas guardas, e as duas sao necessarias por motivos DIFERENTES:
  // 1) `id === undefined` — o TIPO avisa que pode faltar. O compilador NAO obriga
  //    aqui: medido, `Number(undefined)` compila e devolve NaN. A guarda e' decisao
  //    NOSSA — ela troca um NaN silencioso por um caso escrito no codigo;
  // 2) o numero procurado pode ser NaN (URL /aluno/abc) ou um id que nao esta na turma.
  const procurado = id === undefined ? undefined : Number(id)
  const aluno = procurado === undefined ? undefined : alunos.find(item => item.id === procurado)

  useEffect(() => {
    // NINGUEM clicou: o CODIGO decide sair daqui, porque este id nao existe na turma.
    // Esperamos a turma chegar antes de decidir — senao a ficha sairia durante o carregamento.
    if (!carregando && alunos.length > 0 && aluno === undefined) {
      // replace: true troca a URL ruim no historico. Sem isso, o Voltar do
      // navegador devolve a pessoa para a URL ruim, em loop.
      navigate('/', { replace: true })
    }
  }, [carregando, alunos.length, aluno, navigate])

  // enquanto a turma nao chegou, a regiao viva do App ja anuncia a espera
  if (carregando) return null
  // o efeito acima ja esta levando a pessoa embora; nao pintamos nada no caminho
  if (aluno === undefined) return null

  return (
    <section className="quadro">
      <h2>{aluno.nome}</h2>
      <p className="placar"><span className={aluno.presente ? 'badge ok' : 'badge nope'}>{aluno.presente ? 'presente hoje' : 'ausente hoje'}</span></p>
      <ul>
        <li className="cartao">
          <span className="nome">entregas</span>
          <span className="contagem">{aluno.entregas}</span>
        </li>
        <li className="cartao">
          <span className="nome">id na turma</span>
          <span className="contagem">{aluno.id}</span>
        </li>
      </ul>
      {/* a PESSOA escolheu voltar: tem de ser um link, para abrir em nova aba e copiar endereco */}
      <Link to="/" className="voltar">voltar para a chamada</Link>
    </section>
  )
}

export default FichaAluno
