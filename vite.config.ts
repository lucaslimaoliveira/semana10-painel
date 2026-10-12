import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import type { Aluno } from './src/types/aluno.ts'

// ---- mini-servidor da turma: SO' em desenvolvimento (npm run dev) ----
// Espera artificial de cada resposta, em milissegundos. Em localhost a rede responde em 2 ms:
// sem isto, "carregando" e "salvando" passam rapido demais para alguem ver. 0 desliga a espera.
const ATRASO_MS = 700

type Mudanca = Partial<Pick<Aluno, 'presente' | 'entregas'>>

function esperar(ms: number) {
  return new Promise<void>(pronto => setTimeout(pronto, ms))
}

function responder(res: ServerResponse, status: number, corpo: unknown, extra: Record<string, string> = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [nome, valor] of Object.entries(extra)) res.setHeader(nome, valor)
  res.end(JSON.stringify(corpo))
}

async function lerCorpo(req: IncomingMessage) {
  const pedacos: Buffer[] = []
  for await (const pedaco of req) pedacos.push(pedaco)
  return Buffer.concat(pedacos).toString('utf-8')
}

// devolve a mudanca valida, ou o MOTIVO da recusa (uma frase que aparece na aba Network)
function validar(corpo: unknown): Mudanca | string {
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) return 'o corpo deve ser um objeto JSON'
  const mudanca: Mudanca = {}
  for (const [campo, valor] of Object.entries(corpo as Record<string, unknown>)) {
    if (campo === 'presente') {
      if (typeof valor !== 'boolean') return 'presente deve ser true ou false'
      mudanca.presente = valor
    } else if (campo === 'entregas') {
      if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 0) return 'entregas deve ser um inteiro maior ou igual a 0'
      mudanca.entregas = valor
    } else {
      return `campo desconhecido: ${campo} (aceitos: presente, entregas)`
    }
  }
  if (Object.keys(mudanca).length === 0) return 'nada para mudar: envie presente e/ou entregas'
  return mudanca
}

// le a turma inicial; se o arquivo estiver errado, o erro DIZ qual arquivo (virgula sobrando e' o classico)
function lerTurma(arquivo: string): Aluno[] {
  try {
    const dados: unknown = JSON.parse(readFileSync(arquivo, 'utf-8').replace(/^\uFEFF/, ''))   // tira o BOM que o Bloco de Notas do Windows poe
    if (!Array.isArray(dados)) throw new Error('o arquivo deve conter uma LISTA de alunos: [ {...}, {...} ]')
    return dados
  } catch (falha) {
    throw new Error(`servidor-da-turma: nao consegui ler ${arquivo} -> ${falha instanceof Error ? falha.message : falha}`)
  }
}

function servidorDaTurma(): Plugin {
  return {
    name: 'servidor-da-turma',
    apply: 'serve',   // so' no dev: `vite build` e `vite preview` nao levam este servidor
    configureServer(servidor) {
      // resolve() usa a barra certa de cada sistema (Windows: \) e parte da raiz do projeto
      const arquivo = resolve(servidor.config.root, 'public', 'alunos.json')
      // a turma vive na MEMORIA: nasce deste arquivo e volta a ele toda vez que o Vite reinicia
      const alunos = lerTurma(arquivo)

      servidor.middlewares.use('/api/alunos', async (req, res) => {
        try {
          const texto = await lerCorpo(req)
          await esperar(ATRASO_MS)

          const rota = (req.url ?? '').split('?')[0]
          if (rota === '' || rota === '/') {
            if (req.method !== 'GET') return responder(res, 405, { erro: 'use GET' }, { Allow: 'GET' })
            return responder(res, 200, alunos)
          }

          const achado = /^\/(\d+)$/.exec(rota)
          const aluno = achado ? alunos.find(item => item.id === Number(achado[1])) : undefined
          if (aluno === undefined) return responder(res, 404, { erro: `aluno nao encontrado: ${rota}` })
          if (req.method !== 'PATCH') return responder(res, 405, { erro: 'use PATCH' }, { Allow: 'PATCH' })
          if (!String(req.headers['content-type']).startsWith('application/json')) {
            return responder(res, 415, { erro: 'envie o cabecalho Content-Type: application/json' })
          }

          let corpo: unknown
          try {
            corpo = JSON.parse(texto)
          } catch {
            return responder(res, 400, { erro: 'o corpo nao e JSON valido' })
          }
          const mudanca = validar(corpo)
          if (typeof mudanca === 'string') return responder(res, 400, { erro: mudanca })

          Object.assign(aluno, mudanca)
          return responder(res, 200, aluno)
        } catch (falha) {
          console.error('[servidor-da-turma]', falha)
          return responder(res, 500, { erro: 'erro interno do mini-servidor' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), servidorDaTurma()],
})
