import React, { Component } from 'react';
import '../Today/today.css';
import axios from 'axios';
import Pusher from 'pusher-js';

class Today extends Component {
    // Adds a class constructor that assigns the initial state values:
    constructor () {
        super();
        this.state = {
            btcprice: '',
            ltcprice: '',
            ethprice: ''
        };
    }

    sendPricePusher (data) {
        console.log(`Price pusher : ${JSON.stringify(data)}`);
        axios.post('/prices/new', {
            prices: data
        })
          .then(response => {
              console.log(response)
          })
          .catch(error => {
              console.log(error)
          })
     }

     updatePriceFromStorage() {
        this.setState({ btcprice: localStorage.getItem('BTC') });
        this.setState({ ethprice: localStorage.getItem('ETH') });
        this.setState({ ltcprice: localStorage.getItem('LTC') });
    }

    // This is called when an instance of a component is being created and inserted into the DOM.
    componentWillMount () {
        axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC&tsyms=USD')
            .then(response => {
                // We set the latest prices in the state to the prices gotten from Cryptocurrency.
                // this.setState({ btcprice: response.data.BTC.USD });
                // this.setState({ ethprice: response.data.ETH.USD });
                // this.setState({ ltcprice: response.data.LTC.USD });
                this.setState({ btcprice: response.data.BTC.USD });
                localStorage.setItem('BTC', response.data.BTC.USD);
    
                this.setState({ ethprice: response.data.ETH.USD });
                localStorage.setItem('ETH', response.data.ETH.USD);
    
                this.setState({ ltcprice: response.data.LTC.USD });
                localStorage.setItem('LTC', response.data.LTC.USD);                
            })
            // Catch any error here
            .catch(error => {
                console.log(error)
            });

        // establish a connection to Pusher
        this.pusher = new Pusher('f757f8ea8d4e2f362f02', {
            cluster: 'ap2',
            encrypted: true
        });
        // Subscribe to the 'coin-prices' channel
        this.prices = this.pusher.subscribe('coin-prices');            
    }

    componentDidMount () {
        setInterval(() => {
            if (!navigator.onLine) {
                this.updatePriceFromStorage();
            }
            else {
                axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC&tsyms=USD')
                .then(response => {
                    this.sendPricePusher (response.data)
                })
                .catch(error => {
                    console.log(error)
                    this.updatePriceFromStorage();
                })
            }            
        }, 10000);

        // We bind to the 'prices' event and use the data in it (price information) to update the state values, thus, realtime changes 
        this.prices.bind('prices', price => {
            localStorage.setItem('BTC', price.prices.BTC.USD);
            this.setState({ btcprice: price.prices.BTC.USD });

            localStorage.setItem('ETH', price.prices.ETH.USD);
            this.setState({ ethprice: price.prices.ETH.USD });

            localStorage.setItem('LTC', price.prices.LTC.USD);
            this.setState({ ltcprice: price.prices.LTC.USD });
        }, this);
     }

    // The render method contains the JSX code which will be compiled to HTML.
    render() {
        return (
            <div className="today--section container">
                <h2>Current Price</h2>
                <div className="columns today--section__box">
                    <div className="column btc--section">
                        <h5>${this.state.btcprice}</h5>
                        <p>1 BTC</p>
                    </div>
                    <div className="column eth--section">
                        <h5>${this.state.ethprice}</h5>
                        <p>1 ETH</p>
                    </div>
                    <div className="column ltc--section">
                        <h5>${this.state.ltcprice}</h5>
                        <p>1 LTC</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Today;