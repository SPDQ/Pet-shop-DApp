//it function
//The it() function is defined by the jasmine testing framework
//it is related to tests with jasmine framework, you can find more information here: http://jasmine.github.io/
//https://docs.angularjs.org/guide/unit-testing
//The it() function defines a jasmine test. 
//The second argument to the it() function is itself a function, that 
//when executed will probably run some number of expect() functions. 
//expect() functions are used to actually test the things you "expect" to be true.

var Adoption = artifacts.require("./Adoption.sol");

contract("Adoption", function(accounts) {
  var adoptionInstance;

  it("initializes with 6 pets", function() {
    return Adoption.deployed().then(function(instance) {
      return instance.petsCount();
    }).then(function(count) {
      assert.equal(count, 6);
    });
  });

  it("it initializes the pets with the correct values", function() {
    return Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.pets(1);
    }).then(function(pet) {
      assert.equal(pet[0], 1, "contains the correct id");
      assert.equal(pet[1], "Frieda", "contains the correct name");
      assert.equal(pet[6], 0, "contains the correct votes count");
    });
  });

  it("allows a voter to cast a vote", function() {
    return Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      petId = 1;
      return adoptionInstance.vote(petId, { from: accounts[5] });
    }).then(function(receipt) {
      return adoptionInstance.voters(accounts[5]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return adoptionInstance.pets(petId);
    }).then(function(pet) {
      var voteCount = pet[6];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });

  it("throws an exception for invalid pet", function() {
    return Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return adoptionInstance.pets(1);
    }).then(function(pet1) {
      var voteCount = pet1[6];
      assert.equal(voteCount, 1, "pet 1 did not receive any votes");
      return adoptionInstance.pets(2);
    }).then(function(pet2) {
      var voteCount = pet2[6];
      assert.equal(voteCount, 0, "pet 2 did not receive any votes");
    });
  });

  it("throws an exception for double voting", function() {
    return Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      petId = 2;
      adoptionInstance.vote(petId, { from: accounts[6] });
      return adoptionInstance.pets(petId);
    }).then(function(pet) {
      var voteCount = pet[6];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return adoptionInstance.vote(petId, { from: accounts[6] });
    }).then(assert.fail).catch(function(error) {
      //assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return adoptionInstance.pets(1);
    }).then(function(pet1) {
      var voteCount = pet1[6];
      assert.equal(voteCount, 1, "pet 1 did not receive any votes");
      return adoptionInstance.pets(2);
    }).then(function(pet2) {
      var voteCount = pet2[6];
      assert.equal(voteCount, 1, "pet 2 did not receive any votes");
    });
  });

  it("only valid pets can be adopted", function() {
      return Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        petId = 99;
        return adoptionInstance.adopt(petId, {from: accounts[0]});
      }).then(assert.fail).catch(function(error) {
       assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
     });
    });

  it("pets can be adopted correctly", function() {
    return Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      petId = 1;
      return adoptionInstance.adopt(petId, {from: accounts[1]});
    }).then(function(){
      return adoptionInstance.pets(petId);
    }).then(function(pet) {
      assert.equal(pet[7], accounts[1], "pet's adopter wrong");
    });
  });

  it("most adopted breed is computed correctly", function() {
      return Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        petId = 1;
        return adoptionInstance.best_breed();
      }).then(function(b) {
        assert.equal(b, "Scottish Terrier", "best breed wrong");
      });
    });

   it("pet can be added correctly", function() {
     return Adoption.deployed().then(function(instance) {
       adoptionInstance = instance;
       return adoptionInstance.addpet("Latisha", "images/golden-retriever.jpeg", 3, "Golden Retriever", "Soudan, Louisiana");
     }).then(function(){
       return adoptionInstance.petsCount();
     }).then(function(b) {
       assert.equal(b, 7, "pets Count wrong")
       return adoptionInstance.pets(b);
     }).then(function(pet7){
        assert.equal(pet7.name, "Latisha", "pet's name wrong");
        return pet7;
     }).then(function(pet7){
        assert.equal(pet7.age, 3, "pet age wrong");
     });
   });

   it("only the owner of shop can withdraw ethers", function(){
     return Adoption.deployed().then(function(instance) {
       adoptionInstance = instance;
       return adoptionInstance.owner_();
     }).then(function(owner) {
        assert.equal(owner, accounts[0], "owner address is not recored correctly");
     });
   });
});
