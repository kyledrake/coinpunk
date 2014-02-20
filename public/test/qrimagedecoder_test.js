describe('QrImageDecoder', function(){

  it('decodes qr codes in an image', function() {
    var expectedResult = "bitcoin:1Cq4Vup938uichJ1FaazDeFfmfUrMaGPKv?amount=0.00246734";
    new QrImageDecoder({
      src: qrImgSrc, // see public/test/qrsample.js
      success: function(result) {
        assert.equal(result, expectedResult);
      },
      error: function() {
        assert.equal("TEST", "FAILED");
      }
    });
  })

});

