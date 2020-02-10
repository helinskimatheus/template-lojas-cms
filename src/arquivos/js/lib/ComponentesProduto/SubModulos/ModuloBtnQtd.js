import { Modulo } from "../Modulo";

export var ModuloBtnQtd = function() {
	Modulo.call(this);
	this.elemento(".qtd-selector");
	this._opcoes = {
		titulo: "Quantidade:",
		opcaoIndisponivel: "Indisponível",
		max: "1",
		min: "1",
		default: "1"
	};
};
// subclasse extende superclasse
ModuloBtnQtd.prototype = Object.create(Modulo.prototype);
ModuloBtnQtd.prototype.constructor = ModuloBtnQtd;
/**
 * Cria html
 * @return {jQueryElement}	Elemento jquery contendo o campo para informar a quantidade
 */
ModuloBtnQtd.prototype.desenhar = function() {
	var divQtd = $("<div />", {
		class: "quantidade"
	});
	$("<span />", {
		class: "titulo",
		text: this.opcoes().titulo
	}).appendTo(divQtd);
	var campoQtd = $("<div />", {
		class: "campo-qtd"
	}).appendTo(divQtd);
	var buttonRemove = $("<button />", {
		class: "remove-from-cart",
		"aria-label": "Remover item"
	})
		.on("click", this.decrementBtn.bind(this))
		.text("-")
		.appendTo(campoQtd);
	var label = $("<label />", {
		class: "container-qtd"
	}).appendTo(campoQtd);
	var inputQtd = $("<input />", {
		class: "qtd-value",
		"aria-label": "Número de itens",
		type: "number",
		"data-min": this.opcoes().min,
		"data-max": this.opcoes().max,
		value: this.opcoes().default
	}).appendTo(label);
	var buttonAdd = $("<button />", {
		class: "add-to-cart",
		"aria-label": "Adicionar item"
	})
		.on("click", this.incrementBtn.bind(this))
		.text("+")
		.appendTo(campoQtd);
	divQtd.appendTo(this.elemento());
	this.inputChange();
	return this;
};
ModuloBtnQtd.prototype.onChange = function(input) {
	var $inputQuantidade = input;
	//obtem os valores de quantidade selecionada e quantidade maxima
	var min = parseInt($inputQuantidade.data("min"));
	var max = parseInt($inputQuantidade.data("max"));
	var qtd = parseInt($inputQuantidade.val());
	if (qtd < min || isNaN(qtd)) {
		this.notificarValor("Minimo: " + min);
		qtd = min;
	} else if (qtd > max) {
		this.notificarValor("Maximo: " + max);
		qtd = max;
	}
	//atualiza todos os skus
	$(".quantidade .qtd-value").val(qtd);
	$(document).trigger("change-quantidade", qtd);
	return this;
};

/**
 * Atualiza o estoque( max )
 * @param {float} novoEstoque valor para atualizacao do estoque
 */
ModuloBtnQtd.prototype.atualizar = function(novoEstoque) {
	var $inputQuantidade = $(".quantidade .qtd-value");
	$inputQuantidade.data("max", novoEstoque);

	if (novoEstoque > 0) {
		this.habilitar(true);
	}
	// else {
	// 	this.habilitar(false);
	// }
	return this;
};
ModuloBtnQtd.prototype.inputChange = function() {
	$("input[class='qtd-value']").on("focusout", function() {
		ModuloBtnQtd.prototype.onChange($(this));
	});
};
ModuloBtnQtd.prototype.incrementBtn = function() {
	var button = this.elemento().find(".add-to-cart");
	var qtd = $(".quantidade .container-qtd").find(".qtd-value");
	if ($.isNumeric(qtd.val())) {
		var valueQtd = parseInt(qtd.val());
		valueQtd += 1;
		qtd.val(valueQtd);
	} else {
		qtd.val(1);
	}
	ModuloBtnQtd.prototype.onChange(qtd);
};
ModuloBtnQtd.prototype.decrementBtn = function() {
	var button = this.elemento().find(".remove-from-cart");
	var qtd = $(".quantidade .container-qtd").find(".qtd-value");
	if ($.isNumeric(qtd.val())) {
		var valueQtd = parseInt(qtd.val());
		if (valueQtd > 1) {
			valueQtd -= 1;
			qtd.val(valueQtd);
		}
	} else {
		qtd.val(1);
	}
	ModuloBtnQtd.prototype.onChange(qtd);
};
ModuloBtnQtd.prototype.notificarValor = function(msg) {
	var notificacao = $(".moduloQuantidade").find(".notificacao");
	if (!notificacao.length) {
		notificacao = $("<div />", {
			class: "notificacao"
		}).appendTo($(".moduloQuantidade").find(".container-qtd"));
	}
	notificacao
		.empty()
		.text(msg)
		.fadeIn("slow");
	var timer = setTimeout(
		function() {
			notificacao.fadeOut("slow");
		}.bind(this),
		4000
	);
	return this;
};