# Enterprise Solidity Boilerplate - Developer Guide

## Overview

This boilerplate provides a production-ready foundation for building enterprise-grade upgradeable smart contracts using Hardhat 3 and OpenZeppelin libraries.

## 🚀 Quick Start

### 1. Project Setup

```bash
# Install dependencies
npm install

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat ignition deploy ignition/modules/ContractDeployment.ts
```

### 2. Environment Configuration

Create a `.env` file for production deployments:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

Set configuration variables:

```bash
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

## 🏗️ Project Structure

```text
├── contracts/                 # Smart contracts
│   └── Contract.sol          # Main upgradeable contract
├── ignition/modules/         # Deployment modules
│   ├── ContractDeployment.ts # Initial deployment
│   └── ContractUpgrade.ts    # Upgrade management
├── scripts/                  # Network-specific scripts
├── test/                     # Test files
└── hardhat.config.ts         # Project configuration
```

## 📝 Contract Development

### Creating New Upgradeable Contracts

1. **Create new contract file:**

```solidity
// contracts/MyContract.sol
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address admin) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MY_ROLE, admin);
    }
    
    function myFunction() public onlyRole(MY_ROLE) {
        // Your contract logic here
    }
    
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
```

2.**Create deployment module:**

```typescript
// ignition/modules/MyContractDeployment.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyContractDeployment", (m) => {
    const admin = m.getParameter("admin", m.getAccount(0));
    const implementation = m.contract("MyContract");
    
    const initializeData = m.encodeFunctionCall(implementation, "initialize", [admin]);
    const proxy = m.contract("ERC1967Proxy", [implementation, initializeData]);
    
    const deployedContract = m.contractAt("MyContract", proxy);
    
    return { deployedContract };
});
```

### Key Patterns

#### Access Control

```solidity
// Check roles in functions
function sensitiveFunction() public onlyRole(MY_ROLE) {
    // Function logic
}

// Grant roles after deployment
await contract.write.grantRole([MY_ROLE, targetAddress]);
```

#### Emergency Controls

```solidity
// Pause contract in emergencies
await contract.write.pause();

// Resume operations
await contract.write.unpause();
```

#### Upgrade Process

1. Deploy new implementation
2. Call `upgradeTo()` with UPGRADER_ROLE
3. Verify upgrade succeeded

## 🚀 Deployment Guide

### Local Development

```bash
# Deploy to Hardhat local network
npx hardhat ignition deploy ignition/modules/ContractDeployment.ts

# Specify custom parameters
npx hardhat ignition deploy ignition/modules/ContractDeployment.ts --parameters '{"defaultAdmin":"0x...","pauser":"0x...","upgrader":"0x..."}'
```

### Production Deployment (Sepolia)

```bash
# Deploy to Sepolia testnet
npx hardhat ignition deploy --network sepolia ignition/modules/ContractDeployment.ts

# Deploy upgrade
npx hardhat ignition deploy --network sepolia ignition/modules/ContractUpgrade.ts
```

### Network Configuration

The project supports multiple networks in `hardhat.config.ts`:

- `hardhatMainnet`: L1 simulation
- `hardhatOp`: OP chain simulation  
- `sepolia`: Ethereum testnet

## 🧪 Testing

### Running Tests

```bash
# All tests
npx hardhat test

# Specific test types
npx hardhat test solidity  # Foundry-style tests
npx hardhat test nodejs    # TypeScript tests
```

### Writing Tests

```typescript
// test/MyContract.ts
import { network } from "hardhat";

describe("MyContract", async function () {
  const { viem } = await network.connect();
  
  it("Should deploy and initialize correctly", async function () {
    const contract = await viem.deployContract("MyContract");
    
    // Test initialization
    const admin = await contract.read.DEFAULT_ADMIN_ROLE();
    expect(admin).to.equal(expectedAdminAddress);
  });
});
```

## 🔧 Configuration

### Hardhat Configuration (`hardhat.config.ts`)

#### Solidity Profiles

- `default`: Development with no optimization
- `production`: Optimized for deployment (200 runs)

#### NPM Files

Include OpenZeppelin proxy contracts in compilation:

```typescript
npmFilesToBuild: [
  "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol",
]
```

#### Network Settings

Configure RPC URLs and accounts via environment variables:

```typescript
sepolia: {
  url: configVariable("SEPOLIA_RPC_URL"),
  accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
}
```

### TypeScript Configuration (`tsconfig.json`)

- Target: ES2022
- Module: Node16
- Strict mode enabled
- ES2023 library features

## 🛡️ Security Best Practices

### Role Management

- **Default Admin**: Overall contract control
- **Pauser**: Emergency pause/unpause
- **Upgrader**: Contract upgrades only
- **Custom Roles**: Application-specific permissions

### Upgrade Safety

- Always test upgrades on testnet first
- Verify storage layout compatibility
- Use UUPS pattern for gas efficiency
- Implement proper access controls

### Emergency Procedures

1. **Pause Contract**: Immediately halt operations
2. **Deploy Fix**: Create patched implementation
3. **Upgrade**: Deploy fix via UPGRADER_ROLE
4. **Resume**: Unpause when safe

## 🔍 Common Operations

### Contract Interaction

```typescript
import { viem } from "hardhat";

// Get contract instance
const contract = await viem.getContractAt("MyContract", contractAddress);

// Read data
const value = await contract.read.myVariable();

// Write transactions
const txHash = await contract.write.myFunction([param1, param2]);

// Check events
const events = await publicClient.getContractEvents({
  address: contractAddress,
  abi: contract.abi,
  eventName: "MyEvent"
});
```

### Managing Roles

```typescript
// Check permissions
const hasRole = await contract.read.hasRole([role, address]);

// Grant roles (requires admin)
await contract.write.grantRole([role, targetAddress]);

// Revoke roles
await contract.write.revokeRole([role, targetAddress]);
```

## 📚 Key Dependencies

- **@openzeppelin/contracts-upgradeable**: Secure, audited upgradeable contracts
- **@nomicfoundation/hardhat-ignition**: Advanced deployment management
- **@nomicfoundation/hardhat-toolbox-viem**: Modern Web3 interactions
- **viem**: Type-safe Ethereum interactions

## 🚨 Important Notes

### Constructor Restrictions

Use `_disableInitializers()` in upgradeable contracts to prevent initialization attacks.

### Storage Layout

When upgrading:

1. Don't change existing storage variables
2. Add new variables at the end
3. Use storage gaps if needed

### Gas Optimization

- Use `production` Solidity profile for deployments
- Consider custom optimization settings
- Profile gas usage in tests

### Testing Strategy

- Test both deployment and upgrades
- Verify role-based access controls
- Test emergency procedures
- Validate event emissions

## 🤝 Contributing

When extending this boilerplate:

1. Maintain upgradeable patterns
2. Follow OpenZeppelin security practices
3. Include comprehensive tests
4. Document new features
5. Update this guide

---

**Need Help?** Check the OpenZeppelin documentation and Hardhat guides for detailed patterns and best practices.
