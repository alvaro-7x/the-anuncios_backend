class Anuncio
{
		constructor(enlace = '', titulo = '', categoria = '', empresa = '', estado = '', fechaPublicacion = '', fechaVencimiento = '', logoEmpresa = '', tipoContrato = '', ubicacion = '', fuente = '')
		{
			// Estos campos son requeridos
			this.enlace = enlace;
			this.titulo = titulo;
			this.empresa = empresa;
			this.logoEmpresa = logoEmpresa;
			this.fechaPublicacion = fechaPublicacion;
			this.fechaVencimiento = fechaVencimiento;
			this.ubicacion = ubicacion;

			// Estos campos son opcionales
			this.categoria = categoria;
			this.estado = estado;
			this.tipoContrato = tipoContrato;
			this.fuente = fuente;
		}
}

class Anuncios
{
	constructor()
	{
		this.anuncios = [];
	}

	addAnuncio( enlace = '', titulo = '', categoria = '', empresa = '', estado = '', fechaPublicacion = '', fechaVencimiento = '', logoEmpresa = '', tipoContrato = '', ubicacion = '', fuente = '')
	{
		this.anuncios.push(new Anuncio( enlace, titulo, categoria, empresa, estado, fechaPublicacion, fechaVencimiento, logoEmpresa, tipoContrato, ubicacion, fuente));
	}

	getAnuncios()
	{
		return this.anuncios;
	}
}



module.exports = Anuncios;