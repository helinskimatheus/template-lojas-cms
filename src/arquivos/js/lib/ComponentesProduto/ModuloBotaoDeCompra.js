import { Modulo } from "./Modulo";
/**
 * Modulo de compra
 * permite adicopnar produtos ao carinho
 * fornece o formulario de avise-me para produtos indisponiveis
 * exibe popup de "porduto adicionado ao carrinho"
 *
 * usa api vtex para adicionar no carrinho
 * @link https://github.com/vtex/vtex.js/tree/master/docs/checkout#addtocartitems-expectedorderformsections-saleschannel
 */
export var ModuloBotaoDeCompra = function(elemento = ".btnBuy") {
	Modulo.call(this, elemento);
	var _this = this;
	_this.produtoEscolhido = {
		sku: null,
		quantidade: 1
	};
	this._opcoes = {
		botaoCompra: "Comprar",
		botaoSkuIndisponivel: "Produto indisponível",
		msgVariacaoErro: "<p>Escolha uma variação.</p>",
		msgByEvent: false,
		msgAddCarrinhoErro: "<p>Não foi possivel adicionar ao carrinho!</p>",
		msgAddCarrinhoSucesso:
			"<p>Seu produto foi adicionado ao carrinho com sucesso!</p><p>O que deseja fazer agora?</p>",
		botaoContinuarComrpando: "Continuar comprando",
		botaoFinalizarCompra: "Finalizar compra"
	};
	/**
	 * Atualiza a quantidade de acordo com o novo sku
	 * @param  {Event} event evento que disparou atualização
	 * @param  {Object} value objeto do sku selecionado
	 * @return {Object} this
	 */
	this.atualizar = function(event, value) {
		if (event) {
			switch (event.type) {
				case "change-quantidade":
					_this.produtoEscolhido.quantidade = value;
					break;
				case "change-sku":
					var sku = JSON.parse(
						sessionStorage.getItem("sku-selecionado")
					);
					_this.produtoEscolhido.sku = sku;
					this.habilitar(sku.available);
					break;
				default:
					console.warn("Evento desconhecido");
					break;
			}
		} else {
			console.warn("Essa funcao só deve ser chamada por eventos js");
		}
		return this;
	};
	this.obterCannalDeVendas = function() {
		var name = "VTEXSC=sc=";
		var ca = document.cookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") c = c.substring(1);
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return 1;
	};
	/**
	 * Configura os eventos js que serão diparados pelo html do desenhar()
	 * @return {object} this
	 */
	this.configurar = function(opcoes) {
		this.opcoes($.extend({}, this._opcoes, opcoes));
		this.opcoes.cannalDeVendas = this.obterCannalDeVendas();

		$(document).on("change-sku", this.atualizar.bind(this));
		$(document).on("change-quantidade", this.atualizar.bind(this));
		$(document).on(
			"add-skuAddCarrinho.sucess",
			this.sucessoAjax.bind(this)
		);
		$(document).on("add-skuAddCarrinho.fail", this.erroAjax.bind(this));
		return this;
	};
	/**
	 * Cria e insere o html com as variações dos skus
	 * @return {object} this
	 */
	this.desenhar = function() {
		const html = `
			<a class="btn-compra" id="buy-btn">
				${this.opcoes().botaoCompra}
			</a>
		`;

		this.elemento().append(html);
		$(".btn-compra").click(this.compra.bind(this));

		return this;
	};
	this.compra = function() {
		if (_this.produtoEscolhido.sku === null) {
			mensagemErro(this.opcoes().msgVariacaoErro);
		} else if (
			!_this.produtoEscolhido.sku.available &&
			_this.produtoEscolhido.quantidade < 1
		) {
			this.elemento().trigger(
				"add-skuAddCarrinho.fail",
				_this.produtoEscolhido
			);
		} else {
			try {
				window.vtexjs.checkout
					.addToCart(
						[
							{
								id: _this.produtoEscolhido.sku.sku,
								quantity: _this.produtoEscolhido.quantidade,
								seller: _this.produtoEscolhido.sku.sellerId
							}
						],
						null,
						this.opcoes.cannalDeVendas
					)
					.done(
						function(orderForm) {
							this.elemento().trigger(
								"add-skuAddCarrinho.sucess",
								{
									simpleProducts: _this.produtoEscolhido,
									orderForm: orderForm
								}
							);
						}.bind(this)
					)
					.fail(
						function() {
							this.elemento().trigger("add-skuAddCarrinho.fail", {
								simpleProducts: _this.produtoEscolhido
							});
						}.bind(this)
					);
			} catch (error) {
				this.elemento().trigger("add-skuAddCarrinho.fail", {
					simpleProducts: _this.produtoEscolhido
				});
				console.warn("Erro ao adicionar sku ao carrinho de compra");
				console.log(error);
			}
		}
	};
	this.sucessoAjax = function(items) {
		if (!this._opcoes.msgByEvent) {
			var fechar = function(event) {
				event.preventDefault();
				$popup.removeClass("show");
				$popup.remove();
				$overlay.remove();
			};

			var $popup = $("<div />", {
				class: "modal-add-cart modal"
			});

			var $popupBox = $("<div />", {
				class: "modal-add-cart__box"
			}).appendTo($popup);

			var $overlay = $("<div />", {
				class: "modal-add-cart__overlay modal-overlay"
			}).click(fechar);

			$("<button />", {
				html: "<i class='sprite sprite-fechar'></i>",
				class: "close"
			})
				.click(fechar)
				.appendTo($popupBox);

			var $information = $("<div />", {
				class: "information"
			}).appendTo($popupBox);

			$("<img />", {
				src: _this.produtoEscolhido.sku.image,
				alt: _this.produtoEscolhido.sku.skuname
			}).appendTo($information);

			$("<div />", {
				class: "descricao",
				html: _this._opcoes.msgAddCarrinhoSucesso
			}).appendTo($information);

			var $acoes = $("<div />", {
				class: "acoes"
			}).appendTo($popupBox);

			$("<a />", {
				href: "#",
				class: "continue",
				text: _this._opcoes.botaoContinuarComprando
			})
				.click(fechar)
				.appendTo($acoes);

			$("<a />", {
				href: "/checkout/#/cart",
				class: "cart",
				target: "_top",
				text: _this._opcoes.botaoFinalizarCompra
			}).appendTo($acoes);

			this.elemento()
				.find(".erro-add-cart")
				.fadeOut("slow");
			// $popup.hide().appendTo(this.elemento()).fadeIn('slow');
			$popup.appendTo(this.elemento());
			$overlay.insertAfter($popup);
			$popup.addClass("show");
		}
	};
	this.erroAjax = function() {
		mensagemErro(_this.opcoes().msgAddCarrinhoErro);
	};
	/**
	 * Altera o texto do botão para produtos indisponiveis
	 * @param {boolean} habilitar
	 */
	this.habilitar = function(habilitar) {
		habilitar = typeof habilitar == "undefined" ? true : habilitar;
		this.elemento().toggleClass("desativado", !habilitar);
		var textBtn = habilitar
			? this.opcoes().icone + this.opcoes().botaoCompra
			: this.opcoes().botaoSkuIndisponivel;
		this.elemento()
			.find(".btn-compra")
			.html(textBtn);
	};

	function mensagemErro(mensagemDeErro) {
		if (_this.elemento().find(".erro-add-cart").length < 1) {
			var container = $("<div />", {
				class: "erro-add-cart"
			}).prependTo(_this.elemento());
			// btn fechar
			$("<span />")
				.attr({
					class: "close"
				})
				.click(function(event) {
					event.preventDefault();
					container.fadeOut("slow");
				})
				.appendTo(container);
			$("<div />", {
				class: "info",
				html: mensagemDeErro
			}).appendTo(container);
		} else {
			_this
				.elemento()
				.find(".erro-add-cart")
				.fadeIn("slow");
		}
		setTimeout(
			function() {
				_this
					.elemento()
					.find(".erro-add-cart")
					.fadeOut("slow");
			}.bind(this),
			1000
		);
		_this
			.elemento()
			.find(".modal-add-cart")
			.remove();
		_this
			.elemento()
			.find(".modal-add-cart__overlay")
			.remove();
	}
};
// subclasse extende superclasse
ModuloBotaoDeCompra.prototype = Object.create(Modulo.prototype);
ModuloBotaoDeCompra.prototype.constructor = ModuloBotaoDeCompra;