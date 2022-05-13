let simpleGet = require('simple-get');
const axios = require('axios');

class Scraping
{
	constructor(url,parametros)
	{
		this.url = url;
		this.parametros = parametros;
		this.datos = 'EMPTY DATA';
	}

	async getHtml()
	{
		if(!this.url)
		{
			throw new Error(`La url: ${this.url} no esta valida`);
		}

		try
		{
			const instance = axios.create({
				baseURL: this.url,
			});

			const resp = await instance.get();
			this.datos = resp.data;
			return this.datos;
		}
		catch(error)
		{
			this.datos = 'SIN DATOS - ERROR';
			return this.datos;
		}

	}
}


module.exports = Scraping;