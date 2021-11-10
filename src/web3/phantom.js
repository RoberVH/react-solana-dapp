
// just to make sure solana will be assing a value when window is fully finishing loading
// we'll instantiated it at checkIfWalletIsConnected method that get's called once the component is mount as
// per Phamton wallet team suggestion


export let { solana } = window;
//export let address;

export const checkIfWalletIsConnected = async (solana) => {
    try {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!', solana);
        /* The solana object gives us a function that will allow us to connect
         * directly with the user's wallet */
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log( 'Connected with Public Key:', response.publicKey.toString());
        console.log('response is', response)
        //const address= response.publicKey.toString()
        return (response.publicKey.toString())
        }
    } catch (error) {
      console.error(error);
      return null
    }
  };

/* Let's define this method so our code doesn't break */  
export const connectWallet = async (setWalletAddress) => {  
    
     const { solana } = window;

    if (solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
    }
};