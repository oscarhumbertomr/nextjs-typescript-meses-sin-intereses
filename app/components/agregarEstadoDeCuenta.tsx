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
import { BANCOS, defaultRawData } from "@/src/constants";

import {
	BancosType,
	ModalProps,
	EstadoDeCuentaType
} from "@/src/types"
import { BanamexLogic } from "@/src/logic/BanamexLogic";
import AmericanExpressLogic from "@/src/logic/AmericanExpressLogic";


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


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
			const banamex = new BanamexLogic(rawEstadoCuenta, banco);
            ({ estadoCuenta, newRawData } = banamex.procesaEstadoDeCuenta())
            break;
        case 2:
			const amex = new AmericanExpressLogic(rawEstadoCuenta, banco);
            ({ estadoCuenta, newRawData } = amex.procesaEstadoDeCuenta())
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