import type { Aluno } from '../../types/aluno'
import CartaoEntrega from '../CartaoEntrega'

interface EntregasProps {
  alunos: Aluno[]
  onEntrega: (id: number) => void
  onRemoverEntrega: (id: number) => void
  salvando?: boolean
}

function Entregas({ alunos, onEntrega, onRemoverEntrega, salvando = false }: EntregasProps) {
  const total = alunos.reduce((soma, aluno) => soma + aluno.entregas, 0)

  return (
    <section className="quadro">
      <h2>Entregas</h2>
      <p className="placar">Total de entregas: {total}</p>
      <ul>
        {alunos.map(aluno => (
          <CartaoEntrega key={aluno.id} aluno={aluno} onEntrega={onEntrega} onRemoverEntrega={onRemoverEntrega} salvando={salvando} />
        ))}
      </ul>
    </section>
  )
}

export default Entregas
