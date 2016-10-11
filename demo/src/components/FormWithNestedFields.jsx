import React from 'react';
import { observer } from 'mobx-react';
import DebugForm from './Debug';

const HobbiesFields = observer(({ form, field }) => (
  <fieldset>
    <div className="clearfix">
      <div className="left">Hobbies</div>
      <div className="right">
        <button type="button" onClick={e => field.onAdd(e, 'hobbies')}>
          <i className="fa fa-plus-circle" data-tip="Add Hobby" />
        </button>
      </div>
    </div>
    <hr />
    {field.map('hobbies', hobby =>
      <div key={hobby.key}>
        <span key={hobby.name}>
          <div>
            <i>{hobby.error}</i>
          </div>
          <input
            type="text"
            placeholder="hobby"
            name={hobby.name}
            value={hobby.value}
            onChange={hobby.sync}
          />
        </span>
        <span>
          <button type="button" onClick={e => form.onDel(e, hobby.path)}>
            <i className="fa fa-times-circle" data-tip="Remove" />
          </button>
          <button type="button" onClick={hobby.onClear}>
            <i className="fa fa-eraser" data-tip="Clear" />
          </button>
          <button type="button" onClick={hobby.onReset}>
            <i className="fa fa-refresh" data-tip="Reset" />
          </button>
        </span>
      </div>
    )}
  </fieldset>
));

const MembersFields = observer(({ form }) => (
  <div>
    <div className="clearfix">
      <div className="left">
        <b>{form.$('members').label}</b>
      </div>
      <div className="right">
        <button type="button" onClick={form.$('members').onClear}>
          <i className="fa fa-eraser" data-tip="Clear All Members" />
        </button>
        <button type="button" onClick={form.$('members').onReset}>
          <i className="fa fa-refresh" data-tip="Reset All Members" />
        </button>
      </div>
    </div>
    <hr />
    {form.map('members', field =>
      <fieldset key={field.key} className="center">
        <div key={field.$('firstname').name}>
          <div>
            <b>{field.$('firstname').label}</b>
            <i>{field.$('firstname').error}</i>
          </div>
          <input
            type="text"
            name={field.$('firstname').name}
            value={field.$('firstname').value}
            placeholder={field.$('firstname').label}
            onChange={field.$('firstname').sync}
          />
        </div>
        <div key={field.$('lastname').name}>
          <div>
            <b>{field.$('lastname').label}</b>
            <i>{field.$('lastname').error}</i>
          </div>
          <input
            type="text"
            name={field.$('lastname').name}
            value={field.$('lastname').value}
            placeholder={field.$('lastname').label}
            onChange={field.$('lastname').sync}
          />
        </div>
        <br />
        <span>
          <button type="button" onClick={e => form.$('members').onDel(e, field.key)}>
            <i className="fa fa-times-circle" data-tip="Remove Member" />
          </button>
          <button type="button" onClick={field.onClear}>
            <i className="fa fa-eraser" data-tip="Clear Member" />
          </button>
          <button type="button" onClick={field.onReset}>
            <i className="fa fa-refresh" data-tip="Reset Member" />
          </button>
        </span>

        <br />
        <br />

        <HobbiesFields form={form} field={field} />

      </fieldset>
    )}
  </div>
));

const FormWithNestedFields = observer(({ form }) => (
  <div className="container normal">
    <form>
      <h2>Nested Fields</h2>

      <fieldset className="center">
        <div>
          <b>{form.$('club.name').label}</b>
          <i>{form.$('club.name').error}</i>
        </div>
        <input
          type="text"
          name={form.$('club.name').name}
          value={form.$('club.name').value}
          placeholder={form.$('club.name').label}
          onChange={form.$('club.name').sync}
        />

        <div>
          <b>{form.$('club.city').label}</b>
          <i>{form.$('club.city').error}</i>
        </div>
        <input
          type="text"
          name={form.$('club.city').name}
          value={form.$('club.city').value}
          placeholder={form.$('club.city').label}
          onChange={form.$('club.city').sync}
        />

        <br />
        <br />
        <div>
          <button type="button" onClick={form.$('club').onClear}>
            <i className="fa fa-eraser" data-tip="Clear Club" />
          </button>
          <button type="button" onClick={form.$('club').onReset}>
            <i className="fa fa-refresh" data-tip="Reset Club" />
          </button>
        </div>
      </fieldset>

      <br />
      <br />

      {<MembersFields form={form} />}

      <br />
      <div className="ctrl">
        <button type="submit" onClick={form.onSubmit}>
          <i className="fa fa-dot-circle-o" /> Submit
        </button>
        <button type="button" onClick={form.onClear}>
          <i className="fa fa-eraser" /> Clear All
        </button>
        <button type="button" onClick={form.onReset}>
          <i className="fa fa-refresh" /> Reset All
        </button>
      </div>

      <p><i>{form.error}</i></p>

    </form>

    <div className="mobx-react-form-devtools">
      <DebugForm form={form} />
    </div>
  </div>
));

MembersFields.propTypes = {
  form: React.PropTypes.object,
};

FormWithNestedFields.propTypes = {
  form: React.PropTypes.object,
};

export default FormWithNestedFields;
