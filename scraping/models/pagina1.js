const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');

const Anuncios = require('./anuncio');
const { sleep } = require('../helpers/helper');
const { limpiarTexto, procesarTexto } =require('../helpers/helper');

const Scraping = require('./scraping');

const PaginaBase = require('../interface/pagina-base');

class Pagina1 extends PaginaBase
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
				this.html = await fs.readFileSync(path.join(__dirname,'../datos-local/pagina1/anuncios.html'), {encoding:'utf-8'}); //desarrollo
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
		this.$('form #edit-city').children('option').each( (item, element) => 
		{
			const option = this.$(element);
			const value = option.val().trim();
			const text = option.text().trim();

			const noValido = ['all' , 'todas' ,'bolivia', 'ciudades'];

			if(noValido.indexOf(value.toLowerCase()) < 0 || noValido.includes(text.toLowerCase()) <0 )
			{
				this.departamentos.push({
					value: value,
					text: text,
				});
			}

		});
	}

	llenarUrlAnuncios()
	{
		if( this.$.html() == 'sin datos')
			return;

		this.$('div.view-content','.region-content').children('.row').each((item, element)=>
		{
			// const enlaceAnuncio = this.$(element).find('.field-content a').parent().html();
			const enlaceAnuncio = this.$(element).find('.views-field .field-content a').parent().html();
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
			const anuncio = cheerio.load(this.urlAnuncios[i]);
			let enlace = anuncio('a').attr('href');
			
			enlace = (enlace.substr(0,4) === 'http')? enlace: `${this.urlBase}${enlace}`;

			let subHtml = '';
			
			if(process.env.EN_PRODUCCION == 'false')
			{
				subHtml = await fs.readFileSync(path.join(__dirname,'../datos-local/pagina1/anuncio-detalle-confuente.html'), {encoding:'utf-8'}); //desarrollo
			}
			else
			{
				const subPagina = new Scraping(enlace); //produccion
				subHtml = await subPagina.getHtml(); //produccion
			}
			
			const detalleAnuncioAll = cheerio.load(subHtml);
			
			const contenidoAnuncio = detalleAnuncioAll('div.region.region-content').html();
			if(!contenidoAnuncio)
			{
				continue;
			}

			const detalleAnuncio = cheerio.load(contenidoAnuncio);

			// Obtenemos los datos
			const categoria = detalleAnuncio('.views-field-field-area-de-publicacion').text();
			const estado = detalleAnuncio('.views-field-nothing').text();
			const fuente = detalleAnuncio('.field--name-field-fuente div.field--item').children('a').attr('href');
			const tipoContrato = detalleAnuncio('.views-field-field-tipo-empleo').text();

			let empresa = detalleAnuncio('.views-field-field-nombre-empresa').text().trim();
			const empresaAlternativa = detalleAnuncio('.row .views-field-title').text().trim();
			empresa = empresa.length === 0? empresaAlternativa : empresa;

			const fechaPublicacion = detalleAnuncio('.views-field-created').text();
			const fechaVencimiento = detalleAnuncio('.views-field-field-fecha-empleo-1').text();
			const ubicacion = detalleAnuncio('.views-field-field-ubicacion-del-empleo').text();


			// Procesamos los datos
			const categoriaDatos = procesarTexto(categoria);
			const estadoDatos = procesarTexto(estado);
			const fuenteDatos = limpiarTexto(fuente);
			const tipoContratoDatos = procesarTexto(tipoContrato);

			const tituloDatos = limpiarTexto(detalleAnuncio('h1').text());
			const empresaDatos = procesarTexto(empresa);
			
			let logoEmpresaDatos = detalleAnuncio('div.field-content a').children('img').attr('src');
			let logoEmpresaDatosAlternativa = detalleAnuncio('div.field-content').children('img').attr('src');
			logoEmpresaDatos = logoEmpresaDatos? logoEmpresaDatos: logoEmpresaDatosAlternativa;

			logoEmpresaDatos = (logoEmpresaDatos && logoEmpresaDatos.length>0)
				? this.urlBase + logoEmpresaDatos
				: '';

			const fechaPublicacionDatos = procesarTexto(fechaPublicacion);
			const fechaVencimientoDatos = procesarTexto(fechaVencimiento);
			const ubicacionDatos = procesarTexto(ubicacion);

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

		this.region = this.$('h1.page-header')? this.$('h1.page-header').text().trim():'';
		this.totalAnuncios = this.$('div.view-header')? this.$('div.view-header').text().trim().replace(/[^0-9]/g,''):'';

		const totalPaginas = this.$('.pager__item--last').children('a').attr('href');
		let nroPage = 0;
		const nroPageInit = 0;
		if(totalPaginas && totalPaginas.length > 0)
		{
			const tmp = totalPaginas.split('&');
			[, nroPage] = tmp[tmp.length-1].split('=');
			nroPage = parseInt(nroPage || '0');
		}


		// this.totalPaginas = nroPage;
		if(nroPageInit !== nroPage)
		{
			this.totalPaginas = (nroPage) + 1;
		}
		else
		{
			this.totalPaginas = 1;
		}

		return {
			region: this.region,
			totalAnuncios: this.totalAnuncios,
			totalPaginas: this.totalPaginas,
		};
	}

}



module.exports = Pagina1;
