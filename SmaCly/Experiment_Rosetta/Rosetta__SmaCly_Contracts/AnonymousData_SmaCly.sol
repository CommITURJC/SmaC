   pragma solidity >=0.7.0;
  contract AnonymousData {
    mapping(bytes32 => bytes) internal storedData ;
    function getID(uint nonce) public view returns (bytes32 id) {
      return keccak256(abi.encode(msg.sender, nonce));
    }
    function storeData(bytes memory data, bytes32 id) public  {
      storedData[id] = data;
    }
    function getMyData(uint nonce) public view returns (bytes memory) {
      bytes32 id =   keccak256(abi.encode(msg.sender, nonce));
      return storedData[id];
    }
  }
