import type { Aluno } from '../types/aluno'

// Dados externos começam como unknown: tipos TS não validam a rede.
function ehAluno(valor: unknown): valor is Aluno {
  if (typeof valor !== 'object' || valor === null) return false
  const item = valor as Record<string, unknown>
  return typeof item.id === 'number' && Number.isInteger(item.id)
    && typeof item.nome === 'string' && typeof item.presente === 'boolean'
    && typeof item.entregas === 'number' && Number.isInteger(item.entregas) && item.entregas >= 0
}

export async function buscarTurma(): Promise<Aluno[]> {
  let frase = 'Sem conexão com o servidor da turma. Confira a conexão e tente novamente.'
  try {
    const resposta = await fetch(import.meta.env.VITE_API_URL, {
      headers: { Accept: 'application/json' },
    })
    frase = 'O servidor respondeu com erro ao carregar a turma. Tente novamente daqui a pouco.'
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    frase = 'A turma chegou num formato que o painel não entende. Avise quem cuida do painel.'
    const dados: unknown = await resposta.json()
    if (!Array.isArray(dados) || !dados.every(ehAluno)) throw new Error('lista de alunos inválida')
    return dados
  } catch (falha) {
    console.error('[buscarTurma]', falha)
    throw new Error(frase)
  }
}

export async function atualizarAluno(
  id: number,
  mudanca: Partial<Pick<Aluno, 'presente' | 'entregas'>>,
): Promise<Aluno> {
  let frase = 'Sem conexão com o servidor da turma. A alteração não foi salva. Tente novamente.'
  try {
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mudanca),
    })
    frase = resposta.status === 400
      ? 'O servidor recusou esse valor. Entregas deve ser um inteiro maior ou igual a zero.'
      : 'O servidor respondeu com erro ao salvar. A alteração não foi salva. Tente novamente daqui a pouco.'
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    frase = 'O servidor devolveu um aluno em formato inválido. Recarregue para conferir os dados.'
    const atualizado: unknown = await resposta.json()
    if (!ehAluno(atualizado) || atualizado.id !== id) throw new Error('aluno atualizado inválido')
    return atualizado
  } catch (falha) {
    console.error('[atualizarAluno]', falha)
    throw new Error(frase)
  }
}
