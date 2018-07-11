App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  ContractAddress: "0x0",
  Election: null,
  loading: false, 
  network: 'http://ropsten.etherscan.io/address/',

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Election.json', function(election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      App.contracts.Election.deployed().then(function(election){
        App.Election = election;
        App.ContractAddress = election.address;
        console.log("Адрес контракта: " + App.ContractAddress);
      });
      App.listenForEvents();
      return App.initAll();
    });
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event Voted", event)
        App.initAll();
      });
    });
  },

  initAll: function() {
    if (App.loading){
      return;
    }
    App.loading = true;
    var loader =  $('#loader');
    var content = $('#content');
    loader.show();
    content.hide();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      App.account = accounts[0];
      $("#accountAddress").html(App.account);
      $('#accountAddress').attr("href", App.network + App.account);
    });

    App.contracts.Election.deployed().then(function(instance) {
      App.Election = instance;
      return App.Election.candidatesCount();
    }).then(function(candidatesCount) {

      $("#contractAddress").html(App.ContractAddress);
      $('#contractAddress').attr("href", App.network + App.ContractAddress);
      
      var candidatesResult = $("#candidatesResults");
      candidatesResult.empty();

      var candidateSelect = $("#candidatesSelect");
      candidateSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        App.Election.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
          candidatesResult.append(candidateTemplate);

          var candidateOption = "<option value='" + id + "'>" + name + "</option>";
          candidateSelect.append(candidateOption);
        });
      }
      return App.Election.voters(App.account);
    }).then(function(hasVoted) {
      if (hasVoted){
        $('form').hide();
      }
      
      loader.hide();
      content.show();
      App.loading = false;
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.Election.vote(candidateId, { from: App.account }).then(function(result) {
      console.log("Ваш голос учитывается");
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};


$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});