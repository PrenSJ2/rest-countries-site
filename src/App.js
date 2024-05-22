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
    const [filterText, setFilterText] = useState('');
    const gridApiRef = useRef(null);

    const gridOptions = {
        columnDefs: [
            { field: 'name.common', headerName: 'Name', width: 200 },
            { field: 'flag', headerName: 'Flag', width: 200 },
            { field: 'population', headerName: 'Population', width: 200 },
            {
                field: 'languages',
                headerName: 'Languages',
                width: 400,
                valueGetter: params => params.data.languages ? Object.values(params.data.languages).join(', ') : ''
            },
            {
                field: 'currencies',
                headerName: 'Currencies',
                width: 200,
                valueGetter: params => params.data.currencies ? Object.values(params.data.currencies).map(currency => currency.name).join(', ') : ''
            },
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

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        if (gridApiRef.current) {
            gridApiRef.current.setQuickFilter(event.target.value);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Rest Countries</h1>
                <input
                    type="text"
                    value={filterText}
                    onChange={handleFilterChange}
                    placeholder="Search countries..."
                    style={{ marginBottom: '10px' }}
                />
            </header>
            <div id="myGrid" className="ag-theme-quartz" style={{height: 600, width: '100%'}}></div>
        </div>
    );
}

export default App;