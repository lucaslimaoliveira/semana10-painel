import type { Aluno } from '../../types/aluno'

interface CartaoEntregaProps {
  aluno: Aluno
  onEntrega: (id: number) => void
  onRemoverEntrega: (id: number) => void
  salvando?: boolean
}

function CartaoEntrega({ aluno, onEntrega, onRemoverEntrega, salvando = false }: CartaoEntregaProps) {
  return (
    <li className="cartao">
      <span className="nome">{aluno.nome}</span>
      <span className="contagem">{aluno.entregas}</span>
      <button type="button" aria-label={`Adicionar uma entrega de ${aluno.nome}`} onClick={() => onEntrega(aluno.id)} disabled={salvando}>+1 entrega</button>
      <button type="button" aria-label={`Remover uma entrega de ${aluno.nome}`} onClick={() => onRemoverEntrega(aluno.id)} disabled={salvando}>−1 entrega</button>
    </li>
  )
}

export default CartaoEntrega
