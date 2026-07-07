 // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.0;
  contract Vesting {
    uint256 private _released ;
    address private _beneficiary ;
    uint64 private _start ;
    uint64 private _duration ;
    constructor(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds) payable {
      require(beneficiaryAddress !=   address(0), "Beneficiary is zero address");
      _beneficiary = beneficiaryAddress;
      _start = startTimestamp;
      _duration = durationSeconds;
    }
    event EtherReleased(uint256 amount);
    function release() public  {
      uint256 amount =   releasable();
      _released += amount;
      (bool success, ) = payable(_beneficiary).call{value: amount}("");
      require(success, "Transfer failed.");
      emit EtherReleased(amount);
    }
    function releasable() public view returns (uint256) {
      return vestedAmount(uint64(block.timestamp)) - _released;
    }
    function vestedAmount(uint64 timestamp) public view returns (uint256) {
      return _vestingSchedule(address(this).balance + _released, timestamp);
    }
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view returns (uint256) {
      if(timestamp < _start){
        return 0;
      }
      else if(timestamp > _start + _duration){
        return totalAllocation;
      }
      else{
        return (totalAllocation * (timestamp - _start)) / _duration;
      }
    }
  }
