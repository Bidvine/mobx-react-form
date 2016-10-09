import React from 'react';
import { observer } from 'mobx-react';
import DebugForm from './Debug';

const FormRegister = ({ form }) => (
  <div className="container">
    <div className="splitted-35 fixed container-left normal">
      <form>
        <h2>Form Register</h2>

        <div>
          <b>{form.$('username').label}</b>
          <i>{form.$('username').error}</i>
        </div>
        <input
          type="text"
          name={form.$('username').name}
          value={form.$('username').value}
          placeholder={form.$('username').label}
          onChange={form.$('username').sync}
        />

        <div>
          <b>{form.$('email').label}</b>
          <i>{form.$('email').error}</i>
        </div>
        <input
          type="text"
          name={form.$('email').name}
          value={form.$('email').value}
          placeholder={form.$('email').label}
          onChange={form.$('email').sync}
        />

        <div>
          <b>{form.$('emailConfirm').label}</b>
          <i>{form.$('emailConfirm').error}</i>
        </div>
        <input
          type="text"
          name={form.$('emailConfirm').name}
          value={form.$('emailConfirm').value}
          placeholder={form.$('emailConfirm').label}
          onChange={form.$('emailConfirm').sync}
        />

        <div>
          <b>{form.$('password').label}</b>
          <i>{form.$('password').error}</i>
        </div>
        <input
          type="password"
          name={form.$('password').name}
          value={form.$('password').value}
          placeholder={form.$('password').label}
          onChange={form.$('password').sync}
        />

        <div>
          <b>{form.$('devSkills').label}</b>
          <i>{form.$('devSkills').error}</i>
        </div>
        <input
          type="string"
          name={form.$('devSkills').name}
          value={form.$('devSkills').value}
          placeholder={form.$('devSkills').label}
          onChange={form.$('devSkills').sync}
        />

        <br />
        <br />
        <input
          type="checkbox"
          name={form.$('terms').name}
          checked={form.$('terms').value}
          onChange={form.$('terms').sync}
        /> {form.$('terms').label}
        <div>
          <i>{form.$('terms').error}</i>
        </div>

        <br />
        <br />
        <div className="ctrl">
          <button onClick={form.onSubmit} type="submit">Submit</button>
          <button onClick={form.onClear}>Clear</button>
          <button onClick={form.onReset}>Reset</button>
        </div>

        <p><i>{form.error}</i></p>

      </form>
    </div>
    <div className="splitted-65 container-right">
      <DebugForm form={form} />
    </div>
  </div>
);

FormRegister.propTypes = {
  form: React.PropTypes.object,
};

export default observer(FormRegister);
