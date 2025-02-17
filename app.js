import { Connection, Keypair } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
if (!window.solana) {
    alert('Phantom Wallet is not installed. Please install it to continue.');
} else {
    console.log('Phantom Wallet is installed!');
}

// Connect to the Solana Devnet (change to Mainnet if needed)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Global variables
let wallet = null; // Connected wallet
let mintKeypair = null; // Token mint keypair
let tokenDecimals = null; // Token decimals

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
        console.log('Wallet connected:', wallet.toString());
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
        mintKeypair = Keypair.generate();
        tokenDecimals = decimals;

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

// Invoke Mint
document.getElementById('invokeMint').addEventListener('click', async () => {
    if (!wallet || !mintKeypair) {
        alert('Please connect your wallet and create a token first!');
        return;
    }

    const mintAmount = prompt('Enter the amount to mint:'); // Example: 1000
    if (!mintAmount) return;

    try {
        const token = new Token(
            connection,
            mintKeypair.publicKey,
            TOKEN_PROGRAM_ID,
            wallet
        );

        const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet);
        await token.mintTo(
            associatedTokenAccount.address,
            wallet,
            [],
            mintAmount * Math.pow(10, tokenDecimals)
        );

        alert(`Minted ${mintAmount} tokens successfully!`);
    } catch (error) {
        console.error('Error minting tokens:', error);
        alert('Failed to mint tokens. Please check the console for details.');
    }
});

// Invoke Freeze
document.getElementById('invokeFreeze').addEventListener('click', async () => {
    if (!wallet || !mintKeypair) {
        alert('Please connect your wallet and create a token first!');
        return;
    }

    try {
        const token = new Token(
            connection,
            mintKeypair.publicKey,
            TOKEN_PROGRAM_ID,
            wallet
        );

        const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet);
        await token.freezeAccount(
            associatedTokenAccount.address,
            mintKeypair.publicKey,
            wallet,
            []
        );

        alert('Account frozen successfully!');
    } catch (error) {
        console.error('Error freezing account:', error);
        alert('Failed to freeze account. Please check the console for details.');
    }
});

// Invoke Revoke
document.getElementById('invokeRevoke').addEventListener('click', async () => {
    if (!wallet || !mintKeypair) {
        alert('Please connect your wallet and create a token first!');
        return;
    }

    try {
        const token = new Token(
            connection,
            mintKeypair.publicKey,
            TOKEN_PROGRAM_ID,
            wallet
        );

        const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet);
        await token.revoke(
            associatedTokenAccount.address,
            wallet,
            []
        );

        alert('Account revoked successfully!');
    } catch (error) {
        console.error('Error revoking account:', error);
        alert('Failed to revoke account. Please check the console for details.');
    }
});

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