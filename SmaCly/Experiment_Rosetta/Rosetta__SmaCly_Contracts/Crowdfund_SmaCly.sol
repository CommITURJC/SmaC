 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.2;
  contract Crowdfund {
    uint internal end_donate ;
    uint internal goal ;
    address internal receiver ;
    mapping(address => uint) public donors ;
    constructor(address receiver_, uint end_donate_, uint256 goal_) {
      receiver = receiver_;
      end_donate = end_donate_;
      goal = goal_;
    }
    function donate() public payable {
      require(  block.number <= end_donate);
      donors[msg.sender] += msg.value;
    }
    function withdraw() public  {
      require(  block.number >= end_donate);
      require(  address(this).balance >= goal);
      (bool succ, ) = receiver.call{value: address(this).balance}("");
      require(  succ);
    }
    function reclaim() public  {
      require(  block.number >= end_donate);
      require(  address(this).balance < goal);
      require(  donors[msg.sender] > 0);
      uint amount =   donors[msg.sender];
      donors[msg.sender] = 0;
      (bool succ, ) = msg.sender.call{value: amount}("");
      require(  succ);
    }
  }
