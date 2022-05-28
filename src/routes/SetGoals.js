import {
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    Button
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { setDoc, getDoc, doc, getFirestore } from 'firebase/firestore/lite';
import { Delete } from '@mui/icons-material';
import { DialogContext } from '../DialogProvider';
import firebase from '../firebase'
import { useSelector } from 'react-redux';

export default function SetGoalsTable() {
    const [goals, setGoals] = useState([]);
    const { openDialog, closeDialog } = useContext(DialogContext);
    const user = useSelector(state => state.user.user);

    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const db = getFirestore(firebase);

    useEffect(() => {
        if (!user) return;
        (async () => setGoals((await getDoc(doc(db, 'users', (await user).email, 'goals', tomorrowStr))).data()?.goals ?? []))();
    }, [user]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow >
                        <TableCell><Delete /></TableCell>
                        <TableCell>Goal</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goals.map((item, idx) => (
                        <TableRow key={idx} >
                            <TableCell>
                                <Delete
                                    sx={{ cursor: 'pointer' }}
                                    onClick={async() => {
                                        const updatedGoals = [...goals];
                                        updatedGoals.splice(idx, 1);
                                        setDoc(doc(db, 'users', (await user).email, 'goals', tomorrowStr), { goals: updatedGoals });
                                        setGoals(updatedGoals);
                                    }} />
                            </TableCell>
                            <TableCell>{item.goal}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell
                            colSpan={2}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => openDialog((
                                <Dialog open={true} onClose={closeDialog}>
                                    <form onSubmit={async e => {
                                        e.preventDefault();
                                        const goal = e.target.goal.value;
                                        if (!goal) return;
                                        const updatedGoals = [...goals, { goal }];
                                        setDoc(doc(db, 'users', (await user).email, 'goals', tomorrowStr), { goals: updatedGoals });
                                        setGoals(updatedGoals);
                                        closeDialog();
                                    }}>
                                        <DialogTitle>Add New Goal</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>Set a goal</DialogContentText>
                                            <TextField
                                                name='goal'
                                                autoFocus
                                                margin='dense'
                                                label='Goal'
                                                fullWidth
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={closeDialog}>Cancel</Button>
                                            <Button variant='contained' type='submit'>Save</Button>
                                        </DialogActions>
                                    </form>
                                </Dialog>
                            ))}
                        >Add new goal</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}