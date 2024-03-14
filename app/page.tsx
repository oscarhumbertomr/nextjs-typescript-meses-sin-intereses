'use client';
import React, { useState, useMemo } from "react";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import AgregarEstadoDeCuenta from "./components/agregarEstadoDeCuenta";
import { toFixed } from "@/src/logic/utils";
import {
	defaultDineroDisponible,
	defaultGastosFijos,
	defaultMesesFondoDeAhorros,
	mesesDelAno
} from "@/src/constants";
import { EstadoDeCuentaType } from "@/src/types";

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

const fechaActual = new Date()
const indexMesActual = fechaActual.getMonth()

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
	const [dineroDisponible, setDineroDisponible] = useState(defaultDineroDisponible);
	const [gastosFijos, setGastosFijos] = useState(defaultGastosFijos);
	const [mesesFondoDeAhorros, setMesesFondoDeAhorros] = useState(defaultMesesFondoDeAhorros);
	const [open, setOpen] = React.useState(false);
	const [estadoCuentaAcumulado, setEstadoCuentaAcumulado] = useState<EstadoDeCuentaType>([])

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleBorrarTodo = () => {
		setEstadoCuentaAcumulado([])
	}

	const addEstadoCuentaAcumulado = (newEstadoCuenta: EstadoDeCuentaType) => {
		setEstadoCuentaAcumulado([...estadoCuentaAcumulado, ...newEstadoCuenta])
	}
	const onChangeDineroDisponible = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDineroDisponible(Number(e.target.value));
	};
	const onChangeGastosFijos = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGastosFijos(Number(e.target.value));
	};

	const fondoDeAhorroSujerido = useMemo(() => {
		const mesesEndeudado = getMesesEndeudado(estadoCuentaAcumulado)
		const historialMesesPorPagar = getHistorialMesesPorPagar(estadoCuentaAcumulado, dineroDisponible, gastosFijos, mesesEndeudado)
		const arrayFondoDeAhorro = historialMesesPorPagar.pagoMes.slice(0, mesesFondoDeAhorros)
		const fondoDeAhorro = arrayFondoDeAhorro.reduce((accumulator, currentValue) => {
			return accumulator + currentValue
		}, 0);
		return fondoDeAhorro
	}, [estadoCuentaAcumulado, dineroDisponible, gastosFijos, mesesFondoDeAhorros])

	const porcentajeDeudaFondoDeAhorros = useMemo(() => {
		return fondoDeAhorroSujerido * 100 / (mesesFondoDeAhorros * dineroDisponible)

	}, [fondoDeAhorroSujerido, dineroDisponible, mesesFondoDeAhorros])


	const barChartData = useMemo(() => {
		const mesesEndeudado = getMesesEndeudado(estadoCuentaAcumulado)
		const historialMesesPorPagar = getHistorialMesesPorPagar(estadoCuentaAcumulado, dineroDisponible, gastosFijos, mesesEndeudado)
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
	}, [estadoCuentaAcumulado, dineroDisponible, gastosFijos])


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
				<Grid item xs={4}>
					<Button variant="outlined" onClick={handleClickOpen}>Agregr Estado de Cuenta</Button>
				</Grid>
				{estadoCuentaAcumulado.length > 0 && <><Grid item xs={4}>
					<Button variant="outlined" onClick={handleBorrarTodo}>Borrar todo</Button>
				</Grid><Grid item xs={12}>
						<TableContainer component={Paper} className='mt-11'>
							<Table sx={{ minWidth: 649 }} size="small" aria-label="a dense table">
								<TableHead>
									<TableRow>
										<TableCell>Banco</TableCell>
										<TableCell>Fecha</TableCell>
										<TableCell align="right">Concepto</TableCell>
										<TableCell align="right">Monto Original</TableCell>
										<TableCell align="right">Costo Mensualidad</TableCell>
										<TableCell align="right">Mensualidades Restaurantes</TableCell>
										<TableCell align="right">Saldo Pendiente</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{estadoCuentaAcumulado.map((row, key) => (
										<TableRow
											key={row.concepto + key}
											sx={{ '&:last-child td, &:last-child th': { border: -1 } }}
										>
											<TableCell component="th" scope="row">
												{row.banco}
											</TableCell>
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
					</Grid><Grid xs={12}>
						Usted debe de contar con un fondo de ahorro de {fondoDeAhorroSujerido + (gastosFijos * mesesFondoDeAhorros)} para
						los siguientes {mesesFondoDeAhorros} meses, lo que equivale a {mesesFondoDeAhorros} meses
						de los gastos de los proximos {mesesFondoDeAhorros} meses de MSI ({fondoDeAhorroSujerido}) mas {mesesFondoDeAhorros} meses de gastos fijos ({gastosFijos * mesesFondoDeAhorros}),
						lo que representa el {toFixed(porcentajeDeudaFondoDeAhorros)} % de tu dinero disponible en los siguientes {mesesFondoDeAhorros} meses de dinero disponible
					</Grid><Grid xs={12}>
						<Line width={301} height={100} data={barChartData}
							chart-id='myCustomId' />
					</Grid></>}
				<Grid xs={13}>
					- Importar Gastos Fijos CSV<br />
					- Deuda Total<br />
					- refactor
					- seleccionar meses fondo de ahorro
					- exportar PDF
					- exportar e importar json
					- mostrar una tabla con las deudas de los proximos 6 meses
				</Grid>
			</Grid>
			{open && <AgregarEstadoDeCuenta isOpen={open} onClose={handleClose} addEstadoCuentaAcumulado={addEstadoCuentaAcumulado} />}
		</Container>
	)
}
