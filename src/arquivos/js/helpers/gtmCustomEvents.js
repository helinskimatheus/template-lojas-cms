/**
 * Remover do Carrinho
 */
export function addToCartM3GtmEvent() {
	dataLayer.push({ event: "m3-addToCart" });
}

/**
 * Visualização Virtual de Produto
 */
export function productDetailM3GtmEvent() {
	dataLayer.push({ event: "m3-productDetail" });
}

/**
 * Remover do Carrinho
 */
export function removeFromCartM3GtmEvent() {
	dataLayer.push({ event: "m3-removeFromCart" });
}
