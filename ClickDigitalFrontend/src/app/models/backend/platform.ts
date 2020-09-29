/**
 * @ author Chinaedu Onwukwe
 * This class represents a platform in the view of the backend
 */

export class Platform {
  public name: string;
  public ip: string;
  public port: string;
  public username: string;
  public password: string;
  public platformId: string;
  public userId: string;
  public projectId: string;
  public externalPlatformId: string;


  constructor(name: string, ip: string, port: string, username: string, password: string, platformId: string, userId: string, projectId: string, externalPlatformId: string) {
    this.name = name;
    this.ip = ip;
    this.port = port;
    this.username = username;
    this.password = password;
    this.platformId = platformId;
    this.userId = userId;
    this.projectId = projectId;
    this.externalPlatformId = externalPlatformId;
  }
}
