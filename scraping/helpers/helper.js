
const limpiarTexto = (texto='') =>
{
	texto = texto.trim('');

	return (texto.length > 0) 
					? texto.replace(/(\r\n|\n|\r)/gm, '')
					: '';
}

const sleep = (i=-1, min=1.7, max= 2.9) => 
{
	if(min > max) throw new Error('Valores max y/o min no son correctos');

	const ms = Math.round((Math.random()*(max-min) + min)*1000);
	if(i>0)
		console.log(`${i}.- Esperando ${ms/1000} seg.`);
	return new Promise( res => setTimeout(res, ms));
}


const procesarTexto = (texto='') =>
{
	const [titulo='', dato=''] = texto.split(':');

	return limpiarTexto(dato);
}



module.exports = {
	sleep,
	limpiarTexto,
	procesarTexto,
};