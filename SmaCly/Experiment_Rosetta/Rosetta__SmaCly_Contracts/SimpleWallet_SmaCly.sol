 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.0;
  contract Simple_wallet {
    struct Transaction{
      address  to ;
      uint  value ;
      bytes  data ;
      bool  executed ;
    }
    Transaction []  transactions ;
    address  owner ;
    constructor(address _owner) {
      require(_owner !=   address(0), "Invalid address.");
      owner = _owner;
    }
    modifier onlyOwner(){
      require(msg.sender ==   owner, "Only the owner");
      _;
    }
    function deposit() public payable {
    }
    function createTransaction(address _to, uint _value, bytes memory _data) public  onlyOwner {
      uint txId =   transactions.length;
      transactions.push(Transaction(_to, _value, _data, false));
    }
    function executeTransaction(uint _txId) public  onlyOwner {
      require(_txId < transactions.length, "Transaction does not exist.");
      require(!transactions[_txId].executed, "Transaction already executed.");
      Transaction memory transaction =   transactions[_txId];
      require(transaction.value < address(this).balance, "Insufficient funds.");
      transaction.executed = true;
      (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
      require(success, "Transfer failed.");
    }
    function withdraw() public  onlyOwner {
      uint withdraw_value =   address(this).balance;
      (bool success, ) = owner.call{value: withdraw_value}("");
      require(success, "Transfer failed.");
    }
  }
