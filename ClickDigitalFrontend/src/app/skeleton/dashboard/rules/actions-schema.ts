export const ActionsFilterSchema: any = {
  children : [
    {
      id: 1,
      name: 'Entity Situation',
      icon: 'universal-access',
      children: [
        {
          name: 'All Devices',
          children: []
        },
        {
          name: 'Living',
          children: [
            {
              name: 'Temperature',
              condition_attribute: 'temperature',
              living: true,
              properties: [
                {
                  text: 'Then change temperature to (°C)',
                  type: 'checkbox',
                  type_options: 'slider',
                  min: 0,
                  max : 100
                }
              ],
              children: []
            }
          ]
        },
        {
          name: 'Non Living',
          children: [
            {
              name: 'Device',
              children: [
                {
                  name: 'Light',
                  living: false,
                  condition_attribute: 'state',
                  itemtype: 'Light',
                  properties: [
                    {
                      text: 'Then change brightness to(%)',
                      type: 'number',
                      type_options: 'slider',
                      min: 0,
                      max : 100
                    },
                    {
                      text: 'Then switch to',
                      type: 'text',
                      type_options: 'inputSwitch'
                    }
                  ],
                  children: []
                },
                {
                  name: 'Movement',
                  condition_attribute: 'state',
                  living: false,
                  itemtype: 'Movement',
                  properties: [
                    {
                      text: 'Then change movement detection',
                      type: 'text',
                      type_options: 'inputSwitch'
                    }
                  ],
                  children: []
                },
                {
                  name: 'Place',
                  living: false,
                  state: 'place',
                  condition_attribute: 'place',
                  properties: [
                    {
                      text: 'Then change device located',
                      type: 'text',
                      type_options: 'dropdown',
                      selects: [
                        {label: 'Apartment', value: 'Apartment'},
                        {label: 'City', value: 'City'}
                      ]
                    }
                  ],
                  children: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Communication',
      icon: 'wechat',
      children: [
        {
          name: 'E-Mail',
          condition_attribute: 'email',
          properties: [
            {
              text: 'Then send E-Mail to',
              type: 'text',
              type_options: 'input'
            }
          ],
          children: []
        },
        {
          name: 'Telephone number',
          condition_attribute: 'telephonenumber',
          properties: [
            {
              text: 'Then dial telephone number',
              type: 'number',
              type_options: 'input'
            }
          ],
          children: []
        }
      ]
    },
    {
      id: 3,
      name: 'Situation',
      icon: 'automobile',
      children: [
        {
          name: 'Activity',
          condition_attribute: 'activity',
          properties: [
            {
              text: 'Then activity is',
              type: 'text',
              type_options: 'input'
            }
          ],
          children: []
        },
        {
          name: 'Traffic Situation',
          condition_attribute: 'trafficsituation',
          properties: [
            {
              text: 'Then traffic situation is',
              type: 'text',
              type_options: 'dropdown',
              selects: [
                {label: 'Traffic High', value: 'high'},
                {label: 'Traffic Middle', value: 'middle'},
                {label: 'Traffic Low', value: 'low'}
              ]
            }
          ],
          children: []
        }
      ]
    },
    {
      id: 4,
      name: 'Service',
      icon: 'cloud',
      children: [
        {
          name: 'Physical Service',
          condition_attribute: 'servicetype',
          physical: true,
          properties: [
            {
              text: 'Then physical service is',
              type: 'text',
              type_options: 'dropdown',
              selects: [
                {label: 'Post', value: 'Post'},
                {label: 'Package', value: 'Package'}
              ]
            }
          ],
          children: []
        },
        {
          name: 'Non Physical service',
          condition_attribute: 'entry',
          physical: false,
          properties: [
            {
              text: 'Then non physical service is',
              type: 'text',
              type_options: 'dropdown',
              selects: [
                {label: 'Entry in Database', value: 'Entry in database'},
                {label: 'Entry in Logs', value: 'Entry in logs'},
                {label: 'Data from Web Service', value: 'Data from web service'}

              ]
            }
          ],
          children: []
        }
      ]
    }
  ]
};
