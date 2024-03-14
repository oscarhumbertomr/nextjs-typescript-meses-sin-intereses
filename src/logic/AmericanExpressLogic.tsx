import {
	BancosType,
	BancoFactory,
	EstadoDeCuentaType,
	DetalleEstadoDeCuentaType
} from '../types'

import { addLabel } from './utils'

export default class AmericanExpressLogic implements BancoFactory {

	private infoBanco: BancosType;
	private rawEstadoDeCuenta: string;

	constructor(estadoDeCuenta: string, infoBanco: BancosType) {
		this.infoBanco = infoBanco;
		this.rawEstadoDeCuenta = estadoDeCuenta
	}

	procesaEstadoDeCuenta() {

		let newRawData = ''
		let cargos: string[] = []
		const match = this.rawEstadoDeCuenta.match(this.infoBanco.regex)
		if (match) {
			this.rawEstadoDeCuenta = this.rawEstadoDeCuenta.replaceAll(this.infoBanco.regex, '')
			this.rawEstadoDeCuenta = this.rawEstadoDeCuenta.replaceAll('Mensualidad=(Pago a capital + Interés + IVA)\n', ' ');
			this.rawEstadoDeCuenta = this.rawEstadoDeCuenta.replaceAll('\n \n', ' ');
		} else {
			const label = this.infoBanco.label.replace('\n', '')
			this.rawEstadoDeCuenta = this.rawEstadoDeCuenta.replaceAll(label, '')
		}
		cargos = this.rawEstadoDeCuenta.split('\n')
		cargos = cargos.filter(n => n)
		console.log(cargos)

		let estadoCuenta: EstadoDeCuentaType = cargos.map((cargo): DetalleEstadoDeCuentaType | null => {

			var fechaMatch = cargo.match(/\d{1,2} de [A-Za-z]+/g) ?? []
			var fecha: string = fechaMatch[0] ?? ''
			var lastIndexConcepto = cargo.search(/\d{1,2} de [A-Za-z]+/g);
			var concepto = cargo.slice(0, lastIndexConcepto)
			cargo = cargo.replace(fecha, '')
			cargo = cargo.replace(concepto, '')
			var [textoMensualidades, progreso, totalMeses] = cargo.match(/(\d+) de (\d+)/) ?? [];
			console.log(textoMensualidades)
			console.log(progreso)
			console.log(totalMeses)
			cargo = cargo.replace(textoMensualidades + ' ', '')
			const mesesPendientes = Number(totalMeses) - Number(progreso);

			const saldoInfo = cargo.trim().split(' ')
			if (cargo.length < 3) {
				return null
			}
			var montoOriginal = saldoInfo[0].replace(',', '')
			var saldoPendiente = saldoInfo[2].replace(',', '')
			var costoMensualidad = Number(saldoInfo[3].replace(',', ''))
			return {
				banco: this.infoBanco.nombre,
				fecha,
				saldoPendiente,
				progresoMensualidades: {
					mesesPendientes: mesesPendientes,
					totalMeses: totalMeses
				},
				costoMensualidad,
				mensualidaesRestantes: `${mesesPendientes} de ${totalMeses}`,
				montoOriginal,
				concepto
			}

		}).flatMap(f => f ? [f] : []);
		newRawData = addLabel(this.rawEstadoDeCuenta, this.rawEstadoDeCuenta, this.infoBanco)
		return { estadoCuenta, newRawData }
	}


}