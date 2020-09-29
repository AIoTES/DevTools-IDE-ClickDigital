export class DeviceEntity {
  deviceId: string='';
  entityId: string='';

  constructor(deviceId: string, entityId: string) {
    this.entityId = entityId;
    this.deviceId = deviceId;
  }
}
