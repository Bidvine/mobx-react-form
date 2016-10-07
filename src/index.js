import { useStrict } from 'mobx';
import './mixins';
import Form from './Form';

/**
  Enables MobX strict mode globally.
  In strict mode, it is not allowed to
  change any state outside of an action
 */
useStrict(true);

export default Form;
