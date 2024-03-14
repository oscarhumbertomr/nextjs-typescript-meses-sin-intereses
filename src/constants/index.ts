import { BancosType } from "../types";


export const defaultRawData = 'POR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,107.00 1 de 6 1,017.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,687.00 1 de 6 1,114.50\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 19 PAYPAL CYBERPUERTA OPM XXXX 19,138.00 7 de 12 11,163.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 21 SAMS MERIDA NWM XXXX 12,274.98 13 de 18 8,865.28\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 20 AMAZON MX MKTPLACE MSI ANE\n\nXXXX \n\n3,299.00 7 de 12 1,924.40\n\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nDic 26 LIVERPOOL MERIDA DLI XXXX  10,890.00 2 de 6 3,630.00\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 16 SAMS MERIDA NWM XXXX 3,579.48 9 de 12 2,684.61\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 22 CCP MADERO CDMX CAG XXXX 780.00 3 de 6 390.00'

export const BANCOS: BancosType[] = [
	{
		id: 1,
		nombre: 'Banamex',
		label: '-----BANAMEX-----BANAMEX-----BANAMEX-----BANAMEX-----BANAMEX-----BANAMEX\n',
		code: 5546,
		regex: /POR SU TARJETA TITULAR(.*?\d{3}\n)/g,
		lastNumbers: ''
	},
	{
		id: 2,
		nombre: 'AMEX',
		label: '-----AMERICAN-EXPRESS----AMERICAN-EXPRESS----AMERICAN-EXPRESS---AMERICAN-EXPRESS\n',
		code: 3717,
		regex: /^\d{1,3}(?:,\d{3})*(?:\.\d{2})?=\d{1,3}(?:,\d{3})*(?:\.\d{2})\+0\.00\+0\.00$/gm
	}
];

export const defaultDineroDisponible = 10000
export const defaultGastosFijos = 2000
export const defaultMesesFondoDeAhorros = 6
export const mesesDelAno = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
]