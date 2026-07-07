 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.2;
  contract Vault {
    enum States {
    IDLE,
      REQ
    }
    address internal owner ;
    address internal recovery ;
    uint internal wait_time ;
    address internal receiver ;
    uint internal request_time ;
    uint internal amount ;
    States internal state ;
    constructor(address recovery_, uint wait_time_) payable {
      owner = msg.sender;
      recovery = recovery_;
      wait_time = wait_time_;
      state = States.IDLE;
    }
    receive() external payable {
    }
    function withdraw(address receiver_, uint amount_) public  {
      require(    state ==   States.IDLE);
      require(  amount_ <= address(this).balance);
      require(    msg.sender ==   owner);
      request_time = block.number;
      amount = amount_;
      receiver = receiver_;
      state = States.REQ;
    }
    function finalize() public  {
      require(    state ==   States.REQ);
      require(  block.number >= request_time + wait_time);
      require(    msg.sender ==   owner);
      state = States.IDLE;
      (bool succ, ) = receiver.call{value: amount}("");
      require(  succ);
    }
    function cancel() public  {
      require(    state ==   States.REQ);
      require(    msg.sender ==   recovery);
      state = States.IDLE;
    }
  }
