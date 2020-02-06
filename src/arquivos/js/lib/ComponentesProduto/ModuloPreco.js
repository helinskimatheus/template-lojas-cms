const { Modulo } = require("./Modulo");
const { ModuloPrecoDe, ModuloPrecoPor, ModuloPrecoParcelado, ModuloPrecoBoleto } = require("./SubModulos/ModulosTiposDePreco");
/**
 * modulo preco
 * Mantem o preço de exibição atualizado
 */
var ModuloPreco = function (elemento = '.preco-produto') {
	Modulo.call(this,elemento);
	this.opcoes({
		"precoDe": {
			"ativo": true
		},
		"precoPor": {
			"ativo": true
		},
		"parcelado": {
			"auto": false,
			"ativo": false,
			"parcelas": 6
		},
		"boleto": {
			"ativo": true,
			"percentual": 5
		}
	});
	this.precos = [];
	var _this = this;
	/**
	 * Configura os eventos js que serão diparados pelo html do desenhar()
	 * @return {object} this
	 */
	this.configurar = function (opcoes) {
		this.opcoes($.extend({}, this._opcoes, opcoes));
		$(document).one('sku-referencial', function(){
			var novoSku = JSON.parse(sessionStorage.getItem('sku-referencial'));
			_this.atualizar(novoSku);
		});
		$(document).on('change-sku', function(){
			var novoSku = JSON.parse(sessionStorage.getItem('sku-selecionado'));
			_this.atualizar(novoSku);
		});
		return this;
	};
	/**
	 * Cria e insere o html com as formas de pagamento
	 * @return {object} this
	 */
	this.desenhar = function () {
		var container = $('<div />', {
			class: 'container-precos',
			css: 'display:none'
		}).appendTo(this.elemento());
		if (this.opcoes().precoDe) {
			var moduloPrecoDe = new ModuloPrecoDe();
			moduloPrecoDe.configurar(this.opcoes().precoDe);
			this.elemento().append(moduloPrecoDe.desenhar());
			this.precos.push(moduloPrecoDe);
		}
		if (this.opcoes().precoPor) {
			var moduloPrecoPor = new ModuloPrecoPor();
			moduloPrecoPor.configurar(this.opcoes().precoPor);
			this.elemento().append(moduloPrecoPor.desenhar());
			this.precos.push(moduloPrecoPor);
		}
		if (this.opcoes().parcelado) {
			var moduloPrecoParcelado = new ModuloPrecoParcelado();
			moduloPrecoParcelado.configurar(this.opcoes().parcelado);
			this.elemento().append(moduloPrecoParcelado.desenhar());
			this.precos.push(moduloPrecoParcelado);
		}
		if (this.opcoes().boleto) {
			var moduloPrecoBoleto = new ModuloPrecoBoleto();
			moduloPrecoBoleto.configurar(this.opcoes().boleto);
			this.elemento().append(moduloPrecoBoleto.desenhar());
			this.precos.push(moduloPrecoBoleto);
		}
		return this;
	};
	/**
	 * Atualiza os precos de acordo com o novo sku
	 * @param  {Event} event evento que disparou atualização
	 * @param  {Object} novoSku objeto do sku selecionado
	 * @return {Object} this
	 */
	this.atualizar = function (novoSku) {
		if (!novoSku) {
			novoSku = {
				available: false
			};
		}
		if (novoSku.available) {
			for (var tiposPreco in this.precos) {
				if (this.precos.hasOwnProperty(tiposPreco)) {
					this.precos[tiposPreco].atualizar(novoSku);
				}
			}
			this.elemento().css('display', 'block');
		}
		else {
			this.elemento().css('display', 'none');
		}
		return this;
	};
	/**
	 * Get/Set configuraçoes de tipos de precos
	 * @param  {Object} tipo um objeto contendo informações das formas de pagamento
	 * @return {Object} 	objeto de configuracao
	 */
	this.tiposPreco = function (tipo) {
		if (tipo) {
			this._tiposPreco = $.extend({}, this._tiposPreco, tipo);
		}
		return this._tiposPreco;
	};
};
// subclasse extende superclasse
ModuloPreco.prototype = Object.create(Modulo.prototype);
ModuloPreco.prototype.constructor = ModuloPreco;

exports.ModuloPreco = ModuloPreco;
