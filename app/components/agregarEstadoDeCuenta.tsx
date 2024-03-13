import React, { FC, useState, useMemo } from "react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

type BancosType = {
    id: number,
    code: number,
    regex: RegExp,
    nombre: string,
    label: string,
    lastNumbers?: string
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    addEstadoCuentaAcumulado: (newEstadoCuenta: EstadoDeCuentaType) => void;
}

type DetalleEstadoDeCuentaType = {
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

type EstadoDeCuentaType = DetalleEstadoDeCuentaType[]

const defaultRawData = 'POR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,107.00 1 de 6 1,017.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,687.00 1 de 6 1,114.50\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 19 PAYPAL CYBERPUERTA OPM XXXX 19,138.00 7 de 12 11,163.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 21 SAMS MERIDA NWM XXXX 12,274.98 13 de 18 8,865.28\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 20 AMAZON MX MKTPLACE MSI ANE\n\nXXXX \n\n3,299.00 7 de 12 1,924.40\n\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nDic 26 LIVERPOOL MERIDA DLI XXXX  10,890.00 2 de 6 3,630.00\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 16 SAMS MERIDA NWM XXXX 3,579.48 9 de 12 2,684.61\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 22 CCP MADERO CDMX CAG XXXX 780.00 3 de 6 390.00'

const BANCOS: BancosType[] = [
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

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const getMensualidaesRestantes = (cargo: string) => {
    let data = cargo.split(' ')
    let totalMeses = data?.at(-2)
    let mesesPendientes = data?.at(-4)
    return {
        mesesPendientes: mesesPendientes,
        totalMeses: Number(totalMeses)
    }
}

const getMontoOriginal = (cargo: string) => {
    let data = cargo.split(' ')
    return data?.at(-5)
}

const getFecha = (cargo: string) => {
    let [mes, dia, ..._] = cargo.split(' ')
    return mes + '' + dia
}

const getSaldoPendiente = (cargo: string) => {
    let data = cargo.split(' ')
    return data?.at(-1)
}

const toFixed = (number: number, digits = 2) => {
    return Number(number.toFixed(digits))
}

const getConcepto = (cargo: string) => {
    let [_mes, _dia, ...data] = cargo.split(' ')
    return data.slice(0, -5).join(' ')
}

const bancoDetectado = (rawEstadoCuenta: string): BancosType | undefined => {
    let matchBancPattern;
    let banco: BancosType | undefined;
    for (let index = 0; index < BANCOS.length; index++) {
        matchBancPattern = rawEstadoCuenta.match(BANCOS[index].regex);
        if (matchBancPattern) {
            banco = BANCOS[index]
            if (banco.id === 1) {
                banco.lastNumbers = matchBancPattern[0].substring(matchBancPattern[0].length - 4, matchBancPattern[0].length - 1)
            }
            break;
        }

    }

    if (!banco) {
        for (let index = 0; index < BANCOS.length; index++) {
            matchBancPattern = rawEstadoCuenta.match(BANCOS[index].label);
            if (matchBancPattern) {
                banco = BANCOS[index]
                if (banco.id === 1) {
                    banco.lastNumbers = matchBancPattern[0].substring(matchBancPattern[0].length - 4, matchBancPattern[0].length - 1)
                }
                break;
            }

        }
    }

    if (banco?.id) {
        return { ...banco, nombre: `${banco?.nombre}-${banco?.lastNumbers}` }
    }
}

const getLabel = (rawEstadoCuenta: string, banco: BancosType) => {
    const label = banco.label.replace('\n', '')
    return rawEstadoCuenta.match(label) ? '' : label
}

const addLabel = (newRawData: string, rawEstadoCuenta: string, banco: BancosType) => {
    const label = getLabel(rawEstadoCuenta, banco)
    if (label) {
        newRawData = label.concat('\n' + newRawData)
        newRawData += label
    }
    return newRawData
}

const procesaBanamex = (rawEstadoCuenta: string, banco: BancosType) => {
    let newRawData = ''
    let cargos: string[] = []
    const match = rawEstadoCuenta.match(banco.regex)
    if (match) {
        const textToRemove = match ? match[1] : '';
        cargos = rawEstadoCuenta.split(textToRemove ?? '')
    } else {
        const label = banco.label.replace('\n', '')
        rawEstadoCuenta = rawEstadoCuenta.replaceAll(label, '')
        cargos = rawEstadoCuenta.split('\n')
    }
    cargos = cargos.filter(n => n)
    const estadoCuenta = cargos.map(cargo => {
        cargo = cargo.replace('\n', ' ').replace(/\s+/g, ' ').trim()
        let { mesesPendientes, totalMeses } = getMensualidaesRestantes(cargo)
        let montoOriginal = getMontoOriginal(cargo)
        newRawData += `${cargo}\n`
        return {
            banco: banco.nombre,
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
    newRawData = addLabel(newRawData, rawEstadoCuenta, banco)
    return { estadoCuenta, newRawData }
}

const procesaAMEX = (rawEstadoCuenta: string, banco: BancosType) => {
    let newRawData = ''
    let cargos: string[] = []
    const match = rawEstadoCuenta.match(banco.regex)
    if (match) {
        rawEstadoCuenta = rawEstadoCuenta.replaceAll(banco.regex, '')
        rawEstadoCuenta = rawEstadoCuenta.replaceAll('Mensualidad=(Pago a capital + Interés + IVA)\n', ' ');
        rawEstadoCuenta = rawEstadoCuenta.replaceAll('\n \n', ' ');
    }else{
        const label = banco.label.replace('\n', '')
        rawEstadoCuenta = rawEstadoCuenta.replaceAll(label, '')
    }
    cargos = rawEstadoCuenta.split('\n')
    cargos = cargos.filter(n => n)
    console.log(cargos)

    let estadoCuenta: EstadoDeCuentaType = cargos.map((cargo): DetalleEstadoDeCuentaType =>{
        try {
         var fechaMatch = cargo.match(/\d{1,2} de [A-Za-z]+/g) ?? []
        var fecha: string = fechaMatch[0] ?? ''
        var lastIndexConcepto = cargo.search(/\d{1,2} de [A-Za-z]+/g);
        var concepto = cargo.slice(0, lastIndexConcepto)
        cargo = cargo.replace(fecha,'')
        cargo = cargo.replace(concepto,'')
        var [textoMensualidades, progreso, totalMeses] = cargo.match(/(\d+) de (\d+)/) ?? [];
        console.log(textoMensualidades)
        console.log(progreso)
        console.log(totalMeses)
        cargo = cargo.replace(textoMensualidades+' ','')
        const mesesPendientes = Number(totalMeses) - Number(progreso);

        const saldoInfo = cargo.trim().split(' ')
        var montoOriginal = saldoInfo[0].replace(',','')
        var saldoPendiente = saldoInfo[2].replace(',','')
        var costoMensualidad = Number(saldoInfo[3].replace(',',''))
        return {
            banco: banco.nombre,
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
        } catch (error) {
            console.error(error)
        }
       
    })
    estadoCuenta = estadoCuenta.filter(c=> c!=undefined)
    newRawData = addLabel(rawEstadoCuenta, rawEstadoCuenta, banco)
    return { estadoCuenta, newRawData }

}
const procesarEstadoDeCuenta = (rawEstadoCuenta: string, banco: BancosType | undefined) => {
    const testBanco = bancoDetectado(rawEstadoCuenta);
    banco = banco ?? testBanco
    let estadoCuenta: EstadoDeCuentaType | undefined
    let newRawData: string | undefined

    if (testBanco?.id && banco?.id && banco.id !== testBanco.id) {
        banco = testBanco
    }

    switch (banco?.id) {
        case 1:
            ({ estadoCuenta, newRawData } = procesaBanamex(rawEstadoCuenta, banco));
            break;
        case 2:
            ({ estadoCuenta, newRawData } = procesaAMEX(rawEstadoCuenta, banco));
            break;
        default:
            break;
    }

    return {
        estadoCuenta: estadoCuenta,
        rawEstadoCuenta: newRawData ?? rawEstadoCuenta,
        banco
    }
}

const AgregarEstadoDeCuenta: FC<ModalProps> = ({ isOpen, onClose, addEstadoCuentaAcumulado }) => {
    const [rawData, setRawData] = useState(defaultRawData);
    const [estadoDeCuenta, setEstadoDeCuenta] = useState<EstadoDeCuentaType | undefined>();
    const [banco, setBanco] = useState<BancosType | undefined>();

    const onChangeRawData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRawData(e.target.value);
    };

    const handleAddEstadoCuentaAcumulado = () => {
        if (!estadoDeCuenta)
            return
        addEstadoCuentaAcumulado(estadoDeCuenta)
        onClose()
    }

    const handleProcesarEstadoDeCuenta = () => {
        const newEstadoCuenta = procesarEstadoDeCuenta(rawData, banco)
        if (newEstadoCuenta) {
            setEstadoDeCuenta(newEstadoCuenta.estadoCuenta)
            setRawData(newEstadoCuenta.rawEstadoCuenta)
            setBanco(newEstadoCuenta.banco)
        }
    }

    return (

        <Dialog
            fullScreen
            open={isOpen}
            onClose={onClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Alta estado de cuenta
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleAddEstadoCuentaAcumulado}>
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Grid container spacing={4} className="pl-10 pt-5">
                <Grid item xs={12} md={12}>
                    <Button variant="outlined" onClick={handleProcesarEstadoDeCuenta}>Procesar estado de cuenta</Button>
                </Grid>
                <Grid item xs={12} md={12}>
                    <TextField
                        placeholder="MultiLine with rows: 2 and rowsMax: 4"
                        value={rawData}
                        onChange={onChangeRawData}
                        className='w-full'
                        multiline
                        rows={10}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    {banco?.nombre}
                </Grid>
                <Grid item xs={12} md={12}>
                    <TableContainer component={Paper} className='mt-11'>
                        <Table sx={{ minWidth: 649 }} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="right">Concepto</TableCell>
                                    <TableCell align="right">Monto Original</TableCell>
                                    <TableCell align="right">Costo Mensualidad</TableCell>
                                    <TableCell align="right">Mensualidades Restaurantes</TableCell>
                                    <TableCell align="right">Saldo Pendiente</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {estadoDeCuenta && estadoDeCuenta.map((row, key) => (
                                    <TableRow
                                        key={row.concepto + key}
                                        sx={{ '&:last-child td, &:last-child th': { border: -1 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.fecha}
                                        </TableCell>
                                        <TableCell align="right">{row.concepto}</TableCell>
                                        <TableCell align="right">{row.montoOriginal}</TableCell>
                                        <TableCell align="right">{row.costoMensualidad}</TableCell>
                                        <TableCell align="right">{row.mensualidaesRestantes}</TableCell>
                                        <TableCell align="right">{row.saldoPendiente}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Dialog>
    )
}

export default AgregarEstadoDeCuenta;