 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.0;
  contract Escrow {
    enum States {
    WAIT_DEPOSIT,
      WAIT_RECIPIENT,
      CLOSED
    }
    address internal buyer ;
    address internal seller ;
    uint256 internal amount ;
    States internal state ;
    constructor(uint256 _amount, address _buyer, address _seller) {
      require(_seller !=   address(0x0) && _buyer !=   address(0x0), "");
      require(msg.sender ==   _seller, "The creator must be the seller");
      amount = _amount;
      buyer = _buyer;
      seller = _seller;
      state = States.WAIT_DEPOSIT;
    }
    modifier onlyBuyer(){
      require(msg.sender ==   buyer, "Only the buyer");
      _;
    }
    modifier onlySeller(){
      require(msg.sender ==   seller, "Only the seller");
      _;
    }
    function deposit() public payable onlyBuyer {
      require(state ==   States.WAIT_DEPOSIT, "Invalid State");
      require(msg.value ==   amount, "Invalid amount");
      state = States.WAIT_RECIPIENT;
    }
    function pay() public  onlyBuyer {
      require(state ==   States.WAIT_RECIPIENT, "Invalid State");
      state = States.CLOSED;
      (bool success, ) = seller.call{value: amount}("");
      require(success, "Transfer failed.");
    }
    function refund() public  onlySeller {
      require(state ==   States.WAIT_RECIPIENT, "Invalid State");
      state = States.CLOSED;
      (bool success, ) = buyer.call{value: amount}("");
      require(success, "Transfer failed.");
    }
  }
