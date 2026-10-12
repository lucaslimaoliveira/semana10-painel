import { useState } from 'react'
import type { Aluno } from '../../types/aluno'
import CartaoPresenca from '../CartaoPresenca'

interface ChamadaProps {
  alunos: Aluno[]
  onPresenca: (id: number) => void
  salvando?: boolean
}

function Chamada({ alunos, onPresenca, salvando = false }: ChamadaProps) {
  const [busca, setBusca] = useState('')

  // O placar deriva da TURMA INTEIRA (alunos) — nunca da lista filtrada.
  const presentes = alunos.filter(aluno => aluno.presente).length
  const todosPresentes = alunos.length > 0 && alunos.every(aluno => aluno.presente)

  // A busca filtra APENAS o que a <ul> renderiza.
  const termo = busca.trim().toLowerCase()
  const visiveis = termo === ''
    ? alunos
    : alunos.filter(aluno => aluno.nome.toLowerCase().includes(termo))

  return (
    <section className="quadro">
      <h2>Chamada</h2>
      <p className="placar">Presentes: {presentes} de {alunos.length}</p>
      <p className="aviso" role="status" aria-live="polite">
        {todosPresentes && <span className="completa">turma completa!</span>}
      </p>

      <div className="busca">
        <label htmlFor="busca-aluno">Buscar aluno</label>
        <input id="busca-aluno" type="search" value={busca}
               onChange={evento => setBusca(evento.target.value)} placeholder="digite um nome" />
      </div>

      <ul>
        {visiveis.map(aluno => (
          <CartaoPresenca key={aluno.id} aluno={aluno} onPresenca={onPresenca} salvando={salvando} />
        ))}
      </ul>
    </section>
  )
}

export default Chamada
