pragma solidity ^0.5.0;

contract Adoption {
//  address[16] public adopters
  struct Pet{
    uint id;
    string name;
    string picture;
    uint age;
    string breed;
    string location;
    uint votes;
    address adopter;
  }

  address public owner_;
  uint public petsCount;
  mapping(uint => Pet) public pets;
  mapping(string => uint) public brebuy;
  mapping(address => bool) public voters;
  string public best_breed;

  constructor() public {
    owner_ = msg.sender;
    addpet("Frieda", "images/scottish-terrier.jpeg", 3, "Scottish Terrier", "Lisco, Alabama");
    addpet("Gina", "images/Chinook.jpg", 3, "Chinook", "Shanghai, China");
    addpet("Jack", "images/Chinook.jpg", 2, "Chinook", "Toronto, Canada");
    addpet("Collins", "images/french-bulldog.jpeg", 2, "French Bulldog", "Freeburn, Idaho");
    addpet("Melissa", "images/boxer.jpeg", 2, "Boxer", "Camas, Pennsylvania");
    addpet("Latisha", "images/golden-retriever.jpeg", 3, "Golden Retriever", "Soudan, Louisiana");
  }

  // voted event
//  event votedEvent (
//    uint indexed _petId
//  );

  //add a pet
  function addpet(string memory _name, string memory _pict, uint _age, string memory _bre, string memory _loc) public{
    petsCount++;
    pets[petsCount] = Pet(petsCount, _name, _pict, _age, _bre, _loc, 0, address(0));
  }

  //adopt a pet
  function adopt(uint petId) public returns (uint) {
    require(petId > 0 && petId <= petsCount);
    Pet storage p = pets[petId];
    p.adopter = msg.sender;
    brebuy[p.breed]++;

    uint max = 0;
    for(uint i=1; i<=petsCount; i++){
      if (brebuy[pets[i].breed]>max){
        max = brebuy[pets[i].breed];
        best_breed = pets[i].breed;
      }
    }
    return petId;
  }

  function vote (uint petId) public returns (uint) {
    // require that they haven't voted before
    require(!voters[msg.sender]);

    // require a valid candidate
    require(petId > 0 && petId <= petsCount);

    // record that voter has voted
    voters[msg.sender] = true;

    // update candidate vote Count
    pets[petId].votes ++;

    return petId;
  }

  //withdraw
  function withdraw(uint withdraw_amount) public {
    require(msg.sender == owner_);
    msg.sender.transfer(withdraw_amount);
  }

  //donate
  function() external payable {}

}
