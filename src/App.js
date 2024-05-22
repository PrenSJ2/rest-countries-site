import logo from './logo.svg';
import './App.css';
import {useEffect, useState, useRef} from "react";
import {fetchAllCountries} from "./api/RestCountries";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as agGrid from "ag-grid-community";
import Modal from 'react-modal';


Modal.setAppElement('#root'); // Ensure '#root' is your root element ID


function App() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);

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
        },
        onRowClicked: params => {
            setSelectedCountry(params.data);
            setModalIsOpen(true);
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
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={{
                    content: {
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        right: '40px',
                        bottom: '40px',
                        border: '1px solid #ccc',
                        background: '#fff',
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '4px',
                        outline: 'none',
                        padding: '20px',
                        zIndex: 9999
                    }
                }}
            >
                <h2>{selectedCountry?.name?.common || 'Country Details'}</h2>
                <h2>{selectedCountry?.flag}</h2>
                <div>
                    <h3>General Data:</h3>
                    <strong>Population:</strong> {selectedCountry?.population}<br/>
                    <strong>Currencies:</strong> {Object.values(selectedCountry?.currencies || {}).map(c => c.name).join(', ')}<br/>
                    <strong>Timezones:</strong> {selectedCountry?.timezones?.join(', ')}<br/>
                    <h3>Location Data:</h3>
                    <strong>Capital:</strong> {selectedCountry?.capital}<br/>
                    <strong>Region:</strong> {selectedCountry?.region}<br/>
                    <strong>Subregion:</strong> {selectedCountry?.subregion}<br/>
                    <strong>Lat / Long:</strong> {selectedCountry?.latlng?.join(', ')}<br/>
                    <strong>Area:</strong> {selectedCountry?.area}<br/>
                    <strong>Landlocked:</strong> {selectedCountry?.landlocked ? 'Yes' : 'No'}<br/>
                    <strong>Borders:</strong> {selectedCountry?.borders?.join(', ')}<br/>

                    <h3>Language:</h3>
                    <strong>Languages:</strong> {Object.values(selectedCountry?.languages || {}).join(', ')}<br/>
                    <strong>Translations:</strong> {Object.entries(selectedCountry?.translations || {}).map(([lang, names]) => `${lang}: ${names.official}, ${names.common}`).join(', ')}<br/>

                </div>
                <button onClick={() => setModalIsOpen(false)}>Close</button>
            </Modal>r
        </div>
    );
}

export default App;