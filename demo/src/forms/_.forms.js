import ajv from 'ajv';
import validatorjs from 'validatorjs';
import Form from './_.extend';

// forms
import registerSimple from './registerSimple';
import registerMaterial from './registerMaterial';
import companySimple from './companySimple';
import companyWidgets from './companyWidgets';

// plugins extensions
import svkExtend from '../../../tests/data/_.extend.svk';
import dvrExtend from '../../../tests/data/_.extend.dvr';

const plugins = {
  dvr: {
    package: validatorjs,
    extend: dvrExtend,
  },
  svk: {
    package: ajv,
    extend: svkExtend,
  },
};

class RegisterSimpleForm extends Form {}
class RegisterMaterialForm extends Form {}
class CompanySimpleForm extends Form {}
class CompanyWidgetsForm extends Form {}

export default {
  registerSimple: new RegisterSimpleForm({
    plugins,
    fields: registerSimple.fields,
    schema: registerSimple.schema,
  }),
  registerMaterial: new RegisterMaterialForm({
    plugins,
    fields: registerMaterial.fields,
    schema: registerMaterial.schema,
  }),
  companySimple: new CompanySimpleForm({
    plugins,
    fields: companySimple.fields,
    schema: companySimple.schema,
    options: { allowRequired: true },
  }),
  companyWidgets: new CompanyWidgetsForm({
    plugins,
    fields: companyWidgets.fields,
    schema: companyWidgets.schema,
  }),
};
