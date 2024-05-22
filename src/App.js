import logo from './logo.svg';
import './App.css';
import {useEffect, useState, useRef} from "react";
import {fetchAllCountries} from "./api/RestCountries";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as agGrid from "ag-grid-community";

function App() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const gridApiRef = useRef(null);

    const gridOptions = {
        columnDefs: [
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'flag', headerName: 'Flag', width: 200 },
            { field: 'population', headerName: 'Population', width: 200 },
            { field: 'languages', headerName: 'Languages', width: 200 },
            { field: 'currencies', headerName: 'Currencies', width: 200 },
        ],
        animateRows: true,
        onGridReady: params => {
            gridApiRef.current = params.api;
            if (rows.length > 0) {
                console.log('Setting row data:', rows);
                gridApiRef.current.setRowData(rows);
            }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAllCountries();
                setRows(data);
                console.log('Fetched all countries', data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching all countries', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            const myGridElement = document.querySelector('#myGrid');
            agGrid.createGrid(myGridElement, gridOptions);
        }
    }, [loading]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Rest Countries</h1>
            </header>
            <div id="myGrid" className="ag-theme-quartz" style={{height: 600, width: '100%'}}></div>
        </div>
    )
}

export default App;