import { BancoFactory, BancosType } from "../types";
import {
	addLabel,
	getConcepto, 
	getFecha, 
	getMensualidaesRestantes, 
	getMontoOriginal, 
	getSaldoPendiente, 
	toFixed
} from "./utils";



export class BanamexLogic implements BancoFactory {

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
			const textToRemove = match ? match[1] : '';
			cargos = this.rawEstadoDeCuenta.split(textToRemove ?? '')
		} else {
			const label = this.infoBanco.label.replace('\n', '')
			this.rawEstadoDeCuenta = this.rawEstadoDeCuenta.replaceAll(label, '')
			cargos = this.rawEstadoDeCuenta.split('\n')
		}
		cargos = cargos.filter(n => n)
		const estadoCuenta = cargos.map(cargo => {
			cargo = cargo.replace('\n', ' ').replace(/\s+/g, ' ').trim()
			let { mesesPendientes, totalMeses } = getMensualidaesRestantes(cargo)
			let montoOriginal = getMontoOriginal(cargo)
			newRawData += `${cargo}\n`
			return {
				banco: this.infoBanco.nombre,
				fecha: getFecha(cargo),
				saldoPendiente: getSaldoPendiente(cargo),
				progresoMensualidades: {
					mesesPendientes: mesesPendientes,
					totalMeses: totalMeses
				},
				costoMensualidad: totalMeses ? toFixed(Number(montoOriginal?.replace(',', '')) / totalMeses) : 0,
				mensualidaesRestantes: `${mesesPendientes} de ${totalMeses}`,
				montoOriginal: montoOriginal,
				concepto: getConcepto(cargo)
			}
		})
		newRawData = addLabel(newRawData, this.rawEstadoDeCuenta, this.infoBanco)
		return { estadoCuenta, newRawData }
	}
}