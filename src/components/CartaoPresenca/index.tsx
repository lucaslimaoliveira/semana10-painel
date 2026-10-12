import { Link } from 'react-router'
import type { Aluno } from '../../types/aluno'

interface CartaoPresencaProps {
  aluno: Aluno
  onPresenca: (id: number) => void
  salvando?: boolean
}

function CartaoPresenca({ aluno, onPresenca, salvando = false }: CartaoPresencaProps) {
  return (
    <li className="cartao">
      {/* o nome vira LINK: o texto do link e' o nome, que faz sentido fora de contexto */}
      <span className="nome"><Link to={`/aluno/${aluno.id}`}>{aluno.nome}</Link></span>
      <span className={aluno.presente ? 'badge ok' : 'badge nope'}>
        {aluno.presente ? 'presente' : 'ausente'}
      </span>
      <button type="button" aria-label={`${aluno.presente ? 'Marcar falta' : 'Marcar presença'} de ${aluno.nome}`} onClick={() => onPresenca(aluno.id)} disabled={salvando}>
        {aluno.presente ? 'marcar falta' : 'marcar presença'}
      </button>
    </li>
  )
}

export default CartaoPresenca
