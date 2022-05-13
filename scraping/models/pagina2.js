const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');

const Anuncios = require('./anuncio');
const { sleep } = require('../helpers/helper');
const { limpiarTexto, procesarTexto } =require('../helpers/helper');

const Scraping = require('./scraping');

const PaginaBase = require('../interface/pagina-base');

class Pagina2 extends PaginaBase
{

	constructor(urlBase = '', url = '', termino = '', departamento = '',pagina = 1)
	{
		// No olvidar heredar las funciones del padre
		super(url);
		this.termino = termino;
		this.departamento = departamento;
		this.pagina = pagina;
		this.urlBase = urlBase;

		// datos personalizados

		this.departamentos = [];
		this.region = '';
		this.totalAnuncios = '';
		this.totalPaginas = '';
		this.$ = undefined;
	}

	// Este metodo es llamado en el constructor de la clase base
	async init(tiempoMin=1.7, tiempoMax=2.9)
	{
		this.tiempoMin = tiempoMin;
		this.tiempoMax = tiempoMax;
		try
		{

			if(process.env.EN_PRODUCCION == 'false')
			{
				this.html = await fs.readFileSync(path.join(__dirname,'../datos-local/pagina2/anuncios.html'), {encoding:'utf-8'}); //desarrollo
			}
			else
			{
				const pagina = new Scraping(this.url); //produccion
				this.html = await pagina.getHtml(); //produccion
			}
			
			
			if(this.html.length == 0) 
				// throw new Error(`No se encontro ningun contenido de la url: ${this.url}`);
				this.html = 'sin datos'

			this.$ = cheerio.load(this.html);

			this.llenarDepartamentos();
			this.llenarUrlAnuncios();
		}
		catch(e)
		{
			// throw new Error(`Ocurrio un error al intentar obtener contenido de la url: ${this.url}`);
			this.html = 'sin datos';
			this.$ = cheerio.load(this.html);
			console.error(e);
		}
	}

	getDepartamentos()
	{
		return this.departamentos;
	}

	llenarDepartamentos()
	{
		this.departamentos = [
	    {
	      "value": "santa cruz",
	      "text": "Santa Cruz"
	    },
	    {
	      "value": "la paz",
	      "text": "La Paz"
	    },
	    {
	      "value": "cochabamba",
	      "text": "Cochabamba"
	    },
	    {
	      "value": "beni",
	      "text": "Beni"
	    },
	    {
	      "value": "chuquisaca",
	      "text": "Chuquisaca"
	    },
	    {
	      "value": "oruro",
	      "text": "Oruro"
	    },
	    {
	      "value": "pando",
	      "text": "Pando"
	    },
	    {
	      "value": "potosi",
	      "text": "Potosí"
	    },
	    {
	      "value": "tarija",
	      "text": "Tarija"
	    }
	  ];
	}

	llenarUrlAnuncios()
	{
		if( this.$.html() == 'sin datos')
			return;

		this.$('ul.job_listings').children('li').each((item, element)=>
		{
			const enlaceAnuncio = this.$(element).children('a').attr('href');

			if(enlaceAnuncio)
			{
				this.urlAnuncios.push(enlaceAnuncio);
			}
		});
	}

	async getAnuncios()
	{
		if(this.urlAnuncios.length < 1)
		{
			this.urlAnuncios = [];
			this.anuncios = [];

			return {
				anuncios: [],
				cantidad: 0
			}
		}

		const cantidad = this.urlAnuncios.length;

		for (var i = 0; i < cantidad; i++)
		{
			const enlace = this.urlAnuncios[i];
			
			let subHtml = '';
			if(process.env.EN_PRODUCCION == 'false')
			{
				subHtml = await fs.readFileSync(path.join(__dirname,'../datos-local/pagina2/anuncio-detalle.html'), {encoding:'utf-8'}); //desarrollo
			}
			else
			{
				const subPagina = new Scraping(enlace); //produccion
				subHtml = await subPagina.getHtml(); //produccion
			}
			
			const detalleAnuncioAll = cheerio.load(subHtml);

			const contenidoAnuncio = detalleAnuncioAll('div#job-details').html();
			if(!contenidoAnuncio)
			{
				continue;
			}

			const detalleAnuncio = cheerio.load(contenidoAnuncio);

			// Obtenemos los datos
			const categoria = '';
			const estado = 'NO DEFINIDO';
			const fuente = '';
			const tipoContrato = '';

			const empresa = detalleAnuncioAll('h4','div.company-info').text();
			const fechaPublicacionDate = detalleAnuncio('time').text();
			const fechaPublicacionText = detalleAnuncio('time').attr('datetime');
			
			const fechaVencimiento = 'No definido';
			const ubicacionUrl = detalleAnuncio('span.location').children('a').attr('href');
			const ubicacionTexto = detalleAnuncio('span.location').text();

			// Procesamos los datos
			const categoriaDatos = procesarTexto(categoria);
			const estadoDatos = limpiarTexto(estado);
			const fuenteDatos = limpiarTexto(fuente);
			const tipoContratoDatos = procesarTexto(tipoContrato);

			const tituloDatos = limpiarTexto(detalleAnuncioAll('h1').text());
			const empresaDatos = limpiarTexto(empresa);
			const logoEmpresaDatos = detalleAnuncioAll('img','div.company-info').attr('src');
			const fechaPublicacionDatos = limpiarTexto(fechaPublicacionText)+'|'+limpiarTexto(fechaPublicacionDate);
			const fechaVencimientoDatos = limpiarTexto(fechaVencimiento);
			const ubicacionDatos = limpiarTexto(ubicacionTexto)+'|'+limpiarTexto(ubicacionUrl);

			this.anuncios.addAnuncio(enlace, tituloDatos, categoriaDatos, empresaDatos, estadoDatos, fechaPublicacionDatos, fechaVencimientoDatos, logoEmpresaDatos, tipoContratoDatos, ubicacionDatos, fuenteDatos);

			// se duerme de entre 1.7 a 2.9 seg para evitar muchas peticiones
			await sleep(this.i,this.tiempoMin, this.tiempoMax);
		}

		return {
			anuncios: this.anuncios.getAnuncios(),
			cantidad: cantidad,
		}
	}

	obtenerInformacionGeneral()
	{
		if(!this.$) throw new Error('El paquete cheerio no fue inicializado');
		
		this.region = this.departamento;
		this.totalAnuncios = this.urlAnuncios.length;
		this.totalPaginas = 1;

		return {
			region: this.region,
			totalAnuncios: this.totalAnuncios,
			totalPaginas: this.totalPaginas,
		};
	}

}



module.exports = Pagina2;
