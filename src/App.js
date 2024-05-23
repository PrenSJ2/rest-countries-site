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
    const [favourites, setFavourites] = useState(JSON.parse(localStorage.getItem('favourites')) || []);
    const [filterFavorites, setFilterFavorites] = useState(false);

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
        pagination: true,
        paginationPageSize: 18,
        paginationPageSizeSelector: [18, 20, 50, 100],
        onGridReady: params => {
            gridApiRef.current = params.api;
            if (rows.length > 0) {
              const data = filterFavorites ? rows.filter(row => favourites.includes(row.cca2)) : rows;
              gridApiRef.current.setRowData(data);
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

    useEffect(() => {
        if (gridApiRef.current) {
            const data = filterFavorites ? rows.filter(row => favourites.includes(row.cca2)) : rows;
            gridApiRef.current.setRowData(data);
        }
    }, [filterFavorites, rows, favourites]);

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        if (gridApiRef.current) {
            gridApiRef.current.setQuickFilter(event.target.value);
        }
    };

    const handleFavouriteClick = () => {
      if (selectedCountry) {
        if (favourites.includes(selectedCountry.cca2)) {
          const newfavourites = favourites.filter(code => code !== selectedCountry.cca2);
          setFavourites(newfavourites);
          localStorage.setItem('favourites', JSON.stringify(newfavourites));
        } else {
          const newfavourites = [...favourites, selectedCountry.cca2];
          setFavourites(newfavourites);
          localStorage.setItem('favourites', JSON.stringify(newfavourites));
        }
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
                    style={{marginBottom: '10px'}}
                />
                <button onClick={() => setFilterFavorites(!filterFavorites)}>
                    {filterFavorites ? 'Show All' : 'Show Favorites'}
                </button>
            </header>
            <div id="myGrid" className="ag-theme-quartz" style={{height: 600, width: '100%'}}></div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={{
                    content: {
                        WebkitOverflowScrolling: 'touch',
                    }
                }}
                className="Modal"
            >

                <div className="Modal-close" onClick={() => setModalIsOpen(false)}></div>
                <div className='modalDetails'>
                    <div>

                        <div className="Modal-title">
                            <span className="Modal-flag">{selectedCountry?.flag}</span>
                            <h2>{selectedCountry?.name?.common || 'Country Details'}</h2>
                        </div>
                        <button
                            className={`favourite ${selectedCountry && favourites.includes(selectedCountry.cca2) ? 'favourited' : ''}`}
                            onClick={handleFavouriteClick}
                        >
                            {selectedCountry && favourites.includes(selectedCountry.cca2) ?
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                                    <path fill="#FF0000"
                                          d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                                    <path
                                        d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                                </svg>
                            }
                        </button>

                        <h3>General Data:</h3>
                        {selectedCountry?.languages && <>
                            <strong>Languages:</strong> {Object.values(selectedCountry.languages).join(', ')}<br/></>}
                        {selectedCountry?.name?.native?.common && <><strong>Native
                            Name:</strong> {selectedCountry.name.native.common}<br/></>}
                        {selectedCountry?.population && <>
                            <strong>Population:</strong> {selectedCountry.population}<br/></>}
                        {selectedCountry?.currencies && <>
                            <strong>Currencies:</strong> {Object.values(selectedCountry.currencies).map(c => c.name).join(', ')}<br/></>}
                        {selectedCountry?.timezones && <>
                            <strong>Timezones:</strong> {selectedCountry.timezones.join(', ')}<br/></>}
                        {selectedCountry?.cca2 && <><strong>CCA2 Code:</strong> {selectedCountry.cca2}<br/></>}
                        {selectedCountry?.tld && <><strong>Top Level
                            Domain:</strong> {selectedCountry.tld.join(', ')}<br/></>}
                        {selectedCountry?.callingCode && <><strong>Calling
                            Code:</strong> {selectedCountry.callingCode}<br/></>}
                        {selectedCountry?.car?.side && <><strong>Driving
                            Side:</strong> {selectedCountry.car.side}<br/></>}

                        <h3>Location Data:</h3>
                        {selectedCountry?.capital && <><strong>Capital:</strong> {selectedCountry.capital}<br/></>}
                        {selectedCountry?.region && <><strong>Region:</strong> {selectedCountry.region}<br/></>}
                        {selectedCountry?.subregion && <>
                            <strong>Subregion:</strong> {selectedCountry.subregion}<br/></>}
                        {selectedCountry?.latlng && <><strong>Lat /
                            Long:</strong> {selectedCountry.latlng.join(', ')}<br/></>}
                        {selectedCountry?.area && <><strong>Area:</strong> {selectedCountry.area}<br/></>}
                        {selectedCountry?.landlocked !== undefined && <>
                            <strong>Landlocked:</strong> {selectedCountry.landlocked ? 'Yes' : 'No'}<br/></>}
                        {selectedCountry?.borders && <>
                            <strong>Borders:</strong> {selectedCountry.borders.join(', ')}<br/></>}
                    </div>
                    <div className='modalVisuals'>
                        <div>
                            {selectedCountry?.flags?.svg && <img className='flag' src={selectedCountry?.flags?.svg}
                                                                 alt={selectedCountry?.flags?.alt}/>}
                            {selectedCountry?.coatOfArms?.svg &&
                                <img className='coatOfArms' src={selectedCountry?.coatOfArms?.svg}
                                     alt={selectedCountry?.name?.common}/>}
                        </div>
                        {selectedCountry?.name?.common &&
                            <iframe src={`//maps.google.com/maps?q=${selectedCountry?.name?.common}&output=embed`}
                                    allowFullScreen></iframe>}
                    </div>
                </div>

            </Modal>
        </div>
    );
}

export default App;