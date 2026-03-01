# Sovereign CLI Simulation Guide

This guide explains how to run and simulate the Sovereign mesh network using the CLI.

## Installation

Ensure you have dependencies installed:

```bash
npm install
```

## Mesh Simulation

The CLI now supports **Dynamic Mesh Discovery**. When a node starts, it registers itself in `data/mesh_registry.json`.

1. **Start Node A (Primary)**:

   ```bash
   node bin/sovereign.js status
   ```

2. **Start Node B (Simulator)**:

   ```bash
   SOVEREIGN_ID=node-beta node bin/sovereign.js status
   ```

3. **Discover from Node A**:
   ```bash
   node bin/sovereign.js peers
   ```
   _You will see 'node-beta' in the list!_

### 2. Check Node Status

Displays your Node ID, reputation, and mesh health.

```bash
node bin/sovereign.js status
```

### 3. Discover Peers

Scans the local mesh for other sovereign units.

```bash
node bin/sovereign.js peers
```

### 4. Send Intention (Chat)

Sends a signed message to the mesh network. This is recorded in `data/intentions.json`.

```bash
node bin/sovereign.js chat -t "I am the Sovereign. I declare my Will."
```

### 5. View Intentions (Logs)

View the recent history of messages circulating in the mesh.

```bash
node bin/sovereign.js logs
```

## Persistence & Data

To simulate decentralization on a local filesystem, the following files are used:

- `data/mesh_registry.json`: List of nodes discovered in the mesh.
- `data/intentions.json`: Log of intentions (messages) sent by all simulated nodes.

## Simulation: Two Nodes

To simulate two different nodes on the same machine, use the `SOVEREIGN_ID` environment variable.

### Node A (Primary)

```bash
node bin/sovereign.js status
```

### Node B (Simulator)

```bash
SOVEREIGN_ID=simulator-node node bin/sovereign.js status
```

When running `peers` from Node B, it will see Node A as a separate entity in the mesh.

## Mobile & Tablet usage

Since this is a standard Node.js application:

1. **Android**: Use [Termux](https://termux.dev/) to install Node.js and run the CLI directly.
2. **iOS**: Use [iSH](https://ish.app/) or similar terminal emulators.
3. **Web Mockup**: For tablets, use the responsive web mockup:
   `http-server web/mockups` and open the IP in your tablet's browser.
