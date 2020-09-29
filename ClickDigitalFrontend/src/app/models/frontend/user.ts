/**
 * This class represents a user
 */
export class User {
  id: string;
  role: string;
  /**
   * Ids of the user's {@link Project} (s)
   */
  projects: Array<string> = [];

  constructor(id: string, role: string, projectId: string) {
    this.id = id;
    this.role = role;
    this.projects.push(projectId);
  }

}
