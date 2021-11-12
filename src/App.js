import { useEffect, useState, useCallback } from 'react';
import idl from './idl.json'
import kp from './keypair.json'
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import { frmatAccount, postedByAccount } from './utils/displayAccounts'
import {  checkIfWalletIsConnected, connectWallet} from './web3/phantom'
import instagramlogo from './assets/instagramlogo.svg'
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'RoberVH';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// System Program is a reference to the Solana runtime!
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl('devnet');

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
// state vars
  const [walletAddress, setWalletAddress] = useState(null)
  const [solana, setSolana] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [gifList, setGifList] = useState([]);

// utility methods *******************************************************************

const  getGifList = useCallback( async() => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    console.log("Got the account", account)
    setGifList(account.gifList)
    console.log("Gif list", account.gifList[0].userAddress.toString())



  } catch (error) {
    console.log("Error in getGifs: ", error)
    setGifList(null);
  }
}, [])


const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    connection, window.solana, opts.preflightCommitment,
  );
	return provider;
}

const createGifAccount = async () => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    console.log("ping")
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });
    console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
    await getGifList();

  } catch(error) {
    console.log("Error creating BaseAccount account:", error)
  }
}

// on Load methods ************************************************************************

// When our component first mounts, let's check to see if we have a connected Phantom Wallet from previous
// user visits to our Dapp; let's pass in the state var setting method for the UI to display accordingly
  useEffect(() => {
    const onLoad = async () => {
      const { solana } = window
      if (solana) {
        setSolana(solana)
        const  address = await checkIfWalletIsConnected(solana);
        console.log('address regreso con', address)
        setWalletAddress(address)
       } else {
            alert('Solana object not found! Get a Phantom Wallet 👻');
       }
    };
      window.addEventListener('load', onLoad)
      return () => window.removeEventListener('load', onLoad)
  }, []);

// fetch gifs when we have a walletAddress
useEffect(() => {
  if (walletAddress) {
    console.log('Fetching GIF list...');
    getGifList()
  }
}, [walletAddress, getGifList]);

// rendering Methods ************************************************************************

// We want to render this UI when the user hasn't connected their wallet to our app yet 
// or in case they already have a connected wallet but they have purposedely locked their wallet or set a timeout
// to lock it, this will ask for the unlocking password and set the address up 
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => connectWallet(setWalletAddress)}
    >
   Connect to Solana Wallet
 </button>
);

// render the gif collection
const renderConnectedContainer = () => {
	// If we hit this, it means the program account hasn't be initialized.
  if (gifList === null) {
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } 
	// Otherwise, we're good! Account exists. User can submit GIFs.
	else {
    return(
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
					{/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img alt='' src={item.gifLink} />
              <div className="gif-bottom-container">
                <label>{postedByAccount(item.userAddress.toString())}</label>
                <button>Tip me</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
};

// Handling Methods *******************************************************************

const onInputChange = (event) => {
  const { value } = event.target;
  setInputValue(value);
};

const sendGif = async () => {
  if (inputValue.length === 0) {
    console.log("No gif link given!")
    return
  }
  console.log('Gif link:', inputValue);
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.addGif(inputValue, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    console.log("GIF sucesfully sent to program", inputValue)

    await getGifList();
    setInputValue('');
  } catch (error) {
    console.log("Error sending GIF:", error)
  }
};


  return (
    <div className="App">
        <div className="account">
            {walletAddress && frmatAccount(walletAddress)}
        </div>
      <div >
        <div >
          <div className="App-logo">
            <img src={instagramlogo}  alt="logo" />
            <p className="header"> Insta-blockchain</p>
          </div>  
          <p className="sub-text">
            Upload and watch your graphics in the blockchain ✨
          </p>
          {!walletAddress  && solana && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
