export interface BancoFactory {
	procesaEstadoDeCuenta(): {
			estadoCuenta: EstadoDeCuentaType,
			newRawData: string
		}
}

export type BancosType = {
    id: number,
    code: number,
    regex: RegExp,
    nombre: string,
    label: string,
    lastNumbers?: string
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    addEstadoCuentaAcumulado: (newEstadoCuenta: EstadoDeCuentaType) => void;
}

export type DetalleEstadoDeCuentaType = {
    banco: string | undefined,
    fecha: string,
    concepto: string,
    montoOriginal: string | undefined,
    costoMensualidad: number,
    mensualidaesRestantes: string,
    saldoPendiente: string | undefined,
    progresoMensualidades: {
        mesesPendientes: any,
        totalMeses: any
    }
}

export type EstadoDeCuentaType = DetalleEstadoDeCuentaType[]