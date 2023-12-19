export default class Nomad {
  constructor(endpoint, token, namespace) {
    this.endpoint = endpoint;
    this.token = token;
    this.namespace = namespace || "*";
  }

  async listServices() {
    const jobs = await this.listJobs();
    const services = await Promise.all(jobs.map(async (job) => {
      const s = await this.listJobServices(job.ID);
      return s;
    }));

    return services.flat();
  }

  async listJobs() {
    return this.request(`${this.endpoint}/jobs?namespace=${this.namespace}`, {});
  }

  async listJobServices(jobName) {
    return this.request(`${this.endpoint}/job/${jobName}/services`, {});
  }

  async request(url, params) {
    try {
      const headers = this.token ? {
        Authorization: `Bearer ${this.token}`,
      } : {};

      const config = params || {};
      config.headers = Object.assign((params.headers || {}), headers);

      return fetch(url, config).then(response => response.json());
    } catch (error) {
      return( Promise.reject(error));
    }
  }
}
