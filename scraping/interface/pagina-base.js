const Anuncios = require('../models/anuncio');

class PaginaBase
{
	constructor( url = '')
	{
		this.url = url;
		this.html = '';
		this.urlAnuncios = [];
		this.anuncios = new Anuncios();
		this.$ = undefined;

		this.i = -1;
		this.tiempoMin=1.7;
		this.tiempoMax= 2.9;

		if(!this.url || this.url.length == 0) throw new Error('Se necesita especificar una url');
		//if(!this.departamento || this.departamento.length == 0) throw new Error('Se necesita especificar un departamento');

	}
	// Retorna el array de enlaces de los anuncios, de existir
	getUrlAnuncios()
	{
		return this.urlAnuncios;
	}
	async init(tiempoMin=1.7, tiempoMax=2.9)
	{
		throw new Error('Se debe implementar esta funcion "init" para obtener los primeros datos');
	}

	// Completa el array con url de los anuncios
	llenarUrlAnuncios()
	{
		throw new Error('Se debe implementar esta funcion "llenarUrlAnuncios" para obtener los anuncios');
	}

	// Retorna el array de anuncios, de existir
	async getAnuncios()
	{
		throw new Error('Se debe implementar esta funcion "getAnuncios" para obtener los anuncios');
	}

}


module.exports = PaginaBase;