import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Import the deployment module to reuse its artifacts (adjust path as needed)
import ContractDeployment from "./ContractDeployment.js"; // Assuming this is in the same directory; adjust if separate file

export default buildModule("ContractUpgrade", (m) => {
  // Deploy the new implementation with unique ID (use "ContractV2" here if you have an updated version with changes; otherwise, reuse "Contract" for testing)
  const newImplementation = m.contract("ContractV2", [], { id: "ContractV2Implementation" }); // Replace with "Contract" if no V2 exists yet

  // Reuse the previous deployment to get the proxy/contract instance
  const { deployedContract } = m.useModule(ContractDeployment);

  // Call upgradeTo on the proxy (caller must have UPGRADER_ROLE)
  m.call(deployedContract, "upgradeTo", [newImplementation]);

  // Re-attach the contract ABI with unique ID (use "ContractV2" if ABI changed)
  const upgradedContract = m.contractAt("ContractV2", deployedContract, { id: "ContractV2Instance" });

  return { upgradedContract, newImplementation };
});