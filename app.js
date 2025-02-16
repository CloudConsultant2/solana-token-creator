import { Connection, Keypair } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Connect to the Solana Devnet (change to Mainnet if needed)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Global variable to store the connected wallet
let wallet = null;

// Function to connect to Phantom Wallet
async function connectWallet() {
    const provider = window.solana;
    if (!provider) {
        alert('Please install Phantom wallet!');
        return;
    }

    try {
        await provider.connect();
        wallet = provider.publicKey;
        document.getElementById('walletStatus').textContent = `Wallet connected: ${wallet.toString()}`;
        alert('Wallet connected successfully!');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Function to create a new SPL token
async function createToken(tokenName, tokenSymbol, decimals, supply) {
    if (!wallet) {
        alert('Please connect your wallet first!');
        return;
    }

    try {
        // Generate a new keypair for the token
        const mintKeypair = Keypair.generate();

        // Create the token
        const token = await Token.createMint(
            connection,
            wallet, // Payer is the connected wallet
            mintKeypair.publicKey,
            null,
            decimals,
            TOKEN_PROGRAM_ID
        );

        // Create an associated token account for the payer
        const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet);

        // Mint tokens to the associated token account
        await token.mintTo(
            associatedTokenAccount.address,
            wallet,
            [],
            supply * Math.pow(10, decimals)
        );

        alert(`Token created successfully! Mint Address: ${mintKeypair.publicKey.toString()}`);
    } catch (error) {
        console.error('Error creating token:', error);
        alert('Failed to create token. Please check the console for details.');
    }
}

// Handle Connect Wallet button click
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// Handle form submission
document.getElementById('tokenForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const tokenName = document.getElementById('tokenName').value;
    const tokenSymbol = document.getElementById('tokenSymbol').value;
    const tokenDecimals = parseInt(document.getElementById('tokenDecimals').value);
    const tokenSupply = parseInt(document.getElementById('tokenSupply').value);

    await createToken(tokenName, tokenSymbol, tokenDecimals, tokenSupply);
});