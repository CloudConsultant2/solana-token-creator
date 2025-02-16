import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Connect to the Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Function to create a new SPL token
async function createToken(tokenName, tokenSymbol, decimals, supply) {
    // Connect to the user's wallet (Phantom)
    const provider = window.solana;
    if (!provider) {
        alert('Please install Phantom wallet!');
        return;
    }
    await provider.connect();
    const payer = provider.publicKey;

    // Generate a new keypair for the token
    const mintKeypair = Keypair.generate();

    // Create the token
    const token = await Token.createMint(
        connection,
        payer,
        mintKeypair.publicKey,
        null,
        decimals,
        TOKEN_PROGRAM_ID
    );

    // Create an associated token account for the payer
    const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(payer);

    // Mint tokens to the associated token account
    await token.mintTo(
        associatedTokenAccount.address,
        payer,
        [],
        supply * Math.pow(10, decimals)
    );

    alert(`Token created successfully! Mint Address: ${mintKeypair.publicKey.toString()}`);
}

// Handle form submission
document.getElementById('tokenForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const tokenName = document.getElementById('tokenName').value;
    const tokenSymbol = document.getElementById('tokenSymbol').value;
    const tokenDecimals = parseInt(document.getElementById('tokenDecimals').value);
    const tokenSupply = parseInt(document.getElementById('tokenSupply').value);

    await createToken(tokenName, tokenSymbol, tokenDecimals, tokenSupply);
});