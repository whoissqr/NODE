var expect = chai.expect;

var search = {  
  count: 0,
  status: '',

  lotid_search: function(target, cb) {
    var self = this;
    var params = {};
    params['type'] = 'lotid';
    params['value'] = '4751770';
    jQuery.support.cors = true;  //magic line to allow CORS
    $.ajax({
      url: 'http://localhost:3000/universalQuery',
      dataType: 'json',
      data: {jsonParams:JSON.stringify(params)},
      success: function(reply) {
        self.count = parseInt(reply['aaData'].length);
        self.status = 'success';
        cb(null, self.count);
      }
    });
  },

  handlerid_search: function(target, cb) {
    var self = this;
    var today = new Date(2015, 2, 26);  //March 26, //month is zero based
    var startDate = new Date(today -  1000 * 60 * 60 * 24 * 7); //Date is in millisecs;
    var endDate = today;

    startDate = new Date(startDate - startDate.getTimezoneOffset()*1000 * 60);
    endDate = new Date(endDate - endDate.getTimezoneOffset()*1000 * 60);

    var params = {};
    params['type'] = 'handlerid';
    params['value'] = 'NS7KW-008';
    params['startDate'] = startDate;
    params['endDate'] = endDate;    
    jQuery.support.cors = true;  //magic line to allow CORS
    $.ajax({
      url: 'http://localhost:3000/universalQuery',
      dataType: 'json',
      data: {jsonParams:JSON.stringify(params)},
      success: function(reply) {
        self.count = parseInt(reply['aaData'].length);
        self.status = 'success';
        cb(null, self.count);
      }
    });
  },

  teserid_search: function(target, cb) {
    var self = this;
    var today = new Date(2015, 2, 26);  //March 26, //month is zero based
    var startDate = new Date(today -  1000 * 60 * 60 * 24 * 7); //Date is in millisecs;
    var endDate = today;

    startDate = new Date(startDate - startDate.getTimezoneOffset()*1000 * 60);
    endDate = new Date(endDate - endDate.getTimezoneOffset()*1000 * 60);

    var params = {};
    params['type'] = 'testerid';
    params['value'] = 'KYECF93K06';
    params['startDate'] = startDate;
    params['endDate'] = endDate;
    jQuery.support.cors = true;  //magic line to allow CORS
    $.ajax({
      url: 'http://localhost:3000/universalQuery',
      dataType: 'json',
      data: {jsonParams:JSON.stringify(params)},
      success: function(reply) {
        self.count = parseInt(reply['aaData'].length);
        self.status = 'success';
        cb(null, self.count);
      }
    });
  }

};


describe('#universalQuery AJAX unit test', function() {
  beforeEach(function() {
    sinon.spy($, 'ajax');
  });

  afterEach(function() { 
    $.ajax.restore();
  })

  it('should reply an ajax call with lotid', function(done) {
    search.lotid_search('', function(err, count){ 
        expect(count).to.equal(5);
        done();
    });
  });

  it('should reply an ajax call with handlerid', function(done) {
    search.teserid_search('', function(err, count){ 
        expect(count).to.equal(31);
        done();
    });
  });

  it('should reply an ajax call with testerid', function(done) {
    search.handlerid_search('', function(err, count){ 
        expect(count).to.equal(31);
        done();
    });
  });
});
