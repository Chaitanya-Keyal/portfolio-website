---
title: 'Bitcoin: origins, open source development and SeedSigner'
date: 2025-07-04
summary: Why Bitcoin exists at all, how the blockchain, cryptography and proof of work hold it together, and the BIP-85 work I am doing on SeedSigner this summer.
---

Bitcoin is essentially two things: a digital asset (BTC) that holds exchange value, and a payment network (the Bitcoin protocol) that moves it.

But why does Bitcoin exist in the first place? Why create a new digital asset when traditional money already exists, and why do so many people value it today? To answer that, it helps to look at the conditions it was born into.

## Historical background

In the 1990s, cryptographers and computer scientists began exploring how cryptography could be used to achieve financial privacy and freedom from surveillance. The central idea was that transactions could be conducted freely and anonymously, without oversight from governments or financial institutions. A number of early digital cash systems and whitepapers were proposed, outlining how such systems might work.

All of them ran into the same wall: the double-spending problem. Digital files are trivial to copy, so how does a system stop someone duplicating a coin and spending it twice, without a central authority to keep score?

In 2008 the world went through a massive financial crisis. Trust in large financial institutions was shaken as their risky practices led to widespread economic collapse, and the failure of institutions once thought too big to fail sent people looking for alternatives.

On 31 October 2008, a pseudonymous figure named Satoshi Nakamoto published a whitepaper titled [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf) to a cryptography mailing list. It proposed a system that combined older cryptographic ideas with new mechanisms to create a decentralised digital currency that solved double spending.

On 3 January 2009, Satoshi mined the first block of the Bitcoin blockchain, the Genesis Block. That was the start of the network. Satoshi guided its early development, then stepped away in 2011 and handed the project to the broader open-source community.

## The architecture of Bitcoin

Bitcoin rests on three things: a distributed ledger, cryptography, and a consensus mechanism.

### The blockchain

Every financial system needs a ledger. In traditional banking that ledger is centrally maintained. Bitcoin instead uses a distributed one, where every participant keeps their own copy. It is structured as a chain of blocks, each holding a group of transactions, with a new block added roughly every ten minutes.

Each block contains a hash of the block before it. That hash is a fingerprint of the block's contents, so changing any data in a block changes its hash and breaks the link to the next one. Rewriting history therefore means recomputing every block after the one you touched, which costs more than it could possibly be worth. That is what makes the chain tamper-resistant.

### Cryptography

Bitcoin uses the SHA-256 hashing algorithm for data integrity. It is a one-way function: infeasible to reverse, and infeasible to find two inputs that produce the same output. That property secures the chain structure, transaction IDs and the mining process.

Ownership is proved with public-key cryptography. Each user holds a public and private key pair. The private key stays secret, the public key can be shared freely. Sending Bitcoin means signing the transaction with the private key, and anyone can verify that signature against the public key. Only the holder of the private key can authorise a spend, and nobody else can impersonate them.

### Proof of work

Proof of work is how the network agrees on a single history, and it is the answer to double spending in a decentralised setting.

Miners collect pending transactions into blocks. To add one, a miner has to find a nonce such that hashing it together with the block's contents produces a result below a target. That target moves with the network's difficulty, which adjusts to hold the block rate near ten minutes.

SHA-256 is expensive and its output is unpredictable, so there is no shortcut: miners try enormous numbers of combinations until one works. When a miner finds a valid block it broadcasts it, other nodes check the result, and if it holds up they append it to their own copy of the chain.

Three properties fall out of this:

- **Security.** Rewriting the chain means out-computing the rest of the network, which needs more than half its total hash power and costs more than the attack could return.
- **Consensus.** Nodes follow the longest valid chain, so they converge without anyone coordinating them.
- **Incentives.** Miners are paid in newly created Bitcoin, which is both what motivates them to keep the network running and the mechanism that issues new coins on a fixed schedule.

## Summer of Bitcoin

[Summer of Bitcoin](https://summerofbitcoin.org) is a global summer internship that introduces university students to Bitcoin open-source development. It exists to grow a new generation of contributors, with mentorship, learning resources and stipends, and students work on real Bitcoin infrastructure rather than exercises. Selection is competitive, weighing skill, motivation and the potential to contribute meaningfully to the ecosystem.

It is not only about writing code. A good part of it is understanding the philosophical, economic and technical principles the system rests on. Participants work on the software behind wallets, node implementations, hardware devices, privacy tools and lightning infrastructure.

In the fifth edition, in 2025, I was selected to work on SeedSigner, a project focused on secure and affordable Bitcoin custody. My contribution is to improve its implementation of BIP-85.

## SeedSigner

[SeedSigner](https://github.com/SeedSigner/seedsigner) is an open-source project that lets you build an air-gapped Bitcoin signing device from a Raspberry Pi Zero and a handful of inexpensive parts. Unlike commercial hardware wallets, which store private keys internally, SeedSigner is stateless: it never retains the seed or any key material after shutdown. That removes a whole class of risk around device compromise and theft.

Transactions move in and out over a QR interface, carrying partially signed Bitcoin transactions (PSBTs) between the offline signer and an online wallet. Because nothing else crosses that boundary, the private keys are never exposed to an internet-connected environment. The device boots into a Python UI where you can enter or generate a seed phrase and sign PSBTs scanned through the camera.

The project's priorities are user control, verifiability and accessibility, which are core values in this space. Being cheap and auditable also makes it a realistic option for individuals and communities in emerging markets, where both of those matter more.

## BIP-85 and my project

> One Seed to rule them all,<br />
> One Key to find them,<br />
> One Path to bring them all,<br />
> And in cryptography bind them.

[BIP-85](https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki) is a Bitcoin improvement proposal that lets you derive many independent child seeds from one master seed, deterministically. That enables a few things that are otherwise awkward:

- Running separate wallets for separate purposes: savings, spending, testing.
- Creating seeds for friends or family without backing each one up separately.
- Using different wallets with different software while relying on a single secure backup.

SeedSigner already supports BIP-85 for generating child seeds, but the derived keys cannot yet be used for signing or address generation on the device itself. My project adds that, carefully:

- **Security first.** The feature is off by default and clearly labelled, and visual cues distinguish a BIP-85 child seed from a primary one.
- **Transparency.** Metadata such as the derivation path and parent fingerprint is shown, so it is always clear where a seed came from.
- **Usability.** Loading a child seed fits into the existing flow with as little friction as possible, so the people who want it can actually reach for it.

The goal is to make SeedSigner more flexible without giving up any safety, which matters most for people running several wallets or taking part in multisig setups.

## Final thoughts

Bitcoin is one of the more influential technical ideas of this century, and what makes it work is the combination rather than any single part: cryptography, distributed systems and economic incentives arranged so that the cheapest thing to do is also the honest thing. Open-source projects like SeedSigner and programs like Summer of Bitcoin are how that system keeps being extended by people who care about transparency, accessibility and self-sovereignty.
