import { Link } from 'react-router'

// A rota curinga (path="*") aponta para AQUI. Nao e' um paragrafo solto:
// e' uma tela, com titulo, explicacao e uma saida.
function NaoEncontrado() {
  return (
    <section className="quadro">
      <h2>Esta tela não existe</h2>
      <p className="erro">O endereço que você abriu não corresponde a nenhuma tela do painel.</p>
      <Link to="/" className="voltar">ir para a chamada</Link>
    </section>
  )
}

export default NaoEncontrado
