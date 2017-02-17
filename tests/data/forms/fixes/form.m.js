import validatorjs from 'validatorjs';
import { Form } from '../../../../src';

const fields = [
  'jobs',
  'jobs[].jobId',
  'jobs[].companyName',
  'people[].name',
  'array[].name',
];

const values = {
  jobs: [],
  people: [{
    name: 'bob',
  }],
  array: [{
    name: 'bob',
  }],
};

const rules = {
  'jobs[].companyName': 'required|string|between:3,75',
};

const plugins = {
  dvr: validatorjs,
};

class NewForm extends Form {

  onInit() {
    this.$('people').set([
      { name: null },
    ]);

    this.update({
      array: [
        { name: null },
        { name: null },
        { name: null },
      ],
    });
  }
}

export default new NewForm({ fields, values, rules }, { plugins, name: 'Fixes-M' });
