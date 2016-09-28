import Form from '../../src';

const fields = {
  state: {
    label: 'State',
    value: 'USA',
    fields: {
      city: {
        label: 'City',
        value: 'New York',
        fields: {
          places: {
            label: 'NY Places',
            fields: {
              centralPark: {
                label: 'Central Park',
                value: true,
              },
              statueOfLiberty: {
                label: 'Statue of Liberty',
                value: false,
              },
              empireStateBuilding: {
                label: 'Empire State Building',
                value: true,
              },
            },
          },
        },
      },
    },
  },
};

export default new Form({ fields }, 'Nested-A');
