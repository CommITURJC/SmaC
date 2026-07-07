 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.2;
  contract Lottery {
    address public owner ;
    address internal player0 ;
    address internal player1 ;
    address internal winner ;
    bytes32 internal hash0 ;
    bytes32 internal hash1 ;
    string internal secret0 ;
    string internal secret1 ;
    uint256 internal bet_amount ;
    enum Status {
    Join0,
      Join1,
      Commit0,
      Commit1,
      Reveal0,
      Reveal1,
      Win,
      End
    }
    uint internal end_join ;
    uint internal end_reveal ;
    Status public status ;
    constructor() {
      owner = msg.sender;
      status = Status.Join0;
      end_join = block.number + 1000;
      end_reveal = end_join + 1000;
    }
    function join0(bytes32 h) public payable {
      require(  status ==   Status.Join0 && msg.value > 0.01 ether);
      player0 = payable(msg.sender);
      hash0 = h;
      status = Status.Join1;
      bet_amount = msg.value;
    }
    function join1(bytes32 h) public payable {
      require(  status ==   Status.Join1 && h !=   hash0 && msg.value ==   bet_amount);
      player1 = payable(msg.sender);
      hash1 = h;
      status = Status.Reveal0;
    }
    function redeem0_nojoin1() public  {
      require(  status ==   Status.Join1 && block.number > end_join);
      (bool success, ) = player0.call{value: address(this).balance}("");
      require(success, "Transfer failed.");
      status = Status.End;
    }
    function reveal0(string memory s) public  {
      require(  status ==   Status.Reveal0 && msg.sender ==   player0);
      require(    keccak256(abi.encodePacked(s)) ==   hash0);
      secret0 = s;
      status = Status.Reveal1;
    }
    function redeem1_noreveal0() public  {
      require(  status ==   Status.Reveal0 && block.number > end_reveal);
      (bool success, ) = player1.call{value: address(this).balance}("");
      require(success, "Transfer failed.");
      status = Status.End;
    }
    function reveal1(string memory s) public  {
      require(  status ==   Status.Reveal1 && msg.sender ==   player1);
      require(    keccak256(abi.encodePacked(s)) ==   hash1);
      secret1 = s;
      status = Status.Win;
    }
    function redeem0_noreveal1() public  {
      require(  status ==   Status.Reveal1 && block.number > end_reveal);
      (bool success, ) = player0.call{value: address(this).balance}("");
      require(success, "Transfer failed.");
      status = Status.End;
    }
    function win() public  {
      require(    status ==   Status.Win);
      uint256 l0 =   bytes(secret0).length;
      uint256 l1 =   bytes(secret1).length;
      if((l0 + l1) % 2 ==   0){
        winner = player0;
      }
      (bool success, ) = winner.call{value: address(this).balance}("");
      require(success, "Transfer failed.");
      status = Status.End;
    }
  }
