import { createContext, useContext, useEffect, useState } from "react";
import { usePagamentoContext } from "./Pagamento";
import { UsuarioContext } from "./Usuario";

export const carrinhoContext = createContext();
carrinhoContext.displayName = 'carrinho';

export function CarrinhoProvider({ children }) {

    const [quantidadeProdutos, setQuantidadeProdutos] = useState(0);
    const [carrinho, setCarrinho] = useState([]);
    const [valorTotal, setValorTotal] = useState(0)

    return (
        <carrinhoContext.Provider
            value={{
                carrinho,
                setCarrinho,
                quantidadeProdutos,
                setQuantidadeProdutos,
                valorTotal,
                setValorTotal
            }}
        >
            {children}
        </carrinhoContext.Provider>
    )

}

export function useCarrinhoContext() {
    const { carrinho, setCarrinho, quantidadeProdutos, setQuantidadeProdutos, valorTotal, setValorTotal } = useContext(carrinhoContext)
    const { formaPagamento } = usePagamentoContext();
    const { setSaldo } = useContext(UsuarioContext)

    function mudarQuantidade(id, quantidade) {
        return (carrinho.map(produtoCarrinho => {
            if (produtoCarrinho.id === id) {
                produtoCarrinho.quantidade += quantidade
            }
            return produtoCarrinho
        }))
    }

    function adicionarProduto(novoProduto) {

        const temOProduto = carrinho.some(itemDoCarrinho => itemDoCarrinho.id === novoProduto.id);

        if (!temOProduto) {
            novoProduto.quantidade = 1;
            return setCarrinho(carrinhoAnterior =>
                [...carrinhoAnterior, novoProduto]
            )
        }
        setCarrinho(mudarQuantidade(novoProduto.id, 1))

    }

    function removerProduto({ id }) {
        const temOProduto = carrinho.find(produtoDoCarrinho => produtoDoCarrinho.id === id)
        const ehOUltimo = temOProduto.quantidade === 1;
        if (ehOUltimo) {
            return setCarrinho(carrinhoAnterior => carrinhoAnterior.filter(produtoDoCarrinho => produtoDoCarrinho.id !== id))
        }


        setCarrinho(mudarQuantidade(id, -1))
    }

    function efetuarCompra(){
        setCarrinho([])
        setSaldo(saldoAtual => saldoAtual - valorTotal)
    }


    useEffect(() => {
        const { novoTotal, novaQuantidade } = carrinho.reduce((contador, produto) => ({
            novaQuantidade: contador.novaQuantidade + produto.quantidade,
            novoTotal: contador.novoTotal + (produto.quantidade * produto.valor)
        }), {
            novoTotal: 0,
            novaQuantidade: 0
        }
        );
        setQuantidadeProdutos(novaQuantidade)
        setValorTotal((novoTotal * formaPagamento.juros).toFixed(2))
    }, [carrinho, setQuantidadeProdutos, setValorTotal, formaPagamento])


    return {
        carrinho,
        setCarrinho,
        adicionarProduto,
        removerProduto,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotal,
        efetuarCompra
    }
}