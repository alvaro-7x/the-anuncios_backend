const Pagina1 = require('../scraping/models/pagina1');
const Pagina2 = require('../scraping/models/pagina2');

const sitio1 = async (req, res) => 
{
	const {departamento = '', termino = '', page:pagina = 1 } = req.query;

	const urlBase = 'https://trabajando.com.bo';
	const url = `https://trabajando.com.bo/trabajo/${departamento}?buscar=${termino}&page=${pagina}`;
	
	try
	{
		const datosSitio = new Pagina1(urlBase, url, termino, departamento, pagina);
		
		// inicializamos los datos, se esperara 0 segundos en una peticion y otra o se puede dejar vacio 
		// para esperar entre tiempoMin=1.7, tiempoMax=2.9
		//await datosSitio.init();
		await datosSitio.init(0,0);

		const departamentos  = datosSitio.getDepartamentos();
		const { anuncios, cantidad } = await datosSitio.getAnuncios();
		const { region, totalAnuncios, totalPaginas } = datosSitio.obtenerInformacionGeneral();

		return res.json({
			cantidad,
			region, 
			totalAnuncios, 
			totalPaginas, 
			anuncios,
			departamentos,
		});
	}
	catch(e)
	{
		console.log(e);
		return res.status(500).json({
			err: true,
			msg: 'No se pudo obtener datos'
		});
	}
}


const sitio2 = async (req, res) => 
{
	const { departamento = '', termino = '', page:pagina = 1 } = req.query;
	
	const urls = [
		'https://bancoprodem.evaluar.com',
		'https://bancosol.evaluar.com',
		'https://bancosol.evaluar.com',
		'https://bcpbolivia.evaluar.com',
		'https://bdp.evaluar.com',
		'https://crecerifd.evaluar.com',
		'https://grupofortaleza.evaluar.com',
		'https://lapapelera.evaluar.com',
		'https://postulate.evaluar.com',
	];

	const tmpDepartamentos = new Pagina2(' ',' ',' ',' ',1);
	tmpDepartamentos.llenarDepartamentos();
	
	const datosPagina = [];
	let datosPaginaInit = [];
	let cantidad = 0;
	let region = '';
	let totalAnuncios = 0;
	let totalPaginas = 1;
	let anuncios = [];
	const departamentos = tmpDepartamentos.getDepartamentos();

	try
	{
		for (let i in urls)
		{
			const urlBase = urls[i];
			const url = `${urlBase}/?search_keywords=${termino}&search_location=${departamento}#s=1`;
			const datosSitio = new Pagina2(urlBase, url, termino, departamento, pagina);
			datosPagina.push(datosSitio);
		}

		const [] = await Promise.all(datosPagina.map(async datosSitio => 
		{
			try
			{
				// inicializamos los datos, se esperara 0 segundos en una peticion y otra o se puede dejar vacio 
				// para esperar entre tiempoMin=1.7, tiempoMax=2.9
				//await datosSitio.init();
				await datosSitio.init(0,0);
			}
			catch(e)
			{ }
		}));

		const [...anunciosRest] = await Promise.all(datosPagina.map(datosSitio => datosSitio.getAnuncios() ));
		
		const [...infoRest] = datosPagina.map(datosSitio => datosSitio.obtenerInformacionGeneral());

		const resultadosAnuncios = anunciosRest || [];

		const resultadosInfo = infoRest || [];

		for(let i = 0; i<datosPagina.length; i++)
		{
			anuncios = anuncios.concat(resultadosAnuncios[i].anuncios);
			cantidad+= resultadosAnuncios[i].cantidad;

			const { region: regionResult, totalAnuncios: totalAnunciosResult, totalPaginas: totalPaginasResult } = resultadosInfo[i];
			totalAnuncios += totalAnunciosResult;
			region = regionResult;
		}
		totalAnuncios = totalAnuncios.toString();
		totalPaginas = totalPaginas.toString();

		return res.json({
			cantidad,
			region,
			totalAnuncios,
			totalPaginas,
			anuncios,
			departamentos
		});

	}
	catch(e)
	{
		return res.status(500).json({
			err: true,
			msg: 'No se pudo obtener datos'
		});
	}
}

module.exports = {
	sitio1,
	sitio2,
}