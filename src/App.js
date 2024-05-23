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
                <p>
                  This is a project that uses React and the <a href='https://restcountries.com/'>REST Countries API</a> to display information about different countries.
                  Here are the key features:
                  <ul>
                    <li>You can search through the countries by name, emoji, population, languages, or currencies.</li>
                    <li>Select a row for more detailed information about a country.</li>
                    <li>Add countries to your favorites list.</li>
                    <li>You can also sort each column by selecting the column title.</li>
                  </ul>
                </p>
                <div className="searchInputs">
                    <input
                        type="text"
                        value={filterText}
                        onChange={handleFilterChange}
                        placeholder="Search countries..."
                    />
                    <button onClick={() => setFilterFavorites(!filterFavorites)}>
                        {filterFavorites ? 'Show All' : 'Show Favorites'}
                    </button>
                </div>
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
                className="modal"
            >

                <div className="modalClose" onClick={() => setModalIsOpen(false)}></div>
                <div className='modalDetails'>
                    <div>

                        <div className="modalTitle">
                            <span className="modalFlag">{selectedCountry?.flag}</span>
                            <h2>{selectedCountry?.name?.common || 'Country Details'}</h2>
                        </div>
                        <button
                            className={`favourite ${selectedCountry && favourites.includes(selectedCountry.cca2) ? 'favourited' : ''}`}
                            onClick={handleFavouriteClick}
                        >
                            {selectedCountry && favourites.includes(selectedCountry.cca2) ?
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24">
                                    <path fill="#FFD43B"
                                          d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24">
                                    <path
                                        d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
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
            <p className='signature'><a href='https://seb.onlineolive.xyz'>By Sebastian Prentice</a></p>
        </div>
    );
}

export default App;