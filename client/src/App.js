import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from './components/Navbar.js';
import Home from './components/Home.js';
import Create from './components/Create.js';
import MyListedItems from './components/MyListeditems.js';
import MyPurchases from './components/MyPurchase.js';
import MergedContractAbi from './contracts/MergedContract.json'; // Your merged contract ABI
import MergedContractAddress from './contracts/MergedContract-address.json'; // Your merged contract address
import { useState } from 'react';
import { ethers } from "ethers";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [mergedContract, setMergedContract] = useState({});

  const web3Handler = async () => {
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);

    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Reload on network or account change
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0]);
      await web3Handler();
    });

    // Load merged contract
    loadContract(signer);
  };

  const loadContract = async (signer) => {
    // Initialize the merged contract
    const contract = new ethers.Contract(
      MergedContractAddress.address,
      MergedContractAbi.abi,
      signer
    );

    // Set merged contract in state
    setMergedContract(contract);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">

        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Getting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home mergedContract={mergedContract} />} />
              <Route path="/create" element={<Create mergedContract={mergedContract} />} />
              <Route path="/my-listed-items" element={<MyListedItems mergedContract={mergedContract} account={account} />} />
              <Route path="/my-purchases" element={<MyPurchases mergedContract={mergedContract} account={account} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
