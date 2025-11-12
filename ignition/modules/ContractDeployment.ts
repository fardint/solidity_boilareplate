import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC1967Proxy = "ERC1967Proxy"; // Assumes @openzeppelin/contracts is installed

export default buildModule("ContractDeployment", (m) => {
  // Parameters for initialization (can be overridden via CLI flags during deployment)
  const defaultAdmin = m.getParameter("defaultAdmin", m.getAccount(0));
  const pauser = m.getParameter("pauser", m.getAccount(0));
  const upgrader = m.getParameter("upgrader", m.getAccount(0));

  // Deploy the implementation contract with unique ID
  const implementation = m.contract("Contract", [], { id: "ContractImplementation" });

  // Encode the initializer call
  const initializeData = m.encodeFunctionCall(implementation, "initialize", [defaultAdmin, pauser, upgrader]);

  // Deploy the UUPS proxy with unique ID (points to implementation and calls initializer)
  const proxy = m.contract(ERC1967Proxy, [implementation, initializeData], { id: "ContractProxy" });

  // Attach the contract ABI to the proxy address for interaction with unique ID
  const deployedContract = m.contractAt("Contract", proxy, { id: "ContractInstance" });

  return { deployedContract, proxy, implementation };
});