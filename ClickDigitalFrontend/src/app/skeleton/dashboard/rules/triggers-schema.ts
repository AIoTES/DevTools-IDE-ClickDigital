import { weekdays } from '../../../models/frontend/rule_module/weekdays';

export const TriggersFilterSchema: any = {
  children: [
    {
      id:1,
      name: 'Entity Situation',
      triggerClass: 'Entitysituation',
      icon: 'universal-access',
      children: [
        {
          name: 'All Devices',
          children: []
        },
        {
          name: 'Light',
          living: false,
          condition_attribute: 'state',
          itemtype: 'Light',
          triggerClass: 'Entitysituation',
          properties: [
            {
              text: 'When light  brightness is (%)',
              type: 'number',
              type_options: 'slider',
              min: 0,
              max: 100
            },
            {
              text: 'When light is',
              type: 'text',
              type_options: 'inputSwitch'
            }
          ],
          children: []
        },
        {
          name: 'Temperature',
          children: [
            {
              name: 'Heater',
              condition_attribute: 'temperature',
              living: true,
              properties: [
                {
                  text: 'When temperature is less than (°C)',
                  type: 'number',
                  operator: '<',
                  type_options: 'slider',
                  min: 0,
                  max: 100
                },
                {
                  text: 'When temperature is more than (°C)',
                  type: 'number',
                  operator: '>',
                  type_options: 'slider',
                  min: 0,
                  max: 100
                },
                {
                  text: 'When temperature is equal to (°C)',
                  type: 'number',
                  operator: '=',
                  type_options: 'slider',
                  min: 0,
                  max: 100
                }
              ],
              children: []
            }
          ]
        }
      ]
    },
    {
      id:2,
      name: 'Temporal',
      triggerClass: 'Temporal',
      icon: 'clock-o',
      children: [
        {
          name: 'Calendar',
          condition_attribute: 'time',
          properties: [
            {
              text: 'In this calendar date',
              type: 'text',
              type_options: 'calendar'
            }
          ],
          children: []
        },
        {
          name: 'Days of Week',
          condition_attribute: 'days',
          properties: [
            {
              text: 'Repeat every week',
              type: 'text',
              type_options: 'multiselect',
              selects: weekdays
            },
            {
              text: 'Only current week',
              type: 'text',
              type_options: 'multiselect',
              selects: weekdays
            }
          ],
          children: []
        },
        {
          name: 'Time',
          condition_attribute: 'time',
          properties: [
            {
              text: 'Everyday this time',
              type: 'text',
              type_options: 'time'
            },
            {
              text: 'Only once',
              type: 'text',
              type_options: 'time'
            }
          ],
          children: []
        }
      ]
    },
    {
      id:3,
      name: 'Spatial',
      triggerClass: 'Spatial',
      icon: 'map-marker',
      condition_attribute: 'location',
      properties: [
        {
          text: 'When device location is',
          type: 'text',
          type_options: 'dropdown',
          selects: [
            {label: 'Fixed', value: 'Fixed'},
            {label: 'Moving', value: 'Moving'}
          ]
        }
      ],
      children: []
    },
    {
      id:4,
      name: 'Situation',
      triggerClass: 'Situation',
      icon: 'automobile',
      children: [
        {
          name: 'Weather',
          condition_attribute: 'weather',
          properties: [
            {
              text: 'When weather temperature is less than',
              type: 'number',
              operator: '<',
              type_options: 'slider',
              min: 0,
              max: 100
            },
            {
              text: 'When weather temperature is more than',
              type: 'number',
              operator: '>',
              type_options: 'slider',
              min: 0,
              max: 100
            },
            {
              text: 'When weather temperature is equal to',
              type: 'number',
              operator: '=',
              type_options: 'slider',
              min: 0,
              max: 100
            }
          ],
          children: []
        },
        {
          name: 'Traffic Situation',
          condition_attribute: 'trafficsituation',
          properties: [
            {
              text: 'When traffic situation is',
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
        },
        {
          name: 'Movement',
          condition_attribute: 'state',
          living: false,
          itemtype: 'Movement',
          properties: [
            {
              text: 'When movement is detected',
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
              text: 'When device is located',
              type: 'text',
              type_options: 'dropdown',
              selects: [
                {label: 'Inside', value: 'inside'},
                {label: 'Outside', value: 'outside'}
              ]
            }
          ],
          children: []
        }
      ]
    },
    {
      id: 5,
      name: 'Communication',
      triggerClass: 'Communication',
      icon: 'wechat',
      children: [
        {
          name: 'E-Mail',
          condition_attribute: 'email',
          properties: [
            {
              text: 'When E-Mail is received from',
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
              text: 'When telephone communication is with',
              type: 'number',
              type_options: 'input'
            }
          ],
          children: []
        }
      ]
    },
    {
      id: 6,
      name: 'Service',
      triggerClass: 'Service',
      icon: 'cloud',
      children: [
        {
          name: 'Non Physical service',
          condition_attribute: 'entry',
          physical: false,
          properties: [
            {
              text: 'When non physical service is',
              type: 'string',
              type_options: 'dropdown',
              selects: [
                {label: 'Entry in Database', value: 'Entry in Database'},
                {label: 'Entry in Logs', value: 'Entry in Logs'},
                {label: 'Data from Web Service', value: 'Data from Web Service'}

              ]
            }
          ],
          children: []
        }
      ]
    }
  ]
};
