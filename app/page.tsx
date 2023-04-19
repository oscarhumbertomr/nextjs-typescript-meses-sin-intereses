'use client';
import React, { useState, useMemo } from "react";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)





const defaultRawData = 'POR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,107.00 1 de 6 1,017.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 10 PAYPAL VOLARIS OPM XXXX 6,687.00 1 de 6 1,114.50\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 19 PAYPAL CYBERPUERTA OPM XXXX 19,138.00 7 de 12 11,163.85\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 21 SAMS MERIDA NWM XXXX 12,274.98 13 de 18 8,865.28\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nNov 20 AMAZON MX MKTPLACE MSI ANE\n\nXXXX \n\n3,299.00 7 de 12 1,924.40\n\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nDic 26 LIVERPOOL MERIDA DLI XXXX  10,890.00 2 de 6 3,630.00\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 16 SAMS MERIDA NWM XXXX 3,579.48 9 de 12 2,684.61\nPOR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452\nEne 22 CCP MADERO CDMX CAG XXXX 780.00 3 de 6 390.00'
const defaultTextoToRemove = 'POR SU TARJETA TITULAR NIKOLA TESLA FARADAY # 5542 2572 9871 3452'
const defaultDineroDisponible = 10000
const defaultGastosFijos = 2000

type detalleEstadoDeCuentaType = {
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

type EstadoDeCuentaType = detalleEstadoDeCuentaType[]

const mesesDelAno = [
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
const fechaActual = new Date()
const indexMesActual = fechaActual.getMonth()

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

const getMesesEndeudado = (estadoDeCuenta: EstadoDeCuentaType) => {
    let mesesEndeudado = estadoDeCuenta.map(cargo => cargo.progresoMensualidades.mesesPendientes)
    return Math.max(...mesesEndeudado)
}

const getMesesPorPagar = (
    dineroDisponible: number, 
    gastosFijos: number,
    mesesEndeudado: number) => {
        let arrayMeses = []
        let arrayDineroDisponibleMensual = []
        for (let index = 0; index < mesesEndeudado; index++) {
            let indexMes = indexMesActual + index + 1
            if (indexMes > 11) {
                arrayMeses.push(mesesDelAno[indexMes - 12])
            } else {
                arrayMeses.push(mesesDelAno[indexMes])
            }
            arrayDineroDisponibleMensual.push(dineroDisponible - gastosFijos)
        }
        return {
            meses: arrayMeses,
            dineroDisponibleMensual: arrayDineroDisponibleMensual,
        }
}

const getHistorialMesesPorPagar = (
    estadoDeCuenta: EstadoDeCuentaType,
    dineroDisponible: number,
    gastosFijos: number,
    mesesEndeudado: number) => {
    let historialDeuda = []
    let historialDisponible = []
    for (let index = 0; index < mesesEndeudado; index++) {
        let pagoMes = estadoDeCuenta.reduce((total, object) => {
            let mesesPendientes = object.progresoMensualidades.mesesPendientes
            if (mesesPendientes - index > 0) {
                return total + object.costoMensualidad;
            }
            return total
        }, 0)
        historialDeuda.push(pagoMes)
        historialDisponible.push(dineroDisponible - pagoMes - gastosFijos)
    }
    return {
        pagoMes: historialDeuda,
        dineroDisponibleMensual: historialDisponible,
    }
}



export default function Home() {

    const [textToRemove, setTextoToRemove] = useState(defaultTextoToRemove);
    const [rawData, setRawData] = useState(defaultRawData);
    const [dineroDisponible, setDineroDisponible] = useState(defaultDineroDisponible);
    const [gastosFijos, setGastosFijos] = useState(defaultGastosFijos);

    const onChangeTextoToRemove = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextoToRemove(e.target.value);
    };
    const onChangeRawData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRawData(e.target.value);
    };
    const onChangeDineroDisponible = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDineroDisponible(Number(e.target.value));
    };
    const onChangeGastosFijos = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGastosFijos(Number(e.target.value));
    };





    const csvToJson = useMemo((): EstadoDeCuentaType => {
        let items = rawData.split(textToRemove)
        items = items.filter(n => n)
        return items.map(cargo => {
            cargo = cargo.replace('\n', ' ').replace(/\s+/g, ' ').trim()
            let { mesesPendientes, totalMeses } = getMensualidaesRestantes(cargo)
            let montoOriginal = getMontoOriginal(cargo)
            return {
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
    }, [rawData, textToRemove])






    const barChartData = useMemo(() => {
        const mesesEndeudado = getMesesEndeudado(csvToJson)
        const historialMesesPorPagar = getHistorialMesesPorPagar(csvToJson, dineroDisponible, gastosFijos, mesesEndeudado)
        const mesesPorPagar = getMesesPorPagar(dineroDisponible, gastosFijos, mesesEndeudado)
        return {
            labels: mesesPorPagar.meses,
            datasets: [
                {
                    label: 'Pago Mensual',
                    borderColor: "rgba(255, 20, 0)",
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: (ctx: any) => {
                        const canvas = ctx.chart.ctx;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 500);
                        gradient.addColorStop(0, 'rgba(255,20,0,0)');
                        gradient.addColorStop(0.25, 'rgba(255,20,0,1)');
                        gradient.addColorStop(1, 'rgba(255,20,0,0.03)');
                        return gradient;
                    },
                    tension: 0.25,
                    data: historialMesesPorPagar.pagoMes
                },
                {
                    label: "Dinero Libre",
                    data: historialMesesPorPagar.dineroDisponibleMensual,
                    fill: true,
                    backgroundColor: (ctx: any) => {
                        const canvas = ctx.chart.ctx;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 300);


                        gradient.addColorStop(0.5, 'rgba(20,255,0,0.3)');
                        gradient.addColorStop(1, 'rgba(20,255,0,0)');
                        return gradient;
                    },
                    borderColor: "rgba(100, 255, 0, 1)",
                    borderWidth: 2,
                },
                {
                    label: "Dinero Disponible Mensual",
                    data: mesesPorPagar.dineroDisponibleMensual,
                    backgroundColor: "rgba(20, 20, 255, 0.3)",
                    borderColor: "rgba(0, 20, 255, 1)",
                    borderWidth: 2,
                },
            ],
        }
    }, [csvToJson, dineroDisponible, gastosFijos])


    return (
        <Container maxWidth="lg" className="pb-10">
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Grafica Meses sin intereses
                </Typography>

            </Box>
            <Grid container spacing={4}>
                <Grid item xs={4}>
                    <TextField
                        label="Ingreso Mensual"
                        type="number"
                        variant="standard"
                        className='w-full'
                        value={dineroDisponible}
                        onChange={onChangeDineroDisponible}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }} />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Gastos Fijos"
                        type="number"
                        variant="standard"
                        className='w-full'
                        value={gastosFijos}
                        onChange={onChangeGastosFijos}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }} />
                </Grid>
                <Grid item xs={12} md={12}>
                    <TextField
                        label="Texo a eliminar"
                        variant="standard"
                        className='w-full'
                        value={textToRemove}
                        onChange={onChangeTextoToRemove} />
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
            </Grid>
            <TableContainer component={Paper} className='mt-10'>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
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
                        {csvToJson.map((row, key) => (
                            <TableRow
                                key={row.concepto + key}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
            <Line width={300} height={100} data={barChartData}
                chart-id='myCustomId' />
        </Container>
    )
}
