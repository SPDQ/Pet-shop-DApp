App = {

  web3Provider: null,
  contracts: {},
  user_ac: '0x0',
  owner: '0x0',

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
          App.web3Provider = window.ethereum;
          var arr = null;
          arr = await window.ethereum.enable(); //arr is the array of accounts, arr[0] the first account
          if(arr!==null){web3 = new Web3(App.web3Provider)} else{console.log("metamask user did not enable the accounts")};
          web3.eth.defaultAccount = web3.eth.accounts[0];
          return App.initContract();
        }
        else {
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          web3 = new Web3(App.web3Provider);
          web3.eth.defaultAccount = web3.eth.accounts[0];
          return App.initContract();
        }
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.render();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('submit', '.form-login', App.handleAddPet);
    $(document).on('submit', '.form-inline', App.handleSearch);
  },


  render: function() {
    var AdoptionInstance;
    var hasVoted = false;

    var petsRow = $('#petsRow');
    var petTemplate = $('#petTemplate');
    petsRow.empty();

    // Load account data
     web3.eth.getAccounts(function (err, accounts) {
      if (err == null) {
        App.user_ac = accounts[0];
      }
    });

    // Load pets.
    if (!document.URL.includes("addpet.html")) {
        //Code here
        //console.log(false)

        var s_type = document.getElementById("stype").value;
        var s_value = document.getElementById("svalue").value;
        var best_b = "";


        App.contracts.Adoption.deployed().then(function(instance) {
          AdoptionInstance = instance;
          return AdoptionInstance.owner_();
          }).then(function(owner_){
          App.owner = owner_;
          if(App.owner==App.user_ac){
            //console.log(App.user_ac);
            document.getElementById("dw").innerHTML = "Withdraw";
          }
          return AdoptionInstance.voters(App.user_ac);
          }).then(function(isVoted){
          hasVoted = isVoted;
          return AdoptionInstance.best_breed();
          }).then(function(best_breed){
           best_b = best_breed;
           //console.log(best_breed)
           return AdoptionInstance.petsCount();
           }).then(function(petsCount){
            var petsArray = [];
            //console.log(petsCount);
            for (var i = 1; i <= petsCount; i++) {
              petsArray.push(AdoptionInstance.pets(i));
            }
            Promise.all(petsArray).then(function(values) {
               for (i = 0; i < petsCount; i ++) {
                  //console.log(values[i][3])
                  if(s_value=="" || (s_type=="breed" && values[i][4]==s_value) || (s_type=="age" && values[i][3] == s_value) ||
                  (s_type=="location" && values[i][5] == s_value)){
                    petTemplate.find('.panel-title').text(values[i][1]);
                    petTemplate.find('img').attr('src', values[i][2]);
                    console.log(values[i][2])
                    if (values[i][4]==best_b){
                        petTemplate.find('.pet-best').text("(Best Seller)");
                    }
                    else{
                        petTemplate.find('.pet-best').text("");
                    }
                    //petTemplate.find('.pet-best').text(values[i][4]);
                    petTemplate.find('.pet-breed').text(values[i][4]);
                    petTemplate.find('.pet-age').text(values[i][3]);
                    petTemplate.find('.pet-location').text(values[i][5]);
                    petTemplate.find('.pet-votes').text(values[i][6])
                    petTemplate.find('.btn-adopt').attr('data-id', values[i][0]);
                    petTemplate.find('.btn-vote').attr('data-id', values[i][0]);

                    if (values[i][7] !== '0x0000000000000000000000000000000000000000'){
                          //console.log(values[i][1]);
                          petTemplate.find('#0').text('Adopted').attr('disabled', true);
                    } else{
                          //console.log(values[i][1]);
                          petTemplate.find('#0').text('Adopt').attr('disabled', false);
                    }
                    if (hasVoted){
                          petTemplate.find('#1').text('Voted').attr('disabled', true);
                    }else{
                          petTemplate.find('#1').text('Vote').attr('disabled', false);
                    }
                    petsRow.append(petTemplate.html());
                  }

                }
            })
          }).catch(function(error) {
              console.warn(error);
          })
     }
    else{
        App.contracts.Adoption.deployed().then(function(instance) {
          AdoptionInstance = instance;
          return AdoptionInstance.owner_();
          }).then(function(owner_){
          App.owner = owner_;
          if(App.owner==App.user_ac){
            //console.log(App.user_ac);
            document.getElementById("dw").innerHTML = "Withdraw";
          }
          return AdoptionInstance.voters(App.user_ac);
          }).catch(function(error) {
              console.warn(error);
          })
    }
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    //console.log(petId);

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.render();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleVote: function(event) {
      event.preventDefault();

      var petId = parseInt($(event.target).data('id'));

      var adoptionInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        App.contracts.Adoption.deployed().then(function(instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.vote(petId, {from: account});
        }).then(function(result) {
          return App.render();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

  handleAddPet: async function (event) {
    event.preventDefault();

    var x = document.getElementById("addpet");
    App.contracts.Adoption.deployed().then(function (instance) {
        return instance.addpet(x.elements[0].value, x.elements[1].value, parseInt(x.elements[2].value), x.elements[3].value, x.elements[4].value);
        }).then(function (res){
        alert("New pet is added successfully!")
        }).then(function (res){
            window.location.replace("http://localhost:3000/");
        }).catch(function(err) {
         console.log(err.message);
        });
  },

  handleDonate: function () {
    if(App.owner==App.user_ac){
        console.log(App.contracts.Adoption.address)
        var x;
        var amount = prompt("Please enter the amount you want to withdraw (in ether): ", 0.0001);
        if (amount != null) {
          x = "You will withdraw " + amount + "ether from David's Pet Shop. Comfirmed?";
          if (confirm(x)) {
              App.contracts.Adoption.deployed().then(function(instance) {
                  return instance.withdraw(web3.toWei(amount, "ether"), {from: App.user_ac});
               }).catch(function(error) {
                   console.warn(error);
               })
          }
        }
        else
          alert("donate cancelled!");
    }else{
        var x;
        var amount = prompt("Please enter the amount you want to donate (in ether): ", 0.0001);
        if (amount != null) {
          x = "You will donate " + amount + "ether to David's Pet Shop. Comfirmed?";
          if (confirm(x)) {
              web3.eth.sendTransaction({ from: App.user_ac, to: App.contracts.Adoption.address, value: web3.toWei(amount, "ether"), gasPrice: web3.toWei(5, 'gwei') }, function (err, transactionHash) {
                if (!err) //if TX submitted, the following function increments the donation counter artificially to give the user instant feedback – despite the fact that the TX may still fail.
                  //Please consider carefully whether or not to implement this feature.
                  alert("Transaction succeed. Thanks for your donation.");
                else
                  alert("donation failed. ");
              });
          }
        }
        else
          alert("donate cancelled!");
        }
    },

  handleHome: function () {
    window.location.replace("http://localhost:3000/");
  },

  handleAdd: function () {
    window.location.replace("http://localhost:3000/addpet.html");
  },

  handleSearch: async function (event) {
    event.preventDefault();
    return App.render();
  },
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
