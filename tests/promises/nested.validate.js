import { expect } from 'chai';

export default ($) => {
  describe('Form validate()', () => {
    // $R
    it('$R validate() should be true', (done) => {
      $.$R.validate().then((isValid) => {
        expect(isValid).to.be.true; // eslint-disable-line
        done();
      });
    });

    // $S
    it('$S validate() should be false', (done) => {
      $.$S.validate().then((isValid) => {
        expect(isValid).to.be.false; // eslint-disable-line
        done();
      });
    });
  });
};
