import { BancosType } from "@/src/types"

export const getMensualidaesRestantes = (cargo: string) => {
	let data = cargo.split(' ')
	let totalMeses = data?.at(-2)
	let mesesPendientes = data?.at(-4)
	return {
		mesesPendientes: mesesPendientes,
		totalMeses: Number(totalMeses)
	}
}

export const getMontoOriginal = (cargo: string) => {
	let data = cargo.split(' ')
	return data?.at(-5)
}

export const getFecha = (cargo: string) => {
	let [mes, dia, ..._] = cargo.split(' ')
	return mes + '' + dia
}

export const getSaldoPendiente = (cargo: string) => {
	let data = cargo.split(' ')
	return data?.at(-1)
}

export const toFixed = (number: number, digits = 2) => {
	return Number(number.toFixed(digits))
}

export const getConcepto = (cargo: string) => {
	let [_mes, _dia, ...data] = cargo.split(' ')
	return data.slice(0, -5).join(' ')
}

const getLabel = (rawEstadoCuenta: string, banco: BancosType) => {
	const label = banco.label.replace('\n', '')
	return rawEstadoCuenta.match(label) ? '' : label
}

export const addLabel = (newRawData: string, rawEstadoCuenta: string, banco: BancosType) => {
	const label = getLabel(rawEstadoCuenta, banco)
	if (label) {
		newRawData = label.concat('\n' + newRawData)
		newRawData += label
	}
	return newRawData
}